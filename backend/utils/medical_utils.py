# backend/utils/medical_utils.py
# ═══════════════════════════════════════
# MedCare AI — Medical Utilities
# Syed Hassan Tayyab — Atomcamp 2026
# ═══════════════════════════════════════

import logging
import time
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from collections import Counter

logger = logging.getLogger(__name__)

# ── Prompts ────────────────────────────
XRAY_PROMPT = """[INST] <image>
You are a board-certified radiologist
at Mayo Clinic with 20 years experience.
Analyze ONLY what you actually see.
Every finding must be UNIQUE.

TECHNIQUE: PA or AP view.

FINDINGS:
- Lungs: Describe lung fields
- Heart: Describe cardiac size
- Bones: Describe ribs/spine
- Diaphragm: Describe both sides

IMPRESSION:
1. Primary diagnosis
2. Secondary finding

RECOMMENDATION:
Specific next step.

SEVERITY: Normal/Mild/Moderate/Severe/URGENT
[/INST]"""

ECG_PROMPT = """[INST] <image>
You are a board-certified cardiologist.
Analyze this ECG carefully.

RHYTHM: Regular or Irregular?
RATE: Beats per minute estimate
PR INTERVAL: Normal?
QRS: Normal?
ST SEGMENT: Normal/Elevated/Depressed?

IMPRESSION: Primary finding
RECOMMENDATION: Next clinical step.
SEVERITY: Normal/Mild/Moderate/Severe/URGENT
[/INST]"""

BLOOD_TEST_PROMPT = """[INST] <image>
You are a clinical pathologist.
Analyze this blood test report.

FINDINGS:
List all abnormal values first.
Then normal values.

IMPRESSION: Overall assessment.
RECOMMENDATION: Next clinical step.
SEVERITY: Normal/Mild/Moderate/Severe/URGENT
[/INST]"""

BONE_PROMPT = """[INST] <image>
You are an expert orthopedic radiologist.
Analyze this bone X-ray carefully.

TECHNIQUE: Specify view and bone.

FINDINGS:
- Bone density: Normal/Reduced?
- Fractures: Present/Absent?
- Joint spaces: Normal/Narrowed?
- Alignment: Normal/Abnormal?

IMPRESSION: Primary diagnosis
RECOMMENDATION: Next clinical step.
SEVERITY: Normal/Mild/Moderate/Severe/URGENT
[/INST]"""

SKIN_PROMPT = """[INST] <image>
You are a board-certified dermatologist.
Analyze this skin condition.

OBSERVATION:
Color, texture, pattern, size, location.

IMPRESSION: Most likely condition.
DIFFERENTIAL: 2-3 other possibilities.
RECOMMENDATION: Treatment or next step.
SEVERITY: Normal/Mild/Moderate/Severe/URGENT
[/INST]"""

SCAN_PROMPTS = {
    "xray":       XRAY_PROMPT,
    "ecg":        ECG_PROMPT,
    "blood_test": BLOOD_TEST_PROMPT,
    "bone":       BONE_PROMPT,
    "skin":       SKIN_PROMPT,
}

# ── Severity ───────────────────────────
SEVERITY_MAP = {
    "urgent":   ("🚨 URGENT",   5),
    "severe":   ("🔴 Severe",   4),
    "moderate": ("🟠 Moderate", 3),
    "mild":     ("🟡 Mild",     2),
    "normal":   ("🟢 Normal",   1),
}

def extract_severity(text: str):
    text_lower = text.lower()
    for key, (label, score) in \
            SEVERITY_MAP.items():
        if key in text_lower:
            return label, score
    return "⚪ Unknown", 0

# ── Image Processing ───────────────────
def preprocess_medical_image(
    image: Image.Image,
    size: tuple = (336, 336)
) -> Image.Image:
    img_array = np.array(image)
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(
            img_array,
            cv2.COLOR_RGB2GRAY
        )
    else:
        gray = img_array

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    enhanced = clahe.apply(gray)
    rgb = cv2.cvtColor(
        enhanced,
        cv2.COLOR_GRAY2RGB
    )
    result = Image.fromarray(rgb)
    enhancer = ImageEnhance.Sharpness(result)
    return enhancer.enhance(1.5).resize(size)

# ── Urdu Translation ───────────────────
def translate_to_urdu(report: str) -> str:
    """Simple medical terms Urdu translation"""
    translations = {
        "Normal": "نارمل",
        "Mild": "ہلکا",
        "Moderate": "درمیانہ",
        "Severe": "شدید",
        "URGENT": "فوری",
        "FINDINGS": "نتائج",
        "IMPRESSION": "تشخیص",
        "RECOMMENDATION": "سفارش",
        "No acute disease": "کوئی شدید بیماری نہیں",
        "Chest X-Ray": "سینے کا ایکسرے",
        "Heart": "دل",
        "Lungs": "پھیپھڑے",
        "Normal sinus rhythm": "نارمل دل کی دھڑکن",
    }

    urdu_report = report
    for eng, urdu in translations.items():
        urdu_report = urdu_report.replace(eng, f"{eng} ({urdu})")

    return urdu_report

# ── Analysis ───────────────────────────
def analyze_image(
    image: Image.Image,
    prompt: str,
    processor,
    model,
    runs: int = 3,
) -> dict:
    reports    = []
    severities = []
    scores     = []
    start      = time.time()

    for i in range(runs):
        logger.info(f"Run {i+1}/{runs}...")

        inputs = processor(
            text=prompt,
            images=image,
            return_tensors="pt"
        ).to(next(
            model.parameters()
        ).device)

        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=False,
                use_cache=True,
                num_beams=1,
            )

        report = processor.decode(
            output[0],
            skip_special_tokens=True
        ).split("[/INST]")[-1].strip()

        severity, score = \
            extract_severity(report)
        reports.append(report)
        severities.append(severity)
        scores.append(score)

    sev_counter  = Counter(severities)
    final_sev    = sev_counter\
        .most_common(1)[0][0]
    confidence   = round(
        sev_counter.most_common(1)[0][1]
        / runs * 100
    )
    best_report  = max(reports, key=len)
    time_taken   = round(
        time.time() - start, 1
    )

    return {
        "report":       best_report,
        "severity":     final_sev,
        "confidence":   confidence,
        "time_seconds": time_taken,
        "runs":         runs,
    }