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
    "You are a board-certified medical imaging specialist and senior consultant radiologist "
    "with 20+ years of clinical experience at a top tertiary-care hospital. "
    "You produce detailed, structured, and professional medical reports that follow international "
    "radiology reporting standards (BI-RADS, TNM, AHA guidelines as applicable). "
    "Always format your reports with clear section headings using **bold** markdown. "
    "Always specify Severity as exactly one of: Normal, Mild, Moderate, or Severe. "
    "Always include a Confidence percentage (e.g., Confidence: 85%). "
    "Include patient-friendly explanation alongside medical terminology. "
    "Provide an Urdu summary at the end under the heading 'اردو خلاصہ'."
)

# ── Scan-specific prompts ─────────────────────────────────────
SCAN_PROMPTS = {
    "xray": (
        "Analyze this X-ray image as a senior consultant radiologist. Produce a comprehensive professional radiology report:\n"
        "\n**CLINICAL INDICATION**: State the probable clinical indication based on the image.\n"
        "\n**TECHNIQUE**: Describe the projection (PA/AP/Lateral), quality, and any limitations.\n"
        "\n**FINDINGS**:\n"
        "- **Lungs & Airways**: Describe lung fields, any opacities, consolidation, effusion, pneumothorax, nodules, masses.\n"
        "- **Heart & Mediastinum**: Cardiothoracic ratio, heart shadow, aortic knob, mediastinal width.\n"
        "- **Pleura & Diaphragm**: Costophrenic angles, hemidiaphragm position, any pleural thickening.\n"
        "- **Bones & Soft Tissues**: Ribs, spine, clavicles, soft tissue shadows, any fractures or lesions.\n"
        "- **Lines & Tubes**: If any medical devices are visible.\n"
        "\n**IMPRESSION**: Primary diagnosis and differential diagnoses (numbered list).\n"
        "\n**SEVERITY**: Normal / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Your confidence percentage\n"
        "\n**RECOMMENDATIONS**: Recommended follow-up tests, specialist referral, or management plan.\n"
        "\n**PATIENT EXPLANATION**: Explain findings in simple Urdu/English for the patient to understand.\n"
        "\n**اردو خلاصہ**: Complete Urdu translation of the findings and recommendations."
    ),
    "ecg": (
        "Analyze this ECG strip as a senior consultant cardiologist. Produce a comprehensive professional cardiology report:\n"
        "\n**CLINICAL INDICATION**: State the probable clinical indication.\n"
        "\n**ECG PARAMETERS**:\n"
        "- Heart Rate: (calculate from R-R interval)\n"
        "- Rhythm: (Regular/Irregular, Sinus/Non-sinus)\n"
        "- Axis: (Normal/LAD/RAD)\n"
        "- PR Interval: (normal 0.12-0.20s)\n"
        "- QRS Duration: (normal <0.12s)\n"
        "- QT/QTc Interval:\n"
        "\n**FINDINGS**:\n"
        "- **P Waves**: Morphology, axis, any abnormalities\n"
        "- **QRS Complex**: Width, morphology, bundle branch blocks\n"
        "- **ST Segment**: Elevation/depression, which leads\n"
        "- **T Waves**: Inversions, hyperacute changes\n"
        "- **Rhythm Analysis**: Any arrhythmias, blocks, ectopics\n"
        "\n**IMPRESSION**: Primary diagnosis with differential.\n"
        "\n**SEVERITY**: Normal / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Your confidence percentage\n"
        "\n**RECOMMENDATIONS**: Follow-up investigations (Echo, Holter, stress test), specialist referral.\n"
        "\n**PATIENT EXPLANATION**: Simple explanation for the patient.\n"
        "\n**اردو خلاصہ**: Complete Urdu summary."
    ),
    "blood-test": (
        "Analyze this blood test report as a senior consultant pathologist. Produce a comprehensive professional pathology report:\n"
        "\n**TEST IDENTIFICATION**: Identify the type of blood test (CBC, LFT, RFT, Lipid Panel, etc.)\n"
        "\n**RESULTS TABLE**:\n"
        "For each parameter found, list: Parameter | Result | Normal Range | Status (Normal/High/Low/Critical)\n"
        "\n**ABNORMAL VALUES ANALYSIS**: Detail each abnormal value with:\n"
        "- Clinical significance\n"
        "- Possible causes\n"
        "- Urgency level\n"
        "\n**CLINICAL CORRELATION**: Possible conditions suggested by the combination of findings.\n"
        "\n**IMPRESSION**: Summary of findings with differential diagnoses.\n"
        "\n**SEVERITY**: Normal / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Your confidence percentage\n"
        "\n**RECOMMENDATIONS**: Further tests needed, specialist referral, dietary/lifestyle changes.\n"
        "\n**PATIENT EXPLANATION**: Simple explanation of what the results mean.\n"
        "\n**اردو خلاصہ**: Complete Urdu summary."
    ),
    "bone": (
        "Analyze this bone scan/X-ray as a senior consultant orthopedic radiologist. Produce a comprehensive professional report:\n"
        "\n**CLINICAL INDICATION**: State the probable clinical indication.\n"
        "\n**TECHNIQUE**: Projection, body part, image quality.\n"
        "\n**FINDINGS**:\n"
        "- **Bone Structure**: Cortical integrity, trabecular pattern, bone density\n"
        "- **Joints**: Joint spaces, articular surfaces, alignment\n"
        "- **Fractures**: Location, type (transverse/oblique/spiral/comminuted), displacement, angulation\n"
        "- **Lesions**: Any lytic or sclerotic lesions, periosteal reaction\n"
        "- **Soft Tissues**: Swelling, calcification, foreign bodies\n"
        "\n**IMPRESSION**: Primary diagnosis with differential.\n"
        "\n**SEVERITY**: Normal / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Your confidence percentage\n"
        "\n**RECOMMENDATIONS**: Treatment options, follow-up imaging, specialist referral.\n"
        "\n**PATIENT EXPLANATION**: Simple explanation for the patient.\n"
        "\n**اردو خلاصہ**: Complete Urdu summary."
    ),
    "skin": (
        "Analyze this skin image as a senior consultant dermatologist. Produce a comprehensive professional report:\n"
        "\n**CLINICAL DESCRIPTION**:\n"
        "- Location, size, shape, color, border, surface\n"
        "- ABCDE criteria assessment (if applicable): Asymmetry, Border, Color, Diameter, Evolution\n"
        "\n**FINDINGS**: Detailed morphological description using proper dermatological terminology.\n"
        "\n**DIFFERENTIAL DIAGNOSIS**: Numbered list of possible conditions.\n"
        "\n**IMPRESSION**: Most likely diagnosis.\n"
        "\n**SEVERITY**: Normal / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Your confidence percentage\n"
        "\n**RECOMMENDATIONS**: Biopsy, dermatoscopy, treatment options, follow-up.\n"
        "\n**PATIENT EXPLANATION**: Simple explanation for the patient.\n"
        "\n**اردو خلاصہ**: Complete Urdu summary."
    ),
    "mri": (
        "Analyze this MRI scan as a senior consultant neuroradiologist. Produce a comprehensive professional report:\n"
        "\n**CLINICAL INDICATION**: State the probable clinical indication.\n"
        "\n**TECHNIQUE**: Sequences identified, plane, contrast.\n"
        "\n**FINDINGS**:\n"
        "- Signal abnormalities and their location\n"
        "- Mass effect, midline shift\n"
        "- Ventricles and CSF spaces\n"
        "- Brain parenchyma assessment\n"
        "\n**IMPRESSION**: Primary diagnosis with differential.\n"
        "\n**SEVERITY**: Normal / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Your confidence percentage\n"
        "\n**RECOMMENDATIONS**: Follow-up imaging, specialist referral.\n"
        "\n**PATIENT EXPLANATION**: Simple explanation for the patient.\n"
        "\n**اردو خلاصہ**: Complete Urdu summary."
    ),
    "prescription": (
        "Read this handwritten or printed medical prescription carefully. Produce a comprehensive professional report:\n"
        "\n**DOCTOR INFORMATION**: Name, specialization, clinic/hospital (if visible).\n"
        "\n**PATIENT INFORMATION**: Name, age, date (if visible).\n"
        "\n**MEDICATIONS**:\n"
        "For each medicine: Medicine Name | Generic Name | Dosage | Frequency | Duration | Route\n"
        "\n**DRUG INTERACTIONS**: Any potential interactions between prescribed medicines.\n"
        "\n**WARNINGS & PRECAUTIONS**: Important side effects, contraindications, food interactions.\n"
        "\n**SPECIAL INSTRUCTIONS**: Any specific instructions from the doctor.\n"
        "\n**SEVERITY**: Normal (routine) / Mild / Moderate / Severe\n"
        "\n**CONFIDENCE**: Confidence percentage in prescription reading accuracy.\n"
        "\n**RECOMMENDATIONS**: General advice for the patient.\n"
        "\n**PATIENT EXPLANATION**: Simple explanation of each medicine in Urdu/English.\n"
        "\n**اردو خلاصہ**: Complete Urdu translation of the prescription."
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

async def analyze_medical_image(image_bytes: bytes, scan_type: str, patient_name: str = "", patient_id: int = 0) -> dict:
    """
    Send a medical image to Google Gemini Vision API and return structured results.
    Required env var: GEMINI_API_KEY
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image too large ({len(image_bytes) // (1024*1024)} MB). Max: {MAX_IMAGE_BYTES // (1024*1024)} MB.")

    request_id = uuid.uuid4().hex[:8]
    base_prompt = SCAN_PROMPTS.get(scan_type, DEFAULT_PROMPT)

    # Prepend patient details to the prompt so the AI includes them in the report header
    patient_header = (
        f"**PATIENT DETAILS** (include these at the top of your report):\n"
        f"- Patient Name: {patient_name or 'Not Provided'}\n"
        f"- Patient ID: MCA-{patient_id:05d}\n"
        f"- Date of Study: {__import__('datetime').date.today().isoformat()}\n\n"
    )
    prompt = patient_header + base_prompt

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
            "maxOutputTokens": 4096,
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
