// public/rankColors.js - ランク色の一元定義
const RANK_COLORS = {
    'S': {
        color: '#ffffff',
        bgColor: '#dc2626',
        borderColor: '#b91c1c'
    },
    'A': {
        color: '#ffffff',
        bgColor: '#ea580c',
        borderColor: '#c2410c'
    },
    'B': {
        color: '#ffffff',
        bgColor: '#2563eb',
        borderColor: '#1d4ed8'
    },
    'C': {
        color: '#ffffff',
        bgColor: '#16a34a',
        borderColor: '#15803d'
    }
};

export function getRankColor(rank) {
    const key = (String(rank || '')).replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
    return RANK_COLORS[key] || { color: '#6b7280', bgColor: '#f9fafb', borderColor: '#6b7280' };
}

// グローバルにも公開して既存コードと互換性を保つ
window.RANK_COLORS = RANK_COLORS;
window.getRankColor = getRankColor;
