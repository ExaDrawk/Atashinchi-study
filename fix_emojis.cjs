const fs = require('fs');
const path = require('path');

const homePagePath = path.join(__dirname, 'public', 'pages', 'homePage.js');
let content = fs.readFileSync(homePagePath, 'utf8');

// Define emoji replacements - mapping the broken text to proper emojis
const emojiMap = {
    // Study records section
    '?? 今日の学習記録': '📚 今日の学習記録',
    '今日の学習記録なし': '📭 今日の学習記録なし',
    '?? モジュール検索': '🔍 モジュール検索',
    '??? フィルタクリア': '🔄 フィルタクリア',
    '?? 目次再生成': '🔥 目次再生成',
    '?? 表示モード': '📊 表示モード',

    // Common emojis in console.log
    '?? ': '📚 ',
    '?? ': '📭 ',
    '??': '📅',
    '??': '✅',
    '?? ': '💡 ',
    '?? ': '📂 ',
    '?? ': '⬇️ ',
    '?? ': '⬆️ ',
    '?? ': '🔄 ',
    '?? ': '🔥 ',
    '?? ': '🔍 ',
    '?? ': '📊 ',
    '?? ': '🎉 ',
    '?? ': '❌ ',
    '?? ': '⚠️ ',
    '?? ': '🚀 ',

    // Button emojis
    '\u003cbutton onclick=\"if(window.openCalendar){window.openCalendar();}else{console.error(\'openCalendar関数が利用できません\');}\" title=\"カレンダーを表示\" class=\"text-xl px-2 py-1 rounded hover:bg-gray-100\"\u003e??\u003c/button\u003e':
        '\u003cbutton onclick=\"if(window.openCalendar){window.openCalendar();}else{console.error(\'openCalendar関数が利用できません\');}\" title=\"カレンダーを表示\" class=\"text-xl px-2 py-1 rounded hover:bg-gray-100\"\u003e📅\u003c/button\u003e',
    '\u003cdiv class=\"text-4xl mb-2\"\u003e??\u003c/div\u003e': '\u003cdiv class=\"text-4xl mb-2\"\u003e📭\u003c/div\u003e',
};

// Replace all occurrences
for (const [broken, fixed] of Object.entries(emojiMap)) {
    content = content.split(broken).join(fixed);
}

// Write back with UTF-8 BOM to ensure proper encoding
const BOM = '\uFEFF';
fs.writeFileSync(homePagePath, BOM + content, 'utf8');

console.log('✅ Emojis have been restored in homePage.js');
