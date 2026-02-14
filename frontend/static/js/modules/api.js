/**
 * Module centralisé pour tous les appels API
 */

/**
 * Gère les erreurs HTTP de manière uniforme
 */
async function handleResponse(response) {
    if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // Si le JSON parsing échoue, utiliser le message par défaut
        }
        console.error('Erreur HTTP:', response.status, errorMessage);
        throw new Error(errorMessage);
    }
    return response.json();
}

/**
 * Gère les erreurs de connexion
 */
function handleFetchError(error) {
    console.error('Erreur API:', error);
    let errorMessage = 'Erreur de connexion au serveur';
    if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur Flask est en cours d\'exécution sur le port 5001.';
    }
    throw new Error(errorMessage);
}

// === API WORKS ===

export async function fetchWorks() {
    try {
        const response = await fetch('/api/works');
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function fetchWorkChapters(workId) {
    try {
        const response = await fetch(`/api/works/${workId}/chapters`);
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function createWork(workData) {
    try {
        const response = await fetch('/api/works', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workData)
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function updateWork(workId, workData) {
    try {
        const response = await fetch(`/api/works/${workId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workData)
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function deleteWork(workId) {
    try {
        const response = await fetch(`/api/works/${workId}`, {
            method: 'DELETE'
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

// === API WITNESSES ===

export async function fetchWitnesses(workId) {
    try {
        const response = await fetch(`/api/works/${workId}/witnesses`);
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function createWitness(workId, formData) {
    try {
        const response = await fetch(`/api/works/${workId}/witnesses`, {
            method: 'POST',
            body: formData
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function updateWitness(workId, witnessId, witnessData) {
    try {
        const response = await fetch(`/api/works/${workId}/witnesses/${witnessId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(witnessData)
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function deleteWitness(workId, witnessId) {
    try {
        const response = await fetch(`/api/works/${workId}/witnesses/${witnessId}`, {
            method: 'DELETE'
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

// === API COLLATION ===

export async function performCollation(workId, witnessIds, chapterIndex) {
    try {
        const response = await fetch('/api/collate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                work_id: workId,
                witness_ids: witnessIds,
                chapter_index: parseInt(chapterIndex)
            })
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

// === API DECISIONS ===

export async function saveDecision(workId, chapterIndex, verseNumber, decision) {
    try {
        const response = await fetch('/api/decisions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                work_id: workId,
                chapter_index: parseInt(chapterIndex),
                verse_number: verseNumber,
                ...decision
            })
        });
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}

export async function deleteDecision(workId, chapterIndex, verseNumber) {
    try {
        const response = await fetch(
            `/api/decisions/${workId}/${chapterIndex}/${verseNumber}`,
            { method: 'DELETE' }
        );
        return await handleResponse(response);
    } catch (error) {
        handleFetchError(error);
    }
}
