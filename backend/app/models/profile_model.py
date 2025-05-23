# Modèles SQLAlchemy pour l'entité Profil Utilisateur (incluant le profil DISC)

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON # Importations de base
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base # Utiliser la Base centralisée de app.database

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    # Champs pour le profil DISC
    disc_type = Column(String, nullable=True) # D, I, S, ou C, ou une combinaison
    disc_assessment_results = Column(JSON, nullable=True) # Pour stocker les résultats détaillés du test DISC
    # Autres champs de profil pertinents
    interests = Column(JSON, nullable=True) # Stocker comme une liste de chaînes
    skills = Column(JSON, nullable=True) # Stocker comme une liste de chaînes
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relation avec l'utilisateur
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<Profile(id={self.id}, user_id={self.user_id}, disc_type='{self.disc_type}')>"

