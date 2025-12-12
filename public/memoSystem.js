// memoSystem.js - モジュールページ用メモ機能

/**
 * メモシステムクラス
 */
export class MemoSystem {
    constructor() {
        this.currentCaseId = null;
        this.memoContent = '';
        this.autoSaveTimer = null;
        this.isOpen = false;
        this.memoPanel = null;
        this.memoButton = null;
    }

    /**
     * メモシステムの初期化
     * @param {string} caseId - ケースID
     */
    async initialize(caseId) {
        this.currentCaseId = caseId;
        
        // 既存のUIを削除
        this.cleanup();
        
        // メモボタンとパネルを作成
        this.createMemoButton();
        this.createMemoPanel();
        
        // 既存のメモを読み込み
        await this.loadMemo();
        
        console.log('✏️ メモシステム初期化完了:', caseId);
    }

    /**
     * メモボタンを作成
     */
    createMemoButton() {
        this.memoButton = document.createElement('button');
        this.memoButton.id = 'memo-toggle-button';
        this.memoButton.className = 'memo-toggle-button';
        this.memoButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span>メモ</span>
        `;
        
        this.memoButton.addEventListener('click', () => this.toggleMemo());
        document.body.appendChild(this.memoButton);
    }

    /**
     * メモパネルを作成
     */
    createMemoPanel() {
        this.memoPanel = document.createElement('div');
        this.memoPanel.id = 'memo-panel';
        this.memoPanel.className = 'memo-panel';
        this.memoPanel.innerHTML = `
            <div class="memo-header">
                <h3>📝 メモ</h3>
                <button class="memo-close-btn" id="memo-close-btn">×</button>
            </div>
            <div class="memo-body">
                <textarea 
                    id="memo-textarea" 
                    placeholder="ここに自由にメモを書き込めます...&#10;&#10;💡 メモは5秒ごとに自動保存されます"
                    class="memo-textarea"
                ></textarea>
                <div class="memo-footer">
                    <span class="memo-status" id="memo-status">準備完了</span>
                    <span class="memo-info">自動保存: 5秒ごと</span>
                </div>
            </div>
        `;
        this.memoPanel.style.display = 'none';
        this.memoPanel.setAttribute('aria-hidden', 'true');
        
        document.body.appendChild(this.memoPanel);
        
        // イベントリスナーを設定
        document.getElementById('memo-close-btn').addEventListener('click', () => this.toggleMemo());
        document.getElementById('memo-textarea').addEventListener('input', (e) => this.onMemoInput(e));
    }

    /**
     * メモパネルの表示/非表示を切り替え
     */
    toggleMemo() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.memoPanel.classList.add('open');
            this.memoPanel.style.display = 'flex';
            this.memoPanel.setAttribute('aria-hidden', 'false');
            this.memoButton.classList.add('active');
            document.getElementById('memo-textarea').focus();
        } else {
            this.memoPanel.classList.remove('open');
            this.memoPanel.style.display = 'none';
            this.memoPanel.setAttribute('aria-hidden', 'true');
            this.memoButton.classList.remove('active');
        }
    }

    /**
     * メモ入力時の処理
     * @param {Event} e - イベント
     */
    onMemoInput(e) {
        this.memoContent = e.target.value;
        this.updateStatus('編集中...', 'editing');
        
        // 既存のタイマーをクリア
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // 5秒後に自動保存
        this.autoSaveTimer = setTimeout(() => {
            this.saveMemo();
        }, 5000);
    }

    /**
     * メモをローカルストレージに保存
     */
    async saveMemo() {
        if (!this.currentCaseId) {
            console.warn('⚠️ メモ保存失敗: ケースIDが設定されていません');
            return;
        }

        try {
            const memoKey = `memo_${this.currentCaseId}`;
            const memoData = {
                content: this.memoContent,
                updatedAt: new Date().toISOString(),
                caseId: this.currentCaseId
            };
            
            localStorage.setItem(memoKey, JSON.stringify(memoData));
            
            this.updateStatus('✓ 保存完了', 'saved');
            
            // 2秒後にステータスをリセット
            setTimeout(() => {
                this.updateStatus('準備完了', 'ready');
            }, 2000);
            
            console.log('💾 メモ保存完了:', this.currentCaseId);
        } catch (error) {
            console.error('❌ メモ保存エラー:', error);
            this.updateStatus('⚠ 保存失敗', 'error');
        }
    }

    /**
     * メモをローカルストレージから読み込み
     */
    async loadMemo() {
        if (!this.currentCaseId) {
            console.warn('⚠️ メモ読み込み失敗: ケースIDが設定されていません');
            return;
        }

        try {
            const memoKey = `memo_${this.currentCaseId}`;
            const savedData = localStorage.getItem(memoKey);
            
            if (savedData) {
                const memoData = JSON.parse(savedData);
                this.memoContent = memoData.content || '';
                
                const textarea = document.getElementById('memo-textarea');
                if (textarea) {
                    textarea.value = this.memoContent;
                }
                
                console.log('📖 メモ読み込み完了:', this.currentCaseId);
                this.updateStatus('読み込み完了', 'loaded');
                
                setTimeout(() => {
                    this.updateStatus('準備完了', 'ready');
                }, 1500);
            } else {
                this.memoContent = '';
                this.updateStatus('準備完了', 'ready');
            }
        } catch (error) {
            console.error('❌ メモ読み込みエラー:', error);
            this.updateStatus('⚠ 読み込み失敗', 'error');
        }
    }

    /**
     * ステータス表示を更新
     * @param {string} message - メッセージ
     * @param {string} type - タイプ（editing, saved, loaded, ready, error）
     */
    updateStatus(message, type) {
        const statusEl = document.getElementById('memo-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `memo-status memo-status-${type}`;
        }
    }

    /**
     * メモシステムのクリーンアップ
     */
    cleanup() {
        // タイマーをクリア
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        // 既存のUIを削除
        if (this.memoButton) {
            this.memoButton.remove();
            this.memoButton = null;
        }
        
        if (this.memoPanel) {
            this.memoPanel.remove();
            this.memoPanel = null;
        }
        
        this.isOpen = false;
        this.memoContent = '';
    }

    /**
     * 現在のメモ内容を取得
     * @returns {string} メモ内容
     */
    getMemoContent() {
        return this.memoContent;
    }

    /**
     * 全てのメモを取得（デバッグ用）
     * @returns {Object} 全メモデータ
     */
    static getAllMemos() {
        const memos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('memo_')) {
                try {
                    memos[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    console.error('メモ読み込みエラー:', key, e);
                }
            }
        }
        return memos;
    }

    /**
     * メモを削除
     * @param {string} caseId - ケースID（省略時は現在のケース）
     */
    deleteMemo(caseId = null) {
        const targetCaseId = caseId || this.currentCaseId;
        if (!targetCaseId) return;
        
        const memoKey = `memo_${targetCaseId}`;
        localStorage.removeItem(memoKey);
        
        if (targetCaseId === this.currentCaseId) {
            this.memoContent = '';
            const textarea = document.getElementById('memo-textarea');
            if (textarea) {
                textarea.value = '';
            }
            this.updateStatus('削除完了', 'ready');
        }
        
        console.log('🗑️ メモ削除完了:', targetCaseId);
    }
}

// メモシステムのグローバルインスタンス
export const memoSystem = new MemoSystem();
