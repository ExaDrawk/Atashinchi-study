// qaStatusSystem.js - Q&Aステータス管理システム

import { caseLoaders } from './cases/index.js';
import { ApiService } from './apiService.js';

/**
 * Q&Aステータス管理クラス
 */
class QAStatusSystem {
    constructor() {
        this.statuses = ['未', '済', '要']; // デフォルト、完了、重要
        this.colors = {
            '未': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
            '済': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' },
            '要': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' }
        };
        this.qaLinkColors = {
            '未': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', hover: 'hover:bg-gray-200' },
            '済': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400', hover: 'hover:bg-green-200' },
            '要': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400', hover: 'hover:bg-red-200' }
        };
        this.init();
    }

    /**
     * 現在のケースの相対パスを取得する
     * @returns {Promise<string|null>} - 相対パス
     */
    async getCurrentCaseRelativePath() {
        if (!window.currentCaseData) {
            return null;
        }

        const caseId = window.currentCaseData.id;
        if (!caseId) {
            return null;
        }

        // caseSummariesから正確な相対パスを取得
        try {
            const { caseSummaries } = await import('./cases/index.js');
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

    init() {
        console.log('🔖 Q&Aステータスシステム初期化中...');
        this.loadStatuses();
        this.setupGlobalEventListeners();

        // 初期化後に色を適用
        setTimeout(() => {
            this.updateAllQALinkColors();
        }, 500);
    }

    /**
     * ローカルストレージキーを生成
     */
    getStorageKey(qaId, moduleId = null) {
        // モジュールIDが指定されている場合はそれを含める
        if (moduleId) {
            return `qa_status_${moduleId}_qa-${qaId}`;
        }

        // 現在のモジュールIDがある場合はそれを使用
        if (window.currentCaseData?.id) {
            return `qa_status_${window.currentCaseData.id}_qa-${qaId}`;
        }

        // フォールバック: 従来の形式
        if (typeof qaId === 'string' && qaId.startsWith('qa-')) {
            return `qa_status_${qaId}`;
        } else {
            return `qa_status_qa-${qaId}`;
        }
    }

    /**
     * モジュールJSファイルから直接Q&Aのステータスを取得（非同期版）
     */
    async getStatusFromModule(qaId, moduleId = null) {
        // moduleIdが指定された場合は、そのモジュールから取得
        if (moduleId && moduleId !== window.currentCaseData?.id) {
            try {
                // 動的にモジュールを読み込み
                const loader = (window.caseLoaders || caseLoaders)[moduleId];
                if (!loader) {
                    return '未';
                }

                const mod = await loader();
                const moduleData = mod.default;

                if (moduleData?.questionsAndAnswers) {
                    const qa = moduleData.questionsAndAnswers.find(item => item.id == qaId);
                    if (qa && qa.status && this.statuses.includes(qa.status)) {
                        return qa.status;
                    }
                }
            } catch (error) {
                console.error(`❌ 外部モジュール読み込みエラー: ${moduleId}`, error);
            }
        }

        // 現在のケースデータから取得（従来の処理）
        return this.getStatusFromCurrentModule(qaId);
    }

    /**
     * 現在のモジュールJSファイルから直接Q&Aのステータスを取得（同期版）
     */
    getStatusFromCurrentModule(qaId) {
        if (!window.currentCaseData?.questionsAndAnswers) {
            return '未';
        }

        const qa = window.currentCaseData.questionsAndAnswers.find(item => item.id == qaId); // 型比較を緩くする

        if (qa && qa.status && this.statuses.includes(qa.status)) {
            console.log(`✅ 現在のモジュールから取得: Q${qaId} → ${qa.status}`);
            return qa.status;
        }

        return '未';
    }

    /**
     * Q&Aのステータスを取得（モジュール優先）
     */
    getStatus(moduleId, qaId) {
        // 引数が1つの場合（後方互換性）
        if (qaId === undefined) {
            qaId = moduleId;
            moduleId = window.currentCaseData?.id;
        }

        console.log(`🔍 Q&Aステータス検索開始: QID=${qaId}, ModuleID=${moduleId}`);

        // 0. 最優先: モジュールJSファイルから直接取得（現在のケースのみ）
        if (!moduleId || moduleId === window.currentCaseData?.id) {
            const moduleStatus = this.getStatusFromCurrentModule(qaId);
            if (moduleStatus !== '未') {
                console.log(`✅ 現在のモジュールファイルから取得: Q${qaId} → ${moduleStatus}`);
                return moduleStatus;
            }

            // ★★★ 重要: モジュールファイルにstatusがない場合は「未」で確定 ★★★
            const qa = window.currentCaseData?.questionsAndAnswers?.find(item => item.id == qaId);
            if (qa && !qa.status) {
                console.log(`✅ 新規Q&A（statusなし）→ 強制的に「未」: Q${qaId}`);
                return '未';
            }
        }

        // 1. モジュール固有のキーを最優先で試す
        if (moduleId) {
            const moduleSpecificKey = `qa_status_${moduleId}_qa-${qaId}`;
            let status = localStorage.getItem(moduleSpecificKey);
            if (status && this.statuses.includes(status)) {
                console.log(`✅ モジュール固有キーでヒット: Q${qaId} (${moduleId}) → ${status}`);
                return status;
            }
        }

        // 2. 現在のモジュールIDで試す（moduleIdと異なる場合）
        const currentModuleId = window.currentCaseData?.id;
        if (currentModuleId && currentModuleId !== moduleId) {
            const currentModuleKey = `qa_status_${currentModuleId}_qa-${qaId}`;
            let status = localStorage.getItem(currentModuleKey);
            if (status && this.statuses.includes(status)) {
                console.log(`✅ 現在モジュールキーでヒット: Q${qaId} (${currentModuleId}) → ${status}`);
                return status;
            }
        }

        // ★★★ 3. 従来形式は同じモジュール内のQ&Aでstatusプロパティがある場合のみ参照 ★★★
        const qa = window.currentCaseData?.questionsAndAnswers?.find(item => item.id == qaId);
        if (qa && qa.status) {
            // statusプロパティがある場合のみ従来形式を確認
            const legacyKeys = [
                `qa_status_qa-${qaId}`,
                `qa_status_${qaId}`
            ];

            for (const key of legacyKeys) {
                let status = localStorage.getItem(key);
                if (status && this.statuses.includes(status)) {
                    console.log(`✅ 従来形式でヒット: Q${qaId} → ${status} (${key})`);
                    return status;
                }
            }
        }

        // どちらも見つからない場合はデフォルト
        console.log(`📋 デフォルトステータス使用: Q${qaId} → 未`);
        return '未';
    }

    /**
     * Q&Aのステータスを取得（非同期版・外部モジュール対応）
     */
    async getStatusAsync(moduleId, qaId) {
        // 引数が1つの場合（後方互換性）
        if (qaId === undefined) {
            qaId = moduleId;
            moduleId = window.currentCaseData?.id;
        }

        console.log(`🔍 Q&Aステータス検索開始(非同期): QID=${qaId}, ModuleID=${moduleId}`);

        // 0. 最優先: モジュールJSファイルから直接取得（非同期版）
        const moduleStatus = await this.getStatusFromModule(qaId, moduleId);
        if (moduleStatus !== '未') {
            console.log(`✅ モジュールファイルから取得: Q${qaId} → ${moduleStatus}`);
            return moduleStatus;
        }

        // フォールバック: 同期版のローカルストレージ検索
        return this.getStatus(moduleId, qaId);
    }

    /**
     * Q&Aのステータスを設定
     */
    async setStatus(moduleId, qaId, status) {
        // 引数パターンの正規化
        if (arguments.length === 2) {
            // (qaId, status) パターン
            status = qaId;
            qaId = moduleId;
            moduleId = window.currentCaseData?.id;

            // moduleIdが取得できない場合のエラーハンドリング
            if (!moduleId) {
                console.error('❌ setStatus: currentCaseDataからmoduleIdを取得できません');
                console.log('🔍 window.currentCaseData:', window.currentCaseData);
                console.log('🔍 利用可能なプロパティ:', window.currentCaseData ? Object.keys(window.currentCaseData) : 'undefined');
                return false;
            }
        } else if (arguments.length === 3) {
            // (moduleId, qaId, status) パターン
            // そのまま使用
        } else {
            console.error('❌ setStatus: 無効な引数数', arguments.length);
            return false;
        }

        console.log(`🔧 Q&Aステータス設定: QID=${qaId}, ModuleID=${moduleId}, Status=${status}`);

        if (!this.statuses.includes(status)) {
            console.error('❌ 無効なステータス:', status, '有効値:', this.statuses);
            return false;
        }

        // ★★★ 主保存: localStorage（確実に動作） ★★★
        const key = this.getStorageKey(qaId, moduleId);
        localStorage.setItem(key, status);
        console.log(`💾 ステータス保存（localStorage）: Q${qaId} → ${status} (key: ${key})`);

        // ファイル保存は非同期でエラーを無視（失敗しても続行）
        this.updateQADataStatus(moduleId, qaId, status).catch(err => {
            console.warn('⚠️ ファイル保存失敗（localStorageには保存済み）:', err.message);
        });

        // UI更新
        this.updateStatusButton(qaId, status, moduleId);

        // Q&Aセット状態の自動更新（セット管理システムが利用可能な場合）
        this.triggerSetStatusUpdate(qaId);

        // ホームページの進捗表示を更新
        if (window.updateModuleProgressDisplay && moduleId) {
            window.updateModuleProgressDisplay(moduleId);
        }

        return true;
    }

    /**
     * Q&Aデータにstatusフィールドを追加/更新し、ファイルに保存
     * @param {string} moduleId - モジュールID  
     * @param {string|number} qaId - Q&A ID (qa-1形式または数値)
     * @param {string} status - ステータス値
     */
    async updateQADataStatus(moduleId, qaId, status) {
        try {
            // moduleIdのバリデーション
            if (!moduleId || moduleId === 'undefined' || moduleId === 'null') {
                console.error('❌ updateQADataStatus: 無効なmoduleId:', moduleId);
                console.log('🔍 window.currentCaseData:', window.currentCaseData);
                return;
            }

            // qaIdを数値に変換（qa-1 → 1）
            const qNumber = typeof qaId === 'string' ?
                qaId.replace(/^qa-/, '') : qaId.toString();
            const qNum = parseInt(qNumber);

            console.log(`📝 Q&Aデータ更新開始: Module=${moduleId}, Q${qNum}, Status=${status}`);

            let qaList = null;

            // 現在のケースデータから取得を試行
            if (window.currentCaseData?.questionsAndAnswers && window.currentCaseData.id === moduleId) {
                qaList = window.currentCaseData.questionsAndAnswers;
                console.log(`🔍 現在のケースデータから取得: ${qaList.length}件`);
            } else {
                // 動的にモジュールを取得
                try {
                    const loader = (window.caseLoaders || caseLoaders)[moduleId];
                    if (loader) {
                        const mod = await loader();
                        const moduleData = mod.default;
                        if (moduleData?.questionsAndAnswers) {
                            qaList = moduleData.questionsAndAnswers;
                            console.log(`🔍 動的取得成功: ${moduleId} (${qaList.length}件)`);
                        }
                    }
                } catch (error) {
                    console.error(`❌ モジュール動的取得エラー: ${moduleId}`, error);
                }
            }

            // Q&Aリストにアクセス
            if (qaList) {
                const qaItem = qaList.find(qa => qa.id === qNum);

                if (qaItem) {
                    // statusフィールドを追加/更新
                    qaItem.status = status;

                    // checkフィールドを自動生成（空欄チェック用）
                    if (!qaItem.check) {
                        qaItem.check = this.generateBlankCheckString(qaItem.answer);
                        console.log(`🆕 checkフィールド自動生成: Q${qNum}.check = "${qaItem.check}"`);
                    }

                    console.log(`✅ Q&Aアイテム更新完了: Q${qNum}.status = "${status}"`);
                    console.log(`📋 更新後のQ&Aアイテム:`, qaItem);

                    // ファイルに保存（相対パス使用）
                    const relativePath = await this.getCurrentCaseRelativePath();
                    if (relativePath) {
                        await this.saveQADataToFile(relativePath, [{
                            id: qaItem.id,
                            status: qaItem.status,
                            check: qaItem.check
                        }]);
                    } else {
                        console.warn('⚠️ 相対パスが取得できないため、ファイル保存をスキップします');
                    }
                } else {
                    console.warn(`⚠️ Q&Aアイテムが見つかりません: Q${qNum}`);
                    console.log(`🔍 利用可能なQ&A ID:`, qaList.map(qa => qa.id));
                }
            } else {
                console.warn('⚠️ Q&Aデータが利用できません');
                console.log('🔍 moduleId:', moduleId);
                console.log('🔍 window.currentCaseData:', window.currentCaseData);
            }
        } catch (error) {
            console.error('❌ Q&Aデータ更新エラー:', error);
        }
    }

    /**
     * 回答文の空欄の数を数えてcheckフィールドを生成
     * @param {string} answerText - 回答文
     * @returns {string} - "0,0,0,0" のような形式のcheckフィールド
     */
    generateBlankCheckString(answerText) {
        if (!answerText) return "";

        // {{}}で囲まれた空欄を検出
        const blankPattern = /\{\{([^}]+)\}\}/g;
        const matches = [...answerText.matchAll(blankPattern)];
        const blankCount = matches.length;

        console.log(`🔍 空欄検出: ${blankCount}個の空欄を発見`);
        matches.forEach((match, index) => {
            console.log(`  空欄${index + 1}: ${match[1]}`);
        });

        // すべて0で初期化（未チェック状態）
        const checkArray = new Array(blankCount).fill(0);
        return checkArray.join(',');
    }

    /**
     * 特定のQ&Aの空欄チェック状態を取得
     * @param {number} qaId - Q&A ID
     * @returns {Array<number>} - チェック状態の配列 [0, 1, 0, 1, ...]
     */
    getBlankCheckStatus(qaId) {
        if (!window.currentCaseData?.questionsAndAnswers) {
            return [];
        }

        const qa = window.currentCaseData.questionsAndAnswers.find(item => item.id == qaId);
        if (!qa || !qa.check) {
            return [];
        }

        return qa.check.split(',').map(str => parseInt(str) || 0);
    }

    /**
     * 特定のQ&Aの空欄チェック状態を更新
     * @param {number} qaId - Q&A ID
     * @param {number} blankIndex - 空欄のインデックス（0から開始）
     * @param {number} checked - チェック状態 (0 or 1)
     */
    async updateBlankCheckStatus(qaId, blankIndex, checked) {
        if (!window.currentCaseData?.questionsAndAnswers) {
            console.error('❌ Q&Aデータが見つかりません');
            return;
        }

        const qa = window.currentCaseData.questionsAndAnswers.find(item => item.id == qaId);
        if (!qa) {
            console.error(`❌ Q&A ID ${qaId} が見つかりません`);
            return;
        }

        // checkフィールドがない場合は初期化
        if (!qa.check) {
            qa.check = this.generateBlankCheckString(qa.answer);
        }

        const checkArray = qa.check.split(',').map(str => parseInt(str) || 0);

        if (blankIndex < 0 || blankIndex >= checkArray.length) {
            console.error(`❌ 無効な空欄インデックス: ${blankIndex} (範囲: 0-${checkArray.length - 1})`);
            return;
        }

        checkArray[blankIndex] = checked ? 1 : 0;
        qa.check = checkArray.join(',');

        console.log(`✅ 空欄チェック更新: Q${qaId}[${blankIndex}] → ${checked ? 'チェック済み' : '未チェック'}`);
        console.log(`📋 新しいcheckフィールド: "${qa.check}"`);

        // モジュールファイルに保存（相対パス使用）
        const relativePath = await this.getCurrentCaseRelativePath();
        if (relativePath) {
            await this.saveQADataToFile(relativePath, [{ id: qa.id, check: qa.check }]);
        } else {
            console.warn('⚠️ 相対パスが取得できないため、ファイル保存をスキップします');
        }
    }

    /**
     * Q&Aデータをファイルに保存（相対パス対応）
     * @param {string} relativePath - 相対パス
     * @param {Array} qaList - Q&Aリスト
     */
    async saveQADataToFile(relativePath, qaUpdates) {
        try {
            const resolvedPath = relativePath && relativePath !== 'default'
                ? relativePath
                : await this.getCurrentCaseRelativePath();
            if (!resolvedPath) {
                console.error('❌ saveQADataToFile: relativePathを解決できませんでした', relativePath);
                return false;
            }
            if (!Array.isArray(qaUpdates) || qaUpdates.length === 0) {
                console.warn('⚠️ saveQADataToFile: 保存対象が空です');
                return false;
            }

            const payload = qaUpdates
                .map(update => this.normalizeQaUpdate(update))
                .filter(Boolean);
            if (!payload.length) {
                console.warn('⚠️ saveQADataToFile: 正常化後に保存対象がありません');
                return false;
            }

            console.log(`💾 進捗保存開始: ${resolvedPath} (${payload.length}件)`);
            const result = await ApiService.saveQaProgress(resolvedPath, payload);
            console.log('✅ 進捗保存成功:', result);
            return true;
        } catch (error) {
            console.error('❌ saveQADataToFile: 保存に失敗しました', error);
            return false;
        }
    }

    normalizeQaUpdate(update) {
        if (!update) return null;
        const source = update.qa || update;
        const id = source.id ?? source.qaId;
        if (id === undefined || id === null) {
            return null;
        }
        const patch = { id };
        if (source.status !== undefined) patch.status = source.status;
        if (source.check !== undefined) patch.check = source.check;
        if (source.notes) patch.notes = source.notes;
        if (source.meta || source.progressMeta) {
            patch.meta = {
                ...(source.meta || {}),
                ...(source.progressMeta || {})
            };
        }
        if (source.blankStats) {
            patch.blankStats = source.blankStats;
        }
        if (source.fillDrill) {
            patch.fillDrill = source.fillDrill;
        }
        return patch;
    }

    /**
     * Q&Aデータをファイルに保存（旧形式・後方互換用）
     * @deprecated 相対パス版のsaveQADataToFileを使用してください
     * @param {string} moduleId - モジュールID
     * @param {Array} qaList - Q&Aリスト
     */
    async saveQADataToFileByModuleId(moduleId, qaList) {
        // 相対パスを取得して新しいメソッドを呼び出し
        const relativePath = await this.getCurrentCaseRelativePath();
        if (relativePath) {
            return this.saveQADataToFile(relativePath, qaList);
        } else {
            console.warn('⚠️ 相対パスが取得できないため、従来のmoduleId方式で保存します');
            const fallbackPath = moduleId?.endsWith('.js') ? moduleId : `${moduleId}.js`;
            return this.saveQADataToFile(fallbackPath, qaList);
        }
    }

    /**
     * Q&Aセット状態の自動更新をトリガー
     * @param {number|string} qaId - 変更されたQ&A ID
     */
    triggerSetStatusUpdate(qaId) {
        if (!window.qaSetStatusSystem || !window.currentQASetInfo) {
            return; // セット管理システムが利用できない場合はスキップ
        }

        const { moduleId, setId, qaIds } = window.currentQASetInfo;

        // 変更されたQ&AがセットINに含まれているかチェック
        const numericQaId = typeof qaId === 'string' ? parseInt(qaId) : qaId;
        if (qaIds.includes(numericQaId)) {
            console.log(`🔄 Q&A変更検出、セット自動更新: Q${qaId} → セット${moduleId}/${setId}`);
            window.qaSetStatusSystem.autoUpdateSetStatus(moduleId, setId, qaIds);

            // セット管理UIの更新（表示されている場合）
            const qaSetUI = document.querySelector('.qa-set-management-ui');
            if (qaSetUI) {
                const container = qaSetUI.parentElement;
                if (typeof addQASetManagementUI === 'function') {
                    addQASetManagementUI(container);
                }
            }
        }
    }

    /**
     * すべてのステータスをロード
     */
    loadStatuses() {
        // 初期化時に必要があれば実装
        console.log('📂 Q&Aステータス読み込み完了');
    }

    /**
     * ステータスボタンHTML生成
     */
    generateStatusButtons(qaId, currentStatus = null, moduleId = null) {
        if (currentStatus === null) {
            // モジュールIDを考慮してステータス取得
            currentStatus = this.getStatus(moduleId, qaId);
        }

        const statusColor = this.colors[currentStatus];
        const currentModuleId = moduleId || window.currentCaseData?.id || 'unknown';

        return `
            <div class="qa-status-container inline-flex" data-qa-id="${qaId}" data-module-id="${currentModuleId}">
                <div class="qa-status-buttons inline-flex rounded-lg border ${statusColor.border} overflow-hidden">
                    ${this.statuses.map(status => {
            const color = this.colors[status];
            const isActive = status === currentStatus;
            return `
                            <button 
                                class="qa-status-btn px-2 py-1 text-xs font-bold transition-all duration-200 hover:opacity-80 ${isActive
                    ? `${color.bg} ${color.text}`
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                }"
                                data-status="${status}"
                                data-qa-id="${qaId}"
                                data-module-id="${currentModuleId}"
                                title="${this.getStatusDescription(status)}"
                            >
                                ${status}
                            </button>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * ステータスの説明を取得
     */
    getStatusDescription(status) {
        const descriptions = {
            '未': '未学習・未確認',
            '済': '学習済み・理解済み',
            '要': '重要・要復習'
        };
        return descriptions[status] || '';
    }

    /**
     * グローバルイベントリスナーを設定
     */
    setupGlobalEventListeners() {
        document.addEventListener('click', this.handleStatusClick.bind(this));
        console.log('🎯 Q&Aステータスイベントリスナー設定完了');
    }

    /**
     * ステータスボタンクリックハンドラ
     */
    async handleStatusClick(e) {
        if (!e.target.classList.contains('qa-status-btn')) return;

        e.preventDefault();
        e.stopPropagation();

        const button = e.target;
        const status = button.dataset.status;
        const qaId = button.dataset.qaId;
        const moduleId = button.dataset.moduleId || window.currentCaseData?.id || 'unknown';

        console.log(`🖱️ Q&Aステータスボタンクリック: Q${qaId} (${moduleId}) → ${status}`);

        // モジュール固有のステータス更新
        await this.setStatus(moduleId, qaId, status);

        // 視覚的フィードバック
        this.showStatusChangeAnimation(button);
    }

    /**
     * ステータスボタンUIを更新（モジュール固有）
     */
    updateStatusButton(qaId, newStatus, targetModuleId = null) {
        // モジュール固有の更新：targetModuleIdが指定されていない場合は、現在クリックされたボタンのモジュールIDを使用
        if (!targetModuleId) {
            targetModuleId = window.currentCaseData?.id;
        }

        // モジュールIDとQ&A IDの両方で要素を特定
        let containers;
        if (targetModuleId) {
            containers = document.querySelectorAll(`[data-qa-id="${qaId}"][data-module-id="${targetModuleId}"]`);
            console.log(`🎯 ステータス更新対象: Q${qaId} (モジュール: ${targetModuleId}) - ${containers.length}個の要素`);
        } else {
            // フォールバック: モジュールIDが不明な場合は全て更新（下位互換性）
            containers = document.querySelectorAll(`[data-qa-id="${qaId}"]`);
            console.log(`⚠️ ステータス更新（全て）: Q${qaId} - ${containers.length}個の要素`);
        }

        containers.forEach(container => {
            const buttons = container.querySelectorAll('.qa-status-btn');
            const statusColor = this.colors[newStatus];

            buttons.forEach(btn => {
                const btnStatus = btn.dataset.status;
                const color = this.colors[btnStatus];

                if (btnStatus === newStatus) {
                    // アクティブなボタン
                    btn.className = btn.className.replace(/bg-\w+-\w+|text-\w+-\w+/g, '');
                    btn.classList.add('qa-status-btn', 'px-2', 'py-1', 'text-xs', 'font-bold', 'transition-all', 'duration-200', 'hover:opacity-80');
                    btn.classList.add(...color.bg.split(' '), ...color.text.split(' '));
                } else {
                    // 非アクティブなボタン
                    btn.className = btn.className.replace(/bg-\w+-\w+|text-\w+-\w+/g, '');
                    btn.classList.add('qa-status-btn', 'px-2', 'py-1', 'text-xs', 'font-bold', 'transition-all', 'duration-200', 'hover:opacity-80');
                    btn.classList.add('bg-white', 'text-gray-400', 'hover:bg-gray-50');
                }
            });

            // コンテナのボーダー色も更新
            const buttonContainer = container.querySelector('.qa-status-buttons');
            if (buttonContainer) {
                buttonContainer.className = buttonContainer.className.replace(/border-\w+-\w+/g, '');
                buttonContainer.classList.add('qa-status-buttons', 'inline-flex', 'rounded-lg', 'border', 'overflow-hidden');
                buttonContainer.classList.add(...statusColor.border.split(' '));
            }
        });
    }

    /**
     * Q&Aリンクボタン（Q7など）の色を更新（無効化）
     */
    updateQALinkColors(qaId, status) {
        // 【id:～】形式のQ&Aボタン色を更新
        console.log(`🎨 Q&Aリンク色更新: Q${qaId} → ${status}`);

        // Q&Aボタンを検索（複数のセレクターで探す）
        const selectors = [
            `[data-q-number="${qaId}"]`,           // 【id:～】ボタン
            `[data-qa-id="qa-${qaId}"]`,          // その他のQ&Aボタン
            `[data-qa-id="${qaId}"]`              // 直接ID指定
        ];

        selectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                if (button.classList.contains('qa-ref-btn')) {
                    // 【id:～】ボタンの色を更新
                    this.updateQARefButtonColor(button, status);
                }
            });
        });
    }

    /**
     * 【id:～】ボタンの色を更新
     */
    updateQARefButtonColor(button, status) {
        const colors = this.qaLinkColors[status];
        if (!colors) return;

        // 既存の色クラスを削除
        const colorClassesToRemove = [
            'bg-gray-100', 'bg-green-100', 'bg-red-100',
            'text-gray-600', 'text-green-700', 'text-red-700',
            'border-gray-300', 'border-green-400', 'border-red-400',
            'hover:bg-gray-200', 'hover:bg-green-200', 'hover:bg-red-200'
        ];

        colorClassesToRemove.forEach(cls => button.classList.remove(cls));

        // 新しい色クラスを追加
        const newClasses = `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}`.split(' ');
        newClasses.forEach(cls => {
            if (cls.trim()) button.classList.add(cls.trim());
        });

        console.log(`✅ Q&Aボタン色更新完了: ${button.textContent} → ${status}`);
    }

    /**
     * ステータス変更アニメーション
     */
    showStatusChangeAnimation(button) {
        // 短い拡大アニメーション
        button.style.transform = 'scale(1.1)';
        button.style.transition = 'transform 0.1s ease-in-out';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    /**
     * 統計情報を取得
     */
    getStatistics() {
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('qa_status_'));
        const stats = { '未': 0, '済': 0, '要': 0 };

        allKeys.forEach(key => {
            const status = localStorage.getItem(key);
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
        });

        return stats;
    }

    /**
     * デバッグ用：ローカルストレージの内容を表示
     */
    debugLocalStorage() {
        console.log('🔍 Q&Aステータス デバッグ情報:');
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('qa_status_'));
        console.log(`📊 保存されているQ&Aステータス数: ${allKeys.length}`);

        if (allKeys.length === 0) {
            console.log('⚠️ Q&Aステータスが保存されていません');
        } else {
            allKeys.forEach(key => {
                let qaId = key.replace('qa_status_', '');
                const status = localStorage.getItem(key);

                // 表示用にIDを整理
                if (qaId.startsWith('qa-')) {
                    qaId = qaId.replace('qa-', '');
                    console.log(`  Q${qaId}: ${status} (新形式: ${key})`);
                } else {
                    console.log(`  Q${qaId}: ${status} (旧形式: ${key})`);
                }
            });
        }

        // 現在のページのQ&Aボタンも確認
        const qaButtons = document.querySelectorAll('.qa-ref-btn[data-q-number]');
        console.log(`📋 ページ上のQ&Aボタン数: ${qaButtons.length}`);
        qaButtons.forEach(button => {
            const qaId = button.dataset.qNumber;
            const moduleId = window.currentCaseData?.id;
            if (moduleId) {
                const currentStatus = this.getStatus(moduleId, qaId);
                console.log(`  Q${qaId}ボタン: ステータス=${currentStatus}, クラス=${button.className}`);
            }
        });
    }

    /**
     * 初期化時にすべてのQ&Aリンクボタンの色を更新（モジュールファイル優先）
     */
    async updateAllQALinkColors() {
        console.log('🎨 全Q&Aリンク色を更新中...');

        // 【id:～】ボタンを探して色を更新
        const qaRefButtons = document.querySelectorAll('.qa-ref-btn[data-q-number]');
        console.log(`🔍 発見された【id:～】ボタン数: ${qaRefButtons.length}`);

        qaRefButtons.forEach(button => {
            const qaId = button.dataset.qNumber;
            if (qaId) {
                const moduleId = window.currentCaseData?.id;
                const status = this.getStatus(moduleId, qaId);
                this.updateQARefButtonColor(button, status);
            }
        });

        console.log('✅ 全Q&Aリンク色更新完了');
    }

    /**
     * 新しく作成されたQ&Aボタンの色を即座に適用
     */
    async applyColorsToNewButtons() {
        // 少し待ってから新しいボタンを検索
        setTimeout(() => {
            this.updateAllQALinkColors();
        }, 100);
    }

    /**
     * デバッグ用：現在のQ&Aボタンと色の状態を表示
     */
    debugQAButtonColors() {
        console.log('🐛 === Q&Aボタン色デバッグ ===');

        const allQAButtons = document.querySelectorAll('.qa-ref-btn[data-q-number]');
        console.log(`📊 総Q&Aボタン数: ${allQAButtons.length}`);

        allQAButtons.forEach((button, index) => {
            const qaId = button.dataset.qNumber;
            const moduleId = window.currentCaseData?.id;
            const status = this.getStatus(moduleId, qaId);
            const expectedColors = this.qaLinkColors[status];

            console.log(`🔍 ボタン${index + 1}: Q${qaId}`);
            console.log(`  📋 ステータス: ${status}`);
            console.log(`  🎨 期待される色: ${JSON.stringify(expectedColors)}`);
            console.log(`  📱 現在のクラス: ${button.className}`);
            console.log(`  🔗 data-q-number: ${button.dataset.qNumber}`);
        });

        console.log('🐛 === デバッグ終了 ===');
    }
}

// グローバルインスタンス
window.qaStatusSystem = new QAStatusSystem();

// デバッグ用グローバル関数
window.debugQAStatus = function () {
    if (window.qaStatusSystem) {
        window.qaStatusSystem.debugLocalStorage();
    }
};

// Q&Aボタンの色デバッグ用グローバル関数
window.debugQAButtonColors = function () {
    if (window.qaStatusSystem) {
        window.qaStatusSystem.debugQAButtonColors();
    }
};

// Q&Aステータスを手動で設定するデバッグ関数
window.setQAStatusDebug = function (qaId, status) {
    if (window.qaStatusSystem) {
        const result = window.qaStatusSystem.setStatus(qaId, status);
        console.log(`🔧 手動ステータス設定: Q${qaId} → ${status} (結果: ${result})`);
        return result;
    }
};

// 新しいQ&Aボタンの色を即座に適用するグローバル関数
window.applyQAColors = function () {
    // 色の変更機能は無効化済み
};

// DOMContentLoaded後の色更新は無効化済み
document.addEventListener('DOMContentLoaded', () => {
    // 色の変更機能は無効化済み
});

// ページ変更時の色更新は無効化済み
window.addEventListener('popstate', () => {
    // 色の変更機能は無効化済み
});

export { QAStatusSystem };
export default QAStatusSystem;
