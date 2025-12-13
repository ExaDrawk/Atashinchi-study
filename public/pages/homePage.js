// pages/homePage.js - ホームページ専用モジュール（グローバル検索機能付き）

// ★★★ 法分野別カラー設定 ★★★
export const CATEGORY_COLORS = {
    '民法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#dc2626',    // 赤色背景
        borderColor: '#b91c1c'
    },
    '刑法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#2563eb',    // 青色背景
        borderColor: '#1d4ed8'
    },
    '憲法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#16a34a',    // 緑色背景
        borderColor: '#15803d'
    },
    '商法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#eab308',    // 黄色背景
        borderColor: '#ca8a04'
    },
    '行政法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#65a30d',    // 黄緑色背景
        borderColor: '#4d7c0f'
    },
    '民事訴訟法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#e06929ff',    // オレンジ色背景
        borderColor: '#c24d1fff'
    },
    '刑事訴訟法': {
        color: '#ffffff',      // 白色文字
        bgColor: '#9333ea',    // 紫色背景
        borderColor: '#7c3aed'
    }
};

// ★★★ ランク別カラー設定 ★★★
const RANK_COLORS = {
    'S': {
        color: '#ffffff',      // 白色文字
        bgColor: '#dc2626',    // 赤色背景（最重要）
        borderColor: '#b91c1c'
    },
    'A': {
        color: '#ffffff',      // 白色文字
        bgColor: '#ea580c',    // オレンジ色背景（重要）
        borderColor: '#c2410c'
    },
    'B': {
        color: '#ffffff',      // 白色文字
        bgColor: '#2563eb',    // 青色背景（普通）
        borderColor: '#1d4ed8'
    },
    'C': {
        color: '#ffffff',      // 白色文字
        bgColor: '#16a34a',    // 緑色背景（軽重要）
        borderColor: '#15803d'
    }
};

// カテゴリの色情報を取得する関数（他モジュールからも使用）
export function getCategoryColor(category) {
    // 会社法は商法と同じ色
    if (category === '会社法') {
        return CATEGORY_COLORS['商法'];
    }
    // 行政事件訴訟法、行政手続法、行政不服審査法は行政法と同じ色
    if (category === '行政事件訴訟法' || category === '行政手続法' || category === '行政不服審査法') {
        return CATEGORY_COLORS['行政法'];
    }
    return CATEGORY_COLORS[category] || {
        color: '#6b7280',      // グレー（デフォルト）
        bgColor: '#f9fafb',    // 薄いグレー背景
        borderColor: '#6b7280'
    };
}

// ランクの色情報を取得する関数
function getRankColor(rank) {
    return RANK_COLORS[rank] || {
        color: '#6b7280',      // グレー（デフォルト）
        bgColor: '#f9fafb',    // 薄いグレー背景
        borderColor: '#6b7280'
    };
}

function normalizeCategoryName(category) {
    if (category === undefined || category === null) {
        return 'その他';
    }
    if (typeof category === 'string') {
        const trimmed = category.trim();
        return trimmed.length ? trimmed : 'その他';
    }
    return String(category);
}

function generateCategoryBadge(category, isSubfolder = false) {
    const name = normalizeCategoryName(category);
    return name;
}

function generateCategoryBadgeStyle(category) {
    const name = normalizeCategoryName(category);
    const colorInfo = getCategoryColor(name);
    const inlineStyles = [
        `color: ${colorInfo.color}`,
        `background-color: ${colorInfo.bgColor}`,
        `border: 2px solid ${colorInfo.borderColor}`,
        'display: inline-flex',
        'align-items: center',
        'gap: 0.25rem',
        'letter-spacing: 0.05em',
        'background-image: none',
        'text-shadow: none',
        'box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12)',
        'transition: none'
    ];

    return inlineStyles.join('; ');
}

function parseArticleTitle(rawTitle) {
    const safeTitle = (rawTitle || '').toString().trim();
    const defaultLabel = safeTitle || '不明な条文';

    const baseResult = {
        rawTitle: safeTitle,
        fullRef: defaultLabel,
        displayName: defaultLabel,
        lawName: null,
        articleNumber: null,
        paragraph: null,
        item: null,
        articleRef: defaultLabel
    };

    if (!safeTitle) {
        return baseResult;
    }

    const normalized = safeTitle
        .replace(/[【】\[\]]/g, '')
        .replace(/\s+/g, '');

    const articleMatch = normalized.match(/(\d+(?:の\d+)?)(?=条)/);
    if (!articleMatch) {
        return baseResult;
    }

    const articleNumber = articleMatch[1];
    const lawName = normalized.slice(0, normalized.indexOf(articleMatch[0])) || null;
    const paragraphMatch = normalized.match(/第(\d+)項/);
    const itemMatch = normalized.match(/第(\d+)号/);

    const articleParts = [`${articleNumber}条`];
    if (paragraphMatch) {
        articleParts.push(`第${paragraphMatch[1]}項`);
    }
    if (itemMatch) {
        articleParts.push(`第${itemMatch[1]}号`);
    }
    const articleRef = articleParts.join('');

    const shortLaw = lawName
        ? (lawName.length > 6 ? `${lawName.slice(0, 5)}…` : lawName)
        : '';

    return {
        rawTitle: safeTitle,
        lawName,
        articleNumber,
        paragraph: paragraphMatch ? Number(paragraphMatch[1]) : null,
        item: itemMatch ? Number(itemMatch[1]) : null,
        articleRef,
        fullRef: `${lawName || ''}${articleRef}` || articleRef,
        displayName: shortLaw ? `${shortLaw} ${articleRef}` : articleRef
    };
}

const SPEED_RANK_FILTERS = [
    { value: 'まだまだ', label: 'まだまだ', description: '平均0〜2点 / 要復習' },
    { value: 'あと少し', label: 'あと少し', description: '平均3〜7点 / 伸びしろ' },
    { value: 'カンペキ', label: 'カンペキ', description: '平均8点〜 / 得意' }
];

const SPEED_FILTER_STORAGE_KEY = 'atashinchi_speed_filter_settings_v1';
const SPEED_QUESTION_COUNT_OPTIONS = [5, 10, 20, 30, 'all'];
const PRESET_SPEED_LAW_OPTIONS = Array.from(new Set(HOME_SPEED_QUIZ_LAWS)).sort((a, b) => a.localeCompare(b, 'ja'));
let speedFilterSettingsCache = null;

function getDefaultSpeedFilterSettings() {
    return {
        rankFilters: [],
        selectedLaws: [],
        questionCount: '20'
    };
}

export function getSpeedFilterSettings() {
    if (!speedFilterSettingsCache) {
        speedFilterSettingsCache = loadSpeedFilterSettingsFromStorage();
    }
    return speedFilterSettingsCache;
}

function loadSpeedFilterSettingsFromStorage() {
    try {
        const raw = localStorage.getItem(SPEED_FILTER_STORAGE_KEY);
        if (!raw) {
            return getDefaultSpeedFilterSettings();
        }
        const parsed = JSON.parse(raw);
        return {
            ...getDefaultSpeedFilterSettings(),
            ...parsed
        };
    } catch (error) {
        console.warn('🚀 スピードフィルタ設定の読み込みに失敗:', error);
        return getDefaultSpeedFilterSettings();
    }
}

function saveSpeedFilterSettingsToStorage(settings) {
    try {
        localStorage.setItem(SPEED_FILTER_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('🚀 スピードフィルタ設定の保存に失敗:', error);
    }
}

function updateSpeedFilterSettings(partial) {
    const next = {
        ...getSpeedFilterSettings(),
        ...partial
    };
    speedFilterSettingsCache = next;
    saveSpeedFilterSettingsToStorage(next);
    return next;
}

function resetSpeedFilterSettings() {
    speedFilterSettingsCache = getDefaultSpeedFilterSettings();
    saveSpeedFilterSettingsToStorage(speedFilterSettingsCache);
    return speedFilterSettingsCache;
}

function getSpeedFilterLawOptions() {
    try {
        if (Array.isArray(window.speedQuizArticles) && window.speedQuizArticles.length > 0) {
            const lawSet = new Set();
            window.speedQuizArticles.forEach(article => {
                if (article?.lawName) {
                    lawSet.add(article.lawName);
                }
            });
            if (lawSet.size > 0) {
                return Array.from(lawSet).sort((a, b) => a.localeCompare(b, 'ja'));
            }
        }
    } catch (error) {
        console.warn('🚀 法律リスト生成中にエラー:', error);
    }
    return PRESET_SPEED_LAW_OPTIONS;
}

function renderSpeedFilterPanel() {
    const panel = document.getElementById('speed-quiz-filter-panel');
    if (!panel) return;
    panel.innerHTML = getSpeedFilterPanelHTML();
    attachSpeedFilterHandlers(panel);
    updateSpeedFilterSummary();
}

// 絞り込みパネルのHTMLを生成（外部からも利用可能）
export function getSpeedFilterPanelHTML() {
    const settings = getSpeedFilterSettings();
    const rankButtons = SPEED_RANK_FILTERS.map(filter => {
        const isActive = settings.rankFilters.includes(filter.value);
        const activeClass = isActive ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50';
        return `
            <button type="button" class="speed-rank-chip ${activeClass} rounded-lg px-3 py-2 flex flex-col text-left transition-all" data-rank="${filter.value}">
                <span class="font-semibold">${filter.label}</span>
                <span class="text-xs opacity-80">${filter.description}</span>
            </button>
        `;
    }).join('');

    const questionOptions = SPEED_QUESTION_COUNT_OPTIONS.map(option => {
        const value = option === 'all' ? 'all' : option.toString();
        const label = option === 'all' ? 'すべて' : `${option}問`;
        const selected = settings.questionCount?.toString() === value ? 'selected' : '';
        return `<option value="${value}" ${selected}>${label}</option>`;
    }).join('');

    return `
        <div class="mt-2">
            <p class="text-sm font-semibold text-gray-700 mb-2">苦手度で探す</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                ${rankButtons}
            </div>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">出題数</label>
                <select id="speed-question-count" class="form-input w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400">
                    ${questionOptions}
                </select>
            </div>
        </div>
        <div id="speed-filter-summary" class="text-xs text-gray-500 mt-3"></div>
        <div class="mt-5 flex flex-col sm:flex-row gap-3">
            <button id="apply-speed-filter" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all">
                ゲームスタート
            </button>
            <button id="reset-speed-filter" class="sm:w-auto border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg">
                条件をリセット
            </button>
        </div>
    `;
}

// イベントハンドラを設定（外部からも利用可能）
export function attachSpeedFilterHandlers(panel, options = {}) {
    const { onApply, onReset } = options;

    panel.querySelectorAll('.speed-rank-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const rank = chip.dataset.rank;
            const current = getSpeedFilterSettings();
            let nextRanks = [...current.rankFilters];
            if (nextRanks.includes(rank)) {
                nextRanks = nextRanks.filter(r => r !== rank);
            } else {
                nextRanks.push(rank);
            }
            updateSpeedFilterSettings({ rankFilters: nextRanks });
            // パネルを再描画
            panel.innerHTML = getSpeedFilterPanelHTML();
            attachSpeedFilterHandlers(panel, options);
            updateSpeedFilterSummary();
        });
    });

    panel.querySelectorAll('.speed-law-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selected = Array.from(panel.querySelectorAll('.speed-law-checkbox:checked')).map(el => el.value);
            updateSpeedFilterSettings({ selectedLaws: selected });
            updateSpeedFilterSummary();
        });
    });

    const questionSelect = panel.querySelector('#speed-question-count');
    if (questionSelect) {
        questionSelect.addEventListener('change', (event) => {
            updateSpeedFilterSettings({ questionCount: event.target.value });
            updateSpeedFilterSummary();
        });
    }

    const applyButton = panel.querySelector('#apply-speed-filter');
    if (applyButton) {
        applyButton.addEventListener('click', async () => {
            if (onApply) {
                onApply(getSpeedFilterSettings());
            } else {
                await launchSpeedQuizWithFilters();
            }
        });
    }

    const resetButton = panel.querySelector('#reset-speed-filter');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            resetSpeedFilterSettings();
            // パネルを再描画
            panel.innerHTML = getSpeedFilterPanelHTML();
            attachSpeedFilterHandlers(panel, options);
            updateSpeedFilterSummary();
            if (onReset) onReset();
        });
    }
}

function updateSpeedFilterSummary() {
    const summary = document.getElementById('speed-filter-summary');
    if (!summary) return;
    const settings = getSpeedFilterSettings();

    // 上部フィルターの設定を取得
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const subfolderFilter = document.getElementById('subfolder-filter')?.value || '';

    const folderText = categoryFilter
        ? (subfolderFilter ? `${categoryFilter} > ${subfolderFilter}` : categoryFilter)
        : 'すべて';
    const questionText = settings.questionCount === 'all' ? '全問' : `${settings.questionCount || '20'}問`;
    summary.textContent = `フォルダ: ${folderText} ／ 最大 ${questionText}`;
}

// スピード条文ゲーム起動関数
async function launchSpeedQuizWithFilters() {
    try {
        const settings = getSpeedFilterSettings();

        // 上部フィルターの設定を取得
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const subfolderFilter = document.getElementById('subfolder-filter')?.value || '';

        // フルスクリーン用のコンテナを作成
        let container = document.getElementById('sq-fullscreen-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sq-fullscreen-container';
            document.body.appendChild(container);
        }

        // フィルターに基づいてモジュールを絞り込み、条文を抽出
        let articles = [];
        const currentSummaries = window.caseSummaries || caseSummaries;

        console.log('スピード条文開始 - caseSummaries:', currentSummaries.length, '件');
        console.log('フィルター条件:', { categoryFilter, subfolderFilter });

        // フィルターに一致するモジュールを取得
        let filteredModules = currentSummaries;
        if (categoryFilter) {
            filteredModules = filteredModules.filter(m => m.category === categoryFilter);
        }
        if (subfolderFilter) {
            filteredModules = filteredModules.filter(m => m.subfolder === subfolderFilter);
        }

        if (filteredModules.length === 0) {
            alert('絞り込み条件に一致するモジュールがありません。');
            return;
        }

        // 各モジュールから条文を抽出（extractAllArticlesを使用）
        console.log(`条文抽出開始: ${filteredModules.length}モジュール`);
        const currentLoaders = window.caseLoaders || caseLoaders;
        const { extractAllArticles } = await import('../speedQuiz.js');

        for (const moduleSummary of filteredModules) {
            try {
                // caseLoadersを使ってモジュールを読み込み
                const loader = currentLoaders[moduleSummary.id];
                if (!loader) {
                    console.warn(`ローダーが見つかりません: ${moduleSummary.id}`);
                    continue;
                }
                const moduleData = await loader();
                const caseData = moduleData.default || moduleData;

                // extractAllArticlesで条文を抽出
                const moduleArticles = await extractAllArticles(caseData);
                articles.push(...moduleArticles);
            } catch (err) {
                console.warn(`モジュール ${moduleSummary.id} の読み込みに失敗:`, err);
            }
        }

        // 重複を除去（法令名+条番号でユニーク化）
        const uniqueArticles = [];
        const seen = new Set();
        for (const article of articles) {
            const key = `${article.lawName}-${article.articleNumber}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueArticles.push(article);
            }
        }
        articles = uniqueArticles;

        console.log(`条文抽出完了: ${articles.length}件（重複除去後）`);

        if (articles.length === 0) {
            alert('条件に一致する条文がありません。モジュールに条文参照が含まれているか確認してください。');
            return;
        }

        // ランクフィルタを適用（rankFiltersが選択されている場合のみ）
        if (settings.rankFilters && settings.rankFilters.length > 0) {
            try {
                // 条文ごとの統計情報を取得
                const statsRes = await fetch('/api/quiz-results/article-stats');
                const articleStats = await statsRes.json();

                // 各条文のキーとランクを照合してフィルタ
                articles = articles.filter(article => {
                    const key = `${article.lawName}${article.articleNumber}条`;
                    const stat = articleStats[key];
                    // 記録がない条文は「まだまだ」扱い
                    const rank = stat ? stat.rank : 'まだまだ';
                    return settings.rankFilters.includes(rank);
                });

                console.log(`ランクフィルタ適用後: ${articles.length}件 (フィルタ: ${settings.rankFilters.join(', ')})`);

                if (articles.length === 0) {
                    alert(`「${settings.rankFilters.join('」「')}」のランクに該当する条文がありません。`);
                    return;
                }
            } catch (err) {
                console.warn('ランク統計の取得に失敗、フィルタをスキップ:', err);
            }
        }

        // 出題数制限
        const count = settings.questionCount === 'all' ? articles.length : (parseInt(settings.questionCount) || 20);
        // シャッフルして制限
        for (let i = articles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [articles[i], articles[j]] = [articles[j], articles[i]];
        }
        articles = articles.slice(0, count);

        // スピードクイズを初期化・起動（フルスクリーン）
        const module = await import('../speedQuiz.js');
        await module.initializeSpeedQuizGame('sq-fullscreen-container', null, false, {
            articles: articles,
            timeLimit: 10,
            returnUrl: '#/'
        });
    } catch (error) {
        console.error('スピードフィルタ適用エラー:', error);
        alert('スピード条文の開始に失敗しました。時間を置いて再度お試しください。');
    }
}
/**
 * 今日の学習記録のHTMLを生成する関数（改良版）
 * @returns {Promise<string>} 今日の学習記録セクションのHTML
 */
async function generateTodayStudyRecordsHTML() {
    console.log('📚 今日の学習記録HTMLを生成中...');
    const { today, totalCount, records } = await getTodayStudyRecords();

    // recordsから学習記録とクイズ記録を分離
    const allRecords = Array.isArray(records) ? records : [];
    const studyEntries = allRecords.filter(r => r.type === 'study');
    const quizEntries = allRecords.filter(r => r.type === 'quiz');

    // クイズエントリからarticlesを取得して正解/不正解に分ける（互換性のため）
    const quizCorrect = [];
    const quizIncorrect = [];
    quizEntries.forEach(entry => {
        const articles = entry.quizSummary?.articles || entry.studyRecord?.articles || [];
        articles.forEach(article => {
            const score = article.score ?? 0;
            if (score >= 8) {
                quizCorrect.push({ ...article, title: article.articleNumber, quizResult: { score } });
            } else {
                quizIncorrect.push({ ...article, title: article.articleNumber, quizResult: { score } });
            }
        });
    });

    if (totalCount === 0) {
        console.log('📭 今日の学習記録なし - 空状態を表示');
        return `
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-gray-800 flex items-center gap-1">📚 今日の学習記録</h3>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400">まだ記録がありません</span>
                    <button onclick="if(window.openCalendar){window.openCalendar();}else{console.error('openCalendar関数が利用できません');}" title="カレンダーを表示" class="text-lg px-1 py-0.5 rounded hover:bg-gray-100">📅</button>
                </div>
            </div>
        `;
    }

    const totalQuizAttempts = quizCorrect.length + quizIncorrect.length;
    console.log(`🚀 学習カード: ${studyEntries.length}件 / クイズ: ${totalQuizAttempts}件`);

    const renderStudyCard = (record) => {
        // プレミアムUI用のスタイル計算
        const folderColorInfo = getCategoryColor(record.folderName);
        const rankColorInfo = getRankColor(record.rank);

        // 日時フォーマット
        const studyTime = record.studyRecord.timestamp ?
            new Date(record.studyRecord.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) :
            '時刻不明';

        // コンテンツ
        const entryTitle = record.studyRecord.title || '';
        const entryDetail = record.studyRecord.detail || '';

        // チップ生成
        const qaChip = record.studyRecord.qaId !== undefined && record.studyRecord.qaId !== null ? `Q${record.studyRecord.qaId}` : '';
        const levelChip = typeof record.studyRecord.level === 'number' ? `Lv${record.studyRecord.level}` : '';
        const metaChips = [qaChip, levelChip]
            .filter(Boolean)
            .map(label => `<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">${label}</span>`)
            .join('');

        return `
            <div class="group relative overflow-hidden bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer study-record-card flex flex-col h-full"
                 onclick="window.location.href='#/case/${record.id}'" data-case-id="${record.id}">
                
                <div class="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-50 z-0"></div>
                <div class="shine-effect"></div>
                
                <div class="relative z-10 flex flex-col h-full">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full border border-black/5 shadow-sm transform group-hover:scale-105 transition-transform"
                                  style="color: ${folderColorInfo.color}; background-color: ${folderColorInfo.bgColor}; border-color: ${folderColorInfo.borderColor};">
                                ${record.folderName}
                            </span>
                            <span class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full border border-black/5 shadow-sm"
                                  style="color: ${rankColorInfo.color}; background-color: ${rankColorInfo.bgColor}; border-color: ${rankColorInfo.borderColor};">
                                ${record.rank}
                            </span>
                        </div>
                        <div class="text-green-500 text-sm flex-shrink-0 bg-green-50 rounded-full p-1 group-hover:bg-green-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    
                    <h4 class="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">${record.title}</h4>
                    
                    ${entryTitle ? `<div class="mt-1 px-2 py-1 bg-indigo-50/50 rounded-md border border-indigo-100/50"><p class="text-xs text-indigo-700 font-bold truncate">${entryTitle}</p></div>` : ''}
                    
                    ${entryDetail ? `<p class="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight opacity-80">${entryDetail}</p>` : ''}
                    
                    <div class="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 border-dashed">
                        <span class="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                            </svg>
                            ${studyTime}
                        </span>
                        ${metaChips ? `<div class="flex flex-wrap gap-1 justify-end">${metaChips}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const studyGridHTML = studyEntries.length > 0
        ? `<div class="grid grid-cols-4 gap-3 mb-4">${studyEntries.map(renderStudyCard).join('')}</div>`
        : `<div class="text-sm text-gray-500 p-6 text-center border border-dashed border-gray-300 rounded-lg">今日のモジュール学習はまだありません</div>`;

    // スコアからランクを判定: 0-2=まだまだ, 3-7=あと少し, 8-10=カンペキ
    const getScoreRank = (score) => {
        if (score >= 8) return 'kanpeki';
        if (score >= 3) return 'atosukoshi';
        return 'madamada';
    };

    const aggregateQuizByLaw = (records) => {
        const lawMap = new Map();
        records.forEach(record => {
            const key = record.title || record.quizResult?.articleNumber || '不明な条文';
            const parsed = parseArticleTitle(key);
            const lawName = parsed.lawName || '不明な法令';

            if (!lawMap.has(lawName)) {
                lawMap.set(lawName, {
                    lawName,
                    kanpeki: [],    // 8-10点
                    atosukoshi: [], // 3-7点
                    madamada: [],   // 0-2点
                    totalCount: 0
                });
            }

            const lawData = lawMap.get(lawName);
            // スコアを取得（旧形式は200点満点→10点換算、新形式はそのまま）
            let score = record.quizResult?.score ?? 0;
            if (score > 10) score = Math.round(score / 20);
            const rank = getScoreRank(score);

            lawData[rank].push({ ...parsed, count: 1, score });
            lawData.totalCount += 1;
        });

        return Array.from(lawMap.values()).sort((a, b) => b.totalCount - a.totalCount);
    };

    const allQuizRecords = [...quizCorrect, ...quizIncorrect];
    const quizByLaw = aggregateQuizByLaw(allQuizRecords);

    const renderSpeedQuizCard = () => {
        if (totalQuizAttempts === 0) {
            return '';
        }

        // カンペキ数を計算
        const kanpekiCount = quizByLaw.reduce((sum, law) => sum + law.kanpeki.length, 0);
        const atosukoshiCount = quizByLaw.reduce((sum, law) => sum + law.atosukoshi.length, 0);
        const madamadaCount = quizByLaw.reduce((sum, law) => sum + law.madamada.length, 0);
        const lawSummary = quizByLaw.slice(0, 3).map(law => `${law.lawName}(${law.totalCount}問)`).join('、');
        const remainingLaws = quizByLaw.length > 3 ? ` 他${quizByLaw.length - 3}法令` : '';

        return `
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                 onclick="window.openSpeedQuizDetailModal && window.openSpeedQuizDetailModal()"
                 title="クリックして法令ごとの詳細を表示">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">⚡</span>
                        <span class="font-bold text-lg">スピード条文</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-white/20 px-2 py-1 rounded text-sm font-semibold">${totalQuizAttempts}問</span>
                        <span class="text-xl">›</span>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-4">
                        <span class="flex items-center gap-1" title="カンペキ(8-10点)"><span class="text-green-300">◯</span> ${kanpekiCount}</span>
                        <span class="flex items-center gap-1" title="あと少し(3-7点)"><span class="text-yellow-300">△</span> ${atosukoshiCount}</span>
                        <span class="flex items-center gap-1" title="まだまだ(0-2点)"><span class="text-red-300">✕</span> ${madamadaCount}</span>
                    </div>
                </div>
                <div class="text-xs mt-2 opacity-80 truncate">
                    ${lawSummary}${remainingLaws}
                </div>
            </div>
        `;
    };

    // スピード条文詳細モーダル用のデータをグローバルに保存
    window._speedQuizDetailData = {
        quizByLaw,
        totalQuizAttempts
    };

    // クイズのカンペキ数を計算
    const kanpekiCount = quizByLaw.reduce((sum, law) => sum + law.kanpeki.length, 0);
    const atosukoshiCount = quizByLaw.reduce((sum, law) => sum + law.atosukoshi.length, 0);
    const madamadaCount = quizByLaw.reduce((sum, law) => sum + law.madamada.length, 0);

    return `
        <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-800 flex items-center gap-1">📚 今日の学習記録</h3>
            <div class="flex items-center gap-3">
                <!-- 学習記録サマリー -->
                <div class="flex items-center gap-2 text-xs">
                    <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">📖 ${studyEntries.length}件</span>
                    ${totalQuizAttempts > 0 ? `
                        <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            ⚡ ${totalQuizAttempts}問
                            <span class="text-green-600">◯${kanpekiCount}</span>
                            <span class="text-yellow-600">△${atosukoshiCount}</span>
                            <span class="text-red-500">✕${madamadaCount}</span>
                        </span>
                    ` : ''}
                </div>
                <button onclick="if(window.openCalendar){window.openCalendar();}else{console.error('openCalendar関数が利用できません');}" title="カレンダーを表示" class="text-lg px-1 py-0.5 rounded hover:bg-gray-100">📅</button>
            </div>
        </div>
    `;
}

function applyCategoryBadgeStyles() {
    // フォルダバッジのスタイルを適用
    document.querySelectorAll('.folder-badge').forEach(badge => {
        const category = badge.getAttribute('data-category') || badge.textContent.replace('🚀 ', '').trim();
        const colorInfo = getCategoryColor(category);
        console.log(`🚀 フォルダバッジにスタイル適用: "${category}"`, colorInfo);

        badge.style.setProperty('background-color', colorInfo.bgColor, 'important');
        badge.style.setProperty('background', colorInfo.bgColor, 'important');
        badge.style.setProperty('color', colorInfo.color, 'important');
        badge.style.setProperty('border-color', colorInfo.borderColor, 'important');
        badge.style.setProperty('background-image', 'none', 'important');
        badge.style.setProperty('animation', 'none', 'important');
        badge.style.setProperty('transition', 'none', 'important');
        badge.style.setProperty('transform', 'none', 'important');
    });

    // サブフォルダバッジのスタイルを適用
    document.querySelectorAll('.subfolder-badge').forEach(badge => {
        const category = badge.textContent.replace('🚀 ', '').trim();
        const colorInfo = getCategoryColor(category);
        console.log(`🚀 サブフォルダバッジにスタイル適用: "${category}"`, colorInfo);

        badge.style.setProperty('background-color', colorInfo.bgColor, 'important');
        badge.style.setProperty('background', colorInfo.bgColor, 'important');
        badge.style.setProperty('color', colorInfo.color, 'important');
        badge.style.setProperty('border-color', colorInfo.borderColor, 'important');
        badge.style.setProperty('background-image', 'none', 'important');
        badge.style.setProperty('animation', 'none', 'important');
        badge.style.setProperty('transition', 'none', 'important');
        badge.style.setProperty('transform', 'none', 'important');
    });
}

import { caseSummaries, caseLoaders } from '../cases/index.js';
import { processArticleReferences, processBlankFillText } from '../articleProcessor.js';
import { characters } from '../data/characters.js';
import { HOME_SPEED_QUIZ_LAWS } from '../sharedSpeedQuizMain.js';
import { QAStatusSystem } from '../qaStatusSystem.js';
import { getAllLatestStudyRecords } from './casePage.js';
import { getLatestStudyRecord } from './casePage.js';
import { applyFolderColorsToMultipleBadges } from '../utils/folderColorUtils.js';

// 法令設定が利用可能になるまで待機
function waitForLawSettings() {
    return new Promise((resolve) => {
        if (window.getLawSettings) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.getLawSettings) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// QAStatusSystemのインスタンス作成
const qaStatusSystem = new QAStatusSystem();

// ★★★ モジュールバーの進捗表示を更新する関数 ★★★
function updateModuleProgressDisplay(moduleId) {
    // ホームページでない場合は何もしない
    if (!document.querySelector('[data-case-id]')) {
        return;
    }

    console.log(`🚀 モジュール進捗表示更新: ${moduleId}`);

    // 該当するモジュールカードを探す
    const moduleCard = document.querySelector(`[data-case-id="${moduleId}"]`);
    if (!moduleCard) {
        console.log(`🚀 モジュールカード見つからず: ${moduleId}`);
        return;
    }

    // 現在のケースデータを取得（window.caseSummariesから）
    const currentSummaries = window.caseSummaries || caseSummaries;
    const caseData = currentSummaries.find(c => c.id === moduleId);
    if (!caseData) {
        console.log(`🚀 ケースデータ見つからず: ${moduleId}`);
        return;
    }

    // モジュールファイルを動的に読み込んで最新のQ&Aデータを取得
    (async () => {
        try {
            const loader = (window.caseLoaders || caseLoaders)[moduleId];
            if (!loader) {
                console.log(`🚀 ローダー見つからず: ${moduleId}`);
                return;
            }

            const mod = await loader();
            const moduleData = mod.default;

            if (!moduleData.questionsAndAnswers || moduleData.questionsAndAnswers.length === 0) {
                return; // Q&Aがない場合は何もしない
            }

            // 完了割合を再計算（非同期に変更）
            const completionRatio = await calculateQACompletionRatio({ ...caseData, questionsAndAnswers: moduleData.questionsAndAnswers, id: moduleId });

            if (completionRatio && completionRatio.total > 0) {
                const percentage = Math.round(completionRatio.ratio * 100);
                const progressColor = percentage === 100 ? 'text-green-600 font-bold' : percentage >= 75 ? 'text-blue-600 font-semibold' : percentage >= 50 ? 'text-yellow-600 font-medium' : 'text-gray-600';

                // 進捗表示要素を更新
                const progressElement = moduleCard.querySelector('.text-sm.mt-2');
                if (progressElement) {
                    progressElement.className = `text-sm mt-2 ${progressColor}`;
                    progressElement.innerHTML = `<span style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${completionRatio.completed}/${completionRatio.total}</span> <span class="text-xs">完了</span>`;
                    console.log(`進捗表示更新完了: ${moduleId} (${completionRatio.completed}/${completionRatio.total})`);
                }
            } else {
                console.warn(`完了割合計算失敗: ${moduleId}`, { completionRatio, caseData: caseData ? 'exists' : 'null', moduleData: moduleData ? 'exists' : 'null' });
                // デフォルト表示
                const progressElement = moduleCard.querySelector('.text-sm.mt-2');
                if (progressElement) {
                    progressElement.className = `text-sm mt-2 text-gray-600`;
                    progressElement.innerHTML = `<span style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">0/0</span> <span class="text-xs">完了</span>`;
                }
            }
        } catch (error) {
            console.error(`? モジュール進捗表示更新エラー: ${moduleId}`, error);
        }
    })();
}

// グローバルに関数を公開
window.updateModuleProgressDisplay = updateModuleProgressDisplay;

/**
 * 学習記録用の日付を計算する関数（3:00-26:59の27時間制）
 * @param {Date} now - 現在時刻（省略時は現在時刻を使用）
 * @returns {string} - YYYY-MM-DD形式の日付
 */
function getStudyRecordDate(now = new Date()) {
    // Helper: format date as local YYYY-MM-DD (avoid toISOString which is UTC)
    function formatLocalDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    // 学習日のルール: 3:00～26:59（翌日の2:59まで）を一日とする
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 現在の時刻が3:00より前（0:00～2:59）の場合、前日の日付を返す
    if (hour < 3) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDate(yesterday);
    }

    // それ以外（3:00～23:59）の場合、当日の日付を返す
    return formatLocalDate(now);
}

// ═══════════════════════════════════════════════════════════════════════════
// カレンダー機能（シンプル＆モダンUI）
// ═══════════════════════════════════════════════════════════════════════════

const CALENDAR_CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
const calendarMonthCache = new Map();
let currentCalendarDate = new Date();

function getCalendarCacheKey(year, zeroBasedMonth) {
    return `${year}-${String(zeroBasedMonth + 1).padStart(2, '0')}`;
}

async function fetchCalendarMonthData(year, zeroBasedMonth) {
    const cacheKey = getCalendarCacheKey(year, zeroBasedMonth);
    const cached = calendarMonthCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CALENDAR_CLIENT_CACHE_TTL_MS) {
        return cached.data;
    }
    const monthParam = zeroBasedMonth + 1;
    const response = await fetch(`/api/calendar-study-records?year=${year}&month=${monthParam}`);
    if (!response.ok) throw new Error(`カレンダーデータの取得に失敗しました`);
    const data = await response.json();
    calendarMonthCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

async function getStudyRecordsForDate(targetDate) {
    if (!targetDate) return [];
    const [yearStr, monthStr] = targetDate.split('-');
    const year = Number(yearStr);
    const zeroBasedMonth = Number(monthStr) - 1;
    if (Number.isNaN(year) || Number.isNaN(zeroBasedMonth)) return [];
    try {
        const monthData = await fetchCalendarMonthData(year, zeroBasedMonth);
        return Array.isArray(monthData?.days?.[targetDate]) ? monthData.days[targetDate] : [];
    } catch (error) {
        console.error('学習記録取得エラー:', error);
        return [];
    }
}

async function getTodayStudyRecords() {
    const today = getStudyRecordDate();
    try {
        const records = await getStudyRecordsForDate(today);
        return { today, totalCount: records.length, records };
    } catch (error) {
        console.error('今日の学習記録取得エラー:', error);
        return { today, totalCount: 0, records: [] };
    }
}

function openCalendar() {
    let modal = document.getElementById('calendar-modal');
    if (!modal) {
        const html = `
        <div id="calendar-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col overflow-hidden">
                <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">📅</span>
                        <h3 class="font-bold text-xl">学習カレンダー</h3>
                    </div>
                    <button onclick="closeCalendar()" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">✕</button>
                </div>
                <div class="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
                    <button onclick="changeMonth(-1)" class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-semibold transition">◀ 前月</button>
                    <span id="calendar-month-year" class="font-bold text-xl text-gray-800"></span>
                    <button onclick="changeMonth(1)" class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-semibold transition">次月 ▶</button>
                </div>
                <div id="calendar-grid" class="flex-1 overflow-auto p-4"></div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('calendar-modal');
    }
    currentCalendarDate = new Date();
    renderCalendarGrid();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleCalendarEsc);
}

function closeCalendar() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleCalendarEsc);
    }
}

function handleCalendarEsc(e) { if (e.key === 'Escape') closeCalendar(); }

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendarGrid();
}

async function renderCalendarGrid() {
    const monthYearSpan = document.getElementById('calendar-month-year');
    const gridDiv = document.getElementById('calendar-grid');
    if (!monthYearSpan || !gridDiv) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    monthYearSpan.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const now = new Date();
    let effectiveToday = new Date(now);
    if (now.getHours() < 3) effectiveToday.setDate(effectiveToday.getDate() - 1);
    const todayStr = `${effectiveToday.getFullYear()}-${String(effectiveToday.getMonth() + 1).padStart(2, '0')}-${String(effectiveToday.getDate()).padStart(2, '0')}`;

    let monthData;
    try { monthData = await fetchCalendarMonthData(year, month); }
    catch { monthData = { days: {} }; }

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    let html = '<div class="grid grid-cols-7 gap-1">';

    // 曜日ヘッダー
    weekdays.forEach((d, i) => {
        const color = i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600';
        html += `<div class="h-10 flex items-center justify-center font-bold text-sm ${color} bg-gray-100 rounded">${d}</div>`;
    });

    // 空セル
    for (let i = 0; i < startWeekDay; i++) {
        html += `<div class="h-24 bg-gray-50 rounded"></div>`;
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const dayRecords = monthData?.days?.[dateStr] || [];

        // 学習/クイズをカウント
        const studyCount = dayRecords.filter(r => r.type === 'study').length;
        const quizEntry = dayRecords.find(r => r.type === 'quiz');
        const quizCount = quizEntry?.quizSummary?.count || 0;
        const quizAvg = quizEntry?.quizSummary?.avgScore || 0;
        const hasRecords = studyCount > 0 || quizCount > 0;

        let bgClass = 'bg-white hover:bg-gray-50';
        let borderClass = 'border border-gray-200';
        if (isToday) {
            bgClass = 'bg-indigo-50';
            borderClass = 'border-2 border-indigo-500 ring-2 ring-indigo-200';
        } else if (hasRecords) {
            bgClass = 'bg-green-50 hover:bg-green-100';
            borderClass = 'border border-green-300';
        }

        html += `<div class="h-24 ${bgClass} ${borderClass} rounded-lg p-2 cursor-pointer transition-all flex flex-col" onclick="showDateDetails('${dateStr}')">`;
        html += `<div class="font-bold text-lg ${isToday ? 'text-indigo-700' : hasRecords ? 'text-green-700' : 'text-gray-700'}">${day}</div>`;

        if (hasRecords) {
            html += '<div class="flex-1 flex flex-col justify-end gap-1">';
            if (studyCount > 0) {
                html += `<div class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold truncate">📚 ${studyCount}件</div>`;
            }
            if (quizCount > 0) {
                const icon = quizAvg >= 8 ? '◯' : quizAvg >= 3 ? '△' : '✕';
                const color = quizAvg >= 8 ? 'bg-green-100 text-green-700' : quizAvg >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                html += `<div class="text-xs ${color} px-2 py-0.5 rounded-full font-semibold truncate">⚡${quizCount}問 ${icon}${quizAvg}</div>`;
            }
            html += '</div>';
        }
        html += '</div>';
    }
    html += '</div>';
    gridDiv.innerHTML = html;
}

async function showDateDetails(dateStr) {
    const records = await getStudyRecordsForDate(dateStr);
    if (records.length === 0) return;

    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    // 学習記録とクイズを分離
    const studyRecords = records.filter(r => r.type === 'study');
    const quizEntry = records.find(r => r.type === 'quiz');

    let content = '';

    // 学習記録セクション
    if (studyRecords.length > 0) {
        content += '<div class="mb-6"><h4 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><span>📚</span>学習記録（' + studyRecords.length + '件）</h4>';
        content += '<div class="space-y-2">';
        studyRecords.forEach(r => {
            const folderColor = getCategoryColor(r.folderName);
            const time = r.studyRecord?.timestamp ? new Date(r.studyRecord.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '';
            content += `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition" onclick="closeDateDetail(); window.location.href='#/case/${r.id}'">
                <span class="px-2 py-1 text-xs font-bold rounded" style="background:${folderColor.bgColor};color:${folderColor.color}">${r.folderName}</span>
                <span class="flex-1 font-medium text-gray-800 truncate">${r.title}</span>
                <span class="text-xs text-gray-500">${time}</span>
                <span class="text-gray-400">→</span>
            </div>`;
        });
        content += '</div></div>';
    }

    // スピード条文セクション
    if (quizEntry?.quizSummary) {
        const qs = quizEntry.quizSummary;
        const icon = qs.avgScore >= 8 ? '◯' : qs.avgScore >= 3 ? '△' : '✕';
        const rankColor = qs.avgScore >= 8 ? 'text-green-600' : qs.avgScore >= 3 ? 'text-yellow-600' : 'text-red-600';
        const rankBg = qs.avgScore >= 8 ? 'bg-green-50' : qs.avgScore >= 3 ? 'bg-yellow-50' : 'bg-red-50';

        content += `<div class="mb-4"><h4 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><span>⚡</span>スピード条文</h4>`;
        content += `<div class="${rankBg} rounded-xl p-4">`;
        content += `<div class="flex items-center justify-between mb-4">`;
        content += `<div class="flex items-center gap-3"><span class="text-3xl font-black ${rankColor}">${icon}</span><div><div class="text-2xl font-bold text-gray-800">${qs.avgScore}点</div><div class="text-sm text-gray-500">平均スコア</div></div></div>`;
        content += `<div class="text-right"><div class="text-xl font-bold text-gray-800">${qs.count}問</div><div class="text-sm text-gray-500">挑戦</div></div>`;
        content += `</div>`;

        // 条文リスト（コンパクト）
        if (qs.articles && qs.articles.length > 0) {
            content += '<div class="flex flex-wrap gap-1">';
            qs.articles.forEach(a => {
                const sc = a.score;
                const color = sc >= 8 ? 'bg-green-200 text-green-800' : sc >= 3 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800';
                const scoreIcon = sc >= 8 ? '◯' : sc >= 3 ? '△' : '✕';
                content += `<span class="px-2 py-1 text-xs font-semibold rounded ${color}">${a.articleNumber.replace(/条$/, '')}${scoreIcon}${sc}</span>`;
            });
            content += '</div>';
        }
        content += '</div></div>';
    }

    const modalHtml = `
    <div id="date-detail-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] mx-4 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">📆</span>
                    <h3 class="font-bold text-lg">${formattedDate}</h3>
                </div>
                <button onclick="closeDateDetail()" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">✕</button>
            </div>
            <div class="flex-1 overflow-auto p-6">${content}</div>
        </div>
    </div>`;

    document.getElementById('date-detail-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleDateDetailEsc);
    closeCalendar();
}

function closeDateDetail() {
    const modal = document.getElementById('date-detail-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleDateDetailEsc);
    }
}

function handleDateDetailEsc(e) { if (e.key === 'Escape') closeDateDetail(); }

// グローバル公開
window.openCalendar = openCalendar;
window.closeCalendar = closeCalendar;
window.changeMonth = changeMonth;
window.showDateDetails = showDateDetails;
window.closeDateDetail = closeDateDetail;

// スピード条文詳細モーダルを開く関数
function openSpeedQuizDetailModal() {
    const data = window._speedQuizDetailData;
    if (!data || !data.quizByLaw || data.quizByLaw.length === 0) {
        console.warn('スピード条文データがありません');
        return;
    }

    const { quizByLaw, totalQuizAttempts } = data;
    // 全体のカウントを計算
    const kanpekiTotal = quizByLaw.reduce((sum, law) => sum + law.kanpeki.length, 0);
    const atosukoshiTotal = quizByLaw.reduce((sum, law) => sum + law.atosukoshi.length, 0);
    const madamadaTotal = quizByLaw.reduce((sum, law) => sum + law.madamada.length, 0);
    const kanpekiRate = totalQuizAttempts > 0 ? Math.round((kanpekiTotal / totalQuizAttempts) * 100) : 0;

    const escapeAttr = (value) => (value || '').toString().replace(/"/g, '&quot;');

    // 法令ごとのセクションを生成
    const lawSectionsHTML = quizByLaw.map(law => {
        const lawKanpekiRate = law.totalCount > 0 ? Math.round((law.kanpeki.length / law.totalCount) * 100) : 0;

        // カンペキ（8-10点）の条文ボタン
        const kanpekiButtons = law.kanpeki.map(item => `
            <button class="article-ref-btn bg-white hover:bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-300 transition-colors"
                data-law-name="${escapeAttr(item.lawName)}"
                data-article-ref="${escapeAttr(item.articleRef)}"
                data-display-name="${escapeAttr(item.displayName)}"
                title="${escapeAttr(item.fullRef)}">
                ${item.displayName}
            </button>
        `).join('');

        // あと少し（3-7点）の条文ボタン
        const atosukoshiButtons = law.atosukoshi.map(item => `
            <button class="article-ref-btn bg-white hover:bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-semibold border border-yellow-300 transition-colors"
                data-law-name="${escapeAttr(item.lawName)}"
                data-article-ref="${escapeAttr(item.articleRef)}"
                data-display-name="${escapeAttr(item.displayName)}"
                title="${escapeAttr(item.fullRef)}">
                ${item.displayName}
            </button>
        `).join('');

        // まだまだ（0-2点）の条文ボタン
        const madamadaButtons = law.madamada.map(item => `
            <button class="article-ref-btn bg-white hover:bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold border border-red-300 transition-colors"
                data-law-name="${escapeAttr(item.lawName)}"
                data-article-ref="${escapeAttr(item.articleRef)}"
                data-display-name="${escapeAttr(item.displayName)}"
                title="${escapeAttr(item.fullRef)}">
                ${item.displayName}
            </button>
        `).join('');

        return `
            <div class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold text-lg text-gray-800">${law.lawName}</h4>
                    <div class="flex items-center gap-3 text-sm">
                        <span class="text-gray-600">${law.totalCount}問</span>
                        <span class="text-green-600">◯${law.kanpeki.length}</span>
                        <span class="text-yellow-600">△${law.atosukoshi.length}</span>
                        <span class="text-red-600">✕${law.madamada.length}</span>
                        <span class="bg-gray-100 px-2 py-0.5 rounded font-semibold">${lawKanpekiRate}%</span>
                    </div>
                </div>
                ${law.kanpeki.length > 0 ? `
                    <div class="mb-3">
                        <div class="text-xs text-green-700 font-semibold mb-2">◯ カンペキ (${law.kanpeki.length})</div>
                        <div class="flex flex-wrap gap-2">${kanpekiButtons}</div>
                    </div>
                ` : ''}
                ${law.atosukoshi.length > 0 ? `
                    <div class="mb-3">
                        <div class="text-xs text-yellow-700 font-semibold mb-2">△ あと少し (${law.atosukoshi.length})</div>
                        <div class="flex flex-wrap gap-2">${atosukoshiButtons}</div>
                    </div>
                ` : ''}
                ${law.madamada.length > 0 ? `
                    <div>
                        <div class="text-xs text-red-700 font-semibold mb-2">✕ まだまだ (${law.madamada.length})</div>
                        <div class="flex flex-wrap gap-2">${madamadaButtons}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    const modalHTML = `
        <div id="speed-quiz-detail-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] mx-4 flex flex-col">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">⚡</span>
                        <h3 class="font-bold text-xl">スピード条文 詳細</h3>
                    </div>
                    <button onclick="closeSpeedQuizDetailModal()" class="px-3 py-1 bg-white/20 text-white rounded hover:bg-white/30 transition-colors">✕</button>
                </div>
                <div class="p-4 border-b border-gray-200 flex-shrink-0">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <span class="text-lg font-bold text-gray-800">${totalQuizAttempts}問</span>
                            <span class="flex items-center gap-1 text-green-600" title="カンペキ(8-10点)"><span>◯</span> ${kanpekiTotal}</span>
                            <span class="flex items-center gap-1 text-yellow-600" title="あと少し(3-7点)"><span>△</span> ${atosukoshiTotal}</span>
                            <span class="flex items-center gap-1 text-red-600" title="まだまだ(0-2点)"><span>✕</span> ${madamadaTotal}</span>
                        </div>
                        <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">${kanpekiRate}%</span>
                    </div>
                    <div class="text-sm text-gray-500 mt-1">${quizByLaw.length}法令を学習</div>
                </div>
                <div class="p-4 overflow-y-auto flex-1">
                    ${lawSectionsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    // 条文ボタンのイベント設定
    const modal = document.getElementById('speed-quiz-detail-modal');
    if (modal) {
        import('../articleProcessor.js').then(({ setupArticleRefButtons }) => {
            setupArticleRefButtons(modal);
        }).catch(err => console.error('articleProcessor読み込みエラー:', err));
    }

    // ESCキーで閉じる
    document.addEventListener('keydown', handleSpeedQuizDetailKeydown);
}

function closeSpeedQuizDetailModal() {
    const modal = document.getElementById('speed-quiz-detail-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleSpeedQuizDetailKeydown);
    }
}

function handleSpeedQuizDetailKeydown(event) {
    if (event.key === 'Escape') {
        closeSpeedQuizDetailModal();
    }
}

// グローバル関数として公開
window.showDateDetails = showDateDetails;
window.closeDateDetail = closeDateDetail;
window.openSpeedQuizDetailModal = openSpeedQuizDetailModal;
window.closeSpeedQuizDetailModal = closeSpeedQuizDetailModal;

/**
 * ケースIDから相対パスを取得するユーティリティ
 * @param {string} caseId - ケースID
 * @returns {Promise<string|null>} - 相対パス
 */
async function getRelativePathFromCaseId(caseId) {
    try {
        const { caseSummaries } = await import('../cases/index.js');
        const caseInfo = caseSummaries.find(c => c.id === caseId || c.originalId === caseId);
        if (caseInfo && caseInfo.filePath) {
            return caseInfo.filePath;
        }
    } catch (error) {
        console.warn('caseSummariesからの相対パス取得に失敗:', error);
    }

    // fallbackとしてIDベースの推測
    return caseId + '.js';
}

// ★★★ 学習記録表示を生成する関数 ★★★
async function generateStudyRecordDisplay(caseId) {
    try {
        console.log(`🚀 学習記録表示生成開始: ${caseId}`);

        // ケースIDから相対パスを取得
        const relativePath = await getRelativePathFromCaseId(caseId);
        console.log(`🚀 相対パス取得: ${caseId} → ${relativePath}`);

        // まず、相対パスを使用して個別ケースの学習記録を取得
        let studyRecord = null;
        try {
            const response = await fetch(`/api/get-study-record/${encodeURIComponent(relativePath)}`);
            const result = await response.json();
            console.log(`🚀 個別API取得結果: ${relativePath}`, result);

            if (result.success) {
                // todayRecord > latestRecord の優先順位で使用
                studyRecord = result.todayRecord || result.latestRecord;
                console.log(`? 個別API取得成功: ${relativePath}`, studyRecord);
            }
        } catch (error) {
            console.warn(`🚀 個別API取得失敗: ${relativePath}`, error);
        }

        // 個別取得で失敗した場合のフォールバック:
        // 重い全件スキャンはデフォルトで行わない（無限ループ抑止）。
        // 必要な場合はグローバルフラグ window.ALLOW_FULL_STUDY_RECORD_SCAN を true に設定してください。
        if (!studyRecord) {
            if (window.ALLOW_FULL_STUDY_RECORD_SCAN) {
                const studyRecords = await getAllLatestStudyRecords();
                console.log(`🚀 全学習記録取得結果:`, studyRecords);
                studyRecord = studyRecords[caseId];
                console.log(`🚀 全件から対象ケースの学習記録:`, studyRecord);
            } else {
                console.log('🚀 全件スキャンは無効化されています（window.ALLOW_FULL_STUDY_RECORD_SCAN 未設定）。個別取得の結果を使用します。');
            }
        }

        if (studyRecord && studyRecord.timestamp) {
            const recordDate = new Date(studyRecord.timestamp);
            const today = new Date();
            const diffTime = today - recordDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let displayText = '';
            let colorClass = '';

            if (diffDays === 0) {
                displayText = '今日学習済み';
                colorClass = 'text-green-600 font-bold';
            } else if (diffDays === 1) {
                displayText = '昨日学習';
                colorClass = 'text-blue-600 font-semibold';
            } else if (diffDays <= 7) {
                displayText = `${diffDays}日前に学習`;
                colorClass = 'text-yellow-600 font-medium';
            } else {
                displayText = `${diffDays}日前に学習`;
                colorClass = 'text-gray-600';
            }

            // ローカルタイムゾーンを考慮した日付表示
            const year = recordDate.getFullYear();
            const month = String(recordDate.getMonth() + 1).padStart(2, '0');
            const day = String(recordDate.getDate()).padStart(2, '0');
            const displayDate = `${year}/${month}/${day}`;

            return `<div class="text-xs mt-1 ${colorClass}">
                🚀 ${displayText} (${displayDate})
            </div>`;
        } else {
            console.log(`? 学習記録なし: ${caseId} - record:`, studyRecord);
            return `<div class="text-xs mt-1 text-gray-400">
                🚀 未学習
            </div>`;
        }
    } catch (error) {
        console.warn('学習記録表示の生成に失敗:', error);
        return `<div class="text-xs mt-1 text-gray-400">
            🚀 未学習
        </div>`;
    }
}

// ★★★ 全モジュールの学習記録を非同期で更新する関数 ★★★
async function updateAllStudyRecords(caseIds) {
    try {
        console.log('🚀 学習記録を更新中...', caseIds.length, '件');

        if (caseIds.length === 0) {
            console.log('? 更新対象なし - スキップ');
            return;
        }

        // 並列処理で高速化（最大10個同時）
        const batchSize = 10;
        const updatePromises = [];

        for (let i = 0; i < caseIds.length; i += batchSize) {
            const batch = caseIds.slice(i, i + batchSize);

            const batchPromise = Promise.all(batch.map(async (caseId) => {
                const studyRecordElement = document.getElementById(`study-record-${caseId}`);
                if (studyRecordElement) {
                    try {
                        const studyRecordHtml = await generateStudyRecordDisplay(caseId);

                        // outerHTMLではなくinnerHTMLで直接内容を変更
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = studyRecordHtml;
                        const newContent = tempDiv.firstChild;

                        studyRecordElement.className = newContent.className;
                        studyRecordElement.innerHTML = newContent.innerHTML;

                        return { caseId, success: true };
                    } catch (error) {
                        console.error(`? 学習記録更新失敗: ${caseId}`, error);
                        return { caseId, success: false, error };
                    }
                } else {
                    return { caseId, success: false, error: '要素が見つからない' };
                }
            }));

            updatePromises.push(batchPromise);
        }

        // すべてのバッチを並列実行
        const results = await Promise.all(updatePromises);
        const flatResults = results.flat();
        const successCount = flatResults.filter(r => r.success).length;

        console.log(`? 学習記録更新完了: ${successCount}/${flatResults.length}件成功`);
    } catch (error) {
        console.error('? 学習記録更新エラー:', error);
    }
}

// ★★★ 単一ケースの学習記録を更新する関数（グローバルアクセス用） ★★★
window.updateSingleStudyRecord = async function (caseId) {
    try {
        console.log(`🚀 単一学習記録更新開始: ${caseId}`);
        const studyRecordElement = document.getElementById(`study-record-${caseId}`);
        if (studyRecordElement) {
            // 少し待機してからAPIを呼び出し（ファイル保存の完了を待つ）
            await new Promise(resolve => setTimeout(resolve, 500));

            const studyRecordHtml = await generateStudyRecordDisplay(caseId);

            // outerHTMLではなくinnerHTMLで直接内容を変更
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = studyRecordHtml;
            const newContent = tempDiv.firstChild;

            studyRecordElement.className = newContent.className;
            studyRecordElement.innerHTML = newContent.innerHTML;

            console.log(`? 単一学習記録更新完了: ${caseId}`);

            // 強制的にページの再描画をトリガー
            document.body.offsetHeight;
        } else {
            console.warn(`? 学習記録要素が見つかりません: study-record-${caseId}`);
        }
    } catch (error) {
        console.error(`? 単一学習記録更新エラー: ${caseId}`, error);
    }
};

// ★★★ 学習記録全体更新のグローバル関数 ★★★
window.refreshAllStudyRecords = forceUpdateAllStudyRecords;

// ★★★ ストーリーキャラクター抽出関数 ★★★
function extractStoryCharactersFromCase(caseData) {
    // caseDataの基本チェック
    if (!caseData) {
        console.log('🚀 caseDataが未定義です');
        return [];
    }

    // 相対パスまたはタイトルをケース識別子として使用
    const caseIdentifier = caseData.filePath || caseData.title || 'Unknown';

    // インデックスに含まれるキャラクター情報があればそれを使用（高速化）
    if (Array.isArray(caseData.characters)) {
        const storyCharacters = caseData.characters
            .map(name => characters.find(c => c.name === name))
            .filter(character => character);
        return storyCharacters;
    }

    if (!caseData.story || !Array.isArray(caseData.story)) {
        console.log(`🚀 ${caseIdentifier}: ストーリーデータがありません (story: ${typeof caseData.story})`);
        return [];
    }

    const characterNames = new Set();

    caseData.story.forEach((item, index) => {
        if (item && item.type !== 'scene' && item.type !== 'narration' && item.type !== 'embed' && item.speaker) {
            characterNames.add(item.speaker);
        }
    });

    // charactersデータから該当するキャラクター情報を取得
    const storyCharacters = Array.from(characterNames)
        .map(name => characters.find(c => c.name === name))
        .filter(character => character); // 定義されているキャラクターのみ

    if (characterNames.size > 0) {
        console.log(`🚀 ${caseIdentifier}: 登場キャラクター`, Array.from(characterNames), '→', storyCharacters.map(c => c.name));
    }
    return storyCharacters;
}

// ★★★ モジュールバー用キャラクターギャラリー生成関数 ★★★
function buildModuleCharacterGallery(storyCharacters) {
    if (!storyCharacters || storyCharacters.length === 0) {
        return '';
    }

    console.log(`🚀 キャラクターギャラリー生成:`, storyCharacters.map(c => c.name));

    const characterItems = storyCharacters.map(character => {
        const iconSrc = `/images/${character.baseName}_normal.png`;
        return `
            <img 
                src="${iconSrc}" 
                alt="${character.name}" 
                class="character-module-icon"
                style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb; transition: transform 0.2s ease;"
                onmouseover="this.style.transform='scale(1.2)'"
                onmouseout="this.style.transform='scale(1)'"
                title="${character.name}"
            >
        `;
    }).join('');

    return `
        <div class="character-module-gallery flex flex-wrap gap-1 mt-2 mb-1" style="min-height: 48px;">
            ${characterItems}
        </div>
    `;
}

// ★★★ Q&A完了割合を計算する関数 ★★★
async function calculateQACompletionRatio(caseData) {
    if (!caseData.questionsAndAnswers || caseData.questionsAndAnswers.length === 0) {
        return { completed: 0, total: 0, ratio: 0 }; // Q&Aがない場合はデフォルト値を返す
    }

    const totalQAs = caseData.questionsAndAnswers.length;
    let completedQAs = 0;

    console.log(`🚀 Q&A完了割合計算開始: ${caseData.title || caseData.id}`);
    console.log(`🚀 総Q&A数: ${totalQAs}`);

    // 各Q&Aの完了状況をチェック（同期処理に変更してエラーを回避）
    for (const qa of caseData.questionsAndAnswers) {
        if (qa.id) {
            try {
                // まずモジュールファイルから直接取得を試行
                let status = '未';
                if (qa.status && window.qaStatusSystem.statuses.includes(qa.status)) {
                    status = qa.status;
                }

                console.log(`🚀 Q&A ${qa.id} (${caseData.id}) ステータス: ${status}`);
                // 最新のQ&Aシステムでは「済」が完了状態
                if (status === '済') {
                    completedQAs++;
                }
            } catch (error) {
                console.warn(`🚀 Q&A ${qa.id} ステータス取得エラー:`, error);
            }
        }
    }

    console.log(`? 完了Q&A数: ${completedQAs}/${totalQAs}`);

    return {
        completed: completedQAs,
        total: totalQAs,
        ratio: totalQAs > 0 ? (completedQAs / totalQAs) : 0
    };
}

// ★★★ Q&A完了率を非同期で更新する関数 ★★★
async function updateQACompletionAsync(caseId) {
    try {
        console.log(`🚀 Q&A完了率非同期更新開始: ${caseId}`);

        // ケースデータを読み込み
        const caseData = await loadCaseWithRank(caseId);
        if (!caseData) {
            console.warn(`🚀 ケースデータ取得失敗: ${caseId}`);
            return;
        }

        // Q&A完了率を計算
        const completionRatio = await calculateQACompletionRatio(caseData);

        // 表示要素を取得
        const qaElement = document.querySelector(`[data-qa-completion="${caseId}"]`);
        if (!qaElement) {
            console.warn(`🚀 Q&A完了率表示要素が見つかりません: ${caseId}`);
            return;
        }

        // 完了率を表示用に整形
        let statusText = '';
        let statusColor = '';

        // Q&A番号範囲を取得
        let qaRangeText = '';
        if (caseData.questionsAndAnswers && caseData.questionsAndAnswers.length > 0) {
            const ids = caseData.questionsAndAnswers.map(q => q.id).filter(id => typeof id === 'number');
            if (ids.length > 0) {
                const minId = Math.min(...ids);
                const maxId = Math.max(...ids);
                qaRangeText = `（${minId}～${maxId}）`;
            }
        }

        if (completionRatio.total === 0) {
            statusText = 'Q&Aなし';
            statusColor = 'text-gray-400';
        } else {
            // 「？/？（範囲）」形式で表示
            statusText = `${completionRatio.completed}/${completionRatio.total}${qaRangeText}`;

            // 割合に応じて色を変更
            if (completionRatio.ratio === 1) {
                statusColor = 'text-green-600'; // 100% - 緑
            } else if (completionRatio.ratio >= 0.8) {
                statusColor = 'text-green-500'; // 80%以上 - 薄緑
            } else if (completionRatio.ratio >= 0.6) {
                statusColor = 'text-blue-600'; // 60%以上 - 青
            } else if (completionRatio.ratio >= 0.4) {
                statusColor = 'text-yellow-600'; // 40%以上 - 黄
            } else if (completionRatio.ratio > 0) {
                statusColor = 'text-orange-600'; // 1%以上 - オレンジ
            } else {
                statusColor = 'text-gray-500'; // 0% - グレー
            }
        }

        // HTMLを更新（「完了」文字を削除）
        qaElement.innerHTML = `🚀 <span class="${statusColor}" style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${statusText}</span>`;

        console.log(`? Q&A完了率更新完了: ${caseId} - ${statusText}`);

    } catch (error) {
        console.error(`? Q&A完了率更新エラー: ${caseId}`, error);

        // エラー時はエラー表示（「完了」文字を削除）
        const qaElement = document.querySelector(`[data-qa-completion="${caseId}"]`);
        if (qaElement) {
            qaElement.innerHTML = '🚀 <span class="text-red-500" style="font-size: 1.1em; font-weight: bold;">エラー</span>';
        }
    }
}

// ★★★ デバッグ用：フォルダカラーテスト ★★★
async function testFolderColor() {
    console.log('🚀 フォルダカラーのテストを開始');
    const color = await getFolderColor('民法');
    console.log('🚀 民法のフォルダカラー:', color);
}

// グローバルでテスト関数を使用可能にする
window.testFolderColor = testFolderColor;

// ★★★ サブフォルダ情報を取得する関数 ★★★
async function getSubfoldersForCategory(category) {
    if (!category) return [];

    // Q&A科目リスト
    const qaSubjects = ['民法', '刑法', '刑事訴訟法', '民事訴訟法', '商法', '行政法', '憲法'];

    // Q&A科目の場合はQ&A JSONからサブカテゴリを取得
    if (qaSubjects.includes(category)) {
        try {
            const { loadQAData } = await import('../qaLoader.js');
            const qaData = await loadQAData(category);
            if (qaData && qaData.subcategories) {
                // サブカテゴリオブジェクトをソート済み配列に変換
                // 数字キー: 「番号.名前」形式、非数字キー: 「名前」のみ
                const sortedEntries = Object.entries(qaData.subcategories)
                    .sort(([keyA], [keyB]) => {
                        const isNumA = /^\d+$/.test(keyA);
                        const isNumB = /^\d+$/.test(keyB);
                        if (isNumA && isNumB) {
                            return parseInt(keyA, 10) - parseInt(keyB, 10);
                        } else if (isNumA) {
                            return -1; // 数字を先に
                        } else if (isNumB) {
                            return 1;  // 数字を先に
                        } else {
                            return keyA.localeCompare(keyB, 'ja'); // 非数字は五十音順
                        }
                    })
                    .map(([key, value]) => {
                        const isNumeric = /^\d+$/.test(key);
                        // 数字キー: 「1.総論」形式、非数字キー: キーそのまま（例: 「共犯」）
                        return isNumeric ? `${key}.${value}` : key;
                    });
                console.log(`📚 ${category} のサブカテゴリ:`, sortedEntries);
                return sortedEntries;
            }
        } catch (error) {
            console.warn(`Q&Aサブカテゴリの取得に失敗: ${category}`, error);
        }
        return [];
    }

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

        // caseSummariesから基本情報を取得し、完全なケースデータを追加
        const summary = currentSummaries.find(s => s.id === caseId);
        if (summary) {
            return {
                ...summary,
                rank: caseData.rank || caseData.difficulty || 'C',
                questionsAndAnswers: caseData.questionsAndAnswers || [],
                story: caseData.story || [], // ★★★ ストーリーデータを追加 ★★★
                title: caseData.title || summary.title,
                citation: caseData.citation || summary.citation
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
 * @param {string} mode - 表示モード ('qa': Q&Aリスト, 'speed': スピード条文)
 */
export async function renderHome(updateHistory = true, mode = null) {
    document.title = 'あたしンちスタディ';
    window.currentCaseData = null;
    window.pageLoadTime = Date.now(); // ページロード時間を記録

    // Q&Aステータスシステムをグローバルに設定
    window.qaStatusSystem = qaStatusSystem;

    // カレンダー機能をグローバルスコープで確実に利用可能にする
    console.log('🚀 renderHome: カレンダー機能を初期化中...');
    window.openCalendar = openCalendar;
    window.closeCalendar = closeCalendar;
    window.changeMonth = changeMonth;
    window.showDateDetails = showDateDetails;
    window.closeDateDetail = closeDateDetail;
    console.log('? renderHome: カレンダー機能が初期化されました');

    if (updateHistory) {
        history.pushState({ page: 'home' }, document.title, '#/');
    }

    // ★★★ フィルタリング用のデータ準備（動的取得） ★★★
    const currentSummaries = window.caseSummaries || caseSummaries;

    // Q&A科目をカテゴリに追加
    const qaSubjects = ['民法', '刑法', '刑事訴訟法', '民事訴訟法', '商法', '行政法', '憲法'];
    const moduleCategories = [...new Set(currentSummaries.map(c => c.category))];
    const allCategories = [...new Set([...qaSubjects, ...moduleCategories])].filter(c => c); // 空文字を除外

    const allTags = [...new Set(currentSummaries.flatMap(c => c.tags || []))]; const app = document.getElementById('app');
    app.innerHTML = `
        <!-- ★★★ 派手なアニメーション用CSS ★★★ -->
        <style>
            :root {
                --header-margin-top: -10px;
                --header-margin-bottom: -20px;
                --header-section-margin-bottom: -4px;
                --header-section-margin-top: -10px;
                --logo-max-width: min(640px, 80vw);
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
            
            .atashinchi-logo {
                max-width: var(--logo-max-width);
                width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
                transition: all 0.3s ease;
                filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
            }
            
            /* ★★★ AI切り替えスイッチのスタイル ★★★ */
            .ai-provider-btn {
                background-color: #e5e7eb;
                color: #6b7280;
                border: 2px solid transparent;
            }
            .ai-provider-btn:hover {
                background-color: #d1d5db;
            }
            .ai-provider-btn.active[data-provider="gemini"] {
                background: linear-gradient(135deg, #4285f4, #34a853);
                color: white;
                border-color: #1a73e8;
                box-shadow: 0 2px 8px rgba(66, 133, 244, 0.4);
            }
            .ai-provider-btn.active[data-provider="grok"] {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                border-color: #0f3460;
                box-shadow: 0 2px 8px rgba(15, 52, 96, 0.4);
            }
            .ai-provider-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .ai-provider-btn.unavailable {
                opacity: 0.4;
                text-decoration: line-through;
            }
            
            .subfolder-badge * {
                animation: none !important;
                transition: none !important;
                background-image: none !important;
            }
            
            .subfolder-badge::before {
                display: none; /* 完全に非表示 */
            }
            
            .case-card:hover .folder-badge {
                /* アニメーションを完全に削除 */
            }
            
        </style>
        
        <!-- ★★★ ヘッダー（ロゴ左・コントロール右） ★★★ -->
        <div class="flex items-start gap-6" style="margin-top: var(--header-section-margin-top); margin-bottom: var(--header-section-margin-bottom);">
            <!-- 左側：ロゴ -->
            <div class="flex-shrink-0" style="margin-top: var(--header-margin-top);">
                <img src="/images/logo.png" alt="あたしンちロゴ" class="atashinchi-logo object-contain" style="max-width: 280px;">
            </div>
            
            <!-- 右側：コントロールエリア -->
            <div class="flex-1 flex flex-col gap-3">
                <!-- 上段：AI切り替え + ログアウト -->
                <div class="flex justify-between items-center">
                    <!-- AI切り替えスイッチ -->
                    <div id="ai-provider-switch" class="flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
                        <span class="text-sm font-bold text-gray-700">🤖 AI:</span>
                        <button id="ai-gemini-btn" class="ai-provider-btn px-3 py-1 rounded-lg text-sm font-bold transition-all duration-200" data-provider="gemini">
                            Gemini
                        </button>
                        <button id="ai-grok-btn" class="ai-provider-btn px-3 py-1 rounded-lg text-sm font-bold transition-all duration-200" data-provider="grok">
                            Grok
                        </button>
                        <span id="ai-status-indicator" class="text-xs text-gray-500 ml-2">読込中...</span>
                    </div>
                    <!-- ユーザー情報＆コントロール -->
                    <div class="flex items-center gap-3">
                        <!-- キーボードショートカット -->
                        <button onclick="window.openShortcutsModal && window.openShortcutsModal()" 
                                class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" 
                                title="キーボードショートカット (?キー)">
                            <span class="text-lg">⌨️</span>
                        </button>
                        <div class="text-sm text-gray-600" id="user-info">
                            ログイン中...
                        </div>
                        <button id="logout-btn" class="btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition-all transform hover:scale-105 shadow-md text-sm">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            ログアウト
                        </button>
                    </div>
                </div>
                
                <!-- 下段：今日の学習記録（コンパクト版） -->
                <div id="today-study-records-placeholder" class="bg-white rounded-xl shadow-md p-3">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-bold text-gray-800 flex items-center gap-1">📚 今日の学習記録</h3>
                        <span class="text-xs text-gray-400">読込中...</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ★★★ フィルタリングパネル ★★★ -->
    <div class="bg-white rounded-xl shadow-lg p-4 mb-4" id="home-filter-panel">
            <div id="module-filter-panel">
                
                <!-- モジュール検索フィールド -->
                <div id="module-search-container">
                    <label class="block text-sm font-bold text-gray-700">モジュール名検索</label>
                    <input type="text" id="module-search" placeholder="モジュール名やタイトルで検索..." class="form-input w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500">
                </div>
                <!-- Q&A内容検索フィールド（Q&A一覧モード時のみ表示） -->
                <div id="qa-content-search-container" style="display: none;">
                    <label class="block text-sm font-bold text-gray-700">Q&A内容検索</label>
                    <input type="text" id="qa-content-search" placeholder="質問または解答の内容で検索..." class="form-input w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <!-- 完全に隙間なしの超密着レイアウト -->
                <div class="grid grid-cols-4 gap-1">
                    <!-- 第1列: カテゴリー（大きく表示） -->
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-0">カテゴリー</label>
                        <select id="category-filter" class="form-input w-full p-2 border rounded text-sm focus:ring-1 focus:ring-yellow-500">
                            <option value="">すべてのカテゴリー</option>
                            ${allCategories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
                        </select>
                        <!-- 所属フォルダの直下にフィルタクリア（隙間なし） -->
                        <button id="clear-filters" class="btn bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-1 rounded text-xs breathe-on-hover w-full mt-0">フィルタクリア</button>
                    </div>
                    <!-- 第2列: サブカテゴリー（大きく表示） -->
                    <div id="subfolder-filter-container" style="display: none;">
                        <label class="block text-sm font-bold text-gray-700 mb-0">サブカテゴリー</label>
                        <select id="subfolder-filter" class="form-input w-full p-2 border rounded text-sm focus:ring-1 focus:ring-yellow-500" disabled>
                            <option value="">カテゴリーを選択してください</option>
                        </select>
                        <!-- サブフォルダの直下に目次再生成（隙間なし） -->
                        <button id="regenerate-index" class="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-1 rounded text-xs rainbow-glow-on-hover w-full mt-0">目次再生成</button>
                    </div>
                    <!-- 第3-4列: 並び替えコントロール（2列分使用、検索件数表示あり） -->
                    <div class="col-span-2">
                        <div class="flex items-center gap-1 flex-wrap mt-0">
                            <label class="flex items-center gap-1">
                                <span class="text-xs font-bold text-gray-700">並び替え:</span>
                                <select id="sort-by" class="p-1 border rounded text-xs focus:ring-1 focus:ring-yellow-500">
                                    <option value="default">デフォルト順</option>
                                    <option value="title">タイトル順</option>
                                    <option value="rank">ランク順</option>
                                    <option value="qa-average">Q&A番号平均順</option>
                                </select>
                                <button id="sort-order-btn" class="px-1 py-1 text-xs border rounded hover:bg-gray-100 transition-colors" title="並び順を切り替え">
                                    <span id="sort-arrow">⬇️</span>
                                </button>
                            </label>
                            <span id="filter-results" class="text-xs text-gray-600"></span>
                        </div>
                    </div>
                </div>
                <!-- タグフィルター機能を無効化（検索結果は正常動作） -->
                <div id="tag-filter-container" style="display: none;">
                    <!-- タグチェックボックスが動的に生成される（非表示） -->
                </div>
                
                <div id="filter-grid-extended" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div id="status-filter-container" style="display: none;">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Q&Aステータス（複数選択可能）</label>
                        <div class="border rounded-lg p-2 bg-gray-50">
                            <div class="flex flex-wrap items-center gap-2">
                                <label class="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white/80 border rounded-full shadow-sm cursor-pointer hover:bg-white">
                                    <input type="checkbox" value="未" class="status-checkbox w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="inline-block px-1 text-gray-600">未</span>
                                </label>
                                <label class="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white/80 border rounded-full shadow-sm cursor-pointer hover:bg-white">
                                    <input type="checkbox" value="済" class="status-checkbox w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="inline-block px-1 text-green-700">済</span>
                                </label>
                                <label class="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white/80 border rounded-full shadow-sm cursor-pointer hover:bg-white">
                                    <input type="checkbox" value="要" class="status-checkbox w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="inline-block px-1 text-red-700">要</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div id="qa-rank-filter-container" style="display: none;">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Q&Aランク（複数選択可能）</label>
                        <div class="border rounded-lg p-2 bg-gray-50" id="qa-rank-checkboxes">
                            <!-- Q&Aランクチェックボックスが動的に生成される -->
                        </div>
                    </div>
                </div>

            </div>
            <div id="speed-quiz-filter-panel" class="hidden"></div>
            <div class="mt-4 pt-4 border-t border-gray-200" id="mode-toggle-panel">
                <p class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    表示モード
                    <span class="text-xs font-normal text-gray-500">（モジュール / Q&A）</span>
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                    <button id="show-modules-btn" class="view-toggle-btn flex-1 text-center font-bold py-3 px-4 rounded-lg bg-gray-100 text-gray-700 transition-all duration-200 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200 focus-visible:ring-offset-2">モジュール</button>
                    <button id="show-qa-list-btn" class="view-toggle-btn flex-1 text-center font-bold py-3 px-4 rounded-lg bg-gray-100 text-gray-700 transition-all duration-200 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200 focus-visible:ring-offset-2">Q&A一覧</button>
                </div>
                <!-- ★★★ インラインスピード条文セクション ★★★ -->
                <div id="inline-speed-quiz-section" class="mt-4"></div>
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
        
        <!-- ★★★ プレミアムフッター ★★★ -->
        <footer class="app-footer mt-16">
            <div class="footer-content">
                <div class="footer-logo">あたしンちスタディ</div>
                <div class="footer-links">
                    <button onclick="window.openShortcutsModal && window.openShortcutsModal()" class="footer-link cursor-pointer hover:text-indigo-500">
                        <span class="kbd mr-1">?</span> キーボードショートカット
                    </button>
                    <button onclick="window.openCalendar && window.openCalendar()" class="footer-link cursor-pointer hover:text-indigo-500">
                        📅 学習カレンダー
                    </button>
                </div>
                <div class="footer-copyright">
                    © 2024-2025 あたしンちスタディ. All rights reserved.
                </div>
                <div class="footer-version">
                    <span>✨</span>
                    <span>v2.0.0 Premium</span>
                </div>
            </div>
        </footer>
    `;

    // ★★★ 学習記録を非同期で読み込み ★★★
    setTimeout(() => {
        if (document.getElementById('today-study-records-placeholder')) {
            console.log('🚀 renderHome内：学習記録を読み込みます');
            loadAndDisplayTodayStudyRecords();
        }
    }, 100); // 短い遅延で実行

    // Q&A/モジュール切り替え状態（保存された設定から復元）
    let showQAListMode = false;
    let showSpeedQuizMode = false;

    // modeパラメータがある場合は優先
    if (mode === 'qa') {
        showQAListMode = true;
        showSpeedQuizMode = false;
    } else if (mode === 'speed') {
        showQAListMode = false;
        showSpeedQuizMode = true;
    } else {
        // 表示モード設定を読み込み
        try {
            const savedModeJSON = localStorage.getItem('atashinchi_display_mode');
            if (savedModeJSON) {
                const savedMode = JSON.parse(savedModeJSON);
                showQAListMode = savedMode.showQAListMode || false;
                showSpeedQuizMode = savedMode.showSpeedQuizMode || false;
                console.log('📊 表示モード設定を復元:', { QAリスト: showQAListMode, スピード条文: showSpeedQuizMode });
            }
        } catch (e) {
            console.error('表示モード設定の読み込みエラー:', e);
        }
    }

    // Q&A/モジュール切り替え用グローバル関数を先に宣言してwindowに登録
    window.renderFilteredModulesOrQAs = async function () {
        // フィルタパネル全体の表示/非表示を制御
        const filterPanel = document.querySelector('.bg-white.rounded-xl.shadow-lg.p-4.mb-4');
        const statusFilterContainer = document.getElementById('status-filter-container');
        const qaRankFilterContainer = document.getElementById('qa-rank-filter-container');
        const moduleFilterPanel = document.getElementById('module-filter-panel');
        const speedQuizFilterPanel = document.getElementById('speed-quiz-filter-panel');

        if (showSpeedQuizMode) {
            // スピード条文モード時もモジュールフィルタパネルを表示（共通フィルタ）
            if (filterPanel) {
                filterPanel.style.display = 'block';
            }
            if (moduleFilterPanel) {
                moduleFilterPanel.style.display = 'block'; // モジュール検索も表示
            }
            if (speedQuizFilterPanel) {
                speedQuizFilterPanel.classList.remove('hidden');
                renderSpeedFilterPanel();
            }
        } else {
            // モジュール一覧またはQ&Aモード時はフィルタパネルを表示
            if (filterPanel) {
                filterPanel.style.display = 'block';
            }
            if (moduleFilterPanel) {
                moduleFilterPanel.style.display = 'block';
            }
            if (speedQuizFilterPanel) {
                speedQuizFilterPanel.classList.add('hidden');
                speedQuizFilterPanel.innerHTML = '';
            }

            // ステータスフィルタとQ&Aランクフィルタの表示/非表示を切り替え
            if (statusFilterContainer && qaRankFilterContainer) {
                if (showQAListMode) {
                    statusFilterContainer.style.display = 'block';
                    qaRankFilterContainer.style.display = 'block';
                    // グリッドを5列に拡張（カテゴリ、サブフォルダ、タグ、ステータス、Q&Aランク）
                    const filterGrid = document.getElementById('filter-grid');
                    if (filterGrid) {
                        filterGrid.className = 'grid grid-cols-1 lg:grid-cols-5 gap-4 mb-3';
                    }
                } else {
                    statusFilterContainer.style.display = 'none';
                    qaRankFilterContainer.style.display = 'none';
                    // グリッドを3列に戻す（カテゴリ、サブフォルダ、タグ）
                    const filterGrid = document.getElementById('filter-grid');
                    if (filterGrid) {
                        filterGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3';
                    }
                }
            }
            // Q&A内容検索フィールドの表示/非表示を切り替え
            const qaContentSearchContainer = document.getElementById('qa-content-search-container');
            const moduleSearchContainer = document.getElementById('module-search-container');
            if (qaContentSearchContainer && moduleSearchContainer) {
                if (showQAListMode) {
                    qaContentSearchContainer.style.display = 'block';
                    moduleSearchContainer.style.display = 'none';
                } else {
                    qaContentSearchContainer.style.display = 'none';
                    moduleSearchContainer.style.display = 'block';
                }
            }
        }

        if (showSpeedQuizMode) {
            await renderSpeedQuizSection();
            // スピード条文モード時はセクションを非表示
            const speedSection = document.getElementById('inline-speed-quiz-section');
            if (speedSection) speedSection.innerHTML = '';
        } else if (showQAListMode) {
            await renderFilteredQAs({ showFilter: true }); // フィルタリングを有効化
            // Q&Aリストモード時は renderFilteredQAs 内で更新される
        } else {
            await renderFilteredModules();
            // モジュール表示後にスピード条文セクションを更新（フィルタされたモジュールから条文を抽出）
            updateInlineSpeedQuizForModules();
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
    const moduleBtn = document.getElementById('show-modules-btn');
    const qaListBtn = document.getElementById('show-qa-list-btn');
    const speedQuizBtn = document.getElementById('show-speed-quiz-btn');
    const baseToggleBtnClass = 'view-toggle-btn flex-1 text-center font-bold py-3 px-4 rounded-lg transition-all duration-200 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    if (moduleBtn) {
        moduleBtn.onclick = async () => {
            if (!showQAListMode && !showSpeedQuizMode) return;
            showQAListMode = false;
            showSpeedQuizMode = false;
            updateToggleButton();
            await renderFilteredModulesOrQAs();
        };
    }

    // Q&A/モジュール切り替えボタン生成
    if (qaListBtn) {
        qaListBtn.style.display = '';
        qaListBtn.onclick = async () => {
            if (showQAListMode && !showSpeedQuizMode) {
                showQAListMode = false;
            } else {
                showQAListMode = true;
                showSpeedQuizMode = false;
            }
            updateToggleButton();
            await renderFilteredModulesOrQAs();
        };
    }

    // ★★★ スピード条文ボタンの初期化 ★★★
    if (speedQuizBtn) {
        speedQuizBtn.style.display = '';
        speedQuizBtn.onclick = async () => {
            if (showSpeedQuizMode && !showQAListMode) {
                showSpeedQuizMode = false;
            } else {
                showSpeedQuizMode = true;
                showQAListMode = false;
            }
            updateToggleButton();
            await renderFilteredModulesOrQAs();
        };
    }

    // トグルボタンのラベル・色を切り替える関数
    function updateToggleButton() {
        const applyState = (button, isActive, activeClasses, inactiveClasses) => {
            if (!button) return;
            button.className = `${baseToggleBtnClass} ${isActive ? activeClasses : inactiveClasses}`;
        };

        applyState(moduleBtn, !showQAListMode && !showSpeedQuizMode,
            'bg-amber-500 text-white shadow-lg scale-[1.02] focus-visible:ring-amber-200',
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-200');

        applyState(qaListBtn, showQAListMode,
            'bg-blue-500 text-white shadow-lg scale-[1.02] focus-visible:ring-blue-200',
            'bg-blue-50 text-blue-800 hover:bg-blue-100 focus-visible:ring-blue-100');

        applyState(speedQuizBtn, showSpeedQuizMode,
            'bg-purple-500 text-white shadow-lg scale-[1.02] focus-visible:ring-purple-200',
            'bg-purple-50 text-purple-800 hover:bg-purple-100 focus-visible:ring-purple-100');
    }

    // 初期状態でボタンの見た目を設定（両方のボタンが取得された後）
    updateToggleButton();

    // フィルタリング機能を初期化（フィルタ設定の復元も含む）
    await initializeFiltering();

    // ★★★ ログアウト機能の初期化 ★★★
    initializeLogout();

    // フィルタ復元後に初期表示を実行
    if (mode === 'restore-modules') {
        // casePageから戻る場合、保存されたモジュール表示を復元
        console.log('🚀 casePageから戻るため、モジュール表示を復元');
        if (window.savedModulesContainer) {
            const modulesContainer = document.getElementById('modules-container');
            if (modulesContainer) {
                modulesContainer.innerHTML = window.savedModulesContainer;
                console.log('? モジュール表示を復元しました');
            }
        }
    } else {
        await renderFilteredModulesOrQAs();
    }
}

async function initializeFiltering() {
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    const moduleSearch = document.getElementById('module-search');
    const clearFilters = document.getElementById('clear-filters');
    const regenerateIndex = document.getElementById('regenerate-index');
    const sortBy = document.getElementById('sort-by');
    const sortOrderBtn = document.getElementById('sort-order-btn');
    const sortArrow = document.getElementById('sort-arrow');

    // 並び順の状態を管理（グローバル変数として定義）
    window.currentSortOrder = 'asc'; // デフォルトは昇順

    // モジュール検索フィールドの変更時
    moduleSearch.addEventListener('input', async function () {
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // Q&A内容検索フィールド（Enterキーで検索）
    const qaContentSearch = document.getElementById('qa-content-search');
    if (qaContentSearch) {
        qaContentSearch.addEventListener('keydown', async function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                await renderFilteredModulesOrQAs();
                saveFilterSettings(); // フィルター設定を保存
            }
        });
    }

    // カテゴリフィルタの変更時
    categoryFilter.addEventListener('change', async function () {
        await updateTagFilter();
        await updateSubfolderFilter(); // サブフォルダフィルタも更新
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
        updateSpeedFilterSummary(); // スピード条文サマリーも更新
    });

    // サブフォルダフィルタの変更時
    if (subfolderFilter) {
        subfolderFilter.addEventListener('change', async function () {
            await renderFilteredModulesOrQAs();
            saveFilterSettings(); // フィルター設定を保存
            updateSpeedFilterSummary(); // スピード条文サマリーも更新
        });
    } else {
        console.warn('subfolder-filter 要素が見つかりません。UIが完全に描画される前に initializeFiltering が呼び出されました。');
    }

    // 並び替えの変更時
    sortBy.addEventListener('change', async function () {
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // 並び順ボタンのクリックイベント
    sortOrderBtn.addEventListener('click', async function () {
        // 並び順を切り替え
        window.currentSortOrder = window.currentSortOrder === 'asc' ? 'desc' : 'asc';

        // 矢印の向きを更新
        sortArrow.textContent = window.currentSortOrder === 'asc' ? '✅' : '✅';

        // フィルタリングを実行
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // フィルタクリアボタン
    clearFilters.addEventListener('click', async function () {
        categoryFilter.value = '';
        const subfolderFilter = document.getElementById('subfolder-filter');
        if (subfolderFilter) {
            subfolderFilter.value = '';
        }
        const moduleSearch = document.getElementById('module-search');
        if (moduleSearch) {
            moduleSearch.value = '';
        }
        const qaContentSearchField = document.getElementById('qa-content-search');
        if (qaContentSearchField) {
            qaContentSearchField.value = '';
        }
        document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.status-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.qa-rank-checkbox').forEach(cb => cb.checked = false);
        sortBy.value = 'default';
        window.currentSortOrder = 'asc';
        sortArrow.textContent = '✅';
        await updateTagFilter();
        await updateSubfolderFilter(); // サブフォルダフィルタもクリア
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存（クリア状態）
    });

    // 目次再生成ボタン
    regenerateIndex.addEventListener('click', async function () {
        await handleIndexRegeneration();
    });

    // 初期タグフィルタを生成（レンダリングは抑制して、フィルター設定復元後に一度だけ行う）
    await updateTagFilter(false);
    await updateSubfolderFilter(false); // サブフォルダフィルタも初期化（非同期で処理される）
    updateStatusFilter(); // ステータスフィルタも初期化
    await updateQARankFilter(); // Q&Aランクフィルタも初期化

    // 保存されたフィルター設定を読み込む（ここでフィルター状態が復元される）
    await loadFilterSettings();
}

// ★★★ サブフォルダフィルターを更新する関数 ★★★
async function updateSubfolderFilter(triggerRender = true) {
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    const subfolderFilterContainer = document.getElementById('subfolder-filter-container');
    const filterGrid = document.getElementById('filter-grid');

    if (!subfolderFilter) {
        console.warn('🚀 subfolder-filter 要素が存在しないため、サブフォルダフィルタの更新をスキップします。');
        if (subfolderFilterContainer) {
            subfolderFilterContainer.style.display = 'none';
        }
        if (filterGrid) {
            filterGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3';
        }
        return;
    }
    const selectedCategory = categoryFilter.value;

    if (!selectedCategory) {
        // カテゴリが選択されていない場合はサブフォルダフィルタを非表示にする
        if (subfolderFilterContainer) {
            subfolderFilterContainer.style.display = 'none';
        }
        if (filterGrid) {
            filterGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3'; // 3列に変更
        }
        subfolderFilter.disabled = true;
        subfolderFilter.innerHTML = '<option value="">カテゴリーを選択してください</option>';
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
        subfolderFilter.innerHTML = '<option value="">サブカテゴリーなし</option>';
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
            <option value="">すべてのサブカテゴリー</option>
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

async function updateTagFilter(triggerRender = true) {
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
        cb.addEventListener('change', async function () {
            await renderFilteredModulesOrQAs();
            saveFilterSettings(); // タグ変更時も設定を保存
        });
    });

    // 必要に応じてレンダリングを実行
    if (triggerRender) {
        await renderFilteredModulesOrQAs();
    }
}

// Q&A専用ランクフィルタを更新する関数
async function updateQARankFilter() {
    const qaRankContainer = document.getElementById('qa-rank-checkboxes');
    if (!qaRankContainer) return;

    // 全Q&Aから実際に使用されているランクを収集
    const currentSummaries = window.caseSummaries || caseSummaries;
    const qaRanks = new Set();

    for (const summary of currentSummaries) {
        try {
            const loader = (window.caseLoaders || caseLoaders)[summary.id];
            if (!loader) continue;
            const mod = await loader();
            const caseData = mod.default;
            (caseData.questionsAndAnswers || []).forEach(qa => {
                const qaRank = qa.rank || qa.difficulty || '';
                if (qaRank) {
                    const cleanRank = qaRank.replace(/ランク$/, '').replace(/\s/g, '').toUpperCase();
                    if (cleanRank) qaRanks.add(cleanRank);
                }
            });
        } catch (e) { /* skip error */ }
    }

    // 標準的なランク一覧も追加（S, A, B, C の順序で表示）
    const standardRanks = ['S', 'A', 'B', 'C'];
    standardRanks.forEach(rank => qaRanks.add(rank));

    // ランクを適切な順序でソート
    const availableQARanks = standardRanks.filter(rank => qaRanks.has(rank));

    // 保存されたQ&Aランクフィルター設定を取得
    let savedQARanks = [];
    try {
        const savedSettingsJSON = localStorage.getItem('atashinchi_filter_settings');
        if (savedSettingsJSON) {
            const savedSettings = JSON.parse(savedSettingsJSON);
            if (savedSettings.qaRanks) {
                // savedSettings.qaRanksが配列の場合はそのまま使用、オブジェクトの場合は空配列
                if (Array.isArray(savedSettings.qaRanks)) {
                    savedQARanks = savedSettings.qaRanks;
                } else if (typeof savedSettings.qaRanks === 'object') {
                    // オブジェクト形式の場合、trueの値を持つキーを配列に変換
                    savedQARanks = Object.keys(savedSettings.qaRanks).filter(key => savedSettings.qaRanks[key]);
                }
            }
        }
    } catch (e) { /* エラー無視 */ }

    // Q&Aランクチェックボックス生成
    qaRankContainer.innerHTML = `
        <div class="flex flex-wrap items-center gap-2">
            ${availableQARanks.map(rank => {
        const diffClass = getDifficultyClass(rank);
        return `
                    <label class="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white/80 border rounded-full shadow-sm cursor-pointer hover:bg-white">
                        <input type="checkbox" value="${rank}" class="qa-rank-checkbox w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${savedQARanks.includes(rank) ? 'checked' : ''}>
                        <span class="inline-block px-2 py-0.5 rounded ${diffClass.text} ${diffClass.bg}">${rank}</span>
                    </label>
                `;
    }).join('')}
        </div>
    `;

    // チェックボックスにイベントリスナーを付与
    qaRankContainer.querySelectorAll('.qa-rank-checkbox').forEach(cb => {
        cb.addEventListener('change', async function () {
            await renderFilteredModulesOrQAs();
            saveFilterSettings(); // Q&Aランク変更時も設定を保存
        });
    });
}

function updateStatusFilter() {
    // ステータスチェックボックスにイベントリスナーを付与
    document.querySelectorAll('.status-checkbox').forEach(cb => {
        cb.addEventListener('change', async function () {
            await renderFilteredModulesOrQAs();
            saveFilterSettings(); // ステータス変更時も設定を保存
        });
    });
}

function getSelectedStatuses() {
    const checkboxes = document.querySelectorAll('.status-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedQARanks() {
    const checkboxes = document.querySelectorAll('.qa-rank-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedRanks() {
    // モジュールランクフィルター用（削除されたため空配列を返す）
    return [];
}

function getSelectedTags() {
    const checkboxes = document.querySelectorAll('.tag-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getDifficultyClass(rank) {
    // 統一されたRANK_COLORSを使用してランク表示を生成
    const cleanRank = (rank || '').replace(/ランク$/, '').replace(/\s/g, '').toUpperCase();
    const colorInfo = getRankColor(cleanRank);

    if (!colorInfo || colorInfo.bgColor === '#f9fafb') {
        // デフォルト（ランクなし）
        return { text: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200', display: '' };
    }

    // RANK_COLORSの色をTailwind CSS形式に変換
    return {
        text: `text-white`, // 統一されたテキスト色
        bg: `bg-[${colorInfo.bgColor}]`, // カスタム背景色
        border: `border-[${colorInfo.borderColor}]`, // カスタムボーダー色
        display: cleanRank
    };
}

function getSortSettings() {
    const sortBy = document.getElementById('sort-by');
    // グローバル変数currentSortOrderを使用
    return {
        sortBy: sortBy ? sortBy.value : 'default',
        sortOrder: window.currentSortOrder || 'asc'
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
                const rankA = (a.rank || '').replace(/ランク$/, '').replace(/\s/g, '').toUpperCase();
                const rankB = (b.rank || '').replace(/ランク$/, '').replace(/\s/g, '').toUpperCase();
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

async function renderFilteredModules() {
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    const filterResults = document.getElementById('filter-results');
    const modulesContainer = document.getElementById('modules-container');

    // 必須要素の存在確認
    if (!categoryFilter) {
        console.warn('🚀 category-filter要素が見つかりません。renderFilteredModulesをスキップします。');
        return;
    }

    const selectedCategory = categoryFilter.value;
    const selectedSubfolder = subfolderFilter ? subfolderFilter.value : '';
    const selectedTags = getSelectedTags();
    const { sortBy, sortOrder } = getSortSettings();

    // 初回ロードかどうかを判定（ページロードから2秒以内、またはスキップフラグ）
    const isInitialLoad = Date.now() - (window.pageLoadTime || 0) < 2000 || window.skipAnimationOnNextRender;

    // スキップフラグをリセット
    if (window.skipAnimationOnNextRender) {
        window.skipAnimationOnNextRender = false;
    }

    // ローディング表示（初回ロード時はスキップ）
    if (!isInitialLoad) {
        modulesContainer.innerHTML = '<div class="text-center p-12"><div class="loader">読み込み中...</div></div>';
    }

    try {
        // 最新のcaseSummariesを取得（再生成後の場合はwindowから）
        const currentSummaries = window.caseSummaries || caseSummaries;

        // ★★★ 修正: 全件ロードを廃止し、caseSummariesの情報を直接使用 ★★★
        // ランク情報はビルド時にcaseSummariesに含まれるようになったため、動的ロードは不要
        const allCasesWithRank = currentSummaries;

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

        // 結果表示
        filterResults.textContent = `${filteredCases.length}件`;

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

        // ★★★ 共通カードレンダリング関数 (Premium) ★★★
        const renderPremiumCard = (c) => {
            const rankValue = c.rank || '';
            const diffClass = getDifficultyClass(rankValue);

            // Q&A完了割合表示
            let qaCompletionDisplay = `<div class="text-sm mt-3 text-gray-500 font-medium" data-qa-completion="${c.id}">
                🚀 <span class="animate-pulse">計算中...</span>
            </div>`;

            setTimeout(() => updateQACompletionAsync(c.id), 100 + Math.random() * 2000);

            // サブフォルダ名の特定
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
            <div data-case-id="${c.id}" class="card-premium relative overflow-hidden group border border-gray-100 rounded-2xl bg-white shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col">
                <div class="shine-effect"></div>
                <div class="p-5 flex-grow relative z-10 flex flex-col">
                    <div class="flex justify-between items-start mb-3">
                        <span class="inline-block px-3 py-1 rounded-xl text-lg font-extrabold border ${diffClass.text} ${diffClass.bg} ${diffClass.border} shadow-sm" style="min-width:2.5em; text-align:center; font-size:1.1rem; letter-spacing:0.05em;">${diffClass.display}</span>
                        <div class="flex flex-col items-end gap-1">
                            <div class="folder-badge text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-black/5 transform hover:scale-105 transition-transform cursor-pointer" data-category="${c.category || 'その他'}" style="${generateCategoryBadgeStyle(c.category || 'その他')}">
                                ${generateCategoryBadge(c.category || 'その他')}
                            </div>
                            ${subfolderName ? `
                                <div class="subfolder-badge text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-black/5 transform hover:scale-105 transition-transform cursor-pointer" style="${generateCategoryBadgeStyle(subfolderName)}">
                                    ${generateCategoryBadge(subfolderName, true)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-2 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">${c.title}</h3>
                    <p class="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg inline-block border border-gray-100 self-start">${c.citation}</p>
                    
                    <div class="mt-auto">
                        <div class="character-gallery-small mb-2">${buildModuleCharacterGallery(extractStoryCharactersFromCase(c))}</div>
                        ${qaCompletionDisplay}
                        <div id="study-record-${c.id}" class="text-xs mt-3 pt-3 border-t border-gray-100 flex items-center justify-between" data-case-id="${c.id}">
                            <div class="animate-pulse h-3 bg-gray-100 rounded w-24"></div>
                        </div>
                    </div>
                    
                    <!-- 編集ボタン -->
                    <button class="edit-module-btn absolute bottom-3 right-3 text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-blue-50 z-20" data-file-path="${c.filePath}" title="VSCodeで編集">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                </div>
            </div>
            `;
        };

        // HTML生成
        if (Object.keys(categories).length === 0) {
            modulesContainer.innerHTML = `
                <div class="text-center p-12">
                    <p class="text-gray-500 text-lg">該当するモジュールが見つかりませんでした</p>
                    <button id="clear-filters-empty" class="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">フィルタをクリア</button>
                </div>
            `;

            // 空の結果でのクリアボタン
            document.getElementById('clear-filters-empty').addEventListener('click', function () {
                categoryFilter.value = '';
                const moduleSearch = document.getElementById('module-search');
                if (moduleSearch) {
                    moduleSearch.value = '';
                }
                document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
                document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
                updateTagFilter();
                renderFilteredModules();
            });
        } else {
            // サブフォルダグループ表示の場合
            if (selectedCategory && selectedSubfolder === '') {
                const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                const allCases = categories[categoryName] || [];

                const subfolderGroups = {};
                allCases.forEach(c => {
                    let subfolderName = 'その他';
                    if (c.subfolder && c.subfolder.trim() !== '') {
                        subfolderName = c.subfolder;
                    } else if (c.id && c.id.includes('/')) {
                        const pathParts = c.id.split('/');
                        if (pathParts.length >= 2) {
                            subfolderName = pathParts[1];
                        }
                    }
                    subfolderGroups[subfolderName] = subfolderGroups[subfolderName] || [];
                    subfolderGroups[subfolderName].push(c);
                });

                const sortedSubfolders = Object.keys(subfolderGroups).sort((a, b) => {
                    const getNumber = (name) => {
                        const match = name.match(/^(\d+)\./);
                        return match ? parseInt(match[1], 10) : 999;
                    };
                    return getNumber(a) - getNumber(b);
                });

                modulesContainer.innerHTML = `
                    <div class="mb-8">
                       ${sortedSubfolders.map(subfolderName => {
                    const cases = subfolderGroups[subfolderName];
                    return `
                                <div class="mb-10">
                                    <h4 class="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <span class="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                                        ${subfolderName}
                                        <span class="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">${cases.length}</span>
                                    </h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
                                        ${cases.map(c => renderPremiumCard(c)).join('')}
                                    </div>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;

            } else {
                // 通常表示（カテゴリ別）
                modulesContainer.innerHTML = Object.entries(categories).map(([category, cases]) => {
                    const INITIAL_DISPLAY_COUNT = 8;
                    const hasMore = cases.length > INITIAL_DISPLAY_COUNT;
                    const displayCases = hasMore ? cases.slice(0, INITIAL_DISPLAY_COUNT) : cases;

                    return `
                    <div class="mb-10" id="category-section-${category}">
                        <h3 class="text-2xl font-bold border-b border-gray-200 pb-3 mb-6 capitalize flex items-center gap-3">
                            <span class="text-3xl">📂</span> ${category}
                            <span class="text-sm font-normal text-white bg-gray-400 px-3 py-1 rounded-full shadow-sm">${cases.length}</span>
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="category-grid-${category}">
                            ${displayCases.map(c => renderPremiumCard(c)).join('')}
                        </div>
                        ${hasMore ? `
                            <div class="text-center mt-8">
                                <button class="show-more-btn group relative overflow-hidden bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 px-8 rounded-full transition-all border-2 border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md" data-category="${category}">
                                    <span class="relative z-10 flex items-center gap-2">
                                        もっと見る 
                                        <span class="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full group-hover:bg-indigo-200 transition-colors">${cases.length - INITIAL_DISPLAY_COUNT}件</span>
                                    </span>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `}).join('');

                // もっと見るボタンのイベント
                document.querySelectorAll('.show-more-btn').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const category = this.getAttribute('data-category');
                        const cases = categories[category];
                        const grid = document.getElementById(`category-grid-${category}`);
                        const currentCount = grid.children.length;
                        const remainingCases = cases.slice(currentCount);
                        const fragment = document.createDocumentFragment();
                        const tempDiv = document.createElement('div');

                        remainingCases.forEach(c => {
                            tempDiv.innerHTML = renderPremiumCard(c);
                            while (tempDiv.firstChild) {
                                fragment.appendChild(tempDiv.firstChild);
                            }
                        });

                        grid.appendChild(fragment);
                        this.parentElement.remove();
                    });
                });
            }
        }

        // イベント委譲（クリック処理）
        if (!modulesContainer.hasAttribute('data-click-listener')) {
            modulesContainer.addEventListener('click', async function (e) {
                // 編集ボタン
                const editBtn = e.target.closest('.edit-module-btn');
                if (editBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const filePath = editBtn.getAttribute('data-file-path');
                    if (filePath) {
                        try {
                            const response = await fetch('/api/open-file', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ filePath })
                            });
                            console.log('ファイルを開きました:', filePath);
                        } catch (error) {
                            console.error('API呼び出しエラー:', error);
                        }
                    }
                    return;
                }

                // カードクリック（全体、ただし編集ボタン以外）
                const card = e.target.closest('.card-premium');
                if (card) {
                    const caseId = card.getAttribute('data-case-id');
                    if (caseId) {
                        window.location.hash = `#/case/${caseId}`;
                    }
                }
            });
            modulesContainer.setAttribute('data-click-listener', 'true');
        }

        // バッジカラー適用
        const folderBadges = document.querySelectorAll('.folder-badge, .subfolder-badge');
        await applyFolderColorsToMultipleBadges(folderBadges, (badge) => badge.getAttribute('data-category'));
        applyCategoryBadgeStyles();

        // 学習記録更新（非同期）
        const allCaseIds = filteredCases.map(c => c.id);
        setTimeout(async () => {
            await updateAllStudyRecords(allCaseIds);
        }, 100);

        await updateAllStudyRecords(allCaseIds);

    } catch (error) {
        console.error('ケースデータの読み込みエラー:', error);
        modulesContainer.innerHTML = `
            <div class="text-center p-12">
                <p class="text-red-500 text-lg">データの読み込みに失敗しました</p>
                <button onclick="safeReload()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">再読み込み</button>
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
    regenerateBtn.innerHTML = '🚀 処理中...';
    messageP.textContent = '目次ファイルを再生成中...';

    try {
        // サーバーAPIを呼び出し
        console.log('🔥 目次再生成APIを呼び出し中...');
        const response = await fetch('/api/regenerate-case-index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('? 目次再生成API応答:', result);

        if (result.success) {
            messageP.textContent = `? 目次再生成完了！ (${result.casesCount}件のケースを処理)`;

            console.log('🚀 目次ファイル再読み込み開始...');
            // 目次ファイルを動的に再読み込み
            await reloadCaseIndex();

            console.log('🚀 フィルター更新開始...');
            // フィルターとモジュール表示を更新（非同期で実行）
            await updateFiltersAfterRegeneration();

            console.log('🚀 モジュール表示更新開始...');
            await renderFilteredModules();

            // casePageのデータも更新
            if (window.currentCaseData && window.currentCaseData.id) {
                console.log('🚀 casePageのデータも更新');
                // casePageのloadAndRenderCaseを呼ぶ
                if (window.loadAndRenderCase) {
                    await window.loadAndRenderCase(window.currentCaseData.id, false);
                }
            }

            console.log('? 目次再生成プロセス完了');

            // 3秒後に成功メッセージを非表示
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 3000);

        } else {
            messageP.textContent = `? エラー: ${result.error}`;
            statusDiv.className = 'bg-red-50 border-l-4 border-red-400 p-4 mb-4';
        }

    } catch (error) {
        console.error('目次再生成エラー:', error);
        messageP.textContent = `? 通信エラー: ${error.message}`;
        statusDiv.className = 'bg-red-50 border-l-4 border-red-400 p-4 mb-4';
    } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = '目次再生成';
    }
}

/**
 * 今日の学習記録セクションを動的に読み込んで表示する関数
 */
async function loadAndDisplayTodayStudyRecords() {
    console.log('🚀 学習記録セクションの動的読み込み開始');

    try {
        const placeholder = document.getElementById('today-study-records-placeholder');
        if (!placeholder) {
            console.warn('🚀 学習記録プレースホルダーが見つかりません');
            return;
        }

        // 学習記録HTMLを生成
        const studyRecordsHTML = await generateTodayStudyRecordsHTML();

        // プレースホルダーを実際の学習記録に置き換え（安全な置換: outerHTML は親が無いと例外になる）
        if (placeholder && placeholder.parentNode) {
            try {
                // 親ノードがある場合は安全に挿入してからプレースホルダーを削除する
                placeholder.insertAdjacentHTML('afterend', studyRecordsHTML);
                placeholder.remove();
            } catch (e) {
                console.warn('プレースホルダーの安全な置換に失敗しました。フォールバックを試みます:', e);
                try {
                    // 最後の手段として outerHTML を試す（既に親がない場合は失敗する可能性あり）
                    placeholder.outerHTML = studyRecordsHTML;
                } catch (e2) {
                    console.error('フォールバック outerHTML も失敗しました:', e2);
                }
            }
        } else {
            console.warn('🚀 プレースホルダーに親ノードがありません。学習記録の挿入をスキップします');
        }

        // カテゴリバッジのスタイルを適用
        setTimeout(() => {
            applyCategoryBadgeStyles();
            console.log('🚀 学習記録のカテゴリバッジスタイルを適用しました');
        }, 100);

        console.log('? 学習記録セクションの表示完了');

    } catch (error) {
        console.error('? 学習記録読み込みエラー:', error);

        // エラー時のフォールバック表示
        const placeholder = document.getElementById('today-study-records-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800 mb-4">📚 今日の学習記録</h3>
                <div class="text-center text-red-500 py-8">
                    <div class="text-2xl mb-2">?</div>
                    <p>学習記録の読み込みに失敗しました</p>
                    <p class="text-sm">${error.message}</p>
                    <button onclick="loadAndDisplayTodayStudyRecords()" 
                            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        再読み込み
                    </button>
                </div>
            `;
        }
    }
}

/**
 * 目次ファイルを動的に再読み込みする関数
 */
async function reloadCaseIndex() {
    try {
        // モジュールキャッシュをクリアするためにタイムスタンプを付与
        const timestamp = Date.now();
        console.log('🚀 目次ファイル再読み込み開始:', { timestamp });

        const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
        console.log('? 新しいindex.jsを読み込み完了:', {
            caseSummariesLength: indexModule.caseSummaries.length,
            sampleCategories: indexModule.caseSummaries.slice(0, 3).map(s => ({ category: s.category, subfolder: s.subfolder }))
        });

        // 再生成後は index.js のエクスポートそのものを使用する（初回起動時と同一挙動に揃える）
        window.caseSummaries = indexModule.caseSummaries;
        window.caseLoaders = indexModule.caseLoaders;

        console.log(`🚀 目次ファイル再読み込み完了 (${indexModule.caseSummaries.length}件)`);
        console.log('🚀 ローダーは index.js の export をそのまま採用');

    } catch (error) {
        console.error('目次ファイル再読み込みエラー:', error);
        throw error;
    }
}

/**
 * 目次再生成後にフィルター選択肢を更新する関数
 */
async function updateFiltersAfterRegeneration() {
    // 新しいcaseSummariesを使用してフィルター選択肢を再構築
    const summaries = window.caseSummaries || caseSummaries;

    console.log('🚀 フィルター更新開始:', {
        summariesLength: summaries.length,
        sampleSummaries: summaries.slice(0, 3).map(s => ({ id: s.id, category: s.category, subfolder: s.subfolder }))
    });

    // カテゴリフィルターを更新
    const categoryFilter = document.getElementById('category-filter');
    const currentCategory = categoryFilter.value;
    const allCategories = [...new Set(summaries.map(c => c.category))];

    categoryFilter.innerHTML = `
        <option value="">すべてのフォルダ</option>
        ${allCategories.map(cat => `<option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
    `;

    // タグフィルターを更新（非同期）
    await updateTagFilter();
    await updateSubfolderFilter(); // サブフォルダフィルターも更新（非同期）

    console.log('🚀 フィルター選択肢を更新しました:', {
        categories: allCategories.length,
        currentCategory
    });
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
                    <div class="font-semibold text-gray-700">🚀 ${data.username}</div>
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
    // 統一されたQ&A表示機能をインポート
    const { renderQAList, setupQAListEventHandlers } = await import('../qaRenderer.js');

    // container: 表示先DOM、qaList: 表示するQ&A配列、showFilter: フィルタUIを表示するか
    let modulesContainer = container || document.getElementById('modules-container');
    if (!modulesContainer) return;
    modulesContainer.innerHTML = '<div class="text-center p-12"><div class="loader">読み込み中...</div></div>';

    let allQAs = qaList;

    // フィルタ条件を先に取得（トップページの場合）
    let moduleSearchTerm = '';
    let selectedCategory = '';
    let selectedSubfolder = '';
    let selectedTags = [];
    let selectedRanks = [];
    let selectedStatuses = [];
    let selectedQARanks = [];
    let hasActiveQAFilters = false;

    let qaContentSearchTerm = '';
    if (showFilter) {
        moduleSearchTerm = document.getElementById('module-search')?.value.toLowerCase() || '';
        qaContentSearchTerm = document.getElementById('qa-content-search')?.value.toLowerCase() || '';
        selectedCategory = document.getElementById('category-filter')?.value || '';
        selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
        selectedRanks = Array.from(document.querySelectorAll('.rank-checkbox:checked')).map(cb => cb.value);
        selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
        selectedStatuses = Array.from(document.querySelectorAll('.status-checkbox:checked')).map(cb => cb.value);
        selectedQARanks = Array.from(document.querySelectorAll('.qa-rank-checkbox:checked')).map(cb => cb.value);

        hasActiveQAFilters = Boolean(
            moduleSearchTerm ||
            qaContentSearchTerm ||
            selectedCategory ||
            selectedSubfolder ||
            selectedRanks.length ||
            selectedTags.length ||
            selectedStatuses.length ||
            selectedQARanks.length
        );
    }

    if (!allQAs) {
        // トップページ用: Q&A JSONファイルから読み込み
        // ★★★ 最適化: フィルター状態に応じて必要最小限のファイルのみ読み込む ★★★
        const { getQAsBySubject, getQAsBySubjectAndSubcategory, AVAILABLE_SUBJECTS } = await import('../qaLoader.js');

        // Q&A科目かどうかを判定
        const isQASubject = selectedCategory && AVAILABLE_SUBJECTS.includes(selectedCategory);

        try {
            let rawQAs = [];

            // ★★★ 最速: カテゴリ＋サブフォルダが選択されている場合 → 単一ファイルのみ読み込む ★★★
            if (isQASubject && selectedSubfolder) {
                // サブフォルダ名からサブカテゴリIDを抽出
                // 「1.総論」形式の場合は数字部分を抽出、「共犯」形式の場合はそのまま使用
                const subcategoryIdMatch = selectedSubfolder.match(/^(\d+)\./);
                const subcategoryId = subcategoryIdMatch ? subcategoryIdMatch[1] : selectedSubfolder;
                console.log(`⚡ 高速モード: ${selectedCategory}/${subcategoryId} のみ読み込み`);
                rawQAs = await getQAsBySubjectAndSubcategory(selectedCategory, subcategoryId);
            } else if (isQASubject) {
                // カテゴリ（科目）のみ選択されている場合: その科目のみ読み込む
                console.log(`📚 ${selectedCategory}のQ&Aのみ読み込み中...`);
                rawQAs = await getQAsBySubject(selectedCategory);
                console.log(`📚 ${selectedCategory}読み込み完了: ${rawQAs.length}問`);
            } else if (!selectedCategory) {
                // カテゴリが選択されていない場合: 全科目を並列読み込み
                console.log('📚 全科目のQ&Aを並列読み込み中...');
                const promises = AVAILABLE_SUBJECTS.map(async (subject) => {
                    try {
                        const qas = await getQAsBySubject(subject);
                        if (qas.length > 0) {
                            console.log(`  ✅ ${subject}: ${qas.length}問`);
                        }
                        return qas;
                    } catch (error) {
                        console.warn(`  ⚠️ ${subject}: 読み込み失敗`, error);
                        return [];
                    }
                });
                const results = await Promise.all(promises);
                rawQAs = results.flat();
                console.log(`📚 全Q&A読み込み完了: ${rawQAs.length}問`);
            } else {
                // Q&A科目以外のカテゴリが選択されている場合: 空配列
                console.log(`📚 ${selectedCategory}はQ&A科目ではありません`);
                rawQAs = [];
            }

            // Q&A JSONのデータにcategory情報を追加（subjectをcategoryとして使用）
            allQAs = rawQAs.map(qa => ({
                ...qa,
                category: qa.subject,  // 科目名をカテゴリとして使用
                moduleId: `qa-json/${qa.subject}`,  // 識別用のモジュールID
                moduleTitle: `${qa.subject} Q&A`,
                tags: [qa.subject]
            }));

            console.log(`📚 Q&A処理完了: ${allQAs.length}問`);
        } catch (error) {
            console.error('❌ Q&A読み込みエラー:', error);
            allQAs = [];
        }

        // モジュールからのQ&Aは追加しない（Q&A JSONから読み込んだデータのみ使用）
        // 注：後方互換性が必要な場合は以下のコメントを外す
        /*
        const summaries = window.caseSummaries || caseSummaries;
 
        // ★★★ 読み込み前にモジュールレベルでフィルタリング ★★★
        const filteredSummaries = summaries.filter(summary => {
            if (!showFilter) return true;
 
            // カテゴリフィルタ
            if (selectedCategory && summary.category !== selectedCategory) return false;
 
            // サブフォルダフィルタ
            if (selectedSubfolder) {
                let subfolderName = summary.subfolder || '';
                if (!subfolderName && summary.id && summary.id.includes('/')) {
                    const pathParts = summary.id.split('/');
                    if (pathParts.length >= 2) {
                        subfolderName = pathParts[1];
                    }
                }
                if (subfolderName !== selectedSubfolder) return false;
            }
 
            // タグフィルタ
            if (selectedTags.length > 0) {
                const summaryTags = summary.tags || [];
                if (!selectedTags.some(tag => summaryTags.includes(tag))) return false;
            }
 
            // モジュール検索フィルタ（タイトルまたはID）
            if (moduleSearchTerm) {
                const title = (summary.title || '').toLowerCase();
                const id = (summary.id || '').toLowerCase();
                if (!title.includes(moduleSearchTerm) && !id.includes(moduleSearchTerm)) return false;
            }
 
            return true;
        });
 
        // フィルタリングされたモジュールのみ読み込む（並列処理で高速化）
        const loadPromises = filteredSummaries.map(async (summary) => {
            try {
                let questionsAndAnswers = summary.questionsAndAnswers;
 
                if (!questionsAndAnswers) {
                    // Q&Aデータがない場合は動的に読み込む
                    const loader = window.caseLoaders?.[summary.id] || caseLoaders?.[summary.id];
                    if (loader) {
                        try {
                            const module = await loader();
                            const caseData = module.default || module;
                            questionsAndAnswers = caseData.questionsAndAnswers || [];
                        } catch (e) {
                            console.warn(`Failed to load module ${summary.id}`, e);
                            questionsAndAnswers = [];
                        }
                    } else {
                        questionsAndAnswers = [];
                    }
                }
 
                // ドリルシステムへの登録（必要なデータのみ）
                if (window.qaFillDrillSystem && typeof window.qaFillDrillSystem.registerModuleCaseData === 'function') {
                    window.qaFillDrillSystem.registerModuleCaseData(summary.id, {
                        ...summary,
                        questionsAndAnswers: questionsAndAnswers
                    });
                }
 
                return { summary, questionsAndAnswers };
            } catch (error) {
                console.error(`Error processing summary ${summary.id}:`, error);
                return { summary, questionsAndAnswers: [] };
            }
        });
 
        const loadedModules = await Promise.all(loadPromises);
 
        for (const { summary, questionsAndAnswers } of loadedModules) {
            questionsAndAnswers.forEach(qa => {
                allQAs.push({
                    ...qa,
                    moduleId: summary.id,
                    moduleTitle: summary.title,
                    category: summary.category,
                    subfolder: summary.subfolder || '', // サブフォルダ情報を追加
                    tags: summary.tags || [],
                    rank: qa.rank || qa.difficulty || '', // Q&A個別のランク情報を優先
                    moduleRank: summary.rank || '' // モジュールランクも保持
                });
            });
        }
        */
    }

    // フィルタ取得（トップページのみ）
    let filteredQAs = allQAs;
    if (showFilter) {
        // フィルタ変数は上で定義済み

        filteredQAs = allQAs.filter(qa => {
            // Q&A内容検索フィルタ（質問または解答に含まれるか）
            if (qaContentSearchTerm) {
                const questionText = (qa.question || '').toLowerCase();
                const answerText = (qa.answer || '').toLowerCase();
                if (!questionText.includes(qaContentSearchTerm) && !answerText.includes(qaContentSearchTerm)) {
                    return false;
                }
            }

            // モジュール検索フィルタ（念のため再チェック）
            if (moduleSearchTerm) {
                const moduleTitle = (qa.moduleTitle || '').toLowerCase();
                const moduleId = (qa.moduleId || '').toLowerCase();
                if (!moduleTitle.includes(moduleSearchTerm) && !moduleId.includes(moduleSearchTerm)) {
                    return false;
                }
            }

            // カテゴリフィルタ（念のため再チェック）
            if (selectedCategory && qa.category !== selectedCategory) return false;

            // サブフォルダフィルタ（念のため再チェック）
            if (selectedSubfolder) {
                // まずQ&Aに直接含まれるサブフォルダ情報をチェック
                if (qa.subfolder && qa.subfolder !== selectedSubfolder) return false;

                // サブフォルダ情報がない場合はモジュールIDから推定
                if (!qa.subfolder && qa.moduleId && qa.moduleId.includes('/')) {
                    const pathParts = qa.moduleId.split('/');
                    if (pathParts.length >= 2) {
                        const moduleSubfolder = pathParts[1];
                        if (moduleSubfolder !== selectedSubfolder) return false;
                    }
                }
            }

            // タグフィルタ（念のため再チェック）
            if (selectedTags.length && !selectedTags.some(tag => qa.tags.includes(tag))) return false;

            // Q&A個別ランクフィルタ
            if (selectedQARanks.length) {
                const qaRank = (qa.rank || '').replace(/ランク$/, '').replace(/\s/g, '').toUpperCase();
                if (!selectedQARanks.includes(qaRank)) return false;
            }

            // ステータスフィルタ（未・済・要）
            if (selectedStatuses.length) {
                const qaId = qa.id; // 数値/文字列IDを使用
                // ケースページかトップページかで moduleId の取得方法を変える
                let moduleId = qa.moduleId; // トップページの場合
                if (!moduleId && window.currentCaseData && window.currentCaseData.id) {
                    moduleId = window.currentCaseData.id; // ケースページの場合
                }
                moduleId = moduleId || 'default'; // フォールバック

                // qaStatusSystemからステータスを取得（同期版）
                const status = window.qaStatusSystem?.getStatus(moduleId, qaId) || '未';

                // 選択されたステータスと一致しない場合は除外
                if (!selectedStatuses.includes(status)) {
                    return false;
                }
            }

            return true;
        });
    }

    filteredQAs.sort((a, b) => (a.id || 0) - (b.id || 0));

    // ★★★ ID表示形式の調整 ★★★
    // フィルター状態に応じてバッジ表示を変える
    // 1. カテゴリ未選択: [カテゴリ名] [サブカテゴリ] [Q&A番号] の3つ
    // 2. カテゴリ選択済 & サブフォルダ未選択: [サブカテゴリ] [Q&A番号] の2つ
    // 3. カテゴリ & サブフォルダ選択済: [Q&A番号] のみ
    filteredQAs = filteredQAs.map(qa => {
        // IDを分解（例: "1-5" → subcategoryId="1", qaNum="5"）
        let subcategoryId = qa.subcategoryId || '';
        let qaNum = '';
        if (qa.id && typeof qa.id === 'string' && qa.id.includes('-')) {
            const parts = qa.id.split('-');
            subcategoryId = parts[0] || subcategoryId;
            qaNum = parts.slice(1).join('-') || '';
        } else {
            qaNum = String(qa.id || qa.qaId || '');
        }

        // 表示用フィールドを設定
        let displayCategory = '';
        let displaySubcategory = '';
        let displayQaNum = qaNum;

        if (!selectedCategory) {
            // カテゴリ未選択時: 3つ全て表示
            displayCategory = qa.category || qa.subject || '';
            displaySubcategory = qa.subcategoryName || subcategoryId || '';
        } else if (!selectedSubfolder) {
            // カテゴリ選択済 & サブフォルダ未選択時: サブカテゴリ + Q&A番号
            displaySubcategory = qa.subcategoryName || subcategoryId || '';
        }
        // カテゴリ & サブフォルダ選択済: Q&A番号のみ（displayCategory, displaySubcategoryは空のまま）

        return {
            ...qa,
            displayCategory,
            displaySubcategory,
            displayQaNum
        };
    });

    let filterFallbackNotice = '';
    if (showFilter && hasActiveQAFilters && filteredQAs.length === 0 && allQAs.length > 0) {
        filteredQAs = [...allQAs];
        filterFallbackNotice = `
            <div class="max-w-4xl mx-auto mb-4">
                <div class="bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-3 rounded-lg border border-amber-200">
                    フィルタ条件に合致するQ&Aが見つからなかったため、全${allQAs.length}件のQ&Aを表示しています。フィルタを調整するかリセットしてください。
                </div>
            </div>
        `;
    }

    // ★★★ 表示件数制限機能 ★★★
    const totalCount = filteredQAs.length;
    const displayLimit = window.qaDisplayLimit || 20; // デフォルト20件
    const isLimited = totalCount > displayLimit;
    const displayQAs = isLimited ? filteredQAs.slice(0, displayLimit) : filteredQAs;

    // 表示件数セレクターUI（管理ボタンと同じ行に配置するため、後でrenderQAListのヘッダーと統合）
    const displayLimitSelectorHtml = `
        <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">表示:</span>
            <select id="qa-display-limit-select" class="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-300">
                <option value="20" ${displayLimit === 20 ? 'selected' : ''}>20件</option>
                <option value="50" ${displayLimit === 50 ? 'selected' : ''}>50件</option>
                <option value="100" ${displayLimit === 100 ? 'selected' : ''}>100件</option>
                <option value="all" ${displayLimit >= 9999 ? 'selected' : ''}>すべて</option>
            </select>
            <span class="text-sm text-gray-500">/ 全${totalCount}件</span>
        </div>
    `;

    // 統一されたQ&A表示機能を使用（制限された件数のみ、タイトルなし）
    const html = await renderQAList({
        qaList: displayQAs,
        moduleId: null, // 各Q&Aが独自のmoduleIdを持つ
        showModuleLink: showFilter, // フィルタ表示時のみモジュールリンクを表示
        title: '', // タイトルなし - 表示件数セレクターがヘッダーになる
        idPrefix: 'qa-list',
        extraHeaderHtml: displayLimitSelectorHtml // 表示件数セレクターを管理ボタンと同じ行に
    });

    // もっと見るボタン
    const loadMoreButton = isLimited ? `
        <div class="text-center mt-4 mb-6">
            <button id="load-more-qa-btn" class="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all transform hover:scale-105">
                もっと見る（残り ${totalCount - displayLimit}件）
            </button>
        </div>
    ` : '';

    modulesContainer.innerHTML = `${filterFallbackNotice}${html}${loadMoreButton}`;
    setupQAListEventHandlers(modulesContainer);

    // 表示件数セレクターのイベント
    const limitSelect = document.getElementById('qa-display-limit-select');
    if (limitSelect) {
        limitSelect.addEventListener('change', async (e) => {
            const value = e.target.value;
            window.qaDisplayLimit = value === 'all' ? 9999 : parseInt(value, 10);
            await renderFilteredQAs({ showFilter: true });
        });
    }

    // もっと見るボタンのイベント
    const loadMoreBtn = document.getElementById('load-more-qa-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            window.qaDisplayLimit = (window.qaDisplayLimit || 20) + 20;
            await renderFilteredQAs({ showFilter: true });
        });
    }

    // ★★★ 条文ボタンの処理をQ&Aリスト内でも有効にする ★★★
    console.log('🔧 Q&Aリスト内の条文ボタン処理を初期化');
    const articleButtons = modulesContainer.querySelectorAll('.article-ref-btn');
    console.log(`📋 発見された条文ボタン数: ${articleButtons.length}`);

    // 条文ボタンは既にeventHandler.jsのグローバルイベント委任で処理されるため、
    // 特別な処理は不要。ただし、デバッグ用にログを出力
    if (articleButtons.length > 0) {
        console.log('✅ Q&Aリスト内の条文ボタンが検出されました - グローバルイベント委任で処理されます');
    }

    // ★★★ タブ下のインラインスピード条文セクションを更新（全件を使用）★★★
    updateInlineSpeedQuizSection(filteredQAs, 'qa');
}

/**
 * スピード条文セクションの初期化
 */
async function initializeSpeedQuizSection() {
    try {
        // sharedSpeedQuizMain.jsの動的インポート
        const module = await import('../sharedSpeedQuizMain.js');
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
        container.classList.remove('hidden');
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
    container.innerHTML = `<div id="speed-quiz-main-section" class="hidden"></div>`;

    // スピード条文セクションの初期化
    await initializeSpeedQuizSection();
}

/**
 * フィルター設定を保存
 */
function saveFilterSettings() {
    try {
        // カテゴリ、サブフォルダ、モジュール検索、ランク、ソート設定を取得
        const categoryFilter = document.getElementById('category-filter');
        const subfolderFilter = document.getElementById('subfolder-filter');
        const moduleSearch = document.getElementById('module-search');
        const qaContentSearch = document.getElementById('qa-content-search');
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedSubfolder = subfolderFilter ? subfolderFilter.value : '';
        const moduleSearchTerm = moduleSearch ? moduleSearch.value : '';
        const qaContentSearchTerm = qaContentSearch ? qaContentSearch.value : '';

        const selectedRanks = getSelectedRanks();

        const sortSettings = getSortSettings();

        // タグのチェック状態を取得（現在表示されているタグのみ）
        const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
        const tagStates = {};
        tagCheckboxes.forEach(cb => {
            tagStates[cb.value] = cb.checked;
        });

        // ステータスのチェック状態を取得
        const statusCheckboxes = document.querySelectorAll('.status-checkbox');
        const statusStates = {};
        statusCheckboxes.forEach(cb => {
            statusStates[cb.value] = cb.checked;
        });

        // Q&Aランクのチェック状態を取得
        const qaRankCheckboxes = document.querySelectorAll('.qa-rank-checkbox');
        const qaRankStates = {};
        qaRankCheckboxes.forEach(cb => {
            qaRankStates[cb.value] = cb.checked;
        });

        // 設定をオブジェクトにまとめる
        const filterSettings = {
            category: selectedCategory,
            subfolder: selectedSubfolder,
            moduleSearch: moduleSearchTerm,
            qaContentSearch: qaContentSearchTerm,
            ranks: selectedRanks,
            sortBy: sortSettings.sortBy,
            sortOrder: sortSettings.sortOrder,
            tags: tagStates,
            statuses: statusStates,
            qaRanks: qaRankStates,
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
async function loadFilterSettings() {
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

            // カテゴリ変更に伴うタグ更新とサブフォルダ更新
            await updateTagFilter(false);
            await updateSubfolderFilter(false); // サブフォルダフィルタも更新
        }

        // サブフォルダを設定（カテゴリ設定後に行う）
        const subfolderFilter = document.getElementById('subfolder-filter');
        if (subfolderFilter && savedSettings.subfolder) {
            subfolderFilter.value = savedSettings.subfolder;
        }

        // モジュール検索を設定
        const moduleSearch = document.getElementById('module-search');
        if (moduleSearch && savedSettings.moduleSearch) {
            moduleSearch.value = savedSettings.moduleSearch;
        }

        // Q&A内容検索を設定
        const qaContentSearch = document.getElementById('qa-content-search');
        if (qaContentSearch && savedSettings.qaContentSearch) {
            qaContentSearch.value = savedSettings.qaContentSearch;
        }

        // ソート設定を適用
        const sortBy = document.getElementById('sort-by');
        const sortOrder = document.getElementById('sort-order');

        if (sortBy && savedSettings.sortBy) {
            sortBy.value = savedSettings.sortBy;
        }

        if (savedSettings.sortOrder) {
            window.currentSortOrder = savedSettings.sortOrder;
            const sortArrow = document.getElementById('sort-arrow');
            if (sortArrow) {
                sortArrow.textContent = window.currentSortOrder === 'asc' ? '⬆️' : '⬇️';
            }
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

        // ステータスチェックボックスの状態を復元
        if (savedSettings.statuses) {
            document.querySelectorAll('.status-checkbox').forEach(cb => {
                if (savedSettings.statuses.hasOwnProperty(cb.value)) {
                    cb.checked = savedSettings.statuses[cb.value];
                }
            });
        }

        // Q&Aランクチェックボックスの状態を復元
        if (savedSettings.qaRanks) {
            document.querySelectorAll('.qa-rank-checkbox').forEach(cb => {
                if (savedSettings.qaRanks.hasOwnProperty(cb.value)) {
                    cb.checked = savedSettings.qaRanks[cb.value];
                }
            });
        }

    } catch (error) {
        console.error('フィルター設定の読み込みに失敗:', error);
    }
}

// ★★★ ページ読み込み完了時の学習記録強制更新 ★★★
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 ページ読み込み完了 - 学習記録強制更新開始');

    // 少し遅延してから実行（DOM要素の確実な作成を待つ）
    setTimeout(async () => {
        await forceUpdateAllStudyRecords();
    }, 2000); // 2秒後に実行
});

// ★★★ ページフォーカス時（ブラウザバック時含む）の学習記録更新 ★★★
window.addEventListener('focus', function () {
    console.log('🔄 ページフォーカス - 学習記録更新開始');
    setTimeout(async () => {
        await forceUpdateAllStudyRecords();
    }, 500); // 0.5秒後に実行
});

// ★★★ ページ表示時（bfcache対応）の学習記録更新 ★★★
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        console.log('🔄 ページ復元 - 学習記録更新開始');
        setTimeout(async () => {
            await forceUpdateAllStudyRecords();
        }, 500); // 0.5秒後に実行
    }
});

// ★★★ 学習記録強制更新の共通処理 ★★★
async function forceUpdateAllStudyRecords() {
    try {
        // 現在表示されているモジュールの学習記録要素のみを検索
        const studyRecordElements = document.querySelectorAll('#modules-container [id^="study-record-"]');
        console.log(`🔍 表示中の学習記録要素発見: ${studyRecordElements.length}個`);

        if (studyRecordElements.length === 0) {
            console.log('📭 表示中のモジュールなし - 更新スキップ');
            return;
        }

        // 並列処理で高速化（最大5個同時）
        const updatePromises = [];
        const batchSize = 5;

        for (let i = 0; i < studyRecordElements.length; i += batchSize) {
            const batch = Array.from(studyRecordElements).slice(i, i + batchSize);

            const batchPromise = Promise.all(batch.map(async (element) => {
                const caseId = element.id.replace('study-record-', '');

                try {
                    const studyRecordHtml = await generateStudyRecordDisplay(caseId);

                    // HTMLを解析して新しい内容を取得
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = studyRecordHtml;
                    const newContent = tempDiv.firstChild;

                    if (newContent) {
                        element.className = newContent.className;
                        element.innerHTML = newContent.innerHTML;
                    }
                    return { caseId, success: true };
                } catch (error) {
                    console.error(`❌ 個別更新失敗: ${caseId}`, error);
                    return { caseId, success: false, error };
                }
            }));

            updatePromises.push(batchPromise);
        }

        // すべてのバッチを並列実行
        const results = await Promise.all(updatePromises);
        const flatResults = results.flat();
        const successCount = flatResults.filter(r => r.success).length;

        console.log(`🎉 学習記録更新完了: ${successCount}/${flatResults.length}件成功`);
    } catch (error) {
        console.error('❌ 学習記録強制更新エラー:', error);
    }
}

// ==========================================
// 学習記録セクション初期化
// ==========================================

// グローバル関数として学習記録読み込み関数を公開
window.loadAndDisplayTodayStudyRecords = loadAndDisplayTodayStudyRecords;

// Make getRankColor available globally for other modules
window.getRankColor = getRankColor;

// 安全な再読み込みラッパー: 連続した自動リロードを防止するデバウンス付き
window.__safeReloadInProgress = false;
window.safeReload = function () {
    try {
        if (window.__safeReloadInProgress) {
            console.warn('safeReload: 再読み込みは既に進行中です。中断します。');
            return;
        }
        window.__safeReloadInProgress = true;
        // 1.5秒以内の連続呼び出しを防ぐ
        setTimeout(() => { window.__safeReloadInProgress = false; }, 1500);
        console.log('safeReload: ページを再読み込みします');
        window.location.reload();
    } catch (e) {
        console.error('safeReload エラー:', e);
    }
};

// ページが読み込まれた後に学習記録を表示する
document.addEventListener('DOMContentLoaded', () => {
    // ホームページが表示されている場合のみ実行
    setTimeout(() => {
        if (document.getElementById('today-study-records-placeholder')) {
            console.log('🚀 ホームページ読み込み後：学習記録を取得します');
            loadAndDisplayTodayStudyRecords();
        }
    }, 1000); // 1秒後に実行（他の初期化処理が完了してから）
});

// ページナビゲーション時にも学習記録を再読み込み
window.addEventListener('hashchange', () => {
    setTimeout(() => {
        if (window.location.hash === '#/' || window.location.hash === '') {
            const placeholder = document.getElementById('today-study-records-placeholder');
            if (placeholder) {
                console.log('🔄 ホームページ再表示：学習記録を再読み込みします');
                loadAndDisplayTodayStudyRecords();
            }
        }
    }, 500);
});

// ★★★ AI切り替え機能 ★★★
async function initAIProviderSwitch() {
    const geminiBtn = document.getElementById('ai-gemini-btn');
    const grokBtn = document.getElementById('ai-grok-btn');
    const statusIndicator = document.getElementById('ai-status-indicator');

    if (!geminiBtn || !grokBtn) return;

    // 現在の状態を取得
    try {
        const response = await fetch('/api/ai-status');
        const status = await response.json();

        // ボタンの状態を更新
        updateAIButtonStates(status);

        // クリックイベントを設定
        geminiBtn.addEventListener('click', () => switchAIProvider('gemini'));
        grokBtn.addEventListener('click', () => switchAIProvider('grok'));

    } catch (error) {
        console.error('AI状態取得エラー:', error);
        if (statusIndicator) {
            statusIndicator.textContent = 'エラー';
            statusIndicator.style.color = '#ef4444';
        }
    }
}

function updateAIButtonStates(status) {
    const geminiBtn = document.getElementById('ai-gemini-btn');
    const grokBtn = document.getElementById('ai-grok-btn');
    const statusIndicator = document.getElementById('ai-status-indicator');

    if (!geminiBtn || !grokBtn) return;

    // Geminiボタン
    geminiBtn.classList.remove('active', 'unavailable');
    if (!status.gemini.available) {
        geminiBtn.classList.add('unavailable');
        geminiBtn.disabled = true;
    } else if (status.gemini.active) {
        geminiBtn.classList.add('active');
    }

    // Grokボタン
    grokBtn.classList.remove('active', 'unavailable');
    if (!status.grok.available) {
        grokBtn.classList.add('unavailable');
        grokBtn.disabled = true;
    } else if (status.grok.active) {
        grokBtn.classList.add('active');
    }

    // ステータス表示
    if (statusIndicator) {
        const activeProvider = status.gemini.active ? 'Gemini' : (status.grok.active ? 'Grok' : '不明');
        statusIndicator.textContent = `✓ ${activeProvider}使用中`;
        statusIndicator.style.color = '#22c55e';
    }
}

async function switchAIProvider(provider) {
    const statusIndicator = document.getElementById('ai-status-indicator');

    try {
        if (statusIndicator) {
            statusIndicator.textContent = '切替中...';
            statusIndicator.style.color = '#f59e0b';
        }

        const response = await fetch('/api/ai-provider/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider })
        });

        const result = await response.json();

        if (result.success) {
            // 状態を再取得して更新
            const statusResponse = await fetch('/api/ai-status');
            const status = await statusResponse.json();
            updateAIButtonStates(status);

            console.log(`🤖 AI切替完了: ${result.message}`);
        } else {
            throw new Error(result.error || '切替失敗');
        }

    } catch (error) {
        console.error('AI切替エラー:', error);
        if (statusIndicator) {
            statusIndicator.textContent = 'エラー';
            statusIndicator.style.color = '#ef4444';
        }
        alert('AI切り替えに失敗しました: ' + error.message);
    }
}

// ホームページ読み込み時にAI切り替えを初期化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (document.getElementById('ai-provider-switch')) {
            initAIProviderSwitch();
        }
    }, 500);
});

// ★★★ インラインスピード条文セクション ★★★
/**
 * 現在表示中のデータから条文を抽出してスピード条文セクションを更新
 * @param {Array} dataList - Q&Aデータまたはモジュールデータの配列
 * @param {string} mode - 'qa' または 'module'
 */
async function updateInlineSpeedQuizSection(dataList, mode = 'qa') {
    const container = document.getElementById('inline-speed-quiz-section');
    if (!container) return;

    console.log(`⚡ ${mode === 'qa' ? 'Q&Aリスト' : 'モジュール'}から条文を抽出中...`);

    // データから条文参照を抽出
    const articleRefs = mode === 'qa'
        ? extractArticleReferencesFromQAs(dataList)
        : extractArticleReferencesFromModules(dataList);
    const uniqueCount = articleRefs.length;

    console.log(`⚡ 抽出された条文参照: ${uniqueCount}件`);

    const modeLabel = mode === 'qa' ? 'このQ&Aリスト' : 'このモジュール';

    if (uniqueCount === 0) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-3 text-center">
                <p class="text-gray-500 text-sm">⚡ スピード条文: 該当する条文参照が見つかりませんでした</p>
            </div>
        `;
        return;
    }

    // スピード条文セクションを表示
    container.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">⚡</span>
                    <div>
                        <h3 class="text-white font-bold text-lg">スピード条文</h3>
                        <p class="text-white/80 text-sm">${modeLabel}から抽出した条文でプレイ</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button id="inline-speed-quiz-start-btn" 
                            class="bg-white hover:bg-gray-100 text-indigo-600 font-bold py-2 px-6 rounded-lg shadow-md transition-all transform hover:scale-105">
                        スタート
                    </button>
                </div>
            </div>
        </div>
    `;

    // スタートボタンのイベント設定
    const startBtn = container.querySelector('#inline-speed-quiz-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            startBtn.disabled = true;
            startBtn.textContent = '読込中...';

            try {
                // 条文データを取得
                const articles = await fetchArticlesForInlineSpeedQuiz(articleRefs);

                if (articles.length === 0) {
                    alert('条文データの取得に失敗しました。');
                    startBtn.disabled = false;
                    startBtn.textContent = 'スタート';
                    return;
                }

                console.log(`⚡ 取得した条文データ: ${articles.length}件`);

                // スピードクイズを開始
                window.speedQuizArticles = articles;
                window.location.hash = '#/speed-quiz';
            } catch (error) {
                console.error('スピードクイズ開始エラー:', error);
                alert('エラーが発生しました。');
                startBtn.disabled = false;
                startBtn.textContent = 'スタート';
            }
        });
    }
}

/**
 * モジュールリストから条文参照を抽出
 * @param {Array} moduleList - モジュールデータの配列
 * @returns {Array}
 */
function extractArticleReferencesFromModules(moduleList) {
    if (!Array.isArray(moduleList)) return [];

    // モジュールの全Q&Aを抽出してextractArticleReferencesFromQAsを使用
    const allQAs = [];
    moduleList.forEach(mod => {
        if (mod.questionsAndAnswers && Array.isArray(mod.questionsAndAnswers)) {
            allQAs.push(...mod.questionsAndAnswers);
        }
    });

    return extractArticleReferencesFromQAs(allQAs);
}

/**
 * 現在表示中のモジュールからスピード条文セクションを更新
 */
async function updateInlineSpeedQuizForModules() {
    const container = document.getElementById('inline-speed-quiz-section');
    if (!container) return;

    console.log('⚡ モジュールから条文を抽出中...');

    // 現在表示されているモジュールカードからデータを取得
    const moduleCards = document.querySelectorAll('[data-case-id]');
    const moduleIds = Array.from(moduleCards).map(card => card.dataset.caseId).filter(id => id);

    console.log(`⚡ 表示中のモジュールカード: ${moduleCards.length}件, モジュールID: ${moduleIds.length}件`);

    if (moduleIds.length === 0) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-3 text-center">
                <p class="text-gray-500 text-sm">⚡ スピード条文: モジュールが表示されていません</p>
            </div>
        `;
        return;
    }

    // caseLoadersから動的にQ&Aデータを取得
    const allQAs = [];
    for (const id of moduleIds) {
        try {
            const loader = (window.caseLoaders || {})[id];
            if (loader) {
                const mod = await loader();
                const moduleData = mod.default || mod;
                if (moduleData?.questionsAndAnswers) {
                    allQAs.push(...moduleData.questionsAndAnswers);
                }
            }
        } catch (error) {
            console.warn(`⚠️ モジュール ${id} のQ&A取得失敗:`, error.message);
        }
    }

    // Q&Aから条文を抽出
    const articleRefs = extractArticleReferencesFromQAs(allQAs);
    const uniqueCount = articleRefs.length;

    console.log(`⚡ 抽出された条文参照: ${uniqueCount}件 (Q&A総数: ${allQAs.length}件)`);

    if (uniqueCount === 0) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-3 text-center">
                <p class="text-gray-500 text-sm">⚡ スピード条文: 該当する条文参照が見つかりませんでした</p>
            </div>
        `;
        return;
    }

    // スピード条文セクションを表示
    container.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">⚡</span>
                    <div>
                        <h3 class="text-white font-bold text-lg">スピード条文</h3>
                        <p class="text-white/80 text-sm">このモジュールから抽出した条文でプレイ</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button id="inline-speed-quiz-start-btn" 
                            class="bg-white hover:bg-gray-100 text-indigo-600 font-bold py-2 px-6 rounded-lg shadow-md transition-all transform hover:scale-105">
                        スタート
                    </button>
                </div>
            </div>
        </div>
    `;

    // スタートボタンのイベント設定
    const startBtn = container.querySelector('#inline-speed-quiz-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            startBtn.disabled = true;
            startBtn.textContent = '読込中...';

            try {
                const articles = await fetchArticlesForInlineSpeedQuiz(articleRefs);

                if (articles.length === 0) {
                    alert('条文データの取得に失敗しました。');
                    startBtn.disabled = false;
                    startBtn.textContent = 'スタート';
                    return;
                }

                console.log(`⚡ 取得した条文データ: ${articles.length}件`);
                window.speedQuizArticles = articles;
                window.location.hash = '#/speed-quiz';
            } catch (error) {
                console.error('スピードクイズ開始エラー:', error);
                alert('エラーが発生しました。');
                startBtn.disabled = false;
                startBtn.textContent = 'スタート';
            }
        });
    }
}

/**
 * Q&Aリストから条文参照を抽出
 * @param {Array} qaList - Q&Aデータの配列
 * @returns {Array<{lawName: string, articleNum: string, fullRef: string}>}
 */
function extractArticleReferencesFromQAs(qaList) {
    if (!Array.isArray(qaList)) return [];

    const seen = new Set();
    const articles = [];

    // 対応する法令名
    const supportedLaws = [
        '日本国憲法', '憲法', '民法', '刑法', '会社法', '商法', '民事訴訟法', '刑事訴訟法',
        '行政手続法', '行政不服審査法', '行政事件訴訟法', '国家賠償法', '地方自治法',
        '破産法', '民事再生法', '民事執行法', '民事保全法', '借地借家法', '信託法',
        '刑事訴訟規則', '少年法', '裁判員の参加する刑事裁判に関する法律',
        '会社法施行規則', '会社計算規則'
    ];

    // 法令名の正規化
    const normalizeLaw = (name) => {
        if (name === '憲法') return '日本国憲法';
        return name;
    };

    // 条文パターン: 【法令名○○条...】
    const pattern = /【([^\d\】]+?)(\d+条[^\】]*)】/g;

    qaList.forEach(qa => {
        const texts = [qa.question || '', qa.answer || ''];

        texts.forEach(text => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const rawLawName = match[1].trim();
                const articleRef = match[2].trim();

                // サポートされている法令かチェック
                if (!supportedLaws.includes(rawLawName)) continue;

                const lawName = normalizeLaw(rawLawName);

                // 条文番号を抽出（例: "21条1項" → "21"）
                const numMatch = articleRef.match(/^(\d+)/);
                if (!numMatch) continue;

                const articleNum = numMatch[1];
                const fullRef = `${lawName}_${articleNum}`;

                if (!seen.has(fullRef)) {
                    seen.add(fullRef);
                    articles.push({
                        lawName: lawName,
                        articleNum: articleNum,
                        fullRef: fullRef
                    });
                }
            }
        });
    });

    return articles;
}

/**
 * 条文参照から実際の条文データを取得
 * @param {Array} articleRefs - 条文参照配列
 * @returns {Promise<Array>} - スピードクイズ用条文データ
 */
async function fetchArticlesForInlineSpeedQuiz(articleRefs) {
    console.log('⚡ fetchArticlesForInlineSpeedQuiz 開始:', articleRefs);

    if (!articleRefs || articleRefs.length === 0) {
        console.warn('⚠️ 条文参照が空です');
        return [];
    }

    const articles = [];

    // 法令名ごとにグループ化
    const byLaw = {};
    articleRefs.forEach(ref => {
        if (!byLaw[ref.lawName]) {
            byLaw[ref.lawName] = new Set();
        }
        byLaw[ref.lawName].add(ref.articleNum);
    });

    console.log('⚡ 法令別条文:', Object.fromEntries(
        Object.entries(byLaw).map(([k, v]) => [k, Array.from(v)])
    ));

    // 各法令からAPIで条文を取得
    for (const [lawName, articleNums] of Object.entries(byLaw)) {
        try {
            console.log(`⚡ ${lawName} の条文を取得中... (条文番号: ${Array.from(articleNums).join(', ')})`);

            const response = await fetch(`/api/law-articles/${encodeURIComponent(lawName)}`);

            if (!response.ok) {
                console.warn(`⚠️ ${lawName} のAPI呼び出し失敗: ${response.status}`);
                continue;
            }

            const lawArticles = await response.json();
            console.log(`⚡ ${lawName} から ${Array.isArray(lawArticles) ? lawArticles.length : 0} 件の条文を取得`);

            if (!Array.isArray(lawArticles) || lawArticles.length === 0) {
                console.warn(`⚠️ ${lawName} の条文データが空です`);
                continue;
            }

            // 参照された条文のみフィルタ（柔軟なマッチング）
            const articleNumsArray = Array.from(articleNums);
            const matchedArticles = lawArticles.filter(art => {
                // articleNumberの様々な形式に対応
                const artNum = String(art.articleNumber || art.article_number || art.num || '');
                // 数字のみを抽出して比較
                const artNumClean = artNum.replace(/[^0-9]/g, '');

                return articleNumsArray.some(refNum => {
                    const refNumClean = String(refNum).replace(/[^0-9]/g, '');
                    return artNumClean === refNumClean || artNum === refNum;
                });
            });

            console.log(`⚡ ${lawName} でマッチした条文: ${matchedArticles.length}件 (APIから取得: ${lawArticles.length}件, 参照: ${articleNumsArray.length}件)`);

            matchedArticles.forEach(art => {
                articles.push({
                    ...art,
                    lawName: lawName
                });
            });
        } catch (error) {
            console.error(`❌ ${lawName}の条文取得でエラー:`, error);
        }
    }

    console.log(`⚡ 取得した条文合計: ${articles.length}件`);

    // 条文が0件の場合、全法令から条文を取得してランダムに選択（フォールバック）
    if (articles.length === 0) {
        console.warn('⚠️ 条文が取得できませんでした。フォールバック処理を実行...');

        // 参照されている法令から全条文を取得
        for (const lawName of Object.keys(byLaw)) {
            try {
                const response = await fetch(`/api/law-articles/${encodeURIComponent(lawName)}`);
                if (!response.ok) continue;

                const lawArticles = await response.json();
                if (Array.isArray(lawArticles) && lawArticles.length > 0) {
                    // 最大10件をランダムに選択
                    const shuffled = lawArticles.sort(() => Math.random() - 0.5).slice(0, 10);
                    shuffled.forEach(art => {
                        articles.push({ ...art, lawName: lawName });
                    });
                }
            } catch (error) {
                console.warn(`⚠️ フォールバック: ${lawName}の取得失敗`);
            }
        }
        console.log(`⚡ フォールバックで取得した条文: ${articles.length}件`);
    }

    // 重複除去
    const uniqueArticles = [];
    const seenKeys = new Set();
    articles.forEach(art => {
        const key = `${art.lawName}_${art.articleNumber}_${art.paragraph || '1'}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueArticles.push(art);
        }
    });

    console.log(`⚡ 最終的な条文数: ${uniqueArticles.length}件`);
    return uniqueArticles;
}
