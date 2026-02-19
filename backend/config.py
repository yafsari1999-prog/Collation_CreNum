"""
Configuration de l'application.
Paramètres pour CollateX, chemins des données, etc.
"""

import os

# Chemins des données
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
INPUT_DIR = os.path.join(DATA_DIR, 'input')
OUTPUT_DIR = os.path.join(DATA_DIR, 'output')
ANNOTATIONS_DIR = os.path.join(DATA_DIR, 'annotations')

# Témoins disponibles
WITNESSES = {
    'bnf_1712': os.path.join(INPUT_DIR, 'bnf_1712_by_chap', 'bnf_1712_by_chap.json'),
    'bnf_2820': os.path.join(INPUT_DIR, 'bnf_2820_by_chap', 'bnf_2820_by_chap.json'),
    'chantilly': os.path.join(INPUT_DIR, 'chantilly_l4_by_chap_text', 'chantilly_l4_by_chap.json'),
}

# Régions à conserver
ALLOWED_REGIONS = ['MainZone', 'Rubric', 'Chapter']

# Paramètres CollateX
COLLATEX_CONFIG = {
    'near_match': False,
    'segmentation': True,
    'layout': 'vertical',
    'output': 'json'
}

# Flask config
FLASK_DEBUG = True
FLASK_PORT = int(os.environ.get('FLASK_PORT', 5001))
