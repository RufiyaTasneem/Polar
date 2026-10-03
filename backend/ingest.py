import os
import chromadb

from dotenv import load_dotenv
from supabase import create_client
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase environment variables are missing")

# Connect to Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load embedding model
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Create local ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")

collection = chroma_client.get_or_create_collection(
    name="polar_knowledge"
)

print("Connected to ChromaDB")


def add_documents():
    print("Fetching documents...")

    response = supabase.table("documents").select("*").execute()
    documents = response.data or []

    print(f"Found {len(documents)} documents")

    for doc in documents:
        text = f"""
Title: {doc.get('title', '')}
Type: {doc.get('type', '')}
Region: {doc.get('region', '')}
Year: {doc.get('year', '')}
Description: {doc.get('description', '')}
Abstract: {doc.get('abstract', '')}
Authors: {', '.join(doc.get('authors', []) or [])}
Institution: {doc.get('institution', '')}
Research Areas: {', '.join(doc.get('research_areas', []) or [])}
Tags: {', '.join(doc.get('tags', []) or [])}
"""

        embedding = model.encode(text).tolist()

        collection.upsert(
            ids=[doc["id"]],
            documents=[text],
            embeddings=[embedding],
            metadatas=[{
                "source": "documents",
                "title": doc.get("title", ""),
                "year": doc.get("year") or 0,
                "region": doc.get("region", "")
            }]
        )

    print("Documents added successfully!")


def add_expeditions():
    print("Fetching expeditions...")

    response = supabase.table("expeditions").select("*").execute()
    expeditions = response.data or []

    print(f"Found {len(expeditions)} expeditions")

    for expedition in expeditions:
        text = f"""
Expedition: {expedition.get('title', '')}
Year: {expedition.get('year', '')}
Region: {expedition.get('region', '')}
Expedition Number: {expedition.get('expedition_number', '')}
Objectives: {expedition.get('objectives', '')}
Research Areas: {', '.join(expedition.get('research_areas', []) or [])}
Institutions: {', '.join(expedition.get('institutions', []) or [])}
Scientists: {', '.join(expedition.get('scientists', []) or [])}
Description: {expedition.get('description', '')}
"""

        embedding = model.encode(text).tolist()

        collection.upsert(
            ids=[f"expedition-{expedition['id']}"],
            documents=[text],
            embeddings=[embedding],
            metadatas=[{
                "source": "expeditions",
                "title": expedition.get("title", ""),
                "year": expedition.get("year") or 0,
                "region": expedition.get("region", "")
            }]
        )

    print("Expeditions added successfully!")


def add_stations():
    print("Fetching stations...")

    response = supabase.table("stations").select("*").execute()
    stations = response.data or []

    print(f"Found {len(stations)} stations")

    for station in stations:
        text = f"""
Station: {station.get('name', '')}
Region: {station.get('region', '')}
Location: {station.get('location', '')}
Description: {station.get('description', '')}
"""

        embedding = model.encode(text).tolist()

        collection.upsert(
            ids=[f"station-{station['id']}"],
            documents=[text],
            embeddings=[embedding],
            metadatas=[{
                "source": "stations",
                "title": station.get("name", ""),
                "region": station.get("region", "")
            }]
        )

    print("Stations added successfully!")


if __name__ == "__main__":
    add_documents()
    add_expeditions()
    add_stations()

    print("\n==============================")
    print("POLAR RAG INGESTION COMPLETE")
    print("==============================")
    print("Total vectors:", collection.count())