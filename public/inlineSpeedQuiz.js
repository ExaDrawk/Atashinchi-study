// インライン表示版 スピード条文（AI応答待機中）
// 目的: 既存 speedQuiz.js のロジックを最大限再利用しつつ、
//      1) 条文本文だけを独立スクロール
//      2) 条文先頭行が常に表示（上部が欠けない）
//      3) 入力欄・ボタンは常時可視
// を満たす極薄アダプタ。

import { initializeSpeedQuizGame, startSpeedQuiz, disposeSpeedQuizInstance } from './speedQuiz.js';

const STYLE_ID = 'inline-speed-quiz-style-v2';

const base = { active: false, id: null, wrapper: null, host: null };
let state = { ...base };
const reset = () => { state = { ...base }; };

function hostElement(opt = {}) {
    if (opt.hostElement instanceof HTMLElement) return opt.hostElement;
    if (opt.hostId) {
        const el = document.getElementById(opt.hostId);
        if (el) return el;
    }
    return document.getElementById('dialogue-area-into');
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
    .inline-sq-wrapper { animation: sqInlineFade .18s ease-out; }
    .inline-sq-wrapper .sq-frame { background:#fff; border:1px solid #d8b4fe; border-radius:10px; padding:8px 10px; display:flex; flex-direction:column; gap:.5rem; }
    .inline-sq-header { display:flex; justify-content:space-between; align-items:center; font-size:.72rem; font-weight:600; color:#6b21a8; }
    .inline-sq-header button { color:#7e22ce; text-decoration:underline; font-size:.68rem; }
    .inline-sq-header button:hover { color:#581c87; }
    .inline-sq-wrapper #speed-quiz-rules,
    .inline-sq-wrapper #speed-quiz-menu,
    .inline-sq-wrapper #speed-quiz-result { display:none !important; }
    .inline-sq-wrapper #speed-quiz-game { display:flex; flex-direction:column; gap:.55rem; padding:0; }
    .inline-sq-wrapper #speed-quiz-game > * { flex-shrink:0; }
    /* 条文表示エリア再構成 */
    .inline-sq-wrapper #article-display { margin:0; padding:.5rem .65rem; background:#fff; border:1px solid #cbd5e1; border-radius:6px; }
    .inline-sq-wrapper #article-display .speed-quiz-article-scroll { max-height:160px; overflow-y:auto; scrollbar-width:thin; }
    .inline-sq-wrapper #article-display .speed-quiz-article-scroll::-webkit-scrollbar { width:6px; }
    .inline-sq-wrapper #article-display .speed-quiz-article-scroll::-webkit-scrollbar-thumb { background:rgba(148,163,184,.55); border-radius:9999px; }
    .inline-sq-wrapper #article-display .speed-quiz-article-scroll > div { margin-top:0 !important; }
    /* 入力欄を中央寄せしつつ常時可視 */
    .inline-sq-wrapper #article-number-input, .inline-sq-wrapper #paragraph-number-input { font-size:1.55rem !important; }
    .inline-sq-wrapper #speed-quiz-game .text-3xl { font-size:1.25rem; }
    .inline-sq-wrapper #speed-quiz-game .text-xl { font-size:0.95rem; }
    .inline-sq-wrapper #current-law-name { padding:.35rem .55rem; }
    .inline-sq-wrapper #feedback { min-height:1.2rem; }
    .inline-sq-wrapper #skip-question, .inline-sq-wrapper #quit-game { font-size:.7rem; padding:.35rem .8rem; }
    @keyframes sqInlineFade { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:translateY(0);} }
    `;
    document.head.appendChild(style);
}

function build(containerId) {
    const w = document.createElement('div');
    w.className = 'inline-sq-wrapper bg-purple-50 border border-purple-200 rounded-lg shadow-sm p-2 mb-3';
    w.dataset.inlineSpeedQuiz = 'true';
    w.innerHTML = `
      <div class="inline-sq-header">
        <span>⚡ AI応答待機中：スピード条文チャレンジ</span>
        <button type="button" class="sq-skip">スキップ</button>
      </div>
      <div class="sq-frame">
        <div id="${containerId}"></div>
      </div>
    `;
    return w;
}

function adaptLayout(wrapper) {
    const game = wrapper.querySelector('#speed-quiz-game');
    if (game) game.classList.remove('hidden');
    ['#speed-quiz-rules','#speed-quiz-menu','#speed-quiz-result'].forEach(sel=>{
        const el = wrapper.querySelector(sel); if(el) el.classList.add('hidden');
    });
    // 念のため条文スクロール先頭へ
    const sc = wrapper.querySelector('#article-display .speed-quiz-article-scroll');
    if (sc) sc.scrollTop = 0;
}

export async function startInlineSpeedQuiz(caseData, options = {}) {
    if (!caseData) { console.warn('⚠ inlineSQ: caseData未指定'); return; }
    const host = hostElement(options);
    if (!host) { console.warn('⚠ inlineSQ: host未発見'); return; }
    if (state.active) stopInlineSpeedQuiz('restart');
    ensureStyles();
    const containerId = options.containerId || `inline-sq-${Date.now().toString(36)}`;
    const wrapper = build(containerId);
    host.appendChild(wrapper);
    state = { active:true, id:containerId, wrapper, host };

    const skipBtn = wrapper.querySelector('.sq-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => stopInlineSpeedQuiz('user-skip'), { once:true });

    try {
        await initializeSpeedQuizGame(containerId, caseData, Boolean(options.preserveArticles));
        if (state.id !== containerId) return; // 中止済み
        adaptLayout(wrapper);
        if (!Array.isArray(window.speedQuizArticles) || window.speedQuizArticles.length === 0) return;
        await startSpeedQuiz();
        if (state.id !== containerId) return;
        // 開始直後にも再度トップを保証
        const sc = wrapper.querySelector('#article-display .speed-quiz-article-scroll');
        if (sc) sc.scrollTop = 0;
    } catch(e) {
        console.error('❌ inlineSQ 初期化エラー:', e);
        const frame = wrapper.querySelector('.sq-frame');
        if (frame) frame.innerHTML = '<div class="text-xs text-red-600 p-2">読み込み失敗</div>';
        try { disposeSpeedQuizInstance({ resetState:true }); } catch(_) {}
        reset();
    }
}

export function stopInlineSpeedQuiz(reason='manual') {
    if (!state.active && !state.wrapper) return;
    try { disposeSpeedQuizInstance({ resetState:true }); } catch(e) { console.warn('⚠ dispose失敗', e); }
    if (state.wrapper?.parentNode) state.wrapper.parentNode.removeChild(state.wrapper);
    reset();
    console.log('🧹 inlineSQ停止:', reason);
}

export function isInlineSpeedQuizRunning(){ return state.active; }
