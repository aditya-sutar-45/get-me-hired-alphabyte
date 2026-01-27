# Backend Setup Guide

This README explains how to set up and run the backend locally.

## Create .env file in this llm_backend folder

### Visit livekit website signIn/logIn and add this keys

```
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

### Visit Deepgram  signIn/logIn and add API key

```
DEEPGRAM_API_KEY=
```

### Add google gemini API key

```
GOOGLE_API_KEY =
```

### Visit beyond presence website and add API keys

```
BEY_API_KEY=
BEY_AVATAR_ID=694c83e2-8895-4a98-bd16-56332ca3f449
```

## Create another .env file in llm folder

### Add google API key here

```
GOOGLE_API_KEY=
```

### Add Pinecone API keys and index name here

```
INDEX_NAME=
PINECONE_API_KEY=
```

## Create Virtual Environment

```
python -m venv venv
venv/scripts/activate.ps1
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Token Server

```bash
python token_server.py
```

Keep this terminal running.

## Run Voice Agent (Development Mode)

Open a new terminal, activate the virtual environment again, then run:

```bash
python voice_agent.py dev
```

