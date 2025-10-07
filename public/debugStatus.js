// 緊急デバッグ用スクリプト
console.log('🚨 緊急デバッグスクリプト開始');

// 1. LocalStorageの内容を確認
console.log('📦 LocalStorage内容:');
Object.keys(localStorage).forEach(key => {
    if (key.includes('qa')) {
        console.log(`  ${key}: ${localStorage.getItem(key)}`);
    }
});

// 2. 直接ステータスを設定して色を変更
function emergencyColorChange(qaId, status) {
    console.log(`🚨 緊急色変更: Q${qaId} → ${status}`);
    
    // LocalStorageに直接保存
    localStorage.setItem(`qa_status_${qaId}`, status);
    console.log(`✅ LocalStorageに保存: qa_status_${qaId} = ${status}`);
    
    // ボタンを検索
    const allButtons = document.querySelectorAll('button');
    const targetButtons = Array.from(allButtons).filter(btn => 
        btn.textContent.includes(`Q${qaId}`) || 
        btn.getAttribute('data-qa-id') === qaId ||
        btn.getAttribute('data-qa-id') === `qa-${qaId}`
    );
    
    console.log(`🔍 見つかったボタン: ${targetButtons.length}個`);
    
    let backgroundColor, color, borderColor;
    
    if (status === '済') {
        backgroundColor = '#dcfce7'; // 緑
        color = '#15803d';
        borderColor = '#4ade80';
    } else if (status === '要') {
        backgroundColor = '#fee2e2'; // 赤
        color = '#b91c1c';
        borderColor = '#f87171';
    } else { // '未'
        backgroundColor = '#f3f4f6'; // グレー
        color = '#4b5563';
        borderColor = '#d1d5db';
    }
    
    targetButtons.forEach((btn, i) => {
        console.log(`🔧 ボタン${i+1}処理前:`, {
            text: btn.textContent,
            class: btn.className,
            style: btn.style.cssText,
            computed: window.getComputedStyle(btn).backgroundColor
        });
        
        // 完全リセット
        btn.style.cssText = '';
        btn.className = 'qa-ref-btn';
        
        // 強制色設定
        btn.style.setProperty('background-color', backgroundColor, 'important');
        btn.style.setProperty('color', color, 'important');
        btn.style.setProperty('border-color', borderColor, 'important');
        btn.style.setProperty('border', '1px solid', 'important');
        btn.style.setProperty('padding', '4px 8px', 'important');
        btn.style.setProperty('border-radius', '4px', 'important');
        btn.style.setProperty('font-weight', 'bold', 'important');
        btn.style.setProperty('cursor', 'pointer', 'important');
        btn.style.setProperty('margin', '0 4px', 'important');
        btn.style.setProperty('display', 'inline-block', 'important');
        
        console.log(`✅ ボタン${i+1}処理後:`, {
            style: btn.style.cssText,
            computed: window.getComputedStyle(btn).backgroundColor
        });
    });
    
    return targetButtons.length;
}

// グローバルに公開
window.emergencyColorChange = emergencyColorChange;

console.log('🚨 緊急デバッグ関数を使用してください:');
console.log('emergencyColorChange("121", "要") - Q121を赤色に');
console.log('emergencyColorChange("121", "済") - Q121を緑色に');
console.log('emergencyColorChange("121", "未") - Q121をグレーに');
