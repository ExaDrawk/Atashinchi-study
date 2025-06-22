// pages/homePage.js - ホームページ専用モジュール（タグ複数選択 + ランク絞り込み対応）

import { caseSummaries, caseLoaders } from '../modules/index.js';

// ケースデータを実際に読み込んでランク情報を取得する関数
async function loadCaseWithRank(caseId) {
    try {
        const loader = caseLoaders[caseId];
        if (!loader) return null;
        
        const caseModule = await loader();
        const caseData = caseModule.default;
        
        // caseSummariesから基本情報を取得し、ランク情報を追加
        const summary = caseSummaries.find(s => s.id === caseId);
        if (summary) {
            return {
                ...summary,
                rank: caseData.rank || caseData.difficulty || 'C'
            };
        }
        return null;
    } catch (error) {
        console.error(`ケース ${caseId} の読み込みエラー:`, error);
        return null;
    }
}

/**
 * ホーム画面を表示する（タグ複数選択 + ランク絞り込み対応）
 * @param {boolean} updateHistory - URL履歴を更新するかどうか
 */
export function renderHome(updateHistory = true) {
    document.title = 'あたしンちの世界へGO！';
    window.currentCaseData = null;
    
    if (updateHistory) {
        history.pushState({ page: 'home' }, document.title, '#/');
    }

    // ★★★ フィルタリング用のデータ準備 ★★★
    const allCategories = [...new Set(caseSummaries.map(c => c.category))];
    const allTags = [...new Set(caseSummaries.flatMap(c => c.tags || []))];

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-yellow-800">法律学習アプリ</h1>
            <h2 class="text-5xl md:text-7xl font-extrabold text-yellow-600 tracking-wider">『あたしンちの世界へGO！』</h2>
        </div>
        
        <!-- ★★★ フィルタリングパネル（タグ複数選択 + ランク絞り込み対応） ★★★ -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">📂 モジュール検索・絞り込み</h3>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">📁 所属フォルダ</label>
                    <select id="category-filter" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500">
                        <option value="">すべてのフォルダ</option>
                        ${allCategories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">🎖️ ランク（複数選択可能）</label>
                    <div class="border rounded-lg p-3 bg-gray-50" id="rank-filter-container">
                        <!-- ランクチェックボックスが動的に生成される -->
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">🏷️ タグ（複数選択可能）</label>
                    <div class="border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50" id="tag-filter-container">
                        <!-- タグチェックボックスが動的に生成される -->
                    </div>
                </div>
            </div>
            <div class="text-center">
                <button id="clear-filters" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2">🗑️ フィルタクリア</button>
                <span id="filter-results" class="text-sm text-gray-600"></span>
            </div>
        </div>
        
        <!-- ★★★ モジュール表示エリア ★★★ -->
        <div id="modules-container" class="p-4">
            <!-- ここに動的にモジュールが表示される -->
        </div>
    `;

    // フィルタリング機能を初期化
    initializeFiltering();
    
    // 初期表示
    renderFilteredModules();
}

function initializeFiltering() {
    const categoryFilter = document.getElementById('category-filter');
    const clearFilters = document.getElementById('clear-filters');

    // カテゴリフィルタの変更時
    categoryFilter.addEventListener('change', function() {
        updateTagFilter();
        renderFilteredModules();
    });

    // フィルタクリアボタン
    clearFilters.addEventListener('click', function() {
        categoryFilter.value = '';
        document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
        updateTagFilter();
        renderFilteredModules();
    });

    // 初期タグフィルタとランクフィルタを生成
    updateRankFilter();
    updateTagFilter();
}

function updateTagFilter() {
    const categoryFilter = document.getElementById('category-filter');
    const tagFilterContainer = document.getElementById('tag-filter-container');
    const selectedCategory = categoryFilter.value;

    // 選択されたカテゴリに基づいてタグを絞り込み
    let availableTags = [];
    if (selectedCategory) {
        const filteredCases = caseSummaries.filter(c => c.category === selectedCategory);
        availableTags = [...new Set(filteredCases.flatMap(c => c.tags || []))];
    } else {
        availableTags = [...new Set(caseSummaries.flatMap(c => c.tags || []))];
    }

    // タグチェックボックス生成
    if (availableTags.length === 0) {
        tagFilterContainer.innerHTML = '<p class="text-gray-500 text-sm">利用可能なタグがありません</p>';
    } else {
        tagFilterContainer.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${availableTags.map(tag => `
                    <label class="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
                        <input type="checkbox" value="${tag}" class="tag-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700">${tag}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
    // チェックボックスにイベントリスナーを付与
    tagFilterContainer.querySelectorAll('.tag-checkbox').forEach(cb => {
        cb.addEventListener('change', renderFilteredModules);
    });
    renderFilteredModules();
}

function updateRankFilter() {
    const rankFilterContainer = document.getElementById('rank-filter-container');
    
    // 利用可能なランク一覧（S, A, B, C の順序で表示）
    const availableRanks = ['S', 'A', 'B', 'C'];
    
    // ランクチェックボックス生成
    rankFilterContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            ${availableRanks.map(rank => {
                const diffClass = getDifficultyClass(rank);
                return `
                    <label class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input type="checkbox" value="${rank}" class="rank-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="inline-block px-2 py-1 rounded-full text-sm font-bold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}">${rank}</span>
                    </label>
                `;
            }).join('')}
        </div>
    `;
    
    // チェックボックスにイベントリスナーを付与
    rankFilterContainer.querySelectorAll('.rank-checkbox').forEach(cb => {
        cb.addEventListener('change', renderFilteredModules);
    });
}

function getSelectedTags() {
    const checkboxes = document.querySelectorAll('.tag-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedRanks() {
    const checkboxes = document.querySelectorAll('.rank-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getDifficultyClass(difficulty) {
    // 難易度に応じたクラスを返す関数を修正
    // "ランク"文字や空白を除去し、S/A/B/Cのみで判定
    const rank = (difficulty || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
    if (rank === 'S') {
        return { text: 'text-cyan-700', bg: 'bg-cyan-100', border: 'border-cyan-400', display: 'S' };
    } else if (rank === 'A') {
        return { text: 'text-red-700', bg: 'bg-red-100', border: 'border-red-400', display: 'A' };
    } else if (rank === 'B') {
        return { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-400', display: 'B' };
    } else if (rank === 'C') {
        return { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-400', display: 'C' };
    } else {
        return { text: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200', display: '' };
    }
}

async function renderFilteredModules() {
    const categoryFilter = document.getElementById('category-filter');
    const filterResults = document.getElementById('filter-results');
    const modulesContainer = document.getElementById('modules-container');

    const selectedCategory = categoryFilter.value;
    const selectedTags = getSelectedTags();
    const selectedRanks = getSelectedRanks();

    // ローディング表示
    modulesContainer.innerHTML = '<div class="text-center p-12"><div class="loader">読み込み中...</div></div>';

    try {
        // 全ケースのランク情報を読み込み
        const allCasesWithRank = await Promise.all(
            caseSummaries.map(async (summary) => {
                const caseWithRank = await loadCaseWithRank(summary.id);
                return caseWithRank || summary;
            })
        );

        // フィルタリング
        let filteredCases = allCasesWithRank;

        if (selectedCategory) {
            filteredCases = filteredCases.filter(c => c.category === selectedCategory);
        }

        if (selectedTags.length > 0) {
            // AND条件: すべての選択タグを含む場合のみ表示
            filteredCases = filteredCases.filter(c =>
                selectedTags.every(tag => (c.tags || []).includes(tag))
            );
        }

        if (selectedRanks.length > 0) {
            // 選択されたランクに基づいてフィルタリング
            filteredCases = filteredCases.filter(c => {
                const rank = (c.rank || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
                return selectedRanks.includes(rank);
            });
        }

        // 結果表示
        const tagText = selectedTags.length > 0 ? ` (タグ: ${selectedTags.join(', ')})` : '';
        const rankText = selectedRanks.length > 0 ? ` (ランク: ${selectedRanks.join(', ')})` : '';
        filterResults.textContent = `${filteredCases.length}件のモジュールが見つかりました${tagText}${rankText}`;

        // カテゴリごとにグループ化
        const categories = filteredCases.reduce((acc, c) => {
            const categoryName = c.category.charAt(0).toUpperCase() + c.category.slice(1);
            acc[categoryName] = acc[categoryName] || [];
            acc[categoryName].push(c);
            return acc;
        }, {});

        // HTML生成
        if (Object.keys(categories).length === 0) {
            modulesContainer.innerHTML = `
                <div class="text-center p-12">
                    <p class="text-gray-500 text-lg">該当するモジュールが見つかりませんでした</p>
                    <button id="clear-filters-empty" class="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">フィルタをクリア</button>
                </div>
            `;
            
            // 空の結果でのクリアボタン
            document.getElementById('clear-filters-empty').addEventListener('click', function() {
                categoryFilter.value = '';
                document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
                document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
                updateTagFilter();
                renderFilteredModules();
            });
        } else {
            modulesContainer.innerHTML = Object.entries(categories).map(([category, cases]) => `
                <div class="mb-12">
                    <h3 class="text-2xl font-bold border-b-4 border-yellow-400 pb-2 mb-6 capitalize">${category}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${cases.map(c => {
                            // ランク情報を取得
                            const rankValue = c.rank || '';
                            const diffClass = getDifficultyClass(rankValue);
                            return `
                            <div data-case-id="${c.id}" class="case-card bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                                <div class="flex justify-between items-start mb-3">
                                    <span class="inline-block px-4 py-2 rounded-full text-lg font-extrabold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}" style="min-width:2.5em; text-align:center; font-size:1.5rem; letter-spacing:0.1em;">${diffClass.display}</span>
                                    <span class="text-xs text-gray-400">${c.category || ''}</span>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">${c.title}</h3>
                                <p class="text-sm text-gray-500 mb-2">${c.citation}</p>
                                <div class="flex flex-wrap gap-1 mb-2">
                                    ${(c.tags || []).map(tag => {
                                        const isSelected = selectedTags.includes(tag);
                                        return `<span class="text-xs px-2 py-1 rounded ${isSelected ? 'bg-yellow-200 text-yellow-800 font-bold' : 'bg-blue-100 text-blue-800'}">${tag}</span>`;
                                    }).join('')}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        }
        
        // ケースカードのクリックイベントを追加
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', function() {
                const caseId = this.getAttribute('data-case-id');
                if (caseId) {
                    window.location.hash = `#/case/${caseId}`;
                }
            });
        });
    } catch (error) {
        console.error('ケースデータの読み込みエラー:', error);
        modulesContainer.innerHTML = `
            <div class="text-center p-12">
                <p class="text-red-500 text-lg">データの読み込みに失敗しました</p>
                <button onclick="location.reload()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">再読み込み</button>
            </div>
        `;
    }
}
