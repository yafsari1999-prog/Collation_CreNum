# Collation_CreNum

Interface web de collation automatique pour les manuscrits en moyen français du projet CreNum.

## Description

Ce projet développe une interface web pour assister les chercheurs dans la comparaison de plusieurs versions manuscrites de la Chronique française de Guillaume Cretin (XVIᵉ siècle). 

L'outil permet de :
- Collationner automatiquement plusieurs témoins avec CollateX
- Visualiser les variantes en parallèle (colonnes côte à côte)
- Qualifier les différences (pertinente / non pertinente / à vérifier)
- Corriger les erreurs de transcription HTR
- Gérer les équivalences orthographiques
- Sauvegarder les décisions pour réutilisation future

## Démarrage Rapide

### Première utilisation

1. **Configuration initiale** (une seule fois)
```bash
./setup.sh
```
ou avec Make :
```bash
make setup
```

2. **Tester l'application**
```bash
./test.sh
```
ou
```bash
make test
```

3. **Démarrer l'application**
```bash
./start.sh
```
ou
```bash
make start
```

4. **Ouvrir dans le navigateur**
```
http://localhost:5001
```

### Utilisation quotidienne

**Démarrer** : `./start.sh` ou `make start`  
**Tester** : `./test.sh` ou `make test`  
**Arrêter** : `Ctrl+C` ou `make stop`  
**Aide** : `make help`

## Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `./setup.sh` | Configuration initiale du projet |
| `./test.sh` | Tester l'application (validation complète) |
| `./start.sh` | Démarrer le serveur Flask |
| `make help` | Afficher toutes les commandes Make |
| `make test` | Exécuter les tests |
| `make start` | Démarrer l'application |
| `make stop` | Arrêter le serveur |
| `make restart` | Redémarrer le serveur |
| `make clean` | Nettoyer les fichiers temporaires |
| `make reset` | Réinitialiser l'environnement |

Pour plus de détails, consultez [README_UTILISATION.md](README_UTILISATION.md)

## Structure du Projet

```
Collation_CreNum/
├── backend/              # Backend Python/Flask
│   ├── app.py           # Application Flask principale
│   ├── collation.py     # Module CollateX
│   ├── data_import.py   # Import et parsing des données
│   ├── annotations.py   # Gestion des annotations
│   ├── equivalences.py  # Gestion des équivalences
│   ├── works.py         # Gestion des œuvres et témoins
│   └── config.py        # Configuration
├── frontend/            # Interface web
│   ├── templates/       # Templates HTML
│   └── static/          # CSS et JavaScript
├── data/
│   ├── input/          # Fichiers JSON des manuscrits
│   ├── output/         # Résultats de collation
│   ├── annotations/    # Annotations sauvegardées
│   └── works.json      # Configuration des œuvres
├── tests/              # Tests unitaires
├── requirements.txt    # Dépendances Python
├── setup.sh           # Script de configuration
├── test.sh            # Script de tests
├── start.sh           # Script de démarrage
├── Makefile           # Commandes simplifiées
└── README_UTILISATION.md  # Guide complet d'utilisation
```

## Installation Manuelle

Si vous préférez configurer manuellement :

### Prérequis
- Python 3.8+
- pip

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/yafsari1999-prog/Collation_CreNum.git
cd Collation_CreNum
```

2. **Créer un environnement virtuel**
```bash
python3 -m venv .venv
source .venv/bin/activate  # Sur macOS/Linux
# ou
.venv\Scripts\activate     # Sur Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Démarrer l'application**
```bash
cd backend
python app.py
```

## Workflow de Développement

### Avant de travailler
```bash
make test
```

### Après chaque modification
1. Sauvegarder les fichiers
2. Redémarrer : `make restart`
3. Recharger la page (Cmd+R ou Ctrl+F5)
4. Vérifier la console (F12)

### Avant de commit
```bash
make test
git add .
git commit -m "Description"
make test
git push
```

## Tests

Lancer tous les tests :
```bash
./test.sh
```
ou
```bash
make test
```

Tests unitaires seulement :
```bash
make unittest
```

## Technologies

- **Backend** : Python 3.8+, Flask 3.0, CollateX 2.3
- **Frontend** : HTML5, CSS3 (Bootstrap 5.3), JavaScript (Vanilla)
- **Données** : JSON
- **Tests** : pytest

## Résolution de Problèmes

| Problème | Solution |
|----------|----------|
| Port 5001 occupé | `make stop` puis `make start` |
| Environnement cassé | `make reset` puis `make setup` |
| Dépendances manquantes | `make install` |
| Tout réinitialiser | `make reset && make setup` |

## Documentation

- [Guide d'utilisation complet](README_UTILISATION.md)
- [Instructions de développement](.github/instructions/Copilot.instructions.md)
- [Cahier des charges](.github/instructions/CahierDesCharges.instructions.md)

## Contributeurs

- Yasaman AFSARI VELAYATI
- Kemal Çelik

Master 2 Industrie de la Langue, UGA, 2025-2026

## Encadrement

- Thomas Lebarbé (Superviseur)
- Arnaud BEY (Commanditaire)
- Théo ROULET (Commanditaire)

## Licence

[À définir]

