// js/ui/events.js

import { UIElements } from './elements.js';
import { sfxParams, paramLocks } from '../config.js';
import { stopSound } from '../audio/player.js';
import { handleExportWav, handleSaveJson } from '../file.js';
import { updateHistoryUI, updateSpanText } from './render.js';
import { resetParams, randomizeParams, playNewSound } from './actions.js';
import { applyPreset } from '../presets.js'; // 导入 applyPreset 函数

/**
 * Binds all event listeners to the UI elements.
 */
export function bindEventListeners() {
    // --- Player Controls ---
    UIElements.playButton.addEventListener('click', () => {
        playNewSound(sfxParams);
    });
    UIElements.stopButton.addEventListener('click', stopSound);


    // --- Core Function Buttons ---
    UIElements.resetButton.addEventListener('click', resetParams);
    UIElements.randomizeButton.addEventListener('click', () => {
        randomizeParams();
        playNewSound(sfxParams);
    });
    // --- File I/O Buttons ---
    UIElements.exportWavButton.addEventListener('click', () => {
        stopSound(); 
        handleExportWav(sfxParams);
    });
    UIElements.saveJsonButton.addEventListener('click', () => handleSaveJson(sfxParams));
    UIElements.loadJsonButton.addEventListener('click', () => UIElements.loadJsonInput.click());


    // --- History Filter ---
    UIElements.filterFavoritesCheckbox.addEventListener('change', updateHistoryUI);
    
    // ===================================================================
    // ======================= 新增: 绑定预设按钮事件 =======================
    // ===================================================================
    const presetButtons = document.querySelectorAll('.preset-button');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const presetName = button.dataset.preset;
            applyPreset(presetName);
        });
    });
    // ===================================================================


    // --- Generic Listener for all sliders and selects ---
    const controls = document.querySelectorAll('.controls-panel select, .controls-panel input[type="range"]');
    controls.forEach(control => {
        control.addEventListener('input', e => {
            const key = e.target.id.replace('Slider', '').replace('Select', '');
            let value = e.target.value;
            
            if (e.target.type === 'range') {
                value = parseFloat(value);
            }

            if (sfxParams.hasOwnProperty(key)) {
                sfxParams[key] = value;
            }
            
            const spanId = `${key}ValueSpan`;
            const span = UIElements[spanId];
           
             if (span) {
                updateSpanText(span, key, value);
            }
        });
    });

    // --- Lock Icon Click Handlers ---
    const lockIcons = document.querySelectorAll('.lock-icon');
    lockIcons.forEach(icon => {
        icon.addEventListener('click', e => {
            const key = e.target.dataset.paramKey;
            if (key && paramLocks.hasOwnProperty(key)) {
                // 1. Toggle the lock state
                paramLocks[key] = !paramLocks[key];
                // 2. Toggle the visual class
                e.target.classList.toggle('locked', paramLocks[key]);
                // 3. Change the icon text
                e.target.textContent = paramLocks[key] ? '🔒' : '🔓';
            }
        });
    });
}