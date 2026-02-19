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

Placez vos fichiers JSON de témoins dans :
```
data/input/votre_oeuvre/
```

Configuration des œuvres dans :
```
data/works.json
```

---

## Documentation Complète

- **README.md** - Vue d'ensemble du projet
- **PLAN_AMELIORATIONS.md** - Plan détaillé des améliorations
- **.github/instructions/** - Cahier des charges et instructions techniques

---

## Support

Pour toute question ou problème, consultez d'abord la documentation dans ce fichier ou ouvrez une issue sur GitHub.

---

**Bon collationement ! 📜✨**
