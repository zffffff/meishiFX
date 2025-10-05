// js/main.js

import { UIElements } from './ui/elements.js';
import { sfxParams } from './config.js';
import { handleLoadJson, handleSaveJson, handleExportWav } from './file.js';
import { loadHistoryFromStorage, addToHistory } from './ui/state.js';
import { populateReverbSelect, updateAllUIFromParams, updateHistoryUI } from './ui/render.js';
import { bindEventListeners } from './ui/events.js';

/**
 * Main setup function for the entire application.
 */
async function main() {
    // 1. Asynchronously populate the reverb dropdown from the JSON file.
    await populateReverbSelect();

    // 2. Load history from localStorage before doing anything else.
    loadHistoryFromStorage();

    // 3. Bind all event listeners to the DOM elements.
    bindEventListeners();

    // 4. Set the initial state of the UI from the default parameters.
    updateAllUIFromParams();

    // 5. Render the history list with the loaded data.
    updateHistoryUI();

    // 6. Setup the handler for loading JSON config files.
    handleLoadJson(UIElements.loadJsonInput, (loadedParams) => {
        Object.assign(sfxParams, loadedParams);
        updateAllUIFromParams();
        addToHistory(sfxParams);
        updateHistoryUI(); // After loading from JSON, update UI
    });

    // 7. Initially disable the stop button, as nothing is playing.
    UIElements.stopButton.disabled = true;
}

// Start the application once the document is fully loaded.
document.addEventListener('DOMContentLoaded', main);