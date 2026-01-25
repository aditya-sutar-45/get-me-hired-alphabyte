from dotenv import load_dotenv
import os
from pinecone import Pinecone

load_dotenv()

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index_name = os.environ["INDEX_NAME"]

# get the index client
index = pc.Index(index_name)

# delete all vectors
index.delete(delete_all=True)

print("All vectors deleted successfully!")
