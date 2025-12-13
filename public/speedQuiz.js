/**
 * ⚡ スピード条文ゲーム v3.0
 * - コード重複なし（ホームページ・モジュール共通）
 * - フルスクリーン対応 + 戻るボタン
 * - ネプリーグ風の文字拡大演出
 */

import { getCategoryColor, getSpeedFilterPanelHTML, attachSpeedFilterHandlers, getSpeedFilterSettings } from './pages/homePage.js';

// ═══════════════════════════════════════════════════════════════════════════
// 法令カラー取得（homePage.jsのgetCategoryColorを使用）
// ═══════════════════════════════════════════════════════════════════════════
function getLawColor(lawName) {
    const colorInfo = getCategoryColor(lawName);
    return { bg: colorInfo.bgColor, text: colorInfo.color };
}

// ═══════════════════════════════════════════════════════════════════════════
// グローバル状態
// ═══════════════════════════════════════════════════════════════════════════
const SQ = {
    phase: 'idle', // idle, menu, playing, paused, result
    articles: [],
    index: 0,
    score: 0,
    correct: 0,
    wrong: [],
    timer: null,
    timerStart: 0,
    timeLeft: 10,
    timeLimit: 10,
    answer: '',
    processing: false,
    container: null,
    returnUrl: null,
    keyHandler: null,
    tickHandler: null,
    fontSize: 1,
};

// ═══════════════════════════════════════════════════════════════════════════
// スタイル（フルスクリーン + ネプリーグ演出）
// ═══════════════════════════════════════════════════════════════════════════
const SQ_STYLES = `
<style id="sq-styles-v3">
/* フルスクリーン */
.sq-fs {
    position: fixed !important;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100vw !important; height: 100vh !important;
    z-index: 99999 !important;
    overflow: hidden;
    margin: 0 !important; padding: 0 !important;
}
.sq-bg-game { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); }
.sq-bg-menu { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); }
.sq-bg-result { background: linear-gradient(135deg, #0d1b2a, #1b263b, #415a77); }

/* アニメーション */
@keyframes sq-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
@keyframes sq-glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,.5);} 50%{box-shadow:0 0 50px rgba(139,92,246,.8);} }
@keyframes sq-shake { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-8px);} 40%,80%{transform:translateX(8px);} }
@keyframes sq-bounce { 0%{transform:scale(0);} 50%{transform:scale(1.2);} 100%{transform:scale(1);} }
@keyframes sq-slide { from{transform:translateY(40px);opacity:0;} to{transform:translateY(0);opacity:1;} }
@keyframes sq-correct { 0%{transform:scale(0) rotate(0);opacity:0;} 50%{transform:scale(1.2) rotate(180deg);opacity:1;} 100%{transform:scale(1) rotate(360deg);opacity:0;} }
@keyframes sq-confetti { 0%{transform:translateY(0) rotate(0);opacity:1;} 100%{transform:translateY(100vh) rotate(720deg);opacity:0;} }
@keyframes sq-grow { 0%{transform:scale(1);} 100%{transform:scale(var(--sq-scale,1.5));} }
@keyframes sq-timer-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }

/* タイマーバー */
.sq-timer-bar {
    height: 12px; border-radius: 6px;
    background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);
    transition: width 0.1s linear;
    box-shadow: 0 0 20px rgba(59,130,246,.6);
}
.sq-timer-bar.warn { background: linear-gradient(90deg, #f59e0b, #ef4444); animation: sq-timer-pulse .4s infinite; }
.sq-timer-bar.danger { background: #ef4444; animation: sq-timer-pulse .25s infinite; }

/* 入力フィールド - ネプリーグ風（幅拡大で全文字表示） */
.sq-input {
    background: rgba(255,255,255,.12);
    border: 5px solid rgba(99,102,241,.7);
    border-radius: 24px;
    color: #fff;
    font-weight: 900;
    text-align: center;
    width: 380px;
    min-width: 280px;
    max-width: 90vw;
    padding: 0.8rem 1.5rem;
    outline: none;
    font-family: 'Arial Black', sans-serif;
    letter-spacing: 0.1em;
    transition: border-color .2s, box-shadow .2s, background .2s;
    transform-origin: center;
    overflow: visible;
}
.sq-input:focus { border-color: #a78bfa; box-shadow: 0 0 50px rgba(139,92,246,.7); background: rgba(255,255,255,.18); }
.sq-input.ok { border-color: #10b981; box-shadow: 0 0 50px rgba(16,185,129,.7); background: rgba(16,185,129,.2); }
.sq-input.ng { border-color: #ef4444; background: rgba(239,68,68,.2); animation: sq-shake .5s; }

/* 「第」と「条」の文字も拡大 */
.sq-label-text {
    transition: font-size 0.1s ease-out;
}

/* ボタン */
.sq-btn {
    padding: 1rem 2.5rem; border-radius: 16px; font-weight: 800; font-size: 1.2rem;
    cursor: pointer; border: none; display: inline-flex; align-items: center; gap: .6rem;
    transition: all .25s;
}
.sq-btn:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,.4); }
.sq-btn:active { transform: translateY(-2px); }
.sq-btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
.sq-btn-success { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
.sq-btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
.sq-btn-ghost { background: rgba(255,255,255,.1); color: #fff; border: 2px solid rgba(255,255,255,.3); }
.sq-btn-start { font-size: 2rem; padding: 1.8rem 5rem; animation: sq-pulse 2s infinite, sq-glow 2s infinite; }

/* カード */
.sq-card { background: rgba(255,255,255,.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.15); border-radius: 24px; padding: 2rem; }

/* 条文ボックス */
.sq-article {
    background: rgba(255,255,255,.97); color: #1a1a2e; border-radius: 20px;
    padding: 2rem; font-size: 1.2rem; line-height: 2.2;
    overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.4);
}
.sq-article::-webkit-scrollbar { width: 8px; }
.sq-article::-webkit-scrollbar-thumb { background: rgba(99,102,241,.5); border-radius: 4px; }

/* バッジ */
.sq-score-badge { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1a2e; padding: .7rem 2rem; border-radius: 50px; font-weight: 900; font-size: 1.4rem; box-shadow: 0 8px 25px rgba(251,191,36,.5); }
.sq-law-badge { padding: 1rem 2.5rem; border-radius: 50px; font-weight: 800; font-size: 1.3rem; box-shadow: 0 8px 30px rgba(0,0,0,.3); }

/* セレクトボックス */
.sq-select {
    background: rgba(255,255,255,.1);
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 8px;
    color: #fff;
    padding: .6rem 1rem;
    font-size: .95rem;
    cursor: pointer;
    transition: all .2s;
}
.sq-select:hover { border-color: rgba(255,255,255,.5); background: rgba(255,255,255,.15); }
.sq-select:focus { border-color: #8b5cf6; outline: none; box-shadow: 0 0 10px rgba(139,92,246,.5); }
.sq-select option { background: #1a1a2e; color: #fff; }

/* オーバーレイ */
.sq-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 100000; pointer-events: none; }
.sq-circle { width: 300px; height: 300px; border: 20px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(16,185,129,.25); animation: sq-correct 1.2s forwards; box-shadow: 0 0 100px rgba(16,185,129,.7); }
.sq-circle span { font-size: 140px; color: #10b981; }

.sq-penalty { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; padding: 1.5rem 3rem; border-radius: 18px; font-weight: 900; font-size: 2rem; z-index: 100001; animation: sq-bounce .5s; box-shadow: 0 20px 60px rgba(239,68,68,.6); }

/* 結果 */
.sq-result-score { font-size: 7rem; font-weight: 900; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.sq-rank { font-size: 5rem; font-weight: 900; padding: 1.5rem 4rem; border-radius: 20px; display: inline-block; }
.sq-rank-maru { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
.sq-rank-sankaku { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1a2e; }
.sq-rank-batsu { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }

.sq-confetti { position: fixed; width: 14px; height: 14px; z-index: 100002; animation: sq-confetti 3s forwards; }
.sq-wrong-item { background: rgba(239,68,68,.15); border-left: 6px solid #ef4444; padding: 1.5rem; margin-bottom: 1rem; border-radius: 0 14px 14px 0; }

/* 結果画面のボタングリッド */
.sq-result-btn { box-shadow: 0 2px 8px rgba(0,0,0,.3); }
.sq-result-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,.4); }
.sq-result-btn:active { transform: scale(0.98); }

/* 戻るボタン */
.sq-back { position: fixed; top: 20px; left: 20px; z-index: 100003; background: rgba(0,0,0,.5); color: #fff; border: 2px solid rgba(255,255,255,.3); padding: .8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
.sq-back:hover { background: rgba(0,0,0,.7); transform: scale(1.05); }

/* ユーティリティ */
.sq-flex { display: flex; } .sq-col { flex-direction: column; } .sq-center { align-items: center; justify-content: center; }
.sq-between { justify-content: space-between; } .sq-gap-2 { gap: .5rem; } .sq-gap-4 { gap: 1rem; } .sq-gap-6 { gap: 1.5rem; }
.sq-text-center { text-align: center; } .sq-text-white { color: #fff; } .sq-text-gray { color: rgba(255,255,255,.7); }
.sq-bold { font-weight: 700; } .sq-text-lg { font-size: 1.125rem; } .sq-text-xl { font-size: 1.25rem; } .sq-text-2xl { font-size: 1.5rem; }
.sq-text-3xl { font-size: 1.875rem; } .sq-text-4xl { font-size: 2.25rem; } .sq-text-5xl { font-size: 3rem; }
.sq-w-full { width: 100%; } .sq-p-4 { padding: 1rem; } .sq-p-6 { padding: 1.5rem; } .sq-mb-4 { margin-bottom: 1rem; } .sq-mb-6 { margin-bottom: 1.5rem; }
.sq-shrink-0 { flex-shrink: 0; } .sq-flex-1 { flex: 1; } .sq-min-h-0 { min-height: 0; } .sq-overflow-auto { overflow-y: auto; }
.sq-anim-slide { animation: sq-slide .5s ease-out; }
.sq-hidden { display: none !important; }
</style>
`;

// ═══════════════════════════════════════════════════════════════════════════
// ユーティリティ
// ═══════════════════════════════════════════════════════════════════════════
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function normalize(s) {
    if (!s) return '';
    return s.toString()
        .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 65248))
        .replace(/[のノ]/g, 'の');
}

// スコア計算（0〜10点）
// 残り時間の割合を10点満点に変換（小数点以下四捨五入）
// 例: 10秒制限で残り7秒 → 7点、残り3.5秒 → 4点
function calcScore(left, limit) {
    return Math.round((left / limit) * 10);
}

// 平均点による◯△✕評価
// ◯: 8-10点（カンペキ）、△: 3-7点（あと少し）、✕: 0-2点（まだまだ）
function getRankInfo(avgScore) {
    if (avgScore >= 8) return { rank: '◯', cls: 'sq-rank-maru', msg: '🏆 カンペキ！条文マスター！' };
    if (avgScore >= 3) return { rank: '△', cls: 'sq-rank-sankaku', msg: '👍 あと少し！' };
    return { rank: '✕', cls: 'sq-rank-batsu', msg: '💪 まだまだ！頑張ろう！' };
}

// 漢数字変換（完全版）
function toKanji(n) {
    const nums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    n = parseInt(n);
    if (isNaN(n) || n === 0) return '';

    let result = '';

    // 千の位
    if (n >= 1000) {
        const thou = Math.floor(n / 1000);
        result += (thou === 1 ? '' : nums[thou]) + '千';
        n %= 1000;
    }

    // 百の位
    if (n >= 100) {
        const hun = Math.floor(n / 100);
        result += (hun === 1 ? '' : nums[hun]) + '百';
        n %= 100;
    }

    // 十の位
    if (n >= 10) {
        const ten = Math.floor(n / 10);
        result += (ten === 1 ? '' : nums[ten]) + '十';
        n %= 10;
    }

    // 一の位
    if (n > 0) {
        result += nums[n];
    }

    return result;
}

// 「の」付き条文番号の漢数字変換（例: 465の4 → 四百六十五の四）
function toKanjiWithNo(numStr) {
    if (!numStr) return '';
    const parts = numStr.toString().split('の');
    return parts.map(p => toKanji(p)).join('の');
}

// ═══════════════════════════════════════════════════════════════════════════
// 条文抽出 & 取得
// ═══════════════════════════════════════════════════════════════════════════
const LAWS = ['民法', '刑法', '憲法', '日本国憲法', '会社法', '商法', '民事訴訟法', '刑事訴訟法', '刑事訴訟規則', '行政事件訴訟法', '行政手続法', '行政不服審査法', '国家賠償法', '地方自治法', '破産法', '民事再生法', '民事執行法', '民事保全法', '借地借家法', '不動産登記法'];

export async function extractAllArticles(caseData) {
    if (!caseData) return [];
    const articles = [], seen = new Set();
    const pat = /(?:【)?([^\s【】]+?(?:法|規則|憲法))(\d+(?:の\d+)?)\s*条(?:第?(\d+)\s*項)?(?:第?(\d+)\s*号)?(?:】)?/g;

    function extract(text, src = '') {
        if (!text || typeof text !== 'string') return;
        let m; pat.lastIndex = 0;
        while ((m = pat.exec(text)) !== null) {
            const [full, law, num, para, item] = m;
            if (!LAWS.some(l => law.includes(l))) continue;
            const key = `${law}-${num}-${para || '1'}`;
            if (seen.has(key)) continue;
            seen.add(key);
            // displayTextは「法令名+条番号」のみに正規化（フルマッチだとヒント文が混入するため）
            const cleanDisplayText = `${law.trim()}${num}条${para ? `第${para}項` : ''}${item ? `第${item}号` : ''}`;
            articles.push({ lawName: law.trim(), articleNumber: num, paragraph: para ? +para : null, item: item ? +item : null, displayText: cleanDisplayText, source: src });
        }
    }

    if (caseData.title) extract(caseData.title, 'title');
    if (caseData.description) extract(caseData.description, 'desc');
    if (caseData.content) extract(caseData.content, 'content');
    if (Array.isArray(caseData.story)) caseData.story.forEach((s, i) => { if (s.dialogue) extract(s.dialogue, `story-${i}`); if (s.text) extract(s.text, `story-${i}`); });
    if (Array.isArray(caseData.embedArticles)) caseData.embedArticles.forEach(e => {
        if (e.lawName && e.articleNumber) {
            const key = `${e.lawName}-${e.articleNumber}-${e.paragraph || '1'}`;
            if (!seen.has(key)) { seen.add(key); articles.push({ lawName: e.lawName, articleNumber: e.articleNumber.toString(), paragraph: e.paragraph || null, item: e.item || null, displayText: `${e.lawName}${e.articleNumber}条`, source: 'embed' }); }
        }
    });
    return articles;
}

export function normalizeArticleForSpeedQuiz(a) {
    return { lawName: a.lawName || '', articleNumber: (a.articleNumber || '').toString(), paragraph: a.paragraph || null, item: a.item || null, displayText: a.displayText || `${a.lawName}${a.articleNumber}条` };
}

async function fetchContent(a) {
    try {
        let txt = `${a.lawName}${a.articleNumber}条`;
        if (a.paragraph) txt += `第${a.paragraph}項`;
        console.log('📖 条文取得:', txt);
        const res = await fetch('/api/parse-article', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText: txt }) });
        if (!res.ok) throw new Error('API error: ' + res.status);
        const c = await res.text();
        console.log('📖 条文レスポンス:', c.substring(0, 100) + '...');
        if (c.startsWith('❌')) throw new Error(c);
        if (!c || c.trim().length === 0) throw new Error('空のレスポンス');
        return c;
    } catch (err) {
        console.error('📖 条文取得エラー:', err);
        return `【${a.lawName}${a.articleNumber}条】\n条文の取得に失敗しました。`;
    }
}

function hideAnswer(content, a) {
    if (!content || !a) return content;

    console.log('🔍 hideAnswer入力:', content.substring(0, 200));

    // APIからの条文フォーマット:
    // "（見出し）\n第〇〇条　本文..."
    // 
    // 条文番号（第〇〇条）を完全に削除して、見出しと本文だけを表示する

    // 行ごとに分割
    const lines = content.split('\n');
    const result = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        // 空行はスキップ
        if (!trimmedLine) continue;

        // 見出し行（括弧で囲まれた行）はそのまま保持
        if (/^（.+）$/.test(trimmedLine)) {
            // 見出しを二重括弧に変換（displayQでハイライト処理される）
            result.push(trimmedLine.replace(/^（(.+)）$/, '（（$1））'));
            continue;
        }

        // 「第〇〇条　」または「第〇〇条」で始まる行から条文番号を削除
        // 漢数字パターン: 第四百十三条、第四百六十五条の二 など
        // アラビア数字パターン: 第413条、第465条の2 など
        let processedLine = line;

        // 漢数字の条文番号を削除（「第〇〇条　」の部分を削除）
        processedLine = processedLine.replace(
            /^第[〇一二三四五六七八九十百千零]+(?:の[〇一二三四五六七八九十百千零]+)*条[　\s]*/,
            ''
        );

        // アラビア数字の条文番号を削除
        processedLine = processedLine.replace(
            /^第\d+(?:の\d+)?条[　\s]*/,
            ''
        );

        // 空行でなければ結果に追加
        if (processedLine.trim()) {
            result.push(processedLine);
        }
    }

    const output = result.join('\n');
    console.log('🔍 hideAnswer出力:', output.substring(0, 200));
    return output;
}

// 条文ごとのスコアを記録（0〜10点）
// ・まだまだ: 平均0〜2点
// ・あと少し: 平均3〜7点
// ・カンペキ: 平均8〜10点
async function recordAnswer(a, ok, sc) {
    try {
        const d = new Date().toISOString().split('T')[0];
        const ts = new Date().toISOString();
        await fetch('/api/quiz-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: d,
                result: {
                    articleNumber: `${a.lawName}${a.articleNumber}条`,
                    score: sc, // 0〜10点
                    timestamp: ts
                }
            })
        });
    } catch (err) {
        console.warn('スコア記録エラー:', err);
    }
}

// 結果画面で条文を表示するモーダル
async function showArticleModal(article) {
    // 既存のモーダルがあれば削除
    const existing = document.getElementById('sq-article-modal');
    if (existing) existing.remove();

    // モーダル作成
    const modal = document.createElement('div');
    modal.id = 'sq-article-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
        <div style="background:#1e293b;border-radius:1rem;max-width:800px;width:100%;max-height:80vh;overflow:auto;padding:1.5rem;position:relative;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
            <button id="sq-modal-close" style="position:absolute;top:1rem;right:1rem;background:transparent;border:none;color:#9ca3af;font-size:1.5rem;cursor:pointer;padding:0.5rem;line-height:1;">&times;</button>
            <h3 style="color:#fff;font-size:1.25rem;font-weight:bold;margin-bottom:1rem;padding-right:2rem;">${article.lawName}${article.articleNumber}条</h3>
            <div id="sq-modal-content" style="color:#e5e7eb;font-size:1rem;line-height:1.8;">
                <span style="color:#6366f1;">条文を読み込み中...</span>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 閉じるボタン
    document.getElementById('sq-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // ESCで閉じる
    const escHandler = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);

    // 条文取得
    try {
        const content = await fetchContent(article);
        const contentDiv = document.getElementById('sq-modal-content');
        if (contentDiv) {
            // （（見出し））を強調表示に変換し、（（））は削除
            let formatted = content
                .replace(/（（(.+?)））/g, '<div style="font-weight:bold;font-size:1.15rem;color:#fbbf24;margin:0.5rem 0;font-family:\'Noto Serif JP\',serif;">$1</div>')
                .replace(/\n/g, '<br>');
            contentDiv.innerHTML = formatted;
        }
    } catch (err) {
        const contentDiv = document.getElementById('sq-modal-content');
        if (contentDiv) {
            contentDiv.innerHTML = `<span style="color:#ef4444;">条文の取得に失敗しました</span>`;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// UI レンダリング
// ═══════════════════════════════════════════════════════════════════════════

// 利用可能な法令リストを取得
function getAvailableLaws() {
    const lawSet = new Set();
    SQ.articles.forEach(a => { if (a.lawName) lawSet.add(a.lawName); });
    return Array.from(lawSet).sort();
}

function renderMenu(count) {
    // homePage.jsの既存絞り込みパネルを取得
    const filterPanelHTML = getSpeedFilterPanelHTML();

    return `
<div class="sq-fs sq-bg-menu sq-flex sq-col sq-overflow-auto" style="padding:1.5rem;">
    <button class="sq-back" id="sq-back">← 戻る</button>
    <div class="sq-text-center sq-anim-slide" style="max-width:900px;margin:0 auto;width:100%;">
        <div class="sq-mb-4">
            <h1 class="sq-text-4xl sq-bold sq-text-white sq-mb-2" style="text-shadow:0 0 50px rgba(99,102,241,.6);">⚡ スピード条文ゲーム</h1>
            <p class="sq-text-gray sq-text-lg">条文を読んで、何条か素早く答えよう！</p>
            <p class="sq-text-gray" style="margin-top:.5rem;">全 <span class="sq-text-white sq-bold sq-text-2xl">${count}</span> 問</p>
        </div>
        
        <!-- 既存の絞り込みパネル（homePage.jsと同じ） -->
        <div id="sq-filter-panel" class="bg-white rounded-xl shadow-lg p-4 mb-4" style="text-align:left;">
            ${filterPanelHTML}
        </div>
        
        <!-- 履歴セクション -->
        <div class="sq-card" style="max-width:700px;margin:0 auto;">
            <div class="sq-flex sq-between sq-center sq-mb-3">
                <h3 class="sq-text-white sq-bold sq-text-lg">📊 最近の記録</h3>
                <button id="sq-sync-r2-btn" class="sq-btn sq-btn-ghost" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                    ☁️ クラウド同期
                </button>
            </div>
            <div id="sq-history-container" class="sq-text-gray" style="text-align:left;max-height:300px;overflow-y:auto;">
                <p style="text-align:center;color:rgba(255,255,255,0.5);">読み込み中...</p>
            </div>
        </div>
    </div>
</div>`;
}


function renderGame() {
    const a = SQ.articles[SQ.index];
    const total = SQ.articles.length;
    const lawColor = getLawColor(a?.lawName || '');
    return `
<div id="sq-game" class="sq-fs sq-bg-game" style="display:grid;grid-template-rows:auto auto auto auto 1fr auto auto;">
    <button class="sq-back" id="sq-back">← 戻る</button>
    <div class="sq-flex sq-between sq-center sq-p-4 sq-shrink-0">
        <div class="sq-card sq-flex sq-center sq-gap-2" style="padding:.6rem 1.2rem;">
            <span class="sq-text-gray">問題</span>
            <span id="sq-qnum" class="sq-text-white sq-bold sq-text-2xl">${SQ.index + 1}</span>
            <span class="sq-text-gray">/ ${total}</span>
        </div>
        <div id="sq-score" class="sq-score-badge">⭐ ${SQ.score} 点</div>
    </div>
    <div class="sq-p-4 sq-shrink-0">
        <div style="background:rgba(255,255,255,.15);border-radius:6px;height:12px;">
            <div id="sq-bar" class="sq-timer-bar" style="width:100%;"></div>
        </div>
        <div class="sq-text-center" style="margin-top:1rem;">
            <span class="sq-text-gray sq-text-2xl">残り </span>
            <span id="sq-time" class="sq-text-white sq-text-4xl sq-bold">${SQ.timeLeft}</span>
            <span class="sq-text-gray sq-text-2xl"> 秒</span>
        </div>
    </div>
    <div class="sq-text-center sq-mb-4 sq-shrink-0">
        <span id="sq-law" class="sq-law-badge" style="background:${lawColor.bg};color:${lawColor.text};">${a?.lawName || '読込中...'}</span>
    </div>
    <div class="sq-p-4" style="min-height:0;overflow:hidden;">
        <div id="sq-article-box" class="sq-article" style="height:100%;overflow-y:auto;">
            <div id="sq-article-text">条文を読み込み中...</div>
        </div>
    </div>
    <div class="sq-text-center sq-shrink-0 sq-mb-4" style="height:160px;display:flex;flex-direction:column;justify-content:center;">
        <div class="sq-flex sq-center sq-gap-4" id="sq-input-area">
            <span class="sq-text-white sq-bold sq-label-text" id="sq-label-dai" style="font-size:2.5rem;">第</span>
            <div style="position:relative;display:inline-block;">
                <span id="sq-input-overlay" style="position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;font-size:5rem;font-weight:900;color:#10b981;text-align:center;padding:0.8rem 1.5rem;font-family:'Arial Black',sans-serif;letter-spacing:0.1em;display:flex;align-items:center;justify-content:center;"></span>
                <input type="text" id="sq-input" class="sq-input" style="font-size:5rem;color:transparent;caret-color:#fff;" maxlength="8" autocomplete="off" inputmode="numeric">
            </div>
            <span class="sq-text-white sq-bold sq-label-text" id="sq-label-jou" style="font-size:2.5rem;">条</span>
        </div>
        <div id="sq-feedback" style="height:3rem;margin-top:1rem;" class="sq-text-2xl sq-bold"></div>
    </div>
    <div class="sq-flex sq-center sq-gap-4 sq-p-4 sq-shrink-0">
        <button id="sq-pause" class="sq-btn sq-btn-primary">⏸ ポーズ</button>
        <button id="sq-skip" class="sq-btn sq-btn-ghost">⏭ スキップ</button>
        <button id="sq-quit" class="sq-btn sq-btn-danger">🏁 終了</button>
    </div>
</div>`;
}

function renderResult() {
    const total = SQ.articles.length;
    // 平均点計算（小数第二位まで）
    const avgScore = total > 0 ? (SQ.score / total).toFixed(2) : '0.00';
    const ri = getRankInfo(parseFloat(avgScore));

    // グリッド形式の回答ボタン生成
    let buttonsHtml = '';
    if (SQ.allAnswers && SQ.allAnswers.length > 0) {
        const buttons = SQ.allAnswers.map((item, idx) => {
            const a = item.article;
            const score = item.score;
            // 点数による評価アイコン
            let scoreIcon;
            if (score >= 8) {
                scoreIcon = '◯';
            } else if (score >= 3) {
                scoreIcon = '△';
            } else {
                scoreIcon = '✕';
            }
            const lawColor = getLawColor(a.lawName);
            // 法令名を短縮（長い場合）
            const shortLawName = a.lawName.length > 4 ? a.lawName.substring(0, 3) + '…' : a.lawName;
            return `<button class="sq-result-btn sq-article-btn" data-idx="${idx}" style="background:${lawColor.bg};color:${lawColor.text};border:none;padding:0.4rem 0.6rem;border-radius:0.5rem;font-size:0.85rem;font-weight:bold;cursor:pointer;display:flex;align-items:center;gap:0.3rem;white-space:nowrap;transition:transform 0.1s,box-shadow 0.1s;" title="${a.lawName}${a.articleNumber}条">${shortLawName}${a.articleNumber}条${scoreIcon} ${score}点</button>`;
        }).join('');

        buttonsHtml = `
<div style="margin-top:1.5rem;">
    <h3 class="sq-text-white sq-bold sq-text-xl sq-mb-4">📋 全問題（クリックで条文表示）</h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;max-height:35vh;overflow-y:auto;padding:0.5rem;background:rgba(0,0,0,0.2);border-radius:0.75rem;">
        ${buttons}
    </div>
</div>`;
    }

    return `
<div class="sq-fs sq-bg-result sq-flex sq-col sq-center sq-overflow-auto sq-p-6">
    <button class="sq-back" id="sq-back">← 戻る</button>
    <div class="sq-text-center sq-anim-slide" style="max-width:900px;width:100%;">
        <h1 class="sq-text-5xl sq-bold sq-text-white sq-mb-6">🎉 ゲーム終了！</h1>
        <div class="sq-card sq-mb-6">
            <div class="sq-result-score sq-mb-2">${avgScore}</div>
            <p class="sq-text-gray sq-text-2xl sq-mb-4">平均点</p>
            <div class="sq-mb-4"><span class="sq-rank ${ri.cls}">${ri.rank}</span></div>
            <p class="sq-text-white sq-text-xl">${ri.msg}</p>
        </div>
        ${buttonsHtml}
        <div class="sq-flex sq-center sq-gap-4" style="margin-top:1.5rem;">
            <button id="sq-retry" class="sq-btn sq-btn-success sq-text-lg">🔄 もう一度</button>
            <button id="sq-menu" class="sq-btn sq-btn-ghost sq-text-lg">🏠 メニュー</button>
        </div>
    </div>
</div>`;
}

function renderPause() {
    return `
<div id="sq-pause-overlay" class="sq-fs sq-flex sq-center" style="background:rgba(0,0,0,.85);z-index:100000;">
    <div class="sq-text-center sq-anim-slide">
        <h2 class="sq-text-5xl sq-bold sq-text-white sq-mb-6">⏸ ポーズ中</h2>
        <button id="sq-resume" class="sq-btn sq-btn-success sq-btn-start">▶ 再開</button>
    </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// エフェクト
// ═══════════════════════════════════════════════════════════════════════════
function showCorrectFx() {
    const o = document.createElement('div');
    o.className = 'sq-overlay';
    o.innerHTML = '<div class="sq-circle"><span>✓</span></div>';
    document.body.appendChild(o);
    confetti();
    setTimeout(() => o.remove(), 1200);
}

function confetti() {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24', '#ef4444'];
    for (let i = 0; i < 70; i++) {
        const c = document.createElement('div');
        c.className = 'sq-confetti';
        c.style.cssText = `left:${Math.random() * 100}vw;top:-20px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > .5 ? '50%' : '3px'};animation-delay:${Math.random() * .5}s;animation-duration:${2 + Math.random() * 1.5}s;`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3500);
    }
}

function showPenaltyFx() {
    const p = document.createElement('div');
    p.className = 'sq-penalty';
    p.textContent = '💥 −1秒 💥';
    document.body.appendChild(p);
    const inp = document.getElementById('sq-input');
    if (inp) inp.classList.add('ng');
    setTimeout(() => { p.remove(); if (inp) inp.classList.remove('ng'); }, 800);
}

// ═══════════════════════════════════════════════════════════════════════════
// ゲームロジック
// ═══════════════════════════════════════════════════════════════════════════
function startTimer() {
    stopTimer();
    SQ.timeLeft = SQ.timeLimit;
    SQ.timerStart = performance.now();
    SQ.fontSize = 1;
    updateTimer();

    // 1秒ごとのカウントダウン
    SQ.timer = setInterval(() => {
        SQ.timeLeft--;
        updateTimer(); // ★ 残り時間表示を更新
        if (SQ.timeLeft <= 0) handleTimeout();
    }, 1000);

    // 連続的なフォントサイズ更新（60fps）
    function animateFontSize() {
        if (SQ.phase !== 'playing' || SQ.processing) return;
        const elapsed = (performance.now() - SQ.timerStart) / 1000;
        const progress = Math.min(elapsed / SQ.timeLimit, 1);
        updateTimerSmooth(progress);
        if (progress < 1) {
            SQ.tickHandler = requestAnimationFrame(animateFontSize);
        }
    }
    SQ.tickHandler = requestAnimationFrame(animateFontSize);
}

function stopTimer() {
    if (SQ.timer) { clearInterval(SQ.timer); SQ.timer = null; }
    if (SQ.tickHandler) { cancelAnimationFrame(SQ.tickHandler); SQ.tickHandler = null; }
}

function updateTimer() {
    const bar = document.getElementById('sq-bar');
    const time = document.getElementById('sq-time');

    if (bar) {
        const pct = (SQ.timeLeft / SQ.timeLimit) * 100;
        bar.style.width = pct + '%';
        bar.classList.remove('warn', 'danger');
        if (SQ.timeLeft <= 3) bar.classList.add('danger');
        else if (SQ.timeLeft <= 5) bar.classList.add('warn');
    }
    if (time) {
        time.textContent = SQ.timeLeft;
        time.style.color = SQ.timeLeft <= 3 ? '#ef4444' : SQ.timeLeft <= 5 ? '#f59e0b' : '#fff';
    }
}

// 連続的なフォントサイズ更新（60fps、滑らかに拡大）
function updateTimerSmooth(progress) {
    const bar = document.getElementById('sq-bar');
    const inp = document.getElementById('sq-input');
    const labelDai = document.getElementById('sq-label-dai');
    const labelJou = document.getElementById('sq-label-jou');

    // プログレスバーも滑らかに
    if (bar) {
        const pct = (1 - progress) * 100;
        bar.style.width = pct + '%';
    }

    // ネプリーグ風：連続的に文字が大きくなる（5rem → 9rem）
    const baseFontSize = 5;
    const maxGrow = 4;
    const currentSize = baseFontSize + (maxGrow * progress);

    if (inp) {
        inp.style.fontSize = currentSize + 'rem';
    }
    // オーバーレイも同じサイズに
    const overlay = document.getElementById('sq-input-overlay');
    if (overlay) {
        overlay.style.fontSize = currentSize + 'rem';
    }
    // ラベル（第・条）も連動して拡大（2.5rem → 4.5rem）
    const labelBase = 2.5;
    const labelGrow = 2;
    const labelSize = labelBase + (labelGrow * progress);
    if (labelDai) labelDai.style.fontSize = labelSize + 'rem';
    if (labelJou) labelJou.style.fontSize = labelSize + 'rem';
}

function penalty() {
    if (SQ.timeLeft > 1) {
        SQ.timeLeft--;
        // ペナルティでタイマー開始時間を1秒分早める
        SQ.timerStart -= 1000;
        updateTimer();
        showPenaltyFx();
    }
}

function handleInput(e) {
    if (SQ.processing || SQ.phase !== 'playing') return;
    const inp = e.target;
    let v = normalize(inp.value).replace(/[^0-9の]/g, '');
    inp.value = v;
    // オーバーレイを更新（正解部分を緑色で表示）
    const overlay = document.getElementById('sq-input-overlay');
    if (overlay) overlay.textContent = v;
    if (v.length > 0) {
        if (!SQ.answer.startsWith(v)) { penalty(); inp.value = v.slice(0, -1); if (overlay) overlay.textContent = v.slice(0, -1); return; }
        if (v === SQ.answer) handleCorrect();
    }
}

function handleCorrect() {
    if (SQ.processing) return;
    SQ.processing = true;
    stopTimer();
    const a = SQ.articles[SQ.index];
    const sc = calcScore(SQ.timeLeft, SQ.timeLimit);
    SQ.score += sc;
    SQ.correct++;
    // 全回答を記録
    SQ.allAnswers.push({ article: a, score: sc, isCorrect: true, reason: '正解' });
    const inp = document.getElementById('sq-input');
    if (inp) {
        inp.classList.add('ok');
        inp.disabled = true; // 入力をロック
        inp.style.opacity = '0.7';
    }
    const fb = document.getElementById('sq-feedback');
    if (fb) fb.innerHTML = `<span style="color:#10b981;">正解 +${sc}点</span>`;
    const sd = document.getElementById('sq-score');
    if (sd) { sd.textContent = `⭐ ${SQ.score} 点`; sd.style.animation = 'sq-bounce .3s'; setTimeout(() => sd.style.animation = '', 300); }
    showCorrectFx();
    recordAnswer(a, true, sc);
    setTimeout(() => { SQ.processing = false; nextQ(); }, 1200);
}

function handleTimeout() {
    if (SQ.processing) return;
    SQ.processing = true;
    stopTimer();
    const a = SQ.articles[SQ.index];
    const inp = document.getElementById('sq-input');
    SQ.wrong.push({ article: a, user: inp?.value || null, ans: `${a.lawName}${a.articleNumber}条`, reason: '時間切れ' });
    // 全回答を記録
    SQ.allAnswers.push({ article: a, score: 0, isCorrect: false, reason: '時間切れ' });
    if (inp) {
        inp.disabled = true;
        inp.value = a.articleNumber;
        inp.classList.add('ng');
    }
    // オーバーレイに正解を赤字で表示
    const overlay = document.getElementById('sq-input-overlay');
    if (overlay) {
        overlay.textContent = a.articleNumber;
        overlay.style.color = '#ef4444';
    }
    const fb = document.getElementById('sq-feedback');
    if (fb) fb.innerHTML = `<span style="color:#ef4444;">時間切れ</span>`;
    recordAnswer(a, false, 0);
    setTimeout(() => { SQ.processing = false; nextQ(); }, 1500);
}

function handleSkip() {
    if (SQ.processing || SQ.phase !== 'playing') return;
    SQ.processing = true;
    stopTimer();
    const a = SQ.articles[SQ.index];
    SQ.wrong.push({ article: a, user: null, ans: `${a.lawName}${a.articleNumber}条`, reason: 'スキップ' });
    // 全回答を記録
    SQ.allAnswers.push({ article: a, score: 0, isCorrect: false, reason: 'スキップ' });
    const fb = document.getElementById('sq-feedback');
    // スキップ時も入力欄に正解を表示
    const inp = document.getElementById('sq-input');
    if (inp) {
        inp.value = a.articleNumber;
    }
    // オーバーレイに正解をオレンジで表示
    const overlay = document.getElementById('sq-input-overlay');
    if (overlay) {
        overlay.textContent = a.articleNumber;
        overlay.style.color = '#f59e0b';
    }
    if (fb) fb.innerHTML = `<span style="color:#f59e0b;">スキップ</span>`;
    recordAnswer(a, false, 0);
    setTimeout(() => { SQ.processing = false; nextQ(); }, 800);
}

async function nextQ() {
    SQ.index++;
    if (SQ.index >= SQ.articles.length) { showResult(); return; }
    await displayQ();
}

async function displayQ() {
    const a = SQ.articles[SQ.index];
    SQ.answer = normalize(a.articleNumber);
    SQ.processing = false;
    SQ.fontSize = 1;
    const law = document.getElementById('sq-law');
    if (law) {
        const lawColor = getLawColor(a.lawName);
        law.textContent = a.lawName;
        law.style.background = lawColor.bg;
        law.style.color = lawColor.text;
    }
    const qnum = document.getElementById('sq-qnum');
    if (qnum) qnum.textContent = SQ.index + 1;
    const txt = document.getElementById('sq-article-text');
    if (txt) txt.innerHTML = '<span style="color:#6366f1;">条文を読み込み中...</span>';
    const inp = document.getElementById('sq-input');
    const labelDai = document.getElementById('sq-label-dai');
    const labelJou = document.getElementById('sq-label-jou');
    const overlay = document.getElementById('sq-input-overlay');
    if (inp) {
        inp.value = '';
        inp.classList.remove('ok', 'ng');
        inp.style.fontSize = '5rem'; // 初期サイズにリセット
        inp.disabled = false; // 入力ロックを解除
        inp.style.opacity = '1';
        setTimeout(() => inp.focus(), 100);
    }
    // オーバーレイをリセット
    if (overlay) {
        overlay.textContent = '';
        overlay.style.color = '#10b981'; // 緑色に戻す
        overlay.style.fontSize = '5rem'; // 初期サイズにリセット
    }
    // ラベルも初期サイズにリセット
    if (labelDai) labelDai.style.fontSize = '2.5rem';
    if (labelJou) labelJou.style.fontSize = '2.5rem';
    const fb = document.getElementById('sq-feedback');
    if (fb) fb.innerHTML = '';
    try {
        const c = await fetchContent(a);
        const h = hideAnswer(c, a);
        if (txt) txt.innerHTML = h.replace(/（（([^）]+)））/g, '<strong style="color:#6366f1;">$1</strong>').replace(/\n/g, '<br>');
    } catch { if (txt) txt.innerHTML = '<span style="color:#ef4444;">条文読込失敗</span>'; }
    startTimer();
}

// ═══════════════════════════════════════════════════════════════════════════
// 画面遷移
// ═══════════════════════════════════════════════════════════════════════════
function goBack() {
    disposeSpeedQuizInstance();
    if (SQ.returnUrl) {
        window.location.hash = SQ.returnUrl;
    } else {
        window.location.hash = '#/';
    }
}

// フィルタ適用後の問題数を取得
function getFilteredArticles() {
    let articles = [...(window.speedQuizArticles || SQ.articles)];

    // homePage.jsの共通フィルター設定を取得
    const settings = getSpeedFilterSettings();

    // 法令名フィルタ
    if (settings.selectedLaws?.length > 0) {
        articles = articles.filter(a => settings.selectedLaws.some(l => a.lawName?.includes(l)));
    }

    // 出題数制限
    if (settings.questionCount && settings.questionCount !== 'all') {
        const count = parseInt(settings.questionCount) || 20;
        articles = shuffle(articles).slice(0, count);
    }

    return articles;
}

function showMenu() {
    SQ.phase = 'menu';
    stopTimer();
    removeKeyHandler();
    SQ.container.innerHTML = renderMenu(SQ.articles.length);

    // 履歴を読み込んで表示
    loadAndDisplayHistory();

    // homePage.jsの共通フィルターハンドラを適用
    const filterPanel = document.getElementById('sq-filter-panel');
    if (filterPanel) {
        attachSpeedFilterHandlers(filterPanel, {
            onApply: () => {
                SQ.articles = getFilteredArticles();
                if (SQ.articles.length === 0) {
                    alert('条件に一致する問題がありません。');
                    return;
                }
                startGame();
            },
            onReset: () => {
                console.log('フィルターリセット');
            }
        });
    }

    // R2同期ボタン
    document.getElementById('sq-sync-r2-btn')?.addEventListener('click', syncToR2);

    document.getElementById('sq-back')?.addEventListener('click', goBack);
}

// R2にローカルデータを同期
async function syncToR2() {
    const btn = document.getElementById('sq-sync-r2-btn');
    if (!btn) return;

    const originalText = btn.textContent;
    btn.textContent = '同期中...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/quiz-results/sync-to-r2', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            btn.textContent = `✅ ${data.count}件同期完了`;
            // 履歴を再読み込み
            setTimeout(() => {
                loadAndDisplayHistory();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        } else {
            btn.textContent = `❌ ${data.error || '同期失敗'}`;
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('同期エラー:', error);
        btn.textContent = '❌ エラー';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

// 履歴を読み込んで表示
async function loadAndDisplayHistory() {
    const container = document.getElementById('sq-history-container');
    if (!container) return;

    try {
        const res = await fetch('/api/quiz-results');
        if (!res.ok) throw new Error('履歴取得失敗');

        const allResults = await res.json();

        // 日付でソート（新しい順）
        const sortedDates = Object.keys(allResults).sort((a, b) => b.localeCompare(a));

        if (sortedDates.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">まだ記録がありません</p>';
            return;
        }

        // 最新7日分の履歴を表示
        let html = '';
        let totalItems = 0;
        const maxItems = 30; // 最大表示件数

        for (const date of sortedDates.slice(0, 7)) {
            const dayResults = allResults[date];
            if (!Array.isArray(dayResults) || dayResults.length === 0) continue;

            // 日付ヘッダー
            const dateFormatted = formatDate(date);

            // 条文ごとにグループ化して平均点を計算
            const articleStats = {};
            dayResults.forEach(r => {
                const key = r.articleNumber;
                if (!articleStats[key]) {
                    articleStats[key] = { scores: [], lawName: r.articleNumber };
                }
                articleStats[key].scores.push(r.score);
            });

            // 平均点でソート（高い順）
            const sortedArticles = Object.entries(articleStats)
                .map(([key, data]) => ({
                    articleNumber: key,
                    avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
                    count: data.scores.length
                }))
                .sort((a, b) => b.avgScore - a.avgScore);

            html += `<div style="margin-bottom:1rem;">
                <div style="font-weight:bold;color:#a78bfa;margin-bottom:0.5rem;">${dateFormatted}</div>
                <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">`;

            for (const item of sortedArticles) {
                if (totalItems >= maxItems) break;
                const rankIcon = item.avgScore >= 8 ? '◯' : item.avgScore >= 3 ? '△' : '✕';
                const rankColor = item.avgScore >= 8 ? '#10b981' : item.avgScore >= 3 ? '#fbbf24' : '#ef4444';
                html += `<span style="background:rgba(255,255,255,0.1);padding:0.3rem 0.6rem;border-radius:0.5rem;font-size:0.85rem;display:inline-flex;align-items:center;gap:0.3rem;">
                    <span style="color:${rankColor};">${rankIcon}</span>
                    <span>${item.articleNumber}</span>
                    <span style="color:rgba(255,255,255,0.5);font-size:0.75rem;">${item.avgScore.toFixed(1)}点</span>
                </span>`;
                totalItems++;
            }

            html += '</div></div>';
            if (totalItems >= maxItems) break;
        }

        container.innerHTML = html || '<p style="text-align:center;color:rgba(255,255,255,0.5);">まだ記録がありません</p>';

    } catch (error) {
        console.warn('履歴読み込みエラー:', error);
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">履歴を読み込めませんでした</p>';
    }
}

// 日付フォーマット
function formatDate(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return '今日';
    if (dateStr === yesterday) return '昨日';

    const [year, month, day] = dateStr.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
}

async function startGame() {
    SQ.phase = 'playing';
    SQ.index = 0;
    SQ.score = 0;
    SQ.correct = 0;
    SQ.wrong = [];
    SQ.allAnswers = []; // 全回答を記録
    SQ.articles = shuffle(SQ.articles);
    SQ.processing = false;
    SQ.fontSize = 1;
    SQ.container.innerHTML = renderGame();
    const inp = document.getElementById('sq-input');
    if (inp) {
        inp.addEventListener('input', handleInput);
        inp.addEventListener('keydown', e => { if (e.key === 'Backspace' || e.key === 'Delete') e.preventDefault(); });
    }
    document.getElementById('sq-pause')?.addEventListener('click', pauseGame);
    document.getElementById('sq-skip')?.addEventListener('click', handleSkip);
    document.getElementById('sq-quit')?.addEventListener('click', quitGame);
    document.getElementById('sq-back')?.addEventListener('click', goBack);
    setupKeyHandler();
    await displayQ();
}

function setupKeyHandler() {
    removeKeyHandler();
    SQ.keyHandler = e => {
        if (SQ.phase !== 'playing' || SQ.processing) return;
        const inp = document.getElementById('sq-input');
        if (!inp) return;
        if (/^[0-9０-９のノ]$/.test(e.key) && document.activeElement !== inp) inp.focus();
    };
    document.addEventListener('keydown', SQ.keyHandler);
}

function removeKeyHandler() {
    if (SQ.keyHandler) { document.removeEventListener('keydown', SQ.keyHandler); SQ.keyHandler = null; }
}

function pauseGame() {
    if (SQ.phase !== 'playing') return;
    SQ.phase = 'paused';
    SQ.pausedAt = performance.now(); // ポーズした時刻を記録
    stopTimer();
    const o = document.createElement('div');
    o.innerHTML = renderPause();
    SQ.container.appendChild(o.firstElementChild);
    document.getElementById('sq-resume')?.addEventListener('click', resumeGame);
}

function resumeGame() {
    SQ.phase = 'playing';
    document.getElementById('sq-pause-overlay')?.remove();

    // ポーズしていた時間分、timerStartを補正
    if (SQ.pausedAt) {
        const pausedDuration = performance.now() - SQ.pausedAt;
        SQ.timerStart += pausedDuration;
    }

    // タイマー再開
    SQ.timer = setInterval(() => {
        SQ.timeLeft--;
        updateTimer(); // ★ 残り時間表示を更新
        if (SQ.timeLeft <= 0) handleTimeout();
    }, 1000);

    // アニメーション再開
    function animateFontSize() {
        if (SQ.phase !== 'playing' || SQ.processing) return;
        const elapsed = (performance.now() - SQ.timerStart) / 1000;
        const progress = Math.min(elapsed / SQ.timeLimit, 1);
        updateTimerSmooth(progress);
        if (progress < 1) {
            SQ.tickHandler = requestAnimationFrame(animateFontSize);
        }
    }
    SQ.tickHandler = requestAnimationFrame(animateFontSize);

    document.getElementById('sq-input')?.focus();
}

function quitGame() {
    if (confirm('ゲームを終了しますか？')) showResult();
}

function showResult() {
    stopTimer();
    SQ.phase = 'result';
    removeKeyHandler();
    SQ.container.innerHTML = renderResult();
    // 平均点が8点以上ならconfetti
    const total = SQ.articles.length;
    const avgScore = total > 0 ? SQ.score / total : 0;
    if (avgScore >= 8) setTimeout(confetti, 300);
    document.getElementById('sq-retry')?.addEventListener('click', startGame);
    document.getElementById('sq-menu')?.addEventListener('click', showMenu);
    document.getElementById('sq-back')?.addEventListener('click', goBack);

    // 条文ボタンのイベントハンドラ
    document.querySelectorAll('.sq-article-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const idx = parseInt(e.target.dataset.idx);
            const item = SQ.allAnswers[idx];
            if (item && item.article) {
                await showArticleModal(item.article);
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 公開API（エクスポート）
// ═══════════════════════════════════════════════════════════════════════════
export async function initializeSpeedQuizGame(containerId, caseData, preserveExisting = false, options = {}) {
    console.log('🎮 スピード条文ゲーム v3.0 初期化');
    if (!document.getElementById('sq-styles-v3')) document.head.insertAdjacentHTML('beforeend', SQ_STYLES);
    const container = document.getElementById(containerId);
    if (!container) { console.error('❌ コンテナなし:', containerId); return; }
    SQ.container = container;
    SQ.returnUrl = options.returnUrl || null;
    SQ.timeLimit = options.timeLimit || 10;

    if (options.articles?.length > 0) {
        SQ.articles = [...options.articles];
    } else if (preserveExisting && window.speedQuizArticles?.length > 0) {
        SQ.articles = [...window.speedQuizArticles];
    } else if (caseData) {
        SQ.articles = await extractAllArticles(caseData);
    } else {
        SQ.articles = [];
    }
    window.speedQuizArticles = SQ.articles;

    if (SQ.articles.length === 0) {
        container.innerHTML = `<div class="sq-fs sq-bg-menu sq-flex sq-center"><div class="sq-card sq-text-center" style="max-width:400px;"><p class="sq-text-white sq-text-2xl sq-mb-4">⚠️ 条文なし</p><p class="sq-text-gray sq-text-lg">このモジュールには条文参照がありません。</p><button class="sq-back" id="sq-back">← 戻る</button></div></div>`;
        document.getElementById('sq-back')?.addEventListener('click', goBack);
        return;
    }
    showMenu();
    console.log('✅ 初期化完了:', SQ.articles.length, '問');
}

export async function startSpeedQuiz() {
    if (SQ.container && SQ.articles.length > 0) await startGame();
}

export async function startFilteredSpeedQuiz(settings) {
    console.log('🎯 フィルタ付きクイズ:', settings);
    let arts = [...(window.speedQuizArticles || [])];
    if (settings.selectedLaws?.length > 0) arts = arts.filter(a => settings.selectedLaws.some(l => a.lawName?.includes(l)));
    if (settings.questionCount && settings.questionCount !== 'all') arts = shuffle(arts).slice(0, parseInt(settings.questionCount) || 10);
    if (arts.length === 0) { alert('条件に一致する問題がありません。'); return; }
    SQ.articles = arts;
    SQ.timeLimit = settings.timeLimit || 10;
    if (SQ.container) await startGame();
}

export function getWeakArticles(threshold = 60, minAnswered = 2) { return []; }
export function getLawStatistics() { return {}; }
export async function fetchArticleContentOnDemand(a) { return await fetchContent(a); }

export function disposeSpeedQuizInstance(options = {}) {
    stopTimer();
    removeKeyHandler();
    SQ.phase = 'idle';
    // フルスクリーンコンテナを削除
    if (SQ.container) {
        SQ.container.innerHTML = '';
        // body直下に追加されたコンテナなら削除
        if (SQ.container.id === 'sq-fullscreen-container') {
            SQ.container.remove();
        }
    }
    SQ.container = null;
    SQ.articles = [];
    SQ.wrong = [];
    SQ.fontSize = 1;
}

console.log('⚡ スピード条文ゲーム v3.0 ロード完了');

