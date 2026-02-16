from google import genai
from google.genai import types


def build_hints_prompt(question, context) -> str:
    prompt = f"""
        Interview Question:
        {question}
        Context:
        {context}
    """

    return prompt


def build_user_feedback_prompt(user_answer, question, context) -> str:
    prompt = f"""Reference Context:
{context}

Question:
{question}

Candidate Answer:
{user_answer}
    """
    return prompt


def generate_gemini_response(query, system_instruction: str) -> str:
    try:
        client = genai.Client()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(system_instruction=system_instruction),
            contents=query,
        )

        if response.text is None:
            print("ERROR: response.text not found")
            return ""

        return response.text

    except Exception as e:
        print(f"ERROR generating Gemini response: {e}")
        return ""
