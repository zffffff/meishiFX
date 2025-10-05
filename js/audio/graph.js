// js/audio/graph.js

import { loadIR } from './context.js';

// ======================= 修改点 1: 创建一个可复用的噪声Buffer =======================
let noiseBuffer = null;
function createNoiseBuffer(context) {
    if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) {
        return noiseBuffer;
    }
    const bufferSize = context.sampleRate * 2; // 2 seconds of noise
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise
    }
    noiseBuffer = buffer;
    return noiseBuffer;
}
// ==============================================================================


/**
 * Creates the entire audio node graph for a sound.
 * @param {AudioContext|OfflineAudioContext} context The context to create nodes in.
 * @param {object} params The sfxParams object with all sound parameters.
 * @returns {Promise<object>} A promise that resolves to an object containing key nodes.
 */
export async function createAudioGraph(context, params) {
    const now = context.currentTime;
    
    // ======================= 修改点 2: 统一音源变量 =======================
    let soundSource; 
    if (params.waveType === 'noise') {
        const noiseNode = context.createBufferSource();
        noiseNode.buffer = createNoiseBuffer(context);
        noiseNode.loop = true;
        soundSource = noiseNode;
    } else {
        const oscillator = context.createOscillator();
        oscillator.type = params.waveType;
        oscillator.frequency.setValueAtTime(params.frequency, now);
        soundSource = oscillator;
    }
    // ==============================================================================

    const gainNode = context.createGain();
    const lpFilter = context.createBiquadFilter();
    const hpFilter = context.createBiquadFilter();
    const distortionNode = context.createWaveShaper();
    const phaser = context.createBiquadFilter();
    const lfoPhaser = context.createOscillator();
    const lfoGainPhaser = context.createGain();
    const vibratoLFO = context.createOscillator();
    const vibratoGain = context.createGain();
    const convolver = context.createConvolver();
    const dryGain = context.createGain();
    const wetGain = context.createGain();
    const masterGain = context.createGain();

    const peakVolume = 0.7;
    const totalDuration = params.attackTime + params.sustainTime + params.decayTime;

    // --- Frequency Automation Logic (Only for Oscillators) ---
    // ======================= 修改点 3: 仅在非噪声时处理频率 =======================
    if (soundSource.frequency) { 
        if (totalDuration > 0) {
            const startFreq = params.frequency;
            const targetFreq = startFreq * (1 + params.freqSlide * 3);
            if (params.arpeggioSpeed > 0) {
                const interval = 1 / params.arpeggioSpeed;
                let arpTime = now;
                let step = 0;
                while (arpTime < now + totalDuration) {
                    const progress = Math.min(1, (arpTime - now) / totalDuration);
                    const baseSweepFreq = startFreq + (targetFreq - startFreq) * progress;
                    const jumpMultiplier = Math.pow(2, (params.arpeggioJump * step) / 12);
                    const finalFreq = baseSweepFreq * jumpMultiplier;
                    const clampedFreq = Math.max(0, Math.min(context.sampleRate / 2, finalFreq));
                    soundSource.frequency.setValueAtTime(clampedFreq, arpTime);
                    step++;
                    arpTime += interval;
                }
            } else {
                soundSource.frequency.linearRampToValueAtTime(targetFreq, now + totalDuration);
            }
        }
        vibratoGain.connect(soundSource.frequency);
    }
    // ==============================================================================

    vibratoLFO.type = 'sine';
    vibratoLFO.frequency.value = params.vibratoSpeed;
    vibratoGain.gain.value = params.vibratoDepth;
    
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(params.lpFilterCutoff, now);
    lpFilter.Q.value = params.lpFilterResonance;
    // 新增: 低通滤波器扫频
    let lpTargetFreq = params.lpFilterCutoff + params.lpFilterSweep * 20000;
    lpTargetFreq = Math.max(20, Math.min(context.sampleRate / 2, lpTargetFreq)); // Clamp the value
    lpFilter.frequency.linearRampToValueAtTime(lpTargetFreq, now + totalDuration);

    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(params.hpFilterCutoff, now);
    hpFilter.Q.value = params.hpFilterResonance;
    // 新增: 高通滤波器扫频
    let hpTargetFreq = params.hpFilterCutoff + params.hpFilterSweep * 20000;
    hpTargetFreq = Math.max(20, Math.min(context.sampleRate / 2, hpTargetFreq)); // Clamp the value
    hpFilter.frequency.linearRampToValueAtTime(hpTargetFreq, now + totalDuration);

    phaser.type = 'allpass';
    phaser.frequency.setValueAtTime(params.phaserFreq, now);
    phaser.Q.value = 5; 
    lfoPhaser.type = 'sine';
    lfoPhaser.frequency.value = params.phaserSpeed;
    const sweepRange = params.phaserFreq * (Math.pow(2, params.phaserOctaves) - 1);
    lfoGainPhaser.gain.value = sweepRange;
    
    // --- Distortion Curve ---
    if (params.distortionAmount > 0) {
        const k = params.distortionAmount * 100; // Intensity
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        if (params.distortionType === 'soft') {
            // Soft clipping (tanh)
            for (let i = 0; i < n_samples; ++i) {
                const x = i * 2 / n_samples - 1;
                curve[i] = Math.tanh(x * k / 10);
            }
        } else { // 'hard'
            // Hard clipping
            for (let i = 0; i < n_samples; ++i) {
                const x = i * 2 / n_samples - 1;
                const threshold = 1 - params.distortionAmount;
                curve[i] = Math.max(-threshold, Math.min(threshold, x));
            }
        }
        distortionNode.curve = curve;
    }

    // --- Envelope ---
    const attackEndTime = now + params.attackTime;
    const sustainEndTime = attackEndTime + params.sustainTime;
    const decayEndTime = sustainEndTime + params.decayTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakVolume, attackEndTime);
    
    // 新增: Sustain Punch 逻辑
    if (params.sustainPunch > 0 && params.sustainTime > 0.05) {
        const punchPeakTime = attackEndTime + 0.05;
        gainNode.gain.linearRampToValueAtTime(peakVolume * (1 + params.sustainPunch), punchPeakTime);
        gainNode.gain.linearRampToValueAtTime(peakVolume, sustainEndTime);
    } else {
        gainNode.gain.setValueAtTime(peakVolume, sustainEndTime); 
    }
    gainNode.gain.exponentialRampToValueAtTime(0.0001, decayEndTime);

    // Reverb
    if (params.reverbType !== 'none' && params.reverbMix > 0) {
        const irBuffer = await loadIR(context, params.reverbType);
        if (irBuffer) {
            if (irBuffer.numberOfChannels !== 1 && irBuffer.numberOfChannels !== 2 && irBuffer.numberOfChannels !== 4) {
                console.warn(`Incompatible IR channels: ${params.reverbType}. It has ${irBuffer.numberOfChannels} channels. Skipping reverb.`);
                wetGain.gain.setValueAtTime(0, now);
                dryGain.gain.setValueAtTime(1, now);
            } else {
                convolver.buffer = irBuffer;
                wetGain.gain.setValueAtTime(params.reverbMix, now);
                dryGain.gain.setValueAtTime(1 - params.reverbMix, now);
            }
        } else { 
            wetGain.gain.setValueAtTime(0, now);
            dryGain.gain.setValueAtTime(1, now);
        }
    } else { 
        wetGain.gain.setValueAtTime(0, now);
        dryGain.gain.setValueAtTime(1, now);
    }

    // --- Connect Node Chain ---
    vibratoLFO.connect(vibratoGain);
    lfoPhaser.connect(lfoGainPhaser);
    lfoGainPhaser.connect(phaser.frequency);
    
    soundSource.connect(lpFilter); // 修改点 4
    lpFilter.connect(hpFilter);
    hpFilter.connect(phaser);
    phaser.connect(distortionNode);
    distortionNode.connect(gainNode);
    gainNode.connect(dryGain);
    gainNode.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(masterGain);
    wetGain.connect(masterGain);
    masterGain.connect(context.destination);

    // ======================= 修改点 5: 返回统一的音源 =======================
    return { soundSource, vibratoLFO, lfoPhaser, totalDuration, masterGain, peakVolume };
    // ==============================================================================
}