/**
 * Module de gestion de la collation
 */

import { appState, collationState } from './state.js';
import * as API from './api.js';

/**
 * Lance la collation
 */
export async function launchCollation() {
    if (!appState.selectedWork || !appState.selectedChapter) {
        alert('Veuillez sélectionner une œuvre, des témoins et un chapitre');
        return;
    }
    
    const allWitnessesSelected = appState.selectedWitnesses.every(w => w !== null);
    if (!allWitnessesSelected) {
        alert('Veuillez sélectionner 3 témoins');
        return;
    }
    
    // Afficher la section résultats
    const resultsSection = document.getElementById('results-section');
    const collationLoading = document.getElementById('collation-loading');
    const collationTable = document.getElementById('collation-table');
    const noResults = document.getElementById('no-results');
    const collationFooter = document.getElementById('collation-footer');
    
    resultsSection.style.display = 'block';
    collationLoading.style.display = 'block';
    collationTable.style.display = 'none';
    noResults.style.display = 'none';
    collationFooter.style.display = 'none';
    
    try {
        // Récupérer le mapping du chapitre sélectionné vers les chapitres originaux
        const selectedChapterIdx = parseInt(appState.selectedChapter);
        const chapterInfo = appState.validChapters.find(ch => ch.index === selectedChapterIdx);
        const chapterMapping = chapterInfo ? chapterInfo.mapping : null;
        
        const data = await API.performCollation(
            appState.selectedWork,
            appState.selectedWitnesses,
            appState.selectedChapter,
            chapterMapping
        );
        
        if (data.status === 'success') {
            collationState.results = data.data;
            collationState.currentPage = 1;
            collationState.pendingDecisions = {};
            
            // Compter les décisions existantes
            collationState.totalDecisions = collationState.results.verses.filter(
                v => v.user_decision !== null && v.user_decision !== undefined
            ).length;
            
            // Afficher les en-têtes des témoins
            document.getElementById('witness-header-1').textContent = collationState.results.witnesses[0];
            document.getElementById('witness-header-2').textContent = collationState.results.witnesses[1];
            document.getElementById('witness-header-3').textContent = collationState.results.witnesses[2];
            
            // Charger les décisions de mots persistées
            try {
                const { loadWordDecisions } = await import('./decisions.js');
                await loadWordDecisions();
            } catch (e) {
                console.warn('Impossible de charger les décisions mots:', e);
            }
            
            // Afficher les résultats
            displayCollationResults();
            
            // Mettre à jour le bouton export
            try {
                const { updateExportButton } = await import('./chapter-validation.js');
                await updateExportButton();
            } catch (e) {
                console.warn('Impossible de mettre à jour le bouton export:', e);
            }
            
            collationLoading.style.display = 'none';
            collationTable.style.display = 'block';
            collationFooter.style.display = 'block';
        } else {
            collationLoading.style.display = 'none';
            noResults.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            noResults.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur de collation:', error);
        collationLoading.style.display = 'none';
        
        noResults.innerHTML = `<div class="alert alert-danger">${error.message}<br><small class="text-muted">Voir la console (F12) pour plus de détails</small></div>`;
        noResults.style.display = 'block';
    }
}

/**
 * Affiche les résultats de collation avec pagination
 */
export function displayCollationResults() {
    const versesContainer = document.getElementById('verses-container');
    if (!versesContainer) {
        console.error('Element verses-container non trouvé');
        return;
    }
    versesContainer.innerHTML = '';
    
    const totalVerses = collationState.results.verses.length;
    const totalPages = Math.ceil(totalVerses / collationState.versesPerPage);
    const startIdx = (collationState.currentPage - 1) * collationState.versesPerPage;
    const endIdx = Math.min(startIdx + collationState.versesPerPage, totalVerses);
    
    // Mettre à jour le footer
    const totalVersesBadge = document.getElementById('total-verses-badge');
    const decisionsBadge = document.getElementById('decisions-badge');
    const conservedBadge = document.getElementById('conserved-badge');
    
    // Compter le total de variantes
    let totalVariants = 0;
    collationState.results.verses.forEach(v => {
        totalVariants += v.variant_word_count || 0;
    });
    
    // Compter les conservées
    let conservedCount = 0;
    if (collationState.wordDecisions) {
        conservedCount = Object.values(collationState.wordDecisions)
            .filter(d => d.action === 'conserver').length;
    }
    
    if (totalVersesBadge) totalVersesBadge.textContent = `${totalVerses} vers`;
    if (decisionsBadge) decisionsBadge.textContent = `${totalVariants} variantes`;
    if (conservedBadge) conservedBadge.innerHTML = `<i class="bi bi-bookmark-check"></i> ${conservedCount} conservées`;
    
    // Mettre à jour le badge footer (nouvelles décisions de la séance)
    const footerDecisionsBadge = document.getElementById('footer-decisions-badge');
    const saved = collationState.savedWordDecisions || {};
    const current = collationState.wordDecisions || {};
    let pendingCount = 0;
    // Nouvelles ou modifiées
    for (const key of Object.keys(current)) {
        if (!saved[key] || JSON.stringify(saved[key]) !== JSON.stringify(current[key])) pendingCount++;
    }
    // Supprimées
    for (const key of Object.keys(saved)) {
        if (!current[key]) pendingCount++;
    }
    if (footerDecisionsBadge) footerDecisionsBadge.innerHTML = `<i class="bi bi-pencil-square"></i> ${pendingCount} décisions en cours`;
    
    // Mettre à jour la pagination
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (currentPageEl) currentPageEl.textContent = collationState.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    if (prevBtn) prevBtn.disabled = collationState.currentPage === 1;
    if (nextBtn) nextBtn.disabled = collationState.currentPage === totalPages;
    
    // Afficher les vers de la page courante
    for (let i = startIdx; i < endIdx; i++) {
        const verse = collationState.results.verses[i];
        // Ne PAS afficher les vers entièrement filtrés (toutes les régions filtrées)
        if (verse.is_filtered) {
            continue;
        }
        versesContainer.appendChild(createVerseRow(verse));
    }
}

/**
 * Crée une ligne de vers pour comparaison avec mots cliquables
 */
export function createVerseRow(verse) {
    const row = document.createElement('div');
    row.className = 'verse-row';
    row.dataset.verseNumber = verse.verse_number;
    
    // Compter les décisions de mots pour ce vers
    let wordDecisionCount = 0;
    let variantCount = verse.variant_word_count || 0;
    if (collationState.wordDecisions && verse.word_alignment) {
        verse.word_alignment.forEach((position, posIndex) => {
            if (position.has_variant) {
                const key = `${verse.verse_number}-${posIndex}`;
                if (collationState.wordDecisions[key]) {
                    wordDecisionCount++;
                }
            }
        });
    }
    
    // Classe CSS selon le statut
    if (!verse.has_variants) {
        row.classList.add('has-decision');
    } else if (variantCount > 0 && wordDecisionCount >= variantCount) {
        row.classList.add('all-words-decided');
    } else if (verse.user_decision) {
        row.classList.add('has-decision');
    } else {
        row.classList.add('has-variants');
    }
    
    // Colonne numéro
    const numDiv = document.createElement('div');
    numDiv.className = 'verse-number-cell';
    numDiv.textContent = verse.verse_number;
    row.appendChild(numDiv);
    
    // Colonnes témoins avec mots cliquables
    verse.witnesses.forEach((witness, witIndex) => {
        const witnessDiv = document.createElement('div');
        witnessDiv.className = 'witness-cell';
        witnessDiv.dataset.witnessIndex = witIndex;
        
        // Vérifier si ce témoin est filtré (région non désirée)
        const isFiltered = witness.metadata?.is_filtered || false;
        
        if (isFiltered) {
            // Afficher en grisé avec indication
            witnessDiv.classList.add('filtered-witness');
            witnessDiv.innerHTML = `<em class="text-muted small" title="Région: ${witness.metadata?.region || 'N/A'}">— ${witness.metadata?.region || 'filtré'} —</em>`;
        } else if (witness.missing) {
            witnessDiv.innerHTML = '<em class="text-muted">— manquant —</em>';
        } else if (verse.word_alignment && verse.word_alignment.length > 0) {
            // Afficher mot par mot avec spans cliquables
            verse.word_alignment.forEach((position, posIndex) => {
                const wordData = position.words.find(w => w.witness_index === witIndex);
                
                if (wordData && !wordData.missing && wordData.text) {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'word-token';
                    wordSpan.dataset.posIndex = posIndex;
                    wordSpan.dataset.verseNumber = verse.verse_number;
                    wordSpan.textContent = wordData.text;
                    
                    // Marquer les variantes
                    if (position.has_variant) {
                        const wordKey = `${verse.verse_number}-${posIndex}`;
                        const wordDec = collationState.wordDecisions?.[wordKey];
                        if (wordDec) {
                            if (wordDec.action === 'ignorer') {
                                wordSpan.classList.add('word-ignored');
                                wordSpan.title = wordDec.explication || 'Ignorée';
                            } else {
                                wordSpan.classList.add('word-decided');
                                wordSpan.title = wordDec.explication || 'Conservée';
                            }
                        } else {
                            wordSpan.classList.add('word-variant');
                        }
                        // Click: ouvrir modal seulement pour les variantes
                        wordSpan.addEventListener('click', () => openWordClassifyModal(verse, posIndex));
                    }
                    
                    // Hover: surligner dans les 3 témoins (tous les mots)
                    wordSpan.addEventListener('mouseenter', () => highlightWordPosition(verse.verse_number, posIndex, true));
                    wordSpan.addEventListener('mouseleave', () => highlightWordPosition(verse.verse_number, posIndex, false));
                    
                    witnessDiv.appendChild(wordSpan);
                    witnessDiv.appendChild(document.createTextNode(' '));
                } else if (wordData && wordData.missing) {
                    // Gap - mot manquant
                    const gapSpan = document.createElement('span');
                    gapSpan.className = 'word-gap';
                    gapSpan.dataset.posIndex = posIndex;
                    gapSpan.dataset.verseNumber = verse.verse_number;
                    gapSpan.textContent = '∅';
                    gapSpan.title = 'Mot absent dans ce témoin';
                    
                    // Hover: surligner dans les 3 témoins (tous les mots)
                    gapSpan.addEventListener('mouseenter', () => highlightWordPosition(verse.verse_number, posIndex, true));
                    gapSpan.addEventListener('mouseleave', () => highlightWordPosition(verse.verse_number, posIndex, false));
                    
                    // Click: seulement pour les variantes
                    if (position.has_variant) {
                        gapSpan.classList.add('word-variant');
                        gapSpan.addEventListener('click', () => openWordClassifyModal(verse, posIndex));
                    }
                    
                    witnessDiv.appendChild(gapSpan);
                    witnessDiv.appendChild(document.createTextNode(' '));
                }
            });
        } else {
            // Fallback: texte simple
            witnessDiv.textContent = witness.text || '';
        }
        
        row.appendChild(witnessDiv);
    });
    
    // Colonne action
    const actionDiv = document.createElement('div');
    actionDiv.className = 'actions-cell';
    
    if (verse.has_variants && verse.variant_word_count > 0) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning';
        badge.textContent = `${verse.variant_word_count} var.`;
        badge.title = `${verse.variant_word_count} mot(s) avec variante`;
        actionDiv.appendChild(badge);
        
        // Afficher le nombre de décisions si > 0
        if (wordDecisionCount > 0) {
            const decBadge = document.createElement('span');
            decBadge.className = 'badge bg-success ms-1';
            decBadge.textContent = `${wordDecisionCount} déc.`;
            decBadge.title = `${wordDecisionCount} décision(s) enregistrée(s)`;
            actionDiv.appendChild(decBadge);
        }
    } else {
        actionDiv.innerHTML = '<span class="text-success"><i class="bi bi-check-circle"></i></span>';
    }
    
    row.appendChild(actionDiv);
    return row;
}

/**
 * Surligne un mot dans les 3 témoins (même position)
 */
function highlightWordPosition(verseNumber, posIndex, highlight) {
    const selectors = `[data-verse-number="${verseNumber}"][data-pos-index="${posIndex}"]`;
    document.querySelectorAll(selectors).forEach(el => {
        if (highlight) {
            el.classList.add('word-highlight');
            // Afficher l'index
            el.dataset.showIndex = posIndex;
        } else {
            el.classList.remove('word-highlight');
            delete el.dataset.showIndex;
        }
    });
}

/**
 * Ouvre le modal de classification d'un mot
 */
function openWordClassifyModal(verse, posIndex) {
    import('./decisions.js').then(module => {
        module.openWordClassifyModal(verse, posIndex);
    });
}

/**
 * Navigation vers la page précédente
 */
export function previousPage() {
    if (collationState.currentPage > 1) {
        collationState.currentPage--;
        displayCollationResults();
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Navigation vers la page suivante
 */
export function nextPage() {
    const totalPages = Math.ceil(collationState.results.verses.length / collationState.versesPerPage);
    if (collationState.currentPage < totalPages) {
        collationState.currentPage++;
        displayCollationResults();
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Cette fonction sera dans decisions.js
function openQualifyModal(verse) {
    // Import dynamique pour éviter les dépendances circulaires
    import('./decisions.js').then(module => {
        module.openQualifyModal(verse);
    });
}
