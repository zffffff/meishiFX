// js/presets.js

import { sfxParams, paramLocks } from './config.js';
import { updateAllUIFromParams } from './ui/render.js';
import { playNewSound } from './ui/actions.js';

const getRandom = (min, max) => Math.random() * (max - min) + min;
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];

const presets = {
    'coin': {
        waveType: { value: 'square' },
        frequency: { min: 800, max: 1600 },
        attackTime: { value: 0.01 },
        sustainTime: { min: 0.08, max: 0.2 },
        decayTime: { min: 0.1, max: 0.3 },
        sustainPunch: { value: 0.5 },
        arpeggioSpeed: { min: 20, max: 30 },
        arpeggioJump: { choices: [4, 7] }, // Perfect 4th or 5th
        lpFilterCutoff: { value: 20000 },
        hpFilterCutoff: { value: 400 },
    },
    'laser': {
        waveType: { choices: ['sawtooth', 'square'] },
        frequency: { min: 600, max: 1200 },
        attackTime: { min: 0.01, max: 0.03 },
        sustainTime: { min: 0.1, max: 0.25 },
        decayTime: { value: 0.1 },
        sustainPunch: { value: 0.6 },
        lpFilterCutoff: { min: 8000, max: 14000 },
        lpFilterResonance: { min: 8, max: 15 },
        lpFilterSweep: { min: -0.8, max: -0.5 },
        hpFilterCutoff: { value: 100 },
        freqSlide: { min: -0.5, max: -0.3 },
    },
    'explosion': {
        waveType: { value: 'noise' },
        frequency: { min: 50, max: 200 }, // Noise pitch
        attackTime: { value: 0.01 },
        sustainTime: { min: 0.3, max: 0.6 },
        decayTime: { min: 0.2, max: 0.5 },
        sustainPunch: { value: 1.5 },
        lpFilterCutoff: { min: 1000, max: 4000 },
        lpFilterSweep: { min: -0.3, max: -0.1 },
        hpFilterCutoff: { value: 20 },
        freqSlide: { min: -0.2, max: -0.1 },
        reverbMix: { min: 0.2, max: 0.5 },
    },
    'powerup': {
        waveType: { choices: ['square', 'sawtooth'] },
        frequency: { value: 220 },
        attackTime: { value: 0.01 },
        sustainTime: { min: 0.2, max: 0.4 },
        decayTime: { value: 0.2 },
        arpeggioSpeed: { min: 15, max: 25 },
        arpeggioJump: { min: 3, max: 7 },
        lpFilterCutoff: { value: 20000 },
        lpFilterSweep: { min: 0.3, max: 0.6 },
    },
    'hit': {
        waveType: { value: 'noise' },
        frequency: { min: 300, max: 800 },
        attackTime: { value: 0.01 },
        sustainTime: { min: 0.05, max: 0.1 },
        decayTime: { min: 0.1, max: 0.15 },
        sustainPunch: { value: 1.2 },
        lpFilterCutoff: { min: 6000, max: 10000 },
        hpFilterCutoff: { min: 200, max: 500 },
    },
    'jump': {
        waveType: { value: 'square' },
        frequency: { min: 300, max: 600 },
        attackTime: { min: 0.01, max: 0.05 },
        sustainTime: { min: 0.1, max: 0.2 },
        decayTime: { min: 0.1, max: 0.15 },
        freqSlide: { min: 0.3, max: 0.5 },
        lpFilterCutoff: { value: 20000 },
    },
    'blip': {
        waveType: { value: 'triangle' },
        frequency: { min: 600, max: 1200 },
        attackTime: { value: 0.01 },
        sustainTime: { value: 0.05 },
        decayTime: { value: 0.05 },
        lpFilterCutoff: { min: 8000, max: 12000 },
    }
};

export function applyPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) {
        console.error(`Preset "${presetName}" not found.`);
        return;
    }

    // Reset all non-locked parameters to default before applying the preset
    // This prevents values from a previous preset from "leaking" through
    // for (const key in sfxParams) {
    //     if (!paramLocks[key]) {
    //         sfxParams[key] = defaultParams[key];
    //     }
    // }

    for (const key in sfxParams) {
        // Obey the lock! If a param is locked, skip it.
        if (paramLocks[key]) {
            continue;
        }

        const rule = preset[key];
        if (rule) { // If the preset defines a rule for this key
            if (rule.hasOwnProperty('value')) {
                sfxParams[key] = rule.value;
            } else if (rule.hasOwnProperty('min') && rule.hasOwnProperty('max')) {
                sfxParams[key] = getRandom(rule.min, rule.max);
            } else if (rule.hasOwnProperty('choices')) {
                sfxParams[key] = choose(rule.choices);
            }
        }
        // If a preset doesn't define a rule for an unlocked parameter,
        // it will retain its current value. This is intentional.
        // To reset fully, the user can click the "Reset" button first.
    }
    
    updateAllUIFromParams();
    playNewSound(sfxParams);
}