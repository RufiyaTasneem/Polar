import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from rag import search_knowledge


# =============================================================
# FASTAPI APP
# =============================================================

app = FastAPI(title="POLAR AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "POLAR AI API is running"}


# =============================================================
# PARSING HELPERS
# =============================================================

def parse_content(content: str):
    """Convert POLAR knowledge records into a dictionary."""

    fields = {}

    for line in content.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip()

    return fields


def get_year(result):
    """Get year from a POLAR knowledge record."""

    fields = parse_content(
        result.get("content", "")
    )

    metadata = result.get("metadata") or {}

    year = fields.get(
        "Year",
        metadata.get("year", 0)
    )

    try:
        return int(year)
    except (ValueError, TypeError):
        return 0


def get_source_details(result):
    """Extract structured information from a POLAR knowledge record."""

    fields = parse_content(
        result.get("content", "")
    )

    metadata = result.get(
        "metadata",
        {}
    ) or {}

    source_type = metadata.get(
        "source",
        ""
    )

    title = fields.get(
        "Title",
        fields.get(
            "Expedition",
            fields.get(
                "Station",
                metadata.get(
                    "title",
                    "POLAR Knowledge Source"
                )
            )
        )
    )

    description = fields.get(
        "Description",
        ""
    )

    abstract = fields.get(
        "Abstract",
        ""
    )

    objectives = fields.get(
        "Objectives",
        ""
    )

    research_areas = fields.get(
        "Research Areas",
        ""
    )

    findings = fields.get(
        "Findings",
        ""
    )

    return {
        "fields": fields,
        "metadata": metadata,
        "source_type": source_type,
        "title": title,
        "description": description,
        "abstract": abstract,
        "objectives": objectives,
        "research_areas": research_areas,
        "findings": findings,
    }


# =============================================================
# TEXT HELPERS
# =============================================================

def _join_naturally(items):
    items = list(
        dict.fromkeys(
            item.strip()
            for item in items
            if item and item.strip()
        )
    )

    if len(items) < 2:
        return items[0] if items else ""

    if len(items) == 2:
        return f"{items[0]} and {items[1]}"

    return f"{', '.join(items[:-1])}, and {items[-1]}"


def _research_areas(details):
    raw_areas = _clean_text(
        details["research_areas"]
    )

    if not raw_areas:
        return []

    return _split_values(raw_areas)


def _clean_text(text):
    text = str(text or "").strip()
    text = re.sub(
        r"\b(\w+)(\s+\1\b)+",
        r"\1",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"\bto(?:\s+to)+\b",
        "to",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"\s+([,.;!?])", r"\1", text)
    text = re.sub(r"([,;!?])\1+", r"\1", text)
    return text.strip()


def _split_values(value):
    return [
        _clean_text(item).strip(" .;")
        for item in re.split(r"[,;]", value or "")
        if _clean_text(item).strip(" .;")
    ]


def _objective_phrase(objectives):
    phrase = _clean_text(objectives).strip(" .;")

    if not phrase:
        return ""

    phrase = re.sub(
        r"^(?:objectives?\s*[:\-]\s*|objectives?\s+|"
        r"objective\s+of\s+the\s+study\s*[:\-]?\s*)",
        "",
        phrase,
        flags=re.IGNORECASE,
    ).strip()
    phrase = re.sub(r"^(?:to\s+)+", "To ", phrase, flags=re.IGNORECASE)

    if phrase.lower().startswith("study "):
        phrase = "To " + phrase
    elif phrase.lower().startswith("investigate "):
        phrase = "To " + phrase
    elif phrase.lower().startswith("investigation of "):
        phrase = "To investigate " + phrase[len("investigation of "):]
    elif phrase.lower().startswith("examine "):
        phrase = "To " + phrase
    elif phrase.lower().startswith("monitor "):
        phrase = "To " + phrase
    elif phrase.lower().startswith("assess "):
        phrase = "To " + phrase
    elif phrase[:1].islower():
        phrase = phrase[:1].upper() + phrase[1:]

    return _clean_text(phrase)


def _bullet_section(label, items):
    cleaned = list(
        dict.fromkeys(
            _clean_text(item).strip(" .;")
            for item in items
            if _clean_text(item).strip(" .;")
        )
    )
    if not cleaned:
        return ""
    return f"{label}:\n" + "\n".join(
        f"• {item}" for item in cleaned
    )


def _research_record_summary(details):
    """
    Create a short grounded summary from a retrieved record.

    IMPORTANT:
    Titles are taken directly from the repository.
    We do not rename or invent source titles.
    """

    title = _clean_text(details["title"])

    areas = _join_naturally(
        _research_areas(details)
    )

    objectives = _objective_phrase(details["objectives"])

    if areas and objectives:
        return (
            f"{title} — Research areas: {areas}. "
            f"Objective: {objectives}."
        )

    if objectives:
        return f"{title} — Objective: {objectives}."

    description = (
        details["description"]
        .strip()
        .rstrip(".")
    )

    if description:

        including = description.lower().find(
            "including "
        )

        if including >= 0:

            findings = (
                description[
                    including + len("including "):
                ]
                .rstrip(".")
            )

            return f"{title} highlights {findings}."

        return f"{description} ({title})."

    abstract = details["abstract"].strip()

    if abstract:
        return (
            f"{abstract.rstrip('.')} ({title})."
        )

    findings = details["findings"].strip()

    if findings:
        return (
            f"{title} reports "
            f"{findings[:1].lower()}"
            f"{findings[1:].rstrip('.')}."
        )

    if areas:
        return f"{title} covers {areas}."

    return ""


# =============================================================
# EXPEDITION DETECTION
# =============================================================

def _is_expedition_query(query: str):
    """
    Detect questions that are asking about expeditions.

    This allows us to prioritize structured expedition records
    instead of summarizing unrelated regional records.
    """

    q = query.lower()

    expedition_terms = (
        "expedition",
        "expeditions",
        "objectives",
        "institutions",
        "scientists",
        "research areas",
    )

    return any(
        term in q
        for term in expedition_terms
    )


def _extract_expedition_number(query: str):
    """
    Extract an expedition number from a query.

    Examples:
        43rd -> 43
        15th -> 15
        42nd -> 42
    """

    match = re.search(
        r"\b(\d+)(?:st|nd|rd|th)\b",
        query.lower()
    )

    if match:
        return match.group(1)

    return None


def _is_exact_expedition(details, query: str):
    """
    Check whether a retrieved record is the exact expedition
    requested by the user.

    We rely only on the actual repository title/fields.
    """

    if (
        details["source_type"].lower()
        != "expeditions"
    ):
        return False

    title = details["title"].lower()

    query_lower = query.lower()

    expedition_number = (
        _extract_expedition_number(query)
    )

    # ---------------------------------------------------------
    # Exact expedition number
    # ---------------------------------------------------------

    if expedition_number:

        pattern = (
            rf"\b{re.escape(expedition_number)}"
            rf"(?:st|nd|rd|th)\b"
        )

        return bool(
            re.search(pattern, title)
        )

    # ---------------------------------------------------------
    # Station-based expedition detection
    # ---------------------------------------------------------

    if "himadri" in query_lower:
        return "himadri" in _expedition_record_text(details)

    if "bharati" in query_lower:
        return "bharati" in _expedition_record_text(details)

    if "maitri" in query_lower:
        return "maitri" in _expedition_record_text(details)

    # ---------------------------------------------------------
    # Region-based expedition detection
    # ---------------------------------------------------------

    if (
        "arctic" in query_lower
        and "arctic" in title
    ):
        return True

    if (
        "antarctic" in query_lower
        and "antarctic" in title
    ):
        return True

    return False


def _expedition_record_text(details):
    return " ".join(
        str(value).lower()
        for value in details["fields"].values()
    )


# =============================================================
# EXACT EXPEDITION ANSWER
# =============================================================

def generate_expedition_answer(
    query: str,
    expedition_details,
):
    """
    Generate an answer directly from the exact structured
    expedition record.

    This deliberately avoids paraphrasing expedition names.
    """

    fields = expedition_details["fields"]

    title = _clean_text(expedition_details["title"])

    year = _clean_text(
        fields.get(
            "Year",
            expedition_details["metadata"].get("year", ""),
        )
    )

    objectives = _objective_phrase(
        fields.get("Objectives", expedition_details["objectives"])
    )

    research_areas = _research_areas(expedition_details)

    institutions = _split_values(
        fields.get("Institutions", fields.get("Institution", ""))
    )

    scientists = _split_values(fields.get("Scientists", ""))

    region = _clean_text(fields.get("Region", ""))
    description = _clean_text(
        fields.get("Description", expedition_details["description"])
    )

    answer_parts = [title]
    if year:
        answer_parts.append(f"Year: {year}")
    if region:
        answer_parts.append(f"Region: {region}")
    objective_section = _bullet_section(
        "Objectives",
        [objectives] if objectives else [],
    )
    if objective_section:
        answer_parts.append(objective_section)
    area_section = _bullet_section("Research areas", research_areas)
    if area_section:
        answer_parts.append(area_section)
    institution_section = _bullet_section("Institutions", institutions)
    if institution_section:
        answer_parts.append(institution_section)
    scientist_section = _bullet_section("Scientists", scientists)
    if scientist_section:
        answer_parts.append(scientist_section)
    if description and description.rstrip(".").lower() not in (
        objectives.lower(),
        " ".join(research_areas).lower(),
    ):
        answer_parts.append(
            f"Description:\n{description.rstrip('.')}."
        )

    excerpt = (
        fields.get("Objectives", "")
        or description
        or ", ".join(research_areas)
    )

    source = {
        "title": title,
        "year": year,
        "institution": institutions,
        "type": fields.get(
            "Type",
            ""
        ),
        "source_type": (
            expedition_details["source_type"]
        ),
        "excerpt": excerpt,
    }

    return {
        "answer": "\n\n".join(answer_parts),
        "sources": [source],
    }


def _expedition_record_source(details):
    fields = details["fields"]
    return {
        "title": details["title"],
        "year": fields.get("Year", details["metadata"].get("year", "")),
        "institution": fields.get(
            "Institution",
            fields.get("Institutions", ""),
        ),
        "type": fields.get("Type", ""),
        "source_type": details["source_type"],
        "excerpt": (
            fields.get("Objectives", "")
            or details["description"]
            or details["research_areas"]
        ),
    }


def generate_comparison_answer(query, expedition_records, requested_numbers):
    records_by_number = {}
    for details in expedition_records:
        title = details["title"].lower()
        for number in requested_numbers:
            if re.search(rf"\b{re.escape(number)}(?:st|nd|rd|th)\b", title):
                records_by_number[number] = details

    if any(number not in records_by_number for number in requested_numbers):
        return {
            "answer": (
                "This information is not available in the POLAR knowledge repository."
            ),
            "sources": [
                _expedition_record_source(details)
                for details in records_by_number.values()
            ],
        }

    answer_parts = []
    comparison_facts = []
    sources = []

    for number in requested_numbers:
        details = records_by_number[number]
        fields = details["fields"]
        title = _clean_text(details["title"])
        region = _clean_text(fields.get("Region", ""))
        objectives = _objective_phrase(fields.get("Objectives", ""))
        areas = _research_areas(details)

        section = [title]
        if region:
            section.append(f"- Region: {region}")
        if objectives:
            section.append(f"- Objectives:\n  • {objectives}")
        if areas:
            section.append(
                "- Research areas:\n"
                + "\n".join(f"  • {area}" for area in areas)
            )
        answer_parts.append("\n".join(section))
        sources.append(_expedition_record_source(details))

    first = records_by_number[requested_numbers[0]]
    second = records_by_number[requested_numbers[1]]
    first_region = _clean_text(first["fields"].get("Region", ""))
    second_region = _clean_text(second["fields"].get("Region", ""))
    if first_region and second_region:
        comparison_facts.append(
            f"The records list their regions as {first_region} and {second_region}, respectively."
        )

    first_areas = _research_areas(first)
    second_areas = _research_areas(second)
    if first_areas and second_areas:
        comparison_facts.append(
            "Recorded research areas are "
            f"{_join_naturally(first_areas)} for {first['title']} and "
            f"{_join_naturally(second_areas)} for {second['title']}."
        )
    first_objectives = _objective_phrase(
        first["fields"].get("Objectives", "")
    )
    second_objectives = _objective_phrase(
        second["fields"].get("Objectives", "")
    )
    if first_objectives and second_objectives:
        comparison_facts.append(
            "The recorded objectives are "
            f"{first_objectives} for {first['title']} and "
            f"{second_objectives} for {second['title']}."
        )

    if comparison_facts:
        answer_parts.append(
            "Comparison:\n" + "\n".join(
                f"• {fact}" for fact in comparison_facts
            )
        )

    return {
        "answer": "\n\n".join(answer_parts),
        "sources": sources,
    }


def _is_document_query(query, results):
    query_lower = query.lower()
    document_intent = any(
        term in query_lower
        for term in ("dataset", "document", "publication", "paper", "study", "report")
    ) or "what is" in query_lower and "about" in query_lower
    return document_intent or bool(results) and all(
        get_source_details(result)["source_type"].lower() == "documents"
        for result in results
    )


def _format_document_answer(details):
    fields = details["fields"]
    parts = [_clean_text(details["title"])]

    document_type = _clean_text(fields.get("Type", ""))
    year = _clean_text(
        fields.get("Year", details["metadata"].get("year", ""))
    )
    institution = _clean_text(
        fields.get("Institution", fields.get("Institutions", ""))
    )
    if document_type:
        parts.append(f"Type: {document_type}")
    if year:
        parts.append(f"Year: {year}")
    if institution:
        parts.append(f"Institution: {institution}")

    summary = _clean_text(
        details["abstract"]
        or details["description"]
        or details["findings"]
    )
    if summary:
        parts.append(f"Summary:\n{summary}")

    topics = _research_areas(details)
    topics_section = _bullet_section("Relevant topics", topics)
    if topics_section:
        parts.append(topics_section)

    return "\n\n".join(parts)


# =============================================================
# MAIN ANSWER GENERATOR
# =============================================================

def generate_answer(
    query: str,
    results: list
):

    # =========================================================
    # NO RESULTS
    # =========================================================

    if not results:
        return {
            "answer": (
                "This information is not available in the POLAR knowledge repository."
            ),
            "sources": [],
        }

    query_lower = query.lower()

    # =========================================================
    # TOPICS
    # =========================================================

    specific_topics = [
        "kongsfjorden",
        "himadri",
        "maitri",
        "bharati",
        "svalbard",
        "schirmacher",
    ]

    region_topics = [
        "antarctica",
        "antarctic",
        "arctic",
        "southern ocean",
    ]

    # =========================================================
    # REQUESTED TOPIC
    # =========================================================

    requested_specific_topic = next(
        (
            topic
            for topic in specific_topics
            if topic in query_lower
        ),
        None,
    )

    requested_region = next(
        (
            region
            for region in region_topics
            if region in query_lower
        ),
        None,
    )

    # =========================================================
    # STATION CONTEXT
    # =========================================================

    station_contexts = {

        "bharati": {
            "region": "antarctica",

            "region_terms": (
                "antarctica",
                "antarctic",
                "southern ocean",
                "schirmacher",
            ),

            "preferred_terms": (
                "bharati",
                "southern ocean",
                "antarctic climate",
                "oceanography",
                "polar biology",
                "ice",
                "ecosystem",
                "environmental observation",
            ),

            "other_stations": (
                "himadri",
                "maitri",
                "schirmacher",
            ),
        },

        "maitri": {
            "region": "antarctica",

            "region_terms": (
                "antarctica",
                "antarctic",
                "southern ocean",
                "schirmacher",
            ),

            "preferred_terms": (
                "maitri",
                "schirmacher oasis",
                "antarctic lake",
                "geology",
                "ice core",
                "paleoclimate",
                "climate",
                "antarctic ecosystem",
            ),

            "other_stations": (
                "himadri",
                "bharati",
            ),
        },

        "himadri": {
            "region": "arctic",

            "region_terms": (
                "arctic",
                "svalbard",
                "ny-ålesund",
                "ny-Ã¥lesund",
            ),

            "preferred_terms": (
                "himadri",
                "svalbard",
                "ny-ålesund",
                "ny-Ã¥lesund",
                "arctic climate",
                "aerosol",
                "atmosphere",
                "glacier",
                "permafrost",
                "arctic ecosystem",
                "fjord",
            ),

            "other_stations": (
                "maitri",
                "bharati",
                "schirmacher",
            ),
        },
    }

    station_context = (
        station_contexts.get(
            requested_specific_topic
        )
    )
    asks_for_association = any(
        term in query_lower
        for term in ("associated", "linked", "related to")
    )

    # =========================================================
    # SCORE RESULTS
    # =========================================================

    scored_results = []

    for result in results:

        content = result.get(
            "content",
            ""
        )

        text = content.lower()

        relevance = float(
            result.get(
                "score",
                0
            )
        )

        # -----------------------------------------------------
        # Requested station/topic
        # -----------------------------------------------------

        if requested_specific_topic:

            if requested_specific_topic in text:
                relevance += 0.8
            else:
                relevance -= 0.25

        # -----------------------------------------------------
        # Region
        # -----------------------------------------------------

        if requested_region:

            if requested_region in text:
                relevance += 0.3

        # -----------------------------------------------------
        # Research intent
        # -----------------------------------------------------

        if "research" in query_lower:

            for term in [
                "research",
                "research areas",
                "objectives",
                "studies",
                "study",
                "scientific",
            ]:

                if term in text:
                    relevance += 0.08

        result["_relevance"] = relevance

        scored_results.append(
            result
        )

    # =========================================================
    # SORT
    # =========================================================

    scored_results.sort(
        key=lambda x: x["_relevance"],
        reverse=True,
    )

    if not scored_results:
        return {
            "answer": (
                "This information is not available in the POLAR knowledge repository."
            ),
            "sources": [],
        }

    best_result = scored_results[0]

    requested_expedition_numbers = list(
        dict.fromkeys(
            re.findall(
                r"\b(\d+)(?:st|nd|rd|th)\b",
                query_lower,
            )
        )
    )
    is_expedition_comparison = (
        len(requested_expedition_numbers) >= 2
        and any(
            term in query_lower
            for term in ("compare", "comparison", "versus", " vs ")
        )
    )

    if is_expedition_comparison:
        comparison_records = [
            get_source_details(result)
            for result in scored_results
            if get_source_details(result)["source_type"].lower()
            == "expeditions"
            and any(
                re.search(
                    rf"\b{re.escape(number)}(?:st|nd|rd|th)\b",
                    get_source_details(result)["title"].lower(),
                )
                for number in requested_expedition_numbers
            )
        ]
        return generate_comparison_answer(
            query,
            comparison_records,
            requested_expedition_numbers,
        )

    # =========================================================
    # EXACT EXPEDITION HANDLING
    #
    # IMPORTANT:
    # This is before station/general synthesis so that an
    # expedition question uses the exact expedition record.
    # =========================================================

    has_expedition_identifier = bool(
        _extract_expedition_number(query)
    )
    if (
        _is_expedition_query(query)
        and ("expedition" in query_lower or has_expedition_identifier)
        and not (station_context and asks_for_association)
    ):

        expedition_records = []

        for result in scored_results:

            details = get_source_details(
                result
            )

            if _is_exact_expedition(
                details,
                query
            ):
                expedition_records.append(
                    details
                )

        if expedition_records:

            # Prefer the highest-scoring exact expedition
            expedition_records.sort(
                key=lambda details: next(
                    (
                        r.get(
                            "_relevance",
                            0
                        )
                        for r in scored_results
                        if get_source_details(r)["title"]
                        == details["title"]
                    ),
                    0,
                ),
                reverse=True,
            )

            return generate_expedition_answer(
                query,
                expedition_records[0],
            )
        return {
            "answer": (
                "This information is not available in the POLAR knowledge repository."
            ),
            "sources": [],
        }

    # =========================================================
    # RELEVANCE PROTECTION
    # =========================================================

    MIN_RELEVANCE = 0.35

    if (
        best_result["_relevance"]
        < MIN_RELEVANCE
    ):

        return {
            "answer": (
                "This information is not available in the POLAR knowledge repository."
            ),
            "sources": [],
        }

    # =========================================================
    # SPECIFIC TOPIC MUST EXIST
    # =========================================================

    if requested_specific_topic:

        best_text = best_result.get(
            "content",
            ""
        ).lower()

        if (
            requested_specific_topic
            not in best_text
        ):

            return {
                "answer": (
                    "This information is not available in the POLAR knowledge repository."
                ),
                "sources": [],
            }

    # =========================================================
    # SELECT RELEVANT SOURCES
    # =========================================================

    if station_context:

        station_record = None

        regional_records = []
        target_region = (
            station_context["region"]
        )

        for result in scored_results:

            details = get_source_details(
                result
            )

            content = result.get(
                "content",
                ""
            ).lower()

            source_type = (
                details["source_type"]
                .lower()
            )

            record_region = (
                details["fields"].get(
                    "Region",
                    ""
                )
                or details["metadata"].get(
                    "region",
                    ""
                )
            ).lower()

            # -------------------------------------------------
            # Station record
            # -------------------------------------------------

            is_station_record = (
                source_type == "stations"
                and requested_specific_topic
                in content
            )

            if is_station_record:
                station_record = result
                continue

            if source_type == "stations":
                continue

            if (
                asks_for_association
                and source_type == "expeditions"
                and requested_specific_topic not in content
                and requested_specific_topic
                not in details["fields"].get("Station", "").lower()
            ):
                continue

            # -------------------------------------------------
            # Ignore other station content
            # -------------------------------------------------

            if any(
                other_station in content
                for other_station
                in station_context[
                    "other_stations"
                ]
            ):
                continue

            def mentions_region(
                text,
                terms
            ):
                return any(
                    re.search(
                        rf"(?<!\w)"
                        rf"{re.escape(term)}"
                        rf"(?!\w)",
                        text,
                    )
                    for term in terms
                )

            region_matches = (
                target_region
                in record_region
                or (
                    not record_region
                    and mentions_region(
                        content,
                        station_context[
                            "region_terms"
                        ],
                    )
                )
            )

            opposite_region_terms = (
                (
                    "arctic",
                    "svalbard",
                    "ny-ålesund",
                    "ny-Ã¥lesund",
                )
                if target_region
                == "antarctica"
                else (
                    "antarctica",
                    "antarctic",
                    "southern ocean",
                )
            )

            wrong_region = mentions_region(
                record_region or content,
                opposite_region_terms,
            )

            if (
                region_matches
                and not wrong_region
            ):
                regional_records.append(
                    result
                )

        # -----------------------------------------------------
        # Research priority
        # -----------------------------------------------------

        def research_priority(result):

            details = get_source_details(
                result
            )

            source_type = (
                details["source_type"]
                .lower()
            )

            text = (
                result.get(
                    "content",
                    ""
                )
                + " "
                + details["fields"].get(
                    "Type",
                    ""
                )
                + " "
                + details["title"]
            ).lower()

            if source_type == "expeditions":

                source_priority = 0

            elif source_type == "documents":

                if any(
                    term in text
                    for term in (
                        "educational",
                        "outreach",
                        "curriculum",
                    )
                ):
                    source_priority = 3

                elif any(
                    term in text
                    for term in (
                        "dataset",
                        "data set",
                    )
                ):
                    source_priority = 2

                else:
                    source_priority = 1

            else:

                source_priority = 4

            target_match = (
                requested_specific_topic
                not in text
            )

            preferred_match_count = sum(
                term in text
                for term in station_context[
                    "preferred_terms"
                ]
            )

            return (
                source_priority,
                target_match,
                -preferred_match_count,
                -float(
                    result.get(
                        "_relevance",
                        0
                    )
                ),
            )

        regional_records.sort(
            key=research_priority
        )

        substantive_records = [
            result
            for result in regional_records
            if not any(
                term in (
                    result.get(
                        "content",
                        ""
                    )
                    + " "
                    + get_source_details(
                        result
                    )["title"]
                ).lower()
                for term in (
                    "educational",
                    "outreach",
                    "curriculum",
                )
            )
        ]

        if len(substantive_records) >= 2:
            regional_records = (
                substantive_records
            )

        relevant_results = (
            (
                [station_record]
                if station_record
                else []
            )
            + regional_records[:4]
        )

    elif requested_specific_topic:

        requested_antarctic_station = (
            requested_specific_topic
            in [
                "bharati",
                "maitri",
                "schirmacher",
            ]
        )

        requested_arctic_station = (
            requested_specific_topic
            in [
                "himadri",
                "kongsfjorden",
                "svalbard",
            ]
        )

        relevant_results = []

        for result in scored_results:

            content = result.get(
                "content",
                ""
            ).lower()

            score = float(
                result.get(
                    "score",
                    0
                )
            )

            # -------------------------------------------------
            # Exact requested topic
            # -------------------------------------------------

            if (
                requested_specific_topic
                in content
            ):

                relevant_results.append(
                    result
                )
                continue

            # -------------------------------------------------
            # Antarctic station
            # -------------------------------------------------

            if requested_antarctic_station:

                if (
                    "antarctica" in content
                    and score >= 0.25
                ):

                    relevant_results.append(
                        result
                    )

            # -------------------------------------------------
            # Arctic station
            # -------------------------------------------------

            elif requested_arctic_station:

                if (
                    (
                        "arctic" in content
                        or "svalbard" in content
                    )
                    and score >= 0.25
                ):

                    relevant_results.append(
                        result
                    )

            if len(
                relevant_results
            ) >= 5:
                break

    else:

        minimum_relevance = max(
            0.2,
            best_result["_relevance"]
            - 0.45,
        )

        relevant_results = [
            result
            for result in scored_results
            if result["_relevance"]
            >= minimum_relevance
        ][:5]

        if (
            best_result
            not in relevant_results
        ):

            relevant_results.insert(
                0,
                best_result
            )

            relevant_results = (
                relevant_results[:5]
            )

    # =========================================================
    # LATEST RESEARCH FIRST
    # =========================================================

    if not station_context:

        relevant_results.sort(
            key=lambda result: (
                get_year(result),
                result.get(
                    "_relevance",
                    0
                ),
            ),
            reverse=True,
        )

    # =========================================================
    # BUILD ANSWER
    # =========================================================

    answer_parts = []

    # =========================================================
    # STATION-SPECIFIC QUESTION
    # =========================================================

    if station_context:
        station_record = next(
            (
                get_source_details(result)
                for result in relevant_results
                if get_source_details(result)["source_type"].lower()
                == "stations"
            ),
            None,
        )
        research_records = [
            get_source_details(result)
            for result in relevant_results
            if get_source_details(result)["source_type"].lower()
            != "stations"
        ]

        if not station_record:
            answer_parts.append(
                "This information is not available in the POLAR knowledge repository."
            )
        else:
            station_fields = station_record["fields"]
            station_name = _clean_text(station_record["title"])
            location = _clean_text(station_fields.get("Location", ""))
            region = _clean_text(
                station_fields.get(
                    "Region",
                    station_record["metadata"].get("region", ""),
                )
            )
            station_areas = _research_areas(station_record)

            answer_parts.append(station_name)
            if location:
                answer_parts.append(f"Location: {location}")
            if region:
                answer_parts.append(f"Region: {region}")

            main_areas = _bullet_section(
                "Main research areas",
                station_areas,
            )
            if main_areas:
                answer_parts.append(main_areas)

            expeditions = [
                details
                for details in research_records
                if details["source_type"].lower() == "expeditions"
            ]
            related_expeditions = _bullet_section(
                "Related regional expeditions",
                [
                    _clean_text(details["title"])
                    + (
                        f" ({details['fields'].get('Year')})"
                        if details["fields"].get("Year")
                        else ""
                    )
                    for details in expeditions
                ],
            )
            if related_expeditions:
                answer_parts.append(related_expeditions)

            relevant_research = []
            for details in research_records:
                title = _clean_text(details["title"])
                record_kind = (
                    "expedition"
                    if details["source_type"].lower() == "expeditions"
                    else "document"
                )
                areas = _research_areas(details)
                objective = _objective_phrase(details["objectives"])
                summary = _clean_text(
                    details["abstract"]
                    or details["description"]
                    or details["findings"]
                ).rstrip(".")
                evidence = []
                if areas:
                    evidence.append(
                        "Research areas: " + _join_naturally(areas)
                    )
                if objective:
                    evidence.append("Objective: " + objective)
                elif summary:
                    evidence.append(summary)
                if evidence:
                    relevant_research.append(
                        f"{title} ({record_kind} record) — "
                        f"{'; '.join(evidence)}"
                    )

            research_section = _bullet_section(
                "Relevant research in retrieved records",
                relevant_research[:3],
            )
            if research_section:
                answer_parts.append(research_section)
            elif not station_areas and not related_expeditions:
                answer_parts.append(
                    "This information is not available in the POLAR knowledge repository."
                )

    # =========================================================
    # DOCUMENT OR DATASET QUESTION
    # =========================================================

    elif _is_document_query(query, relevant_results):

        document_records = [
            get_source_details(result)
            for result in relevant_results
            if get_source_details(result)["source_type"].lower()
            == "documents"
        ]
        answer_parts = [
            _format_document_answer(details)
            for details in document_records[:3]
        ]

        if not answer_parts:
            answer_parts.append(
                "This information is not available in the POLAR knowledge repository."
            )

    # =========================================================
    # SPECIFIC TOPIC
    # =========================================================

    elif requested_specific_topic:

        station_record = None

        research_records = []

        for result in relevant_results:

            details = get_source_details(
                result
            )

            text = result.get(
                "content",
                ""
            ).lower()

            if (
                requested_specific_topic
                in text
            ):

                if (
                    "station"
                    in details[
                        "title"
                    ].lower()
                    or details[
                        "source_type"
                    ]
                    == "stations"
                ):

                    station_record = (
                        details
                    )

                else:

                    research_records.append(
                        details
                    )

        # -----------------------------------------------------
        # Station overview
        # -----------------------------------------------------

        if station_record:

            overview = (
                station_record[
                    "description"
                ]
                or station_record[
                    "abstract"
                ]
                or station_record[
                    "research_areas"
                ]
            )

            if overview:

                answer_parts.append(
                    overview
                )

        # -----------------------------------------------------
        # Research records
        # -----------------------------------------------------

        for details in research_records[:3]:

            research_text = (
                details[
                    "abstract"
                ]
                or details[
                    "description"
                ]
                or details[
                    "findings"
                ]
                or details[
                    "objectives"
                ]
                or details[
                    "research_areas"
                ]
            )

            if research_text:

                answer_parts.append(
                    f"{details['title']}: "
                    f"{research_text}"
                )

    # =========================================================
    # GENERAL QUESTION
    # =========================================================

    else:

        for result in relevant_results[:4]:

            details = get_source_details(
                result
            )

            text = (
                details[
                    "abstract"
                ]
                or details[
                    "description"
                ]
                or details[
                    "findings"
                ]
                or details[
                    "objectives"
                ]
                or details[
                    "research_areas"
                ]
            )

            if text:

                answer_parts.append(
                    f"{details['title']}: "
                    f"{text}"
                )

    # =========================================================
    # REMOVE DUPLICATES
    # =========================================================

    cleaned_parts = []

    seen_text = set()

    for part in answer_parts:

        normalized = (
            part.strip().lower()
        )

        if (
            normalized
            and normalized
            not in seen_text
        ):

            seen_text.add(
                normalized
            )

            cleaned_parts.append(
                _clean_text(part)
            )

    # =========================================================
    # FINAL ANSWER TEXT
    # =========================================================

    answer = "\n\n".join(cleaned_parts)

    if not answer:
        answer = (
            "This information is not available in the POLAR knowledge repository."
        )

    # =========================================================
    # BUILD CITATIONS
    # =========================================================

    sources = []

    seen_titles = set()

    for result in relevant_results:

        details = get_source_details(
            result
        )

        title = (
            details["title"]
            .strip()
        )

        if not title:
            continue

        normalized_title = (
            title.lower()
        )

        if (
            normalized_title
            in seen_titles
        ):
            continue

        seen_titles.add(
            normalized_title
        )

        excerpt = (
            details["abstract"]
            or details["description"]
            or details["findings"]
            or details["objectives"]
            or details["research_areas"]
            or ""
        )

        sources.append(
            {
                "title": title,

                "year": details[
                    "fields"
                ].get(
                    "Year",
                    details[
                        "metadata"
                    ].get(
                        "year",
                        "",
                    ),
                ),

                "institution": details[
                    "fields"
                ].get(
                    "Institution",
                    details[
                        "fields"
                    ].get(
                        "Institutions",
                        "",
                    ),
                ),

                "type": details[
                    "fields"
                ].get(
                    "Type",
                    "",
                ),

                "source_type": details[
                    "source_type"
                ],

                "excerpt": excerpt,
            }
        )

    # =========================================================
    # FINAL RETURN
    # =========================================================

    return {
        "answer": answer,
        "sources": sources,
    }


# =============================================================
# POLAR AI API
# =============================================================

@app.get("/api/ask")
def ask_polar(query: str):
    expedition_numbers = re.findall(
        r"\b\d+(?:st|nd|rd|th)\b",
        query.lower(),
    )
    is_comparison = (
        len(expedition_numbers) >= 2
        and any(
            term in query.lower()
            for term in ("compare", "comparison", "versus", " vs ")
        )
    )

    results = search_knowledge(
        query,
        top_k=None if is_comparison else 10,
    )

    generated = generate_answer(
        query,
        results,
    )
    response_results = results
    if is_comparison:
        source_titles = {
            source["title"].strip().lower()
            for source in generated["sources"]
        }
        response_results = [
            result
            for result in results
            if get_source_details(result)["title"].strip().lower()
            in source_titles
        ]

    return {
        "query": query,
        "answer": generated[
            "answer"
        ],
        "sources": generated[
            "sources"
        ],
        "results": response_results,
    }