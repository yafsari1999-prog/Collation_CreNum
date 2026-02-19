# Collation_CreNum

Interface web de collation automatique pour les manuscrits en moyen français du projet CreNum.

## Description

Outil web pour assister les chercheurs dans la comparaison de plusieurs versions manuscrites de la Chronique française de Guillaume Cretin (XVIᵉ siècle).

**Fonctionnalités :**
- Collation automatique avec CollateX
- Visualisation des variantes en parallèle
- Qualification des différences
- Gestion des équivalences orthographiques

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

Pour plus de détails sur l'installation, consultez [INSTALLATION.md](INSTALLATION.md).

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

## Équipe

**Développeurs :**
- Yasaman AFSARI VELAYATI
- Kemal Çelik

Master 2 Industrie de la Langue, UGA, 2025-2026

**Encadrement :**
- Thomas Lebarbé (Superviseur)
- Arnaud BEY (Commanditaire)
- Théo ROULET (Commanditaire)

