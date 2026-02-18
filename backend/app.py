"""
Application Flask principale pour l'interface de collation automatique.
Routes et API pour gérer les collations de manuscrits.
"""

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import json
import os
from works import WorkManager
from collate import perform_collation
from decisions import DecisionManager, WordDecisionManager

app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')

# Configuration pour l'upload
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max
app.config['UPLOAD_FOLDER'] = '../data/uploads'
ALLOWED_EXTENSIONS = {'json'}

# Initialiser le gestionnaire d'œuvres
work_manager = WorkManager()

# Initialiser le gestionnaire de décisions
decision_manager = DecisionManager()
word_decision_manager = WordDecisionManager()

def allowed_file(filename):
    """Vérifie si le fichier est un JSON."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Page d'accueil avec l'interface de visualisation."""
    return render_template('index.html')


# ============ Routes pour les œuvres ============

@app.route('/api/works', methods=['GET'])
def list_works():
    """Liste toutes les œuvres."""
    works = work_manager.list_works()
    return jsonify({"status": "success", "works": works})


@app.route('/api/works', methods=['POST'])
def add_work():
    """
    Ajoute une nouvelle œuvre.
    Attend: {"name": "...", "author": "...", "date": "..."}
    """
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({"status": "error", "message": "Le nom est obligatoire"}), 400
    
    work = work_manager.add_work(
        name=name,
        author=data.get('author'),
        date=data.get('date')
    )
    
    return jsonify({"status": "success", "work": work})


@app.route('/api/works/<work_id>', methods=['PUT'])
def update_work(work_id):
    """
    Met à jour une œuvre existante.
    Attend: {"name": "...", "author": "...", "date": "..."}
    """
    data = request.json
    
    work = work_manager.update_work(
        work_id=work_id,
        name=data.get('name'),
        author=data.get('author'),
        date=data.get('date')
    )
    
    if work:
        return jsonify({"status": "success", "work": work})
    else:
        return jsonify({"status": "error", "message": "Œuvre non trouvée"}), 404


@app.route('/api/works/<work_id>', methods=['DELETE'])
def delete_work(work_id):
    """
    Supprime une œuvre et tous ses témoins associés.
    """
    success = work_manager.delete_work(work_id)
    
    if success:
        return jsonify({"status": "success", "message": "Œuvre supprimée avec succès"})
    else:
        return jsonify({"status": "error", "message": "Œuvre non trouvée"}), 404


@app.route('/api/works/<work_id>/witnesses', methods=['GET'])
def list_witnesses(work_id):
    """Liste les témoins d'une œuvre."""
    witnesses = work_manager.list_witnesses(work_id)
    return jsonify({"status": "success", "witnesses": witnesses})


@app.route('/api/works/<work_id>/witnesses', methods=['POST'])
def add_witness(work_id):
    """
    Ajoute un témoin à une œuvre.
    Upload d'un fichier JSON.
    """
    # Vérifier qu'un fichier a été envoyé
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Aucun fichier envoyé"}), 400
    
    file = request.files['file']
    witness_name = request.form.get('name')
    
    if not witness_name:
        return jsonify({"status": "error", "message": "Le nom du témoin est obligatoire"}), 400
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "Aucun fichier sélectionné"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Seuls les fichiers JSON sont acceptés"}), 400
    
    # Sauvegarder temporairement le fichier
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    filename = secure_filename(file.filename)
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(temp_path)
    
    # Ajouter le témoin
    witness = work_manager.add_witness(work_id, witness_name, temp_path)
    
    # Supprimer le fichier temporaire
    os.remove(temp_path)
    
    if witness:
        return jsonify({"status": "success", "witness": witness})
    else:
        return jsonify({"status": "error", "message": "Erreur lors de l'ajout du témoin"}), 500


@app.route('/api/works/<work_id>/witnesses/<witness_id>', methods=['PUT'])
def update_witness(work_id, witness_id):
    """
    Met à jour un témoin existant.
    Attend: {"name": "..."}
    """
    data = request.json
    new_name = data.get('name')
    
    if not new_name:
        return jsonify({"status": "error", "message": "Le nom est obligatoire"}), 400
    
    witness = work_manager.update_witness(work_id, witness_id, new_name)
    
    if witness:
        return jsonify({"status": "success", "witness": witness})
    else:
        return jsonify({"status": "error", "message": "Témoin non trouvé"}), 404


@app.route('/api/works/<work_id>/witnesses/<witness_id>', methods=['DELETE'])
def delete_witness(work_id, witness_id):
    """
    Supprime un témoin.
    """
    success = work_manager.delete_witness(work_id, witness_id)
    
    if success:
        return jsonify({"status": "success", "message": "Témoin supprimé avec succès"})
    else:
        return jsonify({"status": "error", "message": "Témoin non trouvé"}), 404


@app.route('/api/works/<work_id>/chapters', methods=['GET'])
def get_chapters(work_id):
    """
    Récupère le nombre de chapitres pour une œuvre.
    Basé sur le premier témoin disponible.
    """
    witnesses = work_manager.list_witnesses(work_id)
    if not witnesses:
        return jsonify({"status": "error", "message": "Aucun témoin disponible"}), 400
    
    # Utiliser le premier témoin pour déterminer le nombre de chapitres
    first_witness = witnesses[0]
    num_chapters = work_manager.get_witness_chapters(first_witness['file'])
    
    chapters = [{"index": i, "label": f"Chapitre {i+1}"} for i in range(num_chapters)]
    
    return jsonify({"status": "success", "chapters": chapters})


# ============ Routes pour la collation ============

@app.route('/api/collate', methods=['POST'])
def collate_texts():
    """
    API endpoint pour lancer une collation.
    Attend un JSON avec work_id, witness_ids (liste de 3), et chapter_index.
    """
    data = request.json
    
    work_id = data.get('work_id')
    witness_ids = data.get('witness_ids')
    chapter_index = data.get('chapter_index')
    
    if not all([work_id, witness_ids, chapter_index is not None]):
        return jsonify({"status": "error", "message": "Paramètres manquants"}), 400
    
    if len(witness_ids) != 3:
        return jsonify({"status": "error", "message": "Il faut exactement 3 témoins"}), 400
    
    # Récupérer les informations des témoins
    witnesses = work_manager.list_witnesses(work_id)
    
    witness_files = []
    witness_names = []
    
    for wit_id in witness_ids:
        wit = next((w for w in witnesses if w['id'] == wit_id), None)
        if not wit:
            return jsonify({"status": "error", "message": f"Témoin {wit_id} non trouvé"}), 404
        witness_files.append(wit['file'])
        witness_names.append(wit['name'])
    
    try:
        # Effectuer la collation
        results = perform_collation(witness_files, witness_names, chapter_index)
        
        if 'error' in results:
            return jsonify({"status": "error", "message": results['error']}), 500
        
        # Charger les décisions existantes pour ce chapitre
        decisions = decision_manager.load_decisions(work_id, chapter_index)
        
        # Enrichir les résultats avec les décisions
        for verse in results['verses']:
            verse_num = verse['verse_number']
            decision = decision_manager.get_decision_for_verse(work_id, chapter_index, verse_num)
            verse['user_decision'] = decision
        
        return jsonify({"status": "success", "data": results})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/decisions', methods=['POST'])
def save_decision():
    """
    Sauvegarde une décision de l'utilisateur pour un vers.
    Attend: {work_id, chapter_index, verse_number, qualification, notes}
    """
    data = request.json
    
    work_id = data.get('work_id')
    chapter_index = data.get('chapter_index')
    verse_number = data.get('verse_number')
    
    if not all([work_id, chapter_index is not None, verse_number]):
        return jsonify({"status": "error", "message": "Paramètres manquants"}), 400
    
    decision_data = {
        'qualification': data.get('qualification'),
        'notes': data.get('notes', ''),
        'equivalences': data.get('equivalences', []),
        'selected_reading': data.get('selected_reading')
    }
    
    try:
        decision_manager.save_decision(work_id, chapter_index, verse_number, decision_data)
        stats = decision_manager.get_statistics(work_id, chapter_index)
        return jsonify({"status": "success", "statistics": stats})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/decisions/<work_id>/<int:chapter_index>', methods=['GET'])
def get_decisions(work_id, chapter_index):
    """
    Récupère toutes les décisions pour une œuvre/chapitre.
    """
    try:
        decisions = decision_manager.load_decisions(work_id, chapter_index)
        stats = decision_manager.get_statistics(work_id, chapter_index)
        return jsonify({"status": "success", "decisions": decisions, "statistics": stats})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/decisions/<work_id>/<int:chapter_index>/<int:verse_number>', methods=['DELETE'])
def delete_decision(work_id, chapter_index, verse_number):
    """
    Supprime une décision pour un vers.
    """
    try:
        success = decision_manager.delete_decision(work_id, chapter_index, verse_number)
        if success:
            stats = decision_manager.get_statistics(work_id,chapter_index)
            return jsonify({"status": "success", "statistics": stats})
        else:
            return jsonify({"status": "error", "message": "Décision non trouvée"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/annotations', methods=['GET', 'POST'])
def handle_annotations():
    """
    API endpoint pour compatibilité (redirige vers decisions).
    """
    if request.method == 'POST':
        return save_decision()
    else:
        return jsonify({"annotations": []})


# ===== API Décisions de mots =====

@app.route('/api/word-decisions', methods=['POST'])
def save_word_decision():
    """
    Sauvegarde une décision de mot (conserver / ignorer).
    Attend: {work_id, chapter_index, verse_number, position, action, explication, words, pages}
    """
    data = request.json
    
    work_id = data.get('work_id')
    chapter_index = data.get('chapter_index')
    verse_number = data.get('verse_number')
    position = data.get('position')
    action = data.get('action', 'conserver')
    
    if not all([work_id, chapter_index is not None, verse_number is not None, position is not None]):
        return jsonify({"status": "error", "message": "Paramètres manquants"}), 400
    
    try:
        word_decision_manager.save_word_decision(
            work_id=work_id,
            chapter_index=chapter_index,
            verse_number=verse_number,
            position=position,
            action=action,
            explication=data.get('explication'),
            words=data.get('words'),
            pages=data.get('pages')
        )
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/word-decisions/<work_id>/<int:chapter_index>', methods=['GET'])
def get_word_decisions(work_id, chapter_index):
    """
    Récupère toutes les décisions de mots pour un chapitre.
    """
    try:
        decisions = word_decision_manager.load_word_decisions(work_id, chapter_index)
        return jsonify({"status": "success", "decisions": decisions})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/word-decisions/<work_id>/<int:chapter_index>/<int:verse_number>/<int:position>', methods=['DELETE'])
def delete_word_decision(work_id, chapter_index, verse_number, position):
    """
    Supprime une décision de mot.
    """
    try:
        success = word_decision_manager.delete_word_decision(
            work_id, chapter_index, verse_number, position
        )
        if success:
            return jsonify({"status": "success"})
        else:
            return jsonify({"status": "error", "message": "Décision non trouvée"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
