
import re
from functools import lru_cache
from typing import Any

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Starting threshold only; not a validated universal cutoff.
DEFAULT_THRESHOLD = 0.40

# Maximum evidence snippets to return for each requirement.
MAX_EVIDENCE_PER_REQUIREMENT = 2

# Small ranking penalty when evidence is reused for another skill.
REUSED_EVIDENCE_PENALTY = 0.04


@lru_cache(maxsize=1)
def load_model() -> SentenceTransformer:
    """Load the embedding model once and reuse it."""
    return SentenceTransformer(MODEL_NAME)



def split_into_segments(text: str) -> list[str]:
    """Split resume text into unique, readable lines and sentences."""
    if not text or not text.strip():
        return []

    # Split at line breaks first, then at sentence boundaries.
    lines = re.split(r"[\r\n]+", text)
    segments = []
    seen = set()

    for line in lines:
        sentences = re.split(r"(?<=[.!?])\s+", line)

        for sentence in sentences:
            cleaned = re.sub(r"\s+", " ", sentence).strip()
            key = cleaned.casefold()

            if cleaned and key not in seen:
                segments.append(cleaned)
                seen.add(key)

    return segments


def _requirement_text(
    requirement: Any,
) -> tuple[str, str]:
    """Accept a skill string or a dictionary with context."""
    if isinstance(requirement, str):
        label = requirement.strip()
        return label, label

    if isinstance(requirement, dict):
        label = str(
            requirement.get("skill")
            or requirement.get("name")
            or requirement.get("requirement")
            or ""
        ).strip()

        description = str(
            requirement.get("description")
            or requirement.get("context")
            or label
        ).strip()

        if not label:
            label = description

        if not description:
            description = label

        return label, description

    return "", ""


def find_semantic_matches(
    resume_text: str,
    required_skills: list,
    threshold: float = DEFAULT_THRESHOLD,
) -> list[dict]:
    """
    Find resume sentences potentially related to requirements.

    Similarity indicates textual relevance, not verified skill
    ownership, proficiency, or professional experience.
    """
    segments = split_into_segments(resume_text)

    requirements = []
    seen_requirements = set()

    for item in required_skills:
        label, description = _requirement_text(item)

        if not label or not description:
            continue

        key = label.casefold()

        if key in seen_requirements:
            continue

        requirements.append({
            "skill": label,
            "description": description,
        })
        seen_requirements.add(key)

    if not segments or not requirements:
        return []

    model = load_model()

    resume_embeddings = model.encode(
        segments,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    requirement_embeddings = model.encode(
        [item["description"] for item in requirements],
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    similarity_matrix = cos_sim(
        requirement_embeddings,
        resume_embeddings,
    )

    # Process requirements with stronger initial evidence first.
    requirement_order = sorted(
        range(len(requirements)),
        key=lambda index: float(
            similarity_matrix[index].max().item()
        ),
        reverse=True,
    )

    # Track how often each resume sentence is selected as primary evidence.
    evidence_usage: dict[int, int] = {}
    results = []

    for requirement_index in requirement_order:
        requirement = requirements[requirement_index]
        scores = similarity_matrix[requirement_index]

        # Rank by similarity, applying a penalty to previously used evidence.
        ranked_indices = sorted(
            range(len(segments)),
            key=lambda segment_index: (
                float(scores[segment_index].item())
                - REUSED_EVIDENCE_PENALTY
                * evidence_usage.get(segment_index, 0)
            ),
            reverse=True,
        )

        evidence_items = []
        selected_indices = []

        for segment_index in ranked_indices:
            raw_score = float(scores[segment_index].item())

            # Threshold always uses the original cosine similarity.
            if raw_score < threshold:
                continue

            evidence_items.append({
                "evidence": segments[segment_index],
                "similarity": round(raw_score, 3),
            })
            selected_indices.append(segment_index)

            if len(evidence_items) >= MAX_EVIDENCE_PER_REQUIREMENT:
                break

        if not evidence_items:
            continue

        # Record only the primary evidence for future ranking.
        primary_index = selected_indices[0]
        evidence_usage[primary_index] = (
            evidence_usage.get(primary_index, 0) + 1
        )

        results.append({
            "skill": requirement["skill"],
            "evidence": evidence_items[0]["evidence"],
            "similarity": evidence_items[0]["similarity"],
            "status": "potential_semantic_match",
            "additional_evidence": evidence_items[1:],
            "description_compared": requirement["description"],
        })

    # Preserve the input requirement order in the API response.
    requirement_positions = {
        item["skill"]: index
        for index, item in enumerate(requirements)
    }

    results.sort(
        key=lambda item: requirement_positions[item["skill"]]
    )

    return results
