# Documentation Technique - Collation CreNum

Documentation destinée aux développeurs souhaitant comprendre, modifier ou étendre l'application.

> **Voir aussi :** [INSTALLATION.md](INSTALLATION.md) pour l'installation, [DONNEES.md](DONNEES.md) pour le format des fichiers.

---

## Architecture

```
Collation_CreNum/
├── backend/                    # Serveur Flask
│   ├── app.py                  # Routes API (point d'entrée)
│   ├── collate.py              # Algorithme CollateX + normalisation
│   ├── decisions.py            # Gestion décisions utilisateur
│   ├── works.py                # Gestion œuvres/témoins
│   ├── data_import.py          # Import et filtrage données
│   └── equivalences.py         # Équivalences orthographiques
│
├── frontend/
│   ├── static/js/modules/      # Modules ES6
│   │   ├── api.js              # Appels HTTP centralisés
│   │   ├── state.js            # État global (appState, collationState)
│   │   ├── decisions.js        # Décisions, export, "Ignorer partout"
│   │   ├── chapter-validation.js # Configuration chapitres
│   │   ├── collation.js        # Affichage résultats
│   │   └── ...
│   └── templates/index.html
│
└── data/
    ├── works.json              # Registre des œuvres
    ├── decisions/              # Décisions par configuration
    └── input/                  # Fichiers témoins JSON
```

---

## Backend - Modules principaux

### `collate.py` - Collation

```python
def normalize_text(text: str) -> str:
    """Normalisation CreNum : minuscules, doubles→simples, y→i, ict→it, tz→ts"""

def perform_collation(witness_files, witness_names, chapter_indices) -> dict:
    """Collation de 3 témoins avec CollateX. Retourne alignement mot à mot."""
```

**Filtrage des régions :** `MainZone`, `Rubric`, `Chapter` conservés ; `numberingZone`, `RunningTitle` exclus.

### `decisions.py` - Décisions

**Nomenclature des fichiers :**
```
data/decisions/{work_id}_witnesses_{wit1}_{wit2}_{wit3}.json
```

Permet des décisions distinctes par combinaison de témoins.

### `works.py` - Œuvres

Gestion CRUD des œuvres et témoins. Stockage dans `data/works.json`.

---

## API REST - Référence rapide

### Œuvres et témoins

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/works` | Liste / Crée œuvre |
| GET/POST | `/api/works/<id>/witnesses` | Liste / Ajoute témoin |

### Collation

| Méthode | Endpoint | Payload |
|---------|----------|---------|
| POST | `/api/collate` | `{work_id, witness_ids[3], chapter_index}` |
| POST | `/api/validate-chapters` | `{work_id, witness_ids[3]}` |

### Décisions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/word-decisions` | Sauvegarde décision mot |
| GET | `/api/word-decisions/<work>/<chap>?wit1=&wit2=&wit3=` | Charge décisions |
| GET | `/api/word-decisions/export/<work>?wit1=&wit2=&wit3=` | Export complet |

---

## Frontend - État global

```javascript
// state.js
export const appState = {
    selectedWork: null,
    selectedWitnesses: [null, null, null],  // Toujours 3
    selectedChapter: null,
    excludedChapters: {}  // {witness_id: [indices]}
};

export const collationState = {
    results: null,          // Données collation
    wordDecisions: {},      // Décisions actives
    savedWordDecisions: {}  // Décisions sauvegardées
};
```

---

## Ajouter une route API

**1. Backend (`app.py`) :**
```python
@app.route('/api/nouvelle-route', methods=['POST'])
def nouvelle_route():
    data = request.json
    return jsonify({"status": "success", "data": result})
```

**2. Frontend (`api.js`) :**
```javascript
export async function nouvelleRoute(params) {
    const response = await fetch('/api/nouvelle-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    return await handleResponse(response);
}
```

---

## Conventions de code

### Python
- PEP 8, docstrings, type hints
- Gestion d'erreurs avec try/except

### JavaScript
- Modules ES6, commentaires en français
- Fonctions async avec try/catch


---

**© 2026 - Projet CreNum - Master 2 IdL, UGA**
