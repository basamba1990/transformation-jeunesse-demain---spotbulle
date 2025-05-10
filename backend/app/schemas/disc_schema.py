# backend/app/schemas/disc_schema.py

from pydantic import BaseModel
from typing import List, Optional


class DISCQuestion(BaseModel):
    id: int
    question_text: str
    options: List[str]
    category: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class DISCAnswer(BaseModel):
    question_id: int
    selected_option: str

    model_config = {
        "from_attributes": True
    }


class DISCResult(BaseModel):
    user_id: int
    dominant: float
    influence: float
    steadiness: float
    compliance: float

    model_config = {
        "from_attributes": True
    }
