/**
 * 🎨 司法試験答案添削UI関連機能
 */

console.log('🎨 添削UI機能初期化');

// 添削状態を管理するグローバル変数（タブ間で状態を保持）
window.judicialCorrectionState = {
    isCorrectionInProgress: false,
    lastCorrectionData: null,
    startTime: null
};

/**
 * 🎯 添削プログレス表示（完全に無効化）
 */
export function showAdvancedCorrectionProgress() {
    // 進捗表示を完全に無効化（キャラクター会話エリアを侵さないため）
    console.log('🔄 添削処理中...(表示は完全に無効化)');
    
    // CSSルールを追加して進捗表示を完全に非表示
    const styleId = 'hide-correction-progress-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .correction-progress,
            .correction-loading,
            #advanced-correction-progress,
            .correction-progress-indicator,
            .ai-analyzing-message,
            [id*="correction-progress"],
            [class*="correction-progress"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                position: absolute !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                margin: -1px !important;
                padding: 0 !important;
                border: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    return;
}

/**
 * 🎯 添削プログレス非表示
 */
export function hideAdvancedCorrectionProgress() {
    // 何もしない（表示自体を無効化しているため）
    return;
}

/**
 * 🎯 添削ボタンの状態を更新
 */
export function updateCorrectionButtonState(isInProgress) {
    try {
        // すべての添削ボタンを検索して更新
        const correctionButtons = document.querySelectorAll('.correction-button, button[data-action="correct-answer"], button:contains("添削")');
        
        correctionButtons.forEach(button => {
            if (isInProgress) {
                // 添削中の状態に変更
                button.setAttribute('disabled', 'disabled');
                button.classList.add('correction-in-progress');
                
                // 元のテキストを保存
                if (!button.getAttribute('data-original-text')) {
                    button.setAttribute('data-original-text', button.textContent);
                }
                
                // ボタンテキストを「添削中...」に変更
                button.textContent = '添削中...';
                button.style.cursor = 'not-allowed';
                button.style.opacity = '0.7';
            } else {
                // 通常状態に戻す
                button.removeAttribute('disabled');
                button.classList.remove('correction-in-progress');
                
                // 元のテキストを復元
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.textContent = originalText;
                }
                
                button.style.cursor = 'pointer';
                button.style.opacity = '1';
            }
        });
        
        // 状態をセッションストレージにも保存（ページ再読み込み対策）
        sessionStorage.setItem('judicialCorrectionInProgress', isInProgress ? 'true' : 'false');
        
    } catch (error) {
        console.error('添削ボタン状態更新エラー:', error);
    }
}

/**
 * 🎯 ページロード時およびタブ切り替え時の添削ボタン状態復元
 */
export function restoreCorrectionButtonState() {
    console.log('🔄 添削ボタン状態復元実行...');
    
    // セッションストレージから状態を読み取り
    const isInProgress = sessionStorage.getItem('judicialCorrectionInProgress') === 'true';
    
    // グローバル変数の状態も考慮
    const globalState = window.judicialCorrectionState?.isCorrectionInProgress === true;
    
    if (isInProgress || globalState) {
        updateCorrectionButtonState(true);
        console.log('✅ 添削ボタンを「添削中...」状態に設定しました');
    }
    
    // 万が一、既存のタブ変更イベントリスナーがある場合は削除
    document.querySelectorAll('.tab-button, [data-tab], .tab-control, .nav-item').forEach(tabButton => {
        const oldListener = tabButton._tabChangeListener;
        if (oldListener) {
            tabButton.removeEventListener('click', oldListener);
        }
    });
    
    // タブ切り替え時に状態を維持するためのイベントリスナーを追加
    document.querySelectorAll('.tab-button, [data-tab], .tab-control, .nav-item').forEach(tabButton => {
        const newListener = () => {
            // 少し遅延させて確実にDOM変更後に実行
            setTimeout(() => {
                if (window.judicialCorrectionState?.isCorrectionInProgress === true || 
                    sessionStorage.getItem('judicialCorrectionInProgress') === 'true') {
                    updateCorrectionButtonState(true);
                    console.log('🔄 タブ切替後も添削ボタン状態を維持しました');
                }
            }, 100);
        };
        
        tabButton.addEventListener('click', newListener);
        tabButton._tabChangeListener = newListener; // リスナー参照を保存
    });
}

/**
 * 🎯 添削状態の監視（DOM変更時に自動的に状態を復元）
 */
export function setupCorrectionStateObserver() {
    // 既存のオブザーバーをクリア
    if (window._correctionStateObserver) {
        window._correctionStateObserver.disconnect();
    }
    
    // 添削ボタンの状態を監視して自動的に復元するMutationObserver
    const observer = new MutationObserver((mutations) => {
        // DOM変更を検出したら、添削中かどうかチェック
        const isInProgress = window.judicialCorrectionState?.isCorrectionInProgress === true || 
                           sessionStorage.getItem('judicialCorrectionInProgress') === 'true';
                           
        if (isInProgress) {
            // 新しく追加されたボタン要素を検出
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 追加されたノード内の添削ボタンを探す
                            const addedButtons = node.querySelectorAll ? 
                                node.querySelectorAll('.correction-button, button[data-action="correct-answer"], button:contains("添削")') : [];
                            
                            if (addedButtons.length || 
                                (node.matches && node.matches('.correction-button, button[data-action="correct-answer"]')) ||
                                (node.textContent && node.textContent.includes('添削'))) {
                                
                                // 少し遅延させて確実に適用
                                setTimeout(() => {
                                    updateCorrectionButtonState(true);
                                    console.log('🔍 新しい添削ボタンを検出して状態を更新しました');
                                }, 50);
                            }
                        }
                    });
                }
            });
        }
    });
    
    // body全体を監視対象にする
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'disabled']
    });
    
    // グローバル参照を保存（後で停止できるように）
    window._correctionStateObserver = observer;
    console.log('👁️ 添削状態の自動監視を開始しました');
}

/**
 * 🎯 統計パネル表示（中央配置版）
 */
export function displayStatisticsPanel(correctionData) {
    console.log('📊 統計パネル表示開始');
    
    // 既存のパネルを削除
    const existingPanel = document.getElementById('statistics-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const stats = correctionData.statistics;
    if (!stats) return;
    
    // 中央の添削情報パネルに配置
    const correctionPanel = document.getElementById('correction-info-panel');
    if (!correctionPanel) return;
    
    // パネルの背景色を白に変更（アクティブ状態）
    correctionPanel.style.background = 'white';
    correctionPanel.style.borderColor = '#ddd';
    correctionPanel.innerHTML = ''; // 初期メッセージをクリア
    
    const panel = document.createElement('div');
    panel.id = 'statistics-panel';
    panel.className = 'advanced-statistics-panel';
    
    panel.innerHTML = `
        <div class="panel-header">📊 答案統計分析</div>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">文字数</span>
                <span class="stat-value">${stats.characterCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">行数</span>
                <span class="stat-value">${stats.lineCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">段落数</span>
                <span class="stat-value">${stats.paragraphCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">添削箇所</span>
                <span class="stat-value">${stats.correctionsCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">読みやすさ</span>
                <span class="stat-value">${stats.readabilityScore}点</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">法律用語</span>
                <span class="stat-value">${stats.legalTermsCount}個</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">条文引用</span>
                <span class="stat-value">${stats.citationCount}個</span>
            </div>
        </div>
        <div class="severity-breakdown">
            <h4>重要度別分布</h4>
            <div class="breakdown-item high">
                <span>高重要度: ${stats.severityBreakdown.high}件</span>
            </div>
            <div class="breakdown-item medium">
                <span>中重要度: ${stats.severityBreakdown.medium}件</span>
            </div>
            <div class="breakdown-item low">
                <span>低重要度: ${stats.severityBreakdown.low}件</span>
            </div>
        </div>
    `;
    
    // 中央パネルに追加
    correctionPanel.appendChild(panel);
    
    console.log('✅ 統計パネル表示完了');
}

/**
 * 🎯 詳細分析パネル表示（中央配置版）
 */
export function displayAnalysisPanel(correctionData) {
    console.log('🔍 詳細分析パネル表示開始');
    
    // 既存のパネルを削除
    const existingPanel = document.getElementById('analysis-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // 中央の添削情報パネルに配置
    const correctionPanel = document.getElementById('correction-info-panel');
    if (!correctionPanel) return;
    
    const panel = document.createElement('div');
    panel.id = 'analysis-panel';
    panel.className = 'advanced-analysis-panel';
    
    panel.innerHTML = `
        <div class="panel-header">🔍 法的分析評価</div>
        <div class="analysis-grid">
            <div class="analysis-item">
                <span class="analysis-label">論点特定</span>
                <span class="analysis-grade">${correctionData.legalAnalysis?.lawIdentification || 'B'}</span>
            </div>
            <div class="analysis-item">
                <span class="analysis-label">事実分析</span>
                <span class="analysis-grade">${correctionData.legalAnalysis?.factAnalysis || 'B'}</span>
            </div>
            <div class="analysis-item">
                <span class="analysis-label">論理構成</span>
                <span class="analysis-grade">${correctionData.legalAnalysis?.logicalStructure || 'B'}</span>
            </div>
            <div class="analysis-item">
                <span class="analysis-label">結論妥当性</span>
                <span class="analysis-grade">${correctionData.legalAnalysis?.conclusionValidity || 'B'}</span>
            </div>
        </div>
        <div class="strengths-weaknesses">
            <div class="strengths">
                <h4>👍 長所</h4>
                <ul>
                    ${correctionData.strengths?.map(s => `<li>${s}</li>`).join('') || '<li>基本的な論述力</li>'}
                </ul>
            </div>
            <div class="weaknesses">
                <h4>💡 改善点</h4>
                <ul>
                    ${correctionData.weaknesses?.map(w => `<li>${w}</li>`).join('') || '<li>より詳細な分析</li>'}
                </ul>
            </div>
        </div>
        <div class="recommendations">
            <h4>📋 推奨事項</h4>
            <ul>
                ${correctionData.recommendations?.map(r => `<li>${r}</li>`).join('') || '<li>条文引用の充実</li>'}
            </ul>
        </div>
    `;
    
    // 中央パネルに追加
    correctionPanel.appendChild(panel);
    
    console.log('✅ 詳細分析パネル表示完了');
}

/**
 * 🎯 高度な添削凡例表示（中央配置版）
 */
export function displayAdvancedLegend() {
    console.log('🏷️ 高度添削凡例表示開始');
    
    // 既存の凡例を削除
    const existingLegend = document.getElementById('advanced-correction-legend');
    if (existingLegend) {
        existingLegend.remove();
    }
    
    // 中央の添削情報パネルに配置
    const correctionPanel = document.getElementById('correction-info-panel');
    if (!correctionPanel) return;
    
    const legend = document.createElement('div');
    legend.id = 'advanced-correction-legend';
    legend.className = 'advanced-correction-legend';
    
    legend.innerHTML = `
        <div class="legend-header">🏷️ 添削凡例</div>
        <div class="legend-grid">
            <div class="legend-item essential">
                <span class="legend-color"></span>
                <span class="legend-text">必須要素</span>
            </div>
            <div class="legend-item good">
                <span class="legend-color"></span>
                <span class="legend-text">良い点</span>
            </div>
            <div class="legend-item improve">
                <span class="legend-color"></span>
                <span class="legend-text">改善点</span>
            </div>
            <div class="legend-item delete">
                <span class="legend-color"></span>
                <span class="legend-text">削除推奨</span>
            </div>
            <div class="legend-item structure">
                <span class="legend-color"></span>
                <span class="legend-text">構成問題</span>
            </div>
            <div class="legend-item citation">
                <span class="legend-color"></span>
                <span class="legend-text">引用関連</span>
            </div>
        </div>
        <div class="severity-legend">
            <div class="severity-item">🔴 高重要度</div>
            <div class="severity-item">🟡 中重要度</div>
            <div class="severity-item">🟢 低重要度</div>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #6b7280; text-align: center;">
            添削箇所をクリックで詳細表示
        </div>
    `;
    
    // 中央パネルに追加
    correctionPanel.appendChild(legend);
    
    console.log('✅ 高度添削凡例表示完了');
}

/**
 * 🎯 司法試験答案添削マークをクリア（文字位置ベースのハイライトも含む）
 */
export function clearJudicialCorrectionMarks() {
    console.log('🧹 添削マーククリア処理開始');
    
    try {
        // 文字位置ベースのハイライト要素を削除
        document.querySelectorAll('.character-highlight-overlay').forEach(el => el.remove());
        
        // ハイライトセグメント要素を削除
        document.querySelectorAll('.highlight-segment, .highlight-segment-part').forEach(el => el.remove());
        
        // コメントポップアップを削除
        document.querySelectorAll('.correction-comment-popup').forEach(el => el.remove());
        
        // コメントパネルを削除
        document.querySelectorAll('.correction-comment-panel').forEach(el => el.remove());
        
        // 統計・分析パネルを削除
        document.querySelectorAll('#statistics-panel, #analysis-panel, #advanced-correction-legend').forEach(el => el.remove());
        
        // 詳細パネルを削除
        document.querySelectorAll('#correction-detail-popup').forEach(el => el.remove());
        
        // 高度オーバーレイを削除
        document.querySelectorAll('.advanced-correction-overlay').forEach(el => el.remove());
        
        // テキストエリアの色を元に戻す（オーバーレイ用に変更されている場合）
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.style.color = '';
            textarea.style.caretColor = '';
            textarea.style.textShadow = '';
            textarea.style.backgroundColor = '';
        });
        
        // 中央パネルをリセット
        const correctionPanel = document.getElementById('correction-info-panel');
        if (correctionPanel) {
            correctionPanel.innerHTML = '<div class="panel-placeholder">添削が実行されると、ここに分析結果が表示されます。</div>';
            correctionPanel.style.background = '#f9fafb';
        }
        
        // 添削状態をリセット
        window.judicialCorrectionState.isCorrectionInProgress = false;
        sessionStorage.setItem('judicialCorrectionInProgress', 'false');
        updateCorrectionButtonState(false);
        
        console.log('✅ 添削マーククリア完了');
        
    } catch (error) {
        console.error('❌ 添削マーククリアエラー:', error);
    }
}

// ページロード完了時に実行
window.addEventListener('DOMContentLoaded', function() {
    restoreCorrectionButtonState();
    setupCorrectionStateObserver();
});
