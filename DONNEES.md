# Documentation des Données - Collation CreNum

Ce document explique en détail la structure des fichiers de données utilisés par l'application de collation.

---

## 📁 Structure des Répertoires

```
data/
├── input/              # Fichiers JSON des témoins (manuscrits)
│   └── [nom_oeuvre]/
│       ├── temoin1.json
│       ├── temoin2.json
│       └── temoin3.json
├── output/             # Résultats d'export de collation
├── decisions/          # Décisions/annotations sauvegardées
│   └── {work_id}_chapter_{index}_words.json
├── annotations/        # Annotations (réservé pour usage futur)
└── works.json          # Configuration des œuvres et témoins
```

### Description des Dossiers

#### 📂 `data/input/`
Contient les fichiers JSON des témoins (manuscrits) organisés par œuvre.

**Organisation recommandée :**
```
data/input/
└── mon_oeuvre/          # Nom de votre œuvre
    ├── temoin_A.json    # Premier témoin
    ├── temoin_B.json    # Deuxième témoin
    └── temoin_C.json    # Troisième témoin
```

**Important :** L'application nécessite **exactement 3 témoins** pour fonctionner.

#### 📂 `data/output/`
Stocke les résultats d'export de la collation (formats JSON/CSV).

#### 📂 `data/decisions/`
**Sauvegarde automatique des décisions utilisateur.**

Format des fichiers : `{work_id}_chapter_{index}_words.json`

Exemples :
- `mon_oeuvre_chapter_0_words.json` - Décisions pour le chapitre 0
- `mon_oeuvre_chapter_1_words.json` - Décisions pour le chapitre 1

**Les décisions sont automatiquement rechargées** quand vous revenez sur un chapitre déjà annoté.

#### 📂 `data/annotations/`
Réservé pour usage futur.

#### 📄 `data/works.json`
Fichier de configuration géré automatiquement par l'application. Contient la liste des œuvres et leurs témoins associés.

---

## 📄 Format des Fichiers Témoins (JSON)

### Structure Générale

Les fichiers témoins sont au format JSON et représentent un manuscrit divisé en chapitres et vers.

**Structure : Liste de chapitres → Liste de vers → Objet vers**

```json
[
  [  
    // Chapitre 0
    {
      "region": "Chapter",
      "text": "Prologue du quart volume",
      "alto_id": "6ac23492-6644-44ab-9b20-18fe64b27df2",
      "type": "default",
      "page": "Chantilly_516004-002.xml"
    },
    {
      "region": "MainZone",
      "text": "Il est ainsi que debte long temps deue.",
      "alto_id": "117fa277-f2bc-4fbc-a634-196352886fcd",
      "type": "default",
      "page": "Chantilly_516004-002.xml"
    }
  ],
  [
    // Chapitre 1
    { ... },
    { ... }
  ]
]
```

### Description des Champs

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `region` | string | ✅ Oui | Type de région textuelle |
| `text` | string | ✅ Oui | Contenu textuel du vers |
| `alto_id` | string | ⚠️ Recommandé | Identifiant unique du vers (format ALTO) |
| `type` | string | ⚠️ Recommandé | Type de segment (généralement "default") |
| `page` | string | ⚠️ Recommandé | Référence de la page source |

### Types de Régions (`region`)

L'application filtre et traite différemment selon le type de région :

| Type | Description | Traité en collation |
|------|-------------|---------------------|
| `MainZone` | Corps de texte principal | ✅ Oui |
| `Chapter` | Titre/en-tête de chapitre | ✅ Oui |
| `Rubric` | Rubrique | ✅ Oui |
| Autres | Autres types de zones | ❌ Ignoré |

**Régions autorisées** (défini dans `backend/config.py`) :
```python
ALLOWED_REGIONS = ['MainZone', 'Rubric', 'Chapter']
```

---

## 📊 Exemple Complet de Fichier Témoin

```json
[
  [
    {
      "region": "Chapter",
      "text": "Prologue de ce volume",
      "alto_id": "80c9c4bf-3755-44e4-8d50-92e9c15d23e0",
      "type": "default",
      "page": "BnFfr_1712_f11.xml"
    },
    {
      "region": "MainZone",
      "text": "Il est ainsy que debte lonq temps deue.",
      "alto_id": "e6dcb392-e034-4ebb-8fbc-dfb5042d801a",
      "type": "default",
      "page": "BnFfr_1712_f11.xml"
    },
    {
      "region": "MainZone",
      "text": "Fasche a celluy qui la trop attendue.",
      "alto_id": "cfd6544a-14a1-4042-93d1-9fa6e3b649ac",
      "type": "default",
      "page": "BnFfr_1712_f11.xml"
    }
  ],
  [
    {
      "region": "Chapter",
      "text": "Chapitre Premier",
      "alto_id": "...",
      "type": "default",
      "page": "BnFfr_1712_f12.xml"
    },
    {
      "region": "MainZone",
      "text": "Le premier vers du chapitre 1...",
      "alto_id": "...",
      "type": "default",
      "page": "BnFfr_1712_f12.xml"
    }
  ]
]
```

**Points importants :**
- Chaque chapitre = une liste de vers
- L'ordre des chapitres correspond à leur index (0, 1, 2...)
- L'ordre des vers dans un chapitre est préservé pour la collation

---

## 💾 Format des Fichiers de Décisions

### Localisation et Nommage

**Emplacement** : `data/decisions/`  
**Format du nom** : `{work_id}_chapter_{index}_words.json`

Exemples :
- `mes_chroniques_chapter_0_words.json`
- `mes_chroniques_chapter_1_words.json`

### Structure d'un Fichier de Décisions

```json
{
  "work_id": "mes_chroniques",
  "chapter_index": "0",
  "decisions": [
    {
      "verse_number": 16,
      "position": 7,
      "action": "conserver",
      "explication": "Variation orthographique pertinente",
      "words": {
        "Témoin A": "assomme",
        "Témoin B": "assomme",
        "Témoin C": "assōme"
      },
      "pages": {
        "Témoin A": "BnFfr_1712_f11.xml",
        "Témoin B": "BnFfr_2820_f11.xml",
        "Témoin C": "Chantilly_516004-002.xml"
      },
      "timestamp": "2026-02-18T21:47:28.622221"
    }
  ],
  "last_modified": "2026-02-18T21:47:28.622248"
}
```

### Description des Champs

| Champ | Description |
|-------|-------------|
| `work_id` | Identifiant de l'œuvre |
| `chapter_index` | Index du chapitre (0-based) |
| `decisions` | Liste des décisions par mot |
| `verse_number` | Numéro du vers dans le chapitre |
| `position` | Position du mot dans le vers (0-based) |
| `action` | Type de décision : "conserver", "ignorer", "a_verifier" |
| `explication` | Note explicative de l'utilisateur |
| `words` | Les 3 variantes du mot (un par témoin) |
| `pages` | Référence des pages sources |
| `timestamp` | Date/heure de la décision |
| `last_modified` | Date de la dernière modification du fichier |

### Actions Disponibles

| Action | Description | Utilisation |
|--------|-------------|-------------|
| `conserver` | Variation pertinente à garder | Différence significative pour l'édition critique |
| `ignorer` | Variation non pertinente | Simple différence orthographique sans importance |
| `a_verifier` | À vérifier ultérieurement | Doute, nécessite expertise supplémentaire |

---

## 🔄 Système de Sauvegarde et Rechargement

### Sauvegarde Automatique

**Quand ?** Les décisions sont sauvegardées **immédiatement** après chaque annotation de mot.

**Où ?** Dans `data/decisions/{work_id}_chapter_{index}_words.json`

**Avantages :**
- ✅ Aucun risque de perte de données
- ✅ Possibilité de reprendre le travail à tout moment
- ✅ Travail collaboratif possible (fichiers partageables)

### Rechargement Automatique

**Quand vous revenez sur un chapitre déjà annoté**, l'application :

1. Vérifie l'existence du fichier de décisions
2. Charge automatiquement les décisions précédentes
3. Affiche les mots avec les couleurs correspondant aux décisions :
   - 🟢 Vert = Variation à conserver
   - 🔴 Rouge = Variation à ignorer
   - 🟡 Jaune = À vérifier

**Pas d'action requise** - Le chargement est totalement automatique.

---

## 📤 Format des Fichiers d'Export

Les fichiers exportés sont placés dans `data/output/` au format JSON.

**Structure :** Résumé de la collation avec toutes les décisions intégrées.

*(À compléter selon les spécifications exactes du format d'export souhaité)*

---

## ✅ Checklist de Préparation des Données

Avant d'importer vos témoins dans l'application :

- [ ] Vos fichiers JSON sont valides (testez avec un validateur JSON)
- [ ] Vous avez **exactement 3 témoins** pour votre œuvre
- [ ] Chaque témoin est structuré en liste de chapitres → liste de vers
- [ ] Chaque vers contient au minimum : `region`, `text`
- [ ] Les types de `region` sont bien "MainZone", "Chapter", ou "Rubric"
- [ ] Les chapitres sont dans le même ordre pour les 3 témoins
- [ ] Les fichiers sont placés dans `data/input/[nom_oeuvre]/`

---

## ❓ Questions Fréquentes

### Puis-je utiliser plus ou moins de 3 témoins ?

Non, l'application est conçue pour **exactement 3 témoins**. Cette limitation est liée :
- À l'interface (3 colonnes côte-à-côte)
- À l'algorithme de comparaison (tripartite)
- Au cas d'usage principal du projet CreNum

### Que se passe-t-il si mes témoins n'ont pas le même nombre de chapitres ?

L'application affichera uniquement les chapitres présents dans **tous les témoins**.

### Puis-je modifier manuellement les fichiers de décisions ?

Oui, mais ce n'est pas recommandé. Respectez strictement le format JSON pour éviter les erreurs.

### Les décisions sont-elles partagées entre utilisateurs ?

Les fichiers de décisions sont stockés localement dans `data/decisions/`. Pour partager :
1. Copiez les fichiers `*.json` de `data/decisions/`
2. Placez-les dans le même dossier sur l'autre machine
3. L'application les chargera automatiquement

---

## 🔧 Dépannage

### Erreur "Format JSON invalide"

**Cause :** Le fichier témoin n'est pas au bon format JSON.

**Solution :** 
- Validez votre JSON avec https://jsonlint.com/
- Vérifiez que la structure est bien : `[ [ {...}, {...} ], [ {...} ] ]`

### Chapitres manquants

**Cause :** Différence de structure entre les témoins.

**Solution :** Assurez-vous que les 3 témoins ont le même nombre de chapitres.

### Décisions non rechargées

**Cause :** Fichier de décisions introuvable ou corrompu.

**Solution :** 
- Vérifiez la présence du fichier dans `data/decisions/`
- Vérifiez que le nom suit le format `{work_id}_chapter_{index}_words.json`
- Validez le JSON du fichier de décisions

---

## 📚 Références

- **Backend - Import des données** : `backend/data_import.py`
- **Backend - Gestion des décisions** : `backend/decisions.py`
- **Backend - Configuration** : `backend/config.py`
- **Format ALTO** : https://www.loc.gov/standards/alto/

---

**Date de mise à jour :** 19 février 2026  
**Version de l'application :** 1.0
