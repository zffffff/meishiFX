// js/config.js

export const sfxParams = {
    // Waveform
    waveType: 'square',
    frequency: 440,
    // Envelope
    attackTime: 0.02,
    sustainTime: 0.2,
    decayTime: 0.3,
    sustainPunch: 0,
    // Arpeggiation
    arpeggioSpeed: 0,
    arpeggioJump: 0,
    // Pitch Sweep
    freqSlide: 0,
    deltaFreqSlide: 0,
    // Filters
    lpFilterCutoff: 20000,
    lpFilterResonance: 1,
    lpFilterSweep: 0,
    hpFilterCutoff: 20,
    hpFilterResonance: 1,
    hpFilterSweep: 0,
    // Phaser
    phaserFreq: 1500,
    phaserOctaves: 0,
    phaserSpeed: 0,
    // Distortion
    distortionAmount: 0,
    distortionType: 'soft',
    // Vibrato
    vibratoDepth: 0,
    vibratoSpeed: 0,
    // Reverb
    reverbType: 'none',
    reverbMix: 0,
};

// Create a deep copy for the reset functionality
export const defaultParams = JSON.parse(JSON.stringify(sfxParams));

// Dynamically create a lock state object for all parameters, initialized to false
export const paramLocks = Object.fromEntries(Object.keys(sfxParams).map(key => [key, false]));