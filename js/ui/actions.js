// js/ui/actions.js

import { UIElements } from './elements.js';
import { sfxParams, defaultParams, paramLocks } from '../config.js';
import { allReverbOptions, addToHistory } from './state.js';
import { updateAllUIFromParams, updateHistoryUI } from './render.js';
import { playSound, stopSound } from '../audio/player.js';

/**
 * A centralized function to handle all sound playback requests.
 * It stops any current sound, updates history, manages UI state, and plays the new sound.
 * @param {object} params The sfxParams to play.
 * @param {boolean} [reorder=true] - Whether to add/move the item in history.
 */
/* MODIFICATION: Removed 'export' keyword to prevent potential circular dependency with presets.js */
async function playNewSound(params, reorder = true) {
    stopSound(); // Force stop any currently playing sound.
    if (reorder) {
        addToHistory(params);
        updateHistoryUI();
    }

    UIElements.playButton.disabled = true;
    UIElements.stopButton.disabled = false;

    const onPlaybackEnd = () => {
        UIElements.playButton.disabled = false;
        UIElements.stopButton.disabled = true;
    };

    try {
        await playSound(params, onPlaybackEnd);
    } catch (error) {
        console.error("Playback failed:", error);
        onPlaybackEnd(); // Ensure UI is reset on error.
    }
}
// Also export it for modules that still need it directly, like events.js
export { playNewSound };


/**
 * Resets all parameters to their default values and updates the UI.
 */
export function resetParams() {
    Object.assign(sfxParams, defaultParams);
    updateAllUIFromParams();
}

/**
 * Assigns random values to all parameters that are not locked.
 */
export function randomizeParams() {
    if (!paramLocks.waveType) sfxParams.waveType = ['square', 'sawtooth', 'triangle', 'sine', 'noise'][Math.floor(Math.random() * 5)];
    if (!paramLocks.frequency) sfxParams.frequency = Math.floor(Math.random() * 1980) + 20;
    if (!paramLocks.attackTime) sfxParams.attackTime = Math.random() * 0.4;
    if (!paramLocks.sustainTime) sfxParams.sustainTime = Math.random() * 0.4;
    if (!paramLocks.decayTime) sfxParams.decayTime = Math.random() * 0.8 + 0.1;
    if (!paramLocks.sustainPunch) sfxParams.sustainPunch = Math.random() * 1.5;
    if (!paramLocks.arpeggioSpeed) sfxParams.arpeggioSpeed = Math.random() > 0.6 ? Math.random() * 30 + 5 : 0;
    if (!paramLocks.arpeggioJump) sfxParams.arpeggioJump = sfxParams.arpeggioSpeed > 0 ? Math.floor(Math.random() * 10) - 5 : 0;
    if (!paramLocks.freqSlide) sfxParams.freqSlide = Math.random() * 2 - 1;
    if (!paramLocks.lpFilterCutoff) sfxParams.lpFilterCutoff = Math.floor(Math.random() * 15000) + 5000;
    if (!paramLocks.lpFilterResonance) sfxParams.lpFilterResonance = Math.random() * 20 + 1;
    if (!paramLocks.lpFilterSweep) sfxParams.lpFilterSweep = Math.random() * 2 - 1;
    if (!paramLocks.hpFilterCutoff) sfxParams.hpFilterCutoff = Math.floor(Math.random() * 2000) + 20;
    if (!paramLocks.hpFilterResonance) sfxParams.hpFilterResonance = Math.random() * 20 + 1;
    if (!paramLocks.hpFilterSweep) sfxParams.hpFilterSweep = Math.random() * 2 - 1;
    if (!paramLocks.vibratoDepth) sfxParams.vibratoDepth = Math.random() > 0.5 ? Math.random() * 50 : 0;
    if (!paramLocks.vibratoSpeed) sfxParams.vibratoSpeed = Math.random() > 0.5 ? Math.random() * 20 : 0;
    if (!paramLocks.phaserFreq) sfxParams.phaserFreq = Math.floor(Math.random() * 7980) + 20;
    if (!paramLocks.phaserOctaves) sfxParams.phaserOctaves = Math.random() > 0.6 ? Math.random() * 5 : 0;
    if (!paramLocks.phaserSpeed) sfxParams.phaserSpeed = sfxParams.phaserOctaves > 0 ? Math.random() * 10 : 0;
    if (!paramLocks.deltaFreqSlide) sfxParams.deltaFreqSlide = Math.random() * 2 - 1;
    if (!paramLocks.distortionType) sfxParams.distortionType = Math.random() > 0.5 ? 'hard' : 'soft';
    if (!paramLocks.distortionAmount) sfxParams.distortionAmount = Math.random();
    if (!paramLocks.reverbType) sfxParams.reverbType = allReverbOptions[Math.floor(Math.random() * allReverbOptions.length)];
    if (!paramLocks.reverbMix) sfxParams.reverbMix = sfxParams.reverbType === 'none' ? 0 : Math.random();
    
    updateAllUIFromParams();
}