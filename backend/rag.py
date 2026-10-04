import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np


# ============================================================
# LOAD LOCAL MINILM MODEL
# ============================================================

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = str(BASE_DIR / "minilm")
CHROMA_PATH = str(BASE_DIR / "chroma_db")

model = SentenceTransformer(MODEL_PATH)


# ============================================================
# CHROMADB
# ============================================================

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

try:
    collection = chroma_client.get_collection(
        name="polar_knowledge"
    )
except Exception:
    collection = chroma_client.create_collection(
        name="polar_knowledge"
    )


# ============================================================
# SEMANTIC SEARCH
# ============================================================

def search_knowledge(
    query: str,
    top_k: int | None = None
):
    """
    Perform semantic search across the POLAR knowledge base.
    """

    data = collection.get(
        include=[
            "documents",
            "metadatas"
        ]
    )

    documents = data.get(
        "documents",
        []
    )

    metadatas = data.get(
        "metadatas",
        []
    )

    if not documents:
        return []

    # --------------------------------------------------------
    # Encode user query
    # --------------------------------------------------------

    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    )

    # --------------------------------------------------------
    # Encode stored documents
    # --------------------------------------------------------

    document_embeddings = model.encode(
        documents,
        normalize_embeddings=True
    )

    # --------------------------------------------------------
    # Cosine similarity
    # --------------------------------------------------------

    scores = np.dot(
        document_embeddings,
        query_embedding
    )

    # Highest similarity first
    ranked_indices = np.argsort(
        scores
    )[::-1]

    # --------------------------------------------------------
    # Select results
    # --------------------------------------------------------

    if top_k is None:
        selected_indices = ranked_indices
    else:
        selected_indices = ranked_indices[:top_k]

    results = []

    for index in selected_indices:

        results.append({
            "score": float(scores[index]),
            "content": documents[index],
            "metadata": metadatas[index]
        })

    return results


# ============================================================
# GET ALL RECORDS
# ============================================================

def get_all_records():
    """
    Return every record stored in ChromaDB.

    This is important for relationship queries because
    semantic top-k retrieval can exclude valid related records.
    """

    data = collection.get(
        include=[
            "documents",
            "metadatas"
        ]
    )

    documents = data.get(
        "documents",
        []
    )

    metadatas = data.get(
        "metadatas",
        []
    )

    results = []

    for document, metadata in zip(
        documents,
        metadatas
    ):

        results.append({
            "content": document,
            "metadata": metadata
        })

    return results


# ============================================================
# GET RECORDS BY SOURCE
# ============================================================

def get_records_by_source(
    source: str
):
    """
    Return all records belonging to a specific source.

    Examples:
        documents
        expeditions
        stations
    """

    records = get_all_records()

    return [
        record
        for record in records
        if record["metadata"].get("source") == source
    ]


# ============================================================
# GET STATION BY NAME
# ============================================================

def get_station_by_name(
    station_name: str
):
    """
    Find a station using a flexible name match.

    Examples:
        Himadri
        Himadri Station

    Both will match the same station.
    """

    stations = get_records_by_source(
        "stations"
    )

    normalized_name = (
        station_name
        .strip()
        .lower()
    )

    for station in stations:

        title = (
            station["metadata"]
            .get("title", "")
            .strip()
            .lower()
        )

        # Exact match
        if title == normalized_name:
            return station

        # Flexible match
        if (
            normalized_name in title
            or title in normalized_name
        ):
            return station

    return None


# ============================================================
# GET EXPEDITIONS FOR A STATION
# ============================================================

def get_expeditions_for_station(
    station_id: str | None = None,
    station_name: str | None = None
):
    """
    Find all expeditions associated with a station.

    Relationship is resolved using:
        station_id
        station_name

    rather than relying only on semantic similarity.
    """

    expeditions = get_records_by_source(
        "expeditions"
    )

    matches = []

    normalized_station_name = None

    if station_name:
        normalized_station_name = (
            station_name
            .strip()
            .lower()
        )

    for expedition in expeditions:

        metadata = expedition["metadata"]

        expedition_station_id = (
            metadata.get("station_id", "")
        )

        expedition_station_name = (
            metadata.get("station_name", "")
        )

        normalized_expedition_station_name = (
            expedition_station_name
            .strip()
            .lower()
        )

        # ----------------------------------------------------
        # Match using station ID
        # ----------------------------------------------------

        if (
            station_id
            and expedition_station_id == station_id
        ):
            matches.append(expedition)
            continue

        # ----------------------------------------------------
        # Match using station name
        # ----------------------------------------------------

        if (
            normalized_station_name
            and normalized_expedition_station_name
        ):

            if (
                normalized_station_name
                == normalized_expedition_station_name
            ):
                matches.append(expedition)
                continue

            # Flexible matching
            if (
                normalized_station_name
                in normalized_expedition_station_name
                or
                normalized_expedition_station_name
                in normalized_station_name
            ):
                matches.append(expedition)

    # --------------------------------------------------------
    # Sort newest expedition first
    # --------------------------------------------------------

    matches.sort(
        key=lambda item: (
            item["metadata"].get("year") or 0
        ),
        reverse=True
    )

    return matches


# ============================================================
# GET DOCUMENTS FOR A STATION
# ============================================================

def get_documents_for_station(
    station_name: str
):
    """
    Find documents that mention or are associated with
    the requested station.

    This supplements semantic retrieval for station queries.
    """

    documents = get_records_by_source(
        "documents"
    )

    normalized_station_name = (
        station_name
        .strip()
        .lower()
    )

    matches = []

    for document in documents:

        content = (
            document.get("content", "")
            .lower()
        )

        title = (
            document["metadata"]
            .get("title", "")
            .lower()
        )

        if (
            normalized_station_name in content
            or normalized_station_name in title
        ):
            matches.append(document)

    return matches


# ============================================================
# GET EXPEDITION BY TITLE
# ============================================================

def get_expedition_by_title(
    expedition_title: str
):
    """
    Find an expedition using a flexible title match.
    """

    expeditions = get_records_by_source(
        "expeditions"
    )

    normalized_title = (
        expedition_title
        .strip()
        .lower()
    )

    for expedition in expeditions:

        title = (
            expedition["metadata"]
            .get("title", "")
            .strip()
            .lower()
        )

        if title == normalized_title:
            return expedition

        if (
            normalized_title in title
            or title in normalized_title
        ):
            return expedition

    return None


# ============================================================
# COMMAND LINE TEST
# ============================================================

if __name__ == "__main__":

    print("\n==============================")
    print("POLAR RAG TEST")
    print("==============================")

    query = input(
        "\nAsk POLAR AI: "
    ).strip()

    # --------------------------------------------------------
    # Semantic search
    # --------------------------------------------------------

    results = search_knowledge(
        query,
        top_k=5
    )

    print("\n==============================")
    print("SEMANTIC RESULTS")
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
            round(
                result["score"],
                4
            )
        )

        print(
            result["content"][:700]
        )

    # --------------------------------------------------------
    # Relationship test
    # --------------------------------------------------------

    print("\n==============================")
    print("RELATIONSHIP TEST")
    print("==============================")

    # Test station
    himadri = get_station_by_name(
        "Himadri"
    )

    if himadri:

        station_metadata = (
            himadri["metadata"]
        )

        station_id = (
            station_metadata.get(
                "station_id"
            )
        )

        station_name = (
            station_metadata.get(
                "title"
            )
        )

        print(
            f"\nStation found: {station_name}"
        )

        related = get_expeditions_for_station(
            station_id=station_id,
            station_name=station_name
        )

        print(
            f"\nExpeditions associated with "
            f"{station_name}:"
        )

        if related:

            for expedition in related:

                metadata = expedition[
                    "metadata"
                ]

                print(
                    f"- {metadata.get('title')} "
                    f"({metadata.get('year')})"
                )

        else:

            print(
                "No related expeditions found."
            )

    else:

        print(
            "Himadri station was not found."
        )