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
import asyncio



load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")


async def entrypoint(ctx: JobContext):
    logger.info(f"Starting AI Interview Agent in room: {ctx.room.name}")

    await ctx.connect()
    logger.info(f"Connected to room: {ctx.room.name}")

    participant = await ctx.wait_for_participant()

    # Parse metadata
    job_metadata = {}
    resume = ""
    enable_avatar = True  # Default to True
    
    if participant.metadata:
        try:
            metadata = json.loads(participant.metadata)
            job_metadata = metadata.get("jobData", {})
            resume = metadata.get("resumeData", "")
            enable_avatar = metadata.get("enableAvatar", True)  # Get from metadata
            
            logger.info(f"✅ Loaded metadata successfully")
            logger.info(f"   Enable Avatar: {enable_avatar}")
            logger.info(f"   Job: {job_metadata.get('title', 'Unknown')}")
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse participant metadata: {e}")
            enable_avatar = True  # Default if parsing fails

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

    # CONDITIONALLY start avatar based on metadata
    avatar_session = None
    
    if enable_avatar:
        try:
            bey_api_key = os.getenv("BEY_API_KEY")
            bey_avatar_id = os.getenv("BEY_AVATAR_ID")

            logger.info(f"🎬 Initializing Beyond Presence avatar")
            logger.info(f"   Avatar ID: {bey_avatar_id}")

            # Create Beyond Presence Avatar Session
            avatar_session = bey.AvatarSession(
                api_key=bey_api_key,
                avatar_id=bey_avatar_id,
                avatar_participant_name="AI-Interviewer-Avatar", 
            )

            # Start the avatar first
            await avatar_session.start(session, room=ctx.room)
            logger.info("✅ Beyond Presence avatar started and joined the room")


            # try:
            #     logger.info("⏳ Starting avatar with 25s timeout...")

            #     await asyncio.wait_for(
            #         avatar_session.start(session, room=ctx.room),
            #         timeout=5   # seconds
            #     )

            #     logger.info("✅ Beyond Presence avatar started and joined the room")

            # except asyncio.TimeoutError:
            #     logger.error("❌ Avatar start TIMEOUT (25s exceeded)")
            #     logger.error("   Continuing without avatar...")
            #     avatar_session = None
            #     enable_avatar = False

            # except Exception as e:
            #     logger.error(f"❌ Failed to start avatar: {e}")
            #     logger.error("   Continuing without avatar...")
            #     avatar_session = None
            #     enable_avatar = False

            
        except Exception as e:
            logger.error(f"❌ Failed to start avatar: {e}")
            logger.error(f"   Continuing without avatar...")
            avatar_session = None
            enable_avatar = False
    else:
        logger.info("⏭️  Skipping avatar initialization (disabled by user)")

    # Start agent session
    # Disable audio OUTPUT if avatar is handling it
    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            text_enabled=True,
            audio_enabled=True,  # Always listen to user
        ),
        room_output_options=RoomOutputOptions(
            # Only disable audio if avatar is successfully running
            audio_enabled=(not enable_avatar or avatar_session is None),
        ),
    )
    
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