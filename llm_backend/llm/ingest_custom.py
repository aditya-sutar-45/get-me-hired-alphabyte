import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_core import embeddings
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone

embeddings = OllamaEmbeddings(model="mxbai-embed-large")
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index(os.environ["INDEX_NAME"])


def ingest_kb(path: str, job_id: str):
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    loader = PyPDFLoader(path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=200)
    chunks = splitter.split_documents(documents=documents)

    PineconeVectorStore.from_documents(
        chunks,
        index_name=os.environ["INDEX_NAME"],
        embedding=embeddings,
        namespace=job_id,
    )

    print(f"ingested {len(chunks)} documents")


def fetch_default_docs(kb_id):
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    vector_store = PineconeVectorStore(
        embedding=embeddings, index=index, namespace=kb_id
    )
    dim = 1024
    v = [0.0] * dim
    docs = vector_store.similarity_search_by_vector(embedding=v, k=20)
    return [{"content": d.page_content, "metadata": d.metadata} for d in docs]


def search_kb(kb_id, search):
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    vector_store = PineconeVectorStore(
        embedding=embeddings, index=index, namespace=kb_id
    )
    dim = 1024
    v = [0.0] * dim
    docs = vector_store.similarity_search(query=search, k=20)
    return [{"content": d.page_content, "metadata": d.metadata} for d in docs]
