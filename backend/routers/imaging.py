# backend/routers/imaging.py
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
import logging
import time
import os
import uuid

from database import get_db
import db_models as models
import auth
from models.llava_model import analyze_medical_image

logger = logging.getLogger(__name__)

# Directory to persist uploaded scan images
SCAN_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "scans")
os.makedirs(SCAN_UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/api/v1/analyze",
    tags=["Medical Imaging"]
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/avif", "image/tiff"}

async def analyze_scan(
    scan_type: str,
    file: UploadFile,
    db: Session,
    current_user,
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WEBP, BMP")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # ── Save image to disk for doctor review ───────────────────
    ext = os.path.splitext(file.filename or "scan.jpg")[1] or ".jpg"
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    image_path = os.path.join(SCAN_UPLOAD_DIR, safe_filename)
    with open(image_path, "wb") as f:
        f.write(contents)
    # Relative path stored in DB (portable)
    relative_image_path = f"data/scans/{safe_filename}"

    start_time = time.time()

    # ── Call Gemini Vision API ──────────────────────────────────
    try:
        result = await analyze_medical_image(
            contents, scan_type,
            patient_name=current_user.full_name,
            patient_id=current_user.id,
        )
    except ValueError as e:
        logger.error(f"Config error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        raise HTTPException(
            status_code=502,
            detail="AI model temporarily unavailable. Please try again in a few seconds."
        )

    time_taken = round(time.time() - start_time, 1)

    # Save scan to DB — always saved since auth is required
    scan_id = None
    try:
        scan = models.Scan(
            user_id      = current_user.id,
            scan_type    = scan_type,
            filename     = file.filename or f"{scan_type}_scan.jpg",
            image_path   = relative_image_path,
            report       = result.get("report", ""),
            severity     = result.get("severity", ""),
            confidence   = float(result.get("confidence", 0)),
            time_seconds = time_taken,
            status       = "pending",   # doctor review ke liye
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        scan_id = scan.id
        logger.info(f"✅ Scan saved: user={current_user.id}, type={scan_type}, id={scan.id}")
    except Exception as e:
        logger.error(f"DB save error: {e}")
        db.rollback()

    return {
        "success"     : True,
        "scan_type"   : scan_type,
        "scan_id"     : scan_id,
        "scan_saved"  : scan_id is not None,
        "filename"    : file.filename,
        "report"      : result.get("report", ""),
        "urdu_report" : result.get("report_urdu", ""),
        "severity"    : result.get("severity", "Normal"),
        "confidence"  : result.get("confidence", 0),
        "time"        : time_taken,
        "time_seconds": time_taken,
    }


@router.post("/xray")
async def analyze_xray(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    return await analyze_scan("xray", file, db, current_user)


@router.post("/ecg")
async def analyze_ecg(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    return await analyze_scan("ecg", file, db, current_user)


@router.post("/blood-test")
async def analyze_blood_test(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    return await analyze_scan("blood-test", file, db, current_user)


@router.post("/bone")
async def analyze_bone(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    return await analyze_scan("bone", file, db, current_user)


@router.post("/skin")
async def analyze_skin(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    return await analyze_scan("skin", file, db, current_user)


@router.post("/prescription")
async def analyze_prescription(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    return await analyze_scan("prescription", file, db, current_user)