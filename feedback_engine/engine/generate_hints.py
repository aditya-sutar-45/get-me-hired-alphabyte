from flask import json
from helpers.gemini import build_prompt, generate_gemini_response


def generate_hint(question: str, context: str):
    try:
        prompt = build_prompt(question, context)

        res = generate_gemini_response(query=prompt)

        if not res:
            return None

        print(res)

        parsed = json.loads(res)
        return parsed
    except Exception as e:
        print(f"FAILED TO GENERATE: {e}")
        return ""
