from glob import glob
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore

load_dotenv()

all_docs = []
headers_to_split = [("##", "question")]
md_paths = glob("../llm/data/mrkdown/PYTHON.md")

embeddings = OllamaEmbeddings(model="mxbai-embed-large")

BATCH_SIZE = 69

print("loading markdown files")
for markdown_path in md_paths:
    lang_name = os.path.basename(markdown_path).lower().replace(".md", "")

    loader = TextLoader(markdown_path, encoding="utf-8")
    data = loader.load()
    markdown_content = data[0].page_content

    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split)
    docs = splitter.split_text(markdown_content)

    for i, doc in enumerate(docs):
        doc.metadata["language"] = lang_name
        doc.metadata["source"] = markdown_path  # optional

        # Move question + answer to page_content
        question = doc.metadata.pop("question", None)
        answer = doc.page_content
        doc.page_content = f"Q: {question}\nA: {answer}"

    all_docs.extend(docs)

# batch ingestion
print("markdown files loaded!")
print(f"Total docs: {len(all_docs)}")

for i in range(0, len(all_docs), BATCH_SIZE):
    batch = all_docs[i : i + BATCH_SIZE]
    print(f"Ingesting batch {i} to {i + len(batch)}...")
    PineconeVectorStore.from_documents(
        batch, embeddings, index_name=os.environ["INDEX_NAME"]
    )

print("finished ingesting all documents!")
