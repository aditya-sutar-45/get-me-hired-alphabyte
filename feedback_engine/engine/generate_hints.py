from flask import json
from helpers.gemini import build_hints_prompt, generate_gemini_response
from helpers.prompts import hints_system_instructions


def generate_hint(question: str, context: str):
    try:
        prompt = build_hints_prompt(question, context)

        res = generate_gemini_response(
            query=prompt, system_instruction=hints_system_instructions
        )

        if not res:
            return None

        parsed = json.loads(res)
        return parsed
    except Exception as e:
        print(f"FAILED TO GENERATE: {e}")
        return ""
