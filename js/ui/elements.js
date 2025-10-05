// js/ui/elements.js

// This module's single responsibility is to get and export all DOM elements.
export const UIElements = {
    // Function Buttons & History
    playButton: document.getElementById('playButton'),
    stopButton: document.getElementById('stopButton'),
    resetButton: document.getElementById('resetButton'),
    randomizeButton: document.getElementById('randomizeButton'),
    historyList: document.getElementById('historyList'),
    exportWavButton: document.getElementById('exportWavButton'),
    saveJsonButton: document.getElementById('saveJsonButton'),
    loadJsonButton: document.getElementById('loadJsonButton'),
    loadJsonInput: document.getElementById('loadJsonInput'),
    filterFavoritesCheckbox: document.getElementById('filterFavoritesCheckbox'),
    reorderOnPlayCheckbox: document.getElementById('reorderOnPlayCheckbox'),
    
    // Waveform
    waveTypeSelect: document.getElementById('waveTypeSelect'),
    frequencySlider: document.getElementById('frequencySlider'),
    frequencyValueSpan: document.getElementById('frequencyValueSpan'),

    // Envelope
    attackTimeSlider: document.getElementById('attackTimeSlider'),
    attackTimeValueSpan: document.getElementById('attackTimeValueSpan'),
    sustainTimeSlider: document.getElementById('sustainTimeSlider'),
    sustainTimeValueSpan: document.getElementById('sustainTimeValueSpan'),
    decayTimeSlider: document.getElementById('decayTimeSlider'),
    decayTimeValueSpan: document.getElementById('decayTimeValueSpan'),
    sustainPunchSlider: document.getElementById('sustainPunchSlider'),
    sustainPunchValueSpan: document.getElementById('sustainPunchValueSpan'),

    // Arpeggiation
    arpeggioSpeedSlider: document.getElementById('arpeggioSpeedSlider'),
    arpeggioSpeedValueSpan: document.getElementById('arpeggioSpeedValueSpan'),
    arpeggioJumpSlider: document.getElementById('arpeggioJumpSlider'),
    arpeggioJumpValueSpan: document.getElementById('arpeggioJumpValueSpan'),
    
    // Vibrato
    vibratoDepthSlider: document.getElementById('vibratoDepthSlider'),
    vibratoDepthValueSpan: document.getElementById('vibratoDepthValueSpan'),
    vibratoSpeedSlider: document.getElementById('vibratoSpeedSlider'),
    vibratoSpeedValueSpan: document.getElementById('vibratoSpeedValueSpan'),

    // Filters
    lpFilterCutoffSlider: document.getElementById('lpFilterCutoffSlider'),
    lpFilterCutoffValueSpan: document.getElementById('lpFilterCutoffValueSpan'),
    lpFilterResonanceSlider: document.getElementById('lpFilterResonanceSlider'),
    lpFilterResonanceValueSpan: document.getElementById('lpFilterResonanceValueSpan'),
    lpFilterSweepSlider: document.getElementById('lpFilterSweepSlider'),
    lpFilterSweepValueSpan: document.getElementById('lpFilterSweepValueSpan'),
    hpFilterCutoffSlider: document.getElementById('hpFilterCutoffSlider'),
    hpFilterCutoffValueSpan: document.getElementById('hpFilterCutoffValueSpan'),
    hpFilterResonanceSlider: document.getElementById('hpFilterResonanceSlider'),
    hpFilterResonanceValueSpan: document.getElementById('hpFilterResonanceValueSpan'),
    hpFilterSweepSlider: document.getElementById('hpFilterSweepSlider'),
    hpFilterSweepValueSpan: document.getElementById('hpFilterSweepValueSpan'),

    // Phaser
    phaserFreqSlider: document.getElementById('phaserFreqSlider'),
    phaserFreqValueSpan: document.getElementById('phaserFreqValueSpan'),
    phaserOctavesSlider: document.getElementById('phaserOctavesSlider'),
    phaserOctavesValueSpan: document.getElementById('phaserOctavesValueSpan'),
    phaserSpeedSlider: document.getElementById('phaserSpeedSlider'),
    phaserSpeedValueSpan: document.getElementById('phaserSpeedValueSpan'),

    // Distortion
    distortionTypeSelect: document.getElementById('distortionTypeSelect'),
    distortionAmountSlider: document.getElementById('distortionAmountSlider'),
    distortionAmountValueSpan: document.getElementById('distortionAmountValueSpan'),
    
    // Reverb
    reverbTypeSelect: document.getElementById('reverbTypeSelect'),
    reverbMixSlider: document.getElementById('reverbMixSlider'),
    reverbMixValueSpan: document.getElementById('reverbMixValueSpan'),

    // Pitch Sweep
    freqSlideSlider: document.getElementById('freqSlideSlider'),
    freqSlideValueSpan: document.getElementById('freqSlideValueSpan'),
    deltaFreqSlideSlider: document.getElementById('deltaFreqSlideSlider'),
    deltaFreqSlideValueSpan: document.getElementById('deltaFreqSlideValueSpan'),
};