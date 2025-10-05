// js/audio/context.js

let audioCtx;
const irCache = {};

function initAudioContext() {
    if (!audioCtx) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        } catch (e) {
            alert('您的浏览器不支持Web Audio API！');
        }
    }
}

/**
 * Asynchronously loads and decodes an Impulse Response .wav file using the provided context.
 * Caches the decoded buffer to avoid re-fetching for the same context type.
 * @param {AudioContext|OfflineAudioContext} context - The context to use for decoding.
 * @param {string} url - The path to the IR file.
 * @returns {Promise<AudioBuffer|null>} A promise that resolves to the decoded AudioBuffer or null on failure.
 */
async function loadIR(context, url) {
    if (!context) {
        console.error("Context not provided to loadIR. Cannot proceed.");
        return null;
    }
    
    // Cache is checked first
    if (irCache[url] && irCache[url].sampleRate === context.sampleRate) {
        return irCache[url];
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await context.decodeAudioData(arrayBuffer);
        
        // Only cache buffers decoded with the main, live context to avoid issues.
        if (context.constructor.name === 'AudioContext') {
            irCache[url] = decodedBuffer;
        }
        
        return decodedBuffer;
    } catch (e) {
        console.error(`Failed to load IR file: ${url}`, e);
        return null;
    }
}

async function ensureContextRunning() {
    if (!audioCtx) initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

export { audioCtx, initAudioContext, loadIR, ensureContextRunning };