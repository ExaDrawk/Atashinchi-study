/**
 * 法令設定 - 全体で使用する法令の表示設定
 */
const LAW_SETTINGS = {
    '民法': {
        color: 'from-red-500 to-red-700',
        textColor: 'text-white',
        name: '民法',
        shadowColor: 'shadow-red-500/30',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '刑法': {
        color: 'from-blue-600 to-blue-800',
        textColor: 'text-white',
        name: '刑法',
        shadowColor: 'shadow-blue-500/30',
        borderColor: 'border-blue-600',
        bgColor: 'bg-blue-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '憲法': {
        color: 'from-green-600 to-green-800',
        textColor: 'text-white',
        name: '日本国憲法',
        shadowColor: 'shadow-green-500/30',
        borderColor: 'border-green-600',
        bgColor: 'bg-green-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '会社法': {
        color: 'from-purple-600 to-purple-800',
        textColor: 'text-white',
        name: '会社法',
        shadowColor: 'shadow-purple-500/30',
        borderColor: 'border-purple-600',
        bgColor: 'bg-purple-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '商法': {
        color: 'from-orange-600 to-orange-800',
        textColor: 'text-white',
        name: '商法',
        shadowColor: 'shadow-orange-500/30',
        borderColor: 'border-orange-600',
        bgColor: 'bg-orange-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '行政法': {
        color: 'from-teal-600 to-teal-800',
        textColor: 'text-white',
        name: '行政法',
        shadowColor: 'shadow-teal-500/30',
        borderColor: 'border-teal-600',
        bgColor: 'bg-teal-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '労働法': {
        color: 'from-indigo-600 to-indigo-800',
        textColor: 'text-white',
        name: '労働法',
        shadowColor: 'shadow-indigo-500/30',
        borderColor: 'border-indigo-600',
        bgColor: 'bg-indigo-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '手形法': {
        color: 'from-pink-600 to-pink-800',
        textColor: 'text-white',
        name: '手形法',
        shadowColor: 'shadow-pink-500/30',
        borderColor: 'border-pink-600',
        bgColor: 'bg-pink-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '小切手法': {
        color: 'from-cyan-600 to-cyan-800',
        textColor: 'text-white',
        name: '小切手法',
        shadowColor: 'shadow-cyan-500/30',
        borderColor: 'border-cyan-600',
        bgColor: 'bg-cyan-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '信託法': {
        color: 'from-rose-600 to-rose-800',
        textColor: 'text-white',
        name: '信託法',
        shadowColor: 'shadow-rose-500/30',
        borderColor: 'border-rose-600',
        bgColor: 'bg-rose-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '破産法': {
        color: 'from-gray-600 to-gray-800',
        textColor: 'text-white',
        name: '破産法',
        shadowColor: 'shadow-gray-500/30',
        borderColor: 'border-gray-600',
        bgColor: 'bg-gray-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '借地借家法': {
        color: 'from-yellow-600 to-yellow-800',
        textColor: 'text-white',
        name: '借地借家法',
        shadowColor: 'shadow-yellow-500/30',
        borderColor: 'border-yellow-600',
        bgColor: 'bg-yellow-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '不動産登記法': {
        color: 'from-emerald-600 to-emerald-800',
        textColor: 'text-white',
        name: '不動産登記法',
        shadowColor: 'shadow-emerald-500/30',
        borderColor: 'border-emerald-600',
        bgColor: 'bg-emerald-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '著作権法': {
        color: 'from-violet-600 to-violet-800',
        textColor: 'text-white',
        name: '著作権法',
        shadowColor: 'shadow-violet-500/30',
        borderColor: 'border-violet-600',
        bgColor: 'bg-violet-50',
        decorativeStyle: 'font-bold tracking-wide'
    },
    '特許法': {
        color: 'from-lime-600 to-lime-800',
        textColor: 'text-white',
        name: '特許法',
        shadowColor: 'shadow-lime-500/30',
        borderColor: 'border-lime-600',
        bgColor: 'bg-lime-50',
        decorativeStyle: 'font-bold tracking-wide'
    }
};

/**
 * 法令名に対応する設定を取得
 * @param {string} lawName - 法令名
 * @returns {object} 法令設定オブジェクト
 */
function getLawSettings(lawName) {
    // 完全一致を優先
    if (LAW_SETTINGS[lawName]) {
        return LAW_SETTINGS[lawName];
    }
    
    // 部分一致で検索
    for (const [key, settings] of Object.entries(LAW_SETTINGS)) {
        if (lawName.includes(key)) {
            return settings;
        }
    }
    
    // デフォルト設定
    return {
        color: 'from-gray-500 to-gray-600',
        textColor: 'text-white',
        name: lawName || '不明な法令',
        shadowColor: 'shadow-gray-500/30',
        borderColor: 'border-gray-500',
        bgColor: 'bg-gray-50',
        decorativeStyle: 'font-bold tracking-wide'
    };
}

/**
 * 装飾的な法令名表示を生成
 * @param {string} lawName - 法令名
 * @returns {string} 装飾的なHTML
 */
function createDecorativeLawDisplay(lawName) {
    const settings = getLawSettings(lawName);
    
    return `
        <div class="relative">
            <div class="bg-gradient-to-r ${settings.color} ${settings.textColor} px-6 py-3 rounded-xl shadow-lg ${settings.shadowColor} border-2 ${settings.borderColor} transform hover:scale-105 transition-transform duration-200">
                <div class="flex items-center justify-center">
                    <div class="text-center">
                        <div class="${settings.decorativeStyle} text-lg tracking-widest uppercase">
                            ${settings.name}
                        </div>
                        <div class="h-0.5 bg-white/30 rounded-full mt-1"></div>
                    </div>
                </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r ${settings.color} rounded-xl blur-sm opacity-30 -z-10"></div>
        </div>
    `;
}

/**
 * 記事データから法令名を抽出
 * @param {object} article - 記事オブジェクト
 * @returns {string} 法令名
 */
function extractLawName(article) {
    if (!article) return '不明な法令';
    
    // 法令名を取得する優先順位
    const lawNameCandidates = [
        article.lawName,
        article.law,
        article.fullLawName,
        article.lawTitle,
        article.title,
        article.name,
        article.displayText ? article.displayText.split('：')[0] : null,
        article.displayText ? article.displayText.split('（')[0] : null,
        article.displayText ? article.displayText.split(' ')[0] : null,
        article.displayText ? article.displayText.match(/^[^（）\s]+法/)?.[0] : null,
        article.displayText ? article.displayText.match(/^[^（）\s]+憲法/)?.[0] : null
    ];
    
    // 最初の有効な値を返す
    for (const candidate of lawNameCandidates) {
        if (candidate && typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }
    
    // ファイル名から推測
    if (article.filename) {
        const fileBaseName = article.filename.split('-')[0];
        return fileBaseName;
    }
    
    return '不明な法令';
}

export { LAW_SETTINGS, getLawSettings, createDecorativeLawDisplay, extractLawName };

// グローバルに公開（従来コードとの互換性のため）
window.LAW_SETTINGS = LAW_SETTINGS;
window.getLawSettings = getLawSettings;
window.createDecorativeLawDisplay = createDecorativeLawDisplay;
window.extractLawName = extractLawName;
