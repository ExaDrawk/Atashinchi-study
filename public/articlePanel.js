// articlePanel.js - シンプル版（余計な機能削除）

// ★★★ 条文表示パネルの状態管理 ★★★
let articlePanelVisible = false;
let keyboardVisible = false; // デフォルトで閉じた状態

// ★★★ 法令名マッピング（憲法対応） ★★★
const LAW_NAME_MAPPING = {
    '憲法': '日本国憲法',
    '日本国憲法': '日本国憲法'
};

// ★★★ 条文表示パネルの作成（シンプル版） ★★★
function createArticlePanel(supportedLaws = []) {
    // 既存のパネルがあれば削除
    const existingPanel = document.getElementById('article-panel');
    if (existingPanel) {
        existingPanel.remove();
    }      const panelHtml = `
        <div id="article-panel" class="fixed top-4 left-4 w-96 max-w-[90vw] bg-white rounded-lg shadow-2xl border-2 border-blue-200 hidden transform transition-all duration-300 flex flex-col max-h-[90vh]" style="z-index:1100000;">
            <div class="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
                <h3 class="font-bold text-lg">📖 条文表示</h3>
                <button id="close-article-panel" class="text-white hover:text-gray-200 text-xl font-bold">×</button>
            </div>
            <div class="p-4 flex-1 overflow-y-auto min-h-0">
                <div class="mb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">法令名</label>
                    <select id="law-select" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">法令を選択...</option>
                        ${supportedLaws.map(law => `<option value="${law}">${law}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">条文番号</label>
                    <input type="text" id="article-input" placeholder="例: 465条の4第1項、110条、197条1項2号" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" autocomplete="off" spellcheck="false">
                    <div class="text-xs text-gray-500 mt-1">
                        💡 PCキーボードで入力可能・コピー&ペースト対応・Enterキーで実行
                    </div>
                </div>
                
                <!-- ★★★ キーボード表示/非表示ボタン ★★★ -->
                <div class="mb-4 text-center">
                    <button id="toggle-keyboard-btn" class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold py-1 px-3 rounded transition-colors">⌨️ キーボードを表示</button>
                </div>
                
                <!-- ★★★ バーチャルキーボード（デフォルトで非表示） ★★★ -->
                <div id="virtual-keyboard" class="mb-4 bg-gray-50 p-3 rounded-lg border" style="display: none;">
                    <div class="text-xs text-gray-600 mb-2 text-center">条文番号入力キーボード</div>
                    <div class="grid grid-cols-3 gap-2 mb-3">
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="1">1</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="2">2</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="3">3</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="4">4</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="5">5</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="6">6</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="7">7</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="8">8</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="9">9</button>
                    </div>
                    <div class="grid grid-cols-3 gap-2 mb-3">
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-2 text-sm font-bold transition-colors" data-key="の">の</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-3 text-lg font-bold transition-colors" data-key="0">0</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-2 text-sm font-bold transition-colors" data-key="条">条</button>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-2 text-sm font-bold transition-colors" data-key="第">第</button>
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-2 text-sm font-bold transition-colors" data-key="項">項</button>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button class="virtual-key bg-white hover:bg-blue-100 border border-gray-300 rounded p-2 text-sm font-bold transition-colors" data-key="号">号</button>
                        <button id="virtual-clear" class="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded p-2 text-sm font-bold transition-colors text-gray-700">🗑️ クリア</button>
                    </div>
                </div>
                
                <div class="mb-4">
                    <button id="fetch-article-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">条文を取得</button>
                </div>                <div id="article-content" class="flex-1 overflow-y-auto bg-gray-50 p-3 rounded-lg border text-sm custom-scrollbar min-h-[200px]">
                    <p class="text-gray-500 text-center">法令と条文番号を入力して「条文を取得」ボタンを押してください</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', panelHtml);
    
    // パネルのイベントリスナーを設定
    setupArticlePanelEvents();
}

// ★★★ 条文表示パネルのイベントリスナー設定（シンプル版） ★★★
function setupArticlePanelEvents() {
    const panel = document.getElementById('article-panel');
    const closeBtn = document.getElementById('close-article-panel');
    const fetchBtn = document.getElementById('fetch-article-btn');
    const lawSelect = document.getElementById('law-select');
    const articleInput = document.getElementById('article-input');
    const virtualKeys = document.querySelectorAll('.virtual-key');
    const clearBtn = document.getElementById('virtual-clear');
    const toggleKeyboardBtn = document.getElementById('toggle-keyboard-btn');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    
    // 閉じるボタン
    closeBtn.addEventListener('click', hideArticlePanel);
    
    // 条文取得ボタン
    fetchBtn.addEventListener('click', fetchAndDisplayArticle);
    
    // ★★★ キーボード表示/非表示ボタン ★★★
    toggleKeyboardBtn.addEventListener('click', function() {
        keyboardVisible = !keyboardVisible;
        if (keyboardVisible) {
            virtualKeyboard.style.display = 'block';
            this.textContent = '⌨️ キーボードを隠す';
        } else {
            virtualKeyboard.style.display = 'none';
            this.textContent = '⌨️ キーボードを表示';
        }
    });
    
    // ★★★ PCキーボード対応 ★★★
    articleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchAndDisplayArticle();
        }
        
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            this.select();
        }
        
        if (e.ctrlKey && e.key === 'v') {
            console.log('📋 Ctrl+V ペースト操作を検出');
            setTimeout(() => {
                const pastedText = this.value.trim();
                if (pastedText) {
                    console.log(`📋 ペーストされたテキスト: "${pastedText}"`);
                    fetchAndDisplayArticle();
                }
            }, 100);
        }
    });
    
    // ★★★ コピー&ペースト対応 ★★★
    articleInput.addEventListener('paste', function(e) {
        console.log('📋 ペースト操作を検出');
        
        const clipboardData = e.clipboardData || window.clipboardData;
        if (clipboardData) {
            const pastedText = clipboardData.getData('text').trim();
            if (pastedText) {
                console.log(`📋 クリップボードから取得: "${pastedText}"`);
                this.value = '';
                setTimeout(() => {
                    this.value = pastedText;
                    fetchAndDisplayArticle();
                }, 50);
            }
        }
        
        setTimeout(() => {
            const currentText = this.value.trim();
            if (currentText) {
                console.log(`📋 フォールバック処理: "${currentText}"`);
                fetchAndDisplayArticle();
            }
        }, 100);
    });
    
    // ★★★ フォーカス時の処理 ★★★
    articleInput.addEventListener('focus', function() {
        console.log('🎯 入力フィールドにフォーカス');
        this.select();
    });
    
    // ★★★ バーチャルキーボードのイベントリスナー ★★★
    virtualKeys.forEach(key => {
        key.addEventListener('click', function() {
            const keyValue = this.dataset.key;
            const currentValue = articleInput.value;
            const cursorPosition = articleInput.selectionStart;
            
            const newValue = currentValue.slice(0, cursorPosition) + keyValue + currentValue.slice(cursorPosition);
            articleInput.value = newValue;
            articleInput.setSelectionRange(cursorPosition + keyValue.length, cursorPosition + keyValue.length);
            articleInput.focus();
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
    
    // クリアボタン
    clearBtn.addEventListener('click', function() {
        articleInput.value = '';
        articleInput.focus();
        
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
}

// ★★★ 条文取得と表示（シンプル版） ★★★
async function fetchAndDisplayArticle() {
    const lawSelect = document.getElementById('law-select');
    const articleInput = document.getElementById('article-input');
    const contentDiv = document.getElementById('article-content');
    const fetchBtn = document.getElementById('fetch-article-btn');
    const toggleKeyboardBtn = document.getElementById('toggle-keyboard-btn');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    
    const lawName = lawSelect ? lawSelect.value.trim() : '';
    const articleText = articleInput ? articleInput.value.trim() : '';
    
    if (!lawName) {
        contentDiv.innerHTML = '<p class="text-red-500">法令を選択してください</p>';
        return;
    }
    
    if (!articleText) {
        contentDiv.innerHTML = '<p class="text-red-500">条文番号を入力してください</p>';
        return;
    }
    
    // ローディング表示
    contentDiv.innerHTML = '<div class="text-center p-4"><div class="loader-small mx-auto"></div><p class="text-gray-500 mt-2">条文を取得中...</p></div>';
    fetchBtn.disabled = true;
    fetchBtn.textContent = '取得中...';
    
    try {
        // ★★★ 憲法の自動変換 ★★★
        const actualLawName = LAW_NAME_MAPPING[lawName] || lawName;
        
        // 複合文字列として送信（例: "民法465条の4第1項"）
        const inputText = `${actualLawName}${articleText}`;
        
        console.log(`🔍 条文取得リクエスト: "${inputText}"`);
        
        const response = await fetch('/api/parse-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputText: inputText
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`APIエラー: ${response.status} - ${errorText}`);
        }
        
        const articleContent = await response.text();
          // エラーメッセージかどうかチェック
        if (articleContent.startsWith('❌')) {
            throw new Error(articleContent);
        }
        
        // ★★★ 二重カッコ内の強調デコレーション処理 ★★★
        const formattedContent = formatDoubleParentheses(articleContent);
        
          // ★★★ シンプルな条文内容表示（法令名・条文番号を非表示） ★★★
        contentDiv.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-end items-center mb-2">
                    <button id="copy-article-btn" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors">📋 コピー</button>
                </div>
                <div class="whitespace-pre-line text-gray-700 leading-relaxed">${formattedContent}</div>
            </div>
        `;
        
        // ★★★ 条文が表示されたらキーボードを隠す ★★★
        if (keyboardVisible) {
            keyboardVisible = false;
            virtualKeyboard.style.display = 'none';
            toggleKeyboardBtn.textContent = '⌨️ キーボードを表示';
        }
          // コピーボタンのイベントリスナー
        const copyBtn = document.getElementById('copy-article-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                // 元のテキスト（HTMLタグなし）をコピー
                navigator.clipboard.writeText(articleContent).then(() => {
                    copyBtn.textContent = '✅ コピー済み';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 コピー';
                    }, 2000);
                }).catch(err => {
                    console.error('コピーに失敗:', err);
                    copyBtn.textContent = '❌ 失敗';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 コピー';
                    }, 2000);
                });
            });
        }
        
        console.log(`✅ 条文取得成功: ${inputText}`);
        
    } catch (error) {
        console.error('条文取得エラー:', error);
        contentDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 class="font-bold text-red-800 mb-2">❌ 条文取得エラー</h5>
                <p class="text-red-700 text-sm mb-3">${error.message}</p>
                <div class="text-xs text-red-600 bg-red-100 p-2 rounded">
                    <p class="font-bold mb-1">対応形式の例:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>民法465条の4第1項</li>
                        <li>民法465の4第1項</li>
                        <li>民法110条</li>
                        <li>民法197条1項2号</li>
                        <li>日本国憲法21条</li>
                    </ul>
                </div>
            </div>
        `;
        
    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = '条文を取得';
    }
}

// ★★★ 条文表示パネルの表示 ★★★
function showArticlePanel() {
    const panel = document.getElementById('article-panel');
    if (panel) {
        panel.classList.remove('hidden');
        panel.style.transform = 'scale(0.8)';
        panel.style.opacity = '0';
        
        setTimeout(() => {
            panel.style.transform = 'scale(1)';
            panel.style.opacity = '1';
        }, 10);
        
        articlePanelVisible = true;
        
        const articleInput = document.getElementById('article-input');
        if (articleInput) {
            setTimeout(() => {
                articleInput.focus();
                articleInput.select();
            }, 300);
        }
    }
}

// ★★★ 条文表示パネルの非表示 ★★★
function hideArticlePanel() {
    const panel = document.getElementById('article-panel');
    if (panel) {
        panel.style.transform = 'scale(0.8)';
        panel.style.opacity = '0';
        
        setTimeout(() => {
            panel.classList.add('hidden');
        }, 300);
        
        articlePanelVisible = false;
    }
}

// ★★★ 条文表示パネルを開いて条文をプリセット ★★★
function showArticlePanelWithPreset(lawName, articleRef) {
    console.log(`🎯 条文プリセット実行開始: 法令="${lawName}" 条文="${articleRef}"`);
    
    if (!lawName || !articleRef) {
        console.error('❌ プリセット実行失敗: 無効なパラメータ', { lawName, articleRef });
        return;
    }
    
    console.log(`📱 showArticlePanel呼び出し中...`);
    showArticlePanel();
    console.log(`📱 showArticlePanel呼び出し完了`);
    
    setTimeout(() => {
        console.log(`⏰ プリセット設定開始 (遅延実行)`);
        
        // より具体的に条文パネル内の要素を取得
        const articlePanel = document.getElementById('article-panel');
        if (!articlePanel) {
            console.error('❌ article-panelが見つかりません');
            return;
        }
        
        console.log(`✅ article-panel発見`);
        
        const lawSelect = articlePanel.querySelector('#law-select');
        const articleInput = articlePanel.querySelector('#article-input');
        
        console.log(`🔍 要素確認: lawSelect=${!!lawSelect}, articleInput=${!!articleInput}`);
        
        if (lawSelect && articleInput) {
            const actualLawName = LAW_NAME_MAPPING[lawName] || lawName;
            
            console.log(`🔧 プリセット設定: 法令="${actualLawName}", 条文="${articleRef}"`);
            
            // セレクトボックスのオプションが存在するかチェック
            const lawOption = Array.from(lawSelect.options).find(option => option.value === actualLawName);
            if (!lawOption) {
                console.warn(`⚠️ 法令オプションが見つかりません: "${actualLawName}"`);
                console.log('📋 利用可能な法令オプション:', Array.from(lawSelect.options).map(opt => opt.value));
            }
            
            lawSelect.value = actualLawName;
            articleInput.value = articleRef;
            
            console.log(`📋 設定後の値: 法令="${lawSelect.value}", 条文="${articleInput.value}"`);
            
            // 入力値が正しく設定されたか再確認
            if (lawSelect.value && articleInput.value) {
                console.log('✅ プリセット設定完了 - 条文を自動取得します');
                fetchAndDisplayArticle();
            } else {
                console.error('❌ 値の設定に失敗しました', {
                    setLawName: actualLawName,
                    currentLawValue: lawSelect.value,
                    setArticleRef: articleRef,
                    currentArticleValue: articleInput.value
                });
            }
        } else {
            console.error('❌ プリセット失敗: select要素またはinput要素が見つかりません');
            console.log('🔍 articlePanel内容:', articlePanel.innerHTML.substring(0, 500));
        }
    }, 300); // タイムアウトをさらに少し長くする
}

// ★★★ パネルの可視状態を取得する関数 ★★★
function isArticlePanelVisible() {
    return articlePanelVisible;
}

// ★★★ 法令selectのoptionを動的更新 ★★★
function updateLawSelectOptions(supportedLaws) {
    const lawSelect = document.getElementById('law-select');
    if (!lawSelect) {
        console.warn('⚠️ law-select要素が見つかりません');
        return;
    }
    
    lawSelect.innerHTML = '<option value="">法令を選択...</option>';
    
    supportedLaws.forEach(law => {
        const option = document.createElement('option');
        option.value = law;
        option.textContent = law;
        lawSelect.appendChild(option);
    });
    
    console.log(`✅ 法令selectのoption更新完了: ${supportedLaws.length}件`);
}

// ★★★ デバッグ用：条文パネルの状態確認 ★★★
function debugArticlePanel() {
    console.log('🔍 条文パネル状態確認:');
    console.log('- パネル可視状態:', articlePanelVisible);
    console.log('- キーボード可視状態:', keyboardVisible);
    
    const panel = document.getElementById('article-panel');
    const lawSelect = document.getElementById('law-select');
    const articleInput = document.getElementById('article-input');
    
    console.log('- パネル要素:', panel ? '存在' : '不在');
    console.log('- 法令セレクト:', lawSelect ? `存在 (値: "${lawSelect.value}")` : '不在');
    console.log('- 条文入力:', articleInput ? `存在 (値: "${articleInput.value}")` : '不在');
    
    if (lawSelect) {
        console.log('- 法令オプション数:', lawSelect.options.length);
    }
}

// ★★★ 二重カッコ内の強調デコレーション機能 ★★★
function formatDoubleParentheses(text) {
    // 二重カッコ「（（～））」を検出して強調デコレーション
    // カッコ自体は削除し、中身だけを太字・色付きで表示
    return text.replace(/（（([^）]+)））/g, '<span class="font-bold text-blue-700 bg-blue-50 px-1 rounded">$1</span>');
}

// ★★★ 単一のエクスポート文 ★★★
export { 
    createArticlePanel,
    showArticlePanel, 
    hideArticlePanel, 
    showArticlePanelWithPreset,
    isArticlePanelVisible,
    updateLawSelectOptions,
    debugArticlePanel
};

// ★★★ グローバル関数として公開 ★★★
window.showArticlePanelWithPreset = showArticlePanelWithPreset;

console.log('📦 articlePanel.js モジュール読み込み完了');
