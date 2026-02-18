/**
 * Module de gestion des témoins
 */

import { appState } from './state.js';
import { loadChapters, enableChapterSection, disableChapterSection } from './chapters.js';
import * as API from './api.js';

/**
 * Charge les témoins d'une œuvre
 */
export async function loadWitnesses(workId) {
    try {
        const data = await API.fetchWitnesses(workId);
        
        if (data.status === 'success') {
            appState.witnesses = data.witnesses;
            await updateWitnessesList();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des témoins:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Met à jour la liste des témoins avec des checkboxes
 */
export async function updateWitnessesList() {
    const witnessesList = document.getElementById('witnesses-list');
    
    // Activer la section témoins (cacher le message et montrer la sélection)
    enableWitnessesSection();
    
    if (appState.witnesses.length === 0) {
        witnessesList.innerHTML = '<p class="text-muted text-center my-3">Aucun témoin disponible. Cliquez sur "Ajouter" ci-dessous.</p>';
        return;
    }
    
    // Trier les témoins par ordre alphabétique
    const sortedWitnesses = [...appState.witnesses].sort((a, b) => 
        a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    );
    
    witnessesList.innerHTML = '';
    
    sortedWitnesses.forEach((witness, index) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        
        const leftDiv = document.createElement('div');
        
        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.name = 'witness-checkbox';
        input.value = witness.id;
        input.id = `witness-${witness.id}`;
        
        // Vérifier si ce témoin est déjà sélectionné
        if (appState.selectedWitnesses.includes(witness.id)) {
            input.checked = true;
        }
        
        input.addEventListener('change', (e) => onWitnessCheckboxChanged(e, witness.id));
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `witness-${witness.id}`;
        label.textContent = witness.name;
        
        leftDiv.appendChild(input);
        leftDiv.appendChild(label);
        
        // Boutons d'action
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'witness-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-1';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.title = 'Modifier';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openEditWitnessModal(witness);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.title = 'Supprimer';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            confirmDeleteWitness(witness);
        };
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        div.appendChild(leftDiv);
        div.appendChild(actionsDiv);
        witnessesList.appendChild(div);
    });
    
    // Cocher automatiquement les 3 premiers témoins si aucun n'est sélectionné
    const selectedCount = appState.selectedWitnesses.filter(w => w !== null).length;
    
    if (selectedCount === 0 && sortedWitnesses.length > 0) {
        const witnessesToSelect = sortedWitnesses.slice(0, Math.min(3, sortedWitnesses.length));
        
        witnessesToSelect.forEach((witness, idx) => {
            appState.selectedWitnesses[idx] = witness.id;
            const checkbox = document.getElementById(`witness-${witness.id}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
    
    // Vérifier si on a exactement 3 témoins sélectionnés pour activer la section chapitres
    const finalSelectedCount = appState.selectedWitnesses.filter(w => w !== null).length;
    
    if (finalSelectedCount === 3) {
        await loadChapters();
        enableChapterSection();
    } else {
        disableChapterSection();
    }
}

/**
 * Gère le changement d'état d'une checkbox de témoin
 */
export function onWitnessCheckboxChanged(event, witnessId) {
    const checkbox = event.target;
    
    if (checkbox.checked) {
        // Vérifier si on n'a pas déjà 3 témoins sélectionnés
        const selectedCount = appState.selectedWitnesses.filter(w => w !== null).length;
        
        if (selectedCount >= 3) {
            checkbox.checked = false;
            alert('Vous ne pouvez sélectionner que 3 témoins maximum');
            return;
        }
        
        // Ajouter le témoin à la première position libre
        for (let i = 0; i < 3; i++) {
            if (appState.selectedWitnesses[i] === null) {
                appState.selectedWitnesses[i] = witnessId;
                break;
            }
        }
    } else {
        // Retirer le témoin et compacter le tableau
        const index = appState.selectedWitnesses.indexOf(witnessId);
        if (index !== -1) {
            appState.selectedWitnesses.splice(index, 1);
            appState.selectedWitnesses.push(null);
        }
    }
    
    // Vérifier si 3 témoins sont sélectionnés
    const allSelected = appState.selectedWitnesses.filter(w => w !== null).length === 3;
    
    if (allSelected) {
        // Charger les chapitres
        loadChapters();
        enableChapterSection();
    } else {
        disableChapterSection();
    }
}

/**
 * Ouvre le modal d'ajout de témoin
 */
export function openAddWitnessModal() {
    if (!appState.selectedWork) {
        alert('Veuillez d\'abord sélectionner une œuvre');
        return;
    }
    
    // Réinitialiser le formulaire
    document.getElementById('add-witness-form').reset();
    document.getElementById('witness-name').value = '';
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('addWitnessModal')).show();
}

/**
 * Met à jour le nom du témoin depuis le nom du fichier
 */
export function updateWitnessNameFromFile() {
    const fileInput = document.getElementById('witness-file');
    const nameInput = document.getElementById('witness-name');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        // Extraire le nom sans l'extension .json
        let fileName = file.name;
        if (fileName.endsWith('.json')) {
            fileName = fileName.slice(0, -5);
        }
        
        // Remplacer les underscores et tirets par des espaces
        fileName = fileName.replace(/[_-]/g, ' ');
        
        // Capitaliser les mots
        fileName = fileName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        nameInput.value = fileName;
    }
}

/**
 * Ajoute un nouveau témoin
 */
export async function addWitness() {
    const name = document.getElementById('witness-name').value.trim();
    const fileInput = document.getElementById('witness-file');
    const file = fileInput.files[0];
    
    if (!name || !file) {
        alert('Le nom et le fichier sont obligatoires');
        return;
    }
    
    if (!appState.selectedWork) {
        alert('Aucune œuvre sélectionnée');
        return;
    }
    
    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    
    try {
        const data = await API.createWitness(appState.selectedWork, formData);
        
        if (data.status === 'success') {
            // Fermer le modal
            document.activeElement?.blur();
            bootstrap.Modal.getInstance(document.getElementById('addWitnessModal')).hide();
            
            // Réinitialiser le formulaire
            document.getElementById('add-witness-form').reset();
            
            // Recharger les témoins
            await loadWitnesses(appState.selectedWork);
            
            // Sélectionner automatiquement le nouveau témoin si < 3 sont sélectionnés
            const selectedCount = appState.selectedWitnesses.filter(w => w !== null).length;
            if (selectedCount < 3) {
                const checkbox = document.getElementById(`witness-${data.witness.id}`);
                if (checkbox) {
                    checkbox.checked = true;
                    onWitnessCheckboxChanged({ target: checkbox }, data.witness.id);
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
 * Ouvre la modal d'édition d'un témoin
 */
export function openEditWitnessModal(witness) {
    document.getElementById('edit-witness-work-id').value = appState.selectedWork;
    document.getElementById('edit-witness-id').value = witness.id;
    document.getElementById('edit-witness-name').value = witness.name;
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editWitnessModal'));
    modal.show();
}

/**
 * Met à jour un témoin
 */
export async function updateWitness() {
    const workId = document.getElementById('edit-witness-work-id').value;
    const witnessId = document.getElementById('edit-witness-id').value;
    const name = document.getElementById('edit-witness-name').value.trim();
    
    if (!name) {
        alert('Le nom du témoin est obligatoire');
        return;
    }
    
    try {
        const data = await API.updateWitness(workId, witnessId, { name: name });
        
        if (data.status === 'success') {
            // Fermer la modal
            document.activeElement?.blur();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editWitnessModal'));
            modal.hide();
            
            // Recharger les témoins
            await loadWitnesses(workId);
        } else {
            alert('Erreur : ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Ouvre la modal de confirmation de suppression d'un témoin
 */
export function confirmDeleteWitness(witness) {
    document.getElementById('delete-witness-work-id').value = appState.selectedWork;
    document.getElementById('delete-witness-id').value = witness.id;
    document.getElementById('delete-witness-name').textContent = witness.name;
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteWitnessModal'));
    modal.show();
}

/**
 * Supprime un témoin
 */
export async function deleteWitness() {
    const workId = document.getElementById('delete-witness-work-id').value;
    const witnessId = document.getElementById('delete-witness-id').value;
    
    try {
        const data = await API.deleteWitness(workId, witnessId);
        
        if (data.status === 'success') {
            // Fermer la modal
            document.activeElement?.blur();
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteWitnessModal'));
            modal.hide();
            
            // Supprimer le témoin de l'état si il était sélectionné
            const index = appState.selectedWitnesses.indexOf(witnessId);
            if (index !== -1) {
                appState.selectedWitnesses[index] = null;
            }
            
            // Recharger les témoins
            await loadWitnesses(workId);
            
            // Si on a moins de 3 témoins sélectionnés, désactiver la section chapitres
            const selectedCount = appState.selectedWitnesses.filter(w => w !== null).length;
            if (selectedCount < 3) {
                disableChapterSection();
            }
        } else {
            alert('Erreur : ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Active la section témoins (montre le sélecteur)
 */
export function enableWitnessesSection() {
    const messageP = document.querySelector('#witnesses-section > p');
    const witnessSelection = document.getElementById('witness-selection');
    
    if (messageP) {
        messageP.style.display = 'none';
    }
    if (witnessSelection) {
        witnessSelection.style.display = 'block';
    }
}

/**
 * Désactive la section témoins (cache le sélecteur)
 */
export function disableWitnessesSection() {
    const messageP = document.querySelector('#witnesses-section > p');
    const witnessSelection = document.getElementById('witness-selection');
    
    if (messageP) {
        messageP.style.display = 'block';
    }
    if (witnessSelection) {
        witnessSelection.style.display = 'none';
    }
    
    // Réinitialiser les sélections
    appState.selectedWitnesses = [null, null, null];
    
    // Décocher toutes les checkboxes
    document.querySelectorAll('input[name="witness-checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Réinitialise l'interface des témoins
 */
export function resetWitnessesUI() {
    appState.witnesses = [];
    appState.selectedWitnesses = [null, null, null];
    document.getElementById('witnesses-list').innerHTML = '';
    disableWitnessesSection();
}
