# Test des Sélections par Défaut

## Modifications Effectuées

### 1. Œuvres
- **Tri alphabétique** : Les œuvres sont maintenant affichées dans l'ordre alphabétique
- **Sélection par défaut** : La première œuvre (alphabétiquement) est automatiquement cochée au chargement

### 2. Témoins
- **Tri alphabétique** : Les témoins sont affichés dans l'ordre alphabétique
- **Sélection par défaut** : Les 3 premiers témoins (alphabétiquement) sont automatiquement cochés
- **Activation automatique** : Si 3 témoins sont cochés, l'étape 3 (chapitres) se débloque automatiquement

### 3. Chapitres
- **Sélection par défaut** : Le Chapitre 1 est automatiquement sélectionné quand la section se débloque
- **Activation automatique** : Se débloque dès que 3 témoins sont sélectionnés

## Comment Tester

### Test Complet du Workflow

1. **Ouvrir l'Application**
   ```
   http://localhost:5001
   ```

2. **Observer l'Étape 1 (Œuvres)**
   - ✓ Les œuvres sont affichées par ordre alphabétique
   - ✓ La première œuvre est déjà cochée
   - ✓ L'Étape 2 (Témoins) est déjà débloquée

3. **Observer l'Étape 2 (Témoins)**
   - ✓ Si l'œuvre sélectionnée a des témoins :
     - Les témoins sont affichés par ordre alphabétique
     - Les 3 premiers sont déjà cochés (si >= 3 témoins disponibles)
     - L'Étape 3 (Chapitres) est déjà débloquée

4. **Observer l'Étape 3 (Chapitres)**
   - ✓ Le Chapitre 1 est déjà sélectionné
   - ✓ Le bouton "Lancer la collation" est prêt à être cliqué

### Test des Interactions

#### Test 1 : Changer d'Œuvre
1. Cocher une autre œuvre
2. Vérifier que :
   - Les témoins se rechargent
   - Les 3 premiers témoins sont automatiquement cochés
   - Le chapitre 1 est automatiquement sélectionné

#### Test 2 : Modifier la Sélection des Témoins
1. Décocher un témoin
2. Vérifier que :
   - L'étape 3 se verrouille (moins de 3 témoins)
3. Recocher un témoin pour avoir 3 témoins
4. Vérifier que :
   - L'étape 3 se débloque
   - Le chapitre 1 est sélectionné

#### Test 3 : Ajouter une Nouvelle Œuvre
1. Cliquer sur "Ajouter une nouvelle œuvre"
2. Remplir le formulaire (ex: nom = "Oeuvre Alpha")
3. Ajouter l'œuvre
4. Vérifier que :
   - L'œuvre apparaît dans la liste triée alphabétiquement
   - Si elle commence par "A", elle devient la première et est auto-sélectionnée

#### Test 4 : Ajouter un Nouveau Témoin
1. Sélectionner une œuvre qui a moins de 3 témoins
2. Cliquer sur "Ajouter un nouveau témoin"
3. Sélectionner un fichier JSON (le nom se pré-remplit)
4. Ajouter le témoin
5. Vérifier que :
   - Le témoin apparaît dans la liste triée alphabétiquement
   - Il est automatiquement coché
   - Si c'était le 3ème témoin, l'étape 3 se débloque

## Comportements Attendus

### Au Chargement de la Page

**Scénario A : Œuvre sans témoins**
```
Étape 1 : ✓ Première œuvre cochée
Étape 2 : ✓ Débloquée, message "Aucun témoin disponible"
Étape 3 : ✗ Verrouillée
```

**Scénario B : Œuvre avec 1-2 témoins**
```
Étape 1 : ✓ Première œuvre cochée
Étape 2 : ✓ Témoins cochés (tous si < 3)
Étape 3 : ✗ Verrouillée (besoin de 3 témoins)
```

**Scénario C : Œuvre avec 3+ témoins**
```
Étape 1 : ✓ Première œuvre cochée
Étape 2 : ✓ 3 premiers témoins cochés
Étape 3 : ✓ Débloquée, Chapitre 1 sélectionné
→ Prêt pour la collation !
```

### Ordre Alphabétique

**Œuvres (triées par nom)** :
```
- "Alpha Manuscrit"
- "Beta Texte"
- "test"
- "Test Oeuvre"
- "Zeta Document"
```

**Témoins (triés par nom)** :
```
- "BnF 1712"
- "BnF 2820"
- "Chantilly MS 123"
- "NAF 456"
```

## Console JavaScript (F12)

Observez les logs pour suivre le déroulement :

### Au Chargement
```javascript
onWorkSelected appelé avec workId: test
Œuvre sélectionnée: test
loadWitnesses appelé pour workId: test
Réponse API témoins: {...}
Témoins chargés: [...]
Témoins sélectionnés par défaut: ["id1", "id2", "id3"]
Activation de la section témoins
Chapitre 1 sélectionné par défaut: Chapitre 1
```

### En Changeant d'Œuvre
```javascript
onWorkSelected appelé avec workId: autre_id
Œuvre sélectionnée: autre_id
loadWitnesses appelé pour workId: autre_id
...
```

## Vérifications Techniques

### Test API
```bash
# Lister les œuvres
curl http://localhost:5001/api/works | python3 -m json.tool

# Lister les témoins d'une œuvre
curl http://localhost:5001/api/works/[ID_OEUVRE]/witnesses | python3 -m json.tool

# Lister les chapitres
curl http://localhost:5001/api/works/[ID_OEUVRE]/chapters | python3 -m json.tool
```

### Test Complet
```bash
make test
```

## Points Importants

### ✓ Ce qui fonctionne automatiquement
- Tri alphabétique des listes
- Sélection de la première œuvre
- Sélection des 3 premiers témoins
- Sélection du chapitre 1
- Déblocage automatique des étapes suivantes

### ⚠ Ce qui nécessite une action
- Cliquer sur "Lancer la collation" pour démarrer
- Ajouter des œuvres/témoins si la base est vide
- Modifier les sélections si vous ne voulez pas les défauts

## Cas Particuliers

### Base de Données Vide
Si aucune œuvre n'existe :
1. Message "Aucune œuvre enregistrée"
2. Cliquer sur "Ajouter une nouvelle œuvre"
3. Ajouter au moins une œuvre
4. Ajouter au moins 3 témoins pour cette œuvre

### Une Seule Œuvre
- Elle est automatiquement sélectionnée
- Impossible de désélectionner (radio button)

### Moins de 3 Témoins
- Tous les témoins disponibles sont cochés
- L'étape 3 reste verrouillée
- Message d'information (optionnel à ajouter)

## Retour d'Expérience

### Points Positifs ✓
- 

### Points à Améliorer 🔧
- 

### Bugs Trouvés 🐛
- 
