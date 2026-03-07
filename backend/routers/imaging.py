# backend/routers/imaging.py
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
import logging
import time
import httpx
import os

from database import get_db
import db_models as models
import auth

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/api/v1/analyze",
    tags=["Medical Imaging"]
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/avif", "image/tiff"}

COLAB_URL = os.getenv("COLAB_URL", "")

async def analyze_scan(
    scan_type: str,
    file: UploadFile,
    db: Session,
    current_user = None
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WEBP, BMP")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    start_time = time.time()

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{COLAB_URL}/analyze",
                files={"file": (file.filename, contents, file.content_type)},
                data={"scan_type": scan_type}
            )
            result = response.json()
    except Exception as e:
        logger.error(f"Colab error: {e}")
        raise HTTPException(status_code=503, detail="AI model unavailable")

    time_taken = round(time.time() - start_time, 1)

    if current_user:
        try:
            scan = models.Scan(
                user_id      = current_user.id,
                scan_type    = scan_type,
                filename     = file.filename,
                report       = result.get("report", ""),
                severity     = result.get("severity", ""),
                confidence   = result.get("confidence", 0),
                time_seconds = time_taken,
                status       = "pending"
            )
            db.add(scan)
            db.commit()
        except Exception as e:
            logger.error(f"DB error: {e}")

    return {
        "success"     : True,
        "scan_type"   : scan_type,
        "filename"    : file.filename,
        "report"      : result.get("report", ""),
        "report_urdu" : result.get("report_urdu", ""),
        "severity"    : result.get("severity", ""),
        "confidence"  : result.get("confidence", 0),
        "time_seconds": time_taken,
    }


# Optional auth — login karo to save hoga
def get_optional_user(
    db: Session = Depends(get_db),
    token: str = ""
):
    try:
        return auth.get_current_user(token, db)
    except:
        return None


@router.post("/xray")
async def analyze_xray(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await analyze_scan("xray", file, db)

@router.post("/ecg")
async def analyze_ecg(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await analyze_scan("ecg", file, db)

@router.post("/blood-test")
async def analyze_blood_test(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await analyze_scan("blood-test", file, db)

@router.post("/bone")
async def analyze_bone(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await analyze_scan("bone", file, db)

@router.post("/skin")
async def analyze_skin(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await analyze_scan("skin", file, db)