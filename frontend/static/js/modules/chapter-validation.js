/**
 * Module de validation des chapitres
 * Gestion de l'étape 3 : vérification de compatibilité des chapitres entre témoins
 */

import { appState } from './state.js';
import * as API from './api.js';

// État local pour stocker l'analyse
let validationData = null;
let excludedChapters = {}; // Format: { witness_id: [chapter_numbers...] }
let savedExcludedChapters = {}; // Copie de sauvegarde pour le bouton Annuler

/**
 * Lance la validation des chapitres apres selection des temoins
 */
export async function validateChapters() {
    const workId = appState.selectedWork;
    const witnessIds = appState.selectedWitnesses.filter(id => id !== null);
    
    if (!workId || witnessIds.length !== 3) {
        console.error('Work ID ou temoins manquants');
        return;
    }
    
    try {
        // Appeler l'API de validation
        const result = await API.validateChapters(workId, witnessIds);
        
        if (result.status === 'success') {
            validationData = result;
            
            // Charger les exclusions sauvegardees depuis le backend
            const exclusionsResult = await API.fetchChapterExclusions(workId);
            if (exclusionsResult.status === 'success' && exclusionsResult.excluded_chapters) {
                excludedChapters = JSON.parse(JSON.stringify(exclusionsResult.excluded_chapters));
                appState.excludedChapters = JSON.parse(JSON.stringify(excludedChapters));
            } else {
                excludedChapters = {};
                appState.excludedChapters = {};
            }
            
            savedExcludedChapters = JSON.parse(JSON.stringify(excludedChapters));
            displayValidationSummary(result);
            
            // Afficher la section de validation
            document.getElementById('validation-content').style.display = 'block';
            document.querySelector('#validation-section > p.text-muted').style.display = 'none';
            
            // Si les chapitres sont deja compatibles, passer automatiquement a l'etape 4
            if (checkChaptersCompatibility()) {
                const validChapters = getValidChapters();
                populateChapterDropdown(validChapters);
                showStep4();
            }
        } else {
            alert('Erreur lors de la validation : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur validation chapitres:', error);
        alert('Erreur lors de la validation des chapitres');
    }
}

/**
 * Affiche le résumé de validation (nombre de chapitres par témoin + warning)
 */
function displayValidationSummary(data) {
    updateValidationSummary();
    updateValidateButton(); // Mettre à jour le bouton Valider
}

/**
 * Met à jour le résumé avec le nombre de chapitres actifs et exclus
 */
function updateValidationSummary() {
    if (!validationData) return;
    
    const summaryDiv = document.getElementById('chapters-summary');
    
    let html = '<div class="alert alert-light border">';
    html += '<h6 class="mb-3">Nombre de chapitres par témoin :</h6>';
    html += '<ul class="mb-0">';
    
    for (const witId of validationData.witness_order) {
        const witData = validationData.analysis[witId];
        const totalChapters = witData.total_chapters;
        const excludedCount = (excludedChapters[witId] || []).length;
        const activeCount = totalChapters - excludedCount;
        
        html += `<li><strong>${witData.name}</strong> : `;
        
        if (excludedCount > 0) {
            html += `${activeCount} chapitres <span class="text-muted">(${excludedCount} exclus)</span>`;
        } else {
            html += `${totalChapters} chapitres`;
        }
        
        html += `</li>`;
    }
    
    html += '</ul>';
    
    // Vérifier la compatibilité des chapitres actifs (avec les exclusions actuelles)
    const isCompatible = areChaptersCompatible(excludedChapters);

    if (isCompatible) {
        html += '<div class="alert alert-success mt-3 mb-0">';
        html += '<i class="bi bi-check-circle-fill"></i> ';
        html += '<strong>Parfait !</strong> Tous les témoins ont le même nombre de chapitres actifs. ';
        html += 'Vous pouvez passer à la sélection du chapitre ci-dessous.';
        html += '</div>';
        // Activer la sélection du chapitre
        document.getElementById('chapter-selection').style.display = 'block';
        document.querySelector('#chapter-section > p.text-muted').style.display = 'none';
    } else {
        html += '<div class="alert alert-warning mt-3 mb-0">';
        html += '<i class="bi bi-exclamation-triangle-fill"></i> ';
        html += '<strong>Attention :</strong> Le nombre de chapitres diffère entre les témoins. ';
        html += 'Veuillez utiliser le bouton \"Modifier les chapitres\" pour ajuster la sélection.';
        html += '</div>';
        // Désactiver la sélection du chapitre
        document.getElementById('chapter-selection').style.display = 'none';
        document.querySelector('#chapter-section > p.text-muted').style.display = 'block';
        document.querySelector('#chapter-section > p.text-muted').textContent = "Veuillez d'abord valider les chapitres";
    }

    // Toujours vérifier la compatibilité après chaque modification
    // pour désactiver/activer dynamiquement la sélection du chapitre
    // (déjà géré ci-dessus)

    html += '</div>';

    summaryDiv.innerHTML = html;
}

/**
 * Affiche/cache l'éditeur de chapitres
 */
export function toggleChapterEditor() {
    const editor = document.getElementById('chapter-editor');
    const btn = document.getElementById('btn-edit-chapters');
    
    if (editor.style.display === 'none') {
        // Sauvegarder l'état actuel avant d'ouvrir l'éditeur
        savedExcludedChapters = JSON.parse(JSON.stringify(excludedChapters));
        
        buildChapterTable();
        updateActionButtons(); // Désactiver les boutons au début
        editor.style.display = 'block';
        btn.innerHTML = '<i class="bi bi-eye-slash"></i> Masquer l\'éditeur';
    } else {
        // Restaurer l'état sauvegardé lors de la fermeture sans enregistrer
        excludedChapters = JSON.parse(JSON.stringify(savedExcludedChapters));
        updateValidationSummary();
        editor.style.display = 'none';
        btn.innerHTML = '<i class="bi bi-pencil"></i> Modifier les chapitres';
    }
}

/**
 * Construit le tableau d'édition des chapitres
 */
function buildChapterTable() {
    if (!validationData) return;
    
    const table = document.getElementById('chapters-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Construire l'en-tête (colonnes témoins)
    thead.innerHTML = '<th style="width: 80px;">N°</th>';
    for (const witId of validationData.witness_order) {
        const witData = validationData.analysis[witId];
        thead.innerHTML += `<th>${witData.name}</th>`;
    }
    
    // Pour chaque témoin, obtenir la liste des chapitres non exclus
    let witnessActiveChapters = {};
    for (const witId of validationData.witness_order) {
        const allChapters = validationData.analysis[witId].chapters;
        const excluded = excludedChapters[witId] || [];
        
        witnessActiveChapters[witId] = allChapters
            .map((chapterData, idx) => ({ originalIndex: idx, data: chapterData }))
            .filter(ch => !excluded.includes(ch.originalIndex));
    }
    
    // Trouver le nombre MAXIMUM de chapitres actifs
    const lengths = Object.values(witnessActiveChapters).map(chapters => chapters.length);
    const maxActiveChapters = lengths.length > 0 ? Math.max(...lengths) : 0;
    
    // Construire les lignes (une ligne par numéro normalisé)
    tbody.innerHTML = '';
    for (let i = 0; i < maxActiveChapters; i++) {
        let row = `<tr><td class="text-center fw-bold">${i + 1}</td>`;
        
        // Collecter tous les chapitres de cette ligne pour comparaison
        const chaptersInRow = [];
        for (const witId of validationData.witness_order) {
            const activeChapter = witnessActiveChapters[witId][i];
            if (activeChapter) {
                chaptersInRow.push({
                    witId: witId,
                    verses: activeChapter.data.mainzone_verses,
                    originalIndex: activeChapter.originalIndex
                });
            }
        }
        
        for (const witId of validationData.witness_order) {
            const activeChapter = witnessActiveChapters[witId][i];
            
            if (activeChapter) {
                const originalIndex = activeChapter.originalIndex;
                const verses = activeChapter.data.mainzone_verses;
                
                // Déterminer le message d'aide
                let helpBadge = '';
                if (verses === 0) {
                    helpBadge = '<span class="badge bg-danger ms-1">⚠️ Chapitre vide</span>';
                } else {
                    // Compter combien d'autres témoins ont au moins le double de vers
                    const othersWithDoubleVerses = chaptersInRow.filter(ch => 
                        ch.witId !== witId && ch.verses >= verses * 2
                    ).length;
                    
                    if (othersWithDoubleVerses >= 2) {
                        helpBadge = '<span class="badge bg-warning text-dark ms-1">⚠️ Très peu de contenu</span>';
                    }
                }
                
                row += `<td>`;
                row += `<div class="d-flex justify-content-between align-items-center">`;
                row += `<div>`;
                row += `<strong>[${originalIndex + 1}]</strong> ${verses} vers${helpBadge}`;
                row += `</div>`;
                row += `<button class="btn btn-sm btn-danger" onclick="window.excludeChapter('${witId}', ${originalIndex})"><i class="bi bi-trash"></i></button>`;
                row += `</div>`;
                row += `</td>`;
            } else {
                // Ce temoin n'a plus de chapitres actifs a cette position
                row += `<td class="table-light text-muted text-center">—</td>`;
            }
        }
        
        row += '</tr>';
        tbody.innerHTML += row;
    }
}

/**
 * Exclut un chapitre pour un témoin spécifique (mapping individuel)
 * chapterIndex est l'index 0-based du chapitre original
 */
export function excludeChapter(witnessId, chapterIndex) {
    if (!excludedChapters[witnessId]) {
        excludedChapters[witnessId] = [];
    }
    
    if (!excludedChapters[witnessId].includes(chapterIndex)) {
        excludedChapters[witnessId].push(chapterIndex);
        buildChapterTable(); // Reconstruire le tableau
        updateActionButtons(); // Activer les boutons
    }
}

/**
 * Vérifie s'il y a des modifications non sauvegardées
 */
function hasUnsavedChanges() {
    // Comparer excludedChapters avec savedExcludedChapters
    const currentKeys = Object.keys(excludedChapters).sort();
    const savedKeys = Object.keys(savedExcludedChapters).sort();
    
    if (currentKeys.length !== savedKeys.length) return true;
    
    for (const key of currentKeys) {
        if (!savedKeys.includes(key)) return true;
        
        const currentChapters = (excludedChapters[key] || []).slice().sort();
        const savedChapters = (savedExcludedChapters[key] || []).slice().sort();
        
        if (currentChapters.length !== savedChapters.length) return true;
        
        for (let i = 0; i < currentChapters.length; i++) {
            if (currentChapters[i] !== savedChapters[i]) return true;
        }
    }
    
    return false;
}

/**
 * Active/desactive les boutons Enregistrer, Annuler et Valider
 */
function updateActionButtons() {
    const saveBtn = document.getElementById('btn-save-chapters');
    const cancelBtn = document.getElementById('btn-cancel-chapters');
    
    const hasChanges = hasUnsavedChanges();
    
    // Boutons Enregistrer depend des modifications
    saveBtn.disabled = !hasChanges;
    
    // Bouton Annuler toujours actif
    cancelBtn.disabled = false;
    
    // Mettre à jour le bouton Valider
    updateValidateButton();
}

/**
 * Met à jour l'état du bouton Valider
 * Cache le bouton si compatible, le montre sinon
 */
function updateValidateButton() {
    // Fonction désormais inutile car le bouton Valider est supprimé
    // Gardée vide pour compatibilité éventuelle
}

/**
 * Verifie si tous les temoins ont le meme nombre de chapitres actifs
 * @param {Object} exclusionsToCheck - L'objet exclusions a verifier (excludedChapters ou savedExcludedChapters)
 */
function areChaptersCompatible(exclusionsToCheck) {
    if (!validationData) return false;
    
    let activeChapterCounts = [];
    
    for (const witId of validationData.witness_order) {
        const totalChapters = validationData.analysis[witId].total_chapters;
        const excludedCount = (exclusionsToCheck[witId] || []).length;
        activeChapterCounts.push(totalChapters - excludedCount);
    }
    
    // Verifier que tous les temoins ont le meme nombre de chapitres actifs
    const firstCount = activeChapterCounts[0];
    return activeChapterCounts.every(count => count === firstCount) && firstCount > 0;
}

/**
 * Verifie si tous les temoins ont le meme nombre de chapitres actifs
 * Utilise savedExcludedChapters pour que le bouton Valider soit actif
 * seulement apres enregistrement
 */
function checkChaptersCompatibility() {
    return areChaptersCompatible(savedExcludedChapters);
}

/**
 * Sauvegarde la selection des chapitres et passe automatiquement a l'etape 4 si compatible
 * Avertit l'utilisateur si des décisions existent et les supprime après confirmation
 */
export async function saveChapterSelection() {
    const workId = appState.selectedWork;
    
    try {
        // Vérifier si des décisions existent
        const countResult = await API.countAllDecisions(workId);
        const decisionsCount = countResult?.count || 0;
        
        if (decisionsCount > 0) {
            // Afficher un avertissement
            const confirmed = confirm(
                `⚠️ ATTENTION ⚠️\n\n` +
                `Vous avez ${decisionsCount} décision${decisionsCount > 1 ? 's' : ''} enregistrée${decisionsCount > 1 ? 's' : ''} pour cette œuvre.\n\n` +
                `Si vous modifiez les chapitres, TOUTES les décisions seront PERDUES.\n\n` +
                `💡 Pensez à exporter vos décisions avant de continuer.\n\n` +
                `Voulez-vous vraiment continuer et supprimer toutes les décisions ?`
            );
            
            if (!confirmed) {
                return; // L'utilisateur a annulé
            }
            
            // Supprimer toutes les décisions
            await API.deleteAllDecisions(workId);
        }
        
        // Sauvegarder les modifications dans l'etat local et global
        savedExcludedChapters = JSON.parse(JSON.stringify(excludedChapters));
        appState.excludedChapters = JSON.parse(JSON.stringify(excludedChapters));
        
        // Sauvegarder dans le backend
        const result = await API.saveChapterExclusions(workId, excludedChapters);
        
        if (result.status === 'success') {
            // Mettre a jour le resume
            updateValidationSummary();
            
            // Mettre a jour les boutons
            updateActionButtons();
            
            // Fermer l'editeur
            closeChapterEditor();
            
            // Si les chapitres sont compatibles, passer automatiquement a l'etape 4
            if (checkChaptersCompatibility()) {
                const validChapters = getValidChapters();
                populateChapterDropdown(validChapters);
                showStep4();
            }
            
            // Mettre à jour le bouton export (décisions supprimées)
            updateExportButton();
        } else {
            alert('Erreur lors de la sauvegarde : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur sauvegarde exclusions:', error);
        alert('Erreur lors de la sauvegarde des exclusions');
    }
}

/**
 * Valide la selection et passe a l'etape 4
 */
export async function validateAndProceed() {
    const workId = appState.selectedWork;
    
    // Recuperer les chapitres valides (non exclus) communs a tous les temoins
    const validChapters = getValidChapters();
    
    if (validChapters.length === 0) {
        alert('Aucun chapitre valide ! Vous devez avoir au moins un chapitre commun a tous les temoins.');
        return;
    }
    
    try {
        // Sauvegarder les modifications
        savedExcludedChapters = JSON.parse(JSON.stringify(excludedChapters));
        appState.excludedChapters = JSON.parse(JSON.stringify(excludedChapters));
        
        // Sauvegarder dans le backend
        await API.saveChapterExclusions(workId, excludedChapters);
        
        // Construire la liste des chapitres pour le dropdown de l'etape 4
        populateChapterDropdown(validChapters);
        
        // Fermer l'editeur et passer a l'etape 4
        closeChapterEditor();
        showStep4();
    } catch (error) {
        console.error('Erreur validation et sauvegarde:', error);
        alert('Erreur lors de la sauvegarde');
    }
}

/**
 * Détermine les chapitres valides (non exclus dans tous les témoins)
 * Retourne le mapping entre numeros normalises et numeros originaux
 */
function getValidChapters() {
    if (!validationData) return [];
    // Pour chaque témoin, obtenir la liste des chapitres non exclus
    let witnessActiveChapters = {};
    for (const witId of validationData.witness_order) {
        const allChapters = validationData.analysis[witId].chapters;
        const excluded = excludedChapters[witId] || [];
        
        witnessActiveChapters[witId] = allChapters
            .map((chapterData, idx) => idx)
            .filter(idx => !excluded.includes(idx));
    }
    
    // Trouver le nombre minimum de chapitres actifs
    const lengths = Object.values(witnessActiveChapters).map(chapters => chapters.length);
    const minActiveChapters = lengths.length > 0 ? Math.min(...lengths) : 0;
    
    // Construire la liste des chapitres valides avec mapping
    const validChapters = [];
    
    for (let i = 0; i < minActiveChapters; i++) {
        let mapping = {};
        
        // Pour chaque témoin, le i-ème chapitre actif
        for (const witId of validationData.witness_order) {
            mapping[witId] = witnessActiveChapters[witId][i];
        }
        
        validChapters.push({
            index: i,
            label: `Chapitre ${i + 1}`,
            mapping: mapping // {witness_id: original_chapter_index}
        });
    }
    
    return validChapters;
}

/**
 * Remplit le dropdown de sélection de chapitre (étape 4)
 */
function populateChapterDropdown(validChapters) {
    const select = document.getElementById('chapter-select');
    select.innerHTML = '<option value="">-- Sélectionnez un chapitre --</option>';
    
    // Stocker la liste des chapitres valides avec leur mapping dans l'état global
    appState.validChapters = validChapters;
    
    validChapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter.index;
        option.textContent = chapter.label;
        select.appendChild(option);
    });
}

/**
 * Affiche l'étape 4 (sélection du chapitre)
 */
function showStep4() {
    document.getElementById('chapter-selection').style.display = 'block';
    document.querySelector('#chapter-section > p.text-muted').style.display = 'none';
    
    // Afficher la section export en bas de page
    const exportSection = document.getElementById('export-section');
    if (exportSection) exportSection.style.display = 'block';
    
    // Mettre à jour le nom de l'œuvre pour l'export
    const exportWorkName = document.getElementById('export-work-name');
    if (exportWorkName) exportWorkName.textContent = appState.selectedWork || '';
    
    // Mettre à jour l'état du bouton export
    updateExportButton();
}

/**
 * Met à jour l'état du bouton export selon le nombre de décisions
 */
export async function updateExportButton() {
    const btnExport = document.getElementById('btn-export');
    const decisionsCount = document.getElementById('export-decisions-count');
    
    if (!btnExport || !decisionsCount) return;
    
    // Compter les décisions enregistrées pour tous les chapitres
    let totalDecisions = 0;
    const workId = appState.selectedWork;
    const validChapters = appState.validChapters || [];
    
    if (workId && validChapters.length > 0) {
        try {
            for (const chapter of validChapters) {
                const response = await fetch(`/api/word-decisions/${workId}/${chapter.index}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        // Compter seulement les décisions "conserver"
                        const conserved = result.decisions.filter(d => d.action === 'conserver');
                        totalDecisions += conserved.length;
                    }
                }
            }
        } catch (e) {
            console.warn('Erreur comptage décisions:', e);
        }
    }
    
    // Mettre à jour l'affichage
    if (totalDecisions === 0) {
        btnExport.disabled = true;
        decisionsCount.style.display = 'block';
        decisionsCount.textContent = '0 variantes conservées';
        decisionsCount.className = 'text-danger small mt-1';
    } else {
        btnExport.disabled = false;
        decisionsCount.style.display = 'block';
        decisionsCount.textContent = `${totalDecisions} variante${totalDecisions > 1 ? 's' : ''} conservée${totalDecisions > 1 ? 's' : ''}`;
        decisionsCount.className = 'text-success small mt-1';
    }
}

/**
 * Ferme l'editeur de chapitres
 */
function closeChapterEditor() {
    const editor = document.getElementById('chapter-editor');
    const btn = document.getElementById('btn-edit-chapters');
    
    editor.style.display = 'none';
    btn.style.display = 'inline-block';
}

/**
 * Annule l'edition et ferme l'editeur
 */
export function cancelChapterEdit() {
    // Restaurer l'etat sauvegarde
    excludedChapters = JSON.parse(JSON.stringify(savedExcludedChapters));
    
    // Reconstruire le tableau avec l'etat restaure
    buildChapterTable();
    
    // Mettre a jour le resume
    updateValidationSummary();
    
    // Fermer l'editeur
    closeChapterEditor();
}

/**
 * Remet tous les chapitres a l'etat initial (aucune exclusion)
 */
export function resetAllChapters() {
    // Supprimer toutes les exclusions
    excludedChapters = {};
    
    // Reconstruire le tableau
    buildChapterTable();
    
    // Mettre a jour le resume
    updateValidationSummary();
    
    // Mettre a jour les boutons
    updateActionButtons();
}

/**
 * Réinitialise la validation (utilisé lors du changement de témoins)
 */
export function resetValidation() {
    validationData = null;
    excludedChapters = {};
    savedExcludedChapters = {};
    appState.excludedChapters = {};
    
    // Cacher les sections
    document.getElementById('validation-content').style.display = 'none';
    document.querySelector('#validation-section > p.text-muted').style.display = 'block';
    
    document.getElementById('chapter-selection').style.display = 'none';
    document.querySelector('#chapter-section > p.text-muted').style.display = 'block';
    document.querySelector('#chapter-section > p.text-muted').textContent = 'Veuillez d\'abord valider les chapitres';
    
    // Réinitialiser le dropdown
    document.getElementById('chapter-select').innerHTML = '<option value="">-- Sélectionnez un chapitre --</option>';
}
