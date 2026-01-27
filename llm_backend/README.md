# LLM


# Backend Setup Guide

This README explains how to set up and run the backend locally.

1. Create Virtual Environment

Create a virtual environment named venv:

python -m venv venv


2. Activate Virtual Environment (Windows – PowerShell)

Activate the virtual environment using:

venv/scripts/activate.ps1


3. Install Dependencies

Install all required packages:

pip install -r requirements.txt


4. Run Token Server

Start the token server:

python token_server.py

Keep this terminal running.


5. Run Voice Agent (Development Mode)

Open a new terminal, activate the virtual environment again, then run:

python voice_agent.py dev