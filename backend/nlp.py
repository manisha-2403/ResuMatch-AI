
import re
from typing import Any
import os

if os.getenv("ENABLE_SEMANTIC_MATCHING", "false").lower() == "true":
    from semantic_matcher import find_semantic_matches
else:
    find_semantic_matches = None


# Canonical skill name: alternative terms used in resumes and job descriptions.
SKILL_LIBRARY = {
    # Programming languages
    "python": ["python"],
    "java": ["java"],
    "c": ["c programming", "c language"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "c sharp"],
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "go": ["golang", "go language"],
    "php": ["php"],
    "r programming": ["r programming", "r language"],
    "kotlin": ["kotlin"],
    "swift": ["swift programming"],

    # Data and databases
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "sqlite": ["sqlite"],
    "mongodb": ["mongodb", "mongo db"],
    "redis": ["redis"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "data analysis": ["data analysis", "data analytics"],
    "data cleaning": ["data cleaning", "data preprocessing"],
    "data visualization": ["data visualization", "data visualisation"],
    "statistics": ["statistics", "statistical analysis"],
    "power bi": ["power bi"],
    "tableau": ["tableau"],
    "excel": ["microsoft excel", "excel"],

    # AI and machine learning
    "artificial intelligence": ["artificial intelligence"],
    "machine learning": ["machine learning"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "deep learning": ["deep learning"],
    "natural language processing": ["natural language processing", "nlp"],
    "computer vision": ["computer vision", "opencv"],
    "generative ai": ["generative ai", "genai"],
    "large language models": [
        "large language model",
        "large language models",
        "llm",
        "llms",
    ],
    "prompt engineering": ["prompt engineering", "prompt design"],
    "retrieval augmented generation": [
        "retrieval augmented generation",
        "rag",
    ],
    "langchain": ["langchain"],
    "llamaindex": ["llamaindex", "llama index"],
    "pytorch": ["pytorch"],
    "tensorflow": ["tensorflow"],
    "keras": ["keras"],
    "model evaluation": ["model evaluation", "model validation"],
    "feature engineering": ["feature engineering"],

    # Backend, APIs and web
    "fastapi": ["fastapi"],
    "flask": ["flask"],
    "django": ["django"],
    "rest api": ["rest api", "restful api"],
    "api development": ["api development", "api integration"],
    "html": ["html"],
    "css": ["css"],
    "react": ["react", "react.js"],
    "node.js": ["node.js", "nodejs"],
    "express.js": ["express.js", "expressjs"],
    "responsive design": ["responsive design", "responsive web design"],
    "web accessibility": ["web accessibility", "wcag"],

    # Software engineering and testing
    "git": ["git"],
    "github": ["github"],
    "unit testing": ["unit testing", "unit tests"],
    "integration testing": ["integration testing"],
    "software testing": ["software testing", "software quality assurance"],
    "debugging": ["debugging", "debug"],
    "code review": ["code review", "code reviews"],
    "data structures": ["data structures"],
    "algorithms": ["algorithms", "algorithm design"],
    "object oriented programming": ["object oriented programming", "oop"],
    "software development": ["software development"],
    "technical documentation": ["technical documentation", "technical writing"],
    "problem solving": ["problem solving", "problem-solving"],

    # Cloud, deployment and DevOps
    "cloud computing": ["cloud computing"],
    "aws": ["amazon web services", "aws"],
    "azure": ["microsoft azure", "azure"],
    "google cloud": ["google cloud", "gcp"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "ci/cd": ["ci/cd", "continuous integration", "continuous delivery"],
    "vercel": ["vercel"],
    "render": ["render.com"],
    "linux": ["linux"],
    "networking": ["computer networking", "networking"],

    # Cybersecurity
    "cybersecurity": ["cybersecurity", "cyber security"],
    "penetration testing": ["penetration testing", "pentesting"],
    "network security": ["network security"],
    "owasp": ["owasp"],

    # IoT and embedded systems
    "internet of things": ["internet of things", "iot"],
    "embedded systems": ["embedded systems", "embedded software"],
    "arduino": ["arduino"],
    "raspberry pi": ["raspberry pi"],
    "mqtt": ["mqtt"],
    "blockchain": ["blockchain"],
    "solidity": ["solidity"],
}


SKILL_CATEGORIES = {
    "Programming": [
        "python", "java", "c", "c++", "c#", "javascript",
        "typescript", "go", "php", "r programming", "kotlin", "swift",
    ],
    "AI & Machine Learning": [
        "artificial intelligence", "machine learning", "deep learning",
        "natural language processing", "computer vision", "generative ai",
        "large language models", "prompt engineering",
        "retrieval augmented generation", "langchain", "llamaindex",
        "pytorch", "tensorflow", "keras", "model evaluation",
        "feature engineering", "scikit-learn",
    ],
    "Data & Databases": [
        "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis",
        "pandas", "numpy", "data analysis", "data cleaning",
        "data visualization", "statistics", "power bi", "tableau", "excel",
    ],
    "Web & APIs": [
        "fastapi", "flask", "django", "rest api", "api development",
        "html", "css", "react", "node.js", "express.js",
        "responsive design", "web accessibility",
    ],
    "Software Engineering & QA": [
        "git", "github", "unit testing", "integration testing",
        "software testing", "debugging", "code review",
        "data structures", "algorithms", "object oriented programming",
        "software development", "technical documentation", "problem solving",
    ],
    "Cloud & DevOps": [
        "cloud computing", "aws", "azure", "google cloud", "docker",
        "kubernetes", "ci/cd", "vercel", "render", "linux", "networking",
    ],
    "Security": [
        "cybersecurity", "penetration testing", "network security", "owasp",
    ],
    "IoT & Emerging Technology": [
        "internet of things", "embedded systems", "arduino",
        "raspberry pi", "mqtt", "blockchain", "solidity",
    ],
}


# Recognized resume section headings.


# Resume section headings and their common variations.
SECTION_ALIASES = {
    "summary": [
        "summary",
        "professional summary",
        "profile",
        "professional profile",
        "career objective",
        "objective",
        "about me",
    ],
    "skills": [
        "skills",
        "skill",
        "technical skills",
        "technical skill",
        "core skills",
        "key skills",
        "technical competencies",
        "technologies",
        "technical expertise",
    ],
    "soft_skills": [
        "soft skills",
        "soft skill",
        "personal skills",
        "interpersonal skills",
        "professional skills",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "work history",
        "internship experience",
        "internships",
    ],
    "projects": [
        "project",
        "projects",
        "academic project",
        "academic projects",
        "personal project",
        "personal projects",
        "technical project",
        "technical projects",
        "project experience",
        "key projects",
    ],
    "education": [
        "education",
        "educational qualifications",
        "academic qualifications",
        "academic background",
        "qualification",
        "qualifications",
    ],
    "certifications": [
        "certification",
        "certifications",
        "certificates",
        "licenses and certifications",
        "courses and certifications",
        "courses",
    ],
    "achievements": [
        "achievements",
        "accomplishments",
        "awards",
        "honors",
        "honours",
    ],
    "contact": [
        "contact",
        "contact information",
        "personal details",
    ],
    "languages": [
        "languages",
        "language proficiency",
    ],
}


def _normalize_heading(line: str) -> str:
    """Normalize a possible heading before matching it."""
    heading = line.strip().lower()

    # Remove common bullets and decorative separators at the edges.
    heading = re.sub(r"^[\s•*|_\-=–—#]+", "", heading)
    heading = re.sub(r"[\s•*|_\-=–—#:]+$", "", heading)

    # Normalize repeated whitespace.
    heading = re.sub(r"\s+", " ", heading).strip()

    return heading


def identify_section_heading(line: str):
    """
    Return the section key when a line matches a known resume heading.
    Return None when the line is ordinary resume content.
    """
    normalized_line = _normalize_heading(line)

    if not normalized_line:
        return None

    for section_name, aliases in SECTION_ALIASES.items():
        for alias in aliases:
            if normalized_line == _normalize_heading(alias):
                return section_name

    return None


def extract_resume_sections(text: str) -> dict:
    """
    Divide resume text into named sections.

    Text appearing beneath a recognized heading belongs to that section
    until another recognized heading is encountered.
    """
    sections = {
        "unclassified": "",
        "summary": "",
        "skills": "",
        "soft_skills": "",
        "experience": "",
        "projects": "",
        "education": "",
        "certifications": "",
        "achievements": "",
        "contact": "",
        "languages": "",
    }

    current_section = "unclassified"
    recognized_headings = []

    for original_line in text.splitlines():
        line = original_line.strip()

        if not line:
            continue

        heading = identify_section_heading(line)

        if heading is not None:
            current_section = heading

            if line not in recognized_headings:
                recognized_headings.append(line)

            continue

        sections[current_section] += (
            line + "\n"
        )

    # Remove excess whitespace at the beginning and end of each section.
    sections = {
        name: content.strip()
        for name, content in sections.items()
    }

    skills_text = sections["skills"]

    return {
        "sections": sections,
        "skills_text": skills_text,
        "skills_section_found": bool(skills_text),
        "recognized_headings": recognized_headings,
    }


def normalize_text(text: str) -> str:
    """Normalize whitespace and case while preserving useful symbols."""
    return re.sub(r"\s+", " ", text.lower()).strip()


def contains_term(text: str, term: str) -> bool:
    """Match a term without matching it inside unrelated words."""
    normalized_term = term.lower().strip()

    # Treat a hyphenated phrase as equivalent to a space-separated phrase.
    escaped_term = re.escape(normalized_term).replace(r"\ ", r"\s+")

    pattern = r"(?<!\w)" + escaped_term + r"(?!\w)"
    return re.search(pattern, text.lower()) is not None


def find_skills(text: str) -> list[str]:
    """Return canonical skills recognized in the supplied text."""
    normalized = normalize_text(text)
    found = []

    for skill, aliases in SKILL_LIBRARY.items():
        if any(contains_term(normalized, alias) for alias in aliases):
            found.append(skill)

    return sorted(set(found))


def normalize_heading(line: str) -> str:
    """Normalize a possible section heading."""
    cleaned = line.strip().lower()
    cleaned = re.sub(r"^[\s•*\-–—]+", "", cleaned)
    cleaned = re.sub(r"[\s:|]+$", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned



def identify_section_heading(line: str) -> str | None:
    """Recognize standard resume section headings."""
    heading = line.strip().lower()

    # Remove common decorative divider characters around headings.
    heading = re.sub(r"^[\s•*|_\-=–—]+", "", heading)
    heading = re.sub(r"[\s:|_\-=–—]+$", "", heading)
    heading = re.sub(r"\s+", " ", heading).strip()

    if not heading or len(heading) > 60:
        return None

    for section_key, aliases in SECTION_ALIASES.items():
        if heading in aliases:
            return section_key

    return None


def extract_resume_sections(resume_text: str) -> dict[str, Any]:
    """
    Divide resume text into recognizable sections.

    Text before the first recognized heading is stored as 'unclassified'.
    Unrecognized headings do not automatically create new sections.
    """
    sections: dict[str, list[str]] = {"unclassified": []}
    current_section = "unclassified"
    recognized_headings: list[str] = []

    for line in resume_text.splitlines():
        heading_key = identify_section_heading(line)

        if heading_key:
            current_section = heading_key
            sections.setdefault(current_section, [])
            recognized_headings.append(line.strip())
        else:
            sections.setdefault(current_section, []).append(line)

    cleaned_sections = {
        key: "\n".join(lines).strip()
        for key, lines in sections.items()
    }

    skills_text = cleaned_sections.get("skills", "")

    return {
        "sections": cleaned_sections,
        "skills_text": skills_text,
        "skills_section_found": bool(skills_text.strip()),
        "recognized_headings": recognized_headings,
    }


def find_skill_evidence(text: str, skills: list[str]) -> dict[str, list[str]]:
    """Find lines or sentences that provide textual evidence for each skill."""
    evidence: dict[str, list[str]] = {}

    segments = re.split(r"[\r\n]+|(?<=[.!?])\s+", text)

    for skill in skills:
        aliases = SKILL_LIBRARY.get(skill, [skill])
        matches: list[str] = []

        for segment in segments:
            cleaned = segment.strip()

            if cleaned and any(
                contains_term(normalize_text(cleaned), alias)
                for alias in aliases
            ):
                if cleaned not in matches:
                    matches.append(cleaned)

        if matches:
            evidence[skill] = matches[:3]

    return evidence


def categorize_skills(skills: list[str]) -> dict[str, list[str]]:
    """Group recognized skills into categories."""
    result: dict[str, list[str]] = {}

    for category, category_skills in SKILL_CATEGORIES.items():
        selected = sorted(set(skills) & set(category_skills))
        if selected:
            result[category] = selected

    return result


def build_requirement_context(job_description: str, skill: str) -> str:
    """Return relevant job-description context for one skill."""
    segments = [
        segment.strip()
        for segment in re.split(r"[\r\n]+|(?<=[.!?])\s+", job_description)
        if segment.strip()
    ]

    aliases = SKILL_LIBRARY.get(skill, [skill])

    matching_indexes = [
        index
        for index, segment in enumerate(segments)
        if any(
            contains_term(normalize_text(segment), alias)
            for alias in aliases
        )
    ]

    if not matching_indexes:
        return skill

    selected_indexes: set[int] = set()

    for index in matching_indexes:
        selected_indexes.add(index)

        # Add adjacent context if the matching sentence is short.
        if len(segments[index]) < 140 and index + 1 < len(segments):
            selected_indexes.add(index + 1)

    return " ".join(segments[index] for index in sorted(selected_indexes))


def analyze_match(resume_text: str, job_description: str) -> dict[str, Any]:
    """
    Compare job-description skills against the resume's explicit Skills section.

    Project and experience mentions are reported separately as supporting
    evidence. They do not automatically count as Skills-section matches.

    The match score is a keyword-coverage estimate, not a validated ATS score.
    """
    extracted = extract_resume_sections(resume_text)
    sections = extracted["sections"]
    skills_text = extracted["skills_text"]
    skills_section_found = extracted["skills_section_found"]

    # Important: primary skills are detected ONLY in the explicit Skills section.
    resume_skills = find_skills(skills_text) if skills_section_found else []

    # Requirements are detected throughout the job description.
    required_skills = find_skills(job_description)

    resume_set = set(resume_skills)
    required_set = set(required_skills)

    matched = sorted(resume_set & required_set)
    missing = sorted(required_set - resume_set)

    if required_skills:
        score = round(len(matched) / len(required_skills) * 100)
        score_status = "calculated"
        message = (
            "This score measures recognized job-description skills found "
            "in the resume's Skills section. It is not an official ATS score."
        )
    else:
        score = None
        score_status = "insufficient_recognized_skills"
        message = (
            "We could not recognize supported skills in the job description. "
            "Try including more specific technical skills or responsibilities."
        )

    # Collect separate evidence from Projects and Experience.
    supporting_text_parts = []

    for section_name in ("projects", "experience"):
        section_text = sections.get(section_name, "")
        if section_text.strip():
            supporting_text_parts.append(section_text)

    supporting_text = "\n".join(supporting_text_parts)
    supporting_evidence_skills = find_skills(supporting_text)

    # Keep semantic matching on the full resume so potentially relevant
    # experience can be suggested without treating it as a Skills-section match.
    semantic_requirements = [
        {
            "skill": skill,
            "description": build_requirement_context(job_description, skill),
        }
        for skill in missing
    ]
    semantic_candidates = []

    if find_semantic_matches is not None:
        semantic_candidates = find_semantic_matches(
            resume_text=supporting_text,
            required_skills=semantic_requirements,
        )


    suggestions = []

    if not skills_section_found:
        suggestions.append(
            "Add a clearly labelled Skills or Technical Skills section. "
            "List only skills you can genuinely demonstrate."
        )

    if missing:
        suggestions.append(
            "Review the missing job-description keywords. Add a keyword "
            "to your Skills section only if you genuinely possess that skill."
        )

    if not supporting_text.strip():
        suggestions.append(
            "Use clearly labelled Projects and Experience sections to show "
            "where you applied your skills, if you have relevant evidence."
        )

    return {
        "match_score": score,
        "score_status": score_status,
        "analysis_message": message,
        "semantic_candidates": semantic_candidates,

        # Existing response keys retained for frontend compatibility.
        "resume_skills": resume_skills,
        "resume_skill_evidence": find_skill_evidence(skills_text, resume_skills),
        "required_skills": required_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "matched_count": len(matched),
        "required_count": len(required_skills),
        "resume_skill_categories": categorize_skills(resume_skills),
        "required_skill_categories": categorize_skills(required_skills),
        "matched_skill_categories": categorize_skills(matched),
        "score_method": (
            "Percentage of recognized job-description skills also listed "
            "in the resume's explicit Skills section. This is not a validated "
            "or official ATS score."
        ),

        # New fields for the future results and improvement UI.
        "skills_section_found": skills_section_found,
        "resume_skills_section": skills_text,
        "supporting_evidence_skills": supporting_evidence_skills,
        "supporting_evidence": find_skill_evidence(
            supporting_text, supporting_evidence_skills
        ),
        "suggestions": suggestions,
    }
