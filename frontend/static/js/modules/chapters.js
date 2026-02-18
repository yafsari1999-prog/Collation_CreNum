/**
 * Module de gestion des chapitres
 */

import { appState } from './state.js';
import * as API from './api.js';

/**
 * Charge les chapitres d'une œuvre
 */
export async function loadChapters() {
    if (!appState.selectedWork) return;
    
    try {
        const data = await API.fetchWorkChapters(appState.selectedWork);
        
        if (data.status === 'success') {
            const select = document.getElementById('chapter-select');
            select.innerHTML = '<option value="">-- Sélectionnez un chapitre --</option>';
            
            data.chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter.index.toString();
                option.textContent = chapter.label;
                select.appendChild(option);
            });
            
            // Sélectionner automatiquement le chapitre 1 (index 0)
            if (data.chapters.length > 0) {
                const defaultValue = data.chapters[0].index.toString();
                select.value = defaultValue;
                appState.selectedChapter = defaultValue;
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des chapitres:', error);
    }
}

/**
 * Active la section chapitres
 */
export function enableChapterSection() {
    const messageP = document.querySelector('#chapter-section > p');
    const chapterSelection = document.getElementById('chapter-selection');
    
    if (messageP) {
        messageP.style.display = 'none';
    }
    if (chapterSelection) {
        chapterSelection.style.display = 'block';
    }
}

/**
 * Désactive la section chapitres
 */
export function disableChapterSection() {
    const messageP = document.querySelector('#chapter-section > p');
    const chapterSelection = document.getElementById('chapter-selection');
    
    if (messageP) {
        messageP.style.display = 'block';
    }
    if (chapterSelection) {
        chapterSelection.style.display = 'none';
        const select = document.getElementById('chapter-select');
        if (select) select.value = '';
    }
    appState.selectedChapter = null;
}

/**
 * Gère la sélection d'un chapitre
 */
export function onChapterSelected(event) {
    appState.selectedChapter = event.target.value || null;
}

/**
 * Réinitialise le sélecteur de chapitres
 */
export function resetChaptersSelect() {
    const select = document.getElementById('chapter-select');
    if (select) {
        select.innerHTML = '<option value="">-- Sélectionnez un chapitre --</option>';
    }
    appState.selectedChapter = null;
    disableChapterSection();
}
