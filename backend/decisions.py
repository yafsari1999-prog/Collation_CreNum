"""
Module de gestion des décisions de collation.
Permet de sauvegarder et charger les annotations/qualifications des utilisateurs.
"""

import json
import os
from datetime import datetime


class DecisionManager:
    """Gère les décisions de collation des utilisateurs."""
    
    def __init__(self, decisions_dir='../data/decisions'):
        """
        Initialise le gestionnaire de décisions.
        
        Args:
            decisions_dir: Dossier où stocker les décisions
        """
        self.decisions_dir = decisions_dir
        os.makedirs(decisions_dir, exist_ok=True)
    
    def _get_decision_file(self, work_id, chapter_index):
        """
        Retourne le chemin du fichier de décisions pour une œuvre/chapitre.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
        
        Returns:
            Chemin vers le fichier JSON
        """
        filename = f"{work_id}_chapter_{chapter_index}.json"
        return os.path.join(self.decisions_dir, filename)
    
    def save_decision(self, work_id, chapter_index, verse_number, decision_data):
        """
        Sauvegarde une décision pour un vers spécifique.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
            verse_number: Numéro du vers
            decision_data: Données de la décision
        
        Returns:
            True si sauvegardé avec succès
        """
        file_path = self._get_decision_file(work_id, chapter_index)
        
        # Charger les décisions existantes
        decisions = self.load_decisions(work_id, chapter_index)
        
        # Ajouter/mettre à jour la décision
        decision_data['verse_number'] = verse_number
        decision_data['timestamp'] = datetime.now().isoformat()
        
        # Chercher si une décision existe déjà pour ce vers
        existing_index = None
        for i, dec in enumerate(decisions.get('verses', [])):
            if dec.get('verse_number') == verse_number:
                existing_index = i
                break
        
        if 'verses' not in decisions:
            decisions['verses'] = []
        
        if existing_index is not None:
            decisions['verses'][existing_index] = decision_data
        else:
            decisions['verses'].append(decision_data)
        
        # Mettre à jour les métadonnées
        decisions['work_id'] = work_id
        decisions['chapter_index'] = chapter_index
        decisions['last_modified'] = datetime.now().isoformat()
        decisions['total_decisions'] = len(decisions['verses'])
        
        # Sauvegarder
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(decisions, f, ensure_ascii=False, indent=2)
        
        return True
    
    def load_decisions(self, work_id, chapter_index):
        """
        Charge les décisions pour une œuvre/chapitre.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
        
        Returns:
            Dict avec les décisions ou dict vide si aucune
        """
        file_path = self._get_decision_file(work_id, chapter_index)
        
        if not os.path.exists(file_path):
            return {
                'work_id': work_id,
                'chapter_index': chapter_index,
                'verses': [],
                'total_decisions': 0
            }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erreur lors du chargement des décisions: {e}")
            return {
                'work_id': work_id,
                'chapter_index': chapter_index,
                'verses': [],
                'total_decisions': 0
            }
    
    def get_decision_for_verse(self, work_id, chapter_index, verse_number):
        """
        Récupère la décision pour un vers spécifique.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
            verse_number: Numéro du vers
        
        Returns:
            Dict avec la décision ou None
        """
        decisions = self.load_decisions(work_id, chapter_index)
        
        for dec in decisions.get('verses', []):
            if dec.get('verse_number') == verse_number:
                return dec
        
        return None
    
    def delete_decision(self, work_id, chapter_index, verse_number):
        """
        Supprime une décision pour un vers.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
            verse_number: Numéro du vers
        
        Returns:
            True si supprimé avec succès
        """
        file_path = self._get_decision_file(work_id, chapter_index)
        
        if not os.path.exists(file_path):
            return False
        
        decisions = self.load_decisions(work_id, chapter_index)
        
        # Filtrer les décisions
        original_count = len(decisions.get('verses', []))
        decisions['verses'] = [
            dec for dec in decisions.get('verses', [])
            if dec.get('verse_number') != verse_number
        ]
        
        # Mettre à jour les métadonnées
        decisions['total_decisions'] = len(decisions['verses'])
        decisions['last_modified'] = datetime.now().isoformat()
        
        # Sauvegarder
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(decisions, f, ensure_ascii=False, indent=2)
        
        return len(decisions['verses']) < original_count
    
    def get_statistics(self, work_id, chapter_index):
        """
        Calcule des statistiques sur les décisions.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
        
        Returns:
            Dict avec les statistiques
        """
        decisions = self.load_decisions(work_id, chapter_index)
        
        total = len(decisions.get('verses', []))
        
        # Compter par type de qualification
        qualifications = {}
        for dec in decisions.get('verses', []):
            qual = dec.get('qualification', 'non_qualifie')
            qualifications[qual] = qualifications.get(qual, 0) + 1
        
        return {
            'total_decisions': total,
            'qualifications': qualifications,
            'last_modified': decisions.get('last_modified')
        }


class WordDecisionManager:
    """Gère les décisions au niveau mot (ignorer / conserver)."""
    
    def __init__(self, decisions_dir='../data/decisions'):
        self.decisions_dir = decisions_dir
        os.makedirs(decisions_dir, exist_ok=True)
    
    def _get_file(self, work_id, chapter_index):
        """Fichier dédié aux décisions de mots."""
        filename = f"{work_id}_chapter_{chapter_index}_words.json"
        return os.path.join(self.decisions_dir, filename)
    
    def _load(self, work_id, chapter_index):
        file_path = self._get_file(work_id, chapter_index)
        if not os.path.exists(file_path):
            return {'work_id': work_id, 'chapter_index': chapter_index, 'decisions': []}
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erreur chargement décisions mots: {e}")
            return {'work_id': work_id, 'chapter_index': chapter_index, 'decisions': []}
    
    def _save(self, work_id, chapter_index, data):
        file_path = self._get_file(work_id, chapter_index)
        data['last_modified'] = datetime.now().isoformat()
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def save_word_decision(self, work_id, chapter_index, verse_number, position,
                           action, explication=None, words=None, pages=None):
        """
        Sauvegarde une décision pour un mot.
        
        Args:
            work_id: ID de l'œuvre
            chapter_index: Index du chapitre
            verse_number: Numéro du vers
            position: Index de position du mot dans l'alignement
            action: 'conserver' ou 'ignorer'
            explication: Texte d'explication (optionnel)
            words: Dict {witness_name: word_text}
            pages: Dict {witness_name: page_number}
        """
        data = self._load(work_id, chapter_index)
        
        decision = {
            'verse_number': verse_number,
            'position': position,
            'action': action,
            'explication': explication,
            'words': words or {},
            'pages': pages or {},
            'timestamp': datetime.now().isoformat()
        }
        
        # Remplacer si existant
        existing_idx = None
        for i, dec in enumerate(data['decisions']):
            if dec['verse_number'] == verse_number and dec['position'] == position:
                existing_idx = i
                break
        
        if existing_idx is not None:
            data['decisions'][existing_idx] = decision
        else:
            data['decisions'].append(decision)
        
        self._save(work_id, chapter_index, data)
        return True
    
    def load_word_decisions(self, work_id, chapter_index):
        """Charge toutes les décisions de mots pour un chapitre."""
        data = self._load(work_id, chapter_index)
        return data.get('decisions', [])
    
    def delete_word_decision(self, work_id, chapter_index, verse_number, position):
        """Supprime une décision de mot."""
        data = self._load(work_id, chapter_index)
        original = len(data['decisions'])
        data['decisions'] = [
            d for d in data['decisions']
            if not (d['verse_number'] == verse_number and d['position'] == position)
        ]
        self._save(work_id, chapter_index, data)
        return len(data['decisions']) < original
    
    def count_all_decisions(self, work_id):
        """
        Compte toutes les décisions de mots pour une œuvre.
        
        Args:
            work_id: ID de l'œuvre
            
        Returns:
            Nombre total de décisions
        """
        import glob
        pattern = os.path.join(self.decisions_dir, f"{work_id}_chapter_*_words.json")
        files = glob.glob(pattern)
        
        total = 0
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    total += len(data.get('decisions', []))
            except Exception as e:
                print(f"Erreur lecture {file_path}: {e}")
        
        return total
    
    def delete_all_decisions(self, work_id):
        """
        Supprime toutes les décisions de mots pour une œuvre.
        
        Args:
            work_id: ID de l'œuvre
            
        Returns:
            Nombre de fichiers supprimés
        """
        import glob
        pattern = os.path.join(self.decisions_dir, f"{work_id}_chapter_*_words.json")
        files = glob.glob(pattern)
        
        deleted = 0
        for file_path in files:
            try:
                os.remove(file_path)
                deleted += 1
            except Exception as e:
                print(f"Erreur suppression {file_path}: {e}")
        
        return deleted
