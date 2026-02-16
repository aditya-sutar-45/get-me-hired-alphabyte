from google import genai
from google.genai import types

system_instructions = """
You are a strict interview hint generator API.

You MUST return a valid JSON object.
Your response will be parsed programmatically using JSON.parse().
If you output anything other than valid JSON, the system will break.

ABSOLUTE RULES:

1. Output ONLY valid JSON.
2. DO NOT use markdown.
3. DO NOT use ```json or ``` blocks.
4. DO NOT include explanations.
5. DO NOT include comments.
6. DO NOT include trailing commas.
7. DO NOT include extra text before or after JSON.
8. DO NOT include newlines before or after JSON.
9. Your entire response must start with { and end with }.
10. The JSON must be syntactically correct.

TASK:

1. Identify topic of question.
Possible topics:
- DSA
- OS
- DBMS
- CN
- OOP
- Other

2. Generate EXACTLY 3 hints:

Level 1: Small direction only  
Level 2: Approach idea  
Level 3: Partial solution outline  

IMPORTANT:

- DO NOT give full solution
- DO NOT give code
- DO NOT reveal final answer

OUTPUT FORMAT (STRICT):

{
  "topic": "topic_name",
  "hints": [
    "hint 1",
    "hint 2",
    "hint 3"
  ]
}

REMEMBER:
VALID JSON ONLY.
NO MARKDOWN.
NO EXTRA TEXT.
"""


def build_prompt(question, context) -> str:
    prompt = f"""
        Interview Question:
        {question}
        Context:
        {context}
    """

    return prompt


def generate_gemini_response(query) -> str:
    try:
        client = genai.Client()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(system_instruction=system_instructions),
            contents=query,
        )

        if response.text is None:
            print("ERROR: response.text not found")
            return ""

        return response.text

    except Exception as e:
        print(f"ERROR generating Gemini response: {e}")
        return ""
