import logging
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import deepgram, google, elevenlabs, silero

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")


class VoiceAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are a voice assistant for interview created by LiveKit. Your interface with users will be voice. "
                "You should use short and concise responses, and avoid using unpronounceable punctuation."
            )
        )


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice agent"""
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(
            model="nova-2",
            language="en-US",
        ),
        llm=google.LLM(
            model="gemini-2.0-flash-exp",
            temperature=0.8,
        ),
        tts=elevenlabs.TTS(
            model="eleven_multilingual_v2",
            voice_id="EXAVITQu4vr4xnSDxMaL",
        ),
    )

    # Start the session
    await session.start(agent=VoiceAssistant(), room=ctx.room)

    # Generate initial greeting
    await session.generate_reply(
        instructions="Greet the user and ask how you can help them today."
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        ),
    )
