from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import AskAiRequest, AskAiResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/ask", response_model=AskAiResponse)
def ask_ai(
    req: AskAiRequest,
    current_user: User = Depends(get_current_user)
):
    reply = gemini_service.ask_assistant(req.prompt, req.context)
    return {"reply": reply, "source": "gemini-ai"}
