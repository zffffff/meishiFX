// js/audio/player.js

import { audioCtx, ensureContextRunning, loadIR } from './context.js';
import { createAudioGraph } from './graph.js';
import { bufferToWave } from './wav-encoder.js';

let currentlyPlaying = null;

function trimSilence(buffer, threshold = 0.001) {
    const data = buffer.getChannelData(0);
    let lastSample = data.length - 1;
    while (lastSample > 0 && Math.abs(data[lastSample]) < threshold) {
        lastSample--;
    }
    const newLength = Math.min(buffer.length, lastSample + Math.floor(buffer.sampleRate * 0.05));
    if (newLength === 0) return null;

    const newBuffer = audioCtx.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        newBuffer.copyToChannel(buffer.getChannelData(i).slice(0, newLength), i);
    }
    return newBuffer;
}


export function stopSound() {
    if (currentlyPlaying && audioCtx) {
        const now = audioCtx.currentTime;
        // ======================= 修改点 1: 接收 soundSource =======================
        const { masterGain, soundSource, vibratoLFO, lfoPhaser, onEndedCallback, timeoutId } = currentlyPlaying;
        // ========================================================================

        if (timeoutId) clearTimeout(timeoutId);

        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.0, now + 0.05);

        const stopTime = now + 0.05;
        try {
            soundSource.onended = null; // 修改点 2
            soundSource.stop(stopTime); // 修改点 3
            vibratoLFO.stop(stopTime);
            lfoPhaser.stop(stopTime);
        } catch (e) {}

        currentlyPlaying = null;
        if (onEndedCallback) onEndedCallback();
    }
}

export async function playSound(params, onEndedCallback) {
    stopSound();

    await ensureContextRunning();
    if (!audioCtx) {
        if (onEndedCallback) onEndedCallback();
        return;
    }

    let irBuffer = null;
    let reverbTailDuration = 0;
    if (params.reverbType !== 'none' && params.reverbMix > 0) {
        irBuffer = await loadIR(audioCtx, params.reverbType);
        if (irBuffer) {
            reverbTailDuration = irBuffer.duration;
        }
    }

    const graphNodes = await createAudioGraph(audioCtx, params, irBuffer);
    
    // ======================= 修改点 4: 接收 soundSource =======================
    const { soundSource, vibratoLFO, lfoPhaser, totalDuration } = graphNodes;
    // ========================================================================
    
    const actualTotalDuration = totalDuration + reverbTailDuration;
    const timeoutId = setTimeout(() => {
        if (currentlyPlaying === graphNodes) {
            currentlyPlaying = null;
            if (onEndedCallback) {
                onEndedCallback();
            }
        }
    }, actualTotalDuration * 1000);
    
    graphNodes.onEndedCallback = onEndedCallback;
    graphNodes.timeoutId = timeoutId;
    currentlyPlaying = graphNodes;
    
    const now = audioCtx.currentTime;
    vibratoLFO.start(now);
    lfoPhaser.start(now);
    soundSource.start(now); // 修改点 5

    const naturalStopTime = totalDuration > 0 ? now + totalDuration : now + 0.01;
    // BufferSourceNode (我们的噪声) 没有 onended 事件, 所以我们不再设置
    if (soundSource.stop) { // 检查stop方法是否存在
      soundSource.stop(naturalStopTime); // 修改点 6
    }
    vibratoLFO.stop(naturalStopTime);
    lfoPhaser.stop(naturalStopTime);
}

export async function renderToWavBlob(params) {
    const MAX_EXPORT_DURATION = 10;
    
    await ensureContextRunning();
    if (!audioCtx) return Promise.reject(new Error("AudioContext不可用。"));
    const sampleRate = audioCtx.sampleRate;

    const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 1,
        length: sampleRate * MAX_EXPORT_DURATION,
        sampleRate: sampleRate,
    });
    
    // ======================= 修改点 7: 接收 soundSource =======================
    const { soundSource, vibratoLFO, lfoPhaser } = await createAudioGraph(offlineCtx, params);
    // ========================================================================

    vibratoLFO.start(0);
    lfoPhaser.start(0);
    soundSource.start(0); // 修改点 8
    
    const renderedBuffer = await offlineCtx.startRendering();
    const trimmedBuffer = trimSilence(renderedBuffer);
    if (!trimmedBuffer) {
        return Promise.reject(new Error("渲染结果为空，无法导出。"));
    }

    return bufferToWave(trimmedBuffer);
}