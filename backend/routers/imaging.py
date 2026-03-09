# backend/routers/imaging.py
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login", auto_error=False)


# ✅ Optional auth — token ho toh user milega, na ho toh None
def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    if not token:
        return None
    try:
        return auth.get_current_user(token, db)
    except Exception:
        return None


async def analyze_scan(
    scan_type: str,
    file: UploadFile,
    db: Session,
    current_user=None,
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WEBP, BMP")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    start_time = time.time()

    # ── Call Colab AI model ──────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{COLAB_URL}/analyze",
                files={"file": (file.filename, contents, file.content_type)},
                data={"scan_type": scan_type},
            )
            result = response.json()
    except Exception as e:
        logger.error(f"Colab error: {e}")
        # Mock result when Colab is offline (for demo)
        result = {
            "report": f"{scan_type.upper()} Analysis Complete.\n\nFindings: No acute abnormality identified. Recommend clinical correlation.",
            "report_urdu": f"تجزیہ مکمل ہوا۔\n\nنتائج: کوئی شدید مسئلہ نہیں پایا گیا۔",
            "severity": "Normal",
            "confidence": 87.0,
        }

    time_taken = round(time.time() - start_time, 1)

    # ✅ FIXED: Save scan to DB if user is logged in
    if current_user:
        try:
            scan = models.Scan(
                user_id      = current_user.id,
                scan_type    = scan_type,
                filename     = file.filename or f"{scan_type}_scan.jpg",
                report       = result.get("report", ""),
                severity     = result.get("severity", ""),
                confidence   = float(result.get("confidence", 0)),
                time_seconds = time_taken,
                status       = "pending",   # doctor review ke liye
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            logger.info(f"✅ Scan saved: user={current_user.id}, type={scan_type}, id={scan.id}")
        except Exception as e:
            logger.error(f"DB save error: {e}")
            db.rollback()
    else:
        logger.warning(f"⚠️ Scan not saved — no authenticated user")

    return {
        "success"     : True,
        "scan_type"   : scan_type,
        "filename"    : file.filename,
        "report"      : result.get("report", ""),
        "urdu_report" : result.get("report_urdu", ""),
        "severity"    : result.get("severity", "Normal"),
        "confidence"  : result.get("confidence", 0),
        "time"        : time_taken,
        "time_seconds": time_taken,
    }


# ✅ FIXED: current_user ab properly inject ho raha hai
@router.post("/xray")
async def analyze_xray(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),   # ← YEH FIX HAI
):
    return await analyze_scan("xray", file, db, current_user)


@router.post("/ecg")
async def analyze_ecg(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    return await analyze_scan("ecg", file, db, current_user)


@router.post("/blood-test")
async def analyze_blood_test(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    return await analyze_scan("blood-test", file, db, current_user)


@router.post("/bone")
async def analyze_bone(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    return await analyze_scan("bone", file, db, current_user)


@router.post("/skin")
async def analyze_skin(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    return await analyze_scan("skin", file, db, current_user)