/**
 * Module de gestion des œuvres
 */

import { appState, resetSelectedWitnesses } from './state.js';
import { loadWitnesses, resetWitnessesUI } from './witnesses.js';
import { disableChapterSection, resetChaptersSelect } from './chapters.js';
import * as API from './api.js';

/**
 * Charge la liste des œuvres depuis le serveur
 */
export async function loadWorks() {
    try {
        const data = await API.fetchWorks();
        
        if (data.status === 'success') {
            appState.works = data.works;
            updateWorksSelect();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des œuvres:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Met à jour la liste des œuvres avec des radio buttons
 */
export function updateWorksSelect() {
    const worksList = document.getElementById('works-list');
    
    if (appState.works.length === 0) {
        worksList.innerHTML = '<p class="text-muted text-center my-3">Aucune œuvre enregistrée. Cliquez sur "Ajouter" ci-dessous.</p>';
        return;
    }
    
    // Trier les œuvres par ordre alphabétique
    const sortedWorks = [...appState.works].sort((a, b) => 
        a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    );
    
    worksList.innerHTML = '';
    
    sortedWorks.forEach((work, index) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        
        const leftDiv = document.createElement('div');
        
        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'radio';
        input.name = 'work-radio';
        input.value = work.id;
        input.id = `work-${work.id}`;
        
        // Sélectionner la première œuvre par défaut (seulement si aucune œuvre n'est déjà sélectionnée)
        if (index === 0 && !appState.selectedWork) {
            input.checked = true;
        } else if (appState.selectedWork === work.id) {
            input.checked = true;
        }
        
        input.addEventListener('change', () => onWorkSelected(work.id));
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `work-${work.id}`;
        
        let labelText = work.name;
        if (work.author) labelText += ` <small class="text-muted">(${work.author})</small>`;
        if (work.date) labelText += ` <small class="text-muted">[${work.date}]</small>`;
        label.innerHTML = labelText;
        
        leftDiv.appendChild(input);
        leftDiv.appendChild(label);
        
        // Boutons d'action
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'work-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-1';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = 'Modifier';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openEditWorkModal(work);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.title = 'Supprimer';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            confirmDeleteWork(work);
        };
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        div.appendChild(leftDiv);
        div.appendChild(actionsDiv);
        worksList.appendChild(div);
    });
    
    // Sélectionner automatiquement la première œuvre si aucune n'est sélectionnée
    if (!appState.selectedWork && sortedWorks.length > 0) {
        const firstWork = sortedWorks[0];
        onWorkSelected(firstWork.id);
    }
}

/**
 * Gère la sélection d'une œuvre
 */
export async function onWorkSelected(workId) {
    appState.selectedWork = workId;
    
    // Réinitialiser les témoins et chapitres
    resetSelectedWitnesses();
    appState.selectedChapter = null;
    
    // loadWitnesses va activer/désactiver la section chapitres selon le nombre de témoins sélectionnés
    await loadWitnesses(workId);
}

/**
 * Ajoute une nouvelle œuvre
 */
export async function addWork() {
    const name = document.getElementById('work-name').value.trim();
    const author = document.getElementById('work-author')?.value?.trim() || null;
    const date = document.getElementById('work-date')?.value?.trim() || null;
    
    if (!name) {
        alert('Veuillez saisir le nom de l\'œuvre');
        return;
    }
    
    try {
        const data = await API.createWork({ name, author, date });
        
        if (data.status === 'success') {
            document.activeElement?.blur();
            bootstrap.Modal.getInstance(document.getElementById('addWorkModal')).hide();
            document.getElementById('add-work-form').reset();
            await loadWorks();
            
            const radio = document.getElementById(`work-${data.work.id}`);
            if (radio) {
                radio.checked = true;
                onWorkSelected(data.work.id);
            }
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Ouvre la modal d'édition d'une œuvre
 */
export function openEditWorkModal(work) {
    document.getElementById('edit-work-id').value = work.id;
    document.getElementById('edit-work-name').value = work.name;
    if (document.getElementById('edit-work-author')) {
        document.getElementById('edit-work-author').value = work.author || '';
    }
    if (document.getElementById('edit-work-date')) {
        document.getElementById('edit-work-date').value = work.date || '';
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editWorkModal')).show();
}

/**
 * Met à jour une œuvre
 */
export async function updateWork() {
    const workId = document.getElementById('edit-work-id').value;
    const name = document.getElementById('edit-work-name').value.trim();
    const author = document.getElementById('edit-work-author')?.value?.trim() || null;
    const date = document.getElementById('edit-work-date')?.value?.trim() || null;
    
    if (!name) {
        alert('Le nom de l\'œuvre est obligatoire');
        return;
    }
    
    try {
        const data = await API.updateWork(workId, { name, author, date });
        
        if (data.status === 'success') {
            document.activeElement?.blur();
            bootstrap.Modal.getInstance(document.getElementById('editWorkModal')).hide();
            await loadWorks();
            
            // Maintenir la sélection
            if (appState.selectedWork === workId) {
                const radio = document.getElementById(`work-${workId}`);
                if (radio) {
                    radio.checked = true;
                }
            }
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Confirme la suppression d'une œuvre
 */
export function confirmDeleteWork(work) {
    document.getElementById('delete-work-id').value = work.id;
    document.getElementById('delete-work-name').textContent = work.name;
    const witnessCountEl = document.getElementById('delete-work-witness-count');
    if (witnessCountEl) witnessCountEl.textContent = appState.witnesses.length;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteWorkModal')).show();
}

/**
 * Supprime une œuvre
 */
export async function deleteWork() {
    const workId = document.getElementById('delete-work-id').value;
    
    try {
        const data = await API.deleteWork(workId);
        
        if (data.status === 'success') {
            document.activeElement?.blur();
            bootstrap.Modal.getInstance(document.getElementById('deleteWorkModal')).hide();
            
            // Si c'était l'œuvre sélectionnée
            if (appState.selectedWork === workId) {
                appState.selectedWork = null;
                resetSelectedWitnesses();
            }
            
            await loadWorks();
            resetWitnessesUI();
            disableChapterSection();
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}
