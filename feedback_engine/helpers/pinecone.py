import os
from dotenv import load_dotenv
from pinecone import Pinecone
import ollama

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("INDEX_NAME")

index = pc.Index(os.environ["INDEX_NAME"])


def get_embedding(text: str) -> list[float]:
    response = ollama.embeddings(model="mxbai-embed-large", prompt=text)
    return response["embedding"]


def similarity_search(query: str, top_k: int = 2, namespace: str | None = None):
    query_embedding = get_embedding(query)

    results = index.query(
        vector=query_embedding, top_k=top_k, include_metadata=True, namespace=namespace
    )

    return "\n\n".join(match["metadata"]["text"] for match in results.matches)
