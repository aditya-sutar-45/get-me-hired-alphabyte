# LLM


# Backend Setup Guide

This README explains how to set up and run the backend locally.

1. Create .env file in this llm_backend folder 

# Visit livekit website signIn/logIn and add this keys 
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# Visit Deepgram  signIn/logIn and add API key 
DEEPGRAM_API_KEY=

# Add google gemini API key 
GOOGLE_API_KEY = 

# Visit beyond presence website and add API keys
BEY_API_KEY=
BEY_AVATAR_ID=694c83e2-8895-4a98-bd16-56332ca3f449 


2. Create another .env file in llm folder 

# Add google API key here also
GOOGLE_API_KEY=

# Add pinecone API keys and index name here
INDEX_NAME=
PINECONE_API_KEY=


2. Create Virtual Environment

Create a virtual environment named venv:

python -m venv venv


3. Activate Virtual Environment (Windows – PowerShell)

Activate the virtual environment using:

venv/scripts/activate.ps1


4. Install Dependencies

Install all required packages:

pip install -r requirements.txt


5. Run Token Server

Start the token server:

python token_server.py

Keep this terminal running.


6. Run Voice Agent (Development Mode)

Open a new terminal, activate the virtual environment again, then run:

python voice_agent.py dev