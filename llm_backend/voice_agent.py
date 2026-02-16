import json
import logging
import os
from dotenv import load_dotenv
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,
    RoomInputOptions,
    RoomOutputOptions,
)
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins import (
    deepgram,
    silero,
    langchain as lk_langchain,
    bey,
)
from llm.livekit_llm import create_workflow
from llm.context_store import context_store
import asyncio
import aiohttp

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")


async def send_to_hint_api(question: str, context: str, room):
    """Send question and context to the hint generation API and forward hints to frontend"""
    url = "http://localhost:6969/generate_hint"
    payload = {"question": question, "context": context}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url, json=payload, timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Hint API response: {result}")

                    message = {"type": "hint_response", "data": result}
                    await room.local_participant.publish_data(
                        json.dumps(message).encode("utf-8"), reliable=True
                    )

                    logger.info("📡 Hints sent to frontend via data channel")
                    return result
                else:
                    logger.error(f"❌ Hint API error: {response.status}")
                    return None

    except asyncio.TimeoutError:
        logger.error("❌ Hint API request timeout")
        return None
    except Exception as e:
        logger.error(f"❌ Hint API request failed: {e}")
        return None


async def send_user_feedback_to_api(question: str, user_answer: str, room):
    """Send question and user answer to the feedback API and forward response to frontend"""
    url = "http://localhost:6969/user_feedback"
    payload = {"question": question, "user_answer": user_answer}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url, json=payload, timeout=aiohttp.ClientTimeout(total=15)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ User Feedback API response: {result}")
                    
                    # Log the detailed feedback
                    logger.info(f"   📊 Logical Score: {result.get('logical_score')}")
                    logger.info(f"   🎯 Confidence: {result.get('confidence')}")
                    logger.info(f"   ✓ Logical Correctness: {result.get('logical_correctness')}")

                    message = {"type": "user_feedback_response", "data": result}
                    await room.local_participant.publish_data(
                        json.dumps(message).encode("utf-8"), reliable=True
                    )

                    logger.info("📡 User feedback sent to frontend via data channel")
                    return result
                else:
                    logger.error(f"❌ User Feedback API error: {response.status}")
                    return None

    except asyncio.TimeoutError:
        logger.error("❌ User Feedback API request timeout")
        return None
    except Exception as e:
        logger.error(f"❌ User Feedback API request failed: {e}")
        return None


# Store for tracking questions and answers
class AnswerStore:
    def __init__(self):
        self.current_question = None
        self.pending_answer = None
        self.last_processed_pair = None

answer_store = AnswerStore()


async def print_context_after_question(room):
    """Monitor for new questions and send them to hint API"""
    last_printed_question = None
    last_sent_pair = None

    while True:
        try:
            question = context_store.last_question
            context = context_store.last_context

            if not question or not context:
                await asyncio.sleep(0.25)
                continue

            normalized_q = question.strip()
            normalized_c = context.strip()
            current_pair = (normalized_q, normalized_c)

            if normalized_q == last_printed_question:
                await asyncio.sleep(0.25)
                continue

            await asyncio.sleep(0.4)

            if (
                context_store.last_question
                and context_store.last_question.strip() == normalized_q
            ):
                last_printed_question = normalized_q
                
                # Update answer store with current question
                answer_store.current_question = normalized_q

                logger.info("\n" + "=" * 60)
                logger.info("🟢 NEW INTERVIEW QUESTION GENERATED")
                logger.info("=" * 60)
                logger.info(f"\n❓ QUESTION:\n{normalized_q}\n")
                logger.info(f"🧠 CONTEXT USED:\n{normalized_c}\n")

                if current_pair != last_sent_pair:
                    logger.info("📤 Sending to hint generation API...")
                    await send_to_hint_api(normalized_q, normalized_c, room)
                    last_sent_pair = current_pair
                else:
                    logger.info("⏭️  Skipping API call (duplicate pair)")

                logger.info("=" * 60 + "\n")

        except Exception as e:
            logger.error(f"Print pair error: {e}")

        await asyncio.sleep(0.25)


async def handle_user_transcript(text: str, room):
    """
    Process user transcript and send to feedback API
    This should be called whenever we receive a complete user utterance
    """
    if not text or not text.strip():
        return
        
    text = text.strip()
    
    # Only process if we have a current question
    if not answer_store.current_question:
        logger.warning("⚠️  Received user answer but no current question set")
        return
    
    question = answer_store.current_question
    current_pair = (question, text)
    
    # Avoid processing the same answer twice
    if current_pair == answer_store.last_processed_pair:
        logger.info("⏭️  Skipping duplicate answer")
        return
    
    logger.info("\n" + "=" * 60)
    logger.info("💬 USER ANSWER RECEIVED")
    logger.info("=" * 60)
    logger.info(f"\n❓ Question: {question}")
    logger.info(f"💭 User Answer: {text}\n")
    
    # Send to feedback API
    logger.info("📤 Sending to user feedback API...")
    result = await send_user_feedback_to_api(question, text, room)
    
    if result:
        answer_store.last_processed_pair = current_pair
        logger.info("✅ Feedback processed successfully")
    
    logger.info("=" * 60 + "\n")


async def setup_transcript_listener(room):
    """
    Listen for user transcripts from the room's data channel or events.
    This is a placeholder - you'll need to integrate with your actual LiveKit session events.
    """
    
    # Option 1: Listen to room events for user speech
    @room.on("data_received")
    def on_data_received(data_packet):
        try:
            message = json.loads(data_packet.data.decode('utf-8'))
            
            # Check if this is a user transcript message
            if message.get("type") == "user_transcript":
                transcript = message.get("text", "")
                asyncio.create_task(handle_user_transcript(transcript, room))
                
        except Exception as e:
            logger.error(f"Error processing data packet: {e}")
    
    logger.info("✅ Transcript listener set up")


async def entrypoint(ctx: JobContext):
    logger.info(f"Starting AI Interview Agent in room: {ctx.room.name}")

    await ctx.connect()
    logger.info(f"Connected to room: {ctx.room.name}")

    participant = await ctx.wait_for_participant()

    # Parse metadata
    job_metadata = {}
    resume = ""
    enable_avatar = True

    if participant.metadata:
        try:
            metadata = json.loads(participant.metadata)
            job_metadata = metadata.get("jobData", {})
            resume = metadata.get("resumeData", "")
            enable_avatar = metadata.get("enableAvatar", True)

            logger.info(f"✅ Loaded metadata successfully")
            logger.info(f"   Enable Avatar: {enable_avatar}")
            logger.info(f"   Job: {job_metadata.get('title', 'Unknown')}")
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse participant metadata: {e}")
            enable_avatar = True

    company_name = job_metadata.get("companyName", "Unknown Company")
    job_title = job_metadata.get("title", "Software Developer")
    job_description = job_metadata.get("description", "General technical position")
    languages = job_metadata.get("languages", ["JavaScript", "Python"])
    custom_interview = job_metadata.get("custom_interview", False)
    namespace = job_metadata.get("namespace", None)

    logger.info(f"Interview for: {company_name} - {job_title}")
    logger.info(f"Required languages: {', '.join(languages)}")

    # Create Agent
    agent = Agent(
        instructions=f"""
        You are an AI interview assistant conducting an interview for {company_name}.
        
        Below is the candidate's Resume (in Markdown format):
        {resume}
        
        Position: {job_title}
        Job Description: {job_description}
        Required Programming Languages: {", ".join(languages)}
        
        Your role is to:
        1. Conduct a professional technical interview specifically for the {job_title} position
        2. Ask relevant questions based on the job requirements
        3. Focus your technical questions on {", ".join(languages)} programming skills
        4. Evaluate the candidate's experience with the technologies mentioned in the job description
        5. Listen carefully and provide thoughtful follow-up questions
        6. Probe deeper when necessary to assess true understanding
        7. Maintain a friendly but professional tone throughout
        8. Keep the conversation natural and engaging
        9. Ask about specific projects or experiences related to {", ".join(languages)}
        10. Respond naturally to both voice and text messages from the candidate
        11. If you need time to formulate a response, briefly acknowledge with "Let me think about that..."
        
        When the candidate sends a text message, respond conversationally as you would to voice input.
        Start by welcoming the candidate and asking them to introduce themselves.
        Then proceed with questions relevant to the {job_title} role.
        """,
    )

    # Create Agent Session
    session = AgentSession(
        vad=silero.VAD.load(
            min_speech_duration=0.5,
            min_silence_duration=0.8,
            prefix_padding_duration=0.2,
            activation_threshold=0.65,
        ),
        stt=deepgram.STT(
            model="nova-2",
            language="en-IN",
            interim_results=True,
        ),
        llm=lk_langchain.LLMAdapter(
            graph=create_workflow(
                languages=languages,
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
                resume=resume,
                custom_interview=custom_interview,
                namespace=namespace,
            ),
        ),
        tts=deepgram.TTS(
            model="aura-asteria-en",
            encoding="linear16",
            sample_rate=24000,
        ),
        preemptive_generation=True,
        allow_interruptions=True,
        min_interruption_duration=1.0,
        min_interruption_words=2,
        resume_false_interruption=True,
        false_interruption_timeout=1.5,
        min_endpointing_delay=0.8,
        max_endpointing_delay=6.0,
        discard_audio_if_uninterruptible=True,
        user_away_timeout=15.0,
        max_tool_steps=3,
    )
    
    # 🔥 HOOK INTO SESSION EVENTS TO CAPTURE USER SPEECH
    # This captures the user's complete utterances
    @session.on("user_speech_committed")
    def on_user_speech(message):
        """Called when user finishes speaking and transcript is finalized"""
        try:
            # Extract text from the message
            # The exact structure depends on your LiveKit/Deepgram setup
            text = None
            
            if hasattr(message, 'alternatives') and message.alternatives:
                text = message.alternatives[0].text
            elif hasattr(message, 'text'):
                text = message.text
            elif isinstance(message, str):
                text = message
                
            if text:
                logger.info(f"🎤 User speech: {text}")
                # Use asyncio.create_task to run the async function
                asyncio.create_task(handle_user_transcript(text, ctx.room))
                
        except Exception as e:
            logger.error(f"Error in user_speech_committed handler: {e}")

    # CONDITIONALLY start avatar based on metadata
    avatar_session = None

    if enable_avatar:
        try:
            bey_api_key = os.getenv("BEY_API_KEY")
            bey_avatar_id = os.getenv("BEY_AVATAR_ID")

            logger.info(f"🎬 Initializing Beyond Presence avatar")
            logger.info(f"   Avatar ID: {bey_avatar_id}")

            avatar_session = bey.AvatarSession(
                api_key=bey_api_key,
                avatar_id=bey_avatar_id,
                avatar_participant_name="AI-Interviewer-Avatar",
            )

            await avatar_session.start(session, room=ctx.room)
            logger.info("✅ Beyond Presence avatar started and joined the room")

        except Exception as e:
            logger.error(f"❌ Failed to start avatar: {e}")
            logger.error(f"   Continuing without avatar...")
            avatar_session = None
            enable_avatar = False
    else:
        logger.info("⏭️  Skipping avatar initialization (disabled by user)")

    # Start agent session
    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            text_enabled=True,
            audio_enabled=True,
        ),
        room_output_options=RoomOutputOptions(
            audio_enabled=(not enable_avatar or avatar_session is None),
        ),
    )

    # Start monitoring tasks
    asyncio.create_task(print_context_after_question(ctx.room))
    asyncio.create_task(setup_transcript_listener(ctx.room))

    logger.info(f"✅ AI Interview Agent started successfully")
    logger.info(f"   Avatar active: {avatar_session is not None}")
    logger.info(f"   Audio output: {not enable_avatar or avatar_session is None}")

    # Initial greeting
    greeting = (
        f"Welcome to your interview for the {job_title} role at {company_name}. "
        f"I've gone through your resume and noticed your background in {', '.join(languages[:2])}. "
        f"Let's start with a quick introduction — could you tell me a bit about yourself and your professional journey?"
    )

    await session.say(greeting, allow_interruptions=True)
    logger.info("✅ Initial greeting sent")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            num_idle_processes=1,
        )
    )