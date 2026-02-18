/**
 * Module de gestion de l'état global de l'application
 */

// État global de l'application
export const appState = {
    selectedWork: null,
    selectedWitnesses: [null, null, null],
    selectedChapter: null,
    works: [],
    witnesses: []
};

// État de la collation
export const collationState = {
    results: null,
    currentPage: 1,
    versesPerPage: 20,
    pendingDecisions: {},
    wordDecisions: {},
    savedWordDecisions: {},
    totalDecisions: 0
};

/**
 * Réinitialise l'état des témoins sélectionnés
 */
export function resetSelectedWitnesses() {
    appState.selectedWitnesses = [null, null, null];
}

/**
 * Réinitialise l'état de la collation
 */
export function resetCollationState() {
    collationState.results = null;
    collationState.currentPage = 1;
    collationState.pendingDecisions = {};
    collationState.wordDecisions = {};
    collationState.savedWordDecisions = {};
    collationState.totalDecisions = 0;
}
