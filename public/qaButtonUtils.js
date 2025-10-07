// qaButtonUtils.js - Q&Aボタン表示の共通ユーティリティ

import { getRankColor } from './rankColors.js';

const DEFAULT_RANK_LETTER = 'N';
const BADGE_CLASS = 'inline-block text-sm font-bold px-1 py-0.5 rounded-full border mr-0.5';

function normalizeRankLetter(rawRank) {
    const cleaned = (rawRank ?? '').toString().replace(/ランク$/,'').replace(/\s/g,'').toUpperCase();
    if (!cleaned) return DEFAULT_RANK_LETTER;
    // 先頭の英字1文字を採用（安全策）
    const match = cleaned.match(/[A-Z]/);
    return match ? match[0] : DEFAULT_RANK_LETTER;
}

function buildRankBadge(rankLetter, colors) {
    return `<span class="${BADGE_CLASS}" style="color: ${colors.color}; background-color: ${colors.bgColor}; border-color: ${colors.borderColor};">${rankLetter}</span>`;
}

function truncateQuestion(questionText = '', maxLength = 50) {
    if (!questionText) return '';
    const text = String(questionText);
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

/**
 * Q&Aボタンに表示する内容を構築
 * @param {Object} params
 * @param {Object} params.qaItem - Q&Aデータ
 * @param {number|string} params.fallbackNumber - IDが無い場合のフォールバック番号
 * @param {number} [params.snippetLength=50] - タイトル用スニペット長
 * @returns {{ number: string|number, rankLetter: string, colors: Object, badgeHTML: string, title: string }}
 */
export function buildQAButtonPresentation({ qaItem, fallbackNumber, snippetLength = 50 } = {}) {
    const number = qaItem?.id ?? fallbackNumber ?? '?';
    const rankLetter = normalizeRankLetter(qaItem?.rank);
    const colors = getRankColor(rankLetter);
    const badgeHTML = `${buildRankBadge(rankLetter, colors)}${number}`;
    const questionSnippet = truncateQuestion(qaItem?.question, snippetLength);
    const title = questionSnippet ? `Q${number}: ${questionSnippet}` : `Q${number}`;
    return { number, rankLetter, colors, badgeHTML, title };
}

/**
 * Q&AリストからIDまたはインデックスに対応する項目を特定
 * @param {Array} qaList
 * @param {string|number} qId
 * @param {number} qIndex
 * @returns {{ qaItem: Object|null, qaIndex: number, qaNumber: string|number|null }}
 */
export function resolveQAReference(qaList = [], qId, qIndex) {
    let qaIndex = -1;
    let qaItem = null;

    if (qId != null) {
        qaIndex = qaList.findIndex(q => String(q.id) === String(qId));
        if (qaIndex >= 0) {
            qaItem = qaList[qaIndex];
        }
    }

    if (!qaItem && typeof qIndex === 'number' && qaList[qIndex]) {
        qaItem = qaList[qIndex];
        qaIndex = qIndex;
    }

    const qaNumber = qaItem?.id ?? (qId != null ? qId : (typeof qIndex === 'number' ? qIndex : null));

    return { qaItem, qaIndex, qaNumber };
}

export { normalizeRankLetter };
