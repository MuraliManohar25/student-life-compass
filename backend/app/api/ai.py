from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, AIConversation
from app.services.student_service import student_context
from app.schemas.schemas import AskAiRequest, AskAiResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/ask", response_model=AskAiResponse)
def ask_ai(
    req: AskAiRequest,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    context = student_context(db, current_user.id)
    reply, used_real_ai = gemini_service.ask_assistant(req.prompt, context)
    if not used_real_ai:
        finance = context["finance"]
        reply = (f"Your current month has ₹{finance['remaining_budget']:.0f} remaining from a ₹{finance['monthly_budget']:.0f} budget. "
                 f"I can see {len(context['tasks'])} incomplete tasks. I don't have enough data to answer more specifically.")
    db.add(AIConversation(user_id=current_user.id, prompt=req.prompt, reply=reply)); db.commit()
    return {"reply": reply, "source": "gemini-ai" if used_real_ai else "student-data fallback"}
