from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import TYPE_CHECKING

# Import de la Base centralisée au lieu de créer une nouvelle instance
from app.database import Base

# Import conditionnel pour éviter les dépendances circulaires
if TYPE_CHECKING:
    from .profile_model import Profile
    from .pod_model import Pod

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations avec importation différée pour éviter les dépendances circulaires
    profile = relationship(
        lambda: Profile, 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    pods = relationship(
        lambda: Pod,
        back_populates="owner",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
