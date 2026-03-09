# backend/models/llava_model.py
# ═══════════════════════════════════════════════════════════════
# MedCare AI — Google Gemini Vision API (Free Tier)
# Syed Hassan Tayyab — Atomcamp 2026
# Free: 1500 req/day | 15 RPM | No credit card needed
# ═══════════════════════════════════════════════════════════════

import os
import base64
import logging
import re
import asyncio
import uuid
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────
GEMINI_API_KEY  = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL    = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_URL  = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

MAX_IMAGE_BYTES = 20 * 1024 * 1024   # 20 MB
MAX_RETRIES     = 3
RETRY_BACKOFF   = [1, 3, 6]
REQUEST_TIMEOUT = 60

# ── System prompt ─────────────────────────────────────────────
SYSTEM_PROMPT = (
    "You are a board-certified medical imaging specialist with 20 years of experience. "
    "Provide your analysis in a clear, structured format. "
    "Always specify Severity as exactly one of: Normal, Mild, Moderate, or Severe. "
    "Always include a Confidence percentage (e.g., Confidence: 85%). "
    "Provide an Urdu summary at the end under the heading 'اردو خلاصہ'."
)

# ── Scan-specific prompts ─────────────────────────────────────
SCAN_PROMPTS = {
    "xray": (
        "Analyze this X-ray image as an experienced radiologist. Provide:\n"
        "1. **Key Findings** — describe all visible abnormalities\n"
        "2. **Diagnosis** — primary and differential\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations** — next steps for the patient\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "ecg": (
        "Analyze this ECG strip as a cardiologist. Provide:\n"
        "1. **Rhythm & Rate** — sinus rhythm, rate, axis\n"
        "2. **Key Abnormalities** — ST changes, arrhythmias, blocks\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Clinical Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "blood-test": (
        "Analyze this blood test report as a pathologist. Provide:\n"
        "1. **Abnormal Values** — list out-of-range markers\n"
        "2. **Possible Conditions** — differential diagnosis\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations** — further tests or treatment\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "bone": (
        "Analyze this bone scan as an orthopedic radiologist. Provide:\n"
        "1. **Key Findings** — fractures, lesions, deformities\n"
        "2. **Diagnosis**\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "skin": (
        "Analyze this skin image as a dermatologist. Provide:\n"
        "1. **Visible Conditions** — lesion description (ABCDE criteria if applicable)\n"
        "2. **Differential Diagnosis**\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "mri": (
        "Analyze this MRI scan as a neuroradiologist. Provide:\n"
        "1. **Key Findings** — lesions, masses, signal changes\n"
        "2. **Diagnosis**\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
}

DEFAULT_PROMPT = (
    "Analyze this medical image and provide findings, diagnosis, "
    "severity (Normal/Mild/Moderate/Severe), confidence percentage, "
    "and recommendations. Include an Urdu summary at the end."
)


# ═══════════════════════════════════════════════════════════════
# Parsing helpers
# ═══════════════════════════════════════════════════════════════

def _parse_severity(text: str) -> str:
    t = text.lower()
    for level in ["severe", "moderate", "mild", "normal"]:
        if level in t:
            return level.capitalize()
    return "Normal"


def _parse_confidence(text: str) -> float:
    match = re.search(r"[Cc]onfidence[:\s]*(\d{1,3})\s*%", text)
    if match:
        return min(float(match.group(1)), 99.0)
    match = re.search(r"(\d{1,3})\s*%", text)
    if match:
        return min(float(match.group(1)), 99.0)
    return round(min(75.0 + len(text) / 80, 95.0), 1)


def _parse_urdu(text: str) -> str:
    for marker in ["اردو خلاصہ", "اردو"]:
        if marker in text:
            part = text.split(marker, 1)[-1]
            lines = part.strip().lstrip(":").lstrip("*").lstrip("#").strip().split("\n")
            urdu_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped.startswith("#") and urdu_lines:
                    break
                if stripped:
                    urdu_lines.append(stripped)
            if urdu_lines:
                return "\n".join(urdu_lines)
    return ""


# ═══════════════════════════════════════════════════════════════
# Core API call with retry
# ═══════════════════════════════════════════════════════════════

async def _call_gemini_api(payload: dict, request_id: str) -> dict:
    url = GEMINI_API_URL.format(model=GEMINI_MODEL)
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                resp = await client.post(
                    url,
                    params={"key": GEMINI_API_KEY},
                    headers={"Content-Type": "application/json"},
                    json=payload,
                )

            if resp.status_code == 429:
                wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                logger.warning(f"[{request_id}] Rate-limited (429). Retrying in {wait}s…")
                await asyncio.sleep(wait)
                continue

            if resp.status_code >= 500:
                wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                logger.warning(f"[{request_id}] Server error {resp.status_code}. Retrying in {wait}s…")
                await asyncio.sleep(wait)
                continue

            resp.raise_for_status()
            return resp.json()

        except httpx.TimeoutException:
            last_error = "Request timed out"
            logger.warning(f"[{request_id}] Timeout. Retrying… (attempt {attempt+1}/{MAX_RETRIES})")
            await asyncio.sleep(RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)])
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Gemini API error {e.response.status_code}: {e.response.text}") from e
        except httpx.RequestError as e:
            last_error = str(e)
            logger.warning(f"[{request_id}] Network error: {e}. Retrying…")
            await asyncio.sleep(RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)])

    raise RuntimeError(f"Gemini API failed after {MAX_RETRIES} retries. Last error: {last_error}")


# ═══════════════════════════════════════════════════════════════
# Public API — called from imaging.py
# ═══════════════════════════════════════════════════════════════

async def analyze_medical_image(image_bytes: bytes, scan_type: str) -> dict:
    """
    Send a medical image to Google Gemini Vision API and return structured results.
    Required env var: GEMINI_API_KEY
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image too large ({len(image_bytes) // (1024*1024)} MB). Max: {MAX_IMAGE_BYTES // (1024*1024)} MB.")

    request_id = uuid.uuid4().hex[:8]
    prompt     = SCAN_PROMPTS.get(scan_type, DEFAULT_PROMPT)
    image_b64  = base64.b64encode(image_bytes).decode("utf-8")

    # Detect MIME type from magic bytes
    mime_type = "image/jpeg"
    if image_bytes[:4] == b"\x89PNG":
        mime_type = "image/png"
    elif image_bytes[:4] in (b"GIF8",):
        mime_type = "image/gif"
    elif image_bytes[:4] == b"RIFF":
        mime_type = "image/webp"

    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image_b64,
                    }
                },
            ]
        }],
        "generationConfig": {
            "maxOutputTokens": 1024,
            "temperature": 0.2,
            "topP": 0.9,
        },
    }

    logger.info(f"[{request_id}] 📡 Gemini request — model={GEMINI_MODEL}, scan={scan_type}, img={len(image_bytes)//1024}KB")

    data        = await _call_gemini_api(payload, request_id)
    report_text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
        .strip()
    )

    if not report_text:
        raise RuntimeError(f"[{request_id}] Empty response from Gemini API")

    severity    = _parse_severity(report_text)
    confidence  = _parse_confidence(report_text)
    report_urdu = _parse_urdu(report_text)

    usage = data.get("usageMetadata", {})
    logger.info(
        f"[{request_id}] ✅ Response — severity={severity}, confidence={confidence}, "
        f"tokens_in={usage.get('promptTokenCount', '?')}, tokens_out={usage.get('candidatesTokenCount', '?')}"
    )

    return {
        "report"     : report_text,
        "report_urdu": report_urdu,
        "severity"   : severity,
        "confidence" : confidence,
    }


async def check_gemini_health() -> dict:
    """Health check — verifies Gemini API key and connectivity."""
    if not GEMINI_API_KEY:
        return {"status": "error", "detail": "GEMINI_API_KEY not set"}
    try:
        url = GEMINI_API_URL.format(model=GEMINI_MODEL)
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                url,
                params={"key": GEMINI_API_KEY},
                json={"contents": [{"parts": [{"text": "ping"}]}]},
            )
            resp.raise_for_status()
        return {"status": "healthy", "model": GEMINI_MODEL}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────
TOGETHER_API_KEY   = os.getenv("TOGETHER_API_KEY", "")
TOGETHER_API_URL   = "https://api.together.xyz/v1/chat/completions"
TOGETHER_MODEL     = os.getenv(
    "TOGETHER_MODEL",
    "meta-llama/Llama-Vision-Free"     # Free tier — switch to Turbo for paid
)

MAX_IMAGE_BYTES    = 20 * 1024 * 1024  # 20 MB hard limit
MAX_RETRIES        = 3
RETRY_BACKOFF      = [1, 3, 6]         # seconds between retries
REQUEST_TIMEOUT    = 90                # seconds

# ── System prompt (shared by all scan types) ──────────────────
SYSTEM_PROMPT = (
    "You are a board-certified medical imaging specialist with 20 years of experience. "
    "Provide your analysis in a clear, structured format. "
    "Always specify Severity as exactly one of: Normal, Mild, Moderate, or Severe. "
    "Always include a Confidence percentage (e.g., Confidence: 85%). "
    "Provide an Urdu summary at the end under the heading 'اردو خلاصہ'."
)

# ── Scan-specific prompts ─────────────────────────────────────
SCAN_PROMPTS = {
    "xray": (
        "Analyze this X-ray image as an experienced radiologist. Provide:\n"
        "1. **Key Findings** — describe all visible abnormalities\n"
        "2. **Diagnosis** — primary and differential\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations** — next steps for the patient\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "ecg": (
        "Analyze this ECG strip as a cardiologist. Provide:\n"
        "1. **Rhythm & Rate** — sinus rhythm, rate, axis\n"
        "2. **Key Abnormalities** — ST changes, arrhythmias, blocks\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Clinical Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "blood-test": (
        "Analyze this blood test report as a pathologist. Provide:\n"
        "1. **Abnormal Values** — list out-of-range markers\n"
        "2. **Possible Conditions** — differential diagnosis\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations** — further tests or treatment\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "bone": (
        "Analyze this bone scan as an orthopedic radiologist. Provide:\n"
        "1. **Key Findings** — fractures, lesions, deformities\n"
        "2. **Diagnosis**\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "skin": (
        "Analyze this skin image as a dermatologist. Provide:\n"
        "1. **Visible Conditions** — lesion description (ABCDE criteria if applicable)\n"
        "2. **Differential Diagnosis**\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
    "mri": (
        "Analyze this MRI scan as a neuroradiologist. Provide:\n"
        "1. **Key Findings** — lesions, masses, signal changes\n"
        "2. **Diagnosis**\n"
        "3. **Severity** — Normal / Mild / Moderate / Severe\n"
        "4. **Confidence** — your confidence percentage\n"
        "5. **Recommendations**\n"
        "6. **اردو خلاصہ** — brief Urdu translation of findings"
    ),
}

DEFAULT_PROMPT = (
    "Analyze this medical image and provide findings, diagnosis, "
    "severity (Normal/Mild/Moderate/Severe), confidence percentage, "
    "and recommendations. Include an Urdu summary at the end."
)


# ═══════════════════════════════════════════════════════════════
# Parsing helpers
# ═══════════════════════════════════════════════════════════════

def _parse_severity(text: str) -> str:
    t = text.lower()
    for level in ["severe", "moderate", "mild", "normal"]:
        if level in t:
            return level.capitalize()
    return "Normal"


def _parse_confidence(text: str) -> float:
    match = re.search(r"[Cc]onfidence[:\s]*(\d{1,3})\s*%", text)
    if match:
        return min(float(match.group(1)), 99.0)
    match = re.search(r"(\d{1,3})\s*%", text)
    if match:
        return min(float(match.group(1)), 99.0)
    # Heuristic based on response detail
    return round(min(75.0 + len(text) / 80, 95.0), 1)


def _parse_urdu(text: str) -> str:
    for marker in ["اردو خلاصہ", "اردو", "Urdu"]:
        if marker in text:
            part = text.split(marker, 1)[-1]
            # Take text after the marker until end or next markdown heading
            lines = part.strip().lstrip(":").lstrip("*").lstrip("#").strip().split("\n")
            urdu_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped.startswith("#") and urdu_lines:
                    break
                if stripped:
                    urdu_lines.append(stripped)
            if urdu_lines:
                return "\n".join(urdu_lines)
    return ""


# ═══════════════════════════════════════════════════════════════
# Core API call with retry
# ═══════════════════════════════════════════════════════════════

async def _call_together_api(payload: dict, request_id: str) -> dict:
    """
    POST to Together.ai with exponential backoff retry.
    Raises on exhausted retries so the caller can handle fallback.
    """
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                resp = await client.post(
                    TOGETHER_API_URL,
                    headers={
                        "Authorization": f"Bearer {TOGETHER_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )

            # Rate-limited — wait and retry
            if resp.status_code == 429:
                wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                logger.warning(f"[{request_id}] Rate-limited (429). Retrying in {wait}s… (attempt {attempt+1}/{MAX_RETRIES})")
                await asyncio.sleep(wait)
                continue

            # Server error — retry
            if resp.status_code >= 500:
                wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                logger.warning(f"[{request_id}] Server error {resp.status_code}. Retrying in {wait}s… (attempt {attempt+1}/{MAX_RETRIES})")
                await asyncio.sleep(wait)
                continue

            resp.raise_for_status()
            return resp.json()

        except httpx.TimeoutException:
            last_error = "Request timed out"
            logger.warning(f"[{request_id}] Timeout. Retrying… (attempt {attempt+1}/{MAX_RETRIES})")
            await asyncio.sleep(RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)])
        except httpx.HTTPStatusError as e:
            # Client errors (4xx except 429) should not be retried
            raise RuntimeError(f"Together.ai API error {e.response.status_code}: {e.response.text}") from e
        except httpx.RequestError as e:
            last_error = str(e)
            logger.warning(f"[{request_id}] Network error: {e}. Retrying… (attempt {attempt+1}/{MAX_RETRIES})")
            await asyncio.sleep(RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)])

    raise RuntimeError(f"Together.ai API failed after {MAX_RETRIES} retries. Last error: {last_error}")


# ═══════════════════════════════════════════════════════════════
# Public API — called from imaging.py
# ═══════════════════════════════════════════════════════════════

async def analyze_with_together(image_bytes: bytes, scan_type: str) -> dict:
    """
    Send a medical image to Together.ai Vision API and return structured results.

    Required env var: TOGETHER_API_KEY
    Optional env var: TOGETHER_MODEL (defaults to free Llama-Vision)

    Returns dict with keys: report, report_urdu, severity, confidence
    """
    if not TOGETHER_API_KEY:
        raise ValueError("TOGETHER_API_KEY environment variable is not set.")

    # ── Validate image size ──────────────────────────────────────
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image too large ({len(image_bytes) // (1024*1024)} MB). Max allowed: {MAX_IMAGE_BYTES // (1024*1024)} MB.")

    request_id = uuid.uuid4().hex[:8]
    prompt     = SCAN_PROMPTS.get(scan_type, DEFAULT_PROMPT)
    image_b64  = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "model": TOGETHER_MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}"
                        },
                    },
                ],
            },
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.9,
        "stop": ["<|eot_id|>"],
    }

    logger.info(f"[{request_id}] 📡 Together.ai request — model={TOGETHER_MODEL}, scan={scan_type}, img_size={len(image_bytes)//1024}KB")

    data       = await _call_together_api(payload, request_id)
    report_text = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )

    if not report_text:
        raise RuntimeError(f"[{request_id}] Empty response from Together.ai")

    severity    = _parse_severity(report_text)
    confidence  = _parse_confidence(report_text)
    report_urdu = _parse_urdu(report_text)

    usage = data.get("usage", {})
    logger.info(
        f"[{request_id}] ✅ Response received — severity={severity}, confidence={confidence}, "
        f"tokens_in={usage.get('prompt_tokens', '?')}, tokens_out={usage.get('completion_tokens', '?')}"
    )

    return {
        "report"     : report_text,
        "report_urdu": report_urdu,
        "severity"   : severity,
        "confidence" : confidence,
    }


async def check_together_health() -> dict:
    """Quick health-check: calls Together.ai models endpoint to verify API key & connectivity."""
    if not TOGETHER_API_KEY:
        return {"status": "error", "detail": "TOGETHER_API_KEY not set"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.together.xyz/v1/models",
                headers={"Authorization": f"Bearer {TOGETHER_API_KEY}"},
            )
            resp.raise_for_status()
        return {"status": "healthy", "model": TOGETHER_MODEL}
    except Exception as e:
        return {"status": "error", "detail": str(e)}