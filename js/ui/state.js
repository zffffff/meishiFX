// js/ui/state.js

// This module manages the state of the UI, primarily the history list.

let history = [];
const MAX_HISTORY = 50;
const HISTORY_STORAGE_KEY = 'meishi-fx-history'; // 定义用于 localStorage 的键
let allReverbOptions = []; // Will be populated by the render module.

/**
 * 将当前的历史记录数组保存到 localStorage。
 */
function saveHistoryToStorage() {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("无法将历史记录保存到 localStorage:", error);
    }
}

/**
 * Adds a new parameter set to the history, handling global deduplication.
 * If the item already exists, it's moved to the top.
 * @param {object} params The sfxParams object to add.
 */
function addToHistory(params) {
    // 1. 性能优化：避免在循环中反复调用 JSON.stringify
    const paramsString = JSON.stringify(params);
    const existingIndex = history.findIndex(item => JSON.stringify(item.params) === paramsString);

    if (existingIndex !== -1) {
        // 如果已存在，则移动到顶部
        const existingItem = history.splice(existingIndex, 1)[0];
        history.unshift(existingItem);
    } else {
        // 如果是新的，则添加到顶部
        const newHistoryItem = {
            id: Date.now(),
            params: JSON.parse(paramsString), // 通过解析字符串实现深拷贝
            isFavorited: false,
        };
        history.unshift(newHistoryItem);
        trimHistory(); // 添加新项后才进行裁剪
    }
    saveHistoryToStorage(); // 每次修改后都保存
}
/**
 * 裁剪历史记录，确保其不超过 MAX_HISTORY，同时保留收藏项。
 */
function trimHistory() {
    if (history.length > MAX_HISTORY) {
        // 2. 逻辑优化：找到所有非收藏项的索引
        const nonFavoritedIndices = history.map((item, index) => item.isFavorited ? -1 : index).filter(index => index !== -1);
        // 从后往前删除多余的非收藏项
        const itemsToRemove = history.length - MAX_HISTORY;
        nonFavoritedIndices.reverse().slice(0, itemsToRemove).forEach(index => history.splice(index, 1));
    }
}

/**
 * Deletes an item from the history array by its ID.
 * @param {number} id The ID of the history item to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
function deleteHistoryItem(id) {
    const indexToRemove = history.findIndex(h => h.id === id);
    if (indexToRemove !== -1) {
        // 3. 职责分离：移除 alert，让UI层决定如何与用户交互
        if (history[indexToRemove].isFavorited) {
            console.warn(`Attempted to delete a favorited item (id: ${id}). Deletion prevented.`);
            return false;
        }
        history.splice(indexToRemove, 1);
        saveHistoryToStorage(); // 每次修改后都保存
        return true;
    }
    return false;
}

/**
 * Toggles the 'isFavorited' status of a history item by its ID.
 * @param {number} id The ID of the history item to toggle.
 */
function toggleFavorite(id) {
    const item = history.find(h => h.id === id);
    if (item) {
        item.isFavorited = !item.isFavorited;
        saveHistoryToStorage(); // 每次修改后都保存
    }
}

/**
 * 从 localStorage 加载历史记录并填充到 state 中。
 */
function loadHistoryFromStorage() {
    try {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory);
            if (Array.isArray(parsedHistory)) {
                // 使用 history.push(...parsedHistory) 来替换内容，同时保持原始数组引用
                history.push(...parsedHistory);
            }
        }
    } catch (error) {
        console.error("无法从 localStorage 加载历史记录:", error);
        localStorage.removeItem(HISTORY_STORAGE_KEY); // 如果数据损坏，则清除
    }
}

// Export the state arrays and the functions that manipulate them.
export {
    history,
    allReverbOptions,
    loadHistoryFromStorage, // 导出新函数
    addToHistory, deleteHistoryItem, toggleFavorite
};