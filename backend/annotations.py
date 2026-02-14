"""
Module de gestion des annotations et qualifications des variantes.
Permet de marquer une variante comme pertinente, non pertinente ou à vérifier.
"""

import json
import os
from datetime import datetime


class AnnotationManager:
    """Gère les annotations des variantes."""
    
    def __init__(self, storage_path='../data/annotations'):
        """
        Initialise le gestionnaire d'annotations.
        
        Args:
            storage_path: Chemin vers le dossier de stockage des annotations
        """
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
    
    def save_annotation(self, annotation_data):
        """
        Sauvegarde une annotation.
        
        Args:
            annotation_data: Dict avec:
                - witness_id: ID du témoin
                - chapter: Numéro du chapitre
                - verse_nb: Numéro du vers
                - variant_index: Index du variant
                - annotation_type: 'pertinent' | 'non_pertinent' | 'a_verifier'
                - comment: Commentaire optionnel
        """
        file_name = f"annotations_chap_{annotation_data['chapter']}.json"
        file_path = os.path.join(self.storage_path, file_name)
        
        # Charger les annotations existantes
        annotations = self._load_annotations_file(file_path)
        
        # Ajouter la nouvelle annotation
        annotation_key = f"{annotation_data['verse_nb']}_{annotation_data['variant_index']}"
        annotations[annotation_key] = {
            "type": annotation_data['annotation_type'],
            "comment": annotation_data.get('comment', ''),
            "timestamp": datetime.now().isoformat()
        }
        
        # Sauvegarder
        self._save_annotations_file(file_path, annotations)
    
    def get_annotations(self, chapter):
        """
        Récupère toutes les annotations d'un chapitre.
        
        Args:
            chapter: Numéro du chapitre
        
        Returns:
            Dict des annotations
        """
        file_name = f"annotations_chap_{chapter}.json"
        file_path = os.path.join(self.storage_path, file_name)
        return self._load_annotations_file(file_path)
    
    def _load_annotations_file(self, file_path):
        """Charge un fichier d'annotations."""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _save_annotations_file(self, file_path, annotations):
        """Sauvegarde un fichier d'annotations."""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(annotations, f, ensure_ascii=False, indent=2)
