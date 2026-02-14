"""
Tests unitaires pour le module de collation.
"""

import unittest
import sys
import os

# Ajouter le dossier parent au path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.collation import normalize_token, tokenize_verses


class TestCollation(unittest.TestCase):
    """Tests pour le module collation."""
    
    def test_normalize_token(self):
        """Test de la normalisation des tokens."""
        # Test lowercase
        self.assertEqual(normalize_token('Bonjour'), 'bonjour')
        
        # Test Y → I
        self.assertEqual(normalize_token('roy'), 'roi')
        
        # Test doubles consonnes
        self.assertEqual(normalize_token('abbé'), 'abé')
        
        # Test ict → it
        self.assertEqual(normalize_token('faict'), 'fait')
        
        # Test tz → s
        self.assertEqual(normalize_token('faictz'), 'faits')
    
    def test_tokenize_verses(self):
        """Test de la tokenisation."""
        verses = [
            {"text": "Il est ainsy", "region": "MainZone"},
            {"text": "que debte lonq", "region": "MainZone"}
        ]
        
        tokens = tokenize_verses(verses)
        
        # Vérifier que tous les tokens ont les bonnes propriétés
        for token in tokens:
            self.assertIn('t', token)  # token original
            self.assertIn('n', token)  # token normalisé
            self.assertIn('verse_nb', token)  # numéro du vers


if __name__ == '__main__':
    unittest.main()
