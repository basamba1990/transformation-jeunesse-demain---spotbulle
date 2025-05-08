# Modèles SQLAlchemy pour l'entité Utilisateur

from sqlalchemy import Column, Integer, String, DateTime, Boolean # Importations de base
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base # Utiliser la Base centralisée de app.database

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    pods = relationship("Pod", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"

