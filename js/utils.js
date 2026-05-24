// utils.js
const FAVORITES_KEY = 'motosekai_favorites';

function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
}

function toggleFavorite(resourceId) {
    let favorites = getFavorites();
    if (favorites.includes(resourceId)) {
        favorites = favorites.filter(id => id !== resourceId);
    } else {
        favorites.push(resourceId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites.includes(resourceId);
}

function isFavorite(resourceId) {
    return getFavorites().includes(resourceId);
}

function copyToClipboard(text, message = "已复制！") {
    if (!text) return alert("没有内容可复制");
    navigator.clipboard.writeText(text).then(() => alert(message));
}