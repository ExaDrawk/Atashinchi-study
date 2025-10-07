// pages/homePage.js - ホームページ専用モジュール（グローバル検索機能付き）

// ★★★ 法分野別カラー設定 ★★★
const CATEGORY_COLORS = {
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

// カテゴリの色情報を取得する関数
function getCategoryColor(category) {
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

// ファイルパスから法分野フォルダ名を取得する関数
function getFolderNameFromPath(filePath) {
    if (!filePath) {
        return 'その他';
    }
    
    // パスの区切り文字を統一（バックスラッシュをスラッシュに変換）
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // 先頭の./ を削除
    const cleanPath = normalizedPath.replace(/^\.\//, '');
    
    // 最初のスラッシュより前の部分を取得（例：商法/2.会社法総論・設立・株式/2.1-5.js → 商法）
    const firstSlashIndex = cleanPath.indexOf('/');
    
    if (firstSlashIndex === -1) {
        // スラッシュがない場合はファイル名のみなので「その他」
        return 'その他';
    }
    
    const folderName = cleanPath.substring(0, firstSlashIndex);
    return folderName || 'その他';
}

// ★★★ カテゴリバッジを生成する関数 ★★★
function generateCategoryBadge(category, isSubfolder = false) {
    // フォルダーマークを削除、カテゴリ名のみ返す
    return category;
}

// ★★★ カテゴリバッジのインラインスタイルを生成する関数 ★★★
function generateCategoryBadgeStyle(category) {
    const colorInfo = getCategoryColor(category);
    console.log(`🎨 カテゴリ "${category}" の色情報:`, colorInfo);
    return `background: ${colorInfo.bgColor} !important; background-color: ${colorInfo.bgColor} !important; color: ${colorInfo.color} !important; border-color: ${colorInfo.borderColor} !important; background-image: none !important; animation: none !important; transition: none !important;`;
}

// ★★★ カテゴリバッジのスタイルを動的に適用する関数 ★★★
function applyCategoryBadgeStyles() {
    // フォルダバッジのスタイルを適用
    document.querySelectorAll('.folder-badge').forEach(badge => {
        const category = badge.getAttribute('data-category') || badge.textContent.replace('� ', '').trim();
        const colorInfo = getCategoryColor(category);
        console.log(`🔧 フォルダバッジにスタイル適用: "${category}"`, colorInfo);
        
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
        const category = badge.textContent.replace('📂 ', '').trim();
        const colorInfo = getCategoryColor(category);
        console.log(`🔧 サブフォルダバッジにスタイル適用: "${category}"`, colorInfo);
        
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
    
    console.log(`🔄 モジュール進捗表示更新: ${moduleId}`);
    
    // 該当するモジュールカードを探す
    const moduleCard = document.querySelector(`[data-case-id="${moduleId}"]`);
    if (!moduleCard) {
        console.log(`⚠️ モジュールカード見つからず: ${moduleId}`);
        return;
    }
    
    // 現在のケースデータを取得（window.caseSummariesから）
    const currentSummaries = window.caseSummaries || caseSummaries;
    const caseData = currentSummaries.find(c => c.id === moduleId);
    if (!caseData) {
        console.log(`⚠️ ケースデータ見つからず: ${moduleId}`);
        return;
    }
    
    // モジュールファイルを動的に読み込んで最新のQ&Aデータを取得
    (async () => {
        try {
            const loader = (window.caseLoaders || caseLoaders)[moduleId];
            if (!loader) {
                console.log(`⚠️ ローダー見つからず: ${moduleId}`);
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
                const progressIcon = percentage === 100 ? '🏆' : percentage >= 75 ? '📚' : percentage >= 50 ? '📖' : percentage >= 25 ? '📝' : '📄';
                const progressColor = percentage === 100 ? 'text-green-600 font-bold' : percentage >= 75 ? 'text-blue-600 font-semibold' : percentage >= 50 ? 'text-yellow-600 font-medium' : 'text-gray-600';
                
                // 進捗表示要素を更新
                const progressElement = moduleCard.querySelector('.text-sm.mt-2');
                if (progressElement) {
                    progressElement.className = `text-sm mt-2 ${progressColor}`;
                    progressElement.innerHTML = `${progressIcon} <span style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${completionRatio.completed}/${completionRatio.total}</span> <span class="text-xs">完了</span>`;
                    console.log(`✅ 進捗表示更新完了: ${moduleId} (${completionRatio.completed}/${completionRatio.total})`);
                }
            } else {
                console.warn(`⚠️ 完了割合計算失敗: ${moduleId}`, { completionRatio, caseData: caseData ? 'exists' : 'null', moduleData: moduleData ? 'exists' : 'null' });
                // デフォルト表示
                const progressElement = moduleCard.querySelector('.text-sm.mt-2');
                if (progressElement) {
                    progressElement.className = `text-sm mt-2 text-gray-600`;
                    progressElement.innerHTML = `📄 <span style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">0/0</span> <span class="text-xs">完了</span>`;
                }
            }
        } catch (error) {
            console.error(`❌ モジュール進捗表示更新エラー: ${moduleId}`, error);
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

/**
 * 指定日付の学習記録を取得する関数
 * @param {string} targetDate - YYYY-MM-DD形式の日付
 * @returns {Promise<Array>} 指定日付の学習記録配列
 */
async function getStudyRecordsForDate(targetDate) {
    const studyRecords = [];

    try {
        // caseSummariesからcase IDとローダー情報を取得
        const caseEntries = Array.isArray(caseSummaries) ? caseSummaries : Object.values(caseSummaries);

        // 各ケースの実際のモジュールファイルを読み込んで studyRecords をチェック
        for (const caseData of caseEntries) {
            try {
                const caseId = caseData.id || caseData.originalId;
                if (!caseId) continue;

                // caseLoadersから対応するローダーを取得
                const loader = (window.caseLoaders || caseLoaders)[caseId];
                if (!loader) continue;

                // モジュールを動的に読み込み
                const mod = await loader();
                const moduleData = mod.default;

                if (moduleData && moduleData.studyRecords && Array.isArray(moduleData.studyRecords)) {
                    // 指定日付の学習記録があるかチェック
                    const dateRecord = moduleData.studyRecords.find(record => record.date === targetDate);

                    if (dateRecord) {
                        // フォルダ名を取得
                        const folderName = getFolderNameFromPath(caseData.filePath);

                        studyRecords.push({
                            id: caseId,
                            title: moduleData.title,
                            folderName: folderName,
                            rank: moduleData.rank,
                            studyRecord: dateRecord,
                            filePath: caseData.filePath
                        });
                    }
                }
            } catch (error) {
                console.warn(`❌ ケース読み込みエラー: ${caseData.id}`, error.message);
            }
        }

        // スピードクイズの結果も取得
        try {
            const quizResponse = await fetch(`/api/quiz-results/${targetDate}`);
            if (quizResponse.ok) {
                const quizResults = await quizResponse.json();

                // クイズ結果を学習記録に追加
                quizResults.forEach(result => {
                    studyRecords.push({
                        id: `quiz_${Date.now()}_${Math.random()}`,
                        title: result.articleNumber,
                        folderName: 'スピードクイズ',
                        rank: 'クイズ',
                        studyRecord: {
                            timestamp: new Date().toISOString(),
                            score: result.score,
                            isCorrect: result.isCorrect
                        },
                        type: 'quiz',
                        quizResult: result
                    });
                });
            }
        } catch (error) {
            console.warn('❌ クイズ結果取得エラー:', error);
        }

        // 保存日時順（古い順）に並べ替え
        studyRecords.sort((a, b) => {
            const timeA = a.studyRecord.timestamp ? new Date(a.studyRecord.timestamp) : new Date(0);
            const timeB = b.studyRecord.timestamp ? new Date(b.studyRecord.timestamp) : new Date(0);
            return timeA - timeB; // 古い順（昇順）
        });

        return studyRecords;

    } catch (error) {
        console.error('❌ 指定日付の学習記録取得エラー:', error);
        return [];
    }
}
async function getTodayStudyRecords() {
    const today = getStudyRecordDate(); // 新しい日付計算関数を使用
    const todayRecords = [];

    console.log(`📅 今日の日付: ${today}`);
    console.log(`🔍 学習記録を検索中...`);

    try {
        // caseSummariesからcase IDとローダー情報を取得
        const caseEntries = Array.isArray(caseSummaries) ? caseSummaries : Object.values(caseSummaries);
        console.log(`📚 検索対象ケース数: ${caseEntries.length}`);

        // 各ケースの実際のモジュールファイルを読み込んで studyRecords をチェック
        for (const caseData of caseEntries) {
            try {
                const caseId = caseData.id || caseData.originalId;
                if (!caseId) continue;

                // caseLoadersから対応するローダーを取得
                const loader = (window.caseLoaders || caseLoaders)[caseId];
                if (!loader) {
                    console.log(`⚠️ ローダー見つからず: ${caseId}`);
                    continue;
                }

                // モジュールを動的に読み込み
                const mod = await loader();
                const moduleData = mod.default;

                if (moduleData && moduleData.studyRecords && Array.isArray(moduleData.studyRecords)) {
                    // 今日の日付の学習記録があるかチェック
                    const todayRecord = moduleData.studyRecords.find(record => {
                        const recordDate = record.date;
                        console.log(`🔍 ${caseId}: 記録日付 "${recordDate}" vs 今日 "${today}"`);
                        return recordDate === today;
                    });

                    if (todayRecord) {
                        console.log(`✅ 今日の学習記録発見: ${caseId}`, todayRecord);

                        // フォルダ名を取得（categoryの代わりに使用）
                        const folderName = getFolderNameFromPath(caseData.filePath);

                        todayRecords.push({
                            id: caseId,
                            title: moduleData.title,
                            folderName: folderName,  // categoryの代わりにfolderNameを使用
                            rank: moduleData.rank,
                            studyRecord: todayRecord,
                            filePath: caseData.filePath,
                            type: 'study'  // 学習記録タイプ
                        });
                    }
                } else {
                    console.log(`📝 ${caseId}: studyRecords なし`);
                }
            } catch (error) {
                console.warn(`❌ ケース読み込みエラー: ${caseData.id}`, error.message);
            }
        }

        // スピードクイズの結果も取得
        try {
            console.log('🎯 スピードクイズ結果を取得中...');
            const quizResponse = await fetch(`/api/quiz-results/${today}`);
            if (quizResponse.ok) {
                const quizResults = await quizResponse.json();
                console.log(`🎯 今日のクイズ結果: ${quizResults.length}件`);

                // クイズ結果を学習記録に追加
                quizResults.forEach(result => {
                    todayRecords.push({
                        id: `quiz_${Date.now()}_${Math.random()}`,
                        title: result.articleNumber,
                        folderName: 'スピードクイズ',
                        rank: 'クイズ',
                        studyRecord: {
                            timestamp: new Date().toISOString(),
                            score: result.score,
                            isCorrect: result.isCorrect
                        },
                        type: 'quiz',  // クイズ結果タイプ
                        quizResult: result
                    });
                });
            } else {
                console.log('⚠️ クイズ結果取得失敗:', quizResponse.status);
            }
        } catch (error) {
            console.warn('❌ クイズ結果取得エラー:', error);
        }

        console.log(`🎯 今日の学習記録: ${todayRecords.length}件発見`);

        // 保存日時順（古い順）に並べ替え
        todayRecords.sort((a, b) => {
            const timeA = a.studyRecord.timestamp ? new Date(a.studyRecord.timestamp) : new Date(0);
            const timeB = b.studyRecord.timestamp ? new Date(b.studyRecord.timestamp) : new Date(0);
            return timeA - timeB; // 古い順（昇順）
        });

        return todayRecords;

    } catch (error) {
        console.error('❌ 学習記録取得エラー:', error);
        return [];
    }
}

/**
 * 今日の学習記録のHTMLを生成する関数（改良版）
 * @returns {Promise<string>} 今日の学習記録セクションのHTML
 */
async function generateTodayStudyRecordsHTML() {
    console.log('🎨 今日の学習記録HTMLを生成中...');
    const todayRecords = await getTodayStudyRecords();
    
    if (todayRecords.length === 0) {
        console.log('📅 今日の学習記録なし - 空状態を表示');
        return `
            <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800">📅 今日の学習記録</h3>
                    <button onclick="if(window.openCalendar){window.openCalendar();}else{console.error('openCalendar関数が利用できません');}" title="カレンダーを表示" class="text-xl px-2 py-1 rounded hover:bg-gray-100">📅</button>
                </div>
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">📚</div>
                    <p>今日はまだ学習記録がありません</p>
                    <p class="text-sm">モジュールを学習すると、ここに記録が表示されます</p>
                    <div class="text-xs text-gray-400 mt-2">
                        現在の日付: ${getStudyRecordDate()}
                    </div>
                </div>
            </div>
        `;
    }
    
    console.log(`🎨 ${todayRecords.length}件の学習記録をHTML化中...`);
    
    // 4列グリッドレイアウトで学習記録を表示
    const gridRecordsHTML = todayRecords.map((record, index) => {
        // 学習記録とクイズ結果で表示を分ける
        if (record.type === 'quiz') {
            // クイズ結果の表示
            const studyTime = record.studyRecord.timestamp ?
                new Date(record.studyRecord.timestamp).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) :
                '時刻不明';

            const scoreColor = record.quizResult.isCorrect ? 'text-green-600' : 'text-red-600';
            const scoreIcon = record.quizResult.isCorrect ? '🎯' : '❌';

            // 条文名を解析してボタン形式に変換
            const parseArticleTitle = (title) => {
                // 「行政事件訴訟法32条」のような形式を解析
                const match = title.match(/^(.+?)(\d+)(?:条(?:第(\d+)項)?)?$/);
                if (match) {
                    const [, lawName, articleNumber, paragraph] = match;
                    const fullArticleRef = paragraph ? `${articleNumber}条第${paragraph}項` : `${articleNumber}条`;
                    return {
                        lawName: lawName,
                        articleRef: articleNumber,
                        displayName: title,
                        fullRef: fullArticleRef
                    };
                }
                // パースできない場合はそのまま返す
                return {
                    lawName: '',
                    articleRef: '',
                    displayName: title,
                    fullRef: title
                };
            };

            const articleInfo = parseArticleTitle(record.title);
            const articleButtonHtml = articleInfo.lawName && articleInfo.articleRef ? 
                `<button class="article-ref-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-semibold border border-blue-300 transition-colors cursor-pointer" 
                        data-law-name="${articleInfo.lawName}" 
                        data-article-ref="${articleInfo.articleRef}" 
                        data-display-name="${articleInfo.displayName}"
                        title="クリックして条文を表示">
                    ${articleInfo.displayName}
                </button>` : 
                `<span class="text-gray-800 text-xs font-bold">${record.title}</span>`;

            return `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 h-24 flex flex-col">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1 mb-1">
                                <span class="inline-block px-1.5 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800 border border-blue-300">
                                    ⚡ クイズ
                                </span>
                                <span class="inline-block px-1.5 py-0.5 text-xs font-bold rounded ${record.quizResult.isCorrect ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}">
                                    ${record.quizResult.isCorrect ? '正解' : '不正解'}
                                </span>
                            </div>
                            <div class="mb-1">${articleButtonHtml}</div>
                            <div class="text-xs text-gray-500">
                                <span class="inline-flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>${studyTime}</span>
                                </span>
                            </div>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <div class="${scoreColor} font-bold text-sm">
                                ${scoreIcon} ${record.quizResult.score}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 通常の学習記録の表示
            // フォルダ名（法分野）の色情報を取得
            const folderColorInfo = getCategoryColor(record.folderName);
            const folderBadgeStyle = `color: ${folderColorInfo.color}; background-color: ${folderColorInfo.bgColor}; border-color: ${folderColorInfo.borderColor};`;

            // ランクの色情報を取得
            const rankColorInfo = getRankColor(record.rank);
            const rankBadgeStyle = `color: ${rankColorInfo.color}; background-color: ${rankColorInfo.bgColor}; border-color: ${rankColorInfo.borderColor};`;

            // 学習時刻をフォーマット
            const studyTime = record.studyRecord.timestamp ?
                new Date(record.studyRecord.timestamp).toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) :
                '時刻不明';

            return `
                <div class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer study-record-card h-24 flex flex-col"
                     onclick="window.location.href='#/case/${record.id}'" data-case-id="${record.id}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1 mb-1">
                                <span class="inline-block px-1.5 py-0.5 text-xs font-bold rounded study-record-folder-badge"
                                      style="${folderBadgeStyle}">${record.folderName}</span>
                                <span class="inline-block px-1.5 py-0.5 text-xs font-bold rounded study-record-rank-badge"
                                      style="${rankBadgeStyle}">${record.rank}</span>
                            </div>
                            <h4 class="font-bold text-gray-800 text-xs mb-1 truncate">${record.title}</h4>
                            <div class="text-xs text-gray-500">
                                <span class="inline-flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>${studyTime}</span>
                                </span>
                            </div>
                        </div>
                        <div class="text-green-500 text-sm flex-shrink-0">✅</div>
                    </div>
                </div>
            `;
        }
    }).join('');

    // 4列グリッドレイアウトのHTML
    const gridHTML = `
        <div class="grid grid-cols-4 gap-3 mb-4">
            ${gridRecordsHTML}
        </div>
    `;

    // カレンダーボタンはヘッダ右端に配置する（表示数と共に）
    const headerWithCalendar = `
        <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800">📅 今日の学習記録 (${todayRecords.length}件)</h3>
                <button onclick="if(window.openCalendar){window.openCalendar();}else{console.error('openCalendar関数が利用できません');}" title="カレンダーを表示" class="text-xl px-2 py-1 rounded hover:bg-gray-100">📅</button>
            </div>
            ${gridHTML}
        </div>
    `;

    return headerWithCalendar;
}

// カレンダー機能（シンプル実装）
let currentCalendarDate = new Date();

function openCalendar() {
    console.log('📅 カレンダーを開く');
    let modal = document.getElementById('today-calendar-modal');

    // モーダル要素が存在しない場合は動的に作成
    if (!modal) {
        console.log('📅 カレンダーモーダルを作成中...');
        const modalHTML = `
            <div id="today-calendar-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-lg shadow-xl w-full h-full max-w-none max-h-none mx-0 my-0 overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                        <h3 class="font-bold text-2xl text-gray-800">📅 カレンダー</h3>
                        <button onclick="closeCalendar()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-lg">✕</button>
                    </div>
                    <div class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                        <button onclick="changeMonth(-1)" class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-lg">◀ 前月</button>
                        <span id="calendar-month-year" class="font-bold text-2xl text-gray-800"></span>
                        <button onclick="changeMonth(1)" class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-lg">次月 ▶</button>
                    </div>
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2 p-6 flex-1"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('today-calendar-modal');
        console.log('✅ カレンダーモーダルを作成しました');
    } else {
        console.log('📅 既存のカレンダーモーダルを使用します');
    }

    currentCalendarDate = new Date(); // 今月にリセット
    renderCalendarGrid();
    modal.classList.remove('hidden');

    // 背景のスクロールを無効化
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px'; // スクロールバー分の余白を調整

    console.log('✅ カレンダーモーダルを表示しました');

    // ESCキーで閉じる機能を追加
    document.addEventListener('keydown', handleCalendarKeydown);
}

function closeCalendar() {
    console.log('📅 カレンダーを閉じる');
    const modal = document.getElementById('today-calendar-modal');
    if (modal) {
        modal.classList.add('hidden');

        // 背景のスクロールを元に戻す
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        console.log('✅ カレンダーモーダルを非表示にしました');
        // ESCキーイベントリスナーを削除
        document.removeEventListener('keydown', handleCalendarKeydown);
    } else {
        console.log('⚠️ カレンダーモーダルが見つかりません（既に閉じられている可能性があります）');
    }
}

// カレンダーのキーボードイベントハンドラー
function handleCalendarKeydown(event) {
    if (event.key === 'Escape') {
        closeCalendar();
    }
}

function changeMonth(delta) {
    console.log(`📅 月を変更: ${delta > 0 ? '次月' : '前月'}`);
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendarGrid();
}

function renderCalendarGrid() {
    console.log('📅 カレンダーグリッドをレンダリング');
    const monthYearSpan = document.getElementById('calendar-month-year');
    const gridDiv = document.getElementById('calendar-grid');

    if (!monthYearSpan || !gridDiv) {
        console.error('❌ カレンダー要素が見つかりません');
        return;
    }

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    monthYearSpan.textContent = `${year}年 ${month + 1}月`;

    // カレンダーグリッドを生成（全画面巨大表示）
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay(); // 0=日曜
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    const currentHour = today.getHours();
    
    // システム仕様: 一日は3:00から始まるため、3:00より前の場合は前日の日付を使用
    let effectiveToday = new Date(today);
    if (currentHour < 3) {
        effectiveToday.setDate(effectiveToday.getDate() - 1);
    }
    
    const isThisMonth = effectiveToday.getFullYear() === year && effectiveToday.getMonth() === month;

    // 月の総セル数を計算（曜日ヘッダー + 空セル + 日付セル）
    const totalCells = 7 + startWeekDay + daysInMonth; // 7は曜日ヘッダー
    const rowsNeeded = Math.ceil(totalCells / 7);

    let html = '';

    // 曜日ヘッダー（適切なサイズに調整）
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    weekdays.forEach(day => {
        html += `<div class="h-16 w-full flex items-center justify-center font-bold text-xl text-gray-700 bg-gray-100 border-r border-gray-300 last:border-r-0">${day}</div>`;
    });

    // 空のセル（月の最初の日まで）
    for (let i = 0; i < startWeekDay; i++) {
        html += `<div class="h-16 w-full bg-gray-50 border-r border-gray-200 last:border-r-0"></div>`;
    }

    // 日付セルを生成（学習記録付き）
    const dateCells = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        // ローカル時間を正しくフォーマット（UTCではなく）
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${y}-${m}-${dd}`; // YYYY-MM-DD形式（ローカル時間）
        const isToday = isThisMonth && day === effectiveToday.getDate();

        dateCells.push({ day, dateString, isToday });
    }

    // すべての日付の学習記録を並列で取得
    Promise.all(dateCells.map(async ({ day, dateString, isToday }) => {
        const studyRecords = await getStudyRecordsForDate(dateString);
        const hasStudyRecords = studyRecords.length > 0;

        // 適切なサイズのクラス設定
        const classes = ['h-24', 'w-full', 'flex', 'flex-col', 'items-center', 'justify-center', 'border', 'border-gray-300', 'hover:bg-gray-50', 'cursor-pointer', 'transition-colors', 'relative', 'p-3'];
        if (isToday) {
            classes.push('bg-blue-100', 'border-blue-500', 'ring-2', 'ring-blue-300');
        } else if (hasStudyRecords) {
            classes.push('bg-green-50', 'border-green-400');
        }

        // 日付表示を適切なサイズに
        let content = `<div class="font-bold text-2xl mb-2 ${isToday ? 'text-blue-800' : hasStudyRecords ? 'text-green-800' : 'text-gray-800'}">${day}</div>`;

        // 学習記録がある場合の法令別頭文字バッジ表示（巨大化）
        if (hasStudyRecords) {
            // 法令ごとに学習個数に応じて頭文字を繰り返し表示
            const categoryCounts = {};
            studyRecords.forEach(record => {
                const category = record.folderName;
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });

            // すべての頭文字を個数分繰り返して表示
            const allChars = [];
            Object.entries(categoryCounts).forEach(([category, count]) => {
                const firstChar = category.charAt(0);
                // 同じ法令の個数分頭文字を繰り返す（個数制限なし）
                for (let i = 0; i < count; i++) {
                    allChars.push({ char: firstChar, category, colorInfo: getCategoryColor(category) });
                }
            });

            // バッジを適切なサイズで複数行で表示（最大15個まで）
            const badgeContainer = document.createElement('div');
            badgeContainer.className = 'flex flex-wrap gap-1 mt-2 justify-center max-h-16 overflow-hidden';

            allChars.slice(0, 15).forEach(({ char, category, colorInfo }) => { // 最大15個まで表示
                const badge = document.createElement('div');
                badge.className = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border';
                badge.style.cssText = `
                    background-color: ${colorInfo.bgColor};
                    color: ${colorInfo.color};
                    border-color: ${colorInfo.borderColor};
                `;
                badge.title = category;
                badge.textContent = char;
                badgeContainer.appendChild(badge);
            });

            // 残りの学習記録がある場合は+マークを表示（適切なサイズ）
            const totalDisplayed = allChars.slice(0, 15).length;
            const remainingRecords = studyRecords.length - totalDisplayed;
            if (remainingRecords > 0) {
                const plusBadge = document.createElement('div');
                plusBadge.className = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm bg-gray-600 text-white border border-gray-500';
                plusBadge.title = `他${remainingRecords}件`;
                plusBadge.textContent = `+${remainingRecords}`;
                badgeContainer.appendChild(plusBadge);
            }

            content += badgeContainer.outerHTML;
        }

        return `<div class="${classes.join(' ')}" data-date="${dateString}" onclick="showDateDetails('${dateString}')">${content}</div>`;
    })).then(cells => {
        html += cells.join('');
        gridDiv.innerHTML = html;
        console.log('✅ カレンダーグリッドを更新しました');
    }).catch(error => {
        console.error('❌ カレンダーグリッド生成エラー:', error);
        // エラー時はシンプルな日付表示にフォールバック
        let fallbackHtml = '';
        weekdays.forEach(day => {
            fallbackHtml += `<div class="p-4 font-bold text-gray-600 text-center text-lg border-b-2 border-gray-200">${day}</div>`;
        });

        for (let i = 0; i < startWeekDay; i++) {
            fallbackHtml += `<div class="p-4 min-h-[120px]"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isThisMonth && day === effectiveToday.getDate();
            const classes = ['p-4', 'min-h-[120px]', 'border', 'border-gray-200', 'hover:bg-gray-50', 'cursor-pointer', 'rounded-lg', 'transition-colors'];
            if (isToday) {
                classes.push('bg-blue-100', 'border-blue-300', 'font-bold');
            }
            fallbackHtml += `<div class="${classes.join(' ')}"><div class="font-semibold text-lg ${isToday ? 'text-blue-800' : 'text-gray-800'}">${day}</div></div>`;
        }

        gridDiv.innerHTML = fallbackHtml;
    });
}

// 日付の詳細を表示する関数
async function showDateDetails(dateString) {
    console.log(`📅 日付詳細表示: ${dateString}`);

    const studyRecords = await getStudyRecordsForDate(dateString);

    // 保存日時順（古い順）に並べ替え
    studyRecords.sort((a, b) => {
        const timeA = a.studyRecord.timestamp ? new Date(a.studyRecord.timestamp) : new Date(0);
        const timeB = b.studyRecord.timestamp ? new Date(b.studyRecord.timestamp) : new Date(0);
        return timeA - timeB; // 古い順（昇順）
    });

    if (studyRecords.length === 0) {
        console.log('📅 この日は学習記録がありません');
        return;
    }

    // 既存の詳細モーダルがあれば削除
    const existingDetailModal = document.getElementById('date-detail-modal');
    if (existingDetailModal) {
        existingDetailModal.remove();
    }

    const dateObj = new Date(dateString);
    const formattedDate = dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    let recordsHTML = '';
    studyRecords.forEach(record => {
        const folderColorInfo = getCategoryColor(record.folderName);
        const rankColorInfo = getRankColor(record.rank);
        const timeStr = record.studyRecord.timestamp ?
            new Date(record.studyRecord.timestamp).toLocaleString('ja-JP') :
            '時刻不明';

        recordsHTML += `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
                 onclick="closeDateDetail(); window.location.href='#/case/${record.id}'">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="inline-block px-2 py-1 text-xs font-bold rounded"
                                  style="color: ${folderColorInfo.color}; background-color: ${folderColorInfo.bgColor}; border-color: ${folderColorInfo.borderColor};">
                                ${record.folderName}
                            </span>
                            <span class="inline-block px-2 py-1 text-xs font-bold rounded"
                                  style="color: ${rankColorInfo.color}; background-color: ${rankColorInfo.bgColor}; border-color: ${rankColorInfo.borderColor};">
                                ${record.rank}
                            </span>
                        </div>
                        <h4 class="font-bold text-gray-800 text-sm mb-1">${record.title}</h4>
                        <div class="text-xs text-gray-500">
                            <span class="inline-flex items-center gap-1">
                                <span>🕐</span>
                                <span>${timeStr}</span>
                            </span>
                        </div>
                    </div>
                    <div class="text-green-500 text-lg">✅</div>
                </div>
            </div>
        `;
    });

    const detailModalHTML = `
        <div id="date-detail-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] mx-4 my-4 flex flex-col">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h3 class="font-bold text-xl text-gray-800">📅 ${formattedDate} の学習記録</h3>
                    <button onclick="closeDateDetail()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">✕</button>
                </div>
                <div class="p-6 overflow-y-auto flex-1">
                    <div class="mb-4">
                        <span class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            📚 ${studyRecords.length}件の学習記録
                        </span>
                    </div>
                    ${recordsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', detailModalHTML);

    // 背景のスクロールを無効化
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px';

    console.log(`✅ ${dateString}の学習記録詳細を表示しました`);

    // 学習データを読み込んだらカレンダーを閉じる
    closeCalendar();

    // ESCキーで閉じる機能を追加
    document.addEventListener('keydown', handleDateDetailKeydown);
}

// 日付詳細モーダルを閉じる関数
function closeDateDetail() {
    const detailModal = document.getElementById('date-detail-modal');
    if (detailModal) {
        detailModal.remove();

        // 背景のスクロールを元に戻す
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        console.log('✅ 日付詳細モーダルを閉じました');
        // ESCキーイベントリスナーを削除
        document.removeEventListener('keydown', handleDateDetailKeydown);
    }
}

// 日付詳細モーダルのキーボードイベントハンドラー
function handleDateDetailKeydown(event) {
    if (event.key === 'Escape') {
        closeDateDetail();
    }
}

// グローバル関数として公開
window.showDateDetails = showDateDetails;
window.closeDateDetail = closeDateDetail;
window.openCalendar = openCalendar;
window.closeCalendar = closeCalendar;
window.changeMonth = changeMonth;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 カレンダー機能を初期化中...');

    // 古いカレンダーモーダルが残っていないかチェックして削除
    const existingModal = document.getElementById('today-calendar-modal');
    if (existingModal) {
        console.log('🧹 古いカレンダーモーダルを削除します');
        existingModal.remove();
    }

    // カレンダー関連関数がグローバルスコープで利用可能であることを確認
    if (typeof window.openCalendar === 'function') {
        console.log('✅ カレンダー機能が正常に初期化されました');
    } else {
        console.error('❌ カレンダー機能の初期化に失敗しました');
    }
});

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
        console.log(`🔍 学習記録表示生成開始: ${caseId}`);
        
        // ケースIDから相対パスを取得
        const relativePath = await getRelativePathFromCaseId(caseId);
        console.log(`📁 相対パス取得: ${caseId} → ${relativePath}`);
        
        // まず、相対パスを使用して個別ケースの学習記録を取得
        let studyRecord = null;
        try {
            const response = await fetch(`/api/get-study-record/${encodeURIComponent(relativePath)}`);
            const result = await response.json();
            console.log(`📊 個別API取得結果: ${relativePath}`, result);
            
            if (result.success) {
                // todayRecord > latestRecord の優先順位で使用
                studyRecord = result.todayRecord || result.latestRecord;
                console.log(`✅ 個別API取得成功: ${relativePath}`, studyRecord);
            }
        } catch (error) {
            console.warn(`⚠️ 個別API取得失敗: ${relativePath}`, error);
        }
        
        // 個別取得で失敗した場合のフォールバック:
        // 重い全件スキャンはデフォルトで行わない（無限ループ抑止）。
        // 必要な場合はグローバルフラグ window.ALLOW_FULL_STUDY_RECORD_SCAN を true に設定してください。
        if (!studyRecord) {
            if (window.ALLOW_FULL_STUDY_RECORD_SCAN) {
                const studyRecords = await getAllLatestStudyRecords();
                console.log(`📊 全学習記録取得結果:`, studyRecords);
                studyRecord = studyRecords[caseId];
                console.log(`📝 全件から対象ケースの学習記録:`, studyRecord);
            } else {
                console.log('⚠️ 全件スキャンは無効化されています（window.ALLOW_FULL_STUDY_RECORD_SCAN 未設定）。個別取得の結果を使用します。');
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
                📚 ${displayText} (${displayDate})
            </div>`;
        } else {
            console.log(`❌ 学習記録なし: ${caseId} - record:`, studyRecord);
            return `<div class="text-xs mt-1 text-gray-400">
                📖 未学習
            </div>`;
        }
    } catch (error) {
        console.warn('学習記録表示の生成に失敗:', error);
        return `<div class="text-xs mt-1 text-gray-400">
            📖 未学習
        </div>`;
    }
}

// ★★★ 全モジュールの学習記録を非同期で更新する関数 ★★★
async function updateAllStudyRecords(caseIds) {
    try {
        console.log('📚 学習記録を更新中...', caseIds.length, '件');
        
        if (caseIds.length === 0) {
            console.log('� 更新対象なし - スキップ');
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
                        console.error(`❌ 学習記録更新失敗: ${caseId}`, error);
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
        
        console.log(`✅ 学習記録更新完了: ${successCount}/${flatResults.length}件成功`);
    } catch (error) {
        console.error('❌ 学習記録更新エラー:', error);
    }
}

// ★★★ 単一ケースの学習記録を更新する関数（グローバルアクセス用） ★★★
window.updateSingleStudyRecord = async function(caseId) {
    try {
        console.log(`🔄 単一学習記録更新開始: ${caseId}`);
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
            
            console.log(`✅ 単一学習記録更新完了: ${caseId}`);
            
            // 強制的にページの再描画をトリガー
            document.body.offsetHeight;
        } else {
            console.warn(`❌ 学習記録要素が見つかりません: study-record-${caseId}`);
        }
    } catch (error) {
        console.error(`❌ 単一学習記録更新エラー: ${caseId}`, error);
    }
};

// ★★★ 学習記録全体更新のグローバル関数 ★★★
window.refreshAllStudyRecords = forceUpdateAllStudyRecords;

// ★★★ ストーリーキャラクター抽出関数 ★★★
function extractStoryCharactersFromCase(caseData) {
    // caseDataの基本チェック
    if (!caseData) {
        console.log('🎭 caseDataが未定義です');
        return [];
    }
    
    // 相対パスまたはタイトルをケース識別子として使用
    const caseIdentifier = caseData.filePath || caseData.title || 'Unknown';
    
    if (!caseData.story || !Array.isArray(caseData.story)) {
        console.log(`🎭 ${caseIdentifier}: ストーリーデータがありません (story: ${typeof caseData.story})`);
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
        console.log(`🎭 ${caseIdentifier}: 登場キャラクター`, Array.from(characterNames), '→', storyCharacters.map(c => c.name));
    }
    return storyCharacters;
}

// ★★★ モジュールバー用キャラクターギャラリー生成関数 ★★★
function buildModuleCharacterGallery(storyCharacters) {
    if (!storyCharacters || storyCharacters.length === 0) {
        return '';
    }
    
    console.log(`🎨 キャラクターギャラリー生成:`, storyCharacters.map(c => c.name));
    
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
    
    console.log(`🔍 Q&A完了割合計算開始: ${caseData.title || caseData.id}`);
    console.log(`📊 総Q&A数: ${totalQAs}`);
    
    // 各Q&Aの完了状況をチェック（同期処理に変更してエラーを回避）
    for (const qa of caseData.questionsAndAnswers) {
        if (qa.id) {
            try {
                // まずモジュールファイルから直接取得を試行
                let status = '未';
                if (qa.status && window.qaStatusSystem.statuses.includes(qa.status)) {
                    status = qa.status;
                }
                
                console.log(`📋 Q&A ${qa.id} (${caseData.id}) ステータス: ${status}`);
                // 最新のQ&Aシステムでは「済」が完了状態
                if (status === '済') {
                    completedQAs++;
                }
            } catch (error) {
                console.warn(`⚠️ Q&A ${qa.id} ステータス取得エラー:`, error);
            }
        }
    }
    
    console.log(`✅ 完了Q&A数: ${completedQAs}/${totalQAs}`);
    
    return {
        completed: completedQAs,
        total: totalQAs,
        ratio: totalQAs > 0 ? (completedQAs / totalQAs) : 0
    };
}

// ★★★ Q&A完了率を非同期で更新する関数 ★★★
async function updateQACompletionAsync(caseId) {
    try {
        console.log(`🔄 Q&A完了率非同期更新開始: ${caseId}`);
        
        // ケースデータを読み込み
        const caseData = await loadCaseWithRank(caseId);
        if (!caseData) {
            console.warn(`⚠️ ケースデータ取得失敗: ${caseId}`);
            return;
        }
        
        // Q&A完了率を計算
        const completionRatio = await calculateQACompletionRatio(caseData);
        
        // 表示要素を取得
        const qaElement = document.querySelector(`[data-qa-completion="${caseId}"]`);
        if (!qaElement) {
            console.warn(`⚠️ Q&A完了率表示要素が見つかりません: ${caseId}`);
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
        qaElement.innerHTML = `📄 <span class="${statusColor}" style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${statusText}</span>`;
        
        console.log(`✅ Q&A完了率更新完了: ${caseId} - ${statusText}`);
        
    } catch (error) {
        console.error(`❌ Q&A完了率更新エラー: ${caseId}`, error);
        
        // エラー時はエラー表示（「完了」文字を削除）
        const qaElement = document.querySelector(`[data-qa-completion="${caseId}"]`);
        if (qaElement) {
            qaElement.innerHTML = '📄 <span class="text-red-500" style="font-size: 1.1em; font-weight: bold;">エラー</span>';
        }
    }
}

// ★★★ デバッグ用：フォルダカラーテスト ★★★
async function testFolderColor() {
    console.log('🧪 フォルダカラーのテストを開始');
    const color = await getFolderColor('民法');
    console.log('🧪 民法のフォルダカラー:', color);
}

// グローバルでテスト関数を使用可能にする
window.testFolderColor = testFolderColor;

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
    console.log('📅 renderHome: カレンダー機能を初期化中...');
    window.openCalendar = openCalendar;
    window.closeCalendar = closeCalendar;
    window.changeMonth = changeMonth;
    window.showDateDetails = showDateDetails;
    window.closeDateDetail = closeDateDetail;
    console.log('✅ renderHome: カレンダー機能が初期化されました');

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
                color: #2c5530;
                font-family: 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', sans-serif;
                font-weight: 800;
                text-shadow: 
                    2px 2px 0px #ffffff,
                    -2px -2px 0px #ffffff,
                    2px -2px 0px #ffffff,
                    -2px 2px 0px #ffffff,
                    1px 1px 0px #ffffff,
                    -1px -1px 0px #ffffff,
                    1px -1px 0px #ffffff,
                    -1px 1px 0px #ffffff,
                    3px 3px 6px rgba(44, 85, 48, 0.2);
                position: relative;
                transition: all 0.3s ease;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .app-title:hover {
                color: #1a3c1f;
                text-shadow: 
                    2px 2px 0px #ffffff,
                    -2px -2px 0px #ffffff,
                    2px -2px 0px #ffffff,
                    -2px 2px 0px #ffffff,
                    1px 1px 0px #ffffff,
                    -1px -1px 0px #ffffff,
                    1px -1px 0px #ffffff,
                    -1px 1px 0px #ffffff,
                    4px 4px 8px rgba(26, 60, 31, 0.3);
                transform: translateY(-1px);
            }
            
            @media (min-width: 768px) {
                .app-title {
                    font-size: var(--title-text-size-md) !important;
                }
            }
            
            .atashinchi-logo {
                width: var(--logo-width);
                height: var(--logo-height);
                /* アニメーション削除 */
                transition: all 0.3s ease;
                filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
            }
            
            .atashinchi-logo:hover {
                /* ホバーアニメーション削除 */
                filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
            }
            
            .folder-badge {
                /* 動的に色が設定されるため、基本スタイルのみ定義 */
                position: relative;
                overflow: hidden;
                border: 2px solid;
                transition: none !important; /* トランジション削除 */
                animation: none !important; /* アニメーション完全削除 */
                background-image: none !important; /* グラデーション削除 */
            }
            
            .folder-badge * {
                animation: none !important;
                transition: none !important;
                background-image: none !important;
            }
            
            .folder-badge::before {
                display: none; /* 完全に非表示 */
            }
            
            .folder-badge:hover {
                /* アニメーションを完全に削除 */
            }
            
            .subfolder-badge {
                /* 動的に色が設定されるため、基本スタイルのみ定義 */
                position: relative;
                overflow: hidden;
                border: 1px solid;
                transition: none !important; /* トランジション削除 */
                animation: none !important; /* アニメーション完全削除 */
                background-image: none !important; /* グラデーション削除 */
                opacity: 0.8;
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
            
            .study-text {
                font-size: var(--study-text-size);
                color: #2c5530;
                font-family: 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', sans-serif;
                font-weight: 700;
                letter-spacing: 3px;
                text-shadow: 
                    3px 3px 0px #ffffff,
                    -3px -3px 0px #ffffff,
                    3px -3px 0px #ffffff,
                    -3px 3px 0px #ffffff,
                    2px 2px 0px #ffffff,
                    -2px -2px 0px #ffffff,
                    2px -2px 0px #ffffff,
                    -2px 2px 0px #ffffff,
                    1px 1px 0px #ffffff,
                    -1px -1px 0px #ffffff,
                    1px -1px 0px #ffffff,
                    -1px 1px 0px #ffffff,
                    4px 4px 8px rgba(44, 85, 48, 0.2);
                position: relative;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                transition: all 0.3s ease;
            }
            
            .study-text:hover {
                color: #1a3c1f;
                text-shadow: 
                    3px 3px 0px #ffffff,
                    -3px -3px 0px #ffffff,
                    3px -3px 0px #ffffff,
                    -3px 3px 0px #ffffff,
                    2px 2px 0px #ffffff,
                    -2px -2px 0px #ffffff,
                    2px -2px 0px #ffffff,
                    -2px 2px 0px #ffffff,
                    1px 1px 0px #ffffff,
                    -1px -1px 0px #ffffff,
                    1px -1px 0px #ffffff,
                    -1px 1px 0px #ffffff,
                    5px 5px 10px rgba(26, 60, 31, 0.3);
                transform: translateY(-2px);
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
                <button id="logout-btn" class="btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md gentle-rotate-on-hover">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    ログアウト
                </button>
                <button id="show-qa-list-btn" class="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all heartbeat">Q&A一覧</button>
                <button id="show-speed-quiz-btn" class="btn btn-primary bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all sparkle-effect">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    スピード条文
                </button>
            </div>
        </div>
        
        <!-- ★★★ 今日の学習記録セクション（動的に読み込み） ★★★ -->
        <div id="today-study-records-placeholder" class="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">📅 今日の学習記録</h3>
            <div class="text-center text-gray-500 py-8">
                <div class="text-2xl mb-2">⏳</div>
                <p>学習記録を読み込み中...</p>
            </div>
        </div>
        
        <!-- ★★★ フィルタリングパネル（タグ複数選択 + ランク絞り込み + サブフォルダ絞り込み + ステータス絞り込み対応） ★★★ -->
        <div class="bg-white rounded-xl shadow-lg p-4">
            <h3 class="text-lg font-bold text-gray-800">📂 モジュール検索・絞り込み</h3>
            
            <!-- モジュール検索フィールド -->
            <div>
                <label class="block text-sm font-bold text-gray-700">🔍 モジュール名検索</label>
                <input type="text" id="module-search" placeholder="モジュール名やタイトルで検索..." class="form-input w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500">
            </div>
            <!-- 完全に隙間なしの超密着レイアウト -->
            <div class="grid grid-cols-4 gap-1">
                <!-- 第1列: 所属フォルダ（大きく表示） -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-0">📁 所属フォルダ</label>
                    <select id="category-filter" class="form-input w-full p-2 border rounded text-sm focus:ring-1 focus:ring-yellow-500">
                        <option value="">すべてのフォルダ</option>
                        ${allCategories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
                    </select>
                    <!-- 所属フォルダの直下にフィルタクリア（隙間なし） -->
                    <button id="clear-filters" class="btn bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-1 rounded text-xs breathe-on-hover w-full mt-0">🗑️ フィルタクリア</button>
                </div>
                <!-- 第2列: サブフォルダ（大きく表示） -->
                <div id="subfolder-filter-container" style="display: none;">
                    <label class="block text-sm font-bold text-gray-700 mb-0">📂 サブフォルダ</label>
                    <select id="subfolder-filter" class="form-input w-full p-2 border rounded text-sm focus:ring-1 focus:ring-yellow-500" disabled>
                        <option value="">フォルダを選択してください</option>
                    </select>
                    <!-- サブフォルダの直下に目次再生成（隙間なし） -->
                    <button id="regenerate-index" class="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-1 rounded text-xs rainbow-glow-on-hover w-full mt-0">🔄 目次再生成</button>
                </div>
                <!-- 第3-4列: 並び替えコントロール（2列分使用、検索件数表示あり） -->
                <div class="col-span-2">
                    <div class="flex items-center gap-1 flex-wrap mt-0">
                        <label class="flex items-center gap-1">
                            <span class="text-xs font-bold text-gray-700">📊 並び替え:</span>
                            <select id="sort-by" class="p-1 border rounded text-xs focus:ring-1 focus:ring-yellow-500">
                                <option value="default">デフォルト順</option>
                                <option value="title">タイトル順</option>
                                <option value="rank">ランク順</option>
                                <option value="qa-average">Q&A番号平均順</option>
                            </select>
                            <button id="sort-order-btn" class="px-1 py-1 text-xs border rounded hover:bg-gray-100 transition-colors" title="並び順を切り替え">
                                <span id="sort-arrow">⬆️</span>
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
                    <label class="block text-sm font-bold text-gray-700 mb-2">📊 Q&Aステータス（複数選択可能）</label>
                    <div class="border rounded-lg p-3 bg-gray-50">
                        <div class="grid grid-cols-1 gap-2">
                            <label class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <input type="checkbox" value="未" class="status-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="inline-block px-2 py-1 rounded text-sm font-bold border bg-gray-100 text-gray-600 border-gray-300">未</span>
                            </label>
                            <label class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <input type="checkbox" value="済" class="status-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="inline-block px-2 py-1 rounded text-sm font-bold border bg-green-100 text-green-700 border-green-400">済</span>
                            </label>
                            <label class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <input type="checkbox" value="要" class="status-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="inline-block px-2 py-1 rounded text-sm font-bold border bg-red-100 text-red-700 border-red-400">要</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div id="qa-rank-filter-container" style="display: none;">
                    <label class="block text-sm font-bold text-gray-700 mb-2">🎖️ Q&Aランク（複数選択可能）</label>
                    <div class="border rounded-lg p-3 bg-gray-50" id="qa-rank-checkboxes">
                        <!-- Q&Aランクチェックボックスが動的に生成される -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ★★★ 目次再生成の状況表示エリア ★★★ -->
        <div id="regeneration-status" class="hidden bg-blue-50 border-l-4 border-blue-400 p-4">
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
                console.log('📺 表示モード設定を復元:', { QAリスト: showQAListMode, スピード条文: showSpeedQuizMode });
            }
        } catch (e) {
            console.error('表示モード設定の読み込みエラー:', e);
        }
    }

    // Q&A/モジュール切り替え用グローバル関数を先に宣言してwindowに登録
    window.renderFilteredModulesOrQAs = async function() {
        // フィルタパネル全体の表示/非表示を制御
        const filterPanel = document.querySelector('.bg-white.rounded-xl.shadow-lg.p-4.mb-4');
        const statusFilterContainer = document.getElementById('status-filter-container');
        const qaRankFilterContainer = document.getElementById('qa-rank-filter-container');
        
        if (showSpeedQuizMode) {
            // スピード条文モード時もフィルタパネルを表示（フィルタリング機能を共有）
            if (filterPanel) {
                filterPanel.style.display = 'block';
            }
        } else {
            // モジュール一覧またはQ&Aモード時はフィルタパネルを表示
            if (filterPanel) {
                filterPanel.style.display = 'block';
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
        }
        
        if (showSpeedQuizMode) {
            await renderSpeedQuizSection();
        } else if (showQAListMode) {
            await renderFilteredQAs({ showFilter: true }); // フィルタリングを有効化
        } else {
            await renderFilteredModules();
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
        qaListBtn.onclick = async () => {
            showQAListMode = !showQAListMode;
            showSpeedQuizMode = false; // スピード条文モードを無効化
            updateToggleButton();
            await renderFilteredModulesOrQAs();
        };
    }
    
    // ★★★ スピード条文ボタンの初期化 ★★★
    if (speedQuizBtn) {
        speedQuizBtn.style.display = '';
        speedQuizBtn.onclick = async () => {
            showSpeedQuizMode = !showSpeedQuizMode;
            showQAListMode = false; // Q&Aモードを無効化
            updateToggleButton();
            await renderFilteredModulesOrQAs();
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

    // フィルタリング機能を初期化（フィルタ設定の復元も含む）
    await initializeFiltering();
    
    // ★★★ ログアウト機能の初期化 ★★★
    initializeLogout();

    // フィルタ復元後に初期表示を実行
    if (mode === 'restore-modules') {
        // casePageから戻る場合、保存されたモジュール表示を復元
        console.log('🏠 casePageから戻るため、モジュール表示を復元');
        if (window.savedModulesContainer) {
            const modulesContainer = document.getElementById('modules-container');
            if (modulesContainer) {
                modulesContainer.innerHTML = window.savedModulesContainer;
                console.log('✅ モジュール表示を復元しました');
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
    moduleSearch.addEventListener('input', async function() {
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // カテゴリフィルタの変更時
    categoryFilter.addEventListener('change', async function() {
        await updateTagFilter();
        await updateSubfolderFilter(); // サブフォルダフィルタも更新
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
        
        // スピード条文の条文リストも更新
        if (window.updateSpeedQuizArticleList) {
            window.updateSpeedQuizArticleList();
        }
    });

    // サブフォルダフィルタの変更時
    subfolderFilter.addEventListener('change', async function() {
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
        
        // スピード条文の条文リストも更新
        if (window.updateSpeedQuizArticleList) {
            window.updateSpeedQuizArticleList();
        }
    });

    // 並び替えの変更時
    sortBy.addEventListener('change', async function() {
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });
    
    // 並び順ボタンのクリックイベント
    sortOrderBtn.addEventListener('click', async function() {
        // 並び順を切り替え
        window.currentSortOrder = window.currentSortOrder === 'asc' ? 'desc' : 'asc';
        
        // 矢印の向きを更新
        sortArrow.textContent = window.currentSortOrder === 'asc' ? '⬆️' : '⬇️';
        
        // フィルタリングを実行
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存
    });

    // フィルタクリアボタン
    clearFilters.addEventListener('click', async function() {
        categoryFilter.value = '';
        const subfolderFilter = document.getElementById('subfolder-filter');
        if (subfolderFilter) {
            subfolderFilter.value = '';
        }
        const moduleSearch = document.getElementById('module-search');
        if (moduleSearch) {
            moduleSearch.value = '';
        }
        document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.status-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.qa-rank-checkbox').forEach(cb => cb.checked = false);
        sortBy.value = 'default';
        window.currentSortOrder = 'asc';
        sortArrow.textContent = '⬆️';
        await updateTagFilter();
        await updateSubfolderFilter(); // サブフォルダフィルタもクリア
        await renderFilteredModulesOrQAs();
        saveFilterSettings(); // フィルター設定を保存（クリア状態）
    });

    // 目次再生成ボタン
    regenerateIndex.addEventListener('click', async function() {
        await handleIndexRegeneration();
    });

    // 初期タグフィルタを生成
    await updateTagFilter();
    await updateSubfolderFilter(); // サブフォルダフィルタも初期化（非同期で処理される）
    updateStatusFilter(); // ステータスフィルタも初期化
    updateQARankFilter(); // Q&Aランクフィルタも初期化
    
    // 保存されたフィルター設定を読み込む
    await loadFilterSettings();
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
        cb.addEventListener('change', async function() {
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
                    const cleanRank = qaRank.replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
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
        <div class="grid grid-cols-2 gap-2">
            ${availableQARanks.map(rank => {
                const diffClass = getDifficultyClass(rank);
                return `
                    <label class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input type="checkbox" value="${rank}" class="qa-rank-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${savedQARanks.includes(rank) ? 'checked' : ''}>
                        <span class="inline-block px-2 py-1 rounded-full text-sm font-bold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}">${rank}</span>
                    </label>
                `;
            }).join('')}
        </div>
    `;
    
    // チェックボックスにイベントリスナーを付与
    qaRankContainer.querySelectorAll('.qa-rank-checkbox').forEach(cb => {
        cb.addEventListener('change', async function() {
            await renderFilteredModulesOrQAs();
            saveFilterSettings(); // Q&Aランク変更時も設定を保存
        });
    });
}

function updateStatusFilter() {
    // ステータスチェックボックスにイベントリスナーを付与
    document.querySelectorAll('.status-checkbox').forEach(cb => {
        cb.addEventListener('change', async function() {
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
    const cleanRank = (rank || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
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

async function renderFilteredModules() {
    const categoryFilter = document.getElementById('category-filter');
    const subfolderFilter = document.getElementById('subfolder-filter');
    const filterResults = document.getElementById('filter-results');
    const modulesContainer = document.getElementById('modules-container');

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
            // ★★★ カテゴリが選択されていて、サブフォルダが「すべてのサブフォルダ」の場合、サブフォルダ種類でグループ化表示 ★★★
            if (selectedCategory && selectedSubfolder === '') {
                const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                const allCases = categories[categoryName] || [];
                
                // サブフォルダ別にケースを再グループ化
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
                       ${sortedSubfolders.map(subfolderName => {
                            const cases = subfolderGroups[subfolderName];
                            return `
                            <div class="mb-8">
                                <h4 class="text-2xl font-bold text-blue-800 mb-4 border-l-4 border-blue-500 pl-4">
                                    ${subfolderName}
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    ${cases.map(c => {
                                        // ランク情報を取得
                                        const rankValue = c.rank || '';
                                        const diffClass = getDifficultyClass(rankValue);

                                        // Q&A完了割合を計算（後で非同期更新）
                                        let qaCompletionDisplay = '';
                                        if (c.questionsAndAnswers && c.questionsAndAnswers.length > 0) {
                                            qaCompletionDisplay = `<div class="text-sm mt-2 text-gray-600" data-qa-completion="${c.id}">
                                                📄 <span style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">計算中...</span>
                                            </div>`;
                                            
                                            // 非同期でQ&A完了率を更新
                                            setTimeout(() => updateQACompletionAsync(c.id), 100);
                                        }

                                        return `
                                        <div data-case-id="${c.id}" class="case-card bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow relative">
                                            <div class="flex justify-between items-start mb-3">
                                                <span class="inline-block px-4 py-2 rounded-full text-lg font-extrabold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}" style="min-width:2.5em; text-align:center; font-size:1.5rem; letter-spacing:0.1em;">${diffClass.display}</span>
                                                <div class="flex flex-col items-end gap-1">
                                                    <div class="folder-badge text-xs font-bold px-3 py-1 rounded-full shadow-lg transform hover:scale-110 transition-transform cursor-pointer" data-category="${c.category || 'その他'}" style="${generateCategoryBadgeStyle(c.category || 'その他')}">
                                                        ${generateCategoryBadge(c.category || 'その他')}
                                                    </div>
                                                    <div class="subfolder-badge text-xs font-bold px-2 py-1 rounded-full shadow-md transform hover:scale-105 transition-transform cursor-pointer" style="${generateCategoryBadgeStyle(subfolderName)}">
                                                        ${generateCategoryBadge(subfolderName, true)}
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 class="text-xl font-bold text-gray-800">${c.title}</h3>
                                            <p class="text-sm text-gray-500 mb-2">${c.citation}</p>
                                            ${buildModuleCharacterGallery(extractStoryCharactersFromCase(c))}
                                            ${qaCompletionDisplay}
                                            ${c.lastModified ? `<div class="text-xs mt-1 text-gray-500">📅 更新: ${new Date(c.lastModified).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>` : ''}
                                            <div id="study-record-${c.id}" class="text-xs mt-1 text-gray-400" data-case-id="${c.id}">📖 未学習</div>
                                            <button class="edit-module-btn absolute bottom-3 right-3 text-gray-400 hover:text-blue-600 transition-colors" data-file-path="${c.filePath}" title="VSCodeで編集">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                        </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                `;
                
                // フィルタクリアボタンのイベントを追加
                document.getElementById('clear-filters-btn')?.addEventListener('click', function() {
                    categoryFilter.value = '';
                    if (subfolderFilter) subfolderFilter.value = '';
                    const moduleSearch = document.getElementById('module-search');
                    if (moduleSearch) moduleSearch.value = '';
                    document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
                    document.querySelectorAll('.rank-checkbox').forEach(cb => cb.checked = false);
                    updateTagFilter();
                    renderFilteredModules();
                });
                
            } else {
                // 通常のカテゴリ別表示
                if (Object.keys(categories).length > 0) {
                    modulesContainer.innerHTML = Object.entries(categories).map(([category, cases]) => `
                        <div class="mb-8">
                            <h3 class="text-2xl font-bold border-b-4 border-yellow-400 pb-2 mb-4 capitalize">${category}</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${cases.map(c => {
                                    // ランク情報を取得
                                    const rankValue = c.rank || '';
                                    const diffClass = getDifficultyClass(rankValue);

                                    // Q&A完了割合を計算（後で非同期更新）
                                    let qaCompletionDisplay = '';
                                    if (c.questionsAndAnswers && c.questionsAndAnswers.length > 0) {
                                        qaCompletionDisplay = `<div class="text-sm mt-2 text-gray-600" data-qa-completion="${c.id}">
                                            📄 <span style="font-size: 1.1em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">計算中...</span>
                                        </div>`;
                                        
                                        // 非同期でQ&A完了率を更新
                                        setTimeout(() => updateQACompletionAsync(c.id), 100);
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
                                    <div data-case-id="${c.id}" class="case-card bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow relative">
                                        <div class="flex justify-between items-start mb-3">
                                            <span class="inline-block px-4 py-2 rounded-full text-lg font-extrabold border ${diffClass.text} ${diffClass.bg} ${diffClass.border}" style="min-width:2.5em; text-align:center; font-size:1.5rem; letter-spacing:0.1em;">${diffClass.display}</span>
                                            <div class="flex flex-col items-end gap-1">
                                                <!-- ★★★ フォルダカラー対応バッジ ★★★ -->
                                                <div class="folder-badge text-xs font-bold px-3 py-1 rounded-full shadow-lg transform hover:scale-110 transition-transform cursor-pointer" data-category="${c.category || 'その他'}" style="${generateCategoryBadgeStyle(c.category || 'その他')}">
                                                    ${generateCategoryBadge(c.category || 'その他')}
                                                </div>
                                                <!-- ★★★ 派手なサブフォルダバッジ（あれば） ★★★ -->
                                                ${subfolderName ? `
                                                    <div class="subfolder-badge text-xs font-bold px-2 py-1 rounded-full shadow-md transform hover:scale-105 transition-transform cursor-pointer" style="${generateCategoryBadgeStyle(subfolderName)}">
                                                        ${generateCategoryBadge(subfolderName, true)}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        <h3 class="text-xl font-bold text-gray-800">${c.title}</h3>
                                        <p class="text-sm text-gray-500 mb-2">${c.citation}</p>
                                        ${buildModuleCharacterGallery(extractStoryCharactersFromCase(c))}
                                        ${qaCompletionDisplay}
                                        ${c.lastModified ? `<div class="text-xs mt-1 text-gray-500">📅 更新: ${new Date(c.lastModified).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>` : ''}
                                        <div id="study-record-${c.id}" class="text-xs mt-1 text-gray-400" data-case-id="${c.id}">📖 未学習</div>
                                        <button class="edit-module-btn absolute bottom-3 right-3 text-gray-400 hover:text-blue-600 transition-colors" data-file-path="${c.filePath}" title="VSCodeで編集">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
        
        // ケースカードのクリックイベントを追加
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // 編集ボタンがクリックされた場合はカード遷移を無効化
                if (e.target.closest('.edit-module-btn')) {
                    return;
                }
                
                const caseId = this.getAttribute('data-case-id');
                if (caseId) {
                    window.location.hash = `#/case/${caseId}`;
                }
            });
        });

        // ★★★ 編集ボタンのクリックイベントを追加 ★★★
        document.querySelectorAll('.edit-module-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const filePath = this.getAttribute('data-file-path');
                if (!filePath) {
                    console.error('ファイルパスが見つかりません');
                    return;
                }
                
                try {
                    const response = await fetch('/api/open-file', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ filePath })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        console.log('✅ ファイルを開きました:', result.path);
                        // 視覚的フィードバック（オプション）
                        this.style.color = '#10b981'; // 緑色に変更
                        setTimeout(() => {
                            this.style.color = '';
                        }, 1000);
                    } else {
                        console.error('❌ ファイルを開けませんでした:', result.error);
                        alert('ファイルを開けませんでした: ' + result.error);
                    }
                } catch (error) {
                    console.error('❌ エラーが発生しました:', error);
                    alert('エラーが発生しました: ' + error.message);
                }
            });
        });

        // ★★★ フォルダカラーシステムを適用 ★★★
        const folderBadges = document.querySelectorAll('.folder-badge');
        console.log(`🔍 フォルダバッジ検出数: ${folderBadges.length}`);
        
        await applyFolderColorsToMultipleBadges(
            folderBadges,
            (badge) => {
                const category = badge.getAttribute('data-category');
                console.log(`📁 バッジからカテゴリ取得: ${category}`);
                return category;
            }
        );
        console.log('🎨 フォルダカラーを適用しました');

        // ★★★ 念のため追加でカテゴリバッジスタイルを適用 ★★★
        applyCategoryBadgeStyles();
        console.log('🎨 サブフォルダグループでもapplyCategoryBadgeStylesを実行しました');

        // ★★★ フォルダバッジエフェクトは削除（法令色を優先） ★★★

        // ★★★ サブフォルダバッジエフェクトも削除（法令色を優先） ★★★

        // ★★★ 通常表示でもフォルダカラーシステムを適用 ★★★
        await applyFolderColorsToMultipleBadges(
            document.querySelectorAll('.folder-badge'),
            (badge) => badge.getAttribute('data-category')
        );
        console.log('🎨 通常表示でフォルダカラーを適用しました');
        
        // ★★★ 念のため追加でカテゴリバッジスタイルを適用 ★★★
        applyCategoryBadgeStyles();
        console.log('🎨 applyCategoryBadgeStylesも実行しました');
        
        // ★★★ 全モジュールの学習記録を非同期で更新 ★★★
        const allCaseIds = filteredCases.map(c => c.id);
        console.log('🚀 学習記録更新を即座に開始:', allCaseIds);
        
        // DOM要素が作成された直後に学習記録を更新
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
        console.log('🔄 目次再生成APIを呼び出し中...');
        const response = await fetch('/api/regenerate-case-index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log('✅ 目次再生成API応答:', result);
        
        if (result.success) {
            messageP.textContent = `✅ 目次再生成完了！ (${result.casesCount}件のケースを処理)`;
            
            console.log('🔄 目次ファイル再読み込み開始...');
            // 目次ファイルを動的に再読み込み
            await reloadCaseIndex();
            
            console.log('🔄 フィルター更新開始...');
            // フィルターとモジュール表示を更新（非同期で実行）
            await updateFiltersAfterRegeneration();
            
            console.log('🔄 モジュール表示更新開始...');
            await renderFilteredModules();
            
            // casePageのデータも更新
            if (window.currentCaseData && window.currentCaseData.id) {
                console.log('🔄 casePageのデータも更新');
                // casePageのloadAndRenderCaseを呼ぶ
                if (window.loadAndRenderCase) {
                    await window.loadAndRenderCase(window.currentCaseData.id, false);
                }
            }
            
            console.log('✅ 目次再生成プロセス完了');
            
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
 * 今日の学習記録セクションを動的に読み込んで表示する関数
 */
async function loadAndDisplayTodayStudyRecords() {
    console.log('🚀 学習記録セクションの動的読み込み開始');
    
    try {
        const placeholder = document.getElementById('today-study-records-placeholder');
        if (!placeholder) {
            console.warn('⚠️ 学習記録プレースホルダーが見つかりません');
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
            console.warn('⚠️ プレースホルダーに親ノードがありません。学習記録の挿入をスキップします');
        }
        
        // カテゴリバッジのスタイルを適用
        setTimeout(() => {
            applyCategoryBadgeStyles();
            console.log('🎨 学習記録のカテゴリバッジスタイルを適用しました');
        }, 100);
        
        console.log('✅ 学習記録セクションの表示完了');
        
    } catch (error) {
        console.error('❌ 学習記録読み込みエラー:', error);
        
        // エラー時のフォールバック表示
        const placeholder = document.getElementById('today-study-records-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800 mb-4">📅 今日の学習記録</h3>
                <div class="text-center text-red-500 py-8">
                    <div class="text-2xl mb-2">❌</div>
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
        console.log('🔄 目次ファイル再読み込み開始:', { timestamp });
        
        const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
        console.log('✅ 新しいindex.jsを読み込み完了:', {
            caseSummariesLength: indexModule.caseSummaries.length,
            sampleCategories: indexModule.caseSummaries.slice(0, 3).map(s => ({ category: s.category, subfolder: s.subfolder }))
        });

        // 再生成後は index.js のエクスポートそのものを使用する（初回起動時と同一挙動に揃える）
        window.caseSummaries = indexModule.caseSummaries;
        window.caseLoaders = indexModule.caseLoaders;

        console.log(`🔄 目次ファイル再読み込み完了 (${indexModule.caseSummaries.length}件)`);
        console.log('🔄 ローダーは index.js の export をそのまま採用');
        
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
    
    console.log('🔄 フィルター更新開始:', {
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
    
    console.log('🔄 フィルター選択肢を更新しました:', {
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
    // 統一されたQ&A表示機能をインポート
    const { renderQAList, setupQAListEventHandlers } = await import('../qaRenderer.js');
    
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
                        subfolder: summary.subfolder || '', // サブフォルダ情報を追加
                        tags: summary.tags || [],
                        rank: qa.rank || qa.difficulty || '', // Q&A個別のランク情報を優先
                        moduleRank: caseData.rank || caseData.difficulty || summary.rank || '' // モジュールランクも保持
                    });
                });
            } catch (e) { /* skip error */ }
        }
    }
    // フィルタ取得（トップページのみ）
    let filteredQAs = allQAs;
    if (showFilter) {
        const moduleSearchTerm = document.getElementById('module-search')?.value.toLowerCase() || '';
        const selectedCategory = document.getElementById('category-filter')?.value || '';
        const selectedSubfolder = document.getElementById('subfolder-filter')?.value || '';
        const selectedRanks = Array.from(document.querySelectorAll('.rank-checkbox:checked')).map(cb => cb.value);
        const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
        const selectedStatuses = Array.from(document.querySelectorAll('.status-checkbox:checked')).map(cb => cb.value);
        const selectedQARanks = Array.from(document.querySelectorAll('.qa-rank-checkbox:checked')).map(cb => cb.value);
        
        filteredQAs = allQAs.filter(qa => {
            // モジュール検索フィルタ
            if (moduleSearchTerm) {
                const moduleTitle = (qa.moduleTitle || '').toLowerCase();
                const moduleId = (qa.moduleId || '').toLowerCase();
                if (!moduleTitle.includes(moduleSearchTerm) && !moduleId.includes(moduleSearchTerm)) {
                    return false;
                }
            }
            
            // カテゴリフィルタ
            if (selectedCategory && qa.category !== selectedCategory) return false;
            
            // サブフォルダフィルタ
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
            
            // タグフィルタ
            if (selectedTags.length && !selectedTags.some(tag => qa.tags.includes(tag))) return false;
            
            // Q&A個別ランクフィルタ
            if (selectedQARanks.length) {
                const qaRank = (qa.rank || '').replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
                if (!selectedQARanks.includes(qaRank)) return false;
            }
            
            // ステータスフィルタ（未・済・要）
            if (selectedStatuses.length) {
                const qaId = qa.id; // 数値IDを使用
                // ケースページかトップページかで moduleId の取得方法を変える
                let moduleId = qa.moduleId; // トップページの場合
                if (!moduleId && window.currentCaseData && window.currentCaseData.id) {
                    moduleId = window.currentCaseData.id; // ケースページの場合
                }
                moduleId = moduleId || 'default'; // フォールバック
                
                // 非同期でステータスを取得する必要があるが、filterは同期処理なので
                // 一旦すべてを通して、後でフィルタリングする
                qa._needsStatusCheck = true;
                qa._moduleId = moduleId;
                qa.moduleId = moduleId; // qaRenderer.jsで使用される
                qa._selectedStatuses = selectedStatuses;
                return true; // 一旦通す
            }
            
            return true;
        });
    }
    
    // ステータスフィルタが有効な場合は非同期でステータスチェック
    if (showFilter) {
        const selectedStatuses = Array.from(document.querySelectorAll('.status-checkbox:checked')).map(cb => cb.value);
        if (selectedStatuses.length > 0) {
            const statusCheckedQAs = [];
            for (const qa of filteredQAs) {
                if (qa._needsStatusCheck) {
                    const currentStatus = await qaStatusSystem.getStatusAsync(qa._moduleId, qa.id);
                    if (qa._selectedStatuses.includes(currentStatus)) {
                        statusCheckedQAs.push(qa);
                    }
                } else {
                    statusCheckedQAs.push(qa);
                }
            }
            filteredQAs = statusCheckedQAs;
        }
    }
    
    filteredQAs.sort((a, b) => (a.id || 0) - (b.id || 0));
    
    // 統一されたQ&A表示機能を使用
    const html = await renderQAList({
        qaList: filteredQAs,
        moduleId: null, // 各Q&Aが独自のmoduleIdを持つ
        showModuleLink: showFilter, // フィルタ表示時のみモジュールリンクを表示
        title: showFilter ? '全Q&A横断リスト' : 'Q&Aリスト',
        idPrefix: 'qa-list'
    });
    
    modulesContainer.innerHTML = html;
    setupQAListEventHandlers(modulesContainer);
    
    // Q&Aリンクボタンの色更新機能は無効化済み
    
    // ★★★ 条文ボタンの処理をQ&Aリスト内でも有効にする ★★★
    console.log('🔧 Q&Aリスト内の条文ボタン処理を初期化');
    const articleButtons = modulesContainer.querySelectorAll('.article-ref-btn');
    console.log(`📋 発見された条文ボタン数: ${articleButtons.length}`);
    
    // 条文ボタンは既にeventHandler.jsのグローバルイベント委任で処理されるため、
    // 特別な処理は不要。ただし、デバッグ用にログを出力
    if (articleButtons.length > 0) {
        console.log('✅ Q&Aリスト内の条文ボタンが検出されました - グローバルイベント委任で処理されます');
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
        // カテゴリ、サブフォルダ、モジュール検索、ランク、ソート設定を取得
        const categoryFilter = document.getElementById('category-filter');
        const subfolderFilter = document.getElementById('subfolder-filter');
        const moduleSearch = document.getElementById('module-search');
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedSubfolder = subfolderFilter ? subfolderFilter.value : '';
        const moduleSearchTerm = moduleSearch ? moduleSearch.value : '';
        
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
            await updateSubfolderFilter(false);
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
        
        // サブフォルダフィルターの状態を復元（重複削除）
        // フィルタを適用してリスト更新
        await renderFilteredModulesOrQAs();
        
    } catch (error) {
        console.error('フィルター設定の読み込みに失敗:', error);
    }
}

// ★★★ ページ読み込み完了時の学習記録強制更新 ★★★
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ページ読み込み完了 - 学習記録強制更新開始');
    
    // 少し遅延してから実行（DOM要素の確実な作成を待つ）
    setTimeout(async () => {
        await forceUpdateAllStudyRecords();
    }, 2000); // 2秒後に実行
});

// ★★★ ページフォーカス時（ブラウザバック時含む）の学習記録更新 ★★★
window.addEventListener('focus', function() {
    console.log('🔄 ページフォーカス - 学習記録更新開始');
    setTimeout(async () => {
        await forceUpdateAllStudyRecords();
    }, 500); // 0.5秒後に実行
});

// ★★★ ページ表示時（bfcache対応）の学習記録更新 ★★★
window.addEventListener('pageshow', function(event) {
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
window.safeReload = function() {
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
