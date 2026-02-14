"""
Module de gestion des équivalences orthographiques.
Permet de définir des variantes à ignorer (ex: Y/I, S/Z, etc.)
"""

import json
import os


class EquivalenceManager:
    """Gère les équivalences orthographiques."""
    
    def __init__(self, storage_path='../data/equivalences.json'):
        """
        Initialise le gestionnaire d'équivalences.
        
        Args:
            storage_path: Chemin vers le fichier de stockage des équivalences
        """
        self.storage_path = storage_path
        self.equivalences = self._load_equivalences()
    
    def add_equivalence(self, token1, token2):
        """
        Ajoute une équivalence orthographique.
        
        Args:
            token1: Premier token
            token2: Second token (équivalent)
        """
        key = tuple(sorted([token1.lower(), token2.lower()]))
        self.equivalences[f"{key[0]}|{key[1]}"] = True
        self._save_equivalences()
    
    def are_equivalent(self, token1, token2):
        """
        Vérifie si deux tokens sont équivalents.
        
        Args:
            token1: Premier token
            token2: Second token
        
        Returns:
            Boolean
        """
        if token1.lower() == token2.lower():
            return True
        
        key = tuple(sorted([token1.lower(), token2.lower()]))
        return f"{key[0]}|{key[1]}" in self.equivalences
    
    def get_all_equivalences(self):
        """Retourne toutes les équivalences définies."""
        return self.equivalences
    
    def _load_equivalences(self):
        """Charge les équivalences depuis le fichier."""
        if os.path.exists(self.storage_path):
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _save_equivalences(self):
        """Sauvegarde les équivalences."""
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, 'w', encoding='utf-8') as f:
            json.dump(self.equivalences, f, ensure_ascii=False, indent=2)
