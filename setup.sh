#!/bin/bash
# Script de configuration initiale du projet Collation CreNum

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Configuration - Collation CreNum"
echo "=========================================="
echo ""

# 1. Vérifier Python 3
echo -e "${BLUE}[1/5] Vérification de Python 3...${NC}"
if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ $PYTHON_VERSION installé${NC}"
else
    echo -e "${RED}✗ Python 3 non trouvé${NC}"
    echo "Veuillez installer Python 3.8 ou supérieur"
    exit 1
fi

# 2. Créer l'environnement virtuel
echo ""
echo -e "${BLUE}[2/5] Création de l'environnement virtuel...${NC}"
if [ -d ".venv" ]; then
    echo -e "${YELLOW}L'environnement virtuel existe déjà${NC}"
    echo -n "Voulez-vous le recréer ? (o/n) "
    read -r response
    if [[ "$response" =~ ^[Oo]$ ]]; then
        rm -rf .venv
        python3 -m venv .venv
        echo -e "${GREEN}✓ Environnement virtuel recréé${NC}"
    else
        echo -e "${YELLOW}→ Conservation de l'environnement existant${NC}"
    fi
else
    python3 -m venv .venv
    echo -e "${GREEN}✓ Environnement virtuel créé${NC}"
fi

# 3. Activer et installer les dépendances
echo ""
echo -e "${BLUE}[3/5] Installation des dépendances...${NC}"
source .venv/bin/activate

pip install --upgrade pip > /dev/null 2>&1

if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dépendances installées${NC}"
    else
        echo -e "${RED}✗ Erreur lors de l'installation des dépendances${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ requirements.txt introuvable${NC}"
    exit 1
fi

# 4. Créer la structure de données
echo ""
echo -e "${BLUE}[4/5] Création de la structure de données...${NC}"

mkdir -p data/input
mkdir -p data/output
mkdir -p data/annotations

if [ ! -f "data/works.json" ]; then
    echo '{"works": []}' > data/works.json
    echo -e "${GREEN}✓ data/works.json créé${NC}"
else
    echo -e "${YELLOW}→ data/works.json existe déjà${NC}"
fi

echo -e "${GREEN}✓ Répertoires de données créés${NC}"

# 5. Rendre les scripts exécutables
echo ""
echo -e "${BLUE}[5/5] Configuration des scripts...${NC}"
chmod +x start.sh
chmod +x test.sh
chmod +x setup.sh
echo -e "${GREEN}✓ Scripts rendus exécutables${NC}"

# Résumé
echo ""
echo "=========================================="
echo -e "${GREEN}  ✓ Configuration terminée !${NC}"
echo "=========================================="
echo ""
echo "Commandes disponibles :"
echo ""
echo -e "  ${YELLOW}./test.sh${NC}   - Tester le projet avant démarrage"
echo -e "  ${YELLOW}./start.sh${NC}  - Démarrer l'application"
echo ""
echo "Pour commencer, exécutez : ${GREEN}./test.sh${NC}"
echo ""
