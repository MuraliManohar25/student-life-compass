import json
from pathlib import Path
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import College, University
from app.services.institution_ingestion import InstitutionIngestionService


def seed_institutions(db: Session) -> None:
    """Seeds the master College and University dataset if empty."""
    college_count = db.query(College).count()
    university_count = db.query(University).count()

    if college_count > 0 and university_count > 0:
        print("College and University data already exist; skipping institution seed.")
        return

    seed_file = Path(__file__).parent / "data" / "seed_institutions.json"
    with seed_file.open("r", encoding="utf-8") as f:
        records = json.load(f)

    service = InstitutionIngestionService(db)
    import_result = service.process_import(
        records=records,
        dataset_name="AISHE_UGC_SEED_V1",
        source="Official AISHE / UGC Statutory Records",
        version="2024.1",
        licence_info="Open Government Data License (OGDL) India",
    )
    failed_count = getattr(import_result, "records_failed")
    if failed_count > 0:
        raise RuntimeError(
            f"Institution import completed with {failed_count} "
            f"failed record(s): {import_result.error_summary}"
        )
    print("Successfully seeded College & University Master Dataset.")


def main() -> None:
    db = SessionLocal()
    try:
        seed_institutions(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
