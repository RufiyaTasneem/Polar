import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np

# Load the local MiniLM model
MODEL_PATH = "./minilm"

model = SentenceTransformer(MODEL_PATH)

# ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")

try:
    collection = chroma_client.get_collection(
        name="polar_knowledge"
    )
except Exception:
    collection = chroma_client.create_collection(
        name="polar_knowledge"
    )


def search_knowledge(query: str, top_k: int | None = None):

    # Get all stored knowledge
    data = collection.get(
        include=["documents", "metadatas"]
    )

    documents = data.get("documents", [])
    metadatas = data.get("metadatas", [])

    if not documents:
        return []

    # Create semantic embedding for the user's question
    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    )

    # Create embeddings for stored documents
    document_embeddings = model.encode(
        documents,
        normalize_embeddings=True
    )

    # Cosine similarity
    scores = np.dot(
        document_embeddings,
        query_embedding
    )

    # Highest similarity first
    ranked_indices = np.argsort(scores)[::-1]

    results = []

    selected_indices = ranked_indices[:top_k] if top_k is not None else ranked_indices

    for index in selected_indices:

        results.append({
            "score": float(scores[index]),
            "content": documents[index],
            "metadata": metadatas[index]
        })

    return results


if __name__ == "__main__":

    query = input("\nAsk POLAR AI: ")

    results = search_knowledge(query, top_k=5)

    print("\n==============================")
    print("POLAR AI SEMANTIC RETRIEVAL")
    print("==============================")

    for result in results:

        print("\nSource:")
        print(
            result["metadata"].get(
                "title",
                "Unknown"
            )
        )

        print(
            "Similarity:",
            round(result["score"], 4)
        )

        print(
            result["content"][:700]
        )