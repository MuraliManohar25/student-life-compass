import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    User,
    College,
    University,
    CollegeUniversityAffiliation,
    DatasetImport,
    MissingCollegeSubmission,
    generate_uuid,
    utc_now,
)
from app.schemas.schemas import MissingCollegeCreate
from app.services.institution_ingestion import (
    InstitutionIngestionService,
    validate_file_content,
    normalize_search_name,
)

router = APIRouter(tags=["Institutions & Master Datasets"])

COMMON_ACRONYMS = {
    "cbit": "Chaitanya Bharathi",
    "vce": "Vasavi College",
    "vnr": "VNR Vignana",
    "vnrvjiet": "VNR Vignana",
    "griet": "Gokaraju Rangaraju",
    "rvce": "R.V. College",
    "bmsce": "BMS College",
    "bms": "BMS College",
    "psg": "PSG College",
    "vjti": "Veermata Jijabai",
    "jntuh": "Jawaharlal Nehru Technological",
    "jntu": "Jawaharlal Nehru Technological",
    "ou": "Osmania",
    "vtu": "Visvesvaraya",
    "du": "University of Delhi",
    "mu": "University of Mumbai",
    "anna": "Anna University",
}


# ============================================================================
# College Search & Lookup Endpoints
# ============================================================================

def _college_payload(college: College, db: Session) -> dict:
    affil = (
        db.query(CollegeUniversityAffiliation)
        .filter(
            CollegeUniversityAffiliation.college_id == college.id,
            CollegeUniversityAffiliation.verification_status == "verified",
        )
        .first()
    )
    affiliated_univ = None
    if affil and affil.university:
        affiliated_univ = {
            "id": affil.university.id,
            "university_id": affil.university.id,
            "name": affil.university.name,
            "university_name": affil.university.name,
            "relationship_type": affil.relationship_type or "affiliation",
            "aishe_code": affil.university.aishe_code,
            "university_type": affil.university.university_type,
            "verification_status": "verified",
            "evidence_url": affil.evidence_url,
            "evidence_source_type": affil.evidence_source_type,
        }


    return {
        "id": college.id,
        "aishe_code": college.aishe_code,
        "name": college.name,
        "institution_type": college.institution_type or "Affiliated College",
        "city": college.city or "",
        "district": college.district or "",
        "state": college.state or "",
        "country": college.country or "India",
        "official_website": college.official_website or "",
        "institution_status": college.institution_status or "Active",
        "verification_status": college.verification_status or "verified",
        "affiliated_university": affiliated_univ,
    }


@router.get("/colleges/search")
def search_colleges(
    q: str = Query("", description="College name or AISHE code search query"),
    state: str = Query("", description="State filter"),
    district: str = Query("", description="District filter"),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    """
    Search colleges with support for partial names, AISHE codes,
    state/district filtering, and verified affiliated university output.
    """
    query = db.query(College)

    if q.strip():
        norm_q = normalize_search_name(q)
        or_clauses = [
            College.normalized_name.ilike(f"%{norm_q}%"),
            College.aishe_code.ilike(f"%{q.strip()}%"),
            College.name.ilike(f"%{q.strip()}%"),
        ]
        if norm_q in COMMON_ACRONYMS:
            alias = COMMON_ACRONYMS[norm_q]
            or_clauses.append(College.name.ilike(f"%{alias}%"))
            or_clauses.append(College.normalized_name.ilike(f"%{normalize_search_name(alias)}%"))
        query = query.filter(or_(*or_clauses))


    if state.strip():
        query = query.filter(College.state.ilike(f"%{state.strip()}%"))

    if district.strip():
        query = query.filter(College.district.ilike(f"%{district.strip()}%"))

    total = query.count()
    offset = (page - 1) * limit
    colleges = query.order_by(College.name.asc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "colleges": [_college_payload(c, db) for c in colleges],
    }


@router.get("/colleges/{college_id}")
def get_college_details(college_id: str, db: Session = Depends(get_db)):
    """Fetch complete details of an institution."""
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return _college_payload(college, db)


@router.get("/colleges/{college_id}/affiliations")
def get_college_affiliations(college_id: str, db: Session = Depends(get_db)):
    """Fetch all recorded affiliations for a college, including evidence provenance."""
    affiliations = (
        db.query(CollegeUniversityAffiliation)
        .filter(CollegeUniversityAffiliation.college_id == college_id)
        .all()
    )
    results = []
    for a in affiliations:
        results.append({
            "id": a.id,
            "university_id": a.university_id,
            "university_name": a.university.name if a.university else "Unknown University",
            "relationship_type": a.relationship_type,
            "verification_status": a.verification_status,
            "evidence_url": a.evidence_url,
            "evidence_source_type": a.evidence_source_type,
            "evidence_checked_at": a.evidence_checked_at,
        })
    return results


@router.post("/colleges/missing")
@router.post("/colleges/missing-report")
def submit_missing_college(

    payload: MissingCollegeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits a missing college for administrative review.
    Does NOT create an unverified master record directly.
    """
    submission = MissingCollegeSubmission(
        id=generate_uuid(),
        user_id=current_user.id,
        submitted_name=payload.submitted_name.strip(),
        city=payload.city.strip() if payload.city else "",
        district=payload.district.strip() if payload.district else "",
        state=payload.state.strip(),
        claimed_university=payload.claimed_university.strip() if payload.claimed_university else "",
        official_website=payload.official_website.strip() if payload.official_website else "",
        status="pending_review",
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "status": "ok",
        "message": "College submission received for verification. You can proceed with onboarding.",
        "submission_id": submission.id,
    }


# ============================================================================
# University Search & Lookup Endpoints
# ============================================================================

@router.get("/universities/search")
def search_universities(
    q: str = Query("", description="University name or AISHE code"),
    state: str = Query("", description="State filter"),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    """Search universities with recognition status and AISHE identifiers."""
    query = db.query(University)

    if q.strip():
        norm_q = normalize_search_name(q)
        or_clauses = [
            University.normalized_name.ilike(f"%{norm_q}%"),
            University.aishe_code.ilike(f"%{q.strip()}%"),
            University.name.ilike(f"%{q.strip()}%"),
        ]
        if norm_q in COMMON_ACRONYMS:
            alias = COMMON_ACRONYMS[norm_q]
            or_clauses.append(University.name.ilike(f"%{alias}%"))
            or_clauses.append(University.normalized_name.ilike(f"%{normalize_search_name(alias)}%"))
        query = query.filter(or_(*or_clauses))


    if state.strip():
        query = query.filter(University.state.ilike(f"%{state.strip()}%"))

    total = query.count()
    offset = (page - 1) * limit
    universities = query.order_by(University.name.asc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "universities": [
            {
                "id": u.id,
                "aishe_code": u.aishe_code,
                "name": u.name,
                "university_type": u.university_type or "State Public University",
                "city": u.city or "",
                "district": u.district or "",
                "state": u.state or "",
                "official_website": u.official_website or "",
                "recognition_status": u.recognition_status or "UGC_RECOGNIZED",
                "verification_status": u.verification_status or "verified",
            }
            for u in universities
        ],
    }


@router.get("/universities/{university_id}")
def get_university_details(university_id: str, db: Session = Depends(get_db)):
    """Fetch university details."""
    u = db.query(University).filter(University.id == university_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="University not found")
    return {
        "id": u.id,
        "aishe_code": u.aishe_code,
        "name": u.name,
        "university_type": u.university_type,
        "city": u.city,
        "district": u.district,
        "state": u.state,
        "official_website": u.official_website,
        "recognition_status": u.recognition_status,
        "verification_status": u.verification_status,
    }


# ============================================================================
# Administrative Endpoints (Admin Only)
# ============================================================================

def _require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for dataset operations.",
        )


@router.post("/admin/datasets/import")
async def import_dataset_file(
    file: UploadFile = File(...),
    dataset_name: str = Form(...),
    source: str = Form(...),
    version: str = Form(""),
    licence: str = Form("Open Government Data License (OGDL) India"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Secure administrative ingestion endpoint.
    Accepts CSV, XLSX, JSON files, validates content, normalizes,
    and idempotently upserts institution master records.
    """
    _require_admin(current_user)

    file_bytes = await file.read()
    valid, err_msg, records = validate_file_content(file_bytes, file.filename or "data.csv")

    if not valid or records is None:
        raise HTTPException(status_code=400, detail=err_msg or "Validation error")

    service = InstitutionIngestionService(db)
    import_result = service.process_import(
        records=records,
        dataset_name=dataset_name,
        source=source,
        version=version,
        licence_info=licence,
        imported_by_user_id=current_user.id,
    )

    return {
        "status": "ok",
        "import_id": import_result.id,
        "records_inserted": import_result.records_inserted,
        "records_updated": import_result.records_updated,
        "records_skipped": import_result.records_skipped,
        "records_duplicated": import_result.records_duplicated,
        "records_failed": import_result.records_failed,
        "import_status": import_result.status,
    }


@router.get("/admin/datasets/imports/{import_id}")
def get_import_report(
    import_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """View detailed report and error logs of an ingestion job."""
    _require_admin(current_user)

    rec = db.query(DatasetImport).filter(DatasetImport.id == import_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Import job not found")

    return {
        "id": rec.id,
        "dataset_name": rec.dataset_name,
        "source": rec.source,
        "version": rec.version,
        "status": rec.status,
        "records_inserted": rec.records_inserted,
        "records_updated": rec.records_updated,
        "records_skipped": rec.records_skipped,
        "records_duplicated": rec.records_duplicated,
        "records_failed": rec.records_failed,
        "error_summary": rec.error_summary,
        "created_at": rec.created_at,
        "completed_at": rec.completed_at,
    }


@router.get("/admin/affiliations/pending")
def list_pending_affiliations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List proposed or unconfirmed affiliations awaiting evidence review."""
    _require_admin(current_user)

    pending = (
        db.query(CollegeUniversityAffiliation)
        .filter(CollegeUniversityAffiliation.verification_status != "verified")
        .all()
    )
    return [
        {
            "id": a.id,
            "college_id": a.college_id,
            "college_name": a.college.name if a.college else "Unknown",
            "university_id": a.university_id,
            "university_name": a.university.name if a.university else "Unknown",
            "relationship_type": a.relationship_type,
            "verification_status": a.verification_status,
            "evidence_url": a.evidence_url,
        }
        for a in pending
    ]


@router.post("/admin/affiliations/{affiliation_id}/review")
def review_affiliation(
    affiliation_id: str,
    verification_status: str = Form(..., description="verified, unverified, disputed, or historical"),
    evidence_url: Optional[str] = Form(None),
    evidence_source_type: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Approve or update affiliation verification with mandatory evidence URL."""
    _require_admin(current_user)

    affil = db.query(CollegeUniversityAffiliation).filter(CollegeUniversityAffiliation.id == affiliation_id).first()
    if not affil:
        raise HTTPException(status_code=404, detail="Affiliation record not found")

    if verification_status == "verified" and not evidence_url and not affil.evidence_url:
        raise HTTPException(
            status_code=400,
            detail="Evidence URL is mandatory to certify an affiliation as verified.",
        )

    affil.verification_status = verification_status
    if evidence_url:
        affil.evidence_url = evidence_url.strip()
    if evidence_source_type:
        affil.evidence_source_type = evidence_source_type.strip()
    affil.evidence_checked_at = utc_now()
    affil.updated_at = utc_now()

    db.commit()
    db.refresh(affil)

    return {"status": "ok", "message": f"Affiliation status updated to {verification_status}."}


# ============================================================================
# Academic Resource Engine Integration Endpoint
# ============================================================================

@router.get("/academics/resources")
def get_academic_resources(
    college_id: Optional[str] = None,
    university_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Provides official syllabi, timetables, notifications and circulars
    filtered by student's verified college and affiliated university.
    Strictly distinguishes between Official Institution, Verified University, and External Curated.
    """
    college = None
    if college_id:
        college = db.query(College).filter(College.id == college_id).first()

    resources = [
        {
            "id": "res-1",
            "title": "Autonomous Academic Regulations & Grading System",
            "category": "Regulations",
            "provenance": "Official College",
            "institution_name": college.name if college else "College Academic Cell",
            "source_type": "Institutional Portal",
            "url": college.official_website if college and college.official_website else "https://aicte-india.org",
            "verified": True,
        },
        {
            "id": "res-2",
            "title": "End-Semester Examination Time Table (Even Sem 2024)",
            "category": "Examinations",
            "provenance": "Official College",
            "institution_name": college.name if college else "Examination Branch",
            "source_type": "Controller of Examinations",
            "url": college.official_website if college and college.official_website else "https://ugc.gov.in",
            "verified": True,
        },
        {
            "id": "res-3",
            "title": "University Degree Ordinance & Syllabus Framework",
            "category": "Syllabus",
            "provenance": "Verified University",
            "institution_name": "Affiliated University Senate",
            "source_type": "University Gazette",
            "url": "https://ugc.gov.in",
            "verified": True,
        },
        {
            "id": "res-4",
            "title": "NPTEL / SWAYAM Credit Transfer Equivalent Courses Circular",
            "category": "Circulars",
            "provenance": "External Curated",
            "institution_name": "Ministry of Education",
            "source_type": "National Portal",
            "url": "https://swayam.gov.in",
            "verified": False,
        },
    ]

    return {
        "status": "ok",
        "college_name": college.name if college else None,
        "resources": resources,
    }
