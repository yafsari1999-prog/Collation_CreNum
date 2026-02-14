"""
Module de gestion des œuvres et des témoins.
Permet d'ajouter, lister et gérer les œuvres et leurs témoins associés.
"""

import json
import os
import shutil
from datetime import datetime


class WorkManager:
    """Gère les œuvres et leurs témoins."""
    
    def __init__(self, works_file='../data/works.json', witnesses_dir='../data/input'):
        """
        Initialise le gestionnaire d'œuvres.
        
        Args:
            works_file: Chemin vers le fichier JSON des œuvres
            witnesses_dir: Dossier où stocker les fichiers témoins
        """
        self.works_file = works_file
        self.witnesses_dir = witnesses_dir
        os.makedirs(witnesses_dir, exist_ok=True)
        self._ensure_works_file()
    
    def _ensure_works_file(self):
        """Crée le fichier works.json s'il n'existe pas."""
        if not os.path.exists(self.works_file):
            self._save_works({"works": []})
    
    def _load_works(self):
        """Charge les œuvres depuis le fichier JSON."""
        with open(self.works_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_works(self, data):
        """Sauvegarde les œuvres dans le fichier JSON."""
        with open(self.works_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def list_works(self):
        """
        Liste toutes les œuvres.
        
        Returns:
            Liste des œuvres
        """
        data = self._load_works()
        return data.get('works', [])
    
    def get_work(self, work_id):
        """
        Récupère une œuvre par son ID.
        
        Args:
            work_id: ID de l'œuvre
        
        Returns:
            Dict de l'œuvre ou None
        """
        works = self.list_works()
        for work in works:
            if work['id'] == work_id:
                return work
        return None
    
    def add_work(self, name, author=None, date=None):
        """
        Ajoute une nouvelle œuvre.
        
        Args:
            name: Nom de l'œuvre (obligatoire)
            author: Auteur (optionnel)
            date: Date (optionnel)
        
        Returns:
            Dict de l'œuvre créée
        """
        data = self._load_works()
        
        # Générer un ID unique
        work_id = name.lower().replace(' ', '_').replace('-', '_')
        # S'assurer que l'ID est unique
        counter = 1
        original_id = work_id
        while any(w['id'] == work_id for w in data['works']):
            work_id = f"{original_id}_{counter}"
            counter += 1
        
        new_work = {
            "id": work_id,
            "name": name,
            "author": author,
            "date": date,
            "witnesses": [],
            "created_at": datetime.now().isoformat()
        }
        
        data['works'].append(new_work)
        self._save_works(data)
        return new_work
    
    def add_witness(self, work_id, witness_name, witness_file_path):
        """
        Ajoute un témoin à une œuvre.
        
        Args:
            work_id: ID de l'œuvre
            witness_name: Nom du témoin
            witness_file_path: Chemin vers le fichier JSON du témoin
        
        Returns:
            Dict du témoin créé ou None si erreur
        """
        data = self._load_works()
        
        # Trouver l'œuvre
        work = None
        for w in data['works']:
            if w['id'] == work_id:
                work = w
                break
        
        if not work:
            return None
        
        # Vérifier que le fichier existe
        if not os.path.exists(witness_file_path):
            return None
        
        # Copier le fichier dans le dossier des témoins
        witness_id = witness_name.lower().replace(' ', '_').replace('-', '_')
        filename = f"{witness_id}.json"
        dest_dir = os.path.join(self.witnesses_dir, work_id)
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, filename)
        
        shutil.copy2(witness_file_path, dest_path)
        
        # Ajouter le témoin à l'œuvre
        new_witness = {
            "id": witness_id,
            "name": witness_name,
            "file": dest_path,
            "added_at": datetime.now().isoformat()
        }
        
        work['witnesses'].append(new_witness)
        self._save_works(data)
        return new_witness
    
    def list_witnesses(self, work_id):
        """
        Liste les témoins d'une œuvre.
        
        Args:
            work_id: ID de l'œuvre
        
        Returns:
            Liste des témoins
        """
        work = self.get_work(work_id)
        if work:
            return work.get('witnesses', [])
        return []
    
    def get_witness_chapters(self, witness_file):
        """
        Récupère le nombre de chapitres d'un témoin.
        
        Args:
            witness_file: Chemin vers le fichier du témoin
        
        Returns:
            Nombre de chapitres
        """
        try:
            with open(witness_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return len(data) if isinstance(data, list) else 0
        except:
            return 0
    
    def update_work(self, work_id, name=None, author=None, date=None):
        """
        Met à jour une œuvre existante.
        
        Args:
            work_id: ID de l'œuvre
            name: Nouveau nom (optionnel)
            author: Nouvel auteur (optionnel)
            date: Nouvelle date (optionnel)
        
        Returns:
            Dict de l'œuvre mise à jour ou None si non trouvée
        """
        data = self._load_works()
        
        # Trouver l'œuvre
        work = None
        for w in data['works']:
            if w['id'] == work_id:
                work = w
                break
        
        if not work:
            return None
        
        # Mettre à jour les champs fournis
        if name is not None:
            work['name'] = name
        if author is not None:
            work['author'] = author
        if date is not None:
            work['date'] = date
        
        work['updated_at'] = datetime.now().isoformat()
        
        self._save_works(data)
        return work
    
    def delete_work(self, work_id):
        """
        Supprime une œuvre et tous ses témoins associés.
        
        Args:
            work_id: ID de l'œuvre
        
        Returns:
            True si supprimé, False si non trouvé
        """
        data = self._load_works()
        
        # Trouver l'œuvre
        work = None
        work_index = None
        for i, w in enumerate(data['works']):
            if w['id'] == work_id:
                work = w
                work_index = i
                break
        
        if not work:
            return False
        
        # Supprimer le dossier des témoins et tous les fichiers
        work_dir = os.path.join(self.witnesses_dir, work_id)
        if os.path.exists(work_dir):
            try:
                shutil.rmtree(work_dir)
            except Exception as e:
                print(f"Erreur lors de la suppression du dossier {work_dir}: {e}")
        
        # Supprimer l'œuvre de la liste
        data['works'].pop(work_index)
        self._save_works(data)
        return True
    
    def update_witness(self, work_id, witness_id, new_name):
        """
        Met à jour le nom d'un témoin.
        
        Args:
            work_id: ID de l'œuvre
            witness_id: ID du témoin
            new_name: Nouveau nom du témoin
        
        Returns:
            Dict du témoin mis à jour ou None si non trouvé
        """
        data = self._load_works()
        
        # Trouver l'œuvre
        work = None
        for w in data['works']:
            if w['id'] == work_id:
                work = w
                break
        
        if not work:
            return None
        
        # Trouver le témoin
        witness = None
        for wit in work['witnesses']:
            if wit['id'] == witness_id:
                witness = wit
                break
        
        if not witness:
            return None
        
        # Mettre à jour le nom
        witness['name'] = new_name
        witness['updated_at'] = datetime.now().isoformat()
        
        self._save_works(data)
        return witness
    
    def delete_witness(self, work_id, witness_id):
        """
        Supprime un témoin d'une œuvre.
        
        Args:
            work_id: ID de l'œuvre
            witness_id: ID du témoin
        
        Returns:
            True si supprimé, False si non trouvé
        """
        data = self._load_works()
        
        # Trouver l'œuvre
        work = None
        for w in data['works']:
            if w['id'] == work_id:
                work = w
                break
        
        if not work:
            return False
        
        # Trouver et supprimer le témoin
        witness_index = None
        witness_file = None
        for i, wit in enumerate(work['witnesses']):
            if wit['id'] == witness_id:
                witness_index = i
                witness_file = wit.get('file')
                break
        
        if witness_index is None:
            return False
        
        # Supprimer le fichier du témoin
        if witness_file and os.path.exists(witness_file):
            try:
                os.remove(witness_file)
            except Exception as e:
                print(f"Erreur lors de la suppression du fichier {witness_file}: {e}")
        
        # Supprimer le témoin de la liste
        work['witnesses'].pop(witness_index)
        self._save_works(data)
        return True
