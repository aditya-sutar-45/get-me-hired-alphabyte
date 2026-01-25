import json
import os
import re
from dotenv import load_dotenv
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore

from google import genai
from google.genai import types

from llm.prompts import feedback_system_instructions

load_dotenv()


def generate_pairs(cleaned_transcript):
    qa_pairs = []
    current_question = None
    current_answer = None
    last_speaker = None

    for entry in cleaned_transcript:
        speaker = entry["speaker"].lower()
        text = entry["text"]

        # interviewer
        if "agent" in speaker:
            # if a new question starts and we have previous question+answer, store it
            if current_question and current_answer:
                qa_pairs.append(
                    {
                        "question": current_question.strip(),
                        "answer": current_answer.strip(),
                    }
                )
                current_question, current_answer = None, None

            # merge if interviewer keeps talking
            if last_speaker == "agent" and current_question:
                current_question += " " + text
            else:
                current_question = text
            last_speaker = "agent"

        # candidate
        elif "you" in speaker:
            # merge if candidate continues speaking
            if last_speaker == "you" and current_answer:
                current_answer += " " + text
            else:
                current_answer = text
            last_speaker = "you"

    # add last pair if valid
    if current_question and current_answer:
        qa_pairs.append(
            {"question": current_question.strip(), "answer": current_answer.strip()}
        )

    return qa_pairs


def retrieve_context(qa_pairs):
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    vector_store = PineconeVectorStore(
        index_name=os.environ["INDEX_NAME"], embedding=embeddings
    )

    context_qa_pairs = []
    for pair in qa_pairs:
        question = pair.get("question", "")
        retrieved_docs = []

        if question.strip():
            docs = vector_store.similarity_search(query=question, k=2)
            retrieved_docs = [d.page_content for d in docs]

        context_qa_pairs.append({**pair, "retrieved_docs": retrieved_docs})

    return context_qa_pairs


def get_feedback(context_qa_pairs):
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                temperature=0.2,
                system_instruction=feedback_system_instructions,
            ),
            contents=[
                {
                    "role": "user",
                    "parts": [{"text": json.dumps(context_qa_pairs, indent=2)}],
                }
            ],
        )
        text_output = getattr(response, "text", "").strip()
        if not text_output:
            return []

        cleaned_text = re.sub(
            r"^```(?:json)?|```$", "", text_output.strip(), flags=re.MULTILINE
        ).strip()

        try:
            parsed_output = json.loads(cleaned_text)
            return parsed_output
        except json.JSONDecodeError:
            print("model output is not valid json, returning raw text")
            return text_output

    except Exception as e:
        print("LLM parsing error: ", e)
        return ""
