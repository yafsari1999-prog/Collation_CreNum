# Installation - Collation CreNum

## Prérequis

- **Python 3.8** ou supérieur
- **Git**
- **macOS, Linux ou Windows** (avec Git Bash)

---

## Installation en 3 étapes

### 1️⃣ Cloner le repository

```bash
git clone https://github.com/yafsari1999-prog/Collation_CreNum.git
cd Collation_CreNum
```

### 2️⃣ Configurer l'environnement (une seule fois)

```bash
./setup.sh
```

Ce script va :
- ✓ Vérifier Python 3
- ✓ Créer l'environnement virtuel
- ✓ Installer toutes les dépendances
- ✓ Créer la structure de données
- ✓ Rendre les scripts exécutables

**Durée : ~2-3 minutes**

### 3️⃣ Démarrer l'application

```bash
./start.sh
```

L'application démarre sur **http://localhost:5001**

🌐 **Ouvrez votre navigateur et accédez à :**
```
http://localhost:5001
```

---

## Utilisation Quotidienne

**Démarrer** : `./start.sh`  
**Arrêter** : `Ctrl+C`

---

## Alternative : Utiliser Make

Si vous préférez Make :

```bash
make setup      # Installation
make start      # Démarrer
make stop       # Arrêter
make help       # Voir toutes les commandes
```

---

## En cas de problème

### Le port 5001 est déjà utilisé

Vous avez deux options :

**Option 1 : Arrêter le processus existant**

```bash
# Arrêter le processus qui utilise le port 5001
lsof -ti :5001 | xargs kill -9

# Puis redémarrer l'application
./start.sh
```

**Option 2 : Modifier le port de l'application**

1. Ouvrir le fichier `backend/config.py`
2. Modifier la ligne `FLASK_PORT = 5001` avec le port souhaité (ex: `FLASK_PORT = 5002`)
3. Sauvegarder et redémarrer l'application avec `./start.sh`
4. L'application sera accessible sur le nouveau port (ex: `http://localhost:5002`)

Alternativement, vous pouvez définir le port via une variable d'environnement :

```bash
export FLASK_PORT=5002
./start.sh
```

### Python non trouvé

Vérifiez que Python 3.8+ est installé :
```bash
python3 --version
```

Si non installé, téléchargez-le depuis [python.org](https://www.python.org/downloads/)

### Erreur de permissions

```bash
chmod +x setup.sh start.sh
```

---

## Structure des Données

### Ajout de vos Fichiers

**Vous n'avez pas besoin de manipuler les dossiers de l'application directement.**

Utilisez l'interface web pour :
1. Créer une œuvre via le bouton "Ajouter une nouvelle œuvre"
2. Ajouter vos fichiers JSON de témoins via le bouton "Ajouter un nouveau témoin"
3. Sélectionner les fichiers depuis n'importe quel emplacement sur votre ordinateur

Les fichiers seront automatiquement enregistrés dans l'application.

### ⚠️ Limitation : Exactement 3 Témoins

**L'application nécessite exactement 3 témoins par œuvre.**

Cette limitation est liée à :
- **Interface** : Affichage optimisé pour 3 colonnes parallèles
- **Algorithme** : Collation tripartite avec CollateX
- **Cas d'usage** : Méthodologie d'édition critique du projet CreNum

> **💡 Pour en savoir plus** : Consultez la section [Limitation à 3 témoins](GUIDE_UTILISATEUR.md#limitation-à-3-témoins) du guide utilisateur.

### Configuration des Œuvres

La configuration est gérée automatiquement dans :
```
data/works.json
```

### Sauvegarde des Décisions

Vos annotations sont automatiquement sauvegardées dans :
```
data/decisions/{work_id}_chapter_{index}_words.json
```

**📖 Pour plus de détails sur le format des données, consultez [DONNEES.md](DONNEES.md)**

---

## Documentation Complète

- **[README.md](README.md)** - Vue d'ensemble du projet
- **[GUIDE_UTILISATEUR.md](GUIDE_UTILISATEUR.md)** - Guide d'utilisation avec captures d'écran
- **[DONNEES.md](DONNEES.md)** - Format des données et structure des fichiers

---

## Support

Pour toute question ou problème, consultez d'abord la documentation dans ce fichier ou ouvrez une issue sur GitHub.

---

**Bon collationement ! 📜✨**
