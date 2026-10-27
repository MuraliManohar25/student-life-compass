"""
Academic Compass & Personalized Resource Discovery API Router
Provides:
- GET /academics/compass: Personalized hub with student summary, enrolled subjects, and hybrid recommendations
- GET /academics/resources/search: Search, filter, and pagination across academic catalog
- POST /academics/onboarding: 4-step guided onboarding submission
- PUT /academics/profile: Editable profile management for returning students
- GET /academics/subjects: Enrolled subjects with syllabus metadata
- POST /academics/subjects: Add/modify enrolled subject
- DELETE /academics/subjects/{code}: Delete enrolled subject
- POST /academics/resources/{resource_id}/toggle-save: Save/bookmark resource
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    User,
    Profile,
    Subject,
    AcademicResource,
    SavedItem,
    College,
    University,
    utc_now,
)
from app.schemas.schemas import (
    AcademicCompassResponse,
    AcademicResourceOut,
    StudentSubjectInfo,
    AcademicOnboardingPayload,
    AcademicProfileUpdatePayload,
)

router = APIRouter(prefix="/academics", tags=["Academic Compass & Resource Discovery"])

DEFAULT_SUBJECTS_CATALOG = [
    {
        "code": "CS-304",
        "name": "Database Management Systems",
        "semester": "5th Semester",
        "credits": 4,
        "difficulty": "High",
        "topics": [
            "Relational Model & Relational Algebra",
            "SQL Queries & Subqueries",
            "Functional Dependencies & Normalization (1NF-BCNF)",
            "Transaction Processing & ACID Properties",
            "Concurrency Control & Indexing (B+ Trees)",
        ],
    },
    {
        "code": "CS-302",
        "name": "Operating Systems",
        "semester": "5th Semester",
        "credits": 4,
        "difficulty": "High",
        "topics": [
            "Process & Thread Management",
            "CPU Scheduling Algorithms",
            "Process Synchronization & Semaphores",
            "Deadlock Detection & Prevention",
            "Virtual Memory, Paging & Page Replacement",
        ],
    },
    {
        "code": "CS-303",
        "name": "Computer Networks",
        "semester": "5th Semester",
        "credits": 3,
        "difficulty": "Medium",
        "topics": [
            "OSI & TCP/IP Reference Architectures",
            "Data Link Protocols & Flow Control",
            "IP Addressing, Subnetting & CIDR",
            "Routing Algorithms (Dijkstra, Distance Vector)",
            "TCP Congestion Control & UDP",
        ],
    },
    {
        "code": "CS-401",
        "name": "Artificial Intelligence & Machine Learning",
        "semester": "5th Semester",
        "credits": 4,
        "difficulty": "High",
        "topics": [
            "Search Algorithms (A*, Minimax)",
            "Supervised Learning (Regression, Classification)",
            "Neural Networks & Backpropagation",
            "Decision Trees & Ensemble Methods",
            "Deep Learning & Convolutional Networks",
        ],
    },
    {
        "code": "CS-306",
        "name": "Web Technologies & Cloud Systems",
        "semester": "5th Semester",
        "credits": 3,
        "difficulty": "Medium",
        "topics": [
            "DOM Manipulation & Modern JavaScript",
            "RESTful API Design & HTTP Protocols",
            "Backend Architectures & Database Integration",
            "Virtualization & Docker Containers",
            "Cloud Deployment & Serverless Computing",
        ],
    },
]


def _ensure_student_subjects(user_id: int, profile: Profile, db: Session) -> List[Subject]:
    """Retrieves existing subjects or initializes default semester subjects for the student."""
    subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
    if not subjects:
        # Check if profile has subjects_list
        prof_subjects = getattr(profile, "subjects_list", None) or []
        if prof_subjects:
            for s in prof_subjects:
                subj = Subject(
                    user_id=user_id,
                    name=s.get("name", "Subject"),
                    code=s.get("code", "SUB-101"),
                    credits=s.get("credits", 3),
                    semester=s.get("semester", profile.semester or "5th Semester"),
                    difficulty=s.get("difficulty", "Medium"),
                    proficiency=s.get("proficiency", "Intermediate"),
                    needs_improvement=s.get("needs_improvement", False),
                    topics=s.get("topics", []),
                )
                db.add(subj)
            db.commit()
            subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        else:
            # Seed default curriculum subjects
            sem = profile.semester or "5th Semester"
            for item in DEFAULT_SUBJECTS_CATALOG:
                subj = Subject(
                    user_id=user_id,
                    name=item["name"],
                    code=item["code"],
                    credits=item["credits"],
                    semester=sem,
                    difficulty=item["difficulty"],
                    proficiency="Intermediate",
                    needs_improvement=item["code"] == "CS-304",  # Default focus subject
                    topics=item["topics"],
                )
                db.add(subj)
            db.commit()
            subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
    return subjects


def _get_student_saved_resource_map(user_id: int, db: Session) -> dict:
    """Returns mapping of resource_id -> saved_item_id for quick O(1) bookmark lookups."""
    saved_items = (
        db.query(SavedItem)
        .filter(SavedItem.user_id == user_id, SavedItem.kind == "resource")
        .all()
    )
    return {item.ref_id: item.id for item in saved_items}


@router.get("/compass", response_model=AcademicCompassResponse)
def get_academic_compass(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Main personalized academic resource discovery endpoint.
    Retrieves student profile, enrolled subjects, computes hybrid recommendations
    based on student proficiency, weak subjects, and preferred formats.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Enrolled subjects
    subjects = _ensure_student_subjects(current_user.id, profile, db)

    # Saved resources map
    saved_map = _get_student_saved_resource_map(current_user.id, db)

    # Student metadata
    learning_prefs = getattr(profile, "learning_preferences", None) or {}
    preferred_formats = [f.lower() for f in learning_prefs.get("preferred_formats", ["notes", "videos", "textbooks"])]
    academic_goals = getattr(profile, "academic_goals", None) or {}
    improvement_codes = set(academic_goals.get("improvement_subjects", []))
    for s in subjects:
        if s.needs_improvement:
            improvement_codes.add(s.code)

    # Count resources per subject
    subject_codes = [s.code for s in subjects]
    subject_info_list: List[StudentSubjectInfo] = []
    for s in subjects:
        cnt = db.query(AcademicResource).filter(AcademicResource.subject_code == s.code).count()
        subject_info_list.append(
            StudentSubjectInfo(
                id=s.id,
                code=s.code,
                name=s.name,
                semester=s.semester or profile.semester or "5th Semester",
                credits=s.credits or 3,
                target_grade=s.target_grade or "A",
                current_score=s.current_score or 85.0,
                difficulty=s.difficulty or "Medium",
                proficiency=s.proficiency or "Intermediate",
                needs_improvement=s.needs_improvement or (s.code in improvement_codes),
                topics=s.topics or [],
                resource_count=cnt,
            )
        )

    # Total catalog count
    total_resources = db.query(AcademicResource).count()

    # Category breakdown
    cat_counts = {}
    for r_type in ["notes", "textbook", "video", "tutorial", "pyq", "syllabus"]:
        cat_counts[r_type] = db.query(AcademicResource).filter(AcademicResource.resource_type == r_type).count()

    # Hybrid Recommendation Engine:
    # 1. Fetch resources matching student's enrolled subjects or official university curriculum
    candidate_resources = (
        db.query(AcademicResource)
        .filter(
            or_(
                AcademicResource.subject_code.in_(subject_codes),
                AcademicResource.source_category == "official",
            )
        )
        .all()
    )

    scored_candidates = []
    for r in candidate_resources:
        score = 0.0
        reasons = []

        # Criterion 1: Subject enrollment match
        if r.subject_code in subject_codes:
            score += 40.0

        # Criterion 2: Needs improvement focus boost
        if r.subject_code in improvement_codes:
            score += 35.0
            reasons.append(f"Targeted for {r.subject_code} which you flagged for improvement")

        # Criterion 3: Preferred learning format match
        if r.resource_type.lower() in preferred_formats:
            score += 25.0
            reasons.append(f"Matches your preference for {r.resource_type.capitalize()}")

        # Criterion 4: Official verified institutional material
        if r.source_category == "official":
            score += 30.0
            reasons.append("Official syllabus and institutional regulation document")
        elif r.is_verified:
            score += 10.0

        # Criterion 5: Rating factor
        score += (r.rating or 4.5) * 2.0

        # Truthful explainability summary
        if not reasons:
            why_text = f"Curated high-yield resource for {r.subject_name}"
        else:
            why_text = " • ".join(reasons)

        scored_candidates.append((score, r, why_text))

    # Sort descending by calculated relevance score
    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    recommendations: List[AcademicResourceOut] = []
    seen_ids = set()
    for _, r, why in scored_candidates[:8]:
        if r.id in seen_ids:
            continue
        seen_ids.add(r.id)
        is_saved = r.id in saved_map
        recommendations.append(
            AcademicResourceOut(
                id=r.id,
                title=r.title,
                description=r.description or "",
                subject_code=r.subject_code,
                subject_name=r.subject_name,
                topic=r.topic or "",
                syllabus_unit=r.syllabus_unit or "",
                resource_type=r.resource_type,
                source_category=r.source_category or "curated",
                provenance=r.provenance or "Curated Academic",
                institution_or_publisher=r.institution_or_publisher or "",
                url=r.url,
                language=r.language or "English",
                semester=r.semester or "",
                curriculum=r.curriculum or "All",
                is_verified=r.is_verified,
                rating=r.rating or 4.8,
                why_recommended=why,
                saved=is_saved,
                saved_id=saved_map.get(r.id),
            )
        )

    # Student Summary
    student_summary = {
        "full_name": current_user.full_name or "Student",
        "email": current_user.email,
        "college": profile.college or "University Campus",
        "degree": profile.course or "B.Tech / B.E.",
        "branch": profile.branch or profile.major or "Computer Science & Engineering",
        "academic_year": getattr(profile, "academic_year", "") or "3rd year",
        "semester": profile.semester or "5th Semester",
        "curriculum": getattr(profile, "curriculum", "") or "Autonomous R22 Scheme",
        "target_gpa": profile.target_gpa or 8.5,
        "target_role": profile.target_role or "Software Engineer",
        "daily_study_hours": learning_prefs.get("daily_study_hours", 3.0),
        "preferred_formats": learning_prefs.get("preferred_formats", ["notes", "videos", "textbooks"]),
        "preferred_language": learning_prefs.get("preferred_language", "English"),
        "upcoming_exams": academic_goals.get("upcoming_exams", []),
        "improvement_subjects": list(improvement_codes),
        "career_interests": academic_goals.get("career_interests", ["AI / ML", "Backend Systems"]),
        "onboarding_completed": bool(getattr(profile, "onboarding_completed", False)),
    }

    return AcademicCompassResponse(
        student_summary=student_summary,
        subjects=subject_info_list,
        recommendations=recommendations,
        total_resources_count=total_resources,
        categories_breakdown=cat_counts,
    )


@router.get("/resources/search")
def search_resources(
    q: str = Query("", description="Keyword search in title, topic, description"),
    subject_code: str = Query("All", description="Subject code filter"),
    semester: str = Query("All", description="Semester filter"),
    resource_type: str = Query("All", description="Resource type filter"),
    source_category: str = Query("All", description="Source category filter"),
    language: str = Query("All", description="Language filter"),
    sort_by: str = Query("relevance", description="Sort order: relevance, title, rating, newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Search and filter academic resources with pagination and per-user saved bookmarks.
    """
    query = db.query(AcademicResource)

    # Subject filter
    if subject_code and subject_code.lower() != "all":
        query = query.filter(AcademicResource.subject_code == subject_code)

    # Semester filter
    if semester and semester.lower() != "all":
        query = query.filter(AcademicResource.semester == semester)

    # Resource type filter
    if resource_type and resource_type.lower() != "all":
        query = query.filter(AcademicResource.resource_type == resource_type.lower())

    # Source category filter
    if source_category and source_category.lower() != "all":
        query = query.filter(AcademicResource.source_category == source_category.lower())

    # Language filter
    if language and language.lower() != "all":
        query = query.filter(AcademicResource.language == language)

    # Text search
    if q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                AcademicResource.title.ilike(term),
                AcademicResource.description.ilike(term),
                AcademicResource.topic.ilike(term),
                AcademicResource.subject_name.ilike(term),
                AcademicResource.subject_code.ilike(term),
                AcademicResource.institution_or_publisher.ilike(term),
            )
        )

    # Sorting
    if sort_by == "title":
        query = query.order_by(AcademicResource.title.asc())
    elif sort_by == "rating":
        query = query.order_by(AcademicResource.rating.desc())
    elif sort_by == "newest":
        query = query.order_by(AcademicResource.created_at.desc())
    else:
        # Default relevance: verified official first, then highest rating
        query = query.order_by(AcademicResource.is_verified.desc(), AcademicResource.rating.desc())

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    # Attach saved mapping
    saved_map = _get_student_saved_resource_map(current_user.id, db)

    results: List[AcademicResourceOut] = []
    for r in items:
        is_saved = r.id in saved_map
        results.append(
            AcademicResourceOut(
                id=r.id,
                title=r.title,
                description=r.description or "",
                subject_code=r.subject_code,
                subject_name=r.subject_name,
                topic=r.topic or "",
                syllabus_unit=r.syllabus_unit or "",
                resource_type=r.resource_type,
                source_category=r.source_category or "curated",
                provenance=r.provenance or "Curated Academic",
                institution_or_publisher=r.institution_or_publisher or "",
                url=r.url,
                language=r.language or "English",
                semester=r.semester or "",
                curriculum=r.curriculum or "All",
                is_verified=r.is_verified,
                rating=r.rating or 4.8,
                saved=is_saved,
                saved_id=saved_map.get(r.id),
            )
        )

    total_pages = max(1, (total + limit - 1) // limit)
    return {
        "status": "ok",
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "resources": results,
    }


@router.post("/onboarding")
def complete_academic_onboarding(
    payload: AcademicOnboardingPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits the 4-step guided academic onboarding:
    Step 1: Academic Profile & Subjects
    Step 2: Academic Goals & Deadlines
    Step 3: Learning Preferences & Proficiency
    Step 4: Review and Save
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    # Step 1: Academic Profile
    p_step1 = payload.profile
    profile.course = p_step1.degree.strip()
    profile.branch = p_step1.branch.strip()
    profile.major = f"{p_step1.degree.strip()} - {p_step1.branch.strip()}"
    profile.academic_year = p_step1.academic_year.strip()
    profile.cohort_standing = p_step1.academic_year.strip()
    profile.semester = p_step1.semester.strip()
    profile.curriculum = p_step1.curriculum.strip()
    if p_step1.college_name:
        profile.college = p_step1.college_name.strip()
    if p_step1.college_id:
        profile.college_id = p_step1.college_id
    if p_step1.university_id:
        profile.university_id = p_step1.university_id

    # Step 2: Academic Goals
    p_step2 = payload.goals
    goals_dict = {
        "target_gpa": p_step2.target_gpa or 8.5,
        "upcoming_exams": p_step2.upcoming_exams or [],
        "improvement_subjects": p_step2.improvement_subjects or [],
        "academic_targets": p_step2.academic_targets or [],
        "career_interests": p_step2.career_interests or [],
    }
    profile.target_gpa = p_step2.target_gpa or 8.5
    if p_step2.career_interests:
        profile.target_role = p_step2.career_interests[0]
    profile.academic_goals = goals_dict

    # Step 3: Learning Preferences
    p_step3 = payload.preferences
    prefs_dict = {
        "preferred_formats": p_step3.preferred_formats or ["notes", "videos"],
        "subject_proficiencies": p_step3.subject_proficiencies or {},
        "preferred_language": p_step3.preferred_language or "English",
        "daily_study_hours": p_step3.daily_study_hours or 2.5,
        "learning_style": p_step3.learning_style or "Visual & Applied",
    }
    profile.learning_preferences = prefs_dict

    # Synchronize enrolled subjects
    # Remove old subjects for clean student profile synchronization
    db.query(Subject).filter(Subject.user_id == current_user.id).delete()

    subj_list = []
    if p_step1.subjects:
        for s in p_step1.subjects:
            code = s.get("code", "SUB").strip()
            name = s.get("name", "Subject").strip()
            credits_val = int(s.get("credits", 3))
            prof_level = p_step3.subject_proficiencies.get(code, "Intermediate")
            needs_imp = code in p_step2.improvement_subjects

            # Match topics from catalog if available
            catalog_match = next((d for d in DEFAULT_SUBJECTS_CATALOG if d["code"].lower() == code.lower()), None)
            topics = catalog_match["topics"] if catalog_match else [f"{name} Fundamentals", f"{name} Advanced Topics"]

            new_subj = Subject(
                user_id=current_user.id,
                name=name,
                code=code,
                semester=p_step1.semester.strip(),
                credits=credits_val,
                proficiency=prof_level,
                needs_improvement=needs_imp,
                topics=topics,
            )
            db.add(new_subj)
            subj_list.append({
                "code": code,
                "name": name,
                "credits": credits_val,
                "semester": p_step1.semester.strip(),
                "proficiency": prof_level,
                "needs_improvement": needs_imp,
                "topics": topics,
            })
    else:
        # Fallback to default subjects for the semester
        for item in DEFAULT_SUBJECTS_CATALOG:
            prof_level = p_step3.subject_proficiencies.get(item["code"], "Intermediate")
            needs_imp = item["code"] in p_step2.improvement_subjects
            new_subj = Subject(
                user_id=current_user.id,
                name=item["name"],
                code=item["code"],
                semester=p_step1.semester.strip(),
                credits=item["credits"],
                proficiency=prof_level,
                needs_improvement=needs_imp,
                topics=item["topics"],
            )
            db.add(new_subj)
            subj_list.append({
                "code": item["code"],
                "name": item["name"],
                "credits": item["credits"],
                "semester": p_step1.semester.strip(),
                "proficiency": prof_level,
                "needs_improvement": needs_imp,
                "topics": item["topics"],
            })

    profile.subjects_list = subj_list
    profile.onboarding_completed = True
    profile.updated_at = utc_now()

    db.commit()
    db.refresh(profile)

    return {
        "status": "ok",
        "message": "Academic onboarding completed successfully! Recommendations ready.",
        "onboarding_completed": True,
    }


@router.put("/profile")
def update_academic_profile(
    payload: AcademicProfileUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Allows returning students to modify their academic profile, subjects,
    academic targets, and learning preferences without losing bookmarks or planner data.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if payload.degree is not None:
        profile.course = payload.degree.strip()
    if payload.branch is not None:
        profile.branch = payload.branch.strip()
        profile.major = f"{profile.course or ''} - {payload.branch.strip()}"
    if payload.academic_year is not None:
        profile.academic_year = payload.academic_year.strip()
    if payload.semester is not None:
        profile.semester = payload.semester.strip()
    if payload.curriculum is not None:
        profile.curriculum = payload.curriculum.strip()
    if payload.college_name is not None:
        profile.college = payload.college_name.strip()
    if payload.college_id is not None:
        profile.college_id = payload.college_id
    if payload.university_id is not None:
        profile.university_id = payload.university_id
    if payload.target_gpa is not None:
        profile.target_gpa = payload.target_gpa

    if payload.goals is not None:
        profile.academic_goals = payload.goals
    if payload.preferences is not None:
        profile.learning_preferences = payload.preferences

    # If subjects were updated, reflect in Subject table and subjects_list
    if payload.subjects is not None:
        db.query(Subject).filter(Subject.user_id == current_user.id).delete()
        subj_list = []
        for s in payload.subjects:
            code = s.get("code", "SUB").strip()
            name = s.get("name", "Subject").strip()
            credits_val = int(s.get("credits", 3))
            prof = s.get("proficiency", "Intermediate")
            needs_imp = bool(s.get("needs_improvement", False))

            catalog_match = next((d for d in DEFAULT_SUBJECTS_CATALOG if d["code"].lower() == code.lower()), None)
            topics = s.get("topics") or (catalog_match["topics"] if catalog_match else [f"{name} Fundamentals"])

            new_subj = Subject(
                user_id=current_user.id,
                name=name,
                code=code,
                semester=profile.semester or "5th Semester",
                credits=credits_val,
                proficiency=prof,
                needs_improvement=needs_imp,
                topics=topics,
            )
            db.add(new_subj)
            subj_list.append({
                "code": code,
                "name": name,
                "credits": credits_val,
                "semester": profile.semester or "5th Semester",
                "proficiency": prof,
                "needs_improvement": needs_imp,
                "topics": topics,
            })
        profile.subjects_list = subj_list

    profile.updated_at = utc_now()
    db.commit()
    db.refresh(profile)

    return {
        "status": "ok",
        "message": "Academic profile updated successfully.",
    }


@router.get("/subjects")
def get_enrolled_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the list of subjects enrolled by the student."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    subjects = _ensure_student_subjects(current_user.id, profile, db)
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "semester": s.semester,
            "credits": s.credits,
            "proficiency": s.proficiency,
            "needs_improvement": s.needs_improvement,
            "topics": s.topics or [],
        }
        for s in subjects
    ]


@router.post("/resources/{resource_id}/toggle-save")
def toggle_save_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bookmarks or un-bookmarks an academic resource for the student."""
    resource = db.query(AcademicResource).filter(AcademicResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Academic resource not found")

    existing = (
        db.query(SavedItem)
        .filter(
            SavedItem.user_id == current_user.id,
            SavedItem.kind == "resource",
            SavedItem.ref_id == resource_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "ok", "saved": False, "message": "Resource removed from saved bookmarks."}

    new_saved = SavedItem(
        user_id=current_user.id,
        kind="resource",
        ref_id=resource_id,
        title=resource.title,
        item_meta={
            "subject_code": resource.subject_code,
            "subject_name": resource.subject_name,
            "resource_type": resource.resource_type,
            "url": resource.url,
            "provenance": resource.provenance,
        },
    )
    db.add(new_saved)
    db.commit()
    db.refresh(new_saved)
    return {
        "status": "ok",
        "saved": True,
        "saved_id": new_saved.id,
        "message": f"Saved '{resource.title}' to your bookmarks.",
    }
