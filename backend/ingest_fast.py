import os
import chromadb
from sentence_transformers import SentenceTransformer
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing"
    )

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# Local MiniLM model
MODEL_PATH = "./minilm"

print("\nLoading MiniLM model...")
model = SentenceTransformer(MODEL_PATH)

print("MiniLM loaded successfully.")


# ChromaDB
chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

# Delete old TF-IDF knowledge base
try:
    chroma_client.delete_collection(
        name="polar_knowledge"
    )
    print("Old POLAR knowledge collection deleted.")
except Exception:
    pass

collection = chroma_client.create_collection(
    name="polar_knowledge"
)


def add_records(records, source_type):

    if not records:
        return

    documents = []
    metadatas = []
    ids = []

    for record in records:

        if source_type == "documents":

            content = f"""
Title: {record.get('title', '')}
Type: {record.get('type', '')}
Region: {record.get('region', '')}
Year: {record.get('year', '')}
Description: {record.get('description', '')}
Abstract: {record.get('abstract', '')}
Authors: {record.get('authors', '')}
Institution: {record.get('institution', '')}
Research Areas: {', '.join(record.get('research_areas', []))}
Tags: {', '.join(record.get('tags', []))}
"""

            record_id = f"document-{record['id']}"

            metadata = {
                "source": "documents",
                "title": record.get("title", ""),
                "region": record.get("region", ""),
                "year": record.get("year", 0)
            }

        elif source_type == "expeditions":

            content = f"""
Expedition: {record.get('title', '')}
Year: {record.get('year', '')}
Region: {record.get('region', '')}
Expedition Number: {record.get('expedition_number', '')}
Objectives: {record.get('objectives', '')}
Research Areas: {', '.join(record.get('research_areas', []))}
Institutions: {', '.join(record.get('institutions', []))}
Scientists: {', '.join(record.get('scientists', []))}
Description: {record.get('description', '')}
"""

            record_id = f"expedition-{record['id']}"

            metadata = {
                "source": "expeditions",
                "title": record.get("title", ""),
                "region": record.get("region", ""),
                "year": record.get("year", 0)
            }

        elif source_type == "stations":

            content = f"""
Station: {record.get('name', '')}
Slug: {record.get('slug', '')}
Location: {record.get('location', '')}
Region: {record.get('region', '')}
Established: {record.get('established', '')}
Description: {record.get('description', '')}
"""

            record_id = f"station-{record['id']}"

            metadata = {
                "source": "stations",
                "title": record.get("name", ""),
                "region": record.get("region", "")
            }

        else:
            continue

        documents.append(content.strip())
        metadatas.append(metadata)
        ids.append(record_id)

    if not documents:
        return

    print(
        f"\nCreating embeddings for "
        f"{len(documents)} {source_type}..."
    )

    embeddings = model.encode(
        documents,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings.tolist()
    )

    print(
        f"Added {len(documents)} {source_type}."
    )


# ------------------------------------------
# Fetch documents
# ------------------------------------------

print("\nFetching documents...")

documents_response = (
    supabase
    .table("documents")
    .select("*")
    .execute()
)

documents = documents_response.data or []

print(
    f"Found {len(documents)} documents"
)

add_records(
    documents,
    "documents"
)


# ------------------------------------------
# Fetch expeditions
# ------------------------------------------

print("\nFetching expeditions...")

expeditions_response = (
    supabase
    .table("expeditions")
    .select("*")
    .execute()
)

expeditions = expeditions_response.data or []

print(
    f"Found {len(expeditions)} expeditions"
)

add_records(
    expeditions,
    "expeditions"
)


# ------------------------------------------
# Fetch stations
# ------------------------------------------

print("\nFetching stations...")

stations_response = (
    supabase
    .table("stations")
    .select("*")
    .execute()
)

stations = stations_response.data or []

print(
    f"Found {len(stations)} stations"
)

add_records(
    stations,
    "stations"
)


# ------------------------------------------
# Complete
# ------------------------------------------

count = collection.count()

print("\n===================================")
print("POLAR SEMANTIC RAG INGESTION DONE")
print("===================================")
print(f"Total vectors: {count}")
print("Embedding model: all-MiniLM-L6-v2")
print("Embedding dimension: 384")