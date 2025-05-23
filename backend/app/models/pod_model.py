from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, ARRAY, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base  # Base déclarée dans ton dossier database

class Pod(Base):
    __tablename__ = "pods"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    audio_file_url = Column(String)  # URL vers le fichier audio (ex : Supabase Storage)
    transcription = Column(Text, nullable=True)  # Transcription de l'audio
    tags = Column(ARRAY(String), nullable=True)  # Tags en tableau de chaînes
    embedding = Column(JSON, nullable=True)  # Champ JSON pour stocker les embeddings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relation avec l'utilisateur propriétaire
    owner = relationship("User", back_populates="pods")

    def __repr__(self):
        return f"<Pod(id={self.id}, title='{self.title}')>"
