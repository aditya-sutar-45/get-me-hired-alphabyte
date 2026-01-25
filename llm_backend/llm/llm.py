import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import RunnableConfig, RunnablePassthrough
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from llm.prompts import interview_prompt, contextualize_q_system_prompt

load_dotenv()


def init_interview_chain():
    """returns a conversational interview chain that accepts languages dynamically"""
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    vector_store = PineconeVectorStore(
        index_name=os.environ["INDEX_NAME"], embedding=embeddings
    )

    # Store conversations AND language preferences per session
    store = {}
    language_store = {}

    def get_session_history(session_id: str):
        if session_id not in store:
            store[session_id] = ChatMessageHistory()
        return store[session_id]

    def get_dynamic_retriever(session_id: str):
        """Creates a retriever based on session's language preferences"""
        languages = language_store.get(session_id, None)
        search_filter = {}

        if languages:
            if isinstance(languages, str):
                search_filter = {"language": languages}
            elif isinstance(languages, list) and len(languages) > 0:
                if len(languages) == 1:
                    search_filter = {"language": languages[0]}
                else:
                    search_filter = {"language": {"$in": languages}}

        return vector_store.as_retriever(
            search_kwargs={
                "filter": search_filter if search_filter else None,
                "k": 3,
            }
        )

    # Contextualize question prompt
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", interview_prompt),
            MessagesPlaceholder("chat_history"),
            ("user", "{input}"),
        ]
    )

    # Create a wrapper chain that handles dynamic retrieval
    def interview_chain_with_dynamic_retrieval(input_dict, config):
        session_id = config.get("configurable", {}).get("session_id")

        # Update language preferences if provided
        if "languages" in input_dict:
            language_store[session_id] = input_dict["languages"]

        # Get the appropriate retriever for this session
        retriever = get_dynamic_retriever(session_id)

        # Create history-aware retriever
        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, contextualize_q_prompt
        )

        # Create the chains
        combine_docs_chain = create_stuff_documents_chain(llm, prompt)
        retrieval_chain = create_retrieval_chain(
            retriever=history_aware_retriever, combine_docs_chain=combine_docs_chain
        )

        # Get chat history
        chat_history = get_session_history(session_id)

        # Invoke the chain
        result = retrieval_chain.invoke(
            {
                "input": input_dict["input"],
                "chat_history": chat_history.messages,
            }
        )

        # Update chat history
        chat_history.add_user_message(input_dict["input"])
        chat_history.add_ai_message(result["answer"])

        return result

    return interview_chain_with_dynamic_retrieval


if __name__ == "__main__":
    # The function now returns just the chain function
    interview_chain = init_interview_chain()

    config = RunnableConfig(configurable={"session_id": "interview_001"})

    # Example: Java and JavaScript
    result = interview_chain(
        {
            "input": "lets get started",
            "languages": ["react"],
        },
        config=config,
    )
    print(f"\nCandice: {result['answer']}\n\n\n\n")

    # for context in result["context"]:
    #    print("question: ", context.page_content)
    #    print("lang: ", context.metadata["language"])
    #    print("\n")
