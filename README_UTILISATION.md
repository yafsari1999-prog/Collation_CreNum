# Guide d'Utilisation - Collation CreNum

## Démarrage Rapide

### Première Utilisation

1. **Configuration initiale** (une seule fois)
   ```bash
   ./setup.sh
   ```
   ou
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

---

## Utilisation Quotidienne

### Démarrer l'application
```bash
./start.sh
```
ou
```bash
make start
```

### Arrêter l'application
Appuyez sur `Ctrl+C` dans le terminal

ou pour forcer l'arrêt :
```bash
make stop
```

### Tester avant de travailler
```bash
./test.sh
```
ou
```bash
make test
```

---

## Commandes Disponibles

### Avec les scripts shell (.sh)

| Commande | Description |
|----------|-------------|
| `./setup.sh` | Configuration initiale du projet |
| `./test.sh` | Exécuter tous les tests de validation |
| `./start.sh` | Démarrer l'application Flask |

### Avec Makefile (recommandé)

| Commande | Description |
|----------|-------------|
| `make help` | Afficher l'aide |
| `make setup` | Configuration initiale |
| `make install` | Installer les dépendances |
| `make test` | Exécuter les tests |
| `make start` | Démarrer l'application |
| `make stop` | Arrêter le serveur |
| `make restart` | Redémarrer le serveur |
| `make clean` | Nettoyer les fichiers temporaires |
| `make reset` | Réinitialiser l'environnement |
| `make status` | Vérifier si le serveur est en cours |
| `make lint` | Vérifier la syntaxe Python |

---

## Workflow de Développement

### Avant de commencer à travailler
```bash
make test
```

### Après chaque modification
1. **Sauvegarder les fichiers**
2. **Redémarrer le serveur** :
   ```bash
   make restart
   ```
3. **Recharger la page** dans le navigateur (Cmd+R ou Ctrl+F5)
4. **Vérifier la console** (F12) pour les erreurs JavaScript

### Avant de commit sur Git
```bash
make test
git add .
git commit -m "Description des changements"
make test  # Tester une dernière fois
git push
```

---

## Structure du Projet

```
Collation_CreNum/
├── backend/              # Code Python Flask
│   ├── app.py           # Application principale
│   ├── collation.py     # Logique de collation
│   ├── works.py         # Gestion des œuvres
│   └── ...
├── frontend/            # Interface web
│   ├── templates/       # HTML
│   └── static/          # CSS, JS
├── data/                # Données JSON
│   ├── input/           # Fichiers manuscrits
│   ├── output/          # Résultats collation
│   └── works.json       # Configuration
├── tests/               # Tests unitaires
├── start.sh            # Script de démarrage
├── test.sh             # Script de tests
├── setup.sh            # Script de configuration
├── Makefile            # Commandes simplifiées
└── requirements.txt    # Dépendances Python
```

---

## Résolution de Problèmes

### Le port 5001 est déjà utilisé
```bash
make stop
make start
```

### L'environnement virtuel est cassé
```bash
make reset
make setup
```

### Les dépendances sont manquantes
```bash
make install
```

### Erreurs de syntaxe Python
```bash
make lint
```

### Tout réinitialiser
```bash
make reset
make setup
make test
make start
```

---

## Conseils

1. **Toujours tester avant de commit** : `make test`
2. **Recharger la page après modification** : Cmd+R (Mac) ou Ctrl+F5 (Windows/Linux)
3. **Vérifier la console navigateur** : F12 pour voir les erreurs JavaScript
4. **Vérifier les logs Flask** : Regarder le terminal où le serveur tourne
5. **Utiliser make plutôt que les scripts** : Plus simple et standardisé

---

## Support

En cas de problème :
1. Vérifier que vous êtes dans le bon répertoire (racine du projet)
2. Exécuter `make test` pour diagnostiquer
3. Vérifier les logs dans le terminal
4. Consulter le fichier `.github/instructions/Copilot.instructions.md`
