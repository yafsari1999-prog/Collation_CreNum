# Guide Utilisateur - Collation CreNum

## Table des Matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Démarrage de l'application](#démarrage-de-lapplication)
4. [Étapes de la collation](#étapes-de-la-collation)
   - [Étape 1 : Sélection de l'œuvre](#étape-1--sélection-de-lœuvre)
   - [Étape 2 : Sélection des témoins](#étape-2--sélection-des-témoins)
   - [Étape 3 : Sélection du chapitre](#étape-3--sélection-du-chapitre)
   - [Étape 4 : Lancement de la collation](#étape-4--lancement-de-la-collation)
   - [Étape 5 : Qualification des variantes](#étape-5--qualification-des-variantes)
   - [Étape 6 : Sauvegarde et export](#étape-6--sauvegarde-et-export)
5. [Limitation à 3 témoins](#limitation-à-3-témoins)
6. [Dépannage](#dépannage)

---

## Introduction

**Collation CreNum** est une application web de collation automatique de manuscrits en moyen français. Elle permet de comparer jusqu'à **3 manuscrits (témoins)** en parallèle et de qualifier les variantes textuelles.

### Fonctionnalités principales

- Collation automatique utilisant l'algorithme CollateX
- Affichage côte-à-côte de 3 manuscrits
- Visualisation des différences par survol (hover)
- Qualification des variantes (conserver/ignorer/à vérifier)
- Sauvegarde automatique des décisions
- Export des résultats

---

## Prérequis

Avant d'utiliser l'application, assurez-vous que :

- ✅ L'application est installée (voir [INSTALLATION.md](INSTALLATION.md))
- ✅ L'environnement virtuel Python est activé
- ✅ Vos fichiers de témoins sont au format JSON (vous les ajouterez via l'interface)
- ✅ Vous avez **exactement 3 témoins** par œuvre (requis)

> **📖 Format des données** : Consultez [DONNEES.md](DONNEES.md) pour le format JSON attendu.

---

## Démarrage de l'application

### 1. Lancer le serveur

```bash
./start.sh
```

L'application démarre sur **http://localhost:5001**

> **💡 Astuce** : Si le port 5001 est occupé, consultez les alternatives dans [INSTALLATION.md](INSTALLATION.md#si-le-port-5001-est-déjà-occupé).

### 2. Ouvrir l'interface

Ouvrez votre navigateur à l'adresse **http://localhost:5001**

**Interface affichée :**
- En-tête : "Interface de Collation Automatique - Projet CreNum"
- **Étape 1** : Carte "Sélection de l'œuvre" avec liste des œuvres et bouton "Ajouter une nouvelle œuvre"
- **Étape 2** : Carte "Sélection des témoins (3 requis)" (désactivée au départ)
- **Étape 3** : Carte "Sélection du chapitre" (désactivée au départ)

---

## Étapes de la collation

### Étape 1 : Sélection de l'œuvre

L'interface affiche la liste des œuvres disponibles. Une œuvre correspond à un ensemble de témoins d'un même texte.

#### 1.1 Sélectionner une œuvre existante

- Cliquez sur le nom de l'œuvre dans la liste
- Elle sera surlignée en bleu

**Affichage :**
- Liste des œuvres disponibles avec leur nom
- L'œuvre sélectionnée apparaît avec un fond bleu
- Exemple : "roman_de_la_rose" (œuvre contenant 3 témoins du même manuscrit)

#### 1.2 Ou créer une nouvelle œuvre

1. Cliquez sur le bouton **"Ajouter une nouvelle œuvre"**
2. Une fenêtre modale s'ouvre
3. Renseignez les informations :
   - **Nom de l'œuvre** : Identifiant unique (ex: `bnf_manuscrit_123`)
   - **Titre** : Titre complet (ex: `Le Roman de la Rose`)
   - **Auteur** : Nom de l'auteur (ex: `Guillaume de Lorris`)
4. Cliquez sur **"Créer l'œuvre"**

**Modal affiché :**
- Formulaire avec 3 champs (Nom, Titre, Auteur)
- Boutons : "Créer l'œuvre" (bleu) et "Annuler" (gris)

> **💡 Astuce** : Le nom de l'œuvre sera utilisé comme identifiant unique. Choisissez un nom descriptif sans espaces (ex: `roman_de_la_rose`).

---

### Étape 2 : Sélection des témoins

Après avoir sélectionné une œuvre, la section "Sélection des témoins" s'active.

#### 2.1 Témoins requis : exactement 3

L'application affiche les témoins disponibles pour l'œuvre sélectionnée. **Vous devez sélectionner exactement 3 témoins.**

**Affichage :**
- Liste des témoins avec cases à cocher
- Nom de chaque témoin affiché (ex: "manuscrit_paris", "manuscrit_oxford", "manuscrit_florence")
- Compteur indiquant le nombre de témoins sélectionnés

#### 2.2 Sélectionner 3 témoins

- Cochez les cases des 3 témoins que vous souhaitez comparer
- L'interface limite automatiquement la sélection à 3 témoins maximum
- Les témoins sélectionnés sont surlignés en vert avec une icône de validation

**Comportement :**
- Après sélection de 3 témoins, la section "Sélection du chapitre" s'active automatiquement

> **💡 Astuce** : Si vous cliquez sur un quatrième témoin alors que 3 sont déjà sélectionnés, le premier sera automatiquement désélectionné.

#### 2.3 Ajouter un nouveau témoin

Si votre œuvre a moins de 3 témoins :

1. Cliquez sur **"Ajouter un nouveau témoin"**
2. Renseignez le nom du témoin (ex: `manuscrit_paris`)
3. Cliquez sur **"Parcourir"** pour sélectionner le fichier JSON depuis votre ordinateur
4. Cliquez sur **"Ajouter le témoin"**

**Modal affiché :**
- Champ texte pour le nom du témoin
- Bouton "Parcourir" pour sélectionner un fichier JSON depuis n'importe quel dossier de votre ordinateur
- Boutons : "Ajouter le témoin" (vert) et "Annuler" (gris)

> **💡 Astuce** : Le fichier sera automatiquement copié et enregistré dans l'application. Vous pouvez sélectionner un fichier depuis n'importe quel emplacement sur votre ordinateur.

---

### Étape 3 : Sélection du chapitre

Une fois 3 témoins sélectionnés, la section "Sélection du chapitre" s'active.

#### 3.1 Choisir un chapitre

- Le menu déroulant affiche la liste des chapitres disponibles
- Sélectionnez le chapitre à collationner

**Affichage :**
- Menu déroulant avec la liste "Chapitre 0", "Chapitre 1", etc.
- Bouton "Lancer la collation" (bleu) à droite du menu

> **📖 Note** : Les numéros de chapitres correspondent aux indices dans le fichier JSON (0 = chapitre 1).

---

### Étape 4 : Lancement de la collation

#### 4.1 Lancer la collation

- Cliquez sur le bouton **"Lancer la collation"**
- L'application traite les données (cela peut prendre quelques secondes)
- Les résultats s'affichent en bas de la page

**Affichage des résultats :**
- Nouvelle section "Résultats de la collation" apparaît
- Tableau avec 3 colonnes (une par témoin)
- En-têtes : nom de chaque témoin sélectionné
- Lignes numérotées avec le texte aligné

#### 4.2 Comprendre l'affichage

L'interface affiche les 3 témoins en **colonnes parallèles** :

| Témoin 1 (Manuscrit A) | Témoin 2 (Manuscrit B) | Témoin 3 (Manuscrit C) |
|------------------------|------------------------|------------------------|
| Il est ainsi que...    | Il est ainsy que...    | Il est ainsi que...    |

**Code couleur :**
- **Texte noir normal** : Mots identiques dans tous les témoins
- **Texte avec fond jaune** : Variantes (différences entre témoins)
- Les mots cliquables pour qualification

#### 4.3 Visualiser les différences au survol

Passez la souris sur un mot surligné pour voir les détails de la variante.

**Effet visuel :**
- Le mot change de couleur au survol (fond plus foncé)
- Curseur en forme de pointeur pour indiquer que c'est cliquable
- Cliquer ouvre le modal de qualification

---

### Étape 5 : Qualification des variantes

Pour chaque variante, vous pouvez qualifier son importance.

#### 5.1 Ouvrir le modal de classification

- Cliquez sur une variante (mot surligné) dans n'importe quelle colonne
- Un modal s'ouvre avec les détails de la variante

**Modal affiché :**
- Titre : "Qualifier cette variante"
- Informations : numéro de vers et position du mot
- Affichage des 3 variantes (une par témoin)
- 3 boutons d'action en bas

#### 5.2 Contenu du modal

Le modal affiche :

- **Numéro du vers** : Position dans le chapitre
- **Position du mot** : Index du mot dans le vers
- **Les 3 variantes** : Un champ par témoin avec le texte

Exemple :
```
Vers 12, Mot 5

Témoin 1 (Manuscrit A): "troysiesme"
Témoin 2 (Manuscrit B): "troisième"
Témoin 3 (Manuscrit C): "3e"
```

#### 5.3 Qualifier la variante

Choisissez une action :

- **Conserver** (bouton vert) : Variante pertinente à garder dans l'édition critique
- **Ignorer** (bouton gris) : Variante non pertinente (ex: différence graphique mineure)
- **À vérifier** (bouton orange) : Variante nécessitant une analyse plus approfondie

Cliquez sur le bouton correspondant à votre choix. Le modal se ferme automatiquement après la sélection.

#### 5.4 Résultat après qualification

Après qualification, la variante change de couleur dans l'interface :

**Code couleur final :**
- **Fond vert clair** : Variante conservée
- **Fond gris clair** : Variante ignorée
- **Fond orange clair** : Variante à vérifier

Les décisions sont sauvegardées automatiquement et visibles immédiatement dans le tableau.

---

### Étape 6 : Sauvegarde et export

#### 6.1 Sauvegarde automatique

Les décisions sont **sauvegardées automatiquement** en temps réel dans :

```
data/decisions/{nom_oeuvre}_chapter_{numero}_words.json
```

Exemple : `data/decisions/roman_de_la_rose_chapter_0_words.json`

> **💡 Astuce** : Si vous rechargez la page ou revenez au même chapitre, vos décisions sont automatiquement restaurées.

#### 6.2 Sauvegarder toutes les décisions (export manuel)

Pour forcer une sauvegarde complète :

1. Cliquez sur le bouton **"Sauvegarder toutes les décisions"** (en bas de la page des résultats)
2. Un message de confirmation s'affiche : "Décisions sauvegardées avec succès"
3. Les décisions sont exportées dans le fichier JSON

**Emplacement du bouton :**
- En bas de la section des résultats
- Bouton bleu avec icône de disquette
- Toujours visible pendant la qualification

#### 6.3 Format du fichier de décisions

Le fichier JSON contient :

```json
{
  "work_id": "roman_de_la_rose",
  "chapter_index": 0,
  "decisions": [
    {
      "verse_number": 12,
      "position": 5,
      "action": "conserver",
      "words": ["troysiesme", "troisième", "3e"],
      "pages": ["page1.xml", "page2.xml", "page3.xml"],
      "timestamp": "2026-02-19T14:32:10.123456"
    }
  ]
}
```

> **📖 Documentation complète** : Voir [DONNEES.md](DONNEES.md) pour plus de détails.

---

## Limitation à 3 témoins

### Pourquoi exactement 3 témoins ?

L'application Collation CreNum est conçue pour fonctionner avec **exactement 3 témoins** (ni plus, ni moins).

#### Raisons techniques

1. **Interface utilisateur** : L'affichage est optimisé pour 3 colonnes parallèles
   - Lisibilité maximale sur un écran standard
   - Comparaison visuelle côte-à-côte efficace
   
2. **Algorithme de collation** : CollateX est configuré pour une comparaison tripartite
   - Détection optimale des variantes communes et uniques
   - Performance de calcul adaptée à 3 sources
   
3. **Cas d'usage CreNum** : Le projet cible la comparaison de 3 manuscrits principaux
   - Méthodologie de l'édition critique : tradition tripartite
   - Équilibre entre exhaustivité et complexité

#### Comportement de l'application

- **Sélection limitée** : L'interface empêche de sélectionner plus de 3 témoins
- **Sélection automatique** : Si plus de 3 témoins sont présents, seuls les 3 premiers cochés sont pris en compte
- **Message d'erreur** : Si moins de 3 témoins sont sélectionnés, la collation ne peut pas démarrer

#### Fichiers concernés

Cette limitation est implémentée dans :

- [backend/app.py](backend/app.py#L222) : Validation côté serveur
- [backend/collate.py](backend/collate.py#L323) : Logique de collation
- [frontend/static/js/modules/witnesses.js](frontend/static/js/modules/witnesses.js) : Validation côté client (lignes 105, 120, 138, 143)

### Évolution future

Si votre projet nécessite de comparer plus de 3 témoins, une évolution majeure de l'application serait nécessaire :

- Refonte de l'interface (affichage dynamique)
- Adaptation de l'algorithme de collation
- Révision de la logique de qualification des variantes

> **💡 Conseil** : Pour comparer plus de 3 témoins, réalisez plusieurs collations en changeant les témoins sélectionnés.

---

## Dépannage

### Problème : L'interface ne charge pas

**Solution** :
- Vérifiez que le serveur est démarré : `./start.sh`
- Vérifiez l'URL : http://localhost:5001
- Consultez la console du navigateur (F12) pour les erreurs JavaScript

### Problème : Je ne peux pas sélectionner plus de 3 témoins

**Réponse** : C'est normal ! L'application est limitée à 3 témoins (voir [Limitation à 3 témoins](#limitation-à-3-témoins)).

### Problème : Mes décisions ne sont pas sauvegardées

**Vérifications** :
1. Le serveur est démarré et accessible
2. L'œuvre et les témoins sont bien créés dans l'interface
3. Consultez la console du navigateur (F12) pour les erreurs d'API

### Problème : La collation échoue

**Causes possibles** :
- Format JSON invalide dans les fichiers de témoins
- Moins de 3 témoins sélectionnés
- Chapitre manquant dans l'un des témoins

**Solutions** :
- Validez le format JSON avec [DONNEES.md](DONNEES.md)
- Vérifiez que les 3 témoins ont le même nombre de chapitres

### Problème : Le port 5001 est déjà occupé

**Solutions** : Consultez [INSTALLATION.md](INSTALLATION.md#si-le-port-5001-est-déjà-occupé) pour 2 alternatives.

---

## Support

Pour plus d'informations :

- **Installation** : [INSTALLATION.md](INSTALLATION.md)
- **Format des données** : [DONNEES.md](DONNEES.md)
- **Code source** : [README.md](README.md)

---

**© 2026 - Projet CreNum - Yasaman AFSARI VELAYATI, Kemal Çelik**
