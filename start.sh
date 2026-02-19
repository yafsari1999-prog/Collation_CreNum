#!/bin/bash
# Script de démarrage de l'application Collation CreNum

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Démarrage Application Collation CreNum"
echo "=========================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "backend/app.py" ]; then
    echo -e "${RED}Erreur: backend/app.py introuvable${NC}"
    echo "Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Vérifier que l'environnement virtuel existe
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Environnement virtuel introuvable${NC}"
    echo "Création de l'environnement virtuel..."
    python3 -m venv .venv
    
    echo "Installation des dépendances..."
    .venv/bin/pip install -r requirements.txt
fi

# Activer l'environnement virtuel
echo -e "${GREEN}Activation de l'environnement virtuel...${NC}"
source .venv/bin/activate

# Définir le port (par défaut 5001, modifiable via variable d'environnement)
PORT=${FLASK_PORT:-5001}

# Vérifier que le port est libre
if lsof -i :$PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}Le port $PORT est déjà utilisé${NC}"
    echo -n "Voulez-vous arrêter le processus existant ? (o/n) "
    read -r response
    if [[ "$response" =~ ^[Oo]$ ]]; then
        echo "Arrêt du processus sur le port $PORT..."
        lsof -ti :$PORT | xargs kill -9 2>/dev/null
        sleep 1
    else
        echo -e "${RED}Impossible de démarrer - port occupé${NC}"
        echo -e "${YELLOW}Conseil: Utilisez un autre port avec: export FLASK_PORT=5002 && ./start.sh${NC}"
        exit 1
    fi
fi

# Créer les répertoires nécessaires s'ils n'existent pas
mkdir -p data/input
mkdir -p data/output
mkdir -p data/annotations

# Vérifier que works.json existe
if [ ! -f "data/works.json" ]; then
    echo "Création de data/works.json..."
    echo '{"works": []}' > data/works.json
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  Démarrage du serveur Flask..."
echo -e "==========================================${NC}"
echo ""
echo "URL: http://localhost:$PORT"
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter le serveur${NC}"
echo ""

# Démarrer le serveur Flask
cd backend
python app.py
