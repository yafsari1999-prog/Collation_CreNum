/**
 * Point d'entrée principal de l'application modulaire
 */

import { loadWorks } from './modules/works.js';
import { setupEventListeners, exposeGlobalFunctions } from './modules/ui.js';

// Exposer les fonctions globalement pour compatibilité onclick
exposeGlobalFunctions();

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application modulaire chargée');
    loadWorks();
    setupEventListeners();
    console.log('✓ Initialisation terminée');
});
