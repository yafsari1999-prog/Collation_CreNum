# Collation_CreNum

Interface web de collation automatique pour les manuscrits en moyen français du projet CreNum.

## Description

Outil web pour assister les chercheurs dans la comparaison de plusieurs versions manuscrites de la Chronique française de Guillaume Cretin (XVIᵉ siècle).

**Fonctionnalités :**
- Collation automatique avec CollateX
- Visualisation des variantes en parallèle (3 colonnes)
- Qualification des différences (conserver, ignorer, à vérifier)
- **"Ignorer partout"** : traitement par lot des variantes similaires
- **Configuration des chapitres** : validation et exclusion de chapitres par témoin
- Système de décisions par configuration (sauvegarde distincte par combinaison de témoins)
- Gestion des équivalences orthographiques

**📌 Caractéristique importante :**
- L'application est conçue pour comparer **exactement 3 témoins (manuscrits)** en parallèle
- Cette limitation est liée à l'optimisation de l'interface, de l'algorithme et du cas d'usage principal
- Pour plus de détails, consultez le [Guide Utilisateur](GUIDE_UTILISATEUR.md#limitation-à-3-témoins)

---

## Installation

### Prérequis
- Python 3.8+
- Git

### Installation en 3 étapes

```bash
# 1. Cloner le repository
git clone https://github.com/yafsari1999-prog/Collation_CreNum.git
cd Collation_CreNum

# 2. Configuration (une seule fois)
./setup.sh

# 3. Démarrer l'application
./start.sh
```

Puis ouvrir **http://localhost:5001** dans votre navigateur.

---

## Utilisation

**Démarrer** : `./start.sh`  
**Arrêter** : `Ctrl+C`

---

## Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Installation et configuration détaillées
- **[GUIDE_UTILISATEUR.md](GUIDE_UTILISATEUR.md)** - Guide d'utilisation complet avec exemples
- **[DONNEES.md](DONNEES.md)** - Format des données et structure des fichiers
- **[DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md)** - Documentation technique pour les développeurs
- **[COMPTE_RENDU.md](COMPTE_RENDU.md)** - Bilan du projet (cahier des charges vs réalisation)
- **[DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md)** - Documentation technique pour les développeurs

---

## Technologies

- **Backend** : Python 3.8+, Flask, CollateX
- **Frontend** : HTML5, CSS3, JavaScript

---

## Sources et Remerciements

Ce projet s'inspire des travaux de recherche du projet CreNum et utilise :

- **CollateX** - Outil de collation automatique développé par l'Initiative for Digital Humanities, Media Studies, and Empirical Cultural Studies
- **Prototype collatex-crenum** - Travaux préliminaires disponibles sur [GitLab UGA](https://gricad-gitlab.univ-grenoble-alpes.fr/elan/collation/collatex-crenum)

Nous remercions l'équipe du projet CreNum pour leur accompagnement et leurs retours précieux.

---
## Utilisation de l'IA
Dans le cadre de ce projet, l’IA a été utilisée comme assistant pour : 

Correction grammaticale et orthographique
Debuggage du code
Suggestion de cas de test

---

## Équipe

**Développeurs :**
- Yasaman AFSARI VELAYATI
- Kemal Çelik

Master 2 Industrie de la Langue, UGA, 2025-2026

**Encadrement :**
- Thomas Lebarbé (Superviseur)
- Arnaud BEY (Commanditaire)
- Théo ROULET (Commanditaire)

