// pages/homePage.js - ホームページ専用モジュール（タグ複数選択 + ランク絞り込み対応）

import { caseSummaries, caseLoaders } from '../cases/index.js';

// ケースデータを実際に読み込んでランク情報を取得する関数
async function loadCaseWithRank(caseId) {
    try {
        // 最新のcaseLoadersを取得
        const currentLoaders = window.caseLoaders || caseLoaders;
        const currentSummaries = window.caseSummaries || caseSummaries;
        
        const loader = currentLoaders[caseId];
        if (!loader) return null;
        
        const caseModule = await loader();
        const caseData = caseModule.default;
        
        // caseSummariesから基本情報を取得し、ランク情報を追加
        const summary = currentSummaries.find(s => s.id === caseId);
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

    // ★★★ フィルタリング用のデータ準備（動的取得） ★★★
    const currentSummaries = window.caseSummaries || caseSummaries;
    const allCategories = [...new Set(currentSummaries.map(c => c.category))];
    const allTags = [...new Set(currentSummaries.flatMap(c => c.tags || []))];    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- ★★★ ヘッダー（ログアウトボタン付き） ★★★ -->
        <div class="flex justify-between items-center mb-8">
            <div class="text-center flex-1">
                <h1 class="text-4xl md:text-5xl font-extrabold text-yellow-800">法律学習アプリ</h1>
                <h2 class="text-5xl md:text-7xl font-extrabold text-yellow-600 tracking-wider">『あたしンちの世界へGO！』</h2>
            </div>
            <div class="flex flex-col items-end space-y-2">
                <div class="text-sm text-gray-600" id="user-info">
                    ログイン中...
                </div>
                <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    ログアウト
                </button>
            </div>
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
            </div>            <div class="text-center">
                <button id="clear-filters" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2">🗑️ フィルタクリア</button>
                <button id="regenerate-index" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mr-2">🔄 目次再生成</button>
                <span id="filter-results" class="text-sm text-gray-600"></span>
            </div>
        </div>
        
        <!-- ★★★ 目次再生成の状況表示エリア ★★★ -->
        <div id="regeneration-status" class="hidden bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-blue-700" id="regeneration-message">目次ファイルを再生成中...</p>
                </div>
            </div>
        </div>
        
        <!-- ★★★ モジュール表示エリア ★★★ -->
        <div id="modules-container" class="p-4">
            <!-- ここに動的にモジュールが表示される -->
        </div>
    `;

    // フィルタリング機能を初期化
    initializeFiltering();
    
    // ★★★ ログアウト機能の初期化 ★★★
    initializeLogout();

    // 初期表示
    renderFilteredModules();
}

function initializeFiltering() {
    const categoryFilter = document.getElementById('category-filter');
    const clearFilters = document.getElementById('clear-filters');
    const regenerateIndex = document.getElementById('regenerate-index');

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

    // 目次再生成ボタン
    regenerateIndex.addEventListener('click', async function() {
        await handleIndexRegeneration();
    });

    // 初期タグフィルタとランクフィルタを生成
    updateRankFilter();
    updateTagFilter();
}

function updateTagFilter() {
    const categoryFilter = document.getElementById('category-filter');
    const tagFilterContainer = document.getElementById('tag-filter-container');
    const selectedCategory = categoryFilter.value;

    // 最新のcaseSummariesを取得
    const currentSummaries = window.caseSummaries || caseSummaries;

    // 選択されたカテゴリに基づいてタグを絞り込み
    let availableTags = [];
    if (selectedCategory) {
        const filteredCases = currentSummaries.filter(c => c.category === selectedCategory);
        availableTags = [...new Set(filteredCases.flatMap(c => c.tags || []))];
    } else {
        availableTags = [...new Set(currentSummaries.flatMap(c => c.tags || []))];
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
        // 最新のcaseSummariesを取得（再生成後の場合はwindowから）
        const currentSummaries = window.caseSummaries || caseSummaries;
        
        // 全ケースのランク情報を読み込み
        const allCasesWithRank = await Promise.all(
            currentSummaries.map(async (summary) => {
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

/**
 * 目次ファイルの再生成を処理する関数
 */
async function handleIndexRegeneration() {
    const statusDiv = document.getElementById('regeneration-status');
    const messageP = document.getElementById('regeneration-message');
    const regenerateBtn = document.getElementById('regenerate-index');
    
    // ローディング状態を表示
    statusDiv.classList.remove('hidden');
    regenerateBtn.disabled = true;
    regenerateBtn.innerHTML = '🔄 処理中...';
    messageP.textContent = '目次ファイルを再生成中...';
    
    try {
        // サーバーAPIを呼び出し
        const response = await fetch('/api/regenerate-case-index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageP.textContent = `✅ 目次再生成完了！ (${result.casesCount}件のケースを処理)`;
            
            // 目次ファイルを動的に再読み込み
            await reloadCaseIndex();
            
            // フィルターとモジュール表示を更新
            updateFiltersAfterRegeneration();
            renderFilteredModules();
            
            // 3秒後に成功メッセージを非表示
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 3000);
            
        } else {
            messageP.textContent = `❌ エラー: ${result.error}`;
            statusDiv.className = 'bg-red-50 border-l-4 border-red-400 p-4 mb-4';
        }
        
    } catch (error) {
        console.error('目次再生成エラー:', error);
        messageP.textContent = `❌ 通信エラー: ${error.message}`;
        statusDiv.className = 'bg-red-50 border-l-4 border-red-400 p-4 mb-4';
    } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = '🔄 目次再生成';
    }
}

/**
 * 目次ファイルを動的に再読み込みする関数
 */
async function reloadCaseIndex() {
    try {
        // モジュールキャッシュをクリアするためにタイムスタンプを付与
        const timestamp = Date.now();
        const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
        
        // グローバルな参照を更新（危険だが必要）
        window.caseSummaries = indexModule.caseSummaries;
        window.caseLoaders = indexModule.caseLoaders;
        
        console.log(`🔄 目次ファイル再読み込み完了 (${indexModule.caseSummaries.length}件)`);
        
    } catch (error) {
        console.error('目次ファイル再読み込みエラー:', error);
        throw error;
    }
}

/**
 * 目次再生成後にフィルター選択肢を更新する関数
 */
function updateFiltersAfterRegeneration() {
    // 新しいcaseSummariesを使用してフィルター選択肢を再構築
    const summaries = window.caseSummaries || caseSummaries;
    
    // カテゴリフィルターを更新
    const categoryFilter = document.getElementById('category-filter');
    const currentCategory = categoryFilter.value;
    const allCategories = [...new Set(summaries.map(c => c.category))];
    
    categoryFilter.innerHTML = `
        <option value="">すべてのフォルダ</option>
        ${allCategories.map(cat => `<option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
    `;
    
    // ランクフィルターとタグフィルターを更新
    updateRankFilter();
    updateTagFilter();
    
    console.log('🔄 フィルター選択肢を更新しました');
}

// ★★★ ログアウト機能の初期化 ★★★
function initializeLogout() {
    // ユーザー情報の取得と表示
    fetchUserInfo();
    
    // ログアウトボタンのイベントリスナー
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * ユーザー情報を取得してヘッダーに表示
 */
async function fetchUserInfo() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        const userInfoElement = document.getElementById('user-info');
        if (data.authenticated && userInfoElement) {
            const loginTime = new Date(data.loginTime).toLocaleString('ja-JP');
            userInfoElement.innerHTML = `
                <div class="text-right">
                    <div class="font-semibold text-gray-700">👤 ${data.username}</div>
                    <div class="text-xs text-gray-500">ログイン: ${loginTime}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
    }
}

/**
 * ログアウト処理
 */
async function handleLogout() {
    if (!confirm('ログアウトしますか？')) {
        return;
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    const originalText = logoutBtn.innerHTML;
    
    try {
        // ボタンを無効化
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = `
            <svg class="animate-spin w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ログアウト中...
        `;
        
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // セッションクリア
            sessionStorage.clear();
            localStorage.clear();
            
            // ログインページへリダイレクト
            window.location.href = '/login.html';
        } else {
            throw new Error('ログアウトに失敗しました');
        }
        
    } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウト処理中にエラーが発生しました。');
        
        // ボタンを復元
        logoutBtn.disabled = false;
        logoutBtn.innerHTML = originalText;
    }
}
