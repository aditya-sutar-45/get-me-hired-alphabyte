import os
from typing import Annotated, List, TypedDict, cast
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from langgraph.store.base import Result
from pinecone import Pinecone
from langgraph.graph import START, StateGraph
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage
from llm.prompts import interview_prompt

load_dotenv()

llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
embeddings = OllamaEmbeddings(model="mxbai-embed-large")
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index(os.environ["INDEX_NAME"])
vector_store = PineconeVectorStore(embedding=embeddings, index=index)


class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: List[Document]
    resume: str
    languages: List[str]
    company_name: str
    job_title: str
    job_description: str
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
    query = " ".join(
        str(msg.content) for msg in messages if isinstance(msg, HumanMessage)
    ).strip()

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


def generate(
    state: State,
    languages: List[str] | None,
    company_name: str | None,
    job_title: str | None,
    job_description: str | None,
    resume: str | None,
):
    """Generate interview response based on context and conversation history"""
    messages = state.get("messages", [])
    context_docs = state.get("context", [])

    if not messages:
        return {
            "messages": [AIMessage(content="Hello! I'm ready to start the interview.")]
        }

    # Format context from retrieved documents
    if context_docs:
        docs_content = "\n\n".join(doc.page_content for doc in context_docs)
    else:
        docs_content = (
            "No specific questions retrieved. Use your general interview knowledge."
        )

    languages_str = ", ".join(cast(List[str], languages))

    # Create the system message with context
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
"""
    )

    # build the full message history: system message + all conversation history
    messages_for_llm = [system_message] + messages

    response = llm.invoke(messages_for_llm)
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
        if languages:
            state["languages"] = languages
        if company_name:
            state["company_name"] = company_name
        if job_title:
            state["job_title"] = job_title
        if job_description:
            state["job_description"] = job_description
        if resume:
            state["resume"] = resume
        return generate(
            state=state,
            languages=languages,
            company_name=company_name,
            job_title=job_title,
            job_description=job_description,
            resume=resume,
        )

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
    graph = create_workflow(languages=["go"])

    # Initialize state
    state: State = {
        "messages": [],
        "context": [],
        "languages": ["go"],
        "company_name": "test company",
        "job_title": "test_job_title",
        "job_description": "test_job_description",
        "resume": "test_resume",
        "custom_interview": False,
        "namespace": None,
    }

    while True:
        user_input = input()
        if user_input == "/q":
            break

        state["messages"].append(HumanMessage(content=user_input))
        response = graph.invoke(state)
        # type casting this so my LSP does not cry ffs
        new_message = response["messages"][-1]

        state["messages"].append(new_message)
        state["context"] = response.get("context", state["context"])

        print("Candice: ", state["messages"][-1].content)
        print("\n\n")

    print("\n" + "=" * 50)
    print(f"\nTotal messages in history: {len(state['messages'])}")
