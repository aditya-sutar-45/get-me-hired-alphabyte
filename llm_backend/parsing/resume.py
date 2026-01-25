import os
import json
from pypdf import PdfReader
from dotenv import load_dotenv
from google import genai
from google.genai import types

from llm.prompts import resume_system_instructions

load_dotenv()


def get_text_from_resume(path: str):
    if not os.path.exists(path):
        print(f"file not found: {path}")
        return ""

    try:
        reader = PdfReader(path)
        full_text = ""

        for i, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text()
                if text:
                    full_text += text
                else:
                    print(f"no text found on page {i}")
            except Exception as e:
                print(f"error reading the page {i}", {e})

        return full_text

    except Exception as e:
        print("error getting text from resume: ", e)
        return ""


def parse_resume_from_text(text: str) -> str:
    if not text.strip():
        print("empty text received!")
        return ""

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                temperature=0.1,
                system_instruction=resume_system_instructions,
            ),
            contents=text,
        )
        return response.text.strip() if getattr(response, "text", None) else ""

    except Exception as e:
        print("LLM parsing error: ", e)
        return ""


def main():
    text = get_text_from_resume(
        path="/home/adityasutar/projects/get_me_hired/voice_agent_backend/parsing/data/aditya_sutar_CV"
    )
    parsed_resume = parse_resume_from_text(text=text)

    print(json.dumps(parsed_resume, indent=2))


if __name__ == "__main__":
    main()
