from typing import Required
from annotated_types import IsInfinite
from flask import Flask, jsonify, request
from flask_cors import CORS
from livekit import api
import os
import time
import json
from dotenv import load_dotenv

from google import genai
import lizard
from pypdf.generic import TreeObject

from llm.feedback_chain import generate_pairs, get_feedback, retrieve_context
from llm.ingest_custom import fetch_default_docs, ingest_kb, search_kb
from parsing.resume import get_text_from_resume, parse_resume_from_text

import asyncio
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("avatar-control")

# Store active avatar sessions
active_avatar_sessions = {}

# @app.route("/create-room", methods=["POST"])
# def create_room_with_metadata():
#     """Generate token with job metadata in participant metadata"""
#     try:
#         data = request.json
#         participant_name = data.get("participant", "user")
#         job_data = data.get("jobData", {})
#         resume_data = data.get("resumeData", "")

#         # Create unique room name
#         room_name = f"interview-{participant_name}-{int(time.time())}"

#         print(f"Creating token for room: {room_name}")
#         print(f"Job data: {job_data}")
#         print(f"Resume: {resume_data}")

#         # Create access token with metadata
#         token = api.AccessToken(
#             api_key=os.getenv("LIVEKIT_API_KEY"),
#             api_secret=os.getenv("LIVEKIT_API_SECRET"),
#         )

#         metadata = {
#             "jobData": job_data,
#             "resumeData": resume_data,
#         }

#         # Add job data as participant metadata
#         token.with_identity(participant_name).with_name(participant_name).with_metadata(
#             json.dumps(metadata)
#         ).with_grants(
#             api.VideoGrants(
#                 room_join=True,
#                 room=room_name,
#                 can_publish=True,
#                 can_subscribe=True,
#             )
#         )

#         jwt_token = token.to_jwt()

#         print(f"Token generated successfully for room: {room_name}")

#         return jsonify(
#             {
#                 "token": jwt_token,
#                 "url": os.getenv("LIVEKIT_URL"),
#                 "room_name": room_name,
#             }
#         )

#     except Exception as e:
#         print(f"Error in create_room_with_metadata: {e}")
#         import traceback

#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


@app.route("/create-room", methods=["POST"])
def create_room_with_metadata():
    """Generate token with job metadata in participant metadata"""
    try:
        data = request.json
        participant_name = data.get("participant", "user")
        job_data = data.get("jobData", {})
        resume_data = data.get("resumeData", "")
        enable_avatar = data.get("enableAvatar", True)  # ← NEW: Default True for backward compatibility

        # Create unique room name
        room_name = f"interview-{participant_name}-{int(time.time())}"

        print(f"Creating token for room: {room_name}")
        print(f"Job data: {job_data}")
        print(f"Resume: {resume_data}")
        print(f"Avatar enabled: {enable_avatar}")  # ← NEW: Log avatar preference

        # Create access token with metadata
        token = api.AccessToken(
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )

        # ← MODIFIED: Include enableAvatar in metadata
        metadata = {
            "jobData": job_data,
            "resumeData": resume_data,
            "enableAvatar": enable_avatar,  # ← NEW: Pass avatar preference to agent
        }

        # Add job data as participant metadata
        token.with_identity(participant_name).with_name(participant_name).with_metadata(
            json.dumps(metadata)
        ).with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )
        )

        jwt_token = token.to_jwt()

        print(f"Token generated successfully for room: {room_name}")

        # ← MODIFIED: Include avatar_enabled in response
        return jsonify(
            {
                "token": jwt_token,
                "url": os.getenv("LIVEKIT_URL"),
                "room_name": room_name,
                "avatar_enabled": enable_avatar,  # ← NEW: Return avatar status
            }
        )

    except Exception as e:
        print(f"Error in create_room_with_metadata: {e}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/analyze", methods=["POST"])
def analyze_code():
    """Code analysis endpoint with Lizard + Gemini AI"""
    try:
        data = request.json
        code = data.get("code", "")
        language = data.get("language", "python")  # default to python

        # Determine file extension based on language
        file_extensions = {
            "python": ".py",
            "java": ".java",
            "javascript": ".js",
            "go": ".go",
        }
        file_ext = file_extensions.get(language.lower(), ".txt")
        filename = f"temp{file_ext}"

        # Analyze code complexity with Lizard
        analysis = lizard.analyze_file.analyze_source_code(filename, code)

        # Extract complexity metrics
        complexity_metrics = []
        for func in analysis.function_list:
            metrics = {
                "function_name": func.name,
                "cyclomatic_complexity": func.cyclomatic_complexity,
                "lines_of_code": func.nloc,
                "token_count": func.token_count,
                "parameter_count": func.parameter_count,
            }
            complexity_metrics.append(metrics)

        # If no functions detected, provide file-level metrics
        if not complexity_metrics:
            complexity_metrics = [
                {
                    "function_name": "N/A",
                    "cyclomatic_complexity": "No functions detected",
                    "lines_of_code": len(code.splitlines()),
                    "token_count": "N/A",
                    "parameter_count": "N/A",
                }
            ]

        # Format complexity data for Gemini prompt
        complexity_summary = "\n".join(
            [
                f"- Function: {m['function_name']}\n"
                f"  Cyclomatic Complexity: {m['cyclomatic_complexity']}\n"
                f"  Lines of Code: {m['lines_of_code']}\n"
                f"  Token Count: {m['token_count']}\n"
                f"  Parameters: {m['parameter_count']}"
                for m in complexity_metrics
            ]
        )

        prompt = f"""
As an expert code reviewer, analyze the following {language} code and provide a concise, point-wise summary with one overall rating at the top.

Code Complexity Metrics (from Lizard):
{complexity_summary}

Code to Review:
{code}

Please respond in the following HTML format:

<h1>Overall Rating (1-10): [rating]</h1>

<h2>Summary:</h2>
<p> [brief description of the code / algorithm] </p>
<ol>
<li><strong>Time Complexity:</strong> [brief analysis]</li>
<li><strong>Space Complexity:</strong> [brief analysis]</li>
<li><strong>Code Quality:</strong> [short notes on readability, maintainability, and best practices]</li>
<li><strong>Optimization Opportunities:</strong> [specific, actionable improvements; include concise before/after if relevant]</li>
<li><strong>Potential Bugs:</strong> [short, clear list of possible issues or edge cases]</li>
<li><strong>Cyclomatic Complexity:</strong> [interpretation of score and whether acceptable]</li>
</ol>

Instructions:
- Keep the response concise, structured, and directly answer the points above.
- Do not include explanations outside the specified fields.
- Use HTML tags exactly as shown for headings and list structure.
"""

        # Call Gemini API with enhanced prompt
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )

        return jsonify(
            {
                "status": "success",
                "complexity_metrics": complexity_metrics,
                "ai_analysis": response.text,
            }
        ), 200

    except Exception as e:
        print(f"Error in analyzing code: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/parse", methods=["POST"])
def parse_resume():
    try:
        data = request.get_json(silent=True)
        if not data or "resume_path" not in data:
            return jsonify({"error": "missing resume_path"}), 400

        path = data["resume_path"]

        text = get_text_from_resume(path=path)
        if not text:
            return jsonify({"error", "failed to extract text from resume"}), 500

        parsed_resume = parse_resume_from_text(text=text)
        if not parsed_resume:
            return jsonify({"error": "LLM parsing failed"}), 500

        return parsed_resume, 200, {"Content-Type:": "text/markdown; charset=uft-8"}
    except Exception as e:
        print(f"internal server error: {e}")
        return jsonify({"error": f"Internal server error\n {e}"}), 500


@app.route("/ingest_kb", methods=["POST"])
def ingest_knowledge_base():
    try:
        data = request.get_json()
        if not data or "kb_path" not in data:
            return jsonify({"error": "missing knowledge base"}), 400
        if not data or "job_id" not in data:
            return jsonify({"error": "missing knowledge base"}), 400

        path = data["kb_path"]
        job_id = data["job_id"]

        ingest_kb(path, job_id)

        return jsonify({"message": "success"}), 200
    except Exception as e:
        print(f"internal server error: {e}")
        return jsonify({"error": f"Internal server error\n {e}"}), 500


@app.route("/kb/<kb_id>", methods=["GET"])
def get_kb(kb_id):
    search = request.args.get("search")

    if search:
        return search_kb(kb_id, search)
    else:
        return fetch_default_docs(kb_id)


@app.route("/feedback", methods=["POST"])
def generate_feedback():
    data = request.get_json(silent=True)
    if not data or "transcript" not in data:
        return jsonify({"error": "missing transcript"}), 400

    transcript = data["transcript"]

    cleaned_transcript = [
        {
            "speaker": item.get("speaker", "Unknown"),
            "text": item.get("text", "").strip(),
        }
        for item in transcript
        if isinstance(item, dict)
    ]

    qa_pairs = generate_pairs(cleaned_transcript=cleaned_transcript)
    context_qa_pairs = retrieve_context(qa_pairs=qa_pairs)
    response = get_feedback(context_qa_pairs=context_qa_pairs)

    return jsonify({"len": len(qa_pairs), "feedback": response}), 200


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Backend is running"})


@app.route("/start-avatar", methods=["POST"])
def start_avatar():
    """
    Start avatar session for a room
    This endpoint signals the LiveKit agent to start the avatar
    """
    try:
        data = request.json
        room_name = data.get("room_name")
        
        if not room_name:
            return jsonify({"error": "room_name is required"}), 400
        
        if room_name not in active_avatar_sessions:
            return jsonify({"error": "Room not found"}), 404
        
        session_info = active_avatar_sessions[room_name]
        
        if session_info["enabled"] and session_info["session_id"]:
            return jsonify({
                "message": "Avatar already running",
                "session_id": session_info["session_id"]
            }), 200
        
        # Generate session ID
        import uuid
        session_id = f"avatar-{uuid.uuid4().hex[:12]}"
        
        # Update session info
        active_avatar_sessions[room_name]["enabled"] = True
        active_avatar_sessions[room_name]["session_id"] = session_id
        
        logger.info(f"Avatar session started: {session_id} for room: {room_name}")
        
        # Here you would signal the LiveKit agent to start the avatar
        # This could be done via:
        # 1. Publishing a data message to the room
        # 2. Using LiveKit API to send a signal
        # 3. Using a separate message queue/webhook
        
        # Example using LiveKit API to send data message:
        # (You'll need to implement this based on your agent architecture)
        try:
            # Send signal to agent to start avatar
            asyncio.run(signal_agent_start_avatar(room_name, session_id))
        except Exception as e:
            logger.warning(f"Could not signal agent: {e}")
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Avatar session started"
        }), 200
        
    except Exception as e:
        logger.error(f"Error starting avatar: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/stop-avatar", methods=["POST"])
def stop_avatar():
    """
    Stop avatar session for a room
    This completely shuts down the avatar to save tokens
    """
    try:
        data = request.json
        room_name = data.get("room_name")
        session_id = data.get("session_id")
        
        if not room_name:
            return jsonify({"error": "room_name is required"}), 400
        
        if room_name not in active_avatar_sessions:
            return jsonify({"error": "Room not found"}), 404
        
        session_info = active_avatar_sessions[room_name]
        
        if not session_info["enabled"]:
            return jsonify({"message": "Avatar already stopped"}), 200
        
        # Update session info
        active_avatar_sessions[room_name]["enabled"] = False
        active_avatar_sessions[room_name]["session_id"] = None
        
        logger.info(f"Avatar session stopped: {session_id} for room: {room_name}")
        
        # Signal the agent to stop avatar
        try:
            asyncio.run(signal_agent_stop_avatar(room_name, session_id))
        except Exception as e:
            logger.warning(f"Could not signal agent: {e}")
        
        return jsonify({
            "success": True,
            "message": "Avatar session stopped"
        }), 200
        
    except Exception as e:
        logger.error(f"Error stopping avatar: {e}")
        return jsonify({"error": str(e)}), 500


async def signal_agent_start_avatar(room_name: str, session_id: str):
    """
    Signal the LiveKit agent to start avatar session
    """
    # Implementation depends on your agent architecture
    # Option 1: Use LiveKit Data API to send message to agent
    # Option 2: Use a separate signaling mechanism (Redis, WebSocket, etc.)
    
    logger.info(f"Signaling agent to START avatar: {session_id} in room: {room_name}")
    
    # Example: You could publish a data message to the room
    # that your agent listens for
    try:
        from livekit import api
        
        lk_api = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )
        
        # Send data to room (agent should listen for this)
        await lk_api.room.send_data(
            api.SendDataRequest(
                room=room_name,
                data=json.dumps({
                    "type": "avatar_control",
                    "action": "start",
                    "session_id": session_id
                }).encode(),
                topic="avatar_control"
            )
        )
        
        logger.info("Avatar start signal sent successfully")
    except Exception as e:
        logger.error(f"Error sending avatar start signal: {e}")
        raise


async def signal_agent_stop_avatar(room_name: str, session_id: str):
    """
    Signal the LiveKit agent to stop avatar session
    """
    logger.info(f"Signaling agent to STOP avatar: {session_id} in room: {room_name}")
    
    try:
        from livekit import api
        
        lk_api = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )
        
        # Send data to room
        await lk_api.room.send_data(
            api.SendDataRequest(
                room=room_name,
                data=json.dumps({
                    "type": "avatar_control",
                    "action": "stop",
                    "session_id": session_id
                }).encode(),
                topic="avatar_control"
            )
        )
        
        logger.info("Avatar stop signal sent successfully")
    except Exception as e:
        logger.error(f"Error sending avatar stop signal: {e}")
        raise


@app.route("/avatar-status/<room_name>", methods=["GET"])
def get_avatar_status(room_name):
    """
    Get current avatar status for a room
    """
    try:
        if room_name not in active_avatar_sessions:
            return jsonify({"error": "Room not found"}), 404
        
        session_info = active_avatar_sessions[room_name]
        
        return jsonify({
            "room_name": room_name,
            "enabled": session_info["enabled"],
            "session_id": session_info["session_id"],
            "participant": session_info["participant"]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting avatar status: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Starting Flask server...")
    print(f"LiveKit URL: {os.getenv('LIVEKIT_URL')}")
    app.run(host="0.0.0.0", port=5000, debug=True)
