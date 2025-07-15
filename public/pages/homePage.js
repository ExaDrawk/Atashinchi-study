// pages/homePage.js - ホームページ専用モジュール（タグ複数選択 + ランク絞り込み対応）

import { caseSummaries, caseLoaders } from '../cases/index.js';
import { processBlankFillText, processArticleReferences } from '../articleProcessor.js';

// ★★★ サブフォルダ情報を取得する関数 ★★★
async function getSubfoldersForCategory(category) {
    if (!category) return [];
    
    try {
        // APIエンドポイントを使用してサブフォルダ一覧を取得
        const response = await fetch(`/api/subfolders/${encodeURIComponent(category)}`);
        if (response.ok) {
            const subfolders = await response.json();
            return subfolders.filter(name => name !== '.gitkeep' && name !== 'module_settings.json' && !name.endsWith('.js'));
        }
    } catch (error) {
        console.warn('サブフォルダ情報の取得に失敗:', error);
    }
    
    // フォールバック: caseSummariesから実際のサブフォルダ情報を抽出
    const currentSummaries = window.caseSummaries || caseSummaries;
    const categorySubfolders = currentSummaries
        .filter(c => c.category === category && c.subfolder) // カテゴリが一致し、サブフォルダがあるケース
        .map(c => c.subfolder) // サブフォルダ名を抽出
        .filter((subfolder, index, arr) => arr.indexOf(subfolder) === index); // 重複除去
    
    return categorySubfolders;
}

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
        
        // caseSummariesから基本情報を取得し、ランク情報とQ&Aデータを追加
        const summary = currentSummaries.find(s => s.id === caseId);
        if (summary) {
            return {
                ...summary,
                rank: caseData.rank || caseData.difficulty || 'C',
                questionsAndAnswers: caseData.questionsAndAnswers || []
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
    document.title = 'あたしンちスタディ';
    window.currentCaseData = null;
    
    if (updateHistory) {
        history.pushState({ page: 'home' }, document.title, '#/');
    }

    // ★★★ フィルタリング用のデータ準備（動的取得） ★★★
    const currentSummaries = window.caseSummaries || caseSummaries;
    const allCategories = [...new Set(currentSummaries.map(c => c.category))];
    const allTags = [...new Set(currentSummaries.flatMap(c => c.tags || []))];    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- ★★★ 派手なアニメーション用CSS ★★★ -->
        <style>
            :root {
                --header-margin-top: -10px;
                --header-margin-bottom: -20px;
                --title-margin-bottom: -9px;
                --header-section-margin-bottom: -4px;
                --header-section-margin-top: -10px;
                --logo-width: 500px;
                --logo-height:100px;
                --study-text-size: 7rem;
                --title-text-size-sm: 1.875rem;
                --title-text-size-md: 2.25rem;
            }
            
            @keyframes shimmer {
                0% { background-position: -200px 0; }
                100% { background-position: calc(200px + 100%) 0; }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes rainbow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes glow {
                0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
                50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6); }
                100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
            }
            
            @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); }
                33% { transform: translateY(-5px) rotate(1deg); }
                66% { transform: translateY(-3px) rotate(-1deg); }
                100% { transform: translateY(0px) rotate(0deg); }
            }
            
            @keyframes hiphop-bounce {
                0%, 100% { transform: translateY(0) scaleY(1) scaleX(1); }
                25% { transform: translateY(-15px) scaleY(1.1) scaleX(0.95); }
                50% { transform: translateY(-8px) scaleY(0.9) scaleX(1.05); }
                75% { transform: translateY(-20px) scaleY(1.15) scaleX(0.9); }
            }
            
            @keyframes hiphop-shake {
                0%, 100% { transform: rotate(0deg) translateX(0); }
                10% { transform: rotate(2deg) translateX(2px); }
                20% { transform: rotate(-2deg) translateX(-2px); }
                30% { transform: rotate(1deg) translateX(1px); }
                40% { transform: rotate(-1deg) translateX(-1px); }
                50% { transform: rotate(2deg) translateX(2px); }
                60% { transform: rotate(-2deg) translateX(-2px); }
                70% { transform: rotate(1deg) translateX(1px); }
                80% { transform: rotate(-1deg) translateX(-1px); }
                90% { transform: rotate(0.5deg) translateX(0.5px); }
            }
            
            @keyframes hiphop-spin {
                0% { transform: rotateZ(0deg) scale(1); }
                25% { transform: rotateZ(90deg) scale(1.1); }
                50% { transform: rotateZ(180deg) scale(0.95); }
                75% { transform: rotateZ(270deg) scale(1.05); }
                100% { transform: rotateZ(360deg) scale(1); }
            }
            
            @keyframes title-shimmer {
                0% { background-position: -100% 0; }
                100% { background-position: 100% 0; }
            }
            
            @keyframes title-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
            }
            
            .app-title {
                background: linear-gradient(45deg, #ffd700, #ffed4e, #fff59d, #ffd700, #ffb300, #ffd700);
                background-size: 200% 200%;
                animation: title-shimmer 3s ease-in-out infinite, title-float 2s ease-in-out infinite;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 
                    1px 1px 2px rgba(0, 0, 0, 0.4),
                    0 0 5px rgba(255, 215, 0, 0.3);
                position: relative;
                font-weight: 900;
                filter: contrast(1.2) brightness(1.0);
                transition: all 0.3s ease;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .app-title:hover {
                animation: title-shimmer 1s ease-in-out infinite, title-float 1s ease-in-out infinite, pulse 0.8s ease-in-out infinite;
                filter: contrast(1.3) brightness(1.1) hue-rotate(30deg);
            }
            
            @media (min-width: 768px) {
                .app-title {
                    font-size: var(--title-text-size-md) !important;
                }
            }
            
            .atashinchi-logo {
                width: var(--logo-width);
                height: var(--logo-height);
                animation: hiphop-bounce 2s ease-in-out infinite, hiphop-shake 3s ease-in-out infinite;
                transition: all 0.3s ease;
                filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
            }
            
            .atashinchi-logo:hover {
                animation: hiphop-spin 1s ease-in-out, hiphop-bounce 2s ease-in-out infinite, hiphop-shake 3s ease-in-out infinite;
                filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4)) hue-rotate(180deg);
            }
            
            .folder-badge {
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #a8e6cf, #ff8a80);
                background-size: 400% 400%;
                animation: rainbow 3s ease infinite, glow 2s ease infinite, float 4s ease infinite;
                position: relative;
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.3);
                text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }
            
            .folder-badge::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                animation: shimmer 2s infinite;
            }
            
            .folder-badge:hover {
                animation: rainbow 1s ease infinite, bounce 0.6s ease, glow 2s ease infinite, float 4s ease infinite;
                transform: scale(1.1) !important;
            }
            
            .subfolder-badge {
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe, #43e97b, #38f9d7);
                background-size: 300% 300%;
                animation: rainbow 4s ease infinite, pulse 2s ease infinite, float 6s ease infinite;
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.4);
                text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
            }
            
            .subfolder-badge::after {
                content: '✨';
                position: absolute;
                top: -2px;
                right: -2px;
                font-size: 8px;
                animation: bounce 1s ease infinite;
            }
            
            .subfolder-badge::before {
                content: '';
                position: absolute;
                top: 0;
                left: -50%;
                width: 50%;
                height: 100%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shimmer 3s infinite;
            }
            
            .case-card:hover .folder-badge {
                animation: rainbow 0.5s ease infinite, pulse 0.3s ease infinite, glow 1s ease infinite !important;
            }
            
            .case-card:hover .subfolder-badge {
                animation: rainbow 0.8s ease infinite, bounce 0.4s ease infinite, pulse 0.5s ease infinite !important;
            }
            
            .study-text {
                font-size: var(--study-text-size);
                background: linear-gradient(45deg, #0066ff, #0099ff, #00ccff, #00ffff, #33ffff, #66ffff);
                background-size: 300% 300%;
                animation: rainbow 1.5s ease infinite, glow 1s ease infinite, float 2.5s ease infinite, pulse 1.8s ease infinite;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                position: relative;
                font-family: 'Impact', 'Arial Black', sans-serif;
                letter-spacing: 4px;
                transform: perspective(300px) rotateX(3deg);
                filter: contrast(1.4) brightness(1.1) saturate(1.2);
                font-weight: 900;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .study-text::before {
                content: attr(data-text);
                position: absolute;
                top: 0;
                left: 0;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
                background-size: 400% 400%;
                animation: rainbow 3s ease infinite;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                z-index: -1;
                transform: translate(2px, 2px);
                opacity: 0.7;
            }
            
            .study-text::after {
                content: '✨⭐✨';
                position: absolute;
                top: -20px;
                right: -20px;
                font-size: 24px;
                animation: bounce 1s ease infinite;
            }
        </style>
        
        <!-- ★★★ ヘッダー（ログアウトボタン付き） ★★★ -->
        <div class="flex justify-between items-center" style="margin-top: var(--header-section-margin-top); margin-bottom: var(--header-section-margin-bottom);">
            <div class="text-center flex-1">
                <h1 class="app-title font-extrabold leading-none" style="font-size: var(--title-text-size-sm); margin-bottom: var(--title-margin-bottom);">なんでも学習アプリ</h1>
                <div class="flex items-center justify-center gap-4" style="margin-top: var(--header-margin-top); margin-bottom: var(--header-margin-bottom);">
                    <img src="/images/logo.png" alt="あたしンちロゴ" class="atashinchi-logo object-contain">
                    <div class="study-text-container" style="margin-left: -16px;">
                        <h2 class="study-text font-black tracking-wider" data-text="Study">Study</h2>
                    </div>
                </div>
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
                <button id="show-qa-list-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all">Q&A一覧</button>
                <button id="show-speed-quiz-btn" class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    スピード条文
                </button>
            </div>
        </div>
        
        <!-- ★★★ フィルタリングパネル（タグ複数選択 + ランク絞り込み + サブフォルダ絞り込み対応） ★★★ -->
        <div class="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h3 class="text-lg font-bold text-gray-800 mb-3">📂 モジュール検索・絞り込み</h3>
            <div id="filter-grid" class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">📁 所属フォルダ</label>
                    <select id="category-filter" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500">
                        <option value="">すべてのフォルダ</option>
                        ${allCategories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
                    </select>
                </div>
                <div id="subfolder-filter-container" style="display: none;">
                    <label class="block text-sm font-bold text-gray-700 mb-2">📂 サブフォルダ</label>
                    <select id="subfolder-filter" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500" disabled>
                        <option value="">フォルダを選択してください</option>
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
            </div>            <div class="flex flex-wrap justify-between items-center gap-4">
                <div class="flex gap-2">
                    <button id="clear-filters" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">🗑️ フィルタクリア</button>
                    <button id="regenerate-index" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">🔄 目次再生成</button>
                </div>
                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-700">📊 並び替え:</span>
                        <select id="sort-by" class="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500">
                            <option value="default">デフォルト順</option>
                            <option value="title">タイトル順</option>
                            <option value="rank">ランク順</option>
                            <option value="qa-average">Q&A番号平均順</option>
                        </select>
                    </label>
                    <label class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-700">🔄 順序:</span>
                        <select id="sort-order" class="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500">
                            <option value="asc">昇順</option>
                            <option value="desc">降順</option>
                        </select>
                    </label>
                    <span id="filter-results" class="text-sm text-gray-600"></span>
                </div>
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
        <div id="modules-container" class="p-2">
            <!-- ここに動的にモジュールが表示される -->
        </div>
    `;

    // Q&A/モジュール切り替え状態（保存された設定から復元）
    let showQAListMode = false;
    let showSpeedQuizMode = false;
    
    // 表示モード設定を読み込み
    try {
        const savedModeJSON = localStorage.getItem('atashinchi_display_mode');
        if (savedModeJSON) {
            const savedMode = JSON.parse(savedModeJSON);
            showQAListMode = savedMode.showQAListMode || false;
            showSpeedQuizMode = savedMode.showSpeedQuizMode || false;
            console.log('📺 表示モード設定を復元:', { QAリスト: showQAListMode, スピード条文: showSpeedQuizMode });
        }
    } catch (e) {
        console.error('表示モード設定の読み込みエラー:', e);
    }

    // Q&A/モジュール切り替え用グローバル関数を先に宣言してwindowに登録
    window.renderFilteredModulesOrQAs = function() {
        if (showSpeedQuizMode) {
            renderSpeedQuizSection();
        } else if (showQAListMode) {
            renderFilteredQAs();
        } else {
            renderFilteredModules();
        }
        updateToggleButton(); // 切り替え時にボタンの見た目も更新
        
        // モード情報も保存（QAリストモードかスピード条文モードか）
        try {
            const displayModeSettings = {
                showQAListMode: showQAListMode,
                showSpeedQuizMode: showSpeedQuizMode,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('atashinchi_display_mode', JSON.stringify(displayModeSettings));
        } catch (e) { /* エラー無視 */ }
    };

    // ボタン要素を先に取得
    const qaListBtn = document.getElementById('show-qa-list-btn');
    const speedQuizBtn = document.getElementById('show-speed-quiz-btn');
    
    // Q&A/モジュール切り替えボタン生成
    if (qaListBtn) {
        qaListBtn.style.display = '';
        qaListBtn.onclick = () => {
            showQAListMode = !showQAListMode;
            showSpeedQuizMode = false; // スピード条文モードを無効化
            updateToggleButton();
            renderFilteredModulesOrQAs();
        };
    }
    
    // ★★★ スピード条文ボタンの初期化 ★★★
    if (speedQuizBtn) {
        speedQuizBtn.style.display = '';
        speedQuizBtn.onclick = () => {
            showSpeedQuizMode = !showSpeedQuizMode;
            showQAListMode = false; // Q&Aモードを無効化
            updateToggleButton();
            renderFilteredModulesOrQAs();
        };
    }
    
    // トグルボタンのラベル・色を切り替える関数
    function updateToggleButton() {
        if (!qaListBtn || !speedQuizBtn) return;
        
        if (showSpeedQuizMode) {
            qaListBtn.textContent = 'Q&A一覧';
            qaListBtn.className = 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all';
            speedQuizBtn.textContent = 'モジュール一覧に戻る';
            speedQuizBtn.className = 'bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all';
        } else if (showQAListMode) {
            qaListBtn.textContent = 'モジュール一覧に戻る';
            qaListBtn.className = 'bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all';
            speedQuizBtn.textContent = 'スピード条文';
            speedQuizBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all';
        } else {
            qaListBtn.textContent = 'Q&A一覧';
            qaListBtn.className = 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all';
            speedQuizBtn.textContent = 'スピード条文';
            speedQuizBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all';
        }
    }

    // 初期状態でボタンの見た目を設定（両方のボタンが取得された後）
    updateToggleButton();

    // フィルタリング機能を初期化
    initializeFiltering();
    
    // ★★★ ログアウト機能の初期化 ★★★
    initializeLogout();

    // 初期表示
    renderFilteredModules();
}

function initializeFiltering() {
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    const clearFilters = document.getElementById('clear-filters');
    const regenerateIndex = document.getElementById('regenerate-index');
    const sortBy = document.getElementById('sort-by');
    const sortOrder = document.getElementById('sort-order');

    // カテゴリフィルタの変更時
    categoryFilter.addEventListener('change', async function() {
        updateTagFilter();
        await updateSubfolderFilter(); // サブフォルダフィルタも更新
        renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // サブフォルダフィルタの変更時
    subfolderFilter.addEventListener('change', function() {
        renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // 並び替えの変更時
    sortBy.addEventListener('change', function() {
        renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });
    
    sortOrder.addEventListener('change', function() {
        renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // フィルタクリアボタン
    clearFilters.addEventListener('click', async function() {
        categoryFilter.value = '';
        const subfolderFilter = document.getElementById('subfolder-filter');
        if (subfolderFilter) {
            subfolderFilter.value = '';
        }
        document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
        sortBy.value = 'default';
        sortOrder.value = 'asc';
        updateTagFilter();
        await updateSubfolderFilter(); // サブフォルダフィルタもクリア
        renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存（クリア状態）
    });

    // 目次再生成ボタン
    regenerateIndex.addEventListener('click', async function() {
        await handleIndexRegeneration();
    });

    // 初期タグフィルタとランクフィルタを生成
    updateRankFilter();
    updateTagFilter();
    updateSubfolderFilter(); // サブフォルダフィルタも初期化（非同期で処理される）
    
    // 保存されたフィルター設定を読み込む
    loadFilterSettings();
}

// ★★★ サブフォルダフィルターを更新する関数 ★★★
async function updateSubfolderFilter(triggerRender = true) {
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    const selectedCategory = categoryFilter.value;

    if (!selectedCategory) {
        // カテゴリが選択されていない場合はサブフォルダフィルタを非表示にする
        const subfolderFilterContainer = document.getElementById('subfolder-filter-container');
        const filterGrid = document.getElementById('filter-grid');
        if (subfolderFilterContainer) {
            subfolderFilterContainer.style.display = 'none';
        }
        if (filterGrid) {
            filterGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3'; // 3列に変更
        }
        subfolderFilter.disabled = true;
        subfolderFilter.innerHTML = '<option value="">フォルダを選択してください</option>';
        return;
    }

    // サブフォルダ一覧を取得
    const subfolders = await getSubfoldersForCategory(selectedCategory);
    
    // 保存されたサブフォルダ設定を取得
    let savedSubfolder = '';
    try {
        const savedSettingsJSON = localStorage.getItem('atashinchi_filter_settings');
        if (savedSettingsJSON) {
            const savedSettings = JSON.parse(savedSettingsJSON);
            if (savedSettings.subfolder) {
                savedSubfolder = savedSettings.subfolder;
            }
        }
    } catch (e) { /* エラー無視 */ }

    if (subfolders.length === 0) {
        // サブフォルダがない場合は、サブフォルダフィルタ全体を非表示にする
        const subfolderFilterContainer = document.getElementById('subfolder-filter-container');
        const filterGrid = document.getElementById('filter-grid');
        if (subfolderFilterContainer) {
            subfolderFilterContainer.style.display = 'none';
        }
        if (filterGrid) {
            filterGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3'; // 3列に変更
        }
        subfolderFilter.disabled = true;
        subfolderFilter.innerHTML = '<option value="">サブフォルダなし</option>';
        subfolderFilter.value = ''; // 値をクリア
    } else {
        // サブフォルダがある場合は、サブフォルダフィルタを表示する
        const subfolderFilterContainer = document.getElementById('subfolder-filter-container');
        const filterGrid = document.getElementById('filter-grid');
        if (subfolderFilterContainer) {
            subfolderFilterContainer.style.display = 'block';
        }
        if (filterGrid) {
            filterGrid.className = 'grid grid-cols-1 lg:grid-cols-4 gap-4 mb-3'; // 4列に戻す
        }
        subfolderFilter.disabled = false;
        subfolderFilter.innerHTML = `
            <option value="">すべてのサブフォルダ</option>
            ${subfolders.map(subfolder => `
                <option value="${subfolder}" ${savedSubfolder === subfolder ? 'selected' : ''}>${subfolder}</option>
            `).join('')}
        `;
    }
    
    // 必要に応じてレンダリングを実行
    if (triggerRender) {
        renderFilteredModulesOrQAs();
    }
}

function updateTagFilter(triggerRender = true) {
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

    // 現在のタグフィルター状態を取得（復元用）
    const savedTagsState = {};
    try {
        const savedSettingsJSON = localStorage.getItem('atashinchi_filter_settings');
        if (savedSettingsJSON) {
            const savedSettings = JSON.parse(savedSettingsJSON);
            if (savedSettings.tags) {
                Object.assign(savedTagsState, savedSettings.tags);
            }
        }
    } catch (e) { /* エラー無視 */ }

    // タグチェックボックス生成
    if (availableTags.length === 0) {
        tagFilterContainer.innerHTML = '<p class="text-gray-500 text-sm">利用可能なタグがありません</p>';
    } else {
        tagFilterContainer.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${availableTags.map(tag => `
                    <label class="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
                        <input type="checkbox" value="${tag}" class="tag-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${savedTagsState[tag] ? 'checked' : ''}>
                        <span class="text-sm text-gray-700">${tag}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
    
    // チェックボックスにイベントリスナーを付与
    tagFilterContainer.querySelectorAll('.tag-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            renderFilteredModulesOrQAs();
            saveFilterSettings(); // タグ変更時も設定を保存
        });
    });
    
    // 必要に応じてレンダリングを実行
    if (triggerRender) {
        renderFilteredModulesOrQAs();
    }
}

function updateRankFilter() {
    const rankFilterContainer = document.getElementById('rank-filter-container');
    
    // 利用可能なランク一覧（S, A, B, C の順序で表示）
    const availableRanks = ['S', 'A', 'B', 'C'];
    
    // 保存されたランクフィルター設定を取得
    let savedRanks = [];
    try {
        const savedSettingsJSON = localStorage.getItem('atashinchi_filter_settings');
        if (savedSettingsJSON) {
            const savedSettings = JSON.parse(savedSettingsJSON);
            if (savedSettings.ranks) {
                savedRanks = savedSettings.ranks;
            }
        }
    } catch (e) { /* エラー無視 */ }
    
    // ランクチェックボックス生成
    rankFilterContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            ${availableRanks.map(rank => {
                const diffClass = getDifficultyClass(rank);
                return `
                    <label class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input type="checkbox" value="${rank}" class="rank-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${savedRanks.includes(rank) ? 'checked' : ''}>
                        <span class="inline-block px-2 py-1 rounded-full text-sm font-bold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}">${rank}</span>
                    </label>
                `;
            }).join('')}
        </div>
    `;
    
    // チェックボックスにイベントリスナーを付与
    rankFilterContainer.querySelectorAll('.rank-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            renderFilteredModulesOrQAs();
            saveFilterSettings(); // ランク変更時も設定を保存
        });
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

function getSortSettings() {
    const sortBy = document.getElementById('sort-by');
    const sortOrder = document.getElementById('sort-order');
    return {
        sortBy: sortBy ? sortBy.value : 'default',
        sortOrder: sortOrder ? sortOrder.value : 'asc'
    };
}

function sortCasesInCategory(cases, sortBy, sortOrder) {
    const sortedCases = [...cases];
    
    switch (sortBy) {
        case 'title':
            sortedCases.sort((a, b) => {
                const comparison = a.title.localeCompare(b.title, 'ja');
                return sortOrder === 'desc' ? -comparison : comparison;
            });
            break;
        case 'rank':
            sortedCases.sort((a, b) => {
                const rankOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, '': 0 };
                const rankA = (a.rank || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
                const rankB = (b.rank || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
                const comparison = (rankOrder[rankA] || 0) - (rankOrder[rankB] || 0);
                return sortOrder === 'desc' ? -comparison : comparison;
            });
            break;
        case 'qa-average':
            sortedCases.sort((a, b) => {
                const getQAAverage = (c) => {
                    if (!c.questionsAndAnswers || c.questionsAndAnswers.length === 0) return 0;
                    const ids = c.questionsAndAnswers.map(q => q.id).filter(id => typeof id === 'number');
                    if (ids.length === 0) return 0;
                    return ids.reduce((sum, id) => sum + id, 0) / ids.length;
                };
                const avgA = getQAAverage(a);
                const avgB = getQAAverage(b);
                const comparison = avgA - avgB;
                return sortOrder === 'desc' ? -comparison : comparison;
            });
            break;
        case 'default':
        default:
            // デフォルト順序を維持
            break;
    }
    
    return sortedCases;
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
    const subfolderFilter = document.getElementById('subfolder-filter');
    const filterResults = document.getElementById('filter-results');
    const modulesContainer = document.getElementById('modules-container');

    const selectedCategory = categoryFilter.value;
    const selectedSubfolder = subfolderFilter ? subfolderFilter.value : '';
    const selectedTags = getSelectedTags();
    const selectedRanks = getSelectedRanks();
    const { sortBy, sortOrder } = getSortSettings();

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

        // ★★★ サブフォルダフィルタリングを追加 ★★★
        if (selectedSubfolder) {
            filteredCases = filteredCases.filter(c => {
                // 第一優先: subfolderプロパティを使用
                if (c.subfolder) {
                    return c.subfolder === selectedSubfolder;
                }
                // フォールバック: ケースIDからサブフォルダを推定（例: "民法/1.民法総則/case1" → "1.民法総則"）
                if (c.id && c.id.includes('/')) {
                    const pathParts = c.id.split('/');
                    if (pathParts.length >= 2) {
                        const subfolder = pathParts[1];
                        return subfolder === selectedSubfolder;
                    }
                }
                return false;
            });
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
        const subfolderText = selectedSubfolder ? ` (サブフォルダ: ${selectedSubfolder})` : '';
        const tagText = selectedTags.length > 0 ? ` (タグ: ${selectedTags.join(', ')})` : '';
        const rankText = selectedRanks.length > 0 ? ` (ランク: ${selectedRanks.join(', ')})` : '';
        const sortText = sortBy !== 'default' ? ` (${getSortDisplayName(sortBy)}${sortOrder === 'desc' ? '降順' : '昇順'})` : '';
        filterResults.textContent = `${filteredCases.length}件のモジュールが見つかりました${subfolderText}${tagText}${rankText}${sortText}`;

        // カテゴリごとにグループ化（サブフォルダ対応）
        const categories = {};
        
        // メインフォルダが選択されていて、サブフォルダが選択されていない場合
        if (selectedCategory && !selectedSubfolder) {
            // サブフォルダ別にグループ化
            const subfolderGroups = filteredCases.reduce((acc, c) => {
                let subfolderName = 'その他';
                if (c.subfolder) {
                    subfolderName = c.subfolder;
                } else if (c.id && c.id.includes('/')) {
                    const pathParts = c.id.split('/');
                    if (pathParts.length >= 2) {
                        subfolderName = pathParts[1];
                    }
                }
                acc[subfolderName] = acc[subfolderName] || [];
                acc[subfolderName].push(c);
                return acc;
            }, {});
            
            // サブフォルダを番号順でソート
            const sortedSubfolders = Object.keys(subfolderGroups).sort((a, b) => {
                // 番号プレフィックスを抽出（例: "1.民法総則" → 1）
                const getNumber = (name) => {
                    const match = name.match(/^(\d+)\./);
                    return match ? parseInt(match[1], 10) : 999;
                };
                return getNumber(a) - getNumber(b);
            });
            
            // ソートされたサブフォルダ順でカテゴリに配置
            const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
            categories[categoryName] = [];
            
            sortedSubfolders.forEach(subfolderName => {
                const subfolderCases = subfolderGroups[subfolderName];
                // 各サブフォルダ内でもソート
                const sortedSubfolderCases = sortCasesInCategory(subfolderCases, sortBy, sortOrder);
                categories[categoryName].push(...sortedSubfolderCases);
            });
        } else {
            // 通常のカテゴリ別グループ化
            filteredCases.forEach(c => {
                const categoryName = c.category.charAt(0).toUpperCase() + c.category.slice(1);
                categories[categoryName] = categories[categoryName] || [];
                categories[categoryName].push(c);
            });
            
            // 各カテゴリ内で並び替えを実行
            Object.keys(categories).forEach(categoryName => {
                categories[categoryName] = sortCasesInCategory(categories[categoryName], sortBy, sortOrder);
            });
        }

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
            // メインフォルダが選択されていてサブフォルダが選択されていない場合の特別表示
            if (selectedCategory && !selectedSubfolder) {
                const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                const allCases = categories[categoryName] || [];
                
                // ★★★ 実際にサブフォルダが存在するケースがあるかチェック ★★★
                const hasRealSubfolders = allCases.some(c => c.subfolder && c.subfolder.trim() !== '');
                
                if (!hasRealSubfolders) {
                    // サブフォルダが存在しない場合は通常の表示にフォールバック
                    // 通常のケース表示ロジックに進む（このifブロックをスキップして下に流す）
                    // 何もしない（後続の通常表示ロジックが実行される）
                } else {
                    // サブフォルダ別にケースを再グループ化（実際にsubfolderプロパティがあるもののみ）
                    const subfolderGroups = {};
                    
                    allCases.forEach(c => {
                        let subfolderName = 'その他';
                        if (c.subfolder && c.subfolder.trim() !== '') {
                            subfolderName = c.subfolder;
                        }
                        subfolderGroups[subfolderName] = subfolderGroups[subfolderName] || [];
                        subfolderGroups[subfolderName].push(c);
                    });
                    
                    // サブフォルダを番号順でソート
                    const sortedSubfolders = Object.keys(subfolderGroups).sort((a, b) => {
                        const getNumber = (name) => {
                            const match = name.match(/^(\d+)\./);
                            return match ? parseInt(match[1], 10) : 999;
                        };
                        return getNumber(a) - getNumber(b);
                    });
                    
                    // サブフォルダ別セクションとして表示
                    modulesContainer.innerHTML = `
                        <div class="mb-8">
                            <h2 class="text-3xl font-bold border-b-4 border-yellow-400 pb-3 mb-6 capitalize">
                                📁 ${categoryName} - サブフォルダ別表示
                            </h2>
                            ${sortedSubfolders.map(subfolderName => {
                                const cases = subfolderGroups[subfolderName];
                            return `
                            <div class="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                                <h3 class="text-2xl font-bold border-l-4 border-blue-500 pl-4 mb-4 text-blue-800">
                                    📂 ${subfolderName} (${cases.length}件)
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    ${cases.map(c => {
                                        // ランク情報を取得
                                        const rankValue = c.rank || '';
                                        const diffClass = getDifficultyClass(rankValue);

                                        // Q&A番号範囲を取得
                                        let qaRangeText = '';
                                        if (c.questionsAndAnswers && c.questionsAndAnswers.length > 0) {
                                            const ids = c.questionsAndAnswers.map(q => q.id).filter(id => typeof id === 'number');
                                            if (ids.length > 0) {
                                                const minId = Math.min(...ids);
                                                const maxId = Math.max(...ids);
                                                qaRangeText = `（${minId}～${maxId}）`;
                                            }
                                        }

                                        return `
                                        <div data-case-id="${c.id}" class="case-card bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                                            <div class="flex justify-between items-start mb-3">
                                                <span class="inline-block px-4 py-2 rounded-full text-lg font-extrabold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}" style="min-width:2.5em; text-align:center; font-size:1.5rem; letter-spacing:0.1em;">${diffClass.display}</span>
                                                <div class="flex flex-col items-end gap-1">
                                                    <div class="folder-badge text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                                                        📁 ${c.category || 'その他'}
                                                    </div>
                                                    <div class="subfolder-badge text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform hover:scale-105 transition-transform cursor-pointer">
                                                        📂 ${subfolderName}
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 class="text-xl font-bold text-gray-800">${c.title}</h3>
                                            <p class="text-sm text-gray-500 mb-2">${c.citation}</p>
                                            <div class="flex flex-wrap gap-1 mb-2">
                                                ${(c.tags || []).map(tag => {
                                                    const isSelected = getSelectedTags().includes(tag);
                                                    return `<span class="text-xs px-2 py-1 rounded ${isSelected ? 'bg-yellow-200 text-yellow-800 font-bold' : 'bg-blue-100 text-blue-800'}">${tag}</span>`;
                                                }).join('')}
                                            </div>
                                            <div class="text-xs text-gray-600 mt-1">${qaRangeText ? `Q&A番号: ${qaRangeText}` : ''}</div>
                                        </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                `;
                }
            }
            
            // 通常のカテゴリ別表示（フォールバック処理）
            if (Object.keys(categories).length > 0) {
                modulesContainer.innerHTML = Object.entries(categories).map(([category, cases]) => `
                    <div class="mb-8">
                        <h3 class="text-2xl font-bold border-b-4 border-yellow-400 pb-2 mb-4 capitalize">${category}</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${cases.map(c => {
                                // ランク情報を取得
                                const rankValue = c.rank || '';
                                const diffClass = getDifficultyClass(rankValue);

                                // Q&A番号範囲を取得
                                let qaRangeText = '';
                                if (c.questionsAndAnswers && c.questionsAndAnswers.length > 0) {
                                    const ids = c.questionsAndAnswers.map(q => q.id).filter(id => typeof id === 'number');
                                    if (ids.length > 0) {
                                        const minId = Math.min(...ids);
                                        const maxId = Math.max(...ids);
                                        qaRangeText = `（${minId}～${maxId}）`;
                                    }
                                }

                                // ★★★ サブフォルダ情報を取得 ★★★
                                let subfolderName = '';
                                if (c.subfolder) {
                                    subfolderName = c.subfolder;
                                } else if (c.id && c.id.includes('/')) {
                                    const pathParts = c.id.split('/');
                                    if (pathParts.length >= 2) {
                                        subfolderName = pathParts[1];
                                    }
                                }

                                return `
                                <div data-case-id="${c.id}" class="case-card bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                                    <div class="flex justify-between items-start mb-3">
                                        <span class="inline-block px-4 py-2 rounded-full text-lg font-extrabold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}" style="min-width:2.5em; text-align:center; font-size:1.5rem; letter-spacing:0.1em;">${diffClass.display}</span>
                                        <div class="flex flex-col items-end gap-1">
                                            <!-- ★★★ 派手なフォルダバッジ ★★★ -->
                                            <div class="folder-badge text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                                                📁 ${c.category || 'その他'}
                                            </div>
                                            <!-- ★★★ 派手なサブフォルダバッジ（あれば） ★★★ -->
                                            ${subfolderName ? `
                                                <div class="subfolder-badge text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform hover:scale-105 transition-transform cursor-pointer">
                                                    📂 ${subfolderName}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-800">${c.title}</h3>
                                    <p class="text-sm text-gray-500 mb-2">${c.citation}</p>
                                    <div class="flex flex-wrap gap-1 mb-2">
                                        ${(c.tags || []).map(tag => {
                                            const isSelected = getSelectedTags().includes(tag);
                                            return `<span class="text-xs px-2 py-1 rounded ${isSelected ? 'bg-yellow-200 text-yellow-800 font-bold' : 'bg-blue-100 text-blue-800'}">${tag}</span>`;
                                        }).join('')}
                                    </div>
                                    <div class="text-xs text-gray-600 mt-1">${qaRangeText ? `Q&A番号: ${qaRangeText}` : ''}</div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>                                `).join('');
                    
                    // サブフォルダ別表示の処理完了後、リターン
                    return;
                }
            }
            
            // 以下の処理は、サブフォルダ別表示が実行されなかった場合に実行される
        
        // ケースカードのクリックイベントを追加
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', function() {
                const caseId = this.getAttribute('data-case-id');
                if (caseId) {
                    window.location.hash = `#/case/${caseId}`;
                }
            });
        });

        // ★★★ 派手なフォルダバッジの特殊エフェクト ★★★
        document.querySelectorAll('.folder-badge').forEach(badge => {
            badge.addEventListener('click', function(e) {
                e.stopPropagation();
                // 派手なクリックエフェクト
                this.style.transform = 'scale(1.2) rotate(360deg)';
                this.style.transition = 'transform 0.6s ease';
                setTimeout(() => {
                    this.style.transform = '';
                }, 600);
                
                // キラキラエフェクト
                const sparkles = ['✨', '🌟', '💫', '⭐', '🎆'];
                const sparkle = document.createElement('span');
                sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                sparkle.style.position = 'absolute';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.fontSize = '24px';
                sparkle.style.zIndex = '1000';
                sparkle.style.animation = 'float-up 2s ease-out forwards';
                
                const rect = this.getBoundingClientRect();
                sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
                sparkle.style.top = rect.top + 'px';
                
                document.body.appendChild(sparkle);
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 2000);
            });
            
            badge.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.8), 0 0 30px rgba(138, 43, 226, 0.4)';
                this.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            badge.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
                this.style.transform = '';
            });
        });

        // ★★★ サブフォルダバッジの特殊エフェクト ★★★
        document.querySelectorAll('.subfolder-badge').forEach(badge => {
            badge.addEventListener('click', function(e) {
                e.stopPropagation();
                // 跳ねるエフェクト
                this.style.animation = 'bounce 0.6s ease, rainbow 4s ease infinite, pulse 2s ease infinite';
                
                // キラキラエフェクト
                const sparkles = ['✨', '🌟', '💫', '⭐', '🎆'];
                const sparkle = document.createElement('span');
                sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                sparkle.style.position = 'absolute';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.fontSize = '20px';
                sparkle.style.zIndex = '1000';
                sparkle.style.animation = 'sparkle-float 3s ease-out forwards';
                
                const rect = this.getBoundingClientRect();
                sparkle.style.left = (rect.left + rect.width / 2) + 'px';
                sparkle.style.top = rect.top + 'px';
                
                document.body.appendChild(sparkle);
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 3000);
            });
            
            badge.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)';
            });
            
            badge.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
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

function getSortDisplayName(sortBy) {
    switch (sortBy) {
        case 'title': return 'タイトル順';
        case 'rank': return 'ランク順';
        case 'qa-average': return 'Q&A番号平均順';
        default: return '';
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
        console.log('🔄 目次ファイル再読み込み開始:', { timestamp });
        
        const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
        console.log('✅ 新しいindex.jsを読み込み完了:', {
            caseSummariesLength: indexModule.caseSummaries.length,
            sampleCategories: indexModule.caseSummaries.slice(0, 3).map(s => ({ category: s.category, subfolder: s.subfolder }))
        });
        
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
    updateSubfolderFilter(); // サブフォルダフィルターも更新
    
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

// Q&Aリスト描画関数
export async function renderFilteredQAs({ container, qaList, showFilter = false } = {}) {
    // container: 表示先DOM、qaList: 表示するQ&A配列、showFilter: フィルタUIを表示するか
    let modulesContainer = container || document.getElementById('modules-container');
    if (!modulesContainer) return;
    modulesContainer.innerHTML = '<div class="text-center p-12"><div class="loader">読み込み中...</div></div>';
    let allQAs = qaList;
    if (!allQAs) {
        // トップページ用: 全Q&A集約
        allQAs = [];
        for (const summary of (window.caseSummaries || caseSummaries)) {
            try {
                const loader = (window.caseLoaders || caseLoaders)[summary.id];
                if (!loader) continue;
                const mod = await loader();
                const caseData = mod.default;
                (caseData.questionsAndAnswers || []).forEach(qa => {
                    allQAs.push({
                        ...qa,
                        moduleId: summary.id,
                        moduleTitle: summary.title,
                        category: summary.category,
                        tags: summary.tags || []
                    });
                });
            } catch (e) { /* skip error */ }
        }
    }
    // フィルタ取得（トップページのみ）
    let filteredQAs = allQAs;
    if (showFilter) {
        const selectedCategory = document.getElementById('category-filter').value;
        const selectedRanks = Array.from(document.querySelectorAll('.rank-checkbox:checked')).map(cb => cb.value);
        const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
        filteredQAs = allQAs.filter(qa => {
            if (selectedCategory && qa.category !== selectedCategory) return false;
            if (selectedRanks.length && !selectedRanks.includes(qa.rank)) return false;
            if (selectedTags.length && !selectedTags.some(tag => qa.tags.includes(tag))) return false;
            return true;
        });
    }
    filteredQAs.sort((a, b) => (a.id || 0) - (b.id || 0));
    let html = `<div class="max-w-4xl mx-auto p-6">
        <h2 class="text-2xl font-bold mb-6 text-center">${showFilter ? '全Q&A横断リスト' : 'Q&Aリスト'}</h2>
        <div class="space-y-6">`;
    filteredQAs.forEach((qa, i) => {
        const rank = qa.rank || '';
        const diffClass = getDifficultyClass(rank);
        const rankBadge = `<span class="inline-block px-2 py-0.5 rounded text-xs font-bold border mr-2 ${diffClass.text} ${diffClass.bg} ${diffClass.border}">${rank}</span>`;
        const answerId = `qa-answer-${i}`;
        const questionHtml = processArticleReferences(qa.question);
        const answerWithRefs = processArticleReferences(qa.answer);
        const answerHtml = processBlankFillText(answerWithRefs, `qa-list-${i}`);
        html += `<div class="p-4 bg-white rounded-lg shadow border flex flex-col gap-2 qa-item">
            <div class="flex items-center gap-2">
                ${rankBadge}
                <span class="font-bold">Q${qa.id}.</span>
                <span>${questionHtml}</span>
                ${showFilter ? `<span class=\"ml-auto text-xs text-blue-700 font-bold cursor-pointer hover:underline module-link\" data-module-id=\"${qa.moduleId}\">[${qa.moduleTitle}]</span>` : ''}
            </div>
            <div class="ml-8">
                <button class="toggle-answer-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded text-xs mb-1" data-target="${answerId}">答えを表示</button>
                <span id="${answerId}" class="hidden"><span class="font-bold">答：</span>${answerHtml}</span>
            </div>
        </div>`;
    });
    html += `</div></div>`;
    modulesContainer.innerHTML = html;
    document.querySelectorAll('.toggle-answer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.target);
            if (target) {
                if (target.classList.contains('hidden')) {
                    target.classList.remove('hidden');
                    this.textContent = '答えを隠す';
                } else {
                    target.classList.add('hidden');
                    this.textContent = '答えを表示';
                }
            }
        });
    });
    if (showFilter) {
        document.querySelectorAll('.module-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.stopPropagation();
                const moduleId = this.dataset.moduleId;
                if (moduleId) {
                    window.location.hash = `#/case/${moduleId}`;
                }
            });
        });
    }
}

/**
 * スピード条文セクションの初期化
 */
async function initializeSpeedQuizSection() {
    try {
        // speedQuizMain.jsの動的インポート
        const module = await import('../speedQuizMain.js');
        const { initializeSpeedQuizMainSection } = module;
        if (initializeSpeedQuizMainSection) {
            await initializeSpeedQuizMainSection('speed-quiz-main-section');
        } else {
            console.error('❌ initializeSpeedQuizMainSection 関数が見つかりません');
            showSpeedQuizFallback();
        }
    } catch (error) {
        console.error('❌ スピード条文セクションの初期化に失敗:', error);
        showSpeedQuizFallback();
    }
}

/**
 * スピード条文のフォールバック表示
 */
function showSpeedQuizFallback() {
    const container = document.getElementById('speed-quiz-main-section');
    if (container) {
        container.innerHTML = `
            <div class="bg-white bg-opacity-20 rounded-lg p-6 text-center">
                <h3 class="text-lg font-bold mb-4">⚡ スピード条文</h3>
                <p class="mb-4">条文の知識を素早く確認できるゲームです。</p>
                <a href="#/speed-quiz" class="bg-white bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-2 px-4 rounded-lg transition-all">
                    スピード条文を開始
                </a>
            </div>
        `;
    }
}

/**
 * スピード条文セクションを表示
 */
async function renderSpeedQuizSection() {
    const container = document.getElementById('modules-container');
    container.innerHTML = `
        <div class="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg mb-6">
            <h2 class="text-2xl font-bold mb-4 text-center">⚡ スピード条文ゲーム</h2>
            <div id="speed-quiz-main-section">
                <!-- スピード条文コンテンツがここに挿入される -->
            </div>
        </div>
    `;
    
    // スピード条文セクションの初期化
    await initializeSpeedQuizSection();
}

/**
 * フィルター設定を保存
 */
function saveFilterSettings() {
    try {
        // カテゴリ、サブフォルダ、ランク、ソート設定を取得
        const categoryFilter = document.getElementById('category-filter');
        const subfolderFilter = document.getElementById('subfolder-filter');
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedSubfolder = subfolderFilter ? subfolderFilter.value : '';
        
        const selectedRanks = getSelectedRanks();
        
        const sortSettings = getSortSettings();
        
        // タグのチェック状態を取得（現在表示されているタグのみ）
        const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
        const tagStates = {};
        tagCheckboxes.forEach(cb => {
            tagStates[cb.value] = cb.checked;
        });
        
        // 設定をオブジェクトにまとめる
        const filterSettings = {
            category: selectedCategory,
            subfolder: selectedSubfolder,
            ranks: selectedRanks,
            sortBy: sortSettings.sortBy,
            sortOrder: sortSettings.sortOrder,
            tags: tagStates,
            lastUpdated: new Date().toISOString()
        };
        
        // ローカルストレージに保存
        localStorage.setItem('atashinchi_filter_settings', JSON.stringify(filterSettings));
        console.log('✅ フィルター設定を保存しました', filterSettings);
    } catch (error) {
        console.error('フィルター設定の保存に失敗:', error);
    }
}

// ★★★ フィルター設定をローカルストレージから読み込み ★★★
function loadFilterSettings() {
    try {
        // ローカルストレージから設定を読み込む
        const savedSettingsJSON = localStorage.getItem('atashinchi_filter_settings');
        if (!savedSettingsJSON) {
            console.log('💡 保存されたフィルター設定がありません');
            return;
        }
        
        const savedSettings = JSON.parse(savedSettingsJSON);
        console.log('📂 保存されたフィルター設定を読み込みます', savedSettings);
        
        // カテゴリを設定
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter && savedSettings.category) {
            categoryFilter.value = savedSettings.category;
            
            // カテゴリ変更に伴うタグ更新とサブフォルダ更新（ここではイベントを発火させない）
            updateTagFilter(false);
            updateSubfolderFilter(false);
        }
        
        // サブフォルダを設定（カテゴリ設定後に行う）
        setTimeout(() => {
            const subfolderFilter = document.getElementById('subfolder-filter');
            if (subfolderFilter && savedSettings.subfolder) {
                subfolderFilter.value = savedSettings.subfolder;
            }
        }, 100); // サブフォルダ更新の完了を待つ
        
        // ソート設定を適用
        const sortBy = document.getElementById('sort-by');
        const sortOrder = document.getElementById('sort-order');
        
        if (sortBy && savedSettings.sortBy) {
            sortBy.value = savedSettings.sortBy;
        }
        
        if (sortOrder && savedSettings.sortOrder) {
            sortOrder.value = savedSettings.sortOrder;
        }
        
        // ランクチェックボックスの状態を復元
        if (savedSettings.ranks && savedSettings.ranks.length > 0) {
            document.querySelectorAll('.rank-checkbox').forEach(cb => {
                cb.checked = savedSettings.ranks.includes(cb.value);
            });
        }
        
        // タグチェックボックスの状態を復元
        if (savedSettings.tags) {
            document.querySelectorAll('.tag-checkbox').forEach(cb => {
                if (savedSettings.tags.hasOwnProperty(cb.value)) {
                    cb.checked = savedSettings.tags[cb.value];
                }
            });
        }
        
        // サブフォルダフィルターの状態を復元
        const subfolderFilter = document.getElementById('subfolder-filter');
        if (subfolderFilter && savedSettings.subfolder) {
            subfolderFilter.value = savedSettings.subfolder;
        }
        
        // フィルタを適用してリスト更新
        renderFilteredModulesOrQAs();
        
    } catch (error) {
        console.error('フィルター設定の読み込みに失敗:', error);
    }
}
