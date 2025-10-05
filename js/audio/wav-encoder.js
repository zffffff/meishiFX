// js/audio/wav-encoder.js

// This module contains a utility function to convert an AudioBuffer into a WAV file Blob.

/**
 * Encodes an AudioBuffer into a WAV file format.
 * @param {AudioBuffer} audioBuffer The audio buffer to encode.
 * @returns {Blob} A Blob object representing the WAV file.
 */
export function bufferToWave(audioBuffer) {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // Helper function to write a 16-bit integer
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    // Helper function to write a 32-bit integer
    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    // Write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved channel data
    for (i = 0; i < numOfChan; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            // Get sample from channel
            sample = channels[i][offset];
            // Clamp sample to -1 to 1
            sample = Math.max(-1, Math.min(1, sample));
            // Convert to 16-bit signed integer
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
}