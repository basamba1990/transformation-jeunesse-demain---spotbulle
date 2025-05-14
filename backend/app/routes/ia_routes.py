from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas import user_schema, ia_schema
from ..services import ia_service
from ..utils import security
from ..database import get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

ia_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/ia",
    tags=["IA"],
    dependencies=[Depends(security.get_current_active_user)],
    responses={404: {"description": "Not found"}}
)

@router.get("/matches", response_model=List[ia_schema.MatchResult])
@ia_router_limiter.limit("20/minute")
async def get_user_matches(
    request: Request,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    use_openai_embeddings: bool = False
):
    if limit > 50:
        limit = 50
    
    try:
        matches = await ia_service.find_ia_matches(
            db=db, 
            user_id=current_user.id, 
            limit=limit,
            use_openai_embeddings=use_openai_embeddings
        )
        return [ia_schema.MatchResult(**match) for match in matches]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des matches"
        )

@router.post("/bot/chat", response_model=ia_schema.ChatResponse)
@ia_router_limiter.limit("30/minute")
async def chat_with_ia_bot(
    request: Request,
    prompt_data: ia_schema.UserPrompt,
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    try:
        response = await ia_service.get_ia_bot_response(
            prompt=prompt_data.prompt, 
            user_id=current_user.id
        )
        return ia_schema.ChatResponse(**response)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service IA temporairement indisponible"
        )
