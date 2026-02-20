/**
 * Point d'entrée principal de l'application modulaire
 */

import { loadWorks } from './modules/works.js';
import { setupEventListeners, exposeGlobalFunctions } from './modules/ui.js';

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Exposer les fonctions globalement pour compatibilité onclick
    exposeGlobalFunctions();
    
    // Charger les œuvres et configurer les listeners
    loadWorks();
    setupEventListeners();
});
