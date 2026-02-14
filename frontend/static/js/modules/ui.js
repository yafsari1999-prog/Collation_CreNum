/**
 * Module utilitaires pour l'interface utilisateur
 */

import { appState } from './state.js';
import { addWork, updateWork, deleteWork, openEditWorkModal, confirmDeleteWork } from './works.js';
import { 
    addWitness, updateWitness, deleteWitness, 
    openAddWitnessModal, openEditWitnessModal, confirmDeleteWitness,
    updateWitnessNameFromFile
} from './witnesses.js';
import { onChapterSelected } from './chapters.js';
import { launchCollation, previousPage, nextPage } from './collation.js';
import { openQualifyModal, saveDecision, clearDecision, saveAllDecisions } from './decisions.js';

/**
 * Configure tous les event listeners de l'application
 */
export function setupEventListeners() {
    console.log('Configuration des événements...');
    
    // Sélection du chapitre
    const chapterSelect = document.getElementById('chapter-select');
    if (chapterSelect) {
        chapterSelect.addEventListener('change', onChapterSelected);
        console.log('✓ Event listener attaché au sélecteur de chapitre');
    }
    
    // Bouton ajouter œuvre
    const addWorkBtn = document.getElementById('addWorkBtn');
    if (addWorkBtn) {
        addWorkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addWork();
        });
        console.log('✓ Event listener attaché au bouton Ajouter œuvre');
    }
    
    // Bouton ajouter témoin
    const addWitnessBtn = document.getElementById('addWitnessBtn');
    if (addWitnessBtn) {
        addWitnessBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addWitness();
        });
        console.log('✓ Event listener attaché au bouton Ajouter témoin');
    }
    
    // Bouton lancer collation
    const collateBtn = document.getElementById('btn-collate');
    if (collateBtn) {
        collateBtn.addEventListener('click', function(e) {
            console.log('Bouton Lancer collation cliqué');
            e.preventDefault();
            launchCollation();
        });
        console.log('✓ Event listener attaché au bouton Lancer collation');
    }
    
    // Input fichier pour pré-remplir le nom du témoin
    const witnessFileInput = document.getElementById('witness-file');
    if (witnessFileInput) {
        witnessFileInput.addEventListener('change', updateWitnessNameFromFile);
        console.log('✓ Event listener attaché au sélecteur de fichier');
    }
    
    console.log('Configuration des événements terminée');
}

/**
 * Expose les fonctions globalement pour compatibilité avec onclick
 */
export function exposeGlobalFunctions() {
    // Fonctions œuvres
    window.addWork = addWork;
    window.updateWork = updateWork;
    window.deleteWork = deleteWork;
    window.openEditWorkModal = openEditWorkModal;
    window.confirmDeleteWork = confirmDeleteWork;
    
    // Fonctions témoins
    window.addWitness = addWitness;
    window.updateWitness = updateWitness;
    window.deleteWitness = deleteWitness;
    window.openAddWitnessModal = openAddWitnessModal;
    window.openEditWitnessModal = openEditWitnessModal;
    window.confirmDeleteWitness = confirmDeleteWitness;
    window.updateWitnessNameFromFile = updateWitnessNameFromFile;
    
    // Fonctions collation
    window.launchCollation = launchCollation;
    window.previousPage = previousPage;
    window.nextPage = nextPage;
    
    // Fonctions décisions
    window.openQualifyModal = openQualifyModal;
    window.saveDecision = saveDecision;
    window.clearDecision = clearDecision;
    window.saveAllDecisions = saveAllDecisions;
}
