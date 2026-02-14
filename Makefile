# Makefile pour le projet Collation CreNum
# Simplifie les commandes courantes du projet

.PHONY: help setup test start clean install

# Commande par défaut
help:
	@echo "=========================================="
	@echo "  Collation CreNum - Commandes Make"
	@echo "=========================================="
	@echo ""
	@echo "Commandes disponibles :"
	@echo ""
	@echo "  make setup      - Configuration initiale du projet"
	@echo "  make install    - Installation des dépendances"
	@echo "  make test       - Exécuter tous les tests"
	@echo "  make start      - Démarrer l'application"
	@echo "  make clean      - Nettoyer les fichiers temporaires"
	@echo "  make reset      - Réinitialiser l'environnement"
	@echo ""

# Configuration initiale
setup:
	@echo "Configuration du projet..."
	@chmod +x setup.sh test.sh start.sh
	@./setup.sh

# Installation des dépendances
install:
	@echo "Installation des dépendances..."
	@if [ ! -d ".venv" ]; then \
		python3 -m venv .venv; \
	fi
	@.venv/bin/pip install --upgrade pip
	@.venv/bin/pip install -r requirements.txt
	@echo "✓ Dépendances installées"

# Tests
test:
	@echo "Exécution des tests..."
	@chmod +x test.sh
	@./test.sh

# Démarrage de l'application
start:
	@chmod +x start.sh
	@./start.sh

# Nettoyage
clean:
	@echo "Nettoyage des fichiers temporaires..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@rm -rf .coverage htmlcov/ 2>/dev/null || true
	@echo "✓ Nettoyage terminé"

# Réinitialisation complète
reset: clean
	@echo "Réinitialisation de l'environnement..."
	@rm -rf .venv
	@echo "✓ Environnement réinitialisé"
	@echo "Exécutez 'make setup' pour reconfigurer"

# Tests unitaires avec pytest
unittest:
	@echo "Exécution des tests unitaires..."
	@.venv/bin/python -m pytest tests/ -v

# Vérification de la syntaxe Python
lint:
	@echo "Vérification de la syntaxe Python..."
	@.venv/bin/python -m py_compile backend/*.py

# Arrêter le serveur sur le port 5001
stop:
	@echo "Arrêt du serveur sur le port 5001..."
	@lsof -ti :5001 | xargs kill -9 2>/dev/null || echo "Aucun processus sur le port 5001"
	@echo "✓ Serveur arrêté"

# Développement : redémarrer le serveur
restart: stop start

# Afficher les logs (si disponibles)
logs:
	@if [ -f "backend/app.log" ]; then \
		tail -f backend/app.log; \
	else \
		echo "Aucun fichier de log trouvé"; \
	fi

# Vérifier le statut du serveur
status:
	@echo "Statut du serveur :"
	@if lsof -i :5001 > /dev/null 2>&1; then \
		echo "✓ Serveur en cours d'exécution sur le port 5001"; \
		lsof -i :5001; \
	else \
		echo "✗ Aucun serveur en cours d'exécution"; \
	fi
