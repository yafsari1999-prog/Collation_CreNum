"""
Module d'import et de structuration des données.
Parse les fichiers JSON des manuscrits et filtre les régions.
"""

import json
import os


def load_witness_json(file_path):
    """
    Charge un fichier JSON de témoin.
    
    Args:
        file_path: Chemin vers le fichier JSON
    
    Returns:
        Liste de chapitres (chaque chapitre = liste de vers)
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def filter_regions(verses, allowed_regions=None):
    """
    Filtre les vers selon leur région.
    
    Args:
        verses: Liste de vers avec propriété 'region'
        allowed_regions: Liste des régions à garder (défaut: MainZone, Rubric, Chapter)
    
    Returns:
        Liste de vers filtrés
    """
    if allowed_regions is None:
        allowed_regions = ['MainZone', 'Rubric', 'Chapter']
    
    return [v for v in verses if v.get('region') in allowed_regions]


def get_chapter_by_index(witness_data, chapter_index):
    """
    Récupère un chapitre spécifique d'un témoin.
    
    Args:
        witness_data: Données complètes du témoin (liste de chapitres)
        chapter_index: Index du chapitre (0-based)
    
    Returns:
        Liste de vers du chapitre
    """
    if chapter_index < len(witness_data):
        return witness_data[chapter_index]
    return []


def prepare_witnesses_for_collation(witness_files, chapter_index=0):
    """
    Prépare les témoins pour la collation.
    Charge les fichiers, filtre les régions, sélectionne le chapitre.
    
    Args:
        witness_files: Dict {id: file_path}
        chapter_index: Index du chapitre à collationner
    
    Returns:
        Liste de témoins prêts pour CollateX
    """
    witnesses = []
    
    for wit_id, file_path in witness_files.items():
        # Charger le JSON
        data = load_witness_json(file_path)
        
        # Récupérer le chapitre
        chapter = get_chapter_by_index(data, chapter_index)
        
        # Filtrer les régions
        filtered_verses = filter_regions(chapter)
        
        witnesses.append({
            "id": wit_id,
            "verses": filtered_verses
        })
    
    return witnesses
