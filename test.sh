#!/bin/bash
# Script de test et validation du projet Collation CreNum

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0

echo "=========================================="
echo "  Tests et Validation - Collation CreNum"
echo "=========================================="
echo ""

# Fonction pour afficher les résultats
function test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Vérification de la structure du projet
echo -e "${BLUE}[1/7] Vérification de la structure du projet...${NC}"
test -d "backend" && test -d "frontend" && test -d "data" && test -d "tests"
test_result $? "Structure des répertoires"

test -f "backend/app.py" && test -f "backend/collation.py" && test -f "backend/works.py"
test_result $? "Fichiers backend présents"

test -f "frontend/templates/index.html" && test -f "frontend/static/js/app.js"
test_result $? "Fichiers frontend présents"

test -f "requirements.txt"
test_result $? "requirements.txt présent"

# 2. Vérification de l'environnement virtuel
echo ""
echo -e "${BLUE}[2/7] Vérification de l'environnement virtuel...${NC}"
if [ -d ".venv" ]; then
    test_result 0 "Environnement virtuel trouvé"
    
    # Activer l'environnement
    source .venv/bin/activate
    
    # Vérifier Python
    python --version > /dev/null 2>&1
    test_result $? "Python accessible"
    
    # Vérifier les dépendances principales
    python -c "import flask" 2>/dev/null
    test_result $? "Flask installé"
    
    python -c "import collatex" 2>/dev/null
    test_result $? "CollateX installé"
else
    test_result 1 "Environnement virtuel (.venv)"
    echo -e "${YELLOW}  → Exécutez: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt${NC}"
fi

# 3. Validation de la syntaxe Python
echo ""
echo -e "${BLUE}[3/7] Validation de la syntaxe Python...${NC}"

python -m py_compile backend/app.py 2>/dev/null
test_result $? "backend/app.py"

python -m py_compile backend/collation.py 2>/dev/null
test_result $? "backend/collation.py"

python -m py_compile backend/works.py 2>/dev/null
test_result $? "backend/works.py"

python -m py_compile backend/data_import.py 2>/dev/null
test_result $? "backend/data_import.py"

# 4. Test des imports Flask
echo ""
echo -e "${BLUE}[4/7] Test des imports Flask...${NC}"

FLASK_TEST=$(python -c "
import sys
sys.path.insert(0, 'backend')
try:
    from app import app, work_manager
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
" 2>&1)

if [[ "$FLASK_TEST" == "OK" ]]; then
    test_result 0 "Import de l'application Flask"
else
    test_result 1 "Import de l'application Flask"
    echo -e "${YELLOW}  → $FLASK_TEST${NC}"
fi

# 5. Validation de la syntaxe JavaScript
echo ""
echo -e "${BLUE}[5/7] Validation de la syntaxe JavaScript...${NC}"

if command -v node > /dev/null 2>&1; then
    node --check frontend/static/js/app.js 2>/dev/null
    test_result $? "frontend/static/js/app.js"
else
    echo -e "${YELLOW}  → Node.js non installé, validation JS ignorée${NC}"
fi

# 6. Validation HTML
echo ""
echo -e "${BLUE}[6/7] Validation HTML...${NC}"

# Vérification basique de la syntaxe HTML
grep -q "<!DOCTYPE html>" frontend/templates/index.html
test_result $? "DOCTYPE présent dans index.html"

grep -q "</html>" frontend/templates/index.html
test_result $? "Balise </html> présente"

# 7. Tests unitaires
echo ""
echo -e "${BLUE}[7/7] Exécution des tests unitaires...${NC}"

if command -v pytest > /dev/null 2>&1; then
    if [ -f "tests/test_collation.py" ]; then
        python -m pytest tests/ -v 2>/dev/null
        TEST_EXIT_CODE=$?
        if [ $TEST_EXIT_CODE -eq 0 ]; then
            test_result 0 "Tests unitaires"
        elif [ $TEST_EXIT_CODE -eq 5 ]; then
            # Exit code 5 = no tests collected (pas d'erreur)
            echo -e "${YELLOW}  → Aucun test à exécuter${NC}"
        else
            test_result 1 "Tests unitaires"
        fi
    else
        echo -e "${YELLOW}  → Aucun fichier de test trouvé${NC}"
    fi
else
    echo -e "${YELLOW}  → pytest non installé, tests ignorés${NC}"
    echo -e "${YELLOW}  → Installez avec: pip install pytest${NC}"
fi

# Résumé
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}  ✓ Tous les tests sont passés !${NC}"
    echo -e "${GREEN}  Vous pouvez démarrer l'application avec: ./start.sh${NC}"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}  ✗ $ERRORS erreur(s) détectée(s)${NC}"
    echo -e "${YELLOW}  Veuillez corriger les erreurs avant de démarrer${NC}"
    echo "=========================================="
    exit 1
fi
