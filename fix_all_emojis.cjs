const fs = require('fs');
const path = require('path');

const homePagePath = path.join(__dirname, 'public', 'pages', 'homePage.js');
let content = fs.readFileSync(homePagePath, 'utf8');

// Remove BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}

console.log('Original file size:', content.length);
console.log('Searching for ?? patterns...');

// Count occurrences
const questionMarks = content.match(/\?\?/g);
console.log('Found ?? patterns:', questionMarks ? questionMarks.length : 0);

// Replace patterns with proper emojis - be very specific with context
content = content.replace(/console\.log\('(\?\?) 今日の学習記録/g, "console.log('📚 今日の学習記録");
content = content.replace(/console\.log\('(\?\?) 今日の学習記録/g, "console.log('📭 今日の学習記録");
content = content.replace(/<h3 class="text-lg font-bold text-gray-800">(\?\?) 今日の学習記録/g, '<h3 class="text-lg font-bold text-gray-800">📚 今日の学習記録');
content = content.replace(/<h3 class="text-lg font-bold text-gray-800 mb-4">(\?\?) 今日の学習記録/g, '<h3 class="text-lg font-bold text-gray-800 mb-4">📚 今日の学習記録');

// Replace all instances of ?? for calendar button
content = content.replace(/class="text-xl px-2 py-1 rounded hover:bg-gray-100">(\?\?)<\/button>/g, 'class="text-xl px-2 py-1 rounded hover:bg-gray-100">📅</button>');

// Replace empty state icon
content = content.replace(/<div class="text-4xl mb-2">(\?\?)<\/div>/g, '<div class="text-4xl mb-2">📭</div>');

// Module search section
content = content.replace(/(\?\?) モジュール検索/g, '🔍 モジュール検索');
content = content.replace(/(\?\?\?) フィルタクリア/g, '🔄 フィルタクリア');
content = content.replace(/(\?\?) 目次再生成/g, '🔥 目次再生成');
content = content.replace(/(\?\?) 表示モード/g, '📊 表示モード');

// Category and folder labels
content = content.replace(/(\?\?) 所属フォルダ/g, '📂 所属フォルダ');
content = content.replace(/(\?\?) サブフォルダ/g, '📁 サブフォルダ');
content = content.replace(/(\?\?) 選び直す:/g, '🎯 選び直す:');

// Console log emojis
content = content.replace(/console\.log\('(\?\?) /g, "console.log('📚 ");
content = content.replace(/console\.log\('(\?\?) /g, "console.log('💡 ");
content = content.replace(/console\.log\('(\?\?) /g, "console.log('📂 ");
content = content.replace(/console\.log\('(\?\?) /g, "console.log('✅ ");
content = content.replace(/console\.log\('(\?\?) /g, "console.log('🔧 ");
content = content.replace(/console.log\('(\?\?) /g, "console.log('🎉 ");
content = content.replace(/console\.error\('(\?\?) /g, "console.error('❌ ");
content = content.replace(/console\.warn\('(\?\?) /g, "console.warn('⚠️ ");

// Arrow emojis
content = content.replace(/textContent = window\.currentSortOrder === 'asc' \? '(\?\?)' : '(\?\?)'/g, "textContent = window.currentSortOrder === 'asc' ? '⬆️' : '⬇️'");
content = content.replace(/'(\?\?)' : '(\?\?)'/g, "'⬆️' : '⬇️'");

console.log('Replacements completed');

// Write back WITHOUT BOM
fs.writeFileSync(homePagePath, content, { encoding: 'utf8' });

console.log('✅ File saved successfully');
console.log('New file size:', content.length);
