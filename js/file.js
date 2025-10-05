// js/file.js
import { renderToWavBlob } from './audio/player.js';

// --- Helper function to trigger download ---
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Export Functions ---

export async function handleExportWav(params) {
    try {
        const blob = await renderToWavBlob(params);
        if (blob) {
            downloadBlob(blob, `meishi_sfx_${Date.now()}.wav`);
        }
    } catch (error) {
        console.error("Failed to export WAV:", error);
        alert("导出WAV失败！请查看控制台获取更多信息。");
    }
}

export function handleSaveJson(params) {
    const jsonString = JSON.stringify(params, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, `meishi_sfx_config_${Date.now()}.json`);
}

export function handleLoadJson(fileInputElement, onJsonLoaded) {
    fileInputElement.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedParams = JSON.parse(e.target.result);
                onJsonLoaded(loadedParams);
            } catch (error) {
                console.error("Failed to parse JSON:", error);
                alert("加载配置失败，文件可能已损坏或格式不正确。");
            }
        };
        reader.readAsText(file);
        // Reset the input so the same file can be loaded again
        fileInputElement.value = '';
    });
}