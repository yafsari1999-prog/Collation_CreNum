"""
Module de collation avec CollateX.
Gère l'alignement automatique des témoins mot par mot et vers par vers.
"""

from collatex import *
import json
import re


def normalize_token(token):
    """
    Normalise un token (basé sur le prototype).
    - Lowercase
    - Suppression doubles consonnes
    - Y → I
    - tz → s (AVANT ict/ist)
    - ict/ist → it
    """
    lowered = token.lower().strip()
    # Suppression doubles consonnes
    erase_doubles = re.sub(r'([bcdfglmnprt])\1', r'\1', lowered)
    # Y → I
    y_to_i = re.sub('y', 'i', erase_doubles)
    # tz → s (IMPORTANT: avant ict/ist pour éviter faictz → fais)
    no_tz = re.sub(r'tz$', r'ts', y_to_i)
    # ict/ist → it
    no_ist = re.sub(r'ict([sz])?$', r'it\1', no_tz)
    no_ict = re.sub(r'ist([sz])?$', r'it\1', no_ist)
    
    return no_ict


def tokenize_verses(verses):
    """
    Tokenise une liste de vers.
    Retourne une liste de tokens avec propriétés 't' (original), 'n' (normalisé), 'verse_nb'.
    
    Args:
        verses: Liste de dictionnaires avec propriété 'text' et 'region'
    
    Returns:
        Liste de tokens
    """
    tokens_list = []
    
    for verse_nb, verse_data in enumerate(verses):
        verse_text = verse_data.get('text', '').strip()
        
        # Tokenisation avec regex (capture mots + espaces)
        split_tokens = re.findall(r'\w+\s*|\W+', verse_text)
        
        for i, token in enumerate(split_tokens):
            # Premier token du vers : ajouter un espace devant
            if i == 0:
                token_info = {
                    "t": " " + token,
                    "n": normalize_token(token),
                    "verse_nb": verse_nb
                }
            else:
                token_info = {
                    "t": token,
                    "n": normalize_token(token),
                    "verse_nb": verse_nb
                }
            
            tokens_list.append(token_info)
    
    return tokens_list


def collate_witnesses(witnesses_data):
    """
    Lance la collation avec CollateX.
    
    Args:
        witnesses_data: Dict avec structure {"id": "...", "verses": [...]}
    
    Returns:
        JSON de collation
    """
    # TODO: Implémenter la collation complète
    witnesses = {
        "witnesses": []
    }
    
    for wit in witnesses_data:
        tokens = tokenize_verses(wit['verses'])
        witnesses["witnesses"].append({
            "id": wit['id'],
            "tokens": tokens
        })
    
    # Collation avec CollateX
    result = collate(witnesses, near_match=False, segmentation=True, 
                    layout="vertical", output="json")
    
    return json.loads(result)


def factorize_by_verse(collation_json):
    """
    Réorganise le JSON de collation pour factoriser par vers.
    1 ligne du tableau HTML = 1 vers (au lieu de multiples segments).
    
    Args:
        collation_json: Output JSON de CollateX
    
    Returns:
        Dict réorganisé par vers
    """
    # TODO: Implémenter la factorisation (voir prototype)
    pass
