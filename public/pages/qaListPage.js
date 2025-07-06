// qaListPage.js - 全モジュール横断Q&Aリストページ
import { caseSummaries, caseLoaders } from '../cases/index.js';
import { processArticleReferences, processBlankFillText } from '../articleProcessor.js';

const RANK_CONFIG = {
    'S': { text: 'text-cyan-700', bg: 'bg-cyan-100', border: 'border-cyan-400' },
    'A': { text: 'text-red-700', bg: 'bg-red-100', border: 'border-red-400' },
    'B': { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-400' },
    'C': { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-400' }
};

export async function renderQaListPage() {
    document.title = 'Q&A一覧 - あたしンちの世界へGO！';
    const app = document.getElementById('app');
    app.innerHTML = '<div class="text-center p-12"><div class="loader">読み込み中...</div></div>';

    // 全モジュールのQ&Aを集約
    const allQAs = [];
    for (const summary of caseSummaries) {
        try {
            const loader = caseLoaders[summary.id];
            if (!loader) continue;
            const mod = await loader();
            const caseData = mod.default;
            (caseData.questionsAndAnswers || []).forEach(qa => {
                allQAs.push({
                    ...qa,
                    moduleId: summary.id,
                    moduleTitle: summary.title,
                    category: summary.category
                });
            });
        } catch (e) { /* skip error */ }
    }
    // 番号順ソート
    allQAs.sort((a, b) => (a.id || 0) - (b.id || 0));
    // ランク種別抽出
    const ranks = Array.from(new Set(allQAs.map(q => q.rank))).filter(Boolean);
    // モジュール種別抽出
    const modules = Array.from(new Set(allQAs.map(q => q.moduleId)));
    // フィルタUI
    let filterHtml = `<div class="mb-4 flex gap-2 flex-wrap justify-center">`
        + `<span class="font-bold">ランク:</span>`
        + `<button class="qa-rank-filter-btn px-3 py-1 rounded border font-bold bg-gray-100 text-gray-700" data-rank="all">全て</button>`
        + ranks.map(r => `<button class="qa-rank-filter-btn px-3 py-1 rounded border font-bold ${RANK_CONFIG[r]?.bg || ''} ${RANK_CONFIG[r]?.text || ''}" data-rank="${r}">${r}</button>`).join('')
        + `<span class="ml-8 font-bold">モジュール:</span>`
        + `<button class="qa-module-filter-btn px-3 py-1 rounded border font-bold bg-gray-100 text-gray-700" data-module="all">全て</button>`
        + modules.map(m => `<button class="qa-module-filter-btn px-3 py-1 rounded border font-bold bg-blue-50 text-blue-800" data-module="${m}">${m}</button>`).join('')
        + `</div>`;
    // Q&Aリスト
    let qaListHtml = `<div class="space-y-6">`;
    allQAs.forEach((qa, i) => {
        const rank = qa.rank || '';
        const rankBadge = `<span class="inline-block px-2 py-0.5 rounded text-xs font-bold border mr-2 ${RANK_CONFIG[rank]?.bg || ''} ${RANK_CONFIG[rank]?.text || ''} ${RANK_CONFIG[rank]?.border || ''}">${rank}</span>`;
        const question = processArticleReferences(qa.question);
        const answer = processBlankFillText(processArticleReferences(qa.answer), `qa-list-${i}`);
        qaListHtml += `<div class="p-4 bg-white rounded-lg shadow border flex flex-col gap-2 qa-item" data-rank="${rank}" data-module="${qa.moduleId}">
            <div class="flex items-center gap-2">${rankBadge}<span class="font-bold">Q${qa.id}.</span> <span>${question}</span> <span class="ml-4 text-xs text-gray-500">[${qa.moduleTitle}]</span></div>
            <div class="ml-8"><span class="font-bold">答：</span>${answer}</div>
        </div>`;
    });
    qaListHtml += `</div>`;
    app.innerHTML = `<div class="max-w-4xl mx-auto p-6">
        <h2 class="text-2xl font-bold mb-6 text-center">全Q&A横断リスト</h2>
        ${filterHtml}
        ${qaListHtml}
    </div>`;
    // 絞り込みイベント
    app.querySelectorAll('.qa-rank-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rank = this.dataset.rank;
            app.querySelectorAll('.qa-rank-filter-btn').forEach(b => b.classList.remove('ring-2', 'ring-yellow-400'));
            this.classList.add('ring-2', 'ring-yellow-400');
            app.querySelectorAll('.qa-item').forEach(item => {
                if (rank === 'all' || item.dataset.rank === rank) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    app.querySelectorAll('.qa-module-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mod = this.dataset.module;
            app.querySelectorAll('.qa-module-filter-btn').forEach(b => b.classList.remove('ring-2', 'ring-yellow-400'));
            this.classList.add('ring-2', 'ring-yellow-400');
            app.querySelectorAll('.qa-item').forEach(item => {
                if (mod === 'all' || item.dataset.module === mod) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}
