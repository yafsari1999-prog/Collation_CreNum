# Test de la Nouvelle Interface Témoins

## Modifications Effectuées

### 1. Sélection des Témoins par Checkboxes
- **Avant** : 3 dropdowns séparés (Témoin 1, 2, 3)
- **Maintenant** : Liste scrollable avec checkboxes, maximum 3 sélectionnables

### 2. Bouton "Ajouter Nouveau Témoin"
- Un seul bouton en bas de la liste
- Plus besoin de choisir quel témoin (1, 2, ou 3)

### 3. Pré-remplissage Automatique du Nom
- Quand vous sélectionnez un fichier JSON, le nom du témoin est automatiquement rempli
- Le nom est extrait du nom du fichier :
  - `bnf_1712.json` → "Bnf 1712"
  - `chantilly_ms_123.json` → "Chantilly Ms 123"
- Vous pouvez toujours modifier le nom après

## Comment Tester

### Étape 1 : Ouvrir l'Application
```
http://localhost:5001
```

### Étape 2 : Sélectionner une Œuvre
1. Cochez une œuvre dans la liste
2. La section "Étape 2 : Sélection des témoins" devrait se débloquer

### Étape 3 : Ajouter un Témoin (Test du Pré-remplissage)
1. Cliquez sur **"Ajouter un nouveau témoin"**
2. Dans le dialogue :
   - **Sélectionnez d'abord le fichier JSON**
   - Le champ "Nom du témoin" devrait se remplir automatiquement
   - Vous pouvez modifier le nom si nécessaire
3. Cliquez sur "Ajouter"

### Étape 4 : Sélectionner les Témoins
1. Dans la liste qui apparaît, cochez jusqu'à 3 témoins
2. Si vous essayez de cocher un 4ème témoin, une alerte apparaîtra
3. Vous pouvez décocher et recocher pour changer votre sélection

### Étape 5 : Continuer le Workflow
1. Une fois 3 témoins sélectionnés, l'"Étape 3 : Sélection du chapitre" se débloque
2. Continuez normalement

## Comportements à Vérifier

### ✓ Pré-remplissage du Nom
- [ ] Le nom se remplit automatiquement quand je sélectionne un fichier
- [ ] Les underscores `_` et tirets `-` sont remplacés par des espaces
- [ ] Les mots sont capitalisés (première lettre en majuscule)
- [ ] Je peux modifier le nom avant de cliquer sur "Ajouter"

### ✓ Sélection des Témoins
- [ ] Je peux cocher jusqu'à 3 témoins
- [ ] Une alerte apparaît si j'essaie de cocher un 4ème témoin
- [ ] Je peux décocher un témoin pour en choisir un autre
- [ ] La liste est scrollable s'il y a beaucoup de témoins

### ✓ Activation de l'Étape 3
- [ ] L'étape 3 se débloque seulement avec exactement 3 témoins
- [ ] Si je décoche un témoin, l'étape 3 se verrouille à nouveau

## Console JavaScript (F12)

Ouvrez la console pour voir les logs de débogage :
- `onWorkSelected appelé avec workId: ...`
- `Témoins chargés: [...]`
- `Témoins sélectionnés: [...]`
- `Nom du témoin pré-rempli: ...`

## En Cas de Problème

### Le nom ne se pré-remplit pas
1. Vérifiez la console (F12)
2. Assurez-vous d'avoir sélectionné un fichier .json
3. Le champ "Nom du témoin" doit être vide avant de sélectionner le fichier

### Les témoins ne s'affichent pas
1. Vérifiez que vous avez bien sélectionné une œuvre
2. Ouvrez la console et vérifiez les logs
3. Testez l'API : `curl http://localhost:5001/api/works/[ID_OEUVRE]/witnesses`

### L'étape 3 ne se débloque pas
1. Vérifiez que vous avez **exactement 3 témoins** cochés
2. Ouvrez la console et vérifiez `appState.selectedWitnesses`

## Fichiers Modifiés

- `frontend/templates/index.html` - Structure HTML de la sélection des témoins
- `frontend/static/css/style.css` - Styles pour #witnesses-list
- `frontend/static/js/app.js` - Logique JavaScript :
  - `updateWitnessesSelects()` - Crée la liste de checkboxes
  - `onWitnessCheckboxChanged()` - Gère la sélection (max 3)
  - `updateWitnessNameFromFile()` - Pré-remplit le nom
  - `openAddWitnessModal()` - Ouvre le dialogue
  - `addWitness()` - Ajoute le témoin et le sélectionne automatiquement

## Retour d'Expérience

Après vos tests, notez ici ce qui fonctionne bien et ce qui pourrait être amélioré :

### Ce qui fonctionne bien ✓
- 

### À améliorer 🔧
- 

### Bugs trouvés 🐛
- 
