# Get-Me-Hired

A unified platform with adaptive voice-based AI interviews, real-time performance analytics, integrated coding assessments, and community knowledge sharing. Candidates receive quantifiable feedback on technical skills, communication, confidence, and behavioral patterns.

---

## The Problem

- Technical interviews demand rapid thinking, structured reasoning, and clear verbal  communication under  intense time pressure.
- However, Fresh graduates fail interviews not due to skill gaps, but due to:
  1. Poor confidence & communication
  2. Feedback is delayed, not real-time
  3. Practice is static and disconnected from real interview pressure
  4. Scattered preparation across multiple platforms

- The Hiring Crisis
Candidates: struggle with confidence & lack AI-powered interview preparation
Companies: face talent shortages, bias & inefficient hiring processes

- Why It Matters: 64% of companies use AI in hiring, but candidates lack AI-powered preparation. 45% fail interviews due to poor communication and confidence, not technical ability.
Students and underrepresented groups lack access to quality interview coaching

---

## Features

- Contextual RAG-Powered Conversations
- Interactive AI Avatar Interviewer
- Resume Upload
- Live Code Editor
- Code analysis
- AI-Driven Performance Feedback

## Tech Stack

1. Frontend: ReactJS, TailwindCSS
2. Backend: Go, Python (Flask)
3. Database: Postgres
4. Vector Store: PineCone

## Dependencies

1. Real Time Communication (Voice Agent): Livekit
2. AI Orchestration: Langchain
3. UI Framework: Daisy UI
4. Speech to Text/ Text to Speech: Deepgram

## Project setup

1. [Frontend setup](/frontend/README.md)
2. [Backend setup](/backend/README.md)
3. [LLM_Backend setup](/llm_backend/README.md)

---

## System Architecture

![RAG_pipeline_arch](diagrams/rag.jpeg)
![voice_agent_arch](diagrams/voice_agent.jpeg)
