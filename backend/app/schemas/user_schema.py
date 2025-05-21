from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

class UserUpdate(UserBase):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=128)

class UserUpdateByAdmin(UserUpdate):
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserPrompt(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
