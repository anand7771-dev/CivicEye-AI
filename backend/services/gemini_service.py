import os
import json
import httpx
from typing import Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
MODEL = "gemini-1.5-flash"


async def call_gemini(prompt: str, image_base64: Optional[str] = None, mime_type: str = "image/jpeg") -> str:
    """Call Gemini API with optional image."""
    parts = []
    if image_base64:
        parts.append({"inline_data": {"mime_type": mime_type, "data": image_base64}})
    parts.append({"text": prompt})

    payload = {
        "contents": [{"role": "user", "parts": parts}],
        "generation_config": {"temperature": 0.3, "max_output_tokens": 2048},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GEMINI_BASE_URL}/models/{MODEL}:generateContent?key={GEMINI_API_KEY}",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def analyze_issue_image(image_base64: str, mime_type: str, description: str = "") -> dict:
    """Analyze a civic issue image with Gemini Vision."""
    prompt = f"""You are CivicEye AI, an expert civic issue analyst. Analyze this image of a civic/community issue.
{f'User description: "{description}"' if description else ''}

Respond with ONLY a valid JSON object (no markdown):
{{
  "category": "one of: pothole|garbage|water_leakage|broken_streetlight|road_damage|drainage|public_safety|emergency",
  "severity": "one of: low|medium|high|critical",
  "title": "short descriptive title (max 10 words)",
  "summary": "2-3 sentence summary",
  "actionSteps": ["step 1", "step 2", "step 3"],
  "priorityScore": <integer 1-100>,
  "safetyRisk": <integer 1-10>,
  "populationImpact": <integer 1-10>,
  "confidence": <float 0-1>
}}"""

    raw = await call_gemini(prompt, image_base64, mime_type)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


async def generate_priority_score(title: str, description: str, category: str,
                                   severity: str, location: str, duplicate_count: int) -> dict:
    """Generate Civic Priority Score via Gemini."""
    prompt = f"""Calculate a Civic Priority Score (1-100) for this issue:
Category: {category}, Severity: {severity}, Location: {location}
Description: {description}
Duplicate reports: {duplicate_count}

Respond with ONLY JSON: {{"priorityScore": <integer>, "reasoning": "one sentence"}}"""

    raw = await call_gemini(prompt)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


async def detect_duplicates(new_issue: dict, existing_issues: list) -> dict:
    """Detect duplicate issues using Gemini."""
    if not existing_issues:
        return {"isDuplicate": False, "message": "No existing issues"}

    existing_str = "\n".join([
        f"{i+1}. ID:{iss.get('id')} | {iss.get('title')} | {iss.get('category')} | {iss.get('location')}"
        for i, iss in enumerate(existing_issues[:10])
    ])

    prompt = f"""Check if this new report is a duplicate of existing issues:

NEW: Title: {new_issue.get('title')}, Category: {new_issue.get('category')}, Location: {new_issue.get('location')}

EXISTING:
{existing_str}

Respond ONLY JSON:
{{"isDuplicate": <boolean>, "similarIssueId": "<id or null>", "similarIssueTitle": "<title or null>", "similarity": <float 0-1 or null>, "message": "brief explanation"}}"""

    raw = await call_gemini(prompt)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


CIVIC_SYSTEM_PROMPT = """You are CivicEye Assistant, an AI civic helpdesk for CivicEye AI platform.
Help citizens report issues, provide emergency guidance, explain the platform, suggest emergency services.
Keep responses under 200 words. For emergencies, always mention: call 112."""


async def chat(message: str, history: list) -> str:
    """Chat with Gemini as CivicEye Assistant."""
    contents = []
    for msg in history[-10:]:
        contents.append({
            "role": "user" if msg.get("role") == "user" else "model",
            "parts": [{"text": msg.get("content", "")}]
        })
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "contents": contents,
        "system_instruction": {"parts": [{"text": CIVIC_SYSTEM_PROMPT}]},
        "generation_config": {"temperature": 0.5, "max_output_tokens": 512},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GEMINI_BASE_URL}/models/{MODEL}:generateContent?key={GEMINI_API_KEY}",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
