import os
from typing import Annotated, List, TypedDict, cast
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langgraph.graph import START, StateGraph
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage
from llm.prompts import interview_prompt

load_dotenv()

# llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
# idk
llm = ChatOllama(
    model=os.environ["OLLAMA_MODEL_NAME"],
    temperature=0.1,
)
embeddings = OllamaEmbeddings(model="mxbai-embed-large")
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index(os.environ["INDEX_NAME"])
vector_store = PineconeVectorStore(embedding=embeddings, index=index)


class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: List[Document]
    languages: List[str]
    custom_interview: bool
    namespace: str | None


def retrieve(
    state: State,
    languages: List[str] | None,
    custom_interview: bool | None,
    namespace: str | None,
):
    """Retrieve relevant documents based on the last user message"""
    messages = state.get("messages", [])
    if not messages:
        return {"context": []}

    # some python magic code one line job done clown moment
    query = cast(str, messages[-1].content).strip()

    if not query:
        return {"context": []}

    language_filter = {}
    if languages:
        language_filter["language"] = {"$in": languages}
    if custom_interview:
        language_filter = {}
    if not custom_interview:
        namespace = None

    retrieved_docs = vector_store.similarity_search(
        query=query, k=3, filter=language_filter, namespace=namespace
    )
    return {"context": retrieved_docs}


def generate(state: State, system_message: SystemMessage):
    """Generate interview response based on context and conversation history"""
    messages = state.get("messages", [])

    if not messages:
        return {
            "messages": [AIMessage(content="Hello! I'm ready to start the interview.")]
        }

    MAX_HISTORY = 10
    MAX_STATE_MESSAGES = 50

    # build the full message history: system message + all conversation history

    messages_for_llm: List[BaseMessage] = [system_message, *messages[-MAX_HISTORY:]]
    response = llm.invoke(messages_for_llm)

    if len(state["messages"]) > MAX_STATE_MESSAGES:
        state["messages"] = state["messages"][-MAX_STATE_MESSAGES:]

    return {"messages": [AIMessage(content=response.content)]}


def create_workflow(
    languages: list[str] | None = None,
    company_name: str | None = None,
    job_title: str | None = None,
    job_description: str | None = None,
    resume: str | None = None,
    custom_interview: bool | None = None,
    namespace: str | None = None,
):
    """Create the LangGraph workflow for the interview agent"""

    def retrieve_with_languages(state: State):
        if languages:
            state["languages"] = languages
        if custom_interview:
            state["custom_interview"] = custom_interview
        if namespace:
            state["namespace"] = namespace
        return retrieve(state, languages, custom_interview, namespace)

    def generate_with_languages(state: State):
        MAX_DOC_CHAR = 1200
        context_docs = state.get("context", [])
        if context_docs:
            docs_content = "\n\n".join(
                doc.page_content[:MAX_DOC_CHAR] for doc in context_docs
            )
        else:
            docs_content = (
                "No specific questions retrieved. Use your general interview knowledge."
            )

        languages_str = ", ".join(cast(List[str], languages))

        job_info = f"""
You are **Candice**, an intelligent and professional AI interviewer representing **{company_name}**.

Below is the candidate's Resume (in Markdown format):
{resume}

You are conducting an interview for the position of **{job_title}**.

Below is the official job description:
{job_description}

The interview focuses on the following languages and technologies:
{languages_str}

You have access to the following relevant context from the company's internal knowledge base:
{docs_content}
        """
        system_message = SystemMessage(
            content=f"""
{job_info}

Use the following interviewer behavior and logic rules:
{interview_prompt}

Remember:
- Do **not** restate the job description or context in your questions.
- Always ask one concise, context-aware question at a time.
- Base your questions on the job requirements, languages, and the candidate’s last response.

Never generate dialogue for the candidate.
Only produce the interviewer’s next question.
Never prefix responses with your name.
"""
        )

        return generate(state=state, system_message=system_message)

    graph_builder = StateGraph(State)

    # Add nodes
    graph_builder.add_node("retrieve", retrieve_with_languages)
    graph_builder.add_node("generate", generate_with_languages)

    # Add edges
    graph_builder.add_edge(START, "retrieve")
    graph_builder.add_edge("retrieve", "generate")

    graph = graph_builder.compile()
    return graph


# i hope ts works bruh
if __name__ == "__main__":
    graph = create_workflow(
        languages=["go", "postgres", "docker"],
        company_name="StreamForge",
        job_title="Backend Engineer (Go)",
        job_description="""
We are looking for a Backend Engineer proficient in Go.
You will design REST APIs, work with PostgreSQL,
build scalable microservices, and deploy using Docker.
Experience with concurrency, context package,
and performance optimization is required.
        """,
        resume="""
# Aditya Sutar

## Skills
- Go (goroutines, channels, context package)
- Node.js, Express
- PostgreSQL, MongoDB
- Docker
- REST API design
- WebSockets

## Projects
### CodeStream
A real-time collaborative code editor built with React and Socket.IO.

### RhyemeSh*t
AI-powered lyrics-to-music generator with backend audio merging using FFmpeg.

## Experience
Built backend services handling real-time communication and database integration.
        """,
        custom_interview=False,
        namespace=None,
    )

    state: State = {
        "messages": [],
        "context": [],
        "languages": ["go"],
        "custom_interview": False,
        "namespace": None,
    }

    while True:
        user_input = input("You: ")
        if user_input == "/q":
            break

        state["messages"].append(HumanMessage(content=user_input))
        response = graph.invoke(state)

        new_message = response["messages"][-1]
        state["messages"].append(new_message)
        state["context"] = response.get("context", state["context"])

        print("Candice:", state["messages"][-1].content)
        print("\n")

    print("\n" + "=" * 50)
    print(f"\nTotal messages in history: {len(state['messages'])}")
