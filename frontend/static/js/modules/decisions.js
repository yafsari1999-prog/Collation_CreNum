/**
 * Module de gestion des décisions utilisateur
 */

import { appState, collationState } from './state.js';
import { displayCollationResults } from './collation.js';
import * as API from './api.js';

/**
 * Charge les décisions existantes pour le chapitre courant
 */
export async function loadDecisions() {
    if (!appState.selectedWork || !appState.selectedChapter) return;
    
    try {
        const response = await fetch(
            `/api/decisions/${appState.selectedWork}/${appState.selectedChapter}`
        );
        const data = await response.json();
        
        if (data.status === 'success' && data.decisions) {
            // Enrichir les vers avec les décisions
            collationState.results.verses.forEach(verse => {
                const decision = data.decisions[verse.verse_number];
                if (decision) {
                    verse.user_decision = decision;
                }
            });
            
            if (data.statistics) {
                collationState.totalDecisions = data.statistics.total_decisions;
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des décisions:', error);
    }
}

/**
 * Ouvre la modal de qualification d'une variante
 */
export function openQualifyModal(verse) {
    // Remplir les informations du vers
    const verseNumEl = document.getElementById('qualify-verse-number');
    const verseNumInput = document.getElementById('qualify-verse-number-input');
    
    if (verseNumEl) verseNumEl.textContent = verse.verse_number;
    if (verseNumInput) verseNumInput.value = verse.verse_number;
    
    // Remplir les témoins (structure individuelle par témoin)
    verse.witnesses.forEach((witness, index) => {
        const witnessNum = index + 1;
        const nameEl = document.getElementById(`qualify-witness-${witnessNum}-name`);
        const textEl = document.getElementById(`qualify-witness-${witnessNum}-text`);
        
        if (nameEl && collationState.results.witnesses[index]) {
            nameEl.textContent = collationState.results.witnesses[index];
        }
        
        if (textEl) {
            if (witness.missing) {
                textEl.innerHTML = '<em class="text-muted">— manquant —</em>';
            } else {
                textEl.textContent = witness.text || '';
            }
        }
    });
    
    // Pré-remplir les champs si décision existante
    const qualificationType = document.getElementById('qualification-type');
    const qualificationNotes = document.getElementById('qualification-notes');
    const selectedReading = document.getElementById('selected-reading');
    const equiv12 = document.getElementById('equiv-1-2');
    const equiv13 = document.getElementById('equiv-1-3');
    const equiv23 = document.getElementById('equiv-2-3');
    
    // Réinitialiser les champs
    if (qualificationType) qualificationType.value = '';
    if (qualificationNotes) qualificationNotes.value = '';
    if (selectedReading) selectedReading.value = '';
    if (equiv12) equiv12.checked = false;
    if (equiv13) equiv13.checked = false;
    if (equiv23) equiv23.checked = false;
    
    if (verse.user_decision) {
        if (qualificationType) qualificationType.value = verse.user_decision.qualification || '';
        if (qualificationNotes) qualificationNotes.value = verse.user_decision.notes || '';
        if (selectedReading && verse.user_decision.selected_reading !== undefined) {
            selectedReading.value = verse.user_decision.selected_reading;
        }
        
        // Équivalences (format: ["1-2", "1-3", "2-3"])
        if (verse.user_decision.equivalences) {
            if (equiv12) equiv12.checked = verse.user_decision.equivalences.includes('1-2');
            if (equiv13) equiv13.checked = verse.user_decision.equivalences.includes('1-3');
            if (equiv23) equiv23.checked = verse.user_decision.equivalences.includes('2-3');
        }
    }
    
    // Ouvrir la modal
    const modal = new bootstrap.Modal(document.getElementById('qualifyVariantModal'));
    modal.show();
}

/**
 * Sauvegarde une décision utilisateur
 */
export async function saveDecision() {
    const verseNumber = parseInt(document.getElementById('qualify-verse-number-input').value);
    const qualificationEl = document.getElementById('qualification-type');
    const notesEl = document.getElementById('qualification-notes');
    const selectedReadingEl = document.getElementById('selected-reading');
    const equiv12 = document.getElementById('equiv-1-2');
    const equiv13 = document.getElementById('equiv-1-3');
    const equiv23 = document.getElementById('equiv-2-3');
    
    const qualification = qualificationEl ? qualificationEl.value : '';
    const notes = notesEl ? notesEl.value : '';
    const selectedReading = selectedReadingEl ? selectedReadingEl.value : '';
    
    // Collecter les équivalences cochées
    const equivalences = [];
    if (equiv12 && equiv12.checked) equivalences.push('1-2');
    if (equiv13 && equiv13.checked) equivalences.push('1-3');
    if (equiv23 && equiv23.checked) equivalences.push('2-3');
    
    const decision = {
        qualification: qualification !== '' ? qualification : null,
        notes: notes !== '' ? notes : null,
        equivalences: equivalences.length > 0 ? equivalences : null,
        selected_reading: selectedReading !== '' ? selectedReading : null
    };
    
    // Sauvegarder dans l'état en attente
    collationState.pendingDecisions[verseNumber] = decision;
    
    try {
        const data = await API.saveDecision(
            appState.selectedWork,
            appState.selectedChapter,
            verseNumber,
            decision
        );
        
        if (data.status === 'success') {
            // Mettre à jour le vers dans les résultats
            const verse = collationState.results.verses.find(v => v.verse_number === verseNumber);
            if (verse) {
                verse.user_decision = decision;
            }
            
            // Mettre à jour les stats
            if (data.statistics) {
                collationState.totalDecisions = data.statistics.total_decisions;
            }
            
            // Fermer la modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('qualifyVariantModal'));
            modal.hide();
            
            // Rafraîchir l'affichage
            displayCollationResults();
        } else {
            alert('Erreur : ' + data.message);
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la décision:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Efface une décision
 */
export async function clearDecision() {
    const verseNumber = parseInt(document.getElementById('qualify-verse-number-input').value);
    
    if (!confirm('Êtes-vous sûr de vouloir effacer cette décision ?')) {
        return;
    }
    
    try {
        const data = await API.deleteDecision(
            appState.selectedWork,
            appState.selectedChapter,
            verseNumber
        );
        
        if (data.status === 'success') {
            // Supprimer de l'état
            delete collationState.pendingDecisions[verseNumber];
            
            // Mettre à jour le vers dans les résultats
            const verse = collationState.results.verses.find(v => v.verse_number === verseNumber);
            if (verse) {
                verse.user_decision = null;
            }
            
            // Mettre à jour les stats
            if (data.statistics) {
                collationState.totalDecisions = data.statistics.total_decisions;
            }
            
            // Fermer la modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('qualifyVariantModal'));
            modal.hide();
            
            // Rafraîchir l'affichage
            displayCollationResults();
            
            alert('Décision effacée');
        } else {
            alert('Erreur : ' + data.message);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la décision:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Sauvegarde toutes les décisions en attente
 */
export async function saveAllDecisions() {
    if (Object.keys(collationState.pendingDecisions).length === 0) {
        alert('Aucune modification à enregistrer');
        return;
    }
    
    const count = Object.keys(collationState.pendingDecisions).length;
    alert(count + ' décisions enregistrées avec succès');
    collationState.pendingDecisions = {};
}

/**
 * Ouvre le modal de classification d'un mot
 */
export function openWordClassifyModal(verse, posIndex) {
    const position = verse.word_alignment[posIndex];
    if (!position) {
        console.error('Position non trouvée:', posIndex);
        return;
    }
    
    // Récupérer le modal ou le créer
    let modal = document.getElementById('wordClassifyModal');
    if (!modal) {
        createWordClassifyModal();
        modal = document.getElementById('wordClassifyModal');
    }
    
    // Remplir les informations
    document.getElementById('word-verse-number').textContent = verse.verse_number;
    document.getElementById('word-position-index').textContent = posIndex;
    document.getElementById('word-position-input').value = posIndex;
    document.getElementById('word-verse-input').value = verse.verse_number;
    
    // Afficher les mots dans les 3 témoins
    const witnessNames = collationState.results.witnesses;
    
    for (let i = 0; i < 3; i++) {
        const nameEl = document.getElementById(`word-witness-${i+1}-name`);
        const textEl = document.getElementById(`word-witness-${i+1}-text`);
        
        if (nameEl) nameEl.textContent = witnessNames[i] || `Témoin ${i+1}`;
        
        if (textEl) {
            const wordData = position.words.find(w => w.witness_index === i);
            if (wordData) {
                if (wordData.missing) {
                    textEl.innerHTML = '<em class="text-muted">∅ (absent)</em>';
                } else {
                    textEl.innerHTML = `<strong>${wordData.text}</strong>`;
                    if (wordData.normalized && wordData.normalized !== wordData.text.toLowerCase()) {
                        textEl.innerHTML += `<br><small class="text-muted">normalisé: ${wordData.normalized}</small>`;
                    }
                }
            }
        }
    }
    
    // Vérifier si position a une décision existante
    const existingDecision = getWordDecision(verse.verse_number, posIndex);
    const classificationSelect = document.getElementById('word-classification');
    const notesTextarea = document.getElementById('word-notes');
    
    if (classificationSelect) {
        classificationSelect.value = existingDecision?.classification || '';
    }
    if (notesTextarea) {
        notesTextarea.value = existingDecision?.notes || '';
    }
    
    // Ouvrir le modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Crée dynamiquement le modal de classification de mot
 */
function createWordClassifyModal() {
    const modalHTML = `
    <div class="modal fade" id="wordClassifyModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        Classifier le mot (vers <span id="word-verse-number"></span>, position <span id="word-position-index"></span>)
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="word-verse-input">
                    <input type="hidden" id="word-position-input">
                    
                    <!-- Affichage des mots dans les 3 témoins -->
                    <div class="mb-4">
                        <h6>Mot dans chaque témoin :</h6>
                        <div class="row g-2">
                            <div class="col-4 text-center">
                                <small id="word-witness-1-name" class="text-muted">Témoin 1</small>
                                <div class="p-2 border rounded bg-light" id="word-witness-1-text"></div>
                            </div>
                            <div class="col-4 text-center">
                                <small id="word-witness-2-name" class="text-muted">Témoin 2</small>
                                <div class="p-2 border rounded bg-light" id="word-witness-2-text"></div>
                            </div>
                            <div class="col-4 text-center">
                                <small id="word-witness-3-name" class="text-muted">Témoin 3</small>
                                <div class="p-2 border rounded bg-light" id="word-witness-3-text"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Classification -->
                    <div class="mb-3">
                        <label class="form-label"><strong>Type de variante :</strong></label>
                        <select class="form-select" id="word-classification">
                            <option value="">-- Non classifié --</option>
                            <option value="identical">✓ Identique (pas de variante)</option>
                            <option value="orthographic">Orthographique (ss/s, y/i, etc.)</option>
                            <option value="graphic">Graphique (u/v, i/j)</option>
                            <option value="equivalent">Équivalent (sens identique)</option>
                            <option value="lexical">Lexical (mot différent)</option>
                            <option value="omission">Omission (mot absent)</option>
                            <option value="addition">Addition (mot ajouté)</option>
                            <option value="substitution">Substitution</option>
                            <option value="significant">Variante significative</option>
                        </select>
                    </div>
                    
                    <!-- Notes -->
                    <div class="mb-3">
                        <label for="word-notes" class="form-label"><strong>Notes :</strong></label>
                        <textarea class="form-control" id="word-notes" rows="2" placeholder="Commentaire sur ce mot..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-outline-danger" onclick="clearWordDecision()">Effacer</button>
                    <button type="button" class="btn btn-primary" onclick="saveWordDecision()">Enregistrer</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Récupère une décision de mot existante
 */
function getWordDecision(verseNumber, posIndex) {
    const key = `${verseNumber}-${posIndex}`;
    return collationState.wordDecisions?.[key] || null;
}

/**
 * Sauvegarde une décision de mot
 */
export async function saveWordDecision() {
    const verseNumber = parseInt(document.getElementById('word-verse-input').value);
    const posIndex = parseInt(document.getElementById('word-position-input').value);
    const classification = document.getElementById('word-classification').value;
    const notes = document.getElementById('word-notes').value;
    
    // Initialiser wordDecisions si nécessaire
    if (!collationState.wordDecisions) {
        collationState.wordDecisions = {};
    }
    
    const key = `${verseNumber}-${posIndex}`;
    
    if (classification) {
        collationState.wordDecisions[key] = {
            verse_number: verseNumber,
            position: posIndex,
            classification: classification,
            notes: notes || null
        };
    } else {
        delete collationState.wordDecisions[key];
    }
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('wordClassifyModal'));
    modal.hide();
    
    // Rafraîchir l'affichage pour montrer la classification
    displayCollationResults();
    
    console.log('Décision mot enregistrée:', collationState.wordDecisions[key]);
}

/**
 * Efface une décision de mot
 */
export function clearWordDecision() {
    const verseNumber = parseInt(document.getElementById('word-verse-input').value);
    const posIndex = parseInt(document.getElementById('word-position-input').value);
    const key = `${verseNumber}-${posIndex}`;
    
    if (collationState.wordDecisions) {
        delete collationState.wordDecisions[key];
    }
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('wordClassifyModal'));
    modal.hide();
    
    displayCollationResults();
}

// Exposer les fonctions globalement pour les boutons onclick
window.saveWordDecision = saveWordDecision;
window.clearWordDecision = clearWordDecision;
