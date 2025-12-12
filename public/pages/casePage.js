// pages/casePage.js - ケースページ専用モジュール（ランク付け表示対応）

import { caseLoaders } from '../cases/index.js';
import { characters } from '../data/characters.js';
import { processArticleReferences, processAllReferences, setupArticleRefButtons, processBoldText, processBlankFillText } from '../articleProcessor.js?v=1002';
import { showArticlePanel } from '../articlePanel.js';
import { ApiService } from '../apiService.js';
import { recreateQAPopup, createGlobalPopupContainer } from '../qaPopup.js';
import { QAStatusSystem } from '../qaStatusSystem.js';
import { buildQAButtonPresentation } from '../qaButtonUtils.js';
import { startIntoMode } from '../intoMode.js?v=1009';
import { resolveQuestionsAndAnswers } from '../qaLoader.js';

/**
 * 学習記録用の日付を計算する関数
 * @param {Date} now - 現在時刻（省略時は現在時刻を使用）
 * @returns {string} - YYYY-MM-DD形式の日付
 */
function getStudyRecordDate(now = new Date()) {
    // Helper: format date as local YYYY-MM-DD (avoid toISOString which is UTC)
    function formatLocalDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localTime = new Date(now.getTime() - offsetMs);
    return formatLocalDate(localTime);
}



/**
 * ストーリー内の{{}}部分を穴埋め化する
 * @param {string} text - 処理するテキスト
 * @param {number} storyIndex - ストーリー要素のインデックス
 * @returns {string} - 穴埋め化されたHTML
 */
/**
 * テキスト内の{{}}を穴埋めボタンに変換（ストーリー専用）
 * @param {string} text - 処理するテキスト
 * @param {number|string} contentIndex - コンテンツのインデックス（ストーリーなら数値）
 * @param {string} contentType - コンテンツの種類（現在は"story"のみ）
/**
 * 穴埋めボタンのイベントリスナーを設定（ストーリー専用）
 * @param {HTMLElement} container - イベントリスナーを設定するコンテナ
 */
function setupContentBlankButtons(container) {
    const blankButtons = container.querySelectorAll('.story-blank-button');
    const hideBtn = container.querySelector('#hide-blanks-btn');
    const showBtn = container.querySelector('#show-blanks-btn');

    if (blankButtons.length > 0 && hideBtn && showBtn) {
        hideBtn.classList.remove('hidden');
        showBtn.classList.remove('hidden');

        hideBtn.addEventListener('click', () => {
            blankButtons.forEach(button => {
                const placeholder = button.querySelector('.blank-placeholder');
                const answer = button.querySelector('.blank-answer');

                if (!placeholder || !answer) {
                    return;
                }

                const storyIndex = parseInt(button.dataset.storyIndex);
                const blankIndex = parseInt(button.dataset.blankIndex);
                let isChecked = false;

                if (!isNaN(storyIndex) && !isNaN(blankIndex) && window.currentCaseData?.story?.[storyIndex]) {
                    const currentCheck = window.currentCaseData.story[storyIndex].check || '';
                    const checkArray = currentCheck.split(',').map(c => c.trim() === '1' ? 1 : 0);
                    isChecked = checkArray[blankIndex] === 1;
                }

                if (!isChecked) {
                    placeholder.style.display = 'inline';
                    answer.style.display = 'none';
                    answer.innerHTML = button.dataset.answer;
                    button.classList.remove('revealed');
                    button.classList.remove('opened');
                    button.style.transform = 'scale(1)';
                }

                button.style.pointerEvents = 'auto';
            });
        });

        showBtn.addEventListener('click', () => {
            blankButtons.forEach(button => {
                const placeholder = button.querySelector('.blank-placeholder');
                const answer = button.querySelector('.blank-answer');

                if (!placeholder || !answer) {
                    return;
                }

                placeholder.style.display = 'none';
                answer.style.display = 'inline';
                answer.innerHTML = processAllReferences(button.dataset.answer);

                const storyIndex = parseInt(button.dataset.storyIndex);
                const blankIndex = parseInt(button.dataset.blankIndex);
                let isChecked = false;

                if (!isNaN(storyIndex) && !isNaN(blankIndex) && window.currentCaseData?.story?.[storyIndex]) {
                    const currentCheck = window.currentCaseData.story[storyIndex].check || '';
                    const checkArray = currentCheck.split(',').map(c => c.trim() === '1' ? 1 : 0);
                    isChecked = checkArray[blankIndex] === 1;
                }

                if (isChecked) {
                    button.classList.remove('opened');
                    button.classList.add('revealed');
                } else {
                    button.classList.remove('revealed');
                    button.classList.add('opened');
                }

                if (button.classList.contains('article-blank')) {
                    setTimeout(() => {
                        enableArticleButtonsWithin(button);
                    }, 150);
                }

                button.style.pointerEvents = 'auto';
            });
        });
    }

    blankButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            if (e.target.classList.contains('article-ref-btn')) {
                return;
            }

            const placeholder = this.querySelector('.blank-placeholder');
            const answer = this.querySelector('.blank-answer');

            if (!placeholder || !answer) {
                return;
            }

            if (this.classList.contains('revealed')) {
                placeholder.style.display = 'inline';
                answer.style.display = 'none';
                answer.innerHTML = this.dataset.answer;
                this.classList.remove('revealed');
                return;
            }

            if (this.classList.contains('opened')) {
                placeholder.style.display = 'inline';
                answer.style.display = 'none';
                this.classList.remove('opened');
                this.style.transform = 'scale(1)';
                return;
            }

            placeholder.style.display = 'none';
            answer.style.display = 'inline';

            if (this.classList.contains('article-blank')) {
                const answerText = this.dataset.answer;
                const processedAnswer = processAllReferences(answerText, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
                answer.innerHTML = processedAnswer;

                setTimeout(() => {
                    const articleButtons = answer.querySelectorAll('.article-ref-btn');
                    articleButtons.forEach(btn => {
                        const newBtn = btn.cloneNode(true);
                        btn.parentNode.replaceChild(newBtn, btn);
                        newBtn.addEventListener('click', function (event) {
                            event.preventDefault();
                            event.stopPropagation();
                            const lawName = this.dataset.law;
                            const articleNum = this.dataset.article;
                            if (lawName && articleNum) {
                                showArticlePanel(lawName, articleNum);
                            }
                        });
                    });

                    setupArticleRefButtons(answer);
                }, 100);
            }

            this.classList.remove('revealed');
            this.classList.add('opened');
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });

        button.addEventListener('contextmenu', function (e) {
            e.preventDefault();

            const storyIndex = parseInt(this.dataset.storyIndex);
            const blankIndex = parseInt(this.dataset.blankIndex);

            if (isNaN(storyIndex) || isNaN(blankIndex)) {
                return;
            }

            // チェック状態をトグル
            if (!window.currentCaseData?.story?.[storyIndex]) {
                return;
            }

            const currentCheck = window.currentCaseData.story[storyIndex].check || '';
            const checkArray = currentCheck.split(',').map(c => c.trim() === '1' ? 1 : 0);

            while (checkArray.length <= blankIndex) {
                checkArray.push(0);
            }

            checkArray[blankIndex] = checkArray[blankIndex] === 1 ? 0 : 1;

            window.currentCaseData.story[storyIndex].check = checkArray.join(',');

            // ボタンの表示を更新
            updateStoryBlankButtonState(this, checkArray[blankIndex] === 1);

            // サーバーに保存
            saveStoryCheckToServer();
        });
    });
}

/**
 * ストーリー用の後方互換性関数
 */
function setupStoryBlankButtons(container) {
    setupContentBlankButtons(container);
}

/**
 * ストーリー空欄ボタンの状態を更新
 * @param {HTMLElement} button - 更新するボタン要素
 * @param {boolean} isChecked - チェック状態
 */
function updateStoryBlankButtonState(button, isChecked) {
    if (isChecked) {
        // チェック済みの場合、答えを表示して緑色にする
        const placeholder = button.querySelector('.blank-placeholder');
        const answer = button.querySelector('.blank-answer');

        if (placeholder && answer) {
            placeholder.style.display = 'none';
            answer.style.display = 'inline';

            // 条文を含む場合は条文参照処理を適用
            if (button.classList.contains('article-blank')) {
                const answerText = button.dataset.answer;
                const processedAnswer = processAllReferences(answerText, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || []);
                answer.innerHTML = processedAnswer;

                // 条文参照ボタンのイベントリスナーを設定
                setTimeout(() => {
                    setupArticleRefButtons(answer);

                    // 中の条文ボタンのpointer-eventsを強制的に有効化
                    const articleButtons = button.querySelectorAll('.article-ref-btn');
                    articleButtons.forEach(btn => {
                        btn.style.pointerEvents = 'auto';
                        btn.style.cursor = 'pointer';
                        btn.style.position = 'relative';
                        btn.style.zIndex = '10';
                    });
                }, 100);
            }

            // ボタン自体のクリックは有効のまま（トグル機能のため）
            button.style.pointerEvents = 'auto';

            // openedクラスを削除してrevealedクラスを追加（緑色）
            button.classList.remove('opened');
            button.classList.add('revealed');
        }
    } else {
        // チェック解除の場合、プレースホルダーを表示して元に戻す
        const placeholder = button.querySelector('.blank-placeholder');
        const answer = button.querySelector('.blank-answer');

        if (placeholder && answer) {
            placeholder.style.display = 'inline';
            answer.style.display = 'none';
            answer.innerHTML = button.dataset.answer;
            button.classList.remove('revealed');
            button.classList.remove('opened');
            button.style.pointerEvents = 'auto';
            button.style.transform = 'scale(1)';
        }
    }
}

/**
 * ストーリーチェック状態をサーバーに保存
 */
async function saveStoryCheckToServer() {
    try {
        const caseId = window.currentCaseData.id;
        const storyData = window.currentCaseData.story;

        console.log('💾 ストーリーチェック状態をサーバーに保存中:', caseId);

        // サーバーのAPIに送信
        const response = await fetch('/api/save-story-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caseId: caseId.replace(/\.js$/, ''),
                storyData: storyData
            })
        });
        console.log('💾 ストーリーチェック保存API呼び出し:', {
            originalCaseId: caseId,
            processedCaseId: caseId.replace(/\.js$/, '')
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ ストーリーチェック状態の保存完了（サーバー）:', result.filePath);

    } catch (error) {
        console.error('❌ ストーリーチェック状態の保存に失敗:', error);
    }
}

/**
 * ページロード時にストーリーチェック状態を復元
 * @param {HTMLElement} container - イベントリスナーを設定するコンテナ
 */
async function restoreStoryCheckStates(container) {
    const caseId = window.currentCaseData.id;

    // サーバーから最新の状態を取得
    try {
        console.log('📖 サーバーからストーリーチェック状態を復元中:', caseId);

        const response = await fetch(`/api/get-story-check/${encodeURIComponent(caseId.replace(/\.js$/, ''))}`);
        console.log('📖 ストーリーチェックAPI呼び出し:', { originalCaseId: caseId, processedCaseId: caseId.replace(/\.js$/, '') });
        if (response.ok) {
            const result = await response.json();

            if (result.success && result.storyData && Array.isArray(result.storyData) && result.storyData.length > 0) {
                // サーバーから取得したデータが有効な場合のみ上書き
                window.currentCaseData.story = result.storyData;
                console.log('✅ サーバーからストーリーチェック状態を復元完了:', caseId, 'storyLength:', result.storyData.length);
            } else {
                console.log('📖 サーバーのストーリーデータが無効または空のため、元のデータを保持:', caseId);
            }
        } else {
            console.log('📖 サーバーにストーリーチェック状態が見つかりません:', caseId);
        }
    } catch (error) {
        console.error('❌ ストーリーチェック状態の復元に失敗:', error);
    }

    const blankButtons = container.querySelectorAll('.story-blank-button');

    blankButtons.forEach(button => {
        const storyIndex = parseInt(button.dataset.storyIndex);
        const blankIndex = parseInt(button.dataset.blankIndex);

        if (isNaN(storyIndex) || isNaN(blankIndex)) {
            return;
        }

        const storyData = window.currentCaseData?.story?.[storyIndex];
        if (!storyData) {
            console.warn('Story data not found for button:', { storyIndex, button });
            return;
        }

        // storyが存在するかチェック
        if (!window.currentCaseData?.story || !Array.isArray(window.currentCaseData.story)) {
            console.warn('Story data is not available for button processing');
            return;
        }
        if (!storyData || !storyData.check) {
            return;
        }

        const checkArray = storyData.check.split(',').map(c => c.trim() === '1' ? 1 : 0);

        if (checkArray[blankIndex] === 1) {
            updateStoryBlankButtonState(button, true);
        }
    });
}

/**
 * テキスト内の{{}}を穴埋めボタンに変換
 * @param {string} text - 処理するテキスト
 * @param {number|string} contentIndex - コンテンツのインデックス
 * @param {string} contentType - コンテンツの種類（デフォルト: 'story'）
 * @returns {string} - 穴埋めボタンを含むHTML
 */
function processContentBlanks(text, contentIndex, contentType = 'story') {
    // {{}}で囲まれた部分を見つけて空欄化
    let blankCounter = 0;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
        const blankId = `${contentType}-blank-` + Math.random().toString(36).substr(2, 9);

        // 条文が含まれているかチェック（【】で囲まれた部分があるかどうか）
        const hasArticle = /【[^】]+】/.test(content);
        const buttonClass = hasArticle ? `${contentType}-blank-button article-blank` : `${contentType}-blank-button`;

        // コンテンツ種類とブランクの位置を特定するためのデータ属性を追加
        const blankIndex = blankCounter++;

        return `<span class="${contentType}-blank-container"><button class="${buttonClass}" data-blank-id="${blankId}" data-answer="${content}" data-${contentType}-index="${contentIndex}" data-blank-index="${blankIndex}"><span class="blank-placeholder">？？？</span><span class="blank-answer" style="display: none;">${content}</span></button></span>`;
    });
}

/**
 * ストーリーの空欄処理（後方互換性のため）
 * @param {string} text - 処理するテキスト
 * @param {number} storyIndex - ストーリー要素のインデックス
 * @returns {string} - 穴埋めボタンを含むHTML
 */
function processStoryBlanks(text, storyIndex) {
    return processContentBlanks(text, storyIndex, 'story');
}

/**
 * ストーリーをHTMLに変換する関数
 * @param {Array} storyData - ストーリーデータの配列
 * @returns {string} HTML文字列
 */
function buildStoryHtml(storyData) {
    if (!storyData || (Array.isArray(storyData) && storyData.length === 0) || (typeof storyData === 'string' && !storyData.trim())) {
        return '<div class="text-center text-gray-400">ストーリーはありません</div>';
    }
    if (!Array.isArray(storyData)) {
        return storyData.replace(/\[\d+\]/g, '');
    }

    // ★★★ 右側キャラリストをモジュールごとに切り替え ★★★
    const rightSideCharacters = window.currentCaseData.rightSideCharacters || ['みかん', '母', '父'];

    // ★★★ ストーリーに登場するキャラクターを抽出してイメージギャラリー作成 ★★★
    const storyCharacters = extractStoryCharacters(storyData);
    const characterGalleryHtml = buildCharacterGallery(storyCharacters);

    const storyContentHtml = storyData.map((item, index) => {
        // BGMとbackground要素はINTOモード専用なのでストーリータブでは非表示
        if (item.type === 'bgm' || item.type === 'background') {
            return '';
        }
        if (item.type === 'scene') {
            // scene要素: 先に条文・Q&A参照処理、その後空欄処理
            const processedText = processAllReferences(item.text, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
                .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
            return `<div class="text-sm text-gray-600 p-4 bg-yellow-50 rounded-lg mt-6 mb-4"><h3 class="font-bold mb-2 text-lg">${processStoryBlanks(processedText, index)}</h3></div>`;
        }
        if (item.type === 'narration') {
            // narration要素: 先に条文・Q&A参照処理、その後空欄処理
            const processedText = processAllReferences(item.text, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
                .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
            return `<p class="text-center text-gray-600 italic my-4">${processStoryBlanks(processedText, index)}</p>`;
        }

        // ★★★ 新機能: embed要素の処理 ★★★
        if (item.type === 'embed') {
            console.log('🎨 Embed要素を処理中:', item);
            // title, description, contentすべてで先に条文・Q&A参照処理、その後空欄処理
            // 埋め込み内では Q&A ボタンは生成するが、中身を絶対に表示しない「安全モード」ボタンを生成する
            const embedOptions = { allowQAButtons: true, embedSafeButtons: true };
            const processedTitle = item.title ? processAllReferences(item.title, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [], embedOptions) : '';
            const processedDescription = item.description ? processAllReferences(item.description, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [], embedOptions) : '';
            let processedContent = item.content ? processAllReferences(item.content, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [], embedOptions) : '';

            // デバッグ: processAllReferences後のコンテンツを確認
            console.log('🔍 processAllReferences後のcontent:', processedContent);

            // デバッグ: HTMLエスケープチェック
            if (processedContent && (processedContent.includes('&lt;') || processedContent.includes('&gt;'))) {
                console.log('🚨 エンベッドコンテンツでHTMLエスケープを検出:', processedContent.substring(0, 300));
            }

            // content内での文字揃え記法を処理
            if (processedContent) {
                processedContent = processedContent
                    .replace(/\[center\](.*?)\[\/center\]/gs, '<div class="text-center">$1</div>')
                    .replace(/\[right\](.*?)\[\/right\]/gs, '<div class="text-right">$1</div>')
                    .replace(/\[left\](.*?)\[\/left\]/gs, '<div class="text-left">$1</div>')
                    .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>'); // 改行をHTMLの改行に変換

                // デバッグ: 文字揃え処理後のコンテンツを確認
                console.log('🔍 文字揃え処理後のcontent:', processedContent);
            }

            // 全体の文字揃えの処理（デフォルトまたはフォールバック用）
            let textAlignClass = '';
            if (item.textAlign) {
                switch (item.textAlign) {
                    case 'center':
                        textAlignClass = 'text-center';
                        break;
                    case 'right':
                        textAlignClass = 'text-right';
                        break;
                    case 'left':
                        textAlignClass = 'text-left';
                        break;
                    default:
                        textAlignClass = '';
                }
            }

            const title = processedTitle ? `<h4 class="font-bold text-lg mb-2 text-gray-800 ${textAlignClass}">${processStoryBlanks(processedTitle, index)}</h4>` : '';
            const description = processedDescription ? `<p class="text-sm text-gray-600 mb-3 ${textAlignClass}">${processStoryBlanks(processedDescription, index)}</p>` : '';

            // ★★★ embedのcontentにも空欄処理を適用 ★★★
            processedContent = processStoryBlanks(processedContent, index);

            // ニュース形式の場合
            if (item.format === 'news') {
                console.log('📰 ニュース要素を作成:', item);
                // ニュース専用のタイトルスタイル
                const newsTitle = processedTitle ? `<h3 class="news-title">${processStoryBlanks(processedTitle, index)}</h3>` : '';
                const newsDescription = processedDescription ? `<p class="news-source">${processStoryBlanks(processedDescription, index)}</p>` : '';

                return `
                    <div class="embed-container my-6" data-format="news">
                        <div class="news-container">
                            <div class="news-header">
                                <div class="news-badge">📰 BREAKING NEWS</div>
                                ${newsTitle}
                                ${newsDescription}
                            </div>
                            <div class="news-body">
                                <div class="news-content">
                                    ${processedContent}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // キャラクター図表の場合
            if (item.format === 'character-diagram') {
                console.log('🎭 キャラクター図表要素を作成:', item);
                return `
                    <div class="embed-container my-6" data-format="character-diagram">
                                    <div class="embed-header">
                                        ${title}
                                        ${description}
                                    </div>
                                    <div class="embed-frame">
                                        <div class="embed-content">
                                            <div class="character-diagram">
                                                ${processedContent}
                                            </div>
                                        </div>
                                    </div>
                        </div>
                `;
            }

            // メモ形式の場合
            if (item.format === 'memo') {
                console.log('📝 メモ要素を作成:', item);
                return `
                    <div class="embed-container my-6" data-format="memo">
                        <div class="memo-container">
                            <div class="memo-header">
                                <div class="memo-pin">📌</div>
                                ${title}
                                ${description}
                            </div>
                            <div class="memo-content">
                                ${processedContent}
                            </div>
                        </div>
                    </div>
                `;
            }

            // その他のembed形式（SVG、HTMLなど）
            const finalHtml = `
                <div class="embed-container my-6" data-format="${item.format || 'default'}">
                    <div class="embed-header">
                        ${title}
                        ${description}
                    </div>
                    <div class="embed-frame">
                        <div class="embed-content">
                            ${processedContent}
                        </div>
                    </div>
                </div>
            `;

            // デバッグ: 最終HTMLを確認
            console.log('🔍 最終的なembed HTML:', finalHtml);

            return finalHtml;
        }

        const character = characters.find(c => c.name === item.speaker);
        if (!character) {
            // フォールバック: 未定義キャラでもセリフを表示（アイコンなし・中央スタイル）
            // 先に条文・Q&A参照処理、その後空欄処理
            const processedDialogue = processAllReferences(item.dialogue, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
                .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
            const bubbleHtml = `<div class="chat-bubble chat-bubble-left p-3 rounded-lg shadow"><p class="font-bold">${item.speaker || '（不明）'}</p><p>${processStoryBlanks(processedDialogue, index)}</p></div>`;
            return `<div class="flex items-start gap-3 my-4">${bubbleHtml}</div>`;
        }

        const requestedExpression = item.expression ?? 'normal';
        const finalExpression = character.availableExpressions.includes(requestedExpression) ? requestedExpression : 'normal';
        const iconSrc = `/images/${character.baseName}_${finalExpression}.png`;
        const fallbackSrc = `/images/${character.baseName}_normal.png`;
        const onErrorAttribute = `this.src='${fallbackSrc}'; this.onerror=null;`;

        const imageStyle = "width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);";
        const isRightSide = rightSideCharacters.includes(item.speaker);
        const iconTransform = isRightSide ? 'transform: scaleX(-1);' : '';
        const iconHtml = `<img src="${iconSrc}" alt="${character.name}" class="character-icon" style="${imageStyle} ${iconTransform}" onerror="${onErrorAttribute}">`;
        // 先に条文・Q&A参照処理、その後空欄処理
        const processedDialogue = processAllReferences(item.dialogue, window.SUPPORTED_LAWS || [], window.currentCaseData.questionsAndAnswers || [])
            .replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
        const bubbleHtml = `<div class="chat-bubble ${isRightSide ? 'chat-bubble-right' : 'chat-bubble-left'} p-3 rounded-lg shadow"><p class="font-bold">${character.name}</p><p>${processStoryBlanks(processedDialogue, index)}</p></div>`;

        return `<div class="flex items-start gap-3 my-4 ${isRightSide ? 'justify-end' : ''}">${isRightSide ? bubbleHtml + iconHtml : iconHtml + bubbleHtml}</div>`;
    }).join('');

    // キャラクターギャラリーとストーリー内容を結合
    // 最終的なHTMLに対して、エスケープされたボタンタグを修正
    const finalHtml = characterGalleryHtml + storyContentHtml;

    // もしHTMLボタンがエスケープされている場合の修正処理
    // より包括的なエスケープ修正を実行
    let correctedHtml = finalHtml;

    // デバッグ: エスケープ検出
    if (correctedHtml.includes('&lt;') || correctedHtml.includes('&gt;')) {
        console.log('🚨 エスケープされたHTMLを検出:', correctedHtml.substring(0, 200));

        // より包括的なエスケープ解除
        correctedHtml = correctedHtml
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');

        console.log('✅ 全HTMLエスケープを解除完了');
    }

    console.log('🔧 HTML修正処理完了');

    return correctedHtml;
}

/**
 * ストーリーデータから登場キャラクターを抽出
 * @param {Array} storyData - ストーリーデータ
 * @returns {Array} 登場キャラクターの配列
 */
function extractStoryCharacters(storyData) {
    const characterNames = new Set();

    storyData.forEach(item => {
        if (item.type !== 'scene' && item.type !== 'narration' && item.type !== 'embed' && item.speaker) {
            characterNames.add(item.speaker);
        }
    });

    // charactersデータから該当するキャラクター情報を取得
    const storyCharacters = Array.from(characterNames)
        .map(name => characters.find(c => c.name === name))
        .filter(character => character); // 定義されているキャラクターのみ

    return storyCharacters;
}

/**
 * キャラクターギャラリーHTMLを構築
 * @param {Array} storyCharacters - 登場キャラクターの配列
 * @returns {string} キャラクターギャラリーのHTML
 */
function buildCharacterGallery(storyCharacters) {
    if (storyCharacters.length === 0) {
        return '';
    }

    const characterItems = storyCharacters.map(character => {
        const iconSrc = `/images/${character.baseName}_normal.png`;
        return `
            <div class="character-gallery-item text-center">
                <img 
                    src="${iconSrc}" 
                    alt="${character.name}" 
                    class="character-gallery-icon"
                    style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; margin: 0 auto 8px; display: block; transition: transform 0.2s ease;"
                    onmouseover="this.style.transform='scale(1.1)'"
                    onmouseout="this.style.transform='scale(1)'"
                >
                <div class="text-xs text-gray-600 font-medium">${character.name}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="character-gallery mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm">
            <h4 class="text-sm font-bold text-gray-700 mb-3 text-center">📖 登場キャラクター</h4>
            <div class="flex flex-wrap justify-center gap-4">
                ${characterItems}
            </div>
        </div>
    `;
}

// ★★★ タブ状態管理機能（F5更新対応） ★★★
/**
 * 現在のタブ状態をlocalStorageに保存
 * @param {string} tabName - 現在のタブ名
 */
function saveCurrentTab(tabName) {
    try {
        const caseId = window.currentCaseData?.caseId || 'unknown';
        const key = `currentTab_${caseId}`;
        localStorage.setItem(key, tabName);
        console.log(`💾 タブ状態保存: ${tabName} (case: ${caseId})`);
    } catch (error) {
        console.warn('⚠️ タブ状態の保存に失敗:', error);
    }
}

/**
 * casePageでの目次再生成を処理する関数
 */
async function handleCaseIndexRegeneration() {
    const regenerateBtn = document.getElementById('regenerate-case-index');
    if (!regenerateBtn) return;

    const originalText = regenerateBtn.innerHTML;

    try {
        // ローディング状態
        regenerateBtn.disabled = true;
        regenerateBtn.innerHTML = '🔄 処理中...';

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
            // ★★★ サーバー起動時と同じようにすべてのケースを一から読み込み ★★★
            console.log('🔄 すべてのケースファイルを一から読み込み中...');

            // index.jsを再読み込み
            const timestamp = Date.now();
            const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);

            // 新しいcaseSummariesとcaseLoadersを設定
            window.caseSummaries = indexModule.caseSummaries;
            window.caseLoaders = indexModule.caseLoaders;

            console.log(`✅ index.js再読み込み完了: ${window.caseSummaries.length}件のケース`);

            // すべてのケースを一から読み込んでキャッシュ
            console.log('🔄 すべてのケースをPromise.allで読み込み中...');
            const allCasePromises = window.caseSummaries.map(async (summary) => {
                try {
                    const loader = window.caseLoaders[summary.id];
                    if (loader) {
                        const caseModule = await loader();
                        return { id: summary.id, data: caseModule.default };
                    }
                } catch (error) {
                    console.error(`❌ ケース読み込みエラー ${summary.id}:`, error);
                }
                return null;
            });

            const loadedCases = await Promise.all(allCasePromises);
            window.caseModules = {};
            loadedCases.forEach(item => {
                if (item) {
                    window.caseModules[item.id] = item.data;
                }
            });

            console.log(`✅ すべてのケース読み込み完了: ${Object.keys(window.caseModules).length}件`);

            // 現在開いているケースがある場合は再読み込み（キャッシュから）
            if (window.currentCaseData && window.currentCaseData.id) {
                console.log('🔄 現在開いているケースを再読み込み:', window.currentCaseData.id);
                // キャッシュから直接読み込み
                const cachedCase = window.caseModules[window.currentCaseData.id];
                if (cachedCase) {
                    window.currentCaseData = cachedCase;
                    window.currentCaseData.id = window.currentCaseData.id;
                    await renderCaseDetail();
                } else {
                    await loadAndRenderCase(window.currentCaseData.id, false);
                }
            }

            // homePageの表示も更新
            if (window.renderFilteredModulesOrQAs) {
                console.log('🔄 homePageの表示も更新');
                await window.renderFilteredModulesOrQAs();
            }

            // 成功通知
            showNotification(`✅ 目次再生成完了！ (${result.casesCount}件のケースを処理)`, 'success');

        } else {
            showNotification(`❌ エラー: ${result.error}`, 'error');
        }

    } catch (error) {
        console.error('目次再生成エラー:', error);
        showNotification(`❌ 通信エラー: ${error.message}`, 'error');
    } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = originalText;
    }
}

/**
 * casePageで目次ファイルを動的に再読み込みする関数
 */
async function reloadCaseIndexForCasePage() {
    try {
        // モジュールキャッシュをクリアするためにタイムスタンプを付与
        const timestamp = Date.now();
        console.log('🔄 目次ファイル再読み込み開始:', { timestamp });

        const indexModule = await import(`../cases/index.js?timestamp=${timestamp}`);
        console.log('✅ 新しいindex.jsを読み込み完了:', {
            caseSummariesLength: indexModule.caseSummaries.length,
            sampleCategories: indexModule.caseSummaries.slice(0, 3).map(s => ({ category: s.category, subfolder: s.subfolder }))
        });

        // 再生成後は index.js のエクスポートそのものを使用
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
 * 保存されたタブ状態をlocalStorageから取得
 * @returns {string} 保存されたタブ名（デフォルト: 'story'）
 */
function getSavedTab() {
    try {
        const caseId = window.currentCaseData?.caseId || 'unknown';
        const key = `currentTab_${caseId}`;
        const savedTab = localStorage.getItem(key);
        const defaultTab = 'story';

        if (savedTab) {
            // 有効なタブ名かチェック
            const validTabs = ['story', 'speed-quiz', 'qa-list', 'reference'];
            if (validTabs.includes(savedTab)) {
                console.log(`📖 タブ状態復元: ${savedTab} (case: ${caseId})`);
                return savedTab;
            } else {
                console.warn(`⚠️ 無効なタブ名: ${savedTab}、デフォルトに戻します`);
            }
        }

        console.log(`📖 デフォルトタブ使用: ${defaultTab} (case: ${caseId})`);
        return defaultTab;
    } catch (error) {
        console.warn('⚠️ タブ状態の復元に失敗:', error);
        return 'story';
    }
}

/**
 * タブ状態をクリア（必要に応じて使用）
 * @param {string} caseId - 対象のケースID（省略時は現在のケース）
 */
function clearSavedTab(caseId = null) {
    try {
        const targetCaseId = caseId || window.currentCaseData?.caseId || 'unknown';
        const key = `currentTab_${targetCaseId}`;
        localStorage.removeItem(key);
        console.log(`🗑️ タブ状態クリア: ${targetCaseId}`);
    } catch (error) {
        console.warn('⚠️ タブ状態のクリアに失敗:', error);
    }
}

// ★★★ 学習記録機能 ★★★

/**
 * ケースIDから相対パスを取得（フォールバック用）
 * @param {string} caseId - ケースID
 * @returns {string|null} - 相対パス
 */
function getRelativePathFromCaseId(caseId) {
    console.log('getRelativePathFromCaseId: caseId =', caseId);

    // fallbackとして現在のcaseLoadersから推測
    const currentLoaders = window.caseLoaders || caseLoaders;
    console.log('getRelativePathFromCaseId: currentLoaders keys =', Object.keys(currentLoaders));

    for (const [loaderKey, loader] of Object.entries(currentLoaders)) {
        if (loaderKey === caseId) {
            // ローダーキーを元に相対パスを推測
            const relativePath = loaderKey + '.js';
            console.log('getRelativePathFromCaseId: 推測された相対パス =', relativePath);
            return relativePath;
        }
    }

    // 見つからない場合は、caseIdをそのまま相対パスとして使用（.jsを付与）
    if (caseId && !caseId.endsWith('.js')) {
        const fallbackPath = caseId + '.js';
        console.log('getRelativePathFromCaseId: fallback path =', fallbackPath);
        return fallbackPath;
    }

    console.warn('getRelativePathFromCaseId: 相対パス取得失敗');
    return null;
}

/**
 * 現在のケースの相対パスを取得（非同期版）
 * @returns {Promise<string|null>} - 相対パス
 */
async function getCurrentCaseRelativePath() {
    if (!window.currentCaseData) {
        console.warn('getCurrentCaseRelativePath: currentCaseData が存在しません');
        return null;
    }

    // currentCaseDataからIDを取得
    const caseId = window.currentCaseData.id;
    if (!caseId) {
        console.warn('getCurrentCaseRelativePath: caseId が存在しません', window.currentCaseData);
        return null;
    }

    console.log('getCurrentCaseRelativePath: caseId =', caseId);

    // caseSummariesから正確な相対パスを取得
    try {
        const { caseSummaries } = await import('../cases/index.js');
        const caseInfo = caseSummaries.find(c => c.id === caseId || c.originalId === caseId);
        console.log('getCurrentCaseRelativePath: caseInfo =', caseInfo);
        if (caseInfo && caseInfo.filePath) {
            console.log('getCurrentCaseRelativePath: 相対パス取得成功 =', caseInfo.filePath);
            return caseInfo.filePath;
        }
    } catch (error) {
        console.warn('caseSummariesからの相対パス取得に失敗', error);
    }

    // fallbackとしてIDベースの推測
    const fallbackPath = getRelativePathFromCaseId(caseId);
    console.log('getCurrentCaseRelativePath: fallback =', fallbackPath);
    return fallbackPath;
}

/**
 * 現在のケースの相対パスを取得（同期版・fallback用）
 * @returns {string|null} - 相対パス
 */
function getCurrentCaseRelativePathSync() {
    if (!window.currentCaseData) {
        return null;
    }

    const caseId = window.currentCaseData.id;
    if (!caseId) {
        return null;
    }

    return getRelativePathFromCaseId(caseId);
}

/**
 * 学習記録ボタンのイベントリスナーを設定
 */
function setupStudyRecordButton() {
    const recordBtn = document.getElementById('record-study-btn');
    const statusDiv = document.getElementById('study-record-status');

    if (!recordBtn || !statusDiv) return;

    // 現在の記録状態を表示
    updateStudyRecordStatus();

    // ボタンのクリックイベント
    recordBtn.addEventListener('click', async () => {
        await recordStudyCompletion();
    });

    // 削除ボタンのクリックイベント（動的に追加されるため、イベント委任を使用）
    statusDiv.addEventListener('click', async (event) => {
        if (event.target.id === 'delete-study-record-btn') {
            await deleteTodayStudyRecord();
        }
    });
}

/**
 * 学習記録状態を更新表示
 */
async function updateStudyRecordStatus() {
    const statusDiv = document.getElementById('study-record-status');
    const recordBtn = document.getElementById('record-study-btn');

    if (!statusDiv || !recordBtn || !window.currentCaseData) return;

    const relativePath = await getCurrentCaseRelativePath();
    if (!relativePath) {
        console.warn('相対パスが取得できませんでした');
        return;
    }

    try {
        // 拡張子を除去してAPIを呼び出し（より確実な方法）
        const pathWithoutExtension = relativePath.replace(/\.js$/i, '').replace(/\/$/, '');
        console.log('📊 学習記録取得API呼び出し:', { originalPath: relativePath, pathWithoutExtension });

        // サーバーから最新の学習記録を取得（相対パス使用）
        const response = await fetch(`/api/get-study-record/${encodeURIComponent(pathWithoutExtension)}`);
        const result = await response.json();

        if (result.success && result.todayRecord) {
            // 今日の学習記録がある場合
            const recordTime = new Date(result.todayRecord.timestamp);
            const timeStr = recordTime.toLocaleString('ja-JP');

            statusDiv.innerHTML = `
                <div class="text-green-600 font-medium mb-2">
                    ✅ 今日の学習記録済み（${timeStr}）
                </div>
                <button id="delete-study-record-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg btn-hover text-sm">
                    🗑️ 今日の記録を削除
                </button>
            `;
            recordBtn.disabled = true;
            recordBtn.className = 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed';
            recordBtn.textContent = '📝 今日は記録済み';
        } else if (result.success && result.latestRecord) {
            // 今日の記録はないが、最新の記録がある場合
            const recordTime = new Date(result.latestRecord.timestamp);
            const timeStr = recordTime.toLocaleString('ja-JP');
            const recordDate = result.latestRecord.date;

            // 最新記録の日付が今日かどうかをチェック（システム仕様: 一日は3:00から始まる）
            const now = new Date();
            const currentHour = now.getHours();
            let todayDate = new Date(now);
            if (currentHour < 3) {
                todayDate.setDate(todayDate.getDate() - 1);
            }
            const today = todayDate.getFullYear() + '-' +
                String(todayDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(todayDate.getDate()).padStart(2, '0');
            const isTodayRecord = recordDate === today;

            if (isTodayRecord) {
                statusDiv.innerHTML = `
                    <div class="text-green-600 font-medium mb-2">
                        ✅ 今日の学習記録済み（${timeStr}）
                    </div>
                    <button id="delete-study-record-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg btn-hover text-sm">
                        🗑️ 今日の記録を削除
                    </button>
                `;
                recordBtn.disabled = true;
                recordBtn.className = 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed';
                recordBtn.textContent = '📝 今日は記録済み';
            } else {
                statusDiv.innerHTML = `
                    <div class="text-blue-600">
                        📅 最新の学習記録: ${recordDate} ${timeStr.split(' ')[1]}
                    </div>
                `;
                recordBtn.disabled = false;
                recordBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover';
                recordBtn.textContent = '📝 今日の学習を記録する';
            }
        } else {
            // 学習記録がまったくない場合
            statusDiv.innerHTML = `
                <div class="text-blue-600">
                    📅 今日はまだ学習記録がありません
                </div>
            `;
            recordBtn.disabled = false;
            recordBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover';
            recordBtn.textContent = '📝 今日の学習を記録する';
        }
    } catch (error) {
        console.warn('学習記録状態の確認に失敗:', error);
        // エラー時はデフォルト状態に設定
        statusDiv.innerHTML = `
            <div class="text-blue-600">
                📅 今日はまだ学習記録がありません
            </div>
        `;
        recordBtn.disabled = false;
        recordBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover';
        recordBtn.textContent = '📝 今日の学習を記録する';
    }
}

/**
 * 学習完了記録を実行
 */
async function recordStudyCompletion() {
    if (!window.currentCaseData) {
        showNotification('ケースデータが見つかりません', 'error');
        return;
    }

    const relativePath = await getCurrentCaseRelativePath();
    if (!relativePath) {
        showNotification('ファイルパスの取得に失敗しました', 'error');
        return;
    }

    const now = new Date();
    // 学習した時点の日付を計算（システム仕様: 一日は3:00から始まる）
    const currentHour = now.getHours();
    let studyDateObj = new Date(now);
    if (currentHour < 3) {
        studyDateObj.setDate(studyDateObj.getDate() - 1);
    }
    const studyDate = studyDateObj.getFullYear() + '-' +
        String(studyDateObj.getMonth() + 1).padStart(2, '0') + '-' +
        String(studyDateObj.getDate()).padStart(2, '0');

    try {
        // サーバーに学習記録をJSファイルに追加するよう依頼（相対パス使用）
        const response = await fetch('/api/add-study-record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                relativePath: relativePath.replace(/\.js$/i, '').replace(/\/$/, ''),
                title: window.currentCaseData.title || 'タイトル不明',
                timestamp: now.toISOString(),
                date: studyDate // 学習した日付を使用
            })
        });
        console.log('📝 学習記録追加API呼び出し:', {
            originalPath: relativePath,
            processedPath: relativePath.replace(/\.js$/, ''),
            date: studyDate
        }); const result = await response.json();

        if (result.success) {
            // 既に今日の記録があるかチェック
            if (result.alreadyRecorded) {
                showNotification('今日はすでに学習記録があります', 'info');
            } else {
                showNotification('学習記録をモジュールファイルに保存しました！', 'success');
            }

            // 表示を更新
            updateStudyRecordStatus();

            // ホームページの学習記録表示も更新
            if (window.updateSingleStudyRecord) {
                try {
                    window.updateSingleStudyRecord(window.currentCaseData.id);
                    console.log('🔄 ホームページの学習記録表示を更新しました');
                } catch (error) {
                    console.warn('⚠️ ホームページの学習記録表示更新に失敗:', error);
                }
            }

            console.log('✅ 学習記録保存完了:', result);
        } else {
            throw new Error(result.error || '学習記録の保存に失敗');
        }

    } catch (error) {
        console.error('❌ 学習記録の保存に失敗:', error);
        showNotification('学習記録の保存に失敗しました', 'error');
    }
}

/**
 * 今日の学習記録を削除
 */
async function deleteTodayStudyRecord() {
    if (!window.currentCaseData) {
        showNotification('ケースデータが見つかりません', 'error');
        return;
    }

    const relativePath = await getCurrentCaseRelativePath();
    if (!relativePath) {
        showNotification('ファイルパスの取得に失敗しました', 'error');
        return;
    }

    // 今日の日付を取得（システム仕様: 一日は3:00から始まる）
    const now = new Date();
    const currentHour = now.getHours();

    // 3:00より前の場合は前日の日付を使用
    let targetDate = new Date(now);
    if (currentHour < 3) {
        targetDate.setDate(targetDate.getDate() - 1);
    }

    const todayDate = targetDate.getFullYear() + '-' +
        String(targetDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(targetDate.getDate()).padStart(2, '0');

    // 確認ダイアログを表示
    const confirmed = confirm(`今日の学習記録（${todayDate}）を削除しますか？\nこの操作は取り消せません。`);
    if (!confirmed) {
        return;
    }

    try {
        // 拡張子を除去してAPIを呼び出し（より確実な方法）
        const pathWithoutExtension = relativePath.replace(/\.js$/i, '').replace(/\/$/, '');
        console.log('🗑️ 学習記録削除API呼び出し:', { originalPath: relativePath, pathWithoutExtension, date: todayDate });

        // サーバーに学習記録の削除を依頼
        const response = await fetch(`/api/delete-study-record/${encodeURIComponent(pathWithoutExtension)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: todayDate
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`今日の学習記録を削除しました`, 'success');

            // 表示を更新
            updateStudyRecordStatus();

            // ホームページの学習記録表示も更新
            if (window.updateSingleStudyRecord) {
                try {
                    window.updateSingleStudyRecord(window.currentCaseData.id);
                    console.log('🔄 ホームページの学習記録表示を更新しました');
                } catch (error) {
                    console.warn('⚠️ ホームページの学習記録表示更新に失敗:', error);
                }
            }

            console.log('✅ 学習記録削除完了:', result);
        } else {
            throw new Error(result.error || '学習記録の削除に失敗');
        }

    } catch (error) {
        console.error('❌ 学習記録の削除に失敗:', error);
        showNotification('学習記録の削除に失敗しました', 'error');
    }
}

/**
 * 指定したケースの最新学習記録を取得（サーバーから）
 * @param {string} caseId - ケースID
 * @returns {Object|null} 学習記録データまたはnull
 */
export async function getLatestStudyRecord(caseId) {
    try {
        const response = await fetch(`/api/get-study-record/${encodeURIComponent(caseId)}`);
        const result = await response.json();

        if (result.success && result.latestRecord) {
            return result.latestRecord;
        }
        return null;
    } catch (error) {
        console.warn('学習記録の取得に失敗:', error);
        return null;
    }
}

/**
 * すべてのケースの最新学習記録を取得（サーバーから）
 * @returns {Object} ケースIDをキーとした学習記録のオブジェクト
 */
export async function getAllLatestStudyRecords() {
    try {
        // TTL-based client-side cache to avoid repeated heavy server scans
        const TTL = 30 * 1000; // 30 seconds
        const now = Date.now();

        if (window.__allStudyRecordsCache && (now - window.__allStudyRecordsCache.timestamp) < TTL) {
            console.log('📊 全学習記録: キャッシュを使用 (TTL内)');
            return window.__allStudyRecordsCache.data;
        }

        const response = await fetch('/api/get-all-study-records');
        const result = await response.json();

        if (result.success) {
            const records = result.records || {};
            window.__allStudyRecordsCache = { timestamp: now, data: records };
            console.log('📊 取得された学習記録:', Object.keys(records).length, '件 (fresh)');
            return records;
        }

        return {};
    } catch (error) {
        console.warn('⚠️ 学習記録の一括取得に失敗:', error);
        return {};
    }
}

// キャッシュを明示的に無効化するユーティリティ
window.invalidateAllStudyRecordsCache = function () {
    window.__allStudyRecordsCache = null;
    console.log('🧹 全学習記録キャッシュを無効化しました');
};

/**
 * ケースを読み込んでレンダリング
 * @param {string} caseId - ケースID
 * @param {boolean} updateHistory - 履歴を更新するかどうか
 */
export async function loadAndRenderCase(caseId, updateHistory = true) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="flex justify-center items-center p-20"><div class="loader"></div></div>`;

    // キャッシュされたケースデータがあればそれを使用
    if (window.caseModules && window.caseModules[caseId]) {
        console.log('📦 キャッシュからケースデータを読み込み:', caseId);
        window.currentCaseData = window.caseModules[caseId];
        window.currentCaseData.id = caseId;

        // questionsAndAnswersが文字列参照を含む場合は解決する
        if (window.currentCaseData.questionsAndAnswers && !window.currentCaseData._qaResolved) {
            window.currentCaseData.questionsAndAnswers = await resolveQuestionsAndAnswers(
                window.currentCaseData.questionsAndAnswers
            );
            window.currentCaseData._qaResolved = true;
        }

        if (updateHistory) {
            const newUrl = `#/case/${caseId}`;
            history.pushState({ page: 'case', caseId: caseId }, window.currentCaseData.title, newUrl);
        }

        await renderCaseDetail();
        return;
    }

    // window.caseLoaders があればそれを使用
    const currentLoaders = window.caseLoaders || caseLoaders;
    const loader = currentLoaders[caseId];
    if (!loader) {
        console.error('ローダーが見つかりません:', caseId, Object.keys(currentLoaders));
        const { renderHome } = await import('./homePage.js');
        await renderHome();
        return;
    }

    try {
        const caseModule = await loader();
        window.currentCaseData = caseModule.default;
        window.currentCaseData.id = caseId;

        // questionsAndAnswersが文字列参照を含む場合は解決する
        if (window.currentCaseData.questionsAndAnswers) {
            window.currentCaseData.questionsAndAnswers = await resolveQuestionsAndAnswers(
                window.currentCaseData.questionsAndAnswers
            );
            window.currentCaseData._qaResolved = true;
        }

        console.log('loadAndRenderCase: currentCaseData loaded:', {
            id: window.currentCaseData.id,
            title: window.currentCaseData.title,
            hasStory: !!window.currentCaseData.story,
            storyLength: window.currentCaseData.story?.length || 0,
            qaCount: window.currentCaseData.questionsAndAnswers?.length || 0
        });

        if (updateHistory) {
            const newUrl = `#/case/${caseId}`;
            history.pushState({ page: 'case', caseId: caseId }, window.currentCaseData.title, newUrl);
        }

        await renderCaseDetail();
    } catch (error) {
        console.error('判例データの読み込みに失敗しました:', error);
        const { renderHome } = await import('./homePage.js');
        await renderHome();
    }
}

/**
 * ケース詳細をレンダリング
 */
async function renderCaseDetail() {
    document.title = `${window.currentCaseData.title} - あたしンちの司法へGO！`;
    const caseInfo = window.currentCaseData;

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="mb-6 flex justify-between items-center">
            <button id="back-to-home" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">← ホームに戻る</button>
            <div class="flex items-center space-x-3">
                <button id="regenerate-case-index" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">🔄 目次再生成</button>
                <div class="text-sm text-gray-600" id="user-info-case">
                    <!-- ユーザー情報が表示される -->
                </div>
                <button id="logout-btn-case" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition-all">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    ログアウト
                </button>
                <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">📖 条文表示</button>
            </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <header class="text-center border-b pb-4 mb-6">
                <p class="text-gray-500">${caseInfo.citation}</p>
                <h2 class="text-3xl md:text-4xl font-extrabold text-yellow-700">${caseInfo.title}</h2>
            </header>
            <div class="flex flex-wrap justify-center border-b mb-6">
                <button class="tab-button p-4 flex-grow text-center text-gray-600 active gentle-rotate-on-hover" data-tab="story">📖 ストーリー</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 heartbeat" data-tab="speed-quiz">⚡ スピード速文</button>
                <button class="tab-button p-4 flex-grow text-center text-gray-600 sparkle-effect" data-tab="qa-list">💬 Q&A</button>
            </div>
            <div id="tab-content"></div>
        </div>
    `;

    // 保存されたタブ状態を復元（5秒更新対応）
    const savedTab = getSavedTab();
    await renderTabContent(savedTab);

    // スピード速文用データを事前読み込み
    if (window.currentCaseData) {
        setTimeout(() => {
            console.log('⚡ スピード速文データの事前読み込みを開始');
            if (typeof initializeSpeedQuizData === 'function') {
                initializeSpeedQuizData(window.currentCaseData);
            } else {
                console.log('⚠️ initializeSpeedQuizData関数が見つかりません。speedQuiz.jsの読み込みを確認してください。');
            }
        }, 100);
    }

    // ページ固有のイベントリスナーを設定
    setupCasePageEventListeners();
}

/**
 * casePageのイベントリスナーを設定
 */
function setupCasePageEventListeners() {
    // 目次再生成ボタン
    const regenerateBtn = document.getElementById('regenerate-case-index');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', handleCaseIndexRegeneration);
    }

    // ホームに戻るボタン（既存の動作を継続）
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) {
        backBtn.addEventListener('click', async () => {
            // 現在のモジュール表示を保存
            const modulesContainer = document.querySelector('#modules-container');
            window.savedModulesContainer = modulesContainer ? modulesContainer.innerHTML : '';

            // renderHomeを復元モードで呼び、モジュール表示を復元
            const { renderHome } = await import('./homePage.js');
            await renderHome(false, 'restore-modules');
        });
    }
}

/**
 * タブコンテンツをレンダリング
 * @param {string} tabName - タブ名
 */
export async function renderTabContent(tabName) {
    console.log(`🔄 タブ表示: ${tabName}`);

    // タブ状態をlocalStorageに保存（5秒更新対応）
    saveCurrentTab(tabName);

    const contentDiv = document.getElementById('tab-content');

    // 既存のタブコンテンツがあるかチェック
    let storyTab = document.getElementById('tab-story-content');

    // lawsの有無で判断（初回判例以外も含む）
    const hasSpeedQuiz = Array.isArray(window.currentCaseData.laws) && window.currentCaseData.laws.length > 0;

    // 初回の場合、全てのタブコンテンツを作成
    if (!storyTab) {
        console.log('💬 タブコンテンツ初期作成');

        // グローバルQ&Aポップアップコンテナを作成（1回のみ）
        createGlobalPopupContainer();

        const storyHtml = buildStoryHtml(window.currentCaseData.story);
        const processedStoryHtml = storyHtml;

        // スピード速文タブは常に表示（中身は初期化関数で制御）
        const speedQuizTabButton = `<button class="tab-button p-4 flex-grow text-center text-gray-600 heartbeat" data-tab="speed-quiz">⚡ スピード速文</button>`;
        const speedQuizTabContent = `<div id="tab-speed-quiz-content" class="tab-content-panel hidden"></div>`;

        // Q&Aタブ
        const qaTabButton = `<button class="tab-button p-4 flex-grow text-center text-gray-600 sparkle-effect" data-tab="qa-list">💬 Q&A</button>`;
        let qaTabContent = `<div id="tab-qa-list-content" class="tab-content-panel hidden"></div>`;

        // 復元されるタブに応じて初期アクティブ状態を決定
        const getSavedTabInner = () => {
            try {
                const caseId = window.currentCaseData?.caseId || 'unknown';
                const key = `currentTab_${caseId}`;
                const savedTab = localStorage.getItem(key);
                const validTabs = ['story', 'speed-quiz', 'qa-list', 'reference'];
                if (savedTab && validTabs.includes(savedTab)) {
                    return savedTab;
                }
                return 'story';
            } catch (error) {
                return 'story';
            }
        };

        const savedTab = getSavedTabInner();

        const getTabButtonClass = (tabName) => {
            const baseClass = "tab-button p-4 flex-grow text-center text-gray-600";
            const activeClass = tabName === savedTab ? " active" : "";
            const effectClass = " simple-tab-hover";
            return baseClass + activeClass + effectClass;
        };

        // タブボタン
        const hasReference = Boolean(window.currentCaseData.referenceMaterial);
        const referenceTabButton = hasReference ? `<button class="${getTabButtonClass('reference')}" data-tab="reference">📚 参考資料</button>` : '';
        const tabButtons = `
            <button class="${getTabButtonClass('story')}" data-tab="story">📖 ストーリー</button>
            <button class="${getTabButtonClass('speed-quiz')}" data-tab="speed-quiz">⚡ スピード速文</button>
            <button class="${getTabButtonClass('qa-list')}" data-tab="qa-list">💬 Q&A</button>
            ${referenceTabButton}
        `;

        // タブ本体
        contentDiv.innerHTML = `
            <div id="tab-story-content" class="tab-content-panel hidden">
                <div class="p-4">
                    <div class="mb-4 flex justify-between items-center">
                        <div class="flex gap-2">
                            <button id="hide-blanks-btn" class="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded hidden">⚪ 空欄を隠す</button>
                            <button id="show-blanks-btn" class="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded hidden">⚫ 空欄を表示</button>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="start-into-btn" class="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1 px-3 rounded">🎵 INTO</button>
                            <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📖 条文表示</button>
                        </div>
                    </div>
                    ${processedStoryHtml}
                    
                    <!-- 学習記録セクション -->
                    <div class="mt-8 border-t pt-6">
                        <div class="text-center">
                            <div id="study-record-status" class="mb-4 text-sm"></div>
                            <button id="record-study-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg btn-hover">
                                📝 今日の学習を記録する
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ${speedQuizTabContent}
            ${qaTabContent}
            ${hasReference ? `
            <div id="tab-reference-content" class="tab-content-panel hidden">
                <div class="p-6">
                    <h3 class="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">📚 参考資料</h3>
                    <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 shadow-sm">
                        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            ${window.currentCaseData.referenceMaterial.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                        </div>
                    </div>
                </div>
            </div>` : ''}
            <div class="flex justify-center gap-2 mt-6 mb-2">${tabButtons}</div>
        `;

        // タブボタンを論文トレーニングが無い場合は削除
        const parent = contentDiv.parentElement;
        if (parent) {
            const tabBar = parent.querySelector('.flex.flex-wrap.border-b');
            if (tabBar) tabBar.innerHTML = tabButtons;
        }

        // 条文参照ボタンのイベントリスナーを設定
        setupArticleRefButtons(contentDiv);

        // ストーリー内空欄ボタンのイベントリスナーを設定
        setupStoryBlankButtons(contentDiv);

        // ストーリーチェック状態を復元（起動直後）
        await restoreStoryCheckStates(contentDiv);

        // INTOボタンのイベント
        const intoBtn = document.getElementById('start-into-btn');
        if (intoBtn) {
            intoBtn.addEventListener('click', () => {
                startIntoMode(window.currentCaseData);
            });
        }

        // 学習記録ボタンのイベントリスナーを設定
        setupStudyRecordButton();

        // スピード速文タブの初期描画
        if (hasSpeedQuiz) {
            initializeSpeedQuizContent();
        }

        // タブボタンのクリックイベント（初回のみ登録）
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                renderTabContent(tab);
            });
        });
    }

    // 全てのタブを非表示にする
    document.querySelectorAll('.tab-content-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    // タブボタンのアクティブ状態を更新
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // タブ切り替え時に全てのQ&Aポップアップを閉じる
    if (window.qaPopupState) {
        console.log(`🎹 タブ切り替えのため全Q&Aポップアップを閉じます: ${tabName}`);
        window.qaPopupState.clearAll();
    }

    // 指定されたタブのみを表示
    const targetTab = document.getElementById(`tab-${tabName}-content`);
    if (targetTab) {
        targetTab.classList.remove('hidden');

        // Q&Aタブなら初期描画（async IIFEでawaitを許可）
        if (tabName === 'qa-list' && window.currentCaseData.questionsAndAnswers) {
            (async () => {
                // 既存のコンテンツをクリア
                targetTab.innerHTML = '';

                // 統一されたQ&A表示機構を使用
                const { renderQAList, setupQAListEventHandlers } = await import('../qaRenderer.js');

                const qaHtml = await renderQAList({
                    qaList: window.currentCaseData.questionsAndAnswers,
                    moduleId: window.currentCaseData.id,
                    showModuleLink: false,
                    title: 'Q&Aリスト',
                    idPrefix: 'case-qa'
                });

                const qaContainer = document.createElement('div');
                qaContainer.innerHTML = qaHtml;
                targetTab.appendChild(qaContainer);

                setupQAListEventHandlers(qaContainer);
            })();
        }

        // スピード速文タブなら初期描画
        if (tabName === 'speed-quiz') {
            // data-initialized属性を毎回リセットして必ず再描画
            const speedQuizContainer = document.getElementById('tab-speed-quiz-content');
            if (speedQuizContainer) speedQuizContainer.removeAttribute('data-initialized');
            initializeSpeedQuizContent();
        }

        // 条文・Q&Aボタンのイベントリスナーを再設定
        console.log(`🎨 タブ切り替え時のボタン再設定開始: ${tabName}`);
        const qaButtons = targetTab.querySelectorAll('.qa-ref-btn');
        console.log(`🔍 タブ${tabName} 内のQ&Aボタン: ${qaButtons.length}個`);
        setupArticleRefButtons(targetTab);

        // 遅延読み込みされたQ&Aボタンにも対応
        setTimeout(() => {
            console.log(`🎨 遅延設定: ${tabName}タブの追加Q&Aボタンをチェック`);
            const newQaButtons = targetTab.querySelectorAll('.qa-ref-btn');
            console.log(`🔍 遅延チェック: ${newQaButtons.length}個のQ&Aボタンを確認`);
            if (newQaButtons.length !== qaButtons.length) {
                console.log('🔄 新しいQ&Aボタンが見つかったため、再設定します');
                setupArticleRefButtons(targetTab);
            }
        }, 200);

        // Q&Aポップアップを復元
        if (window.qaPopupState) {
            window.qaPopupState.restorePopups();
        }
    }
}

// スピード条文ゲームコンテンツ初期化
async function initializeSpeedQuizContent() {
    const speedQuizContainer = document.getElementById('tab-speed-quiz-content');
    if (!speedQuizContainer) return;
    // data-initialized属性は毎回リセット（安定化のため）
    speedQuizContainer.removeAttribute('data-initialized');

    // laws/speedQuizArticlesの再生成・初期化を徹底
    if (!Array.isArray(window.currentCaseData.laws) || window.currentCaseData.laws.length === 0) {
        // lawsが未定義・空の場合、必要なら空配列で初期化（ここでは空配列で初期化）
        window.currentCaseData.laws = [];
    }
    // speedQuizArticlesも毎回初期化
    window.speedQuizArticles = [];

    try {
        // speedQuiz.jsモジュールを動的インポート
        const { initializeSpeedQuizGame, extractAllArticles } = await import('../speedQuiz.js');

        // 毎回最新の条文を抽出
        window.speedQuizArticles = await extractAllArticles(window.currentCaseData);
        console.log('📑 抽出された条文数:', window.speedQuizArticles.length);

        if (window.speedQuizArticles.length === 0) {
            speedQuizContainer.innerHTML = `
                <div class="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-yellow-700 font-bold text-lg mb-2">⚠️ 条文が見つかりません</p>
                    <p class="text-yellow-600">このモジュールには条文参照が含まれていないため、<br>スピード条文ゲームをプレイできません。</p>
                </div>
            `;
        } else {
            // フルスクリーン起動ボタンを表示
            speedQuizContainer.innerHTML = `
                <div class="p-6 text-center">
                    <div class="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-8 shadow-lg">
                        <h3 class="text-2xl font-bold text-white mb-4">⚡ スピード条文ゲーム</h3>
                        <p class="text-white/80 mb-2">このモジュールの条文: <span class="font-bold text-white">${window.speedQuizArticles.length}問</span></p>
                        <p class="text-white/70 text-sm mb-6">条文を読んで、何条か素早く答えよう！<br>時間が減ると文字が大きくなるネプリーグ風演出！</p>
                        <button id="start-module-speed-quiz" class="bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-md">
                            🎮 フルスクリーンでプレイ
                        </button>
                    </div>
                    <div class="mt-4 text-right">
                        <button class="show-article-btn bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded">📑 条文表示</button>
                    </div>
                </div>
            `;

            // フルスクリーン起動ボタンのイベント
            document.getElementById('start-module-speed-quiz')?.addEventListener('click', async () => {
                // フルスクリーン用コンテナを作成
                let container = document.getElementById('sq-fullscreen-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'sq-fullscreen-container';
                    document.body.appendChild(container);
                }

                // 現在のケースIDを取得して戻り先を設定
                const caseId = window.currentCaseId || '';
                const returnUrl = caseId ? `#/case/${caseId}` : '#/';

                // スピードクイズをフルスクリーンで初期化
                await initializeSpeedQuizGame('sq-fullscreen-container', window.currentCaseData, false, {
                    returnUrl: returnUrl
                });
            });
        }

        speedQuizContainer.setAttribute('data-initialized', 'true');
        // 条文参照ボタンのイベントリスナーを設定
        setupArticleRefButtons(speedQuizContainer);
        console.log('✅ スピード条文ゲーム初期化完了');
    } catch (error) {
        console.error('❌ スピード条文ゲーム初期化エラー:', error);
        speedQuizContainer.innerHTML = `
            <div class="p-4 text-center">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p class="text-red-600 font-bold">スピード条文ゲームの読み込みに失敗しました</p>
                    <p class="text-red-500 text-sm mt-2">エラー: ${error.message}</p>
                </div>
            </div>
        `;
    }
}

// casePageの関数をグローバルに公開
window.loadAndRenderCase = loadAndRenderCase;
