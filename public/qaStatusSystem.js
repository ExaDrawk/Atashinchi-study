// qaStatusSystem.js - Q&Aステータス管理システム

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

    init() {
        console.log('🔖 Q&Aステータスシステム初期化中...');
        this.loadStatuses();
        this.setupGlobalEventListeners();
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
     * Q&Aのステータスを取得
     */
    getStatus(moduleId, qaId) {
        // moduleIdがnullの場合、qaIdを第一パラメータとして扱う（後方互換性）
        if (moduleId !== null && qaId === undefined) {
            qaId = moduleId;
            moduleId = window.currentCaseData?.id || null;
        }
        
        // モジュール固有のキーを最優先で試す
        if (moduleId) {
            const moduleSpecificKey = `qa_status_${moduleId}_qa-${qaId}`;
            let status = localStorage.getItem(moduleSpecificKey);
            if (status) {
                console.log(`📋 Q&Aステータス取得: Q${qaId} (${moduleId}) → ${status} (key: ${moduleSpecificKey})`);
                return status;
            }
        }
        
        // 現在のモジュールIDで試す
        const currentModuleId = window.currentCaseData?.id;
        if (currentModuleId && currentModuleId !== moduleId) {
            const currentModuleKey = `qa_status_${currentModuleId}_qa-${qaId}`;
            let status = localStorage.getItem(currentModuleKey);
            if (status) {
                console.log(`📋 Q&Aステータス取得: Q${qaId} (${currentModuleId}) → ${status} (key: ${currentModuleKey})`);
                return status;
            }
        }
        
        // 従来の形式もフォールバックとして試す（移行期間のため）
        const newFormatKey = `qa_status_qa-${qaId}`;
        let status = localStorage.getItem(newFormatKey);
        
        if (status) {
            console.log(`📋 Q&Aステータス取得: Q${qaId} → ${status} (key: ${newFormatKey}) [従来形式]`);
            return status;
        }
        
        // 古い形式も試す
        const oldFormatKey = `qa_status_${qaId}`;
        status = localStorage.getItem(oldFormatKey);
        
        if (status) {
            console.log(`📋 Q&Aステータス取得: Q${qaId} → ${status} (key: ${oldFormatKey}) [古い形式]`);
            return status;
        }
        
        // どちらも見つからない場合はデフォルト
        console.log(`📋 Q&Aステータス取得: Q${qaId} → 未 (デフォルト)`);
        return '未';
    }

    /**
     * Q&Aのステータスを設定
     */
    setStatus(moduleId, qaId, status) {
        // moduleIdがnullの場合、qaIdを第一パラメータとして扱う（後方互換性）
        if (moduleId !== null && qaId === undefined && typeof moduleId !== 'string') {
            status = qaId;
            qaId = moduleId;
            moduleId = window.currentCaseData?.id || null;
        }
        
        // 引数が2つの場合（qaId, status）
        if (arguments.length === 2 && typeof arguments[0] !== 'string') {
            status = arguments[1];
            qaId = arguments[0];
            moduleId = window.currentCaseData?.id || null;
        }
        
        if (!this.statuses.includes(status)) {
            console.error('❌ 無効なステータス:', status);
            return false;
        }

        // モジュール固有のキーを使用
        const key = this.getStorageKey(qaId, moduleId);
        localStorage.setItem(key, status);
        console.log(`✅ Q&Aステータス更新: Q${qaId} (${moduleId || 'current'}) → ${status} (key: ${key})`);
        
        // UI更新（モジュール固有）
        this.updateStatusButton(qaId, status, moduleId);
        this.updateQALinkColors(qaId, status);
        
        // 他のページのQ&Aボタンも即座に更新
        this.updateAllQALinkColors();
        
        // Q&Aセット状態の自動更新（セット管理システムが利用可能な場合）
        this.triggerSetStatusUpdate(qaId);
        
        return true;
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
                                class="qa-status-btn px-2 py-1 text-xs font-bold transition-all duration-200 hover:opacity-80 ${
                                    isActive 
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
    handleStatusClick(e) {
        if (!e.target.classList.contains('qa-status-btn')) return;

        e.preventDefault();
        e.stopPropagation();

        const button = e.target;
        const status = button.dataset.status;
        const qaId = button.dataset.qaId;
        const moduleId = button.dataset.moduleId || window.currentCaseData?.id || 'unknown';

        console.log(`🖱️ Q&Aステータスボタンクリック: Q${qaId} (${moduleId}) → ${status}`);

        // モジュール固有のステータス更新
        this.setStatus(moduleId, qaId, status);
        
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
     * Q&Aリンクボタン（Q7など）の色を更新
     */
    updateQALinkColors(qaId, status) {
        // 処理済みのボタンを追跡して重複処理を防ぐ
        const processedButtons = new Set();
        
        // Q&Aリンクボタンを検索（Q7、Q8など）
        const qaLinkButtons = document.querySelectorAll(`[data-qa-id="${qaId}"], button[onclick*="showQAPopup"][onclick*="${qaId}"], .qa-ref-btn[data-q-number="${qaId}"]`);
        
        qaLinkButtons.forEach(button => {
            // 既に処理済みのボタンはスキップ
            if (processedButtons.has(button)) return;
            processedButtons.add(button);
            
            // Q7などのボタンの場合
            if (button.textContent.match(/Q\d+/) || button.classList.contains('qa-ref-btn')) {
                const colors = this.qaLinkColors[status];
                
                // 現在のクラスリストを保存
                const baseClasses = [];
                button.classList.forEach(cls => {
                    if (!cls.match(/^(bg-|text-|border-|hover:bg-)/)) {
                        baseClasses.push(cls);
                    }
                });
                
                // クラスを完全にリセット
                button.className = '';
                
                // 基本クラスを復元
                baseClasses.forEach(cls => button.classList.add(cls));
                
                // 新しい色クラスを追加
                if (button.classList.contains('qa-ref-btn')) {
                    button.classList.add('qa-ref-btn', 'inline-block', 'px-2', 'py-1', 'rounded', 'text-sm', 'font-bold', 'border', 'transition-colors', 'cursor-pointer', 'mx-1');
                } else {
                    button.classList.add('qa-link-btn', 'font-bold', 'py-1', 'px-2', 'rounded', 'border', 'text-xs', 'transition-colors');
                }
                
                // 色クラスを追加
                colors.bg.split(' ').forEach(cls => button.classList.add(cls));
                colors.text.split(' ').forEach(cls => button.classList.add(cls));
                colors.border.split(' ').forEach(cls => button.classList.add(cls));
                colors.hover.split(' ').forEach(cls => button.classList.add(cls));
                
                console.log(`🎨 Q&Aリンクボタン色更新: Q${qaId} → ${status}`, button.className);
            }
        });

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
            const currentStatus = this.getStatus('default', qaId);
            console.log(`  Q${qaId}ボタン: ステータス=${currentStatus}, クラス=${button.className}`);
        });
    }

    /**
     * 初期化時にすべてのQ&Aリンクボタンの色を更新
     */
    updateAllQALinkColors() {
        console.log('🎨 全Q&Aリンクボタンの色更新開始');
        
        // 処理済みのQ&A IDを追跡
        const processedQAIds = new Set();
        
        // ローカルストレージからすべてのQ&Aステータスを取得して更新
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('qa_status_'));
        allKeys.forEach(key => {
            let qaId = key.replace('qa_status_', '');
            
            // "qa-"プレフィックスがある場合は数値部分だけを抽出
            if (qaId.startsWith('qa-')) {
                qaId = qaId.replace('qa-', '');
            }
            
            if (!processedQAIds.has(qaId)) {
                processedQAIds.add(qaId);
                const status = localStorage.getItem(key);
                this.updateQALinkColors(qaId, status);
            }
        });
        
        // ページ上のすべてのqa-ref-btnボタンも確認して未設定のものはデフォルト色にする
        const allQaRefButtons = document.querySelectorAll('.qa-ref-btn[data-q-number]');
        allQaRefButtons.forEach(button => {
            const qaId = button.dataset.qNumber;
            if (qaId && !processedQAIds.has(qaId)) {
                processedQAIds.add(qaId);
                const status = this.getStatus('default', qaId);
                this.updateQALinkColors(qaId, status);
            }
        });
        
        console.log('🎨 全Q&Aリンクボタンの色を更新完了');
    }

    /**
     * 新しく作成されたQ&Aボタンの色を即座に適用
     */
    applyColorsToNewButtons() {
        const newButtons = document.querySelectorAll('.qa-ref-btn[data-q-number]:not([data-color-applied])');
        newButtons.forEach(button => {
            const qaId = button.dataset.qNumber;
            if (qaId) {
                const status = this.getStatus('default', qaId);
                this.updateQALinkColors(qaId, status);
                button.setAttribute('data-color-applied', 'true');
            }
        });
    }
}

// グローバルインスタンス
window.qaStatusSystem = new QAStatusSystem();

// デバッグ用グローバル関数
window.debugQAStatus = function() {
    if (window.qaStatusSystem) {
        window.qaStatusSystem.debugLocalStorage();
    }
};

// Q&Aステータスを手動で設定するデバッグ関数
window.setQAStatusDebug = function(qaId, status) {
    if (window.qaStatusSystem) {
        const result = window.qaStatusSystem.setStatus('default', qaId, status);
        console.log(`🔧 手動ステータス設定: Q${qaId} → ${status} (結果: ${result})`);
        return result;
    }
};

// 新しいQ&Aボタンの色を即座に適用するグローバル関数
window.applyQAColors = function() {
    if (window.qaStatusSystem) {
        window.qaStatusSystem.applyColorsToNewButtons();
        window.qaStatusSystem.updateAllQALinkColors();
    }
};

// DOMContentLoaded後に全Q&Aリンクボタンの色を更新
document.addEventListener('DOMContentLoaded', () => {
    if (window.qaStatusSystem) {
        window.qaStatusSystem.updateAllQALinkColors();
    }
});

// ページ変更時にも全Q&Aリンクボタンの色を更新
window.addEventListener('popstate', () => {
    if (window.qaStatusSystem) {
        window.qaStatusSystem.updateAllQALinkColors();
    }
});

export { QAStatusSystem };
export default QAStatusSystem;
