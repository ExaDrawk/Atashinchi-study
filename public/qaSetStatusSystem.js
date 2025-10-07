// qaSetStatusSystem.js - Q&Aセット単位でのステータス管理システム

/**
 * Q&Aセットステータス管理クラス
 * 個別Q&Aではなく、Q&Aセット（グループ）単位でステータスを管理
 */
class QASetStatusSystem {
    constructor() {
        this.statuses = ['未済', '進行中', '完了']; // Q&Aセット全体のステータス
        this.colors = {
            '未済': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' },
            '進行中': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' },
            '完了': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' }
        };
        this.init();
    }

    init() {
        console.log('🎯 Q&Aセットステータスシステム初期化中...');
        this.loadSetStatuses();
        this.setupGlobalEventListeners();
    }

    /**
     * Q&Aセットのローカルストレージキーを生成
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子（例：範囲、カテゴリなど）
     */
    getSetStorageKey(moduleId, setId) {
        return `qa_set_status_${moduleId}_${setId}`;
    }

    /**
     * Q&Aセットのステータスを取得
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子
     * @returns {string} ステータス
     */
    getSetStatus(moduleId, setId) {
        const key = this.getSetStorageKey(moduleId, setId);
        const status = localStorage.getItem(key);
        
        if (status && this.statuses.includes(status)) {
            console.log(`📋 Q&Aセットステータス取得: ${moduleId}/${setId} → ${status}`);
            return status;
        }
        
        // デフォルトは'未済'
        console.log(`📋 Q&Aセットステータス取得: ${moduleId}/${setId} → 未済 (デフォルト)`);
        return '未済';
    }

    /**
     * Q&Aセットのステータスを設定
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子
     * @param {string} status - 新しいステータス
     * @returns {boolean} 成功/失敗
     */
    setSetStatus(moduleId, setId, status) {
        if (!this.statuses.includes(status)) {
            console.error('❌ 無効なQ&Aセットステータス:', status);
            return false;
        }

        const key = this.getSetStorageKey(moduleId, setId);
        localStorage.setItem(key, status);
        console.log(`✅ Q&Aセットステータス更新: ${moduleId}/${setId} → ${status}`);
        
        // UI更新
        this.updateSetStatusDisplay(moduleId, setId, status);
        
        return true;
    }

    /**
     * Q&Aセット内の個別Q&A進捗から自動的にセットステータスを計算
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子
     * @param {Array} qaIds - セット内のQ&A ID配列
     * @returns {string} 計算されたステータス
     */
    calculateSetStatusFromQAs(moduleId, setId, qaIds) {
        if (!qaIds || qaIds.length === 0) {
            return '未済';
        }

        let completedCount = 0;
        let inProgressCount = 0;

        qaIds.forEach(qaId => {
            const qaStatus = window.qaStatusSystem?.getStatus(null, qaId) || '未';
            if (qaStatus === '済') {
                completedCount++;
            } else if (qaStatus === '要') {
                inProgressCount++;
            }
        });

        // ステータス計算ロジック
        if (completedCount === qaIds.length) {
            return '完了';
        } else if (completedCount > 0 || inProgressCount > 0) {
            return '進行中';
        } else {
            return '未済';
        }
    }

    /**
     * Q&Aセットステータス自動更新
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子
     * @param {Array} qaIds - セット内のQ&A ID配列
     */
    autoUpdateSetStatus(moduleId, setId, qaIds) {
        const calculatedStatus = this.calculateSetStatusFromQAs(moduleId, setId, qaIds);
        const currentStatus = this.getSetStatus(moduleId, setId);
        
        if (calculatedStatus !== currentStatus) {
            this.setSetStatus(moduleId, setId, calculatedStatus);
            console.log(`🔄 Q&Aセットステータス自動更新: ${moduleId}/${setId} ${currentStatus} → ${calculatedStatus}`);
        }
    }

    /**
     * Q&Aセットステータス表示を更新
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子
     * @param {string} status - ステータス
     */
    updateSetStatusDisplay(moduleId, setId, status) {
        const selector = `[data-qa-set-id="${moduleId}_${setId}"]`;
        const setElements = document.querySelectorAll(selector);
        const colorConfig = this.colors[status];

        setElements.forEach(element => {
            // 既存のステータスクラスを削除
            Object.values(this.colors).forEach(config => {
                element.classList.remove(config.bg, config.text, config.border);
            });

            // 新しいステータスクラスを追加
            element.classList.add(colorConfig.bg, colorConfig.text, colorConfig.border);
            
            // テキスト内容も更新（ステータス表示エリアがある場合）
            const statusTextElement = element.querySelector('.qa-set-status-text');
            if (statusTextElement) {
                statusTextElement.textContent = status;
            }
        });

        console.log(`🎨 Q&Aセット表示更新: ${moduleId}/${setId} → ${status}`);
    }

    /**
     * Q&Aセットステータスボタン生成
     * @param {string} moduleId - モジュールID
     * @param {string} setId - Q&Aセット識別子
     * @param {string} currentStatus - 現在のステータス（省略可）
     * @returns {string} HTMLボタン
     */
    generateSetStatusButtons(moduleId, setId, currentStatus = null) {
        if (currentStatus === null) {
            currentStatus = this.getSetStatus(moduleId, setId);
        }
        
        const statusColor = this.colors[currentStatus];
        
        return `
            <div class="qa-set-status-container inline-flex" data-qa-set-id="${moduleId}_${setId}">
                <div class="qa-set-status-buttons inline-flex rounded-lg border ${statusColor.border} overflow-hidden">
                    ${this.statuses.map(status => {
                        const color = this.colors[status];
                        const isActive = status === currentStatus;
                        return `
                            <button 
                                type="button" 
                                class="qa-set-status-btn px-3 py-1 text-xs font-bold transition-colors ${
                                    isActive 
                                        ? `${color.bg} ${color.text}` 
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }" 
                                data-module-id="${moduleId}"
                                data-set-id="${setId}"
                                data-status="${status}"
                                title="Q&Aセットを「${status}」に設定"
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
     * 範囲指定でQ&Aセットを定義
     * 例: "14-18" → Q14からQ18までのセット
     * @param {string} moduleId - モジュールID
     * @param {string} rangeSetId - 範囲セットID（例："14-18"）
     * @returns {Array} Q&A ID配列
     */
    getQAIdsFromRange(moduleId, rangeSetId) {
        if (!rangeSetId.includes('-')) {
            // 単一Q&Aの場合
            return [parseInt(rangeSetId)];
        }

        const [startStr, endStr] = rangeSetId.split('-');
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        
        if (isNaN(start) || isNaN(end) || start > end) {
            console.error('❌ 無効な範囲指定:', rangeSetId);
            return [];
        }

        const qaIds = [];
        for (let i = start; i <= end; i++) {
            qaIds.push(i);
        }
        
        console.log(`📊 Q&A範囲生成: ${rangeSetId} → [${qaIds.join(', ')}]`);
        return qaIds;
    }

    /**
     * グローバルイベントリスナー設定
     */
    setupGlobalEventListeners() {
        // Q&Aセットステータスボタンのクリックイベント
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('qa-set-status-btn')) {
                const moduleId = e.target.dataset.moduleId;
                const setId = e.target.dataset.setId;
                const status = e.target.dataset.status;
                
                this.setSetStatus(moduleId, setId, status);
                
                // セット内のQ&A自動更新もトリガー（必要に応じて）
                const qaIds = this.getQAIdsFromRange(moduleId, setId);
                this.autoUpdateSetStatus(moduleId, setId, qaIds);
            }
        });

        console.log('🎯 Q&Aセットイベントリスナー設定完了');
    }

    /**
     * すべてのセットステータスをロード
     */
    loadSetStatuses() {
        console.log('📂 Q&Aセットステータス読み込み完了');
    }

    /**
     * 統計情報を取得
     * @returns {Object} セットステータス統計
     */
    getSetStatistics() {
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('qa_set_status_'));
        const stats = { '未済': 0, '進行中': 0, '完了': 0 };
        
        allKeys.forEach(key => {
            const status = localStorage.getItem(key);
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
        });
        
        return stats;
    }

    /**
     * デバッグ用：Q&Aセットステータス一覧表示
     */
    debugSetStatuses() {
        console.log('🔍 Q&Aセットステータス デバッグ情報:');
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('qa_set_status_'));
        console.log(`📊 保存されているQ&Aセット数: ${allKeys.length}`);
        
        if (allKeys.length === 0) {
            console.log('⚠️ Q&Aセットステータスが保存されていません');
        } else {
            allKeys.forEach(key => {
                const setInfo = key.replace('qa_set_status_', '');
                const status = localStorage.getItem(key);
                console.log(`  セット${setInfo}: ${status}`);
            });
        }
        
        // 統計も表示
        const stats = this.getSetStatistics();
        console.log('📈 Q&Aセット統計:', stats);
    }
}

// グローバルインスタンス
window.qaSetStatusSystem = new QASetStatusSystem();

// デバッグ用グローバル関数
window.debugQASetStatus = function() {
    if (window.qaSetStatusSystem) {
        window.qaSetStatusSystem.debugSetStatuses();
    }
};

// Q&Aセットステータスを手動で設定するデバッグ関数
window.setQASetStatusDebug = function(moduleId, setId, status) {
    if (window.qaSetStatusSystem) {
        const result = window.qaSetStatusSystem.setSetStatus(moduleId, setId, status);
        console.log(`🔧 手動セットステータス設定: ${moduleId}/${setId} → ${status} (結果: ${result})`);
        return result;
    }
};

// Q&A範囲からセット状態を計算するデバッグ関数
window.calculateQASetStatusDebug = function(moduleId, setId) {
    if (window.qaSetStatusSystem) {
        const qaIds = window.qaSetStatusSystem.getQAIdsFromRange(moduleId, setId);
        const status = window.qaSetStatusSystem.calculateSetStatusFromQAs(moduleId, setId, qaIds);
        console.log(`🧮 Q&Aセットステータス計算: ${moduleId}/${setId} [${qaIds.join(', ')}] → ${status}`);
        return status;
    }
};

console.log('🎯 Q&Aセットステータス管理システム読み込み完了');
