"""
Module de collation avec CollateX.
Gère la comparaison de 3 témoins et la normalisation du texte.
"""

import json
from collatex import Collation, collate
import re


def normalize_text(text):
    """
    Normalise le texte selon les règles du projet CreNum.
    
    Règles de normalisation :
    - Minuscules
    - Lettres doubles -> simples (ss->s, ff->f, etc.)
    - Y -> I
    - ict/ist -> it
    - tz -> ts
    
    Args:
        text: Texte à normaliser
    
    Returns:
        Texte normalisé
    """
    if not text:
        return ""
    
    # Minuscules
    text = text.lower()
    
    # Lettres doubles -> simples
    text = re.sub(r'(.)\1', r'\1', text)
    
    # Y -> I
    text = text.replace('y', 'i')
    
    # ict/ist -> it
    text = text.replace('ict', 'it')
    text = text.replace('ist', 'it')
    
    # tz -> ts
    text = text.replace('tz', 'ts')
    
    return text


def load_witness_data(witness_file, chapter_index):
    """
    Charge les données d'un témoin pour un chapitre donné.
    
    Args:
        witness_file: Chemin vers le fichier JSON du témoin
        chapter_index: Index du chapitre (0-based)
    
    Returns:
        Liste de vers avec leurs métadonnées
    """
    try:
        with open(witness_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if not isinstance(data, list) or chapter_index >= len(data):
            return []
        
        chapter = data[chapter_index]
        
        # Extraire les vers
        verses = []
        for item in chapter:
            if isinstance(item, dict) and 'text' in item:
                verses.append({
                    'text': item['text'],
                    'text_normalized': normalize_text(item['text']),
                    'region': item.get('region', ''),
                    'alto_id': item.get('alto_id', ''),
                    'type': item.get('type', ''),
                    'page': item.get('page', '')
                })
        
        return verses
    except Exception as e:
        print(f"Erreur lors du chargement du témoin {witness_file}: {e}")
        return []


def collate_verse_words(texts, witness_names):
    """
    Utilise CollateX pour aligner les mots d'un vers entre 3 témoins.
    
    Args:
        texts: Liste de 3 textes (un par témoin)
        witness_names: Liste de 3 noms de témoins
    
    Returns:
        Liste de positions avec les mots alignés
    """
    # Créer une collation CollateX
    collation = Collation()
    
    for i, (text, name) in enumerate(zip(texts, witness_names)):
        if text:
            collation.add_plain_witness(name, text)
        else:
            collation.add_plain_witness(name, "")
    
    # Effectuer la collation
    try:
        alignment_json = collate(collation, output='json', segmentation=False)
        
        # Parser le résultat JSON (collate renvoie une chaîne JSON)
        if isinstance(alignment_json, str):
            alignment = json.loads(alignment_json)
        else:
            alignment = alignment_json
        
        # Parser le résultat JSON
        # La table CollateX est organisée par témoin (lignes) puis par colonnes
        # table[witness_idx][column_idx] = [tokens]
        table = alignment.get('table', [])
        witnesses = alignment.get('witnesses', witness_names)
        
        if not table or len(table) == 0:
            return fallback_word_alignment(texts, witness_names)
        
        # Trouver le nombre de colonnes (positions)
        num_columns = max(len(row) for row in table) if table else 0
        num_witnesses = len(table)
        
        # Construire la liste des positions alignées (transposer la table)
        aligned_words = []
        
        for col_idx in range(num_columns):
            position = {
                'index': col_idx,
                'words': [],
                'has_variant': False
            }
            
            unique_normalized = set()
            
            for wit_idx in range(num_witnesses):
                # Accéder à table[witness][column]
                if wit_idx < len(table) and col_idx < len(table[wit_idx]):
                    cell = table[wit_idx][col_idx]
                    if cell and len(cell) > 0:
                        # cell est une liste de tokens
                        word_text = ' '.join([t.get('t', '').strip() for t in cell])
                        word_normalized = normalize_text(word_text)
                        position['words'].append({
                            'witness_index': wit_idx,
                            'text': word_text,
                            'normalized': word_normalized,
                            'missing': False
                        })
                        unique_normalized.add(word_normalized)
                    else:
                        # Cellule vide (gap)
                        position['words'].append({
                            'witness_index': wit_idx,
                            'text': '',
                            'normalized': '',
                            'missing': True
                        })
                        unique_normalized.add('')
                else:
                    # Hors limites
                    position['words'].append({
                        'witness_index': wit_idx,
                        'text': '',
                        'normalized': '',
                        'missing': True
                    })
                    unique_normalized.add('')
            
            # Déterminer si cette position a une variante
            position['has_variant'] = len(unique_normalized) > 1
            aligned_words.append(position)
        
        return aligned_words
        
    except Exception as e:
        print(f"Erreur CollateX: {e}")
        # Fallback: alignement simple par position
        return fallback_word_alignment(texts, witness_names)


def fallback_word_alignment(texts, witness_names):
    """
    Alignement simple mot par mot si CollateX échoue.
    """
    words_per_witness = [t.split() if t else [] for t in texts]
    max_words = max(len(w) for w in words_per_witness) if words_per_witness else 0
    
    aligned_words = []
    for idx in range(max_words):
        position = {
            'index': idx,
            'words': [],
            'has_variant': False
        }
        
        unique_normalized = set()
        
        for wit_idx, words in enumerate(words_per_witness):
            if idx < len(words):
                word = words[idx]
                normalized = normalize_text(word)
                position['words'].append({
                    'witness_index': wit_idx,
                    'text': word,
                    'normalized': normalized,
                    'missing': False
                })
                unique_normalized.add(normalized)
            else:
                position['words'].append({
                    'witness_index': wit_idx,
                    'text': '',
                    'normalized': '',
                    'missing': True
                })
                unique_normalized.add('')
        
        position['has_variant'] = len(unique_normalized) > 1
        aligned_words.append(position)
    
    return aligned_words


def perform_collation(witness_files, witness_names, chapter_index):
    """
    Effectue la collation de 3 témoins pour un chapitre donné.
    
    Args:
        witness_files: Liste de 3 chemins vers les fichiers JSON
        witness_names: Liste de 3 noms de témoins
        chapter_index: Index du chapitre (0-based)
    
    Returns:
        Dict avec les résultats de collation structurés par vers
    """
    if len(witness_files) != 3 or len(witness_names) != 3:
        raise ValueError("Il faut exactement 3 témoins")
    
    # Charger les données des 3 témoins
    witnesses_data = []
    for file in witness_files:
        verses = load_witness_data(file, chapter_index)
        witnesses_data.append(verses)
    
    # Vérifier que tous les témoins ont des données
    if not all(witnesses_data):
        return {
            'error': 'Impossible de charger les données de tous les témoins',
            'witnesses': witness_names,
            'chapter': chapter_index
        }
    
    # Préparer les résultats
    max_verses = max(len(w) for w in witnesses_data)
    results = []
    
    for verse_idx in range(max_verses):
        verse_data = {
            'verse_number': verse_idx + 1,
            'witnesses': []
        }
        
        # Collecter les textes pour ce vers depuis les 3 témoins
        texts_for_collation = []
        for wit_idx in range(3):
            if verse_idx < len(witnesses_data[wit_idx]):
                verse = witnesses_data[wit_idx][verse_idx]
                verse_data['witnesses'].append({
                    'name': witness_names[wit_idx],
                    'text': verse['text'],
                    'text_normalized': verse['text_normalized'],
                    'metadata': {
                        'region': verse['region'],
                        'alto_id': verse['alto_id'],
                        'type': verse['type'],
                        'page': verse['page']
                    }
                })
                texts_for_collation.append(verse['text_normalized'])
            else:
                # Témoin manquant pour ce vers
                verse_data['witnesses'].append({
                    'name': witness_names[wit_idx],
                    'text': '',
                    'text_normalized': '',
                    'metadata': {},
                    'missing': True
                })
                texts_for_collation.append('')
        
        # Analyser les variantes
        verse_data['has_variants'] = len(set(texts_for_collation)) > 1
        verse_data['is_identical'] = len(set(texts_for_collation)) == 1
        
        # Calculer les similarités
        similarities = []
        if texts_for_collation[0] and texts_for_collation[1]:
            sim_01 = calculate_similarity(texts_for_collation[0], texts_for_collation[1])
            similarities.append(('0-1', sim_01))
        if texts_for_collation[0] and texts_for_collation[2]:
            sim_02 = calculate_similarity(texts_for_collation[0], texts_for_collation[2])
            similarities.append(('0-2', sim_02))
        if texts_for_collation[1] and texts_for_collation[2]:
            sim_12 = calculate_similarity(texts_for_collation[1], texts_for_collation[2])
            similarities.append(('1-2', sim_12))
        
        verse_data['similarities'] = similarities
        
        # Alignement mot par mot avec CollateX
        original_texts = [w['text'] for w in verse_data['witnesses']]
        verse_data['word_alignment'] = collate_verse_words(original_texts, witness_names)
        
        # Compter les variantes par mot
        verse_data['variant_word_count'] = sum(
            1 for pos in verse_data['word_alignment'] if pos['has_variant']
        )
        
        results.append(verse_data)
    
    return {
        'success': True,
        'witnesses': witness_names,
        'chapter': chapter_index,
        'total_verses': len(results),
        'verses': results
    }


def calculate_similarity(text1, text2):
    """
    Calcule la similarité entre deux textes (ratio de Levenshtein).
    
    Args:
        text1: Premier texte
        text2: Deuxième texte
    
    Returns:
        Score de similarité entre 0 et 1
    """
    try:
        from Levenshtein import ratio
        return round(ratio(text1, text2), 3)
    except ImportError:
        # Fallback simple si Levenshtein n'est pas installé
        if text1 == text2:
            return 1.0
        return 0.5
