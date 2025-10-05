// js/ui/render.js

import { sfxParams } from '../config.js';
import { UIElements } from './elements.js';
import { history, allReverbOptions, toggleFavorite, deleteHistoryItem } from './state.js';
import { playNewSound } from './actions.js'; // Import the new centralized play function

/**
 * Updates the text content of a single parameter's value span.
 * @param {HTMLElement} span The span element to update.
 * @param {string} key The parameter key (e.g., 'frequency').
 * @param {string|number} value The new value.
 */
export function updateSpanText(span, key, value) {
    let text = '';
    if (typeof value !== 'number') {
        span.textContent = value;
        return;
    }
    
    if (key.includes('Time') || key.includes('Mix') || key.includes('arpeggioSpeed') || key.includes('Amount')) {
        text = value.toFixed(2);
    } else if (key.includes('Speed')) {
        text = value.toFixed(1) + ' Hz';
    } else if (key.includes('Freq') || key.includes('Cutoff') ) {
        text = Math.round(value) + ' Hz';
    } else if (key.includes('Octaves') || key.includes('Slide') || key.includes('Punch') || key.includes('Resonance') || key.includes('Sweep')) {
        text = value.toFixed(2);
    } else {
        text = Math.round(value);
    }
    span.textContent = text;
}

/**
 * Updates all UI controls (sliders, selects, spans) to match the current sfxParams object.
 */
export function updateAllUIFromParams() {
    for (const key in sfxParams) {
        const sliderId = key + 'Slider';
        const selectId = key + 'Select';
        const spanId = `${key}ValueSpan`;

        const element = UIElements[sliderId] || UIElements[selectId];
        const span = UIElements[spanId];

        if (element) {
            element.value = sfxParams[key];
        }
        if (span) {
           updateSpanText(span, key, sfxParams[key]);
        }
    }
}

/**
 * Renders the entire history list based on the current state and filter.
 */
export function updateHistoryUI() {
    UIElements.historyList.innerHTML = '';
    
    const showOnlyFavorites = UIElements.filterFavoritesCheckbox.checked;
    const filteredHistory = showOnlyFavorites ? history.filter(item => item.isFavorited) : history;

    filteredHistory.forEach(item => {
        const li = document.createElement('li');
        li.dataset.id = item.id;

        const main = document.createElement('div');
        main.className = 'history-item-main';
        const simplifiedWave = item.params.waveType.substring(0, 4);
        main.textContent = `[${simplifiedWave}] F:${item.params.frequency} A:${item.params.attackTime.toFixed(2)}`;
        main.title = `Click to load and play #${item.id}`;
        
        const actions = document.createElement('div');
        actions.className = 'history-item-actions';

        const favBtn = document.createElement('span');
        favBtn.className = 'history-btn favorite-btn';
        favBtn.textContent = item.isFavorited ? '★' : '☆';
        if (item.isFavorited) {
            favBtn.classList.add('favorited');
        }
        favBtn.title = 'Toggle favorite';
        
        const delBtn = document.createElement('span');
        delBtn.className = 'history-btn delete-btn';
        delBtn.textContent = '×';
        delBtn.title = 'Delete';

        actions.appendChild(favBtn);
        actions.appendChild(delBtn);
        li.appendChild(main);
        li.appendChild(actions);
        UIElements.historyList.appendChild(li);

        // --- Event Listeners for dynamically created elements ---
        main.addEventListener('click', () => {
            Object.assign(sfxParams, item.params);
            updateAllUIFromParams();
            // 根据开关状态决定是否在播放时重新排序
            const shouldReorder = UIElements.reorderOnPlayCheckbox.checked;
            playNewSound(sfxParams, shouldReorder); 
        });
        
        favBtn.addEventListener('click', () => {
            toggleFavorite(item.id);
            updateHistoryUI(); // Re-render the list to show the change
        });

        delBtn.addEventListener('click', () => {
            if (deleteHistoryItem(item.id)) {
                updateHistoryUI(); // If deletion was successful, re-render
            }
        });
    });
}

/**
 * Fetches the irs_list.json and dynamically populates the reverb select dropdown.
 */
export async function populateReverbSelect() {
    try {
        const response = await fetch('irs/irs_list.json');
        if (!response.ok) throw new Error('Network response was not ok.');
        const irs = await response.json();

        const select = UIElements.reverbTypeSelect;
        select.innerHTML = ''; 

        const noneOption = document.createElement('option');
        noneOption.value = 'none';
        noneOption.textContent = '无 (None)';
        select.appendChild(noneOption);
        allReverbOptions.length = 0; // Clear the array before repopulating
        allReverbOptions.push('none');

        const curatedGroup = document.createElement('optgroup');
        curatedGroup.label = '--- 精选 ---';
        irs.curated.forEach(ir => {
            const option = document.createElement('option');
            option.value = ir.path;
            option.textContent = ir.name;
            curatedGroup.appendChild(option);
            allReverbOptions.push(ir.path);
        });
        select.appendChild(curatedGroup);

        const fullListGroup = document.createElement('optgroup');
        fullListGroup.label = '--- 完整列表 ---';
        irs.full_list.forEach(ir => {
            const option = document.createElement('option');
            option.value = ir.path;
            option.textContent = ir.name;
            fullListGroup.appendChild(option);
            if (!allReverbOptions.includes(ir.path)) {
                 allReverbOptions.push(ir.path);
            }
        });
        select.appendChild(fullListGroup);

    } catch (error) {
        console.error('Failed to load or parse irs_list.json:', error);
        UIElements.reverbTypeSelect.innerHTML = '<option value="none">加载列表失败</option>';
    }
}