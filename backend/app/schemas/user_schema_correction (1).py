class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True  # Configuration pour Pydantic v1
        from_attributes = True  # Pour compatibilité future avec Pydantic v2
