"""
Email validation service for Student Life Compass.

Validation pipeline:
  1. Basic syntax check (local part + domain present, no obvious malform)
  2. Typo-domain rejection (gamil.com, gmial.com, etc.)
  3. Known fake/disposable domain rejection
  4. email_validator library check (RFC-compliant syntax)
  5. External Email Verification API (AbstractAPI / ZeroBounce / compatible)
     — Only runs if EMAIL_VERIFICATION_API_URL and EMAIL_VERIFICATION_API_KEY are configured.
     — If not configured, a warning is logged and steps 1-4 are used as fallback.

Limitation: Without an external API, we cannot guarantee a mailbox exists.
Steps 1-4 only prove format validity and domain legitimacy; they do NOT
confirm that the mailbox (e.g. john@gmail.com) actually exists.
The external API provides the strongest available deliverability check.
"""

import re
import logging
from typing import Tuple
from email_validator import validate_email, EmailNotValidError
from app.core.config import settings

logger = logging.getLogger("student_life_compass.email_validation")


# ---------------------------------------------------------------------------
# Typo-domain map — clearly misspelled versions of common providers
# ---------------------------------------------------------------------------
TYPO_DOMAINS = {
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gamil.co": "gmail.com",
    "gmailcom": "gmail.com",
    "yaho.com": "yahoo.com",
    "yahuo.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    "outlok.com": "outlook.com",
    "outluk.com": "outlook.com",
    "outllook.com": "outlook.com",
    "maiks.com": "gmail.com",   # common typo seen in user reports
    "protonmai.com": "proton.me",
    "protonmails.com": "proton.me",
}

# ---------------------------------------------------------------------------
# Known fake / disposable / test domains
# ---------------------------------------------------------------------------
FAKE_DOMAINS = {
    "fakeemail.com",
    "fakeemail123.com",
    "fake.com",
    "invalid.com",
    "invaliddomain.xyz",
    "tempmail.com",
    "tempmail.org",
    "temp-mail.org",
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
    "trashmail.com",
    "throwam.com",
    "yopmail.com",
    "sharklasers.com",
    "dispostable.com",
    "maildrop.cc",
    "getairmail.com",
    "spamgourmet.com",
    "spamgourmet.net",
    "spamgourmet.org",
    "mailnull.com",
    "spamspot.com",
}

# Domain name keywords that indicate fake/test usage
BLOCKED_DOMAIN_KEYWORDS = {"fake", "invalid", "test", "demo", "example", "noreply"}


def _syntax_check(email: str) -> Tuple[bool, str, str]:
    """
    Run fast structural checks before calling the library.
    Returns (ok, normalized_email_or_empty, error_message_or_empty).
    """
    if not email or not isinstance(email, str):
        return False, "", "Email address cannot be empty."

    email = email.strip().lower()

    if "@" not in email or email.count("@") != 1:
        return False, "", "Invalid email format — must contain exactly one '@'."

    local_part, domain = email.split("@", 1)

    if not local_part:
        return False, "", "Invalid email — the part before '@' cannot be empty."

    if not domain or "." not in domain:
        return False, "", f"Invalid email domain '@{domain}'. Domain must include an extension (e.g. .com, .org)."

    domain_label = domain.split(".")[0]
    if domain_label in BLOCKED_DOMAIN_KEYWORDS or domain in BLOCKED_DOMAIN_KEYWORDS:
        return False, "", f"Disposable or test domain '@{domain}' is not permitted."

    if domain in TYPO_DOMAINS:
        suggestion = TYPO_DOMAINS[domain]
        return False, "", f"Invalid domain '@{domain}'. Did you mean '@{suggestion}'?"

    if domain in FAKE_DOMAINS:
        return False, "", f"Fake or disposable email domain '@{domain}' is not allowed."

    # RFC-compliant library check
    try:
        validated = validate_email(email, check_deliverability=False)
        return True, validated.normalized, ""
    except EmailNotValidError as exc:
        return False, "", f"Invalid email format: {exc}"
    except Exception:
        # Regex fallback
        if re.match(r"^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$", email):
            return True, email, ""
        return False, "", "Invalid email format."


def _call_verification_api(email: str) -> Tuple[bool, str]:
    """
    Call the configured external email verification API.

    Supported providers (auto-detected by URL):
      • AbstractAPI  — https://emailvalidation.abstractapi.com/v1/
      • ZeroBounce   — https://api.zerobounce.net/v2/validate
      • Generic      — any URL that accepts ?api_key=KEY&email=EMAIL
                       and returns JSON with a top-level 'deliverability'
                       or 'status' field.

    Returns:
        (is_valid: bool, reason: str)
    """
    api_url = settings.EMAIL_VERIFICATION_API_URL.strip()
    api_key = settings.EMAIL_VERIFICATION_API_KEY.strip()

    if not api_url or not api_key:
        logger.warning(
            "EMAIL_VERIFICATION_API_URL / EMAIL_VERIFICATION_API_KEY not configured. "
            "Skipping external mailbox check — only syntax and typo-domain validation applied."
        )
        return True, "api_not_configured"

    try:
        import urllib.request
        import urllib.parse
        import json

        params = urllib.parse.urlencode({"api_key": api_key, "email": email})
        full_url = f"{api_url}?{params}"

        req = urllib.request.Request(full_url, headers={"User-Agent": "StudentLifeCompass/1.0"})
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode())

        # ---- AbstractAPI response ----
        # { "deliverability": "DELIVERABLE" | "UNDELIVERABLE" | "UNKNOWN", ... }
        if "deliverability" in data:
            deliverability = str(data["deliverability"]).upper()
            if deliverability == "DELIVERABLE":
                return True, "deliverable"
            elif deliverability == "UNDELIVERABLE":
                return False, "undeliverable"
            else:
                # UNKNOWN — be permissive, log it
                logger.info("Email verification API returned UNKNOWN for %s — allowing registration.", email)
                return True, "unknown"

        # ---- ZeroBounce response ----
        # { "status": "valid" | "invalid" | "catch-all" | "unknown" | ... }
        if "status" in data:
            status = str(data["status"]).lower()
            if status in ("valid", "catch-all"):
                return True, status
            elif status == "unknown":
                logger.info("ZeroBounce returned unknown for %s — allowing registration.", email)
                return True, "unknown"
            else:
                return False, status

        # Unknown provider response shape — be permissive
        logger.warning("Email verification API returned unrecognised shape for %s: %s", email, data)
        return True, "unrecognised_response"

    except Exception as exc:
        # Never block registration on API failure — degrade gracefully
        logger.error("Email verification API call failed for %s: %s. Allowing registration.", email, exc)
        return True, f"api_error:{exc}"


def validate_email_address(email: str) -> Tuple[bool, str, str]:
    """
    Main entry point for email validation.

    Pipeline:
      1. Syntax + typo + fake-domain checks (always run)
      2. External deliverability API (only if configured)

    Returns:
        (is_valid: bool, normalized_email: str, error_message: str)
    """
    ok, normalized, error = _syntax_check(email)
    if not ok:
        return False, "", error

    api_valid, reason = _call_verification_api(normalized)
    if not api_valid:
        return (
            False,
            "",
            "Please enter a valid existing email address. "
            "The email address you entered could not be verified.",
        )

    return True, normalized, ""


# ---------------------------------------------------------------------------
# Backward-compat alias (auth.py previously imported validate_student_email)
# ---------------------------------------------------------------------------
validate_student_email = validate_email_address
