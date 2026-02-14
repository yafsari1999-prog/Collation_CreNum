---
description: Instructions pour le développement du projet Collation_CreNum
applyTo: '**/*.{py,js,html,css,md}'
---

# Instructions de Développement - Projet Collation_CreNum

## Contexte du Projet
Interface web de collation automatique pour comparer plusieurs manuscrits en moyen français (XVIᵉ siècle) du projet CreNum - Chronique française de Guillaume Cretin.

## Stack Technique
- **Backend**: Python 3.8+, Flask, CollateX
- **Frontend**: HTML, CSS (Bootstrap), JavaScript (Vanilla)
- **Données**: JSON (transcriptions HTR)
- **Sauvegarde**: Fichiers JSON

## Règles de Développement

### 1. Tests Obligatoires
**TOUJOURS TESTER AVANT DE PUSHER SUR GIT**
**RECOMPILER ET TESTER APRÈS CHAQUE CHANGEMENT**

- Après CHAQUE modification de code :
  1. Redémarrer le serveur Flask si nécessaire
  2. Recharger la page dans le navigateur (Cmd+R ou Ctrl+F5)
  3. Tester la fonctionnalité modifiée
  4. Vérifier qu'il n'y a pas d'erreurs dans la console du navigateur (F12)
  5. Vérifier les logs du serveur Flask

- Avant chaque commit :
  - Tester chaque nouvelle fonctionnalité
  - Vérifier que l'application Flask démarre sans erreur
  - Valider les imports et dépendances
  - Tester avec des données réelles (fichiers JSON dans `data/input/`)
  - Lancer les tests unitaires : `python -m pytest tests/`

### 2. Workflow Git
```bash
# Avant chaque commit
1. Tester localement
2. Vérifier les erreurs
3. git add [fichiers]
4. git commit -m "description claire"
5. Tester une dernière fois
6. git push
```

### 3. Structure de Code

#### Python (Backend)
- Suivre PEP 8
- Docstrings pour toutes les fonctions publiques
- Type hints quand possible
- Gestion d'erreurs explicite avec try/except
- Logger les erreurs importantes

#### JavaScript (Frontend)
- Commentaires en français
- Fonctions asynchrones pour les appels API
- Gestion d'erreurs avec try/catch
- Code lisible et bien indenté

### 4. Normalisation CollateX
Utiliser les règles de normalisation du prototype :
- Lowercase
- Doubles consonnes → simple : `abbé` → `abé`
- Y → I : `roy` → `roi`
- `ict/ist` → `it` : `faict` → `fait`
- `tz` → `s` : `faictz` → `faits`

### 5. Filtrage des Données
Régions JSON à conserver :
- `MainZone` : texte principal
- `Rubric` : vers introductifs
- `Chapter` : titres de chapitres

Régions à exclure :
- `numberingZone`
- `RunningTitle`

### 6. Priorités de Développement
1. Maîtriser CollateX et sa structure de données JSON
2. Tester la montée en charge (3 témoins complets)
3. Développer l'interface de visualisation
4. Implémenter les annotations
5. Gérer les équivalences orthographiques

### 7. Commentaires de Code
- Expliquer POURQUOI, pas seulement QUOI
- Marquer les TODOs avec `# TODO:` ou `// TODO:`
- Documenter les fonctions complexes
- Référencer le prototype GitLab quand pertinent

### 8. Organisation des Fichiers
- Backend : un module = une responsabilité
- Frontend : séparer logique (JS) et présentation (HTML/CSS)
- Données de test dans `data/input/`
- Résultats dans `data/output/`
- Annotations dans `data/annotations/`

### 9. Performance
- Traiter les collations par chapitre (≈10 pages)
- Optimiser pour 3 témoins simultanés
- Éviter le rechargement complet de la page
- Utiliser des spinners pour les opérations longues

### 10. Déploiement
- Application simple à lancer (Flask en mode développement)
- Configuration dans `backend/config.py`
- Documentation claire dans README.md
- Pas de complexité inutile

## Questions à Résoudre
Lors du développement, garder en tête :
1. Comment sauvegarder qu'une différence est pertinente dans le JSON ?
2. "Ignorer toujours" : affichage seul ou recalcul des collations ?
3. Traiter tout le texte ou chapitre par chapitre ?

## Référence
Prototype GitLab : https://gricad-gitlab.univ-grenoble-alpes.fr/elan/collation/collatex-crenum