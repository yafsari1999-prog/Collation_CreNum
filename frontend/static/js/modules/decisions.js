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
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('qualifyVariantModal'));
    modal.show();
}

/**
 * Sauvegarde une décision utilisateur
 */
export async function saveDecision() {
    console.log('saveDecision appelé');
    
    const verseNumberInput = document.getElementById('qualify-verse-number-input');
    console.log('verseNumberInput:', verseNumberInput, 'value:', verseNumberInput?.value);
    
    const verseNumber = parseInt(verseNumberInput?.value);
    console.log('verseNumber parsé:', verseNumber);
    
    if (isNaN(verseNumber)) {
        alert('Erreur: Numéro de vers invalide');
        return;
    }
    
    const qualificationEl = document.getElementById('qualification-type');
    const notesEl = document.getElementById('qualification-notes');
    const selectedReadingEl = document.getElementById('selected-reading');
    const equiv12 = document.getElementById('equiv-1-2');
    const equiv13 = document.getElementById('equiv-1-3');
    const equiv23 = document.getElementById('equiv-2-3');
    
    const qualification = qualificationEl ? qualificationEl.value : '';
    const notes = notesEl ? notesEl.value : '';
    const selectedReading = selectedReadingEl ? selectedReadingEl.value : '';
    
    console.log('qualification:', qualification, 'notes:', notes);
    console.log('appState.selectedWork:', appState.selectedWork);
    console.log('appState.selectedChapter:', appState.selectedChapter);
    
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
        console.log('Appel API.saveDecision avec:', {
            workId: appState.selectedWork,
            chapterIndex: appState.selectedChapter,
            verseNumber: verseNumber,
            decision: decision
        });
        
        const data = await API.saveDecision(
            appState.selectedWork,
            appState.selectedChapter,
            verseNumber,
            decision
        );
        
        console.log('Réponse API:', data);
        
        if (data.status === 'success') {
            console.log('Décision sauvegardée avec succès');
            
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
            document.activeElement?.blur();
            const modal = bootstrap.Modal.getInstance(document.getElementById('qualifyVariantModal'));
            if (modal) {
                modal.hide();
            }
            
            // Rafraîchir l'affichage
            displayCollationResults();
            
            // Confirmation visuelle (optionnel)
            console.log('Décision enregistrée pour vers', verseNumber);
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
            document.activeElement?.blur();
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
    
    // Récupérer les métadonnées de page pour chaque témoin
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
                    textEl.innerHTML = `<strong class="fs-5">${wordData.text}</strong>`;
                }
            }
        }
    }
    
    // Stocker les infos page pour la sauvegarde
    const pageInputs = document.querySelectorAll('.word-page-input');
    pageInputs.forEach(el => el.remove());
    
    for (let i = 0; i < 3; i++) {
        const witnessData = verse.witnesses[i];
        const pageInput = document.createElement('input');
        pageInput.type = 'hidden';
        pageInput.className = 'word-page-input';
        pageInput.dataset.witnessIndex = i;
        pageInput.value = witnessData?.metadata?.page || '';
        modal.querySelector('.modal-body').appendChild(pageInput);
    }
    
    // Vérifier si une décision existante
    const existingDecision = getWordDecision(verse.verse_number, posIndex);
    const explicationTextarea = document.getElementById('word-explication');
    
    if (existingDecision) {
        setWordActionSwitch(existingDecision.action === 'ignorer' ? 'ignorer' : 'conserver');
        explicationTextarea.value = existingDecision.explication || '';
    } else {
        setWordActionSwitch('conserver');
        explicationTextarea.value = '';
    }
    
    // Ouvrir le modal
    const bsModal = bootstrap.Modal.getOrCreateInstance(modal);
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
                <div class="modal-header bg-warning bg-opacity-25">
                    <h5 class="modal-title">
                        Classifier le mot — Vers <span id="word-verse-number"></span>, position <span id="word-position-index"></span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="word-verse-input">
                    <input type="hidden" id="word-position-input">
                    
                    <!-- Affichage des mots dans les 3 témoins -->
                    <div class="mb-4">
                        <div class="row g-2">
                            <div class="col-4 text-center">
                                <small id="word-witness-1-name" class="text-muted d-block mb-1">Témoin 1</small>
                                <div class="p-3 border rounded bg-light" id="word-witness-1-text"></div>
                            </div>
                            <div class="col-4 text-center">
                                <small id="word-witness-2-name" class="text-muted d-block mb-1">Témoin 2</small>
                                <div class="p-3 border rounded bg-light" id="word-witness-2-text"></div>
                            </div>
                            <div class="col-4 text-center">
                                <small id="word-witness-3-name" class="text-muted d-block mb-1">Témoin 3</small>
                                <div class="p-3 border rounded bg-light" id="word-witness-3-text"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action : ignorer ou conserver (switch) -->
                    <div class="mb-3">
                        <input type="hidden" id="word-action-value" value="conserver">
                        <div class="word-action-switch" id="word-action-switch">
                            <div class="word-action-slider" id="word-action-slider"></div>
                            <div class="word-action-option word-action-conserver active" id="word-action-conserver-label" onclick="toggleWordAction('conserver')">
                                Conserver
                            </div>
                            <div class="word-action-option word-action-ignorer" id="word-action-ignorer-label" onclick="toggleWordAction('ignorer')">
                                Ignorer
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div class="mb-3">
                        <label for="word-explication" class="form-label"><strong>Description :</strong></label>
                        <textarea class="form-control" id="word-explication" rows="3" placeholder="Décrire la variante..."></textarea>
                    </div>
                </div>
                <div class="modal-footer flex-column p-2 gap-2">
                    <!-- Bouton Ignorer partout (pleine largeur) -->
                    <button type="button" id="ignore-everywhere-btn" class="btn btn-danger w-100 py-2" onclick="openIgnoreEverywhereModal()" style="display: none;">
                        <i class="bi bi-lightning-fill"></i> Ignorer partout
                    </button>
                    <!-- Boutons Annuler et Enregistrer (50/50) -->
                    <div class="d-flex w-100 gap-2">
                        <button type="button" class="btn btn-secondary w-50 py-2" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary w-50 py-2" onclick="saveWordDecision()">Enregistrer</button>
                    </div>
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
 * Sauvegarde une décision de mot (en mémoire seulement, persistée via Enregistrer)
 */
export async function saveWordDecision() {
    const verseNumber = parseInt(document.getElementById('word-verse-input').value);
    const posIndex = parseInt(document.getElementById('word-position-input').value);
    const action = document.getElementById('word-action-value')?.value || 'conserver';
    const explication = document.getElementById('word-explication').value;
    
    // Récupérer les mots des 3 témoins
    const verse = collationState.results.verses.find(v => v.verse_number === verseNumber);
    if (!verse) return;
    
    const position = verse.word_alignment[posIndex];
    const words = {};
    const pages = {};
    const witnessNames = collationState.results.witnesses;
    
    for (let i = 0; i < 3; i++) {
        const wordData = position.words.find(w => w.witness_index === i);
        words[witnessNames[i]] = wordData?.missing ? '∅' : (wordData?.text || '');
        
        // Récupérer la page
        const pageInput = document.querySelector(`.word-page-input[data-witness-index="${i}"]`);
        pages[witnessNames[i]] = pageInput?.value || '';
    }
    
    const decision = {
        verse_number: verseNumber,
        position: posIndex,
        action: action,
        explication: explication || null,
        words: words,
        pages: pages
    };
    
    // Sauvegarder en mémoire seulement
    if (!collationState.wordDecisions) {
        collationState.wordDecisions = {};
    }
    const key = `${verseNumber}-${posIndex}`;
    collationState.wordDecisions[key] = decision;
    
    console.log('Décision mot (mémoire):', decision);
    
    // Fermer le modal
    document.activeElement?.blur();
    const modal = bootstrap.Modal.getInstance(document.getElementById('wordClassifyModal'));
    if (modal) modal.hide();
    
    // Rafraîchir l'affichage
    displayCollationResults();
}

/**
 * Efface une décision de mot (mémoire seulement)
 */
export async function clearWordDecision() {
    const verseNumber = parseInt(document.getElementById('word-verse-input').value);
    const posIndex = parseInt(document.getElementById('word-position-input').value);
    const key = `${verseNumber}-${posIndex}`;
    
    if (collationState.wordDecisions) {
        delete collationState.wordDecisions[key];
    }
    
    // Fermer le modal
    document.activeElement?.blur();
    const modal = bootstrap.Modal.getInstance(document.getElementById('wordClassifyModal'));
    if (modal) modal.hide();
    
    displayCollationResults();
}

/**
 * Charge les décisions de mots depuis le serveur
 */
export async function loadWordDecisions() {
    if (!appState.selectedWork || appState.selectedChapter === null) return;
    
    // Vérifier que les 3 témoins sont sélectionnés
    if (!appState.selectedWitnesses.every(w => w !== null)) {
        console.warn('Les 3 témoins doivent être sélectionnés pour charger les décisions');
        return;
    }
    
    try {
        const wit1 = encodeURIComponent(appState.selectedWitnesses[0]);
        const wit2 = encodeURIComponent(appState.selectedWitnesses[1]);
        const wit3 = encodeURIComponent(appState.selectedWitnesses[2]);
        
        const response = await fetch(
            `/api/word-decisions/${appState.selectedWork}/${appState.selectedChapter}?wit1=${wit1}&wit2=${wit2}&wit3=${wit3}`
        );
        const data = await response.json();
        
        if (data.status === 'success' && data.decisions) {
            collationState.wordDecisions = {};
            for (const dec of data.decisions) {
                const key = `${dec.verse_number}-${dec.position}`;
                collationState.wordDecisions[key] = dec;
            }
            // Garder une copie pour pouvoir annuler
            collationState.savedWordDecisions = JSON.parse(JSON.stringify(collationState.wordDecisions));
        }
    } catch (error) {
        console.error('Erreur chargement décisions mots:', error);
    }
}

/**
 * Affiche la liste des variantes conservées
 */
export function showConservedVariants() {
    const decisions = collationState.wordDecisions || {};
    const conserved = Object.values(decisions).filter(d => d.action === 'conserver');
    
    // Trier par vers puis par position
    conserved.sort((a, b) => {
        if (a.verse_number !== b.verse_number) return a.verse_number - b.verse_number;
        return a.position - b.position;
    });
    
    // Créer ou récupérer le modal de liste
    let listModal = document.getElementById('conservedVariantsModal');
    if (!listModal) {
        createConservedVariantsModal();
        listModal = document.getElementById('conservedVariantsModal');
    }
    
    const tbody = document.getElementById('conserved-variants-tbody');
    const countBadge = document.getElementById('conserved-variants-count');
    const witnessNames = getSelectedWitnessNames();
    
    // Mettre à jour les en-têtes avec les noms de témoins
    for (let i = 0; i < 3; i++) {
        const th = document.getElementById(`conserved-th-witness-${i}`);
        if (th) th.textContent = witnessNames[i];
    }
    
    if (countBadge) countBadge.textContent = conserved.length;
    
    if (tbody) {
        if (conserved.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Aucune variante conservée</td></tr>';
        } else {
            tbody.innerHTML = conserved.map(dec => {
                const page = dec.pages ? Object.values(dec.pages).filter(p => p).join(', ') : '-';
                const chapterIdx = appState.selectedChapter ?? '';
                const words = witnessNames.map(name => dec.words?.[name] || '').map(
                    w => `<td>${w || '-'}</td>`
                ).join('');
                
                return `<tr>
                    <td>${chapterIdx}</td>
                    <td>${page}</td>
                    <td>${dec.verse_number}</td>
                    ${words}
                    <td><small>${dec.explication || '-'}</small></td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteConservedVariant(${dec.verse_number}, ${dec.position})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
            }).join('');
        }
    }
    
    const bsModal = bootstrap.Modal.getOrCreateInstance(listModal);
    bsModal.show();
}

/**
 * Crée le modal de liste des variantes conservées
 */
function createConservedVariantsModal() {
    const modalHTML = `
    <div class="modal fade" id="conservedVariantsModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-success bg-opacity-10">
                    <h5 class="modal-title">
                        <i class="bi bi-bookmark-check"></i> Variantes conservées
                        <span class="badge bg-success ms-2" id="conserved-variants-count">0</span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <table class="table table-sm table-striped">
                        <thead class="table-light">
                            <tr>
                                <th>Chapitre</th>
                                <th>Page</th>
                                <th>Vers</th>
                                <th id="conserved-th-witness-0">Témoin 1</th>
                                <th id="conserved-th-witness-1">Témoin 2</th>
                                <th id="conserved-th-witness-2">Témoin 3</th>
                                <th>Description</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="conserved-variants-tbody"></tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Supprime une décision depuis la liste (mémoire seulement)
 */
function deleteConservedVariant(verseNumber, posIndex) {
    const key = `${verseNumber}-${posIndex}`;
    if (collationState.wordDecisions) {
        delete collationState.wordDecisions[key];
    }
    
    // Rafraîchir la liste
    showConservedVariants();
    displayCollationResults();
}

/**
 * Supprime une décision depuis le dialogue des décisions en cours
 */
function deleteCurrentDecision(verseNumber, posIndex) {
    const key = `${verseNumber}-${posIndex}`;
    if (collationState.wordDecisions) {
        delete collationState.wordDecisions[key];
    }
    
    // Rafraîchir la liste des décisions en cours
    showCurrentDecisions();
    displayCollationResults();
}
window.deleteCurrentDecision = deleteCurrentDecision;

/**
 * Affiche le dialogue des nouvelles décisions de la séance (pas encore enregistrées)
 */
export function showCurrentDecisions() {
    const current = collationState.wordDecisions || {};
    const saved = collationState.savedWordDecisions || {};
    
    // Collecter les décisions nouvelles/modifiées
    const pending = [];
    for (const [key, dec] of Object.entries(current)) {
        if (!saved[key] || JSON.stringify(saved[key]) !== JSON.stringify(dec)) {
            pending.push({ ...dec, _changeType: saved[key] ? 'modifié' : 'nouveau' });
        }
    }
    // Collecter les suppressions
    for (const [key, dec] of Object.entries(saved)) {
        if (!current[key]) {
            pending.push({ ...dec, _changeType: 'supprimé' });
        }
    }
    
    // Trier par vers puis par position
    pending.sort((a, b) => {
        if (a.verse_number !== b.verse_number) return a.verse_number - b.verse_number;
        return a.position - b.position;
    });
    
    // Créer ou récupérer le modal
    let listModal = document.getElementById('currentDecisionsModal');
    if (!listModal) {
        createCurrentDecisionsModal();
        listModal = document.getElementById('currentDecisionsModal');
    }
    
    const tbody = document.getElementById('current-decisions-tbody');
    const countBadge = document.getElementById('current-decisions-count');
    const witnessNames = getSelectedWitnessNames();
    
    // Mettre à jour les en-têtes avec les noms de témoins
    for (let i = 0; i < 3; i++) {
        const th = document.getElementById(`current-dec-th-witness-${i}`);
        if (th) th.textContent = witnessNames[i];
    }
    
    if (countBadge) countBadge.textContent = pending.length;
    
    if (tbody) {
        if (pending.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Aucune nouvelle décision</td></tr>';
        } else {
            tbody.innerHTML = pending.map(dec => {
                const page = dec.pages ? Object.values(dec.pages).filter(p => p).join(', ') : '-';
                const chapterIdx = appState.selectedChapter ?? '';
                const words = witnessNames.map(name => dec.words?.[name] || '').map(
                    w => `<td>${w || '-'}</td>`
                ).join('');
                
                const actionBadge = dec.action === 'conserver'
                    ? '<span class="badge bg-success">conserver</span>'
                    : '<span class="badge bg-secondary">ignorer</span>';
                
                const deleteBtn = dec._changeType !== 'supprimé'
                    ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteCurrentDecision(${dec.verse_number}, ${dec.position})"><i class="bi bi-trash"></i></button>`
                    : '';
                
                return `<tr${dec._changeType === 'supprimé' ? ' class="table-danger"' : ''}>
                    <td>${chapterIdx}</td>
                    <td>${page}</td>
                    <td>${dec.verse_number}</td>
                    ${words}
                    <td>${actionBadge}</td>
                    <td><small>${dec.explication || '-'}</small></td>
                    <td>${deleteBtn}</td>
                </tr>`;
            }).join('');
        }
    }
    
    const bsModal = bootstrap.Modal.getOrCreateInstance(listModal);
    bsModal.show();
}

/**
 * Crée le modal de liste des décisions en cours
 */
function createCurrentDecisionsModal() {
    const modalHTML = `
    <div class="modal fade" id="currentDecisionsModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-info bg-opacity-10">
                    <h5 class="modal-title">
                        <i class="bi bi-pencil-square"></i> Décisions en cours
                        <span class="badge bg-info ms-2" id="current-decisions-count">0</span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <table class="table table-sm table-striped">
                        <thead class="table-light">
                            <tr>
                                <th>Chapitre</th>
                                <th>Page</th>
                                <th>Vers</th>
                                <th id="current-dec-th-witness-0">Témoin 1</th>
                                <th id="current-dec-th-witness-1">Témoin 2</th>
                                <th id="current-dec-th-witness-2">Témoin 3</th>
                                <th>Action</th>
                                <th>Description</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="current-decisions-tbody"></tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Bascule le switch ignorer/conserver
 */
function toggleWordAction(action) {
    setWordActionSwitch(action);
}

/**
 * Positionne le switch sur la valeur donnée
 */
function setWordActionSwitch(action) {
    const hiddenInput = document.getElementById('word-action-value');
    const slider = document.getElementById('word-action-slider');
    const ignorerLabel = document.getElementById('word-action-ignorer-label');
    const conserverLabel = document.getElementById('word-action-conserver-label');
    const ignoreEverywhereBtn = document.getElementById('ignore-everywhere-btn');
    
    if (!hiddenInput || !slider) return;
    
    hiddenInput.value = action;
    
    if (action === 'conserver') {
        slider.classList.add('left');
        slider.classList.remove('right');
        conserverLabel.classList.add('active');
        ignorerLabel.classList.remove('active');
        // Cacher le bouton "Ignorer partout"
        if (ignoreEverywhereBtn) ignoreEverywhereBtn.style.display = 'none';
    } else {
        slider.classList.remove('left');
        slider.classList.add('right');
        ignorerLabel.classList.add('active');
        conserverLabel.classList.remove('active');
        // Afficher le bouton "Ignorer partout"
        if (ignoreEverywhereBtn) ignoreEverywhereBtn.style.display = 'inline-block';
    }
}

// Exposer les fonctions globalement pour les boutons onclick
window.saveWordDecision = saveWordDecision;
window.clearWordDecision = clearWordDecision;
window.deleteConservedVariant = deleteConservedVariant;
window.showConservedVariants = showConservedVariants;
window.showCurrentDecisions = showCurrentDecisions;
window.toggleWordAction = toggleWordAction;
window.openExportModal = openExportModal;
window.executeExport = executeExport;
window.saveAllDecisions = saveAllDecisions;
window.cancelAllDecisions = cancelAllDecisions;

/**
 * Enregistre toutes les décisions de mots sur le serveur
 */
export async function saveAllDecisions() {
    if (!appState.selectedWork || appState.selectedChapter === null) return;
    
    const decisions = collationState.wordDecisions || {};
    const entries = Object.values(decisions);
    
    if (entries.length === 0) {
        alert('Aucune décision à enregistrer.');
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // D'abord supprimer les anciennes décisions serveur qui ne sont plus en mémoire
    const savedKeys = Object.keys(collationState.savedWordDecisions || {});
    const currentKeys = Object.keys(decisions);
    const deletedKeys = savedKeys.filter(k => !currentKeys.includes(k));
    
    const wit1 = encodeURIComponent(appState.selectedWitnesses[0]);
    const wit2 = encodeURIComponent(appState.selectedWitnesses[1]);
    const wit3 = encodeURIComponent(appState.selectedWitnesses[2]);
    
    for (const key of deletedKeys) {
        const old = collationState.savedWordDecisions[key];
        try {
            await fetch(`/api/word-decisions/${appState.selectedWork}/${appState.selectedChapter}/${old.verse_number}/${old.position}?wit1=${wit1}&wit2=${wit2}&wit3=${wit3}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error('Erreur suppression:', e);
        }
    }
    
    // Sauvegarder chaque décision
    for (const dec of entries) {
        try {
            const response = await fetch('/api/word-decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    work_id: appState.selectedWork,
                    witnesses: appState.selectedWitnesses,
                    excluded_chapters: appState.excludedChapters || {},
                    chapter_index: appState.selectedChapter,
                    verse_number: dec.verse_number,
                    position: dec.position,
                    action: dec.action,
                    explication: dec.explication || null,
                    words: dec.words,
                    pages: dec.pages
                })
            });
            const data = await response.json();
            if (data.status === 'success') successCount++;
            else errorCount++;
        } catch (e) {
            errorCount++;
            console.error('Erreur sauvegarde:', e);
        }
    }
    
    // Mettre à jour le snapshot sauvegardé
    collationState.savedWordDecisions = JSON.parse(JSON.stringify(decisions));
    
    // Mettre à jour le bouton export
    try {
        const { updateExportButton } = await import('./chapter-validation.js');
        await updateExportButton();
    } catch (e) {
        console.warn('Impossible de mettre à jour le bouton export:', e);
    }
    
    if (errorCount === 0) {
        alert(`${successCount} décision(s) enregistrée(s) avec succès.`);
    } else {
        alert(`${successCount} enregistrée(s), ${errorCount} erreur(s).`);
    }
}

/**
 * Annule toutes les décisions non enregistrées (revient au dernier état sauvegardé)
 */
export function cancelAllDecisions() {
    if (!confirm('Annuler toutes les modifications non enregistrées ?')) return;
    
    // Restaurer depuis le snapshot
    collationState.wordDecisions = JSON.parse(
        JSON.stringify(collationState.savedWordDecisions || {})
    );
    
    displayCollationResults();
}

/**
 * Ouvre le modal d'export
 */
export function openExportModal() {
    let modal = document.getElementById('exportModal');
    if (!modal) {
        createExportModal();
        modal = document.getElementById('exportModal');
    }
    
    // Nom de fichier par défaut
    const workName = appState.selectedWork || 'export';
    const defaultName = `${workName}`;
    const filenameInput = document.getElementById('export-filename');
    if (filenameInput) {
        filenameInput.value = defaultName;
        // Au clic, effacer la suggestion pour repartir de zéro
        filenameInput.onclick = function() {
            if (this.value === defaultName) {
                this.value = '';
            }
            this.onclick = null; // une seule fois
        };
    }
    
    // Sélection par défaut : CSV
    const formatSelect = document.getElementById('export-format');
    if (formatSelect) formatSelect.value = 'csv';
    
    const bsModal = bootstrap.Modal.getOrCreateInstance(modal);
    bsModal.show();
}

/**
 * Crée le modal d'export
 */
function createExportModal() {
    const modalHTML = `
    <div class="modal fade" id="exportModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="bi bi-download"></i> Exporter les variantes conservées</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="export-filename" class="form-label"><strong>Nom du fichier :</strong></label>
                        <input type="text" class="form-control" id="export-filename" placeholder="Nom du fichier">
                    </div>
                    <div class="mb-3">
                        <label for="export-format" class="form-label"><strong>Format :</strong></label>
                        <select class="form-select" id="export-format">
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-success" onclick="executeExport()">
                        <i class="bi bi-download"></i> Télécharger
                    </button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Récupère les noms des témoins sélectionnés
 */
function getSelectedWitnessNames() {
    // Si on a les résultats de collation, utiliser les noms de là
    if (collationState.results?.witnesses) {
        return collationState.results.witnesses;
    }
    
    // Sinon, récupérer les noms depuis appState.witnesses
    const names = [];
    for (const witnessId of appState.selectedWitnesses) {
        if (witnessId !== null) {
            const witness = appState.witnesses.find(w => w.id === witnessId);
            names.push(witness ? witness.name : witnessId);
        }
    }
    
    // Si on n'a pas trouvé les noms, utiliser les IDs comme fallback
    if (names.length === 0) {
        return appState.selectedWitnesses.filter(w => w !== null);
    }
    
    return names;
}

/**
 * Prépare les données d'export (variantes conservées) pour TOUS les chapitres validés.
 * Utilise les numéros de chapitres artificiels (normalisés).
 */
async function getExportDataAllChapters() {
    const workId = appState.selectedWork;
    const validChapters = appState.validChapters || [];
    const witnesses = appState.selectedWitnesses;
    // Récupérer les vrais noms des témoins
    const witnessNames = getSelectedWitnessNames();
    
    if (!workId || validChapters.length === 0) {
        // Fallback: utiliser les données du chapitre courant
        return getExportDataCurrentChapter();
    }
    
    if (!witnesses || witnesses.length !== 3 || witnesses.some(w => w === null)) {
        console.error('Témoins manquants pour l\'export');
        return getExportDataCurrentChapter();
    }
    
    try {
        const response = await fetch('/api/export-all-decisions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                work_id: workId,
                valid_chapters: validChapters,
                witness_names: witnessNames,
                witnesses: witnesses
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            const apiWitnessNames = result.witness_names || witnessNames;
            
            // Transformer les données de l'API en format d'export
            return result.decisions.map(dec => {
                const row = {
                    'Chapitre': dec.chapitre,
                    'Page': dec.page || '',
                    'Vers': dec.vers
                };
                // Ajouter les colonnes des témoins avec leurs vrais noms
                apiWitnessNames.forEach(name => {
                    row[name] = dec.words?.[name] || '';
                });
                row['Description'] = dec.explication || '';
                return row;
            });
        } else {
            console.error('Erreur API export:', result.message);
            return getExportDataCurrentChapter();
        }
    } catch (error) {
        console.error('Erreur lors de l\'export multi-chapitres:', error);
        return getExportDataCurrentChapter();
    }
}

/**
 * Prépare les données d'export pour le chapitre courant uniquement (fallback)
 */
function getExportDataCurrentChapter() {
    const decisions = collationState.wordDecisions || {};
    const conserved = Object.values(decisions).filter(d => d.action === 'conserver');
    // Récupérer les vrais noms des témoins
    const witnessNames = getSelectedWitnessNames();
    
    conserved.sort((a, b) => {
        if (a.verse_number !== b.verse_number) return a.verse_number - b.verse_number;
        return a.position - b.position;
    });
    
    // Utiliser le numéro de chapitre normalisé (commence à 1)
    const currentChapterIndex = appState.selectedChapter ?? 0;
    const normalizedChapter = currentChapterIndex + 1;
    
    return conserved.map(dec => {
        const page = dec.pages ? Object.values(dec.pages).filter(p => p).join(', ') : '';
        const row = {
            'Chapitre': normalizedChapter,
            'Page': page || '',
            'Vers': dec.verse_number
        };
        witnessNames.forEach(name => {
            row[name] = dec.words?.[name] || '';
        });
        row['Description'] = dec.explication || '';
        return row;
    });
}

/**
 * Exécute l'export dans le format choisi (tous les chapitres validés)
 */
export async function executeExport() {
    const filename = document.getElementById('export-filename')?.value?.trim() || 'export';
    const format = document.getElementById('export-format')?.value || 'json';
    
    // Afficher un indicateur de chargement
    const exportBtn = document.querySelector('#exportModal .btn-success');
    const originalText = exportBtn?.innerHTML;
    if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Chargement...';
    }
    
    try {
        // Récupérer les données de TOUS les chapitres validés
        const data = await getExportDataAllChapters();
        
        if (data.length === 0) {
            alert('Aucune variante conservée à exporter.');
            return;
        }
        
        let blob, ext;
        
        if (format === 'json') {
            const json = JSON.stringify(data, null, 2);
            blob = new Blob([json], { type: 'application/json' });
            ext = 'json';
        } else if (format === 'csv') {
            const csv = convertToCSV(data);
            // BOM pour Excel
            blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
            ext = 'csv';
        } else if (format === 'excel') {
            const csv = convertToCSV(data, '\t');
            blob = new Blob(['\uFEFF' + csv], { type: 'application/vnd.ms-excel;charset=utf-8' });
            ext = 'xls';
        }
        
        // Télécharger
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Fermer le modal
        document.activeElement?.blur();
        const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
        if (modal) modal.hide();
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export: ' + error.message);
    } finally {
        // Restaurer le bouton
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalText;
        }
    }
}

/**
 * Convertit un tableau d'objets en CSV
 */
function convertToCSV(data, separator = ',') {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const escape = (val) => {
        const str = String(val ?? '');
        if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    const headerRow = headers.map(escape).join(separator);
    const rows = data.map(row => headers.map(h => escape(row[h])).join(separator));
    return [headerRow, ...rows].join('\n');
}

/**
 * Trouve toutes les positions dans le chapitre où au moins 2 témoins partagent les mêmes variantes
 * @param {number} currentVerseNumber - Numéro du vers actuel
 * @param {number} currentPosIndex - Position actuelle
 * @returns {Array} - Liste des positions similaires avec {verseNumber, position, words, alreadyIgnored}
 */
function findSimilarVariantsInChapter(currentVerseNumber, currentPosIndex) {
    const results = [];
    const verses = collationState.results?.verses || [];
    const witnessNames = getSelectedWitnessNames();
    
    // Trouver le vers actuel
    const currentVerse = verses.find(v => v.verse_number === currentVerseNumber);
    if (!currentVerse || !currentVerse.word_alignment) return results;
    
    const currentPosition = currentVerse.word_alignment[currentPosIndex];
    if (!currentPosition) return results;
    
    // Extraire les mots du témoin actuel (normalisés)
    const currentWords = [];
    
    for (let i = 0; i < 3; i++) {
        const wordData = currentPosition.words.find(w => w.witness_index === i);
        const text = wordData?.missing ? '∅' : (wordData?.text || '').toLowerCase().trim();
        currentWords.push(text);
    }
    
    // Parcourir tous les vers du chapitre
    for (const verse of verses) {
        if (!verse.word_alignment) continue;
        
        // Parcourir toutes les positions dans ce vers
        verse.word_alignment.forEach((position, posIndex) => {
            // Extraire les mots de cette position
            const posWords = [];
            for (let i = 0; i < 3; i++) {
                const wordData = position.words.find(w => w.witness_index === i);
                const text = wordData?.missing ? '∅' : (wordData?.text || '').toLowerCase().trim();
                posWords.push(text);
            }
            
            // Compter combien de mots sont en commun (minimum 2 sur 3)
            const commonWords = currentWords.filter(word => posWords.includes(word));
            
            if (commonWords.length >= 2) {
                // Vérifier si déjà une décision "ignorer"
                const key = `${verse.verse_number}-${posIndex}`;
                const existingDecision = collationState.wordDecisions?.[key];
                const alreadyIgnored = existingDecision?.action === 'ignorer';
                
                // Construire l'objet words avec les noms de témoins
                const words = {};
                for (let i = 0; i < 3; i++) {
                    const wordData = position.words.find(w => w.witness_index === i);
                    words[witnessNames[i] || `Témoin ${i+1}`] = wordData?.missing ? '∅' : (wordData?.text || '');
                }
                
                results.push({
                    verseNumber: verse.verse_number,
                    position: posIndex,
                    words: words,
                    alreadyIgnored: alreadyIgnored,
                    isCurrent: verse.verse_number === currentVerseNumber && posIndex === currentPosIndex
                });
            }
        });
    }
    
    return results;
}

/**
 * Crée dynamiquement le modal "Ignorer partout"
 */
function createIgnoreEverywhereModal() {
    const modalHTML = `
    <div class="modal fade" id="ignoreEverywhereModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-warning bg-opacity-25">
                    <h5 class="modal-title">
                        <i class="bi bi-lightning-fill"></i> Ignorer toujours ce variant dans le chapitre <span id="ignore-everywhere-chapter"></span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted mb-3">
                        <strong><span id="ignore-everywhere-count">0</span> occurrence(s)</strong> de ce variant ont été trouvées dans le chapitre.
                        Sélectionnez les vers pour lesquels vous souhaitez appliquer la décision "Ignorer".
                    </p>
                    <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                        <table class="table table-sm table-hover">
                            <thead class="sticky-top bg-white">
                                <tr>
                                    <th style="width: 50px;">
                                        <input type="checkbox" id="ignore-everywhere-select-all" onclick="toggleAllIgnoreEverywhere()" checked>
                                    </th>
                                    <th style="width: 80px;">Vers</th>
                                    <th id="ignore-everywhere-th-witness-0"></th>
                                    <th id="ignore-everywhere-th-witness-1"></th>
                                    <th id="ignore-everywhere-th-witness-2"></th>
                                </tr>
                            </thead>
                            <tbody id="ignore-everywhere-tbody"></tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-primary" onclick="applyIgnoreEverywhere()">
                        <i class="bi bi-check-lg"></i> Valider
                    </button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Ouvre le modal "Ignorer partout"
 */
function openIgnoreEverywhereModal() {
    const verseNumber = parseInt(document.getElementById('word-verse-input').value);
    const posIndex = parseInt(document.getElementById('word-position-input').value);
    
    // Trouver les variantes similaires
    const similarVariants = findSimilarVariantsInChapter(verseNumber, posIndex);
    
    if (similarVariants.length === 0) {
        alert('Aucune autre occurrence de ce variant trouvée dans le chapitre.');
        return;
    }
    
    // Fermer le modal de classification
    const wordClassifyModal = bootstrap.Modal.getInstance(document.getElementById('wordClassifyModal'));
    if (wordClassifyModal) {
        wordClassifyModal.hide();
    }
    
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('ignoreEverywhereModal');
    if (!modal) {
        createIgnoreEverywhereModal();
        modal = document.getElementById('ignoreEverywhereModal');
    }
    
    // Remplir les informations
    const chapterEl = document.getElementById('ignore-everywhere-chapter');
    const countEl = document.getElementById('ignore-everywhere-count');
    const tbody = document.getElementById('ignore-everywhere-tbody');
    const witnessNames = getSelectedWitnessNames();
    
    if (chapterEl) chapterEl.textContent = appState.selectedChapter ?? '';
    if (countEl) countEl.textContent = similarVariants.length;
    
    // Mettre à jour les en-têtes avec les noms de témoins
    for (let i = 0; i < 3; i++) {
        const th = document.getElementById(`ignore-everywhere-th-witness-${i}`);
        if (th) th.textContent = witnessNames[i];
    }
    
    // Remplir le tableau
    if (tbody) {
        tbody.innerHTML = similarVariants.map((variant, idx) => {
            const isCurrent = variant.isCurrent ? ' class="table-primary"' : '';
            const alreadyIgnoredBadge = variant.alreadyIgnored 
                ? '<span class="badge bg-secondary">Déjà ignoré</span>'
                : '<span class="badge bg-light text-dark">Nouveau</span>';
            const currentBadge = variant.isCurrent 
                ? ' <span class="badge bg-info">Actuel</span>'
                : '';
            
            // Trouver le vers complet
            const verse = collationState.results.verses.find(v => v.verse_number === variant.verseNumber);
            
            // Construire les cellules de témoins avec le vers complet et le mot souligné
            const witnessCells = witnessNames.map((name, witIndex) => {
                const word = variant.words[name] || '—';
                const witnessData = verse?.witnesses?.[witIndex];
                let displayText = '—';
                
                if (witnessData && !witnessData.missing && witnessData.text) {
                    const fullText = witnessData.text;
                    // Chercher le mot dans le texte et le souligner
                    if (word !== '∅' && word !== '—') {
                        // Échapper les caractères spéciaux pour regex
                        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
                        displayText = fullText.replace(regex, '<u><strong>$1</strong></u>');
                    } else {
                        displayText = fullText;
                    }
                } else if (word === '∅') {
                    displayText = '<em class="text-muted">∅ (absent)</em>';
                }
                
                return `<td style="font-size: 0.9em;">${displayText}</td>`;
            }).join('');
            
            return `
                <tr${isCurrent} data-verse="${variant.verseNumber}" data-position="${variant.position}">
                    <td>
                        <input type="checkbox" class="ignore-everywhere-checkbox" 
                               data-verse="${variant.verseNumber}" 
                               data-position="${variant.position}" 
                               ${variant.alreadyIgnored ? '' : 'checked'}>
                    </td>
                    <td><strong>${variant.verseNumber}</strong></td>
                    ${witnessCells}
                </tr>
            `;
        }).join('');
    }
    
    // Ouvrir le modal
    const bsModal = bootstrap.Modal.getOrCreateInstance(modal);
    bsModal.show();
}

/**
 * Bascule toutes les checkboxes dans le modal "Ignorer partout"
 */
function toggleAllIgnoreEverywhere() {
    const selectAll = document.getElementById('ignore-everywhere-select-all');
    const checkboxes = document.querySelectorAll('.ignore-everywhere-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

/**
 * Applique la décision "ignorer" à tous les vers sélectionnés
 */
function applyIgnoreEverywhere() {
    const checkboxes = document.querySelectorAll('.ignore-everywhere-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Aucun vers sélectionné.');
        return;
    }
    
    const explication = document.getElementById('word-explication').value;
    const witnessNames = getSelectedWitnessNames();
    
    // Initialiser wordDecisions si nécessaire
    if (!collationState.wordDecisions) {
        collationState.wordDecisions = {};
    }
    
    // Parcourir chaque checkbox sélectionnée
    checkboxes.forEach(cb => {
        const verseNum = parseInt(cb.dataset.verse);
        const posIdx = parseInt(cb.dataset.position);
        const key = `${verseNum}-${posIdx}`;
        
        // Trouver le vers et la position
        const verse = collationState.results.verses.find(v => v.verse_number === verseNum);
        if (!verse || !verse.word_alignment) return;
        
        const position = verse.word_alignment[posIdx];
        if (!position) return;
        
        // Construire l'objet words et pages
        const words = {};
        const pages = {};
        
        for (let i = 0; i < 3; i++) {
            const wordData = position.words.find(w => w.witness_index === i);
            words[witnessNames[i]] = wordData?.missing ? '∅' : (wordData?.text || '');
            pages[witnessNames[i]] = verse.witnesses[i]?.metadata?.page || '';
        }
        
        // Créer la décision
        const decision = {
            verse_number: verseNum,
            position: posIdx,
            action: 'ignorer',
            explication: explication || null,
            words: words,
            pages: pages
        };
        
        // Sauvegarder en mémoire
        collationState.wordDecisions[key] = decision;
    });
    
    console.log(`${checkboxes.length} décision(s) "ignorer" appliquée(s)`);
    
    // Fermer le modal "Ignorer partout"
    const ignoreEverywhereModal = bootstrap.Modal.getInstance(document.getElementById('ignoreEverywhereModal'));
    if (ignoreEverywhereModal) ignoreEverywhereModal.hide();
    
    // Rafraîchir l'affichage
    displayCollationResults();
}

// Exposer les nouvelles fonctions globalement
window.openIgnoreEverywhereModal = openIgnoreEverywhereModal;
window.toggleAllIgnoreEverywhere = toggleAllIgnoreEverywhere;
window.applyIgnoreEverywhere = applyIgnoreEverywhere;
