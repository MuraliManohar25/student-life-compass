from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL

# Fix legacy postgres:// URI scheme for SQLAlchemy 2.0 / Supabase
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs["connect_args"] = connect_args
else:
    # PostgreSQL / Supabase optimized connection pooling
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_and_migrate_columns():
    """Ensure newly added columns exist in existing database tables."""
    from sqlalchemy import inspect, text
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if "users" in tables:
            user_cols = {col["name"] for col in inspector.get_columns("users")}
            with engine.begin() as conn:
                if "is_verified" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0"))
                if "email_verified_at" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN email_verified_at DATETIME"))
                if "onboarding_completed" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0"))

        if "profiles" in tables:
            profile_cols = {col["name"] for col in inspector.get_columns("profiles")}
            with engine.begin() as conn:
                new_profile_cols = [
                    ("college_name", "VARCHAR DEFAULT ''"),
                    ("course", "VARCHAR DEFAULT ''"),
                    ("branch", "VARCHAR DEFAULT ''"),
                    ("year", "VARCHAR DEFAULT '1st Year'"),
                    ("cgpa", "FLOAT DEFAULT 0.0"),
                    ("backlogs", "INTEGER DEFAULT 0"),
                    ("strong_subjects", "JSON DEFAULT '[]'"),
                    ("weak_subjects", "JSON DEFAULT '[]'"),
                    ("programming_languages", "JSON DEFAULT '[]'"),
                    ("technical_skills", "JSON DEFAULT '[]'"),
                    ("career_goal", "VARCHAR DEFAULT ''"),
                    ("target_company_type", "VARCHAR DEFAULT 'Any Good Opportunity'"),
                    ("study_hours", "FLOAT DEFAULT 3.0"),
                    ("preferred_study_time", "VARCHAR DEFAULT 'Evening'"),
                    ("learning_method", "VARCHAR DEFAULT 'Mixed'"),
                    ("monthly_budget", "FLOAT DEFAULT 5000.0"),
                    ("monthly_expenses", "FLOAT DEFAULT 0.0"),
                    ("major_expense_categories", "JSON DEFAULT '[]'"),
                    ("placement_preparation", "VARCHAR DEFAULT 'No'"),
                    ("placement_level", "VARCHAR DEFAULT 'Beginner'"),
                    ("biggest_challenge", "VARCHAR DEFAULT ''"),
                    ("compass_help", "JSON DEFAULT '[]'"),
                    ("onboarding_completed", "BOOLEAN DEFAULT 0")
                ]
                for col_name, col_type in new_profile_cols:
                    if col_name not in profile_cols:
                        conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_type}"))
    except Exception as e:
        # Ignore if tables are newly created or already migrated
        pass

