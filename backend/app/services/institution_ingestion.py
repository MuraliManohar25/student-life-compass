import re
import csv
import io
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    University,
    College,
    CollegeUniversityAffiliation,
    DatasetImport,
    utc_now,
    generate_uuid,
)

# Standard Indian State and UT Normalization Mapping
STATE_MAPPINGS: Dict[str, str] = {
    "andhra pradesh": "Andhra Pradesh",
    "ap": "Andhra Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    "assam": "Assam",
    "bihar": "Bihar",
    "chhattisgarh": "Chhattisgarh",
    "cg": "Chhattisgarh",
    "delhi": "Delhi",
    "nct of delhi": "Delhi",
    "new delhi": "Delhi",
    "goa": "Goa",
    "gujarat": "Gujarat",
    "haryana": "Haryana",
    "himachal pradesh": "Himachal Pradesh",
    "hp": "Himachal Pradesh",
    "jammu and kashmir": "Jammu and Kashmir",
    "j&k": "Jammu and Kashmir",
    "jharkhand": "Jharkhand",
    "karnataka": "Karnataka",
    "ka": "Karnataka",
    "kerala": "Kerala",
    "kl": "Kerala",
    "madhya pradesh": "Madhya Pradesh",
    "mp": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "mh": "Maharashtra",
    "manipur": "Manipur",
    "meghalaya": "Meghalaya",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "odisha": "Odisha",
    "orissa": "Odisha",
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil nadu": "Tamil Nadu",
    "tn": "Tamil Nadu",
    "telangana": "Telangana",
    "ts": "Telangana",
    "tripura": "Tripura",
    "uttar pradesh": "Uttar Pradesh",
    "up": "Uttar Pradesh",
    "uttarakhand": "Uttarakhand",
    "uk": "Uttarakhand",
    "west bengal": "West Bengal",
    "wb": "West Bengal",
    "chandigarh": "Chandigarh",
    "puducherry": "Puducherry",
    "pondicherry": "Puducherry",
}


def normalize_text(val: Optional[str]) -> str:
    """Strip excess whitespace and sanitize."""
    if not val:
        return ""
    cleaned = re.sub(r"\s+", " ", str(val)).strip()
    # CSV Formula Injection Guard: sanitize leading formula triggers
    if cleaned and cleaned[0] in ("=", "+", "-", "@"):
        cleaned = "'" + cleaned
    return cleaned


def normalize_search_name(name: Optional[str]) -> str:
    """Produces clean normalized search token for indexing and fuzzy comparison."""
    if not name:
        return ""
    text_lower = name.lower()
    # Remove punctuation, symbols, brackets
    cleaned = re.sub(r"[^\w\s]", " ", text_lower)
    # Condense multiple spaces
    return re.sub(r"\s+", " ", cleaned).strip()


def normalize_state(state_input: Optional[str]) -> str:
    """Normalizes state string against controlled standard mapping."""
    if not state_input:
        return "Unknown"
    norm_key = re.sub(r"[^\w\s]", "", state_input.lower()).strip()
    return STATE_MAPPINGS.get(norm_key, state_input.strip().title())


def validate_file_content(
    file_bytes: bytes, filename: str
) -> Tuple[bool, Optional[str], Optional[List[Dict[str, Any]]]]:
    """Validates file type, size, and parses to a standard list of record dictionaries."""
    max_size = 50 * 1024 * 1024  # 50 MB
    if len(file_bytes) > max_size:
        return False, "File exceeds maximum permitted size of 50 MB.", None

    lower_name = filename.lower()
    records: List[Dict[str, Any]] = []

    try:
        if lower_name.endswith(".json"):
            content = json.loads(file_bytes.decode("utf-8", errors="replace"))
            if isinstance(content, list):
                records = content
            elif isinstance(content, dict) and "data" in content and isinstance(content["data"], list):
                records = content["data"]
            elif isinstance(content, dict) and "records" in content and isinstance(content["records"], list):
                records = content["records"]
            else:
                return False, "JSON file must contain an array of objects or an object with a 'data' array.", None

        elif lower_name.endswith(".csv"):
            text_stream = io.StringIO(file_bytes.decode("utf-8", errors="replace"))
            reader = csv.DictReader(text_stream)
            records = [row for row in reader]

        elif lower_name.endswith(".xlsx"):
            try:
                import openpyxl
                wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
                ws = wb.active
                rows = list(ws.iter_rows(values_only=True))
                if not rows or len(rows) < 2:
                    return False, "XLSX file must contain at least a header and one data row.", None
                headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(rows[0])]
                for row_vals in rows[1:]:
                    if any(v is not None for v in row_vals):
                        record = {headers[i]: v for i, v in enumerate(row_vals) if i < len(headers)}
                        records.append(record)
            except ImportError:
                return False, "openpyxl is not installed. Please upload CSV or JSON.", None

        else:
            return False, "Unsupported file format. Please upload a valid CSV, XLSX, or JSON file.", None

    except Exception as parse_err:
        return False, f"Failed to parse file: {str(parse_err)}", None

    return True, None, records


class InstitutionIngestionService:
    def __init__(self, db: Session):
        self.db = db

    def process_import(
        self,
        records: List[Dict[str, Any]],
        dataset_name: str,
        source: str,
        version: str = "",
        licence_info: str = "Open Government Data License (OGDL) India",
        imported_by_user_id: Optional[int] = None,
    ) -> DatasetImport:
        """Processes and upserts a list of institution records idempotently with auditing."""
        import_record = DatasetImport(
            id=generate_uuid(),
            dataset_name=dataset_name,
            source=source,
            version=version,
            licence_info=licence_info,
            status="processing",
            imported_by_user_id=imported_by_user_id,
            created_at=utc_now(),
        )
        self.db.add(import_record)
        self.db.flush()

        inserted_count = 0
        updated_count = 0
        skipped_count = 0
        duplicated_count = 0
        failed_count = 0
        error_logs: List[Dict[str, Any]] = []

        # Cache existing universities and colleges by AISHE code & normalized name
        univ_by_aishe = {u.aishe_code: u for u in self.db.query(University).all() if u.aishe_code}
        univ_by_norm = {f"{u.normalized_name}|{u.state}": u for u in self.db.query(University).all()}
        colleges_by_aishe = {c.aishe_code: c for c in self.db.query(College).all() if c.aishe_code}

        for row_idx, raw_row in enumerate(records):
            try:
                # Standardize field lookups (handle varying CSV header cases)
                row = {str(k).strip().lower().replace(" ", "_"): v for k, v in raw_row.items() if k is not None}

                rec_type = row.get("type", row.get("institution_category", "college")).lower()
                name = normalize_text(row.get("name") or row.get("college_name") or row.get("university_name"))
                if not name:
                    skipped_count += 1
                    continue

                aishe_code = normalize_text(row.get("aishe_code") or row.get("aishe_id") or row.get("code")) or None
                raw_state = normalize_text(row.get("state") or row.get("state_name"))
                state = normalize_state(raw_state)
                district = normalize_text(row.get("district") or row.get("district_name"))
                city = normalize_text(row.get("city") or row.get("town"))
                website = normalize_text(row.get("website") or row.get("official_website") or row.get("url"))
                norm_name = normalize_search_name(name)

                if "university" in rec_type or aishe_code and aishe_code.startswith("U-"):
                    # Process University Record
                    existing_univ = None
                    if aishe_code and aishe_code in univ_by_aishe:
                        existing_univ = univ_by_aishe[aishe_code]
                    elif f"{norm_name}|{state}" in univ_by_norm:
                        existing_univ = univ_by_norm[f"{norm_name}|{state}"]

                    if existing_univ:
                        # Idempotent update: never overwrite verified record with lower quality data
                        if existing_univ.verification_status != "verified":
                            existing_univ.name = name
                            existing_univ.city = city or existing_univ.city
                            existing_univ.district = district or existing_univ.district
                            existing_univ.official_website = website or existing_univ.official_website
                            existing_univ.updated_at = utc_now()
                        updated_count += 1
                        duplicated_count += 1
                    else:
                        new_univ = University(
                            id=generate_uuid(),
                            aishe_code=aishe_code,
                            name=name,
                            normalized_name=norm_name,
                            university_type=normalize_text(row.get("university_type", "State Public University")),
                            city=city,
                            district=district,
                            state=state,
                            official_website=website,
                            recognition_status=normalize_text(row.get("recognition_status", "UGC_RECOGNIZED")),
                            verification_status="verified",
                            source_dataset=dataset_name,
                            source_record_id=str(row.get("id") or ""),
                            created_at=utc_now(),
                            updated_at=utc_now(),
                        )
                        self.db.add(new_univ)
                        if aishe_code:
                            univ_by_aishe[aishe_code] = new_univ
                        univ_by_norm[f"{norm_name}|{state}"] = new_univ
                        inserted_count += 1

                else:
                    # Process College Record
                    existing_college = None
                    if aishe_code and aishe_code in colleges_by_aishe:
                        existing_college = colleges_by_aishe[aishe_code]
                    else:
                        # Conservative match by name + state + district
                        existing_college = (
                            self.db.query(College)
                            .filter(
                                College.normalized_name == norm_name,
                                College.state == state,
                                College.district == district,
                            )
                            .first()
                        )

                    target_college = existing_college
                    if existing_college:
                        if existing_college.verification_status != "verified":
                            existing_college.name = name
                            existing_college.city = city or existing_college.city
                            existing_college.district = district or existing_college.district
                            existing_college.official_website = website or existing_college.official_website
                            existing_college.updated_at = utc_now()
                        updated_count += 1
                        duplicated_count += 1
                    else:
                        target_college = College(
                            id=generate_uuid(),
                            aishe_code=aishe_code,
                            name=name,
                            normalized_name=norm_name,
                            institution_type=normalize_text(row.get("institution_type", "Affiliated College")),
                            city=city,
                            district=district,
                            state=state,
                            country="India",
                            postal_code=normalize_text(row.get("postal_code") or row.get("pincode")),
                            official_website=website,
                            institution_status=normalize_text(row.get("institution_status", "Active")),
                            verification_status="verified",
                            source_dataset=dataset_name,
                            source_record_id=str(row.get("id") or ""),
                            created_at=utc_now(),
                            updated_at=utc_now(),
                        )
                        self.db.add(target_college)
                        if aishe_code:
                            colleges_by_aishe[aishe_code] = target_college
                        inserted_count += 1

                    # Process Affiliation if University Info is present
                    affil_univ_name = normalize_text(row.get("affiliated_university") or row.get("university_name"))
                    affil_univ_aishe = normalize_text(row.get("university_aishe_code") or row.get("university_code"))
                    evidence_url = normalize_text(row.get("evidence_url") or row.get("affiliation_evidence_url"))
                    evidence_src = normalize_text(row.get("evidence_source_type", "official_university_gazette"))

                    matched_univ = None
                    if affil_univ_aishe and affil_univ_aishe in univ_by_aishe:
                        matched_univ = univ_by_aishe[affil_univ_aishe]
                    elif affil_univ_name:
                        norm_u_name = normalize_search_name(affil_univ_name)
                        matched_univ = univ_by_norm.get(f"{norm_u_name}|{state}")
                        if not matched_univ:
                            # Search partial without state
                            matched_univ = (
                                self.db.query(University)
                                .filter(University.normalized_name == norm_u_name)
                                .first()
                            )

                    if matched_univ and target_college:
                        self.db.flush()
                        existing_affil = (
                            self.db.query(CollegeUniversityAffiliation)
                            .filter(
                                CollegeUniversityAffiliation.college_id == target_college.id,
                                CollegeUniversityAffiliation.university_id == matched_univ.id,
                            )
                            .first()
                        )
                        # Require evidence URL for verified status; otherwise unverified / pending_review
                        ver_status = "verified" if evidence_url else "unverified"

                        if existing_affil:
                            if existing_affil.verification_status != "verified" and ver_status == "verified":
                                existing_affil.verification_status = "verified"
                                existing_affil.evidence_url = evidence_url
                                existing_affil.evidence_source_type = evidence_src
                                existing_affil.evidence_checked_at = utc_now()
                                existing_affil.updated_at = utc_now()
                        else:
                            new_affil = CollegeUniversityAffiliation(
                                id=generate_uuid(),
                                college_id=target_college.id,
                                university_id=matched_univ.id,
                                relationship_type=normalize_text(row.get("relationship_type", "affiliated")),
                                verification_status=ver_status,
                                evidence_url=evidence_url or None,
                                evidence_source_type=evidence_src if evidence_url else None,
                                evidence_checked_at=utc_now() if evidence_url else None,
                                confidence_score=1.0 if evidence_url else 0.5,
                                created_at=utc_now(),
                                updated_at=utc_now(),
                            )
                            self.db.add(new_affil)

            except Exception as row_err:
                failed_count += 1
                if len(error_logs) < 50:
                    error_logs.append({"row_index": row_idx, "error": str(row_err), "row_sample": str(raw_row)[:150]})

        import_record.records_inserted = inserted_count
        import_record.records_updated = updated_count
        import_record.records_skipped = skipped_count
        import_record.records_duplicated = duplicated_count
        import_record.records_failed = failed_count
        import_record.error_summary = error_logs
        import_record.status = "completed" if failed_count == 0 else "partially_failed"
        import_record.completed_at = utc_now()

        self.db.commit()
        self.db.refresh(import_record)
        return import_record
