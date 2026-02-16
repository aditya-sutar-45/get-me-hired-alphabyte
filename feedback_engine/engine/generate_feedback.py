from flask import json
from helpers.gemini import build_user_feedback_prompt, generate_gemini_response
from helpers.pinecone import similarity_search
from helpers.prompts import user_feedback_system_instructions


def user_feedback(question: str, user_answer: str):
    try:
        context = similarity_search(question)

        prompt = build_user_feedback_prompt(
            user_answer=user_answer, question=question, context=context
        )

        res = generate_gemini_response(
            query=prompt, system_instruction=user_feedback_system_instructions
        )

        if not res:
            return None

        parsed = json.loads(res)
        return parsed
    except Exception as e:
        print(f"FAILED TO GENERATE: {e}")
        return ""
