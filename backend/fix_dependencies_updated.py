import subprocess
import sys

def fix_bcrypt_dependency():
    print("Installation des versions spécifiques de bcrypt et passlib...")
    try:
        # Installation directe des versions spécifiques (remplacera les versions existantes)
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--force-reinstall", "bcrypt==4.0.1", "passlib==1.7.4"])
        print("Dépendances installées avec succès!")
        return True
    except Exception as e:
        print(f"Erreur lors de l'installation des dépendances: {e}")
        return False

if __name__ == "__main__":
    fix_bcrypt_dependency()
