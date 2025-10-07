// intoMode.js - ストーリー追体験「INTOモード」

import { sendMessageToAI, displayExternalDialogue } from './chatSystem.js';
import { characters } from './data/characters.js';
import { getOutputFormatRules, getArticleReferenceRules } from './data/characters.js';
import { buildQAButtonPresentation, resolveQAReference } from './qaButtonUtils.js';
import { stopInlineSpeedQuiz } from './inlineSpeedQuiz.js';

// 状態を保持
window.intoModeState = {
    sessionId: 'into',
    selectedResponder: null,
    started: false,
    scores: [],
    storyIndex: 0,
    askedQIds: [],
    askedQIndices: [],
};

function extractStoryCharacterNames(caseData) {
    try {
        const names = new Set();
        const story = Array.isArray(caseData?.story) ? caseData.story : [];
        story.forEach((s) => {
            if (s && s.type === 'dialogue' && s.speaker) names.add(s.speaker);
        });
        return Array.from(names).filter((n) => characters.find((c) => c.name === n));
    } catch (_) {
        return [];
    }
}

function buildKnowledgeBundle(caseData) {
    const storyText = Array.isArray(caseData?.story)
        ? caseData.story
            .map((s) => (s.type === 'dialogue' ? `${s.speaker}: ${s.dialogue}` : s.text))
            .join('\n')
        : typeof caseData?.story === 'string'
            ? caseData.story
            : '';
    const explanationText = (caseData?.explanation || '').toString();
    const qaText = Array.isArray(caseData?.questionsAndAnswers)
        ? caseData.questionsAndAnswers
            .map((qa, i) => `Q${qa.id || i + 1}: ${qa.question}\nA: ${qa.answer}`)
            .join('\n\n')
        : '';
    return { storyText, explanationText, qaText };
}

function buildSceneWindowExcerpt(caseData, fromIndex = 0, span = 3, truncate = 120) {
    try {
        const story = Array.isArray(caseData?.story) ? caseData.story : [];
        if (!story.length) return '（該当シーンなし）';
        const slice = story.slice(fromIndex, fromIndex + span);
        return slice
            .map((s) => {
                if (s.type === 'dialogue') {
                    const line = `${s.speaker}: ${s.dialogue || ''}`.trim();
                    return line.length > truncate ? `${line.slice(0, truncate)}…` : line;
                }
                const text = (s.text || '').toString().trim();
                return text.length > truncate ? `${text.slice(0, truncate)}…` : text;
            })
            .filter(Boolean)
            .join('\n');
    } catch (_) {
        return '（該当シーンなし）';
    }
}

function buildIntoInitialPrompt(caseData, responderName) {
    const { storyText, explanationText, qaText } = buildKnowledgeBundle(caseData);
    const currentIndex = window.intoModeState?.storyIndex || 0;
    const sceneWindow = buildSceneWindowExcerpt(caseData, currentIndex, 3);
    const allowedNames = extractStoryCharacterNames(caseData);
    const allowedList = allowedNames.length ? allowedNames.join(', ') : '（該当なし）';
    const askedIds = window.intoModeState?.askedQIds || [];
    const askedIndices = window.intoModeState?.askedQIndices || [];

    return `# INTOモード対話生成リクエスト

## 役割
- 『あたしンち』既存ストーリーを踏まえ、進行役と${responderName}が交互に短い会話を1ターン分だけ作る。
- 会話は自然な日本語で、余計な説明や人工的な補足を入れない。

## 会話に使える素材
### 物語全体
${storyText || '（素材なし）'}

### 参考メモ（引用不要）
${explanationText || '（なし）'}

### Q&Aリスト
${qaText || '（なし）'}

### 現在フォーカスしている場面
${sceneWindow || '（なし）'}

- 回答役（RESPONDER）: ${responderName}
- 利用可能な登場人物（このリスト以外の人物は厳禁）: ${allowedList}
- 現在のシーン開始位置: ${currentIndex}
- すでに使ったQID: ${askedIds.length ? askedIds.join(', ') : '（なし）'}
- すでに使ったQINDEX: ${askedIndices.length ? askedIndices.join(', ') : '（なし）'}

## 出力ルール
1. 行頭は必ず「話者名: セリフ」または「話者名@表情: セリフ」。装飾記号や---は使わない。
2. 進行役の短い導入 → ${responderName} の返答 → 進行役が対象Q&AのQとAを踏まえたソクラテス式の細分化質問を一つずつ投げる（必ず「？」終わり）。原文の用語・語順をできる限りそのまま保ち、語尾調整など必要最小限に留める。進行役は利用可能な登場人物リスト内から${responderName}以外のキャラクターを選ぶ。
3. A（解答）を小タスクに分割して段階的に確認する。1つのQ&Aについて完全理解するまで繰り返し質問して良い。
4. 直前のユーザー入力とストーリーの脈絡を尊重し、既存ストーリーの状況・感情・出来事を適宜織り込みながら会話を展開する。
5. セリフ内で別のセリフを引用せず、自然な日本語にまとめる。
6. 語り手・ナレーターなど「キャラクターではない進行役」は出さない。すべての話者名を利用可能リスト内の既存キャラクターにする。
7. ${responderName} の回答が原文ニュアンスから少しでも逸れた場合は即座にそれを指摘し、原文の語句を引用しつつ追加の細分化質問を重ねる。[[QPART]] を活用して段階的に理解を測る。
8. 最後にメタ情報タグをそれぞれ独立した行で付ける。

## 末尾メタ情報タグ（必須）
- [[SCORE:NN]]
- [[RESPONDER:${responderName}]]
- [[SCENE_TO:i]] （i は扱った最後のシーン番号）
- [[QID:...]]
- [[QINDEX:n]]
- [[QTEXT:原文]]
- [[QPART:k/N]]（細分化時は必須）
- 必要な場合のみ [[CORRECTOR:名前]] を追加。

以上を踏まえ、今回のターンの台本を生成してください。`;
}

function buildIntoFollowUpPrompt(userMessage, responderName) {
    const caseData = window.currentCaseData || {};
    const { qaText } = buildKnowledgeBundle(caseData);
    const currentIndex = window.intoModeState?.storyIndex || 0;
    const sceneWindow = buildSceneWindowExcerpt(caseData, currentIndex, 3);
    const allowedNames = extractStoryCharacterNames(caseData);
    const allowedList = allowedNames.length ? allowedNames.join(', ') : '（該当なし）';
    const askedIds = window.intoModeState?.askedQIds || [];
    const askedIndices = window.intoModeState?.askedQIndices || [];

    return `# INTOモード対話継続リクエスト

## 直前のユーザー入力
${userMessage || '（なし）'}

## 状態情報
- 回答役（RESPONDER）: ${responderName}
- 利用可能な登場人物（このリスト以外の人物は厳禁）: ${allowedList}
- 現在のシーン開始位置: ${currentIndex}
- すでに使ったQID: ${askedIds.length ? askedIds.join(', ') : '（なし）'}
- すでに使ったQINDEX: ${askedIndices.length ? askedIndices.join(', ') : '（なし）'}

## 参考素材
### シーン抜粋
${sceneWindow || '（なし）'}

### Q&Aリスト
${qaText || '（なし）'}

## 出力ルール
1. 行頭は必ず「話者名: セリフ」または「話者名@表情: セリフ」。装飾記号や---は使わない。
2. 進行役の短い導入 → ${responderName} の返答 → 進行役が対象Q&AのQとAを踏まえたソクラテス式の細分化質問を一つずつ投げる（必ず「？」終わり）。原文の用語・語順をできる限りそのまま保ち、語尾変更など最低限に留める。進行役は利用可能な登場人物リスト内から${responderName}以外のキャラクターを選ぶ。
3. A（解答）を小タスクに分割して段階的に確認する。1つのQ&Aについて完全理解するまで繰り返し質問して良い。
4. 直前のユーザー入力とストーリーの脈絡を尊重し、既存ストーリーの状況・感情・出来事を適宜織り込みながら会話を展開する。
5. セリフ内で別のセリフを引用せず、自然な日本語にまとめる。
6. 語り手・ナレーターなど「キャラクターではない進行役」は出さない。すべての話者名を利用可能リスト内の既存キャラクターにする。
7. ${responderName} の回答が原文ニュアンスから少しでも逸れた場合は即座にそれを指摘し、原文の語句を引用しつつ追加の細分化質問を重ねる。[[QPART]] を活用して段階的に理解を測る。
8. 最後にメタ情報タグをそれぞれ独立した行で付ける。

## 末尾メタ情報タグ（必須）
- [[SCORE:NN]]
- [[RESPONDER:${responderName}]]
- [[SCENE_TO:i]]
- [[QID:...]]
- [[QINDEX:n]]
- [[QTEXT:原文]]
- [[QPART:k/N]]（細分化した順番を明示）
- 必要なら [[CORRECTOR:名前]] も追加。

シンプルで自然な1ターン分の会話を出力してください。`;
}

function ensureIntoUI(caseData) {
    const storyTab = document.getElementById('tab-story-content');
    if (!storyTab) return null;
    const wrapper = storyTab.querySelector('.p-4') || storyTab;

    // 既存パネルがあれば再利用
    let panel = document.getElementById('into-mode-panel');
    const characterNames = extractStoryCharacterNames(caseData);
    const options = characterNames.map(n => `<option value="${n}">${n}</option>`).join('');
    const defaultResponder = characterNames[0] || '';
    if (!window.intoModeState.selectedResponder) {
        window.intoModeState.selectedResponder = defaultResponder;
    }

    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'into-mode-panel';
        panel.className = 'mb-6 p-4 border-2 border-purple-300 rounded-xl bg-purple-50';
        panel.innerHTML = `
            <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-purple-700 font-bold">🧩 INTOモード</span>
                <button id="into-end-btn" class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold py-1 px-3 rounded">終了</button>
            </div>
            <p class="text-xs text-gray-500 ml-1 mb-2">※ 回答キャラは状況に応じて自動選択されます（必要に応じて手動変更可）。</p>
            <div id="into-chat-box" class="bg-gray-50 p-4 rounded-lg border">
                <div class="flex flex-col gap-3">
                    <!-- 会話エリア（縮めない） -->
                    <div>
                        <div id="dialogue-area-into" class="space-y-4 h-[50vh] overflow-y-auto p-4 bg-white border rounded-lg custom-scrollbar"></div>
                    </div>

                    <!-- 入力列：左=スコア、中央=回答キャラ、右=入力欄 -->
                    <div class="mt-1 flex gap-3 items-stretch">
                        <!-- スコア（左端） -->
                        <div class="flex flex-col items-center w-24 flex-shrink-0">
                            <div class="text-xs text-gray-600 mb-1">スコア</div>
                            <div id="into-average-score" class="text-lg font-extrabold text-purple-700">- %</div>
                            <!-- 現在の質問（デコ表示）: ストーリーのQボタンと同じスタイルに統一 -->
                            <div id="into-current-q-deco" class="mt-2 qa-ref-btn inline-block px-2 py-1 rounded text-sm font-bold border transition-colors cursor-pointer mx-1 hidden" title="Q参照"></div>
                        </div>
                        <!-- 回答キャラ（入力欄の左） -->
                        <div class="flex flex-col items-center w-36 flex-shrink-0 h-full">
                            <div id="into-responder-icon" class="mb-2" style="width:80px;height:80px;border-radius:50%;overflow:hidden;border:2px solid #e5e7eb;background:#fff"></div>
                            <select id="into-responder-select" class="mt-auto p-1 border rounded text-sm w-full">${options}</select>
                        </div>
                        <!-- 入力欄（右側） -->
                        <div class="flex-1 flex gap-2 items-stretch">
                            <textarea id="into-input" class="w-full p-3 border rounded-lg focus-ring" style="height: 100px; resize: none;" placeholder="返信をどうぞ…"></textarea>
                            <button id="into-send-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold px-4 rounded-lg flex items-center justify-center" style="height: 100px;">送信</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        wrapper.prepend(panel);

        // イベント
        panel.querySelector('#into-end-btn')?.addEventListener('click', () => endIntoMode());
        panel.querySelector('#into-send-btn')?.addEventListener('click', () => sendIntoFollowUp());
        panel.querySelector('#into-responder-select')?.addEventListener('change', (e) => setIntoResponder(e.target.value));
    } else {
        // セレクトを更新（キャラ候補が変わる可能性は低いがケア）
        const sel = panel.querySelector('#into-responder-select');
        if (sel) sel.innerHTML = options;
    }

    // セレクト初期値
    const sel = panel.querySelector('#into-responder-select');
    const currentResponder = window.intoModeState.selectedResponder || defaultResponder;
    if (sel && currentResponder) sel.value = currentResponder;
    updateResponderIcon(currentResponder);

    return panel;
}

function updateResponderIcon(name) {
    const iconBox = document.getElementById('into-responder-icon');
    if (!iconBox) return;
    if (!name) { iconBox.innerHTML = ''; return; }
    const ch = characters.find(c => c.name === name);
    if (!ch) { iconBox.innerHTML = ''; return; }
    const src = `/images/${ch.baseName}_normal.png`;
    const fallback = `/images/${ch.baseName}_normal.png`;
    // 画像本体は親の80x80にフィット
    iconBox.innerHTML = `<img src="${src}" onerror="this.src='${fallback}';this.onerror=null;" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`;
}

export function startIntoMode(caseData) {
    const panel = ensureIntoUI(caseData);
    if (!panel) return;
    const responder = panel.querySelector('#into-responder-select')?.value || window.intoModeState.selectedResponder || '';
    window.intoModeState.selectedResponder = responder;
    window.intoModeState.scores = [];
    const avgEl = document.getElementById('into-average-score');
    if (avgEl) avgEl.textContent = '- %';

    window.intoModeState.started = true;
    window.intoModeState.storyIndex = 0;
    window.intoModeState.askedQIds = [];
    window.intoModeState.askedQIndices = [];

    const sid = window.intoModeState.sessionId;
    if (!window.conversationHistories) window.conversationHistories = {};
    window.conversationHistories[sid] = [];

    // Qバッジ表示をリセット
    const currentBadge = document.getElementById('into-current-q-deco');
    if (currentBadge) {
        currentBadge.innerHTML = '';
        currentBadge.classList.add('hidden');
        currentBadge.removeAttribute('data-q-number');
        currentBadge.removeAttribute('data-qa-index');
        currentBadge.removeAttribute('data-quiz-index');
        currentBadge.removeAttribute('data-sub-index');
    }

    // AIレスポンス監視をセット（重複登録防止のため一度解除）
    window.removeEventListener('aiResponse', handleAIResponseForInto);
    window.addEventListener('aiResponse', handleAIResponseForInto);

    stopInlineSpeedQuiz('into-start');

    const prompt = buildIntoInitialPrompt(caseData, responder);
    sendMessageToAI(sid, prompt, '', '');
}

function sendIntoFollowUp() {
    const input = document.getElementById('into-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) return;
    const sid = window.intoModeState.sessionId;
    if (!window.conversationHistories) window.conversationHistories = {};
    if (!window.conversationHistories[sid]) window.conversationHistories[sid] = [];
    window.conversationHistories[sid].push({ role: 'user', parts: [{ text }] });

    const prompt = buildIntoFollowUpPrompt(text, window.intoModeState.selectedResponder);
    // 送信直前に、ユーザー回答を選択キャラのセリフとして即時表示
    if (window.intoModeState.selectedResponder) {
        displayExternalDialogue(sid, window.intoModeState.selectedResponder, text, 'normal');
    }
    // 表示・送信
    sendMessageToAI(sid, prompt, '', text);
    input.value = '';
}

export function endIntoMode() {
    const panel = document.getElementById('into-mode-panel');
    if (panel) panel.remove();
    window.intoModeState.started = false;
    stopInlineSpeedQuiz('into-end');
    window.removeEventListener('aiResponse', handleAIResponseForInto);
}

// セレクト変更ハンドラ（イベント委任用）
export function setIntoResponder(name) {
    if (!name) return;
    window.intoModeState.selectedResponder = name;
    updateResponderIcon(name);
}

// グローバルに公開（イベントデリゲーションから呼べるように）
window.startIntoMode = (caseData) => startIntoMode(caseData || window.currentCaseData);
window.sendIntoFollowUp = () => sendIntoFollowUp();
window.endIntoMode = () => endIntoMode();
window.setIntoResponder = (n) => setIntoResponder(n);

function handleAIResponseForInto(e) {
    const { sessionId, score, responder, qId, qIndex, qText } = e.detail || {};
    if (sessionId !== window.intoModeState.sessionId) return;
    stopInlineSpeedQuiz('ai-response');
    // スコア集計
    if (typeof score === 'number') {
        window.intoModeState.scores.push(Math.max(0, Math.min(100, score)));
        const avg = Math.round(window.intoModeState.scores.reduce((a,b)=>a+b,0) / window.intoModeState.scores.length);
        const el = document.getElementById('into-average-score');
        if (el) el.textContent = `${avg} %`;
    }
    // 現在の質問のUI表示とプレースホルダ更新
    try {
        const box = document.getElementById('into-current-q-deco');
        const qaList = window.currentCaseData?.questionsAndAnswers || [];
        const { qaItem, qaIndex: resolvedQaIndex, qaNumber } = resolveQAReference(qaList, qId, qIndex);
        const presentation = buildQAButtonPresentation({ qaItem, fallbackNumber: qaNumber ?? qId ?? qIndex ?? '?' });

        if (box) {

            box.innerHTML = presentation.badgeHTML;
            box.title = presentation.title;
            box.classList.remove('hidden');
            // 既存のQ&Aリンクの色設定に合わせる（学習状況に応じた色）
            try {
                const moduleId = window.currentCaseData?.id;
                const statusKey = presentation.number ?? qaNumber;
                if (window.qaStatusSystem && statusKey != null) {
                    // 後続の自動色更新に拾わせるため、識別属性を付与
                    box.setAttribute('data-q-number', String(statusKey));
                    // qaIndex（配列インデックス）を特定
                    if (resolvedQaIndex >= 0) {
                        box.setAttribute('data-qa-index', String(resolvedQaIndex));
                    } else if (typeof qIndex === 'number') {
                        box.setAttribute('data-qa-index', String(qIndex));
                    }
                    // INTOではグローバル文脈として扱う
                    box.setAttribute('data-quiz-index', 'global');
                    box.setAttribute('data-sub-index', '0');
                    const status = window.qaStatusSystem.getStatus(moduleId, String(statusKey));
                    // qa-ref-btnに色を反映（INTOバッジ単体なので直接適用）
                    window.qaStatusSystem.updateQARefButtonColor(box, status);
                }
            } catch {}
        }
        const effectiveQId = (qaItem?.id ?? qId ?? null);
        const effectiveQIndex = (resolvedQaIndex >= 0) ? resolvedQaIndex : (typeof qIndex === 'number' ? qIndex : null);

        // 出題済みQの記録（重複登録は避ける）
        if (effectiveQId != null) {
            window.intoModeState.askedQIds = window.intoModeState.askedQIds || [];
            if (!window.intoModeState.askedQIds.includes(effectiveQId)) {
                window.intoModeState.askedQIds.push(effectiveQId);
            }
        }
        if (effectiveQIndex != null) {
            window.intoModeState.askedQIndices = window.intoModeState.askedQIndices || [];
            if (!window.intoModeState.askedQIndices.includes(effectiveQIndex)) {
                window.intoModeState.askedQIndices.push(effectiveQIndex);
            }
        }
    } catch {}
    // AI指定の回答キャラ反映（ユーザーが後から変更可能）
    if (responder) {
        const sel = document.getElementById('into-responder-select');
        // エイリアス→正規名へ正規化
        const all = (window.currentCaseData && Array.isArray(window.currentCaseData.story))
            ? extractStoryCharacterNames(window.currentCaseData)
            : [];
        const norm = normalizeResponderName(responder, all);
        const exists = Array.from(sel?.options || []).some(o => o.value === norm);
        if (exists) {
            window.intoModeState.selectedResponder = norm;
            if (sel) sel.value = norm;
            updateResponderIcon(norm);
        }
    }

    // シーン進行の更新（[[SCENE_TO: i]] を検出）
    try {
        const text = e.detail?.text || '';
        const m = text.match(/\[\[SCENE_TO:\s*(\d+)\s*\]\]/i);
        if (m) {
            const idx = parseInt(m[1], 10);
            if (!Number.isNaN(idx)) {
                window.intoModeState.storyIndex = idx + 1; // 次はその次のシーンから
            }
        }
    } catch {}
}

function normalizeResponderName(name, allowedNames) {
    if (!name) return '';
    // 先に完全一致
    if (allowedNames.includes(name)) return name;
    // エイリアス解決
    const c = characters.find(ch => ch.name === name || (ch.aliases || []).includes(name));
    if (c && allowedNames.includes(c.name)) return c.name;
    // 先頭一致などのゆるいマッチ（安全のため最小限）
    const loose = allowedNames.find(n => n.startsWith(name) || name.startsWith(n));
    return loose || allowedNames[0] || '';
}
