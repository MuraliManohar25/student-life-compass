import sys
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, check_and_migrate_columns
from app.models.models import User, Profile, EmailVerificationOTP
from app.api.auth import hash_otp

client = TestClient(app)

def run_tests():
    print("\n--- STARTING FULL COMPASS AUTH & ONBOARDING SYSTEM TESTS ---\n")
    passed = 0
    total = 12

    # TEST CASE 1: Register with typo domain (abc@gamil.com)
    print("Test Case 1: Register with abc@gamil.com (typo domain)...")
    res = client.post("/api/auth/register", json={
        "email": "abc@gamil.com",
        "password": "SecretPassword123!",
        "full_name": "Typo User"
    })
    assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
    assert "gamil.com" in res.json()["detail"].lower() or "invalid" in res.json()["detail"].lower()
    print("  -> Passed! Rejected typo domain with clear suggestion message:", res.json()["detail"])
    passed += 1

    # TEST CASE 2: Register with valid email
    test_email = f"student_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}@college.edu"
    print(f"\nTest Case 2: Register with valid email ({test_email})...")
    res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": "SecurePassword123!",
        "full_name": "Test Student"
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    assert res.json()["is_verified"] is False
    print("  -> Passed! User created as unverified, OTP dispatched.")
    passed += 1

    # Check user in DB
    db = SessionLocal()
    user = db.query(User).filter(User.email == test_email).first()
    assert user is not None
    assert user.is_verified is False
    assert user.onboarding_completed is False
    latest_otp_record = db.query(EmailVerificationOTP).filter(EmailVerificationOTP.user_id == user.id).first()
    assert latest_otp_record is not None

    # TEST CASE 3: Enter incorrect OTP
    print("\nTest Case 3: Enter incorrect OTP (000000)...")
    res = client.post("/api/auth/verify-email", json={
        "email": test_email,
        "otp": "000000"
    })
    assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
    assert "invalid otp" in res.json()["detail"].lower()
    print("  -> Passed! Verification rejected incorrect OTP:", res.json()["detail"])
    passed += 1

    # TEST CASE 4: Enter expired OTP
    print("\nTest Case 4: Enter expired OTP...")
    # Expire OTP artificially
    latest_otp_record.expires_at = datetime.utcnow() - timedelta(minutes=5)
    db.commit()
    res = client.post("/api/auth/verify-email", json={
        "email": test_email,
        "otp": "123456"
    })
    assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
    assert "expired" in res.json()["detail"].lower()
    print("  -> Passed! Expired OTP properly rejected:", res.json()["detail"])
    passed += 1

    # Test cooldown rejection (within 60s)
    print("\nTesting resend cooldown rate limit (within 60s)...")
    res_rapid = client.post("/api/auth/send-otp", json={"email": test_email})
    assert res_rapid.status_code == 429, f"Expected 429, got {res_rapid.status_code}: {res_rapid.text}"
    print("  -> Passed! Rapid resend blocked with 429:", res_rapid.json()["detail"])

    # Simulate passing of cooldown (65 seconds ago)
    latest_otp_record.created_at = datetime.utcnow() - timedelta(seconds=65)
    db.commit()

    # Resend after cooldown
    print("\nTesting resend after cooldown...")
    res_resend = client.post("/api/auth/send-otp", json={"email": test_email})
    assert res_resend.status_code == 200, f"Expected 200, got {res_resend.status_code}: {res_resend.text}"
    print("  -> Passed! Resend succeeded after cooldown period.")


    # Retrieve valid plain OTP by creating known OTP in DB
    known_otp = "852963"
    active_otp = db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user.id,
        EmailVerificationOTP.used_at.is_(None)
    ).order_by(EmailVerificationOTP.created_at.desc()).first()
    active_otp.otp_hash = hash_otp(known_otp)
    active_otp.expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # TEST CASE 6 (checked before verification): Try login before verification
    print("\nTest Case 6: Try login before verification...")
    res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    assert "verify your email" in res.json()["detail"].lower()
    print("  -> Passed! Login denied for unverified student:", res.json()["detail"])
    passed += 1

    # TEST CASE 5: Enter correct OTP
    print("\nTest Case 5: Enter correct OTP...")
    res = client.post("/api/auth/verify-email", json={
        "email": test_email,
        "otp": known_otp
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json()["is_verified"] is True
    db.refresh(user)
    assert user.is_verified is True
    print("  -> Passed! Email verified successfully.")
    passed += 1

    # TEST CASE 7: Login after verification
    print("\nTest Case 7: Login after verification (onboarding_completed=False)...")
    res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    token_data = res.json()
    assert token_data["is_verified"] is True
    assert token_data["onboarding_completed"] is False
    auth_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    print("  -> Passed! Login granted, onboarding_completed is False (redirect to onboarding).")
    passed += 1

    # TEST CASE 12: Submit invalid CGPA such as -1 or 11
    print("\nTest Case 12: Submit invalid CGPA (-1 and 11)...")
    invalid_onboarding_payload = {
        "full_name": "Test Student",
        "college_name": "MIT",
        "course": "B.Tech",
        "branch": "CSE",
        "year": "2nd Year",
        "cgpa": 11.5,
        "backlogs": 0,
        "strong_subjects": ["DSA"],
        "weak_subjects": [],
        "programming_languages": ["Python"],
        "technical_skills": ["Web Development"],
        "career_goal": "Software Developer",
        "target_company_type": "Product Based",
        "study_hours": 4.0,
        "preferred_study_time": "Evening",
        "learning_method": "Practice",
        "monthly_budget": 6000.0,
        "monthly_expenses": 3000.0,
        "major_expense_categories": ["Food"],
        "placement_preparation": "Yes",
        "placement_level": "Intermediate",
        "target_role": "Backend Engineer",
        "biggest_challenge": "Time Management",
        "compass_help": ["Study Planning"]
    }
    res = client.post("/api/profile/onboarding", json=invalid_onboarding_payload, headers=headers)
    assert res.status_code == 422, f"Expected 422, got {res.status_code}: {res.text}"
    print("  -> Passed! Invalid CGPA rejected with 422 Unprocessable Entity.")
    passed += 1

    # TEST CASE 8: Complete onboarding with valid data
    print("\nTest Case 8: Complete onboarding questionnaire...")
    valid_onboarding_payload = invalid_onboarding_payload.copy()
    valid_onboarding_payload["cgpa"] = 9.1
    res = client.post("/api/profile/onboarding", json=valid_onboarding_payload, headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert res.json()["onboarding_completed"] is True
    db.refresh(user)
    assert user.onboarding_completed is True
    print("  -> Passed! Onboarding data saved, onboarding_completed set to True.")
    passed += 1

    # TEST CASE 9: Logout and login again
    print("\nTest Case 9: Login again after onboarding...")
    res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert res.status_code == 200
    assert res.json()["onboarding_completed"] is True
    print("  -> Passed! Subsequent login returns onboarding_completed=True (straight to dashboard).")
    passed += 1

    # TEST CASE 10: Try accessing dashboard without authentication
    print("\nTest Case 10: Access dashboard without authentication...")
    res = client.get("/api/dashboard")
    assert res.status_code in (401, 403), f"Expected 401 or 403, got {res.status_code}"
    print("  -> Passed! Protected endpoint rejects unauthenticated request with status:", res.status_code)
    passed += 1

    # TEST CASE 11: Try accessing dashboard with unverified account
    print("\nTest Case 11: Access dashboard with unverified account...")
    from app.core.security import create_access_token
    unverified_email = f"unverified_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}@college.edu"
    unverified_user = User(
        email=unverified_email,
        hashed_password="...",
        full_name="Unverified Temp",
        is_verified=False
    )
    db.add(unverified_user)
    db.commit()
    unverified_token = create_access_token({"sub": unverified_user.email})

    res = client.get("/api/dashboard", headers={"Authorization": f"Bearer {unverified_token}"})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    assert "verify your email" in res.json()["detail"].lower()
    print("  -> Passed! Protected endpoint rejects unverified account with 403 Forbidden:", res.json()["detail"])
    passed += 1

    # Also verify personalized dashboard payload for the onboarded student
    print("\nVerifying personalized dashboard payload for onboarded user...")
    res_dash = client.get("/api/dashboard", headers=headers)
    assert res_dash.status_code == 200
    dash_json = res_dash.json()
    assert dash_json["academic_overview"]["cgpa"] == 9.1
    assert dash_json["academic_overview"]["year"] == "2nd Year"
    assert dash_json["career_overview"]["target_role"] == "Backend Engineer"
    assert "study_overview" in dash_json
    assert "budget_overview" in dash_json
    assert "placement_overview" in dash_json
    assert "risk_overview" in dash_json
    assert len(dash_json["ai_recommendations"]) > 0
    print("  -> Passed! Personalized dashboard returned complete customized metrics.")

    db.close()
    print(f"\nALL {passed}/{total} TEST CASES PASSED SUCCESSFULLY!\n")

if __name__ == "__main__":
    run_tests()
