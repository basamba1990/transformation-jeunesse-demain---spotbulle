# Modèles SQLAlchemy pour l'entité Pod (capsule audio)

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, ARRAY # Importations de base
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base # Utiliser la Base centralisée de app.database

class Pod(Base):
    __tablename__ = "pods"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    audio_file_url = Column(String) # URL vers le fichier audio stocké (ex: Supabase Storage)
    transcription = Column(Text, nullable=True) # Transcription de l'audio
    tags = Column(ARRAY(String), nullable=True) # Utilisation de ARRAY pour les tags
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relation avec l'utilisateur propriétaire
    owner = relationship("User", back_populates="pods")

    def __repr__(self):
        return f"<Pod(id={self.id}, title='{self.title}')>"

