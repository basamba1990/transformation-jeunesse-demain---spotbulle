import os
import sys
import uvicorn

# Ajout du répertoire courant au chemin de recherche Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,  # Utilisation du port 8001 pour éviter les conflits
        reload=True
    )
