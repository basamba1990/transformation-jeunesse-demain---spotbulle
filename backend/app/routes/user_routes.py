# Routes pour la gestion des utilisateurs (en dehors de l'authentification pure)

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from ..schemas import user_schema # Schémas Pydantic
from ..services import user_service # Services CRUD pour les utilisateurs
from ..utils import security # Pour get_current_active_user et les rôles
from ..database import get_db # Dépendance pour la session DB

# Importer le limiteur global de main.py ou en créer un spécifique ici
from slowapi import Limiter
from slowapi.util import get_remote_address

# Limiteur pour les routes utilisateur, peut être moins strict que l'auth mais toujours utile
user_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(security.get_current_active_user)] # Sécurise toutes les routes de ce routeur par défaut
)

# Fonction de dépendance pour vérifier si l'utilisateur est un superutilisateur
def get_current_active_superuser(current_user: user_schema.User = Depends(security.get_current_active_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation not permitted: Requires superuser privileges."
        )
    return current_user

@router.get("/", response_model=List[user_schema.User])
@user_router_limiter.limit("20/minute") # Limite pour la liste des utilisateurs
async def read_users(
    request: Request, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: user_schema.User = Depends(get_current_active_superuser) # Seuls les superusers peuvent lister tous les utilisateurs
):
    """
    Récupère une liste d'utilisateurs. 
    Accessible uniquement par un superutilisateur.
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=user_schema.User)
@user_router_limiter.limit("60/minute")
async def read_user_by_id(
    request: Request, 
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Récupère un utilisateur spécifique par son ID.
    Un utilisateur ne peut récupérer que ses propres informations (via /users/me), ou un superutilisateur peut récupérer n'importe quel utilisateur.
    """
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's information."
        )
    db_user = user_service.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found.")
    return db_user

@router.put("/me", response_model=user_schema.User)
@user_router_limiter.limit("10/minute")
async def update_current_user_me(
    request: Request,
    user_update: user_schema.UserUpdate, # Utilise le schéma UserUpdate standard, qui n'a pas is_active/is_superuser
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Met à jour les informations de l'utilisateur actuellement authentifié.
    L'utilisateur ne peut pas changer son statut is_active ou is_superuser via cette route.
    """
    updated_user = user_service.update_user(db, user_id=current_user.id, user_update_schema=user_update)
    if updated_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found during update.")
    return updated_user


@router.put("/{user_id}", response_model=user_schema.User)
@user_router_limiter.limit("10/minute")
async def update_user_by_id_admin(
    request: Request,
    user_id: int,
    user_update: user_schema.UserUpdateByAdmin, # Utilise le schéma UserUpdateByAdmin pour les admins
    db: Session = Depends(get_db),
    current_admin: user_schema.User = Depends(get_current_active_superuser) # Seuls les superusers
):
    """
    Met à jour les informations d'un utilisateur spécifique par son ID.
    Accessible uniquement par un superutilisateur. Peut modifier is_active et is_superuser.
    """
    # Vérifier si l'utilisateur à mettre à jour existe
    target_user = user_service.get_user(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found.")

    # Empêcher un superuser de se retirer ses propres droits de superuser via cette route (il devrait y avoir une autre procédure)
    if target_user.id == current_admin.id and user_update.is_superuser is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser cannot revoke their own superuser status via this endpoint."
        )

    updated_user = user_service.update_user(db, user_id=user_id, user_update_schema=user_update)
    if updated_user is None: # Devrait être redondant avec la vérification target_user ci-dessus
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found during update process.")
    return updated_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT) # Retourne 204 No Content pour une suppression réussie
@user_router_limiter.limit("5/hour") # Limite pour la suppression de compte
async def delete_current_user_me(
    request: Request,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Désactive (soft delete) le compte de l'utilisateur actuellement authentifié.
    """
    user_disable_update = user_schema.UserUpdateByAdmin(is_active=False) # Utiliser UserUpdateByAdmin pour is_active
    disabled_user = user_service.update_user(db, user_id=current_user.id, user_update_schema=user_disable_update)
    if disabled_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found during deactivation.")
    # Pas de corps de réponse pour 204
    return None 

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@user_router_limiter.limit("10/hour")
async def delete_user_by_id_admin(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: user_schema.User = Depends(get_current_active_superuser)
):
    """
    Supprime (ou désactive) un utilisateur par son ID. Accessible uniquement par un superutilisateur.
    Pour l'instant, nous allons le désactiver.
    """
    target_user = user_service.get_user(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found.")

    # Empêcher un superuser de se supprimer lui-même via cette route
    if target_user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser cannot delete their own account via this endpoint."
        )

    user_disable_update = user_schema.UserUpdateByAdmin(is_active=False)
    disabled_user = user_service.update_user(db, user_id=user_id, user_update_schema=user_disable_update)
    if disabled_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found during deactivation process.")
    return None

