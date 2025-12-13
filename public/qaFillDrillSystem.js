import { ApiService } from './apiService.js';
import { caseLoaders } from './cases/index.js';
import { characters } from './data/characters.js';
import { processArticleReferences, processQAReferences, setupArticleRefButtons } from './articleProcessor.js';

const LEVEL_PRESETS = {
    1: { title: 'Lv1・基礎力（単語）' },
    2: { title: 'Lv2・論理展開（短文）' },
    3: { title: 'Lv3・応用・記述（長文）' }
};

const containerState = new WeakMap();
const moduleCaseRegistry = new Map();

// ★★★ R2進捗キャッシュ ★★★
const r2ProgressCache = new Map(); // moduleId → { qaId: { cleared: [1,2], at: "2025-12-13" } }
let r2ProgressLoaded = false;

// R2から進捗を読み込み（ページ読み込み時に一度だけ呼ばれる）
async function loadR2Progress(moduleId = null) {
    try {
        const endpoint = moduleId
            ? `/api/fill-drill/progress?moduleId=${encodeURIComponent(moduleId)}`
            : '/api/fill-drill/progress';

        const res = await fetch(endpoint);
        if (!res.ok) return;

        const data = await res.json();
        if (data.progress) {
            if (moduleId) {
                r2ProgressCache.set(moduleId, data.progress);
                console.log(`☁️ R2からFillDrill進捗読み込み: ${moduleId} (${Object.keys(data.progress).length}件)`);
            } else {
                // 全モジュールの進捗
                Object.entries(data.progress).forEach(([modId, qaProgress]) => {
                    r2ProgressCache.set(modId, qaProgress);
                });
                console.log(`☁️ R2からFillDrill全進捗読み込み: ${r2ProgressCache.size}モジュール`);
            }
        }
        r2ProgressLoaded = true;
    } catch (error) {
        console.warn('⚠️ R2進捗読み込み失敗:', error.message);
    }
}

// R2キャッシュからfillDrillデータを取得
function getR2FillDrillData(moduleId, qaId) {
    const modProgress = r2ProgressCache.get(normalizeModuleId(moduleId));
    if (modProgress && modProgress[qaId]) {
        return modProgress[qaId];
    }
    return null;
}


function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value = '') {
    return escapeHtml(value).replace(/\n/g, '&#10;');
}

function normalizeModuleId(value = '') {
    return (value || '')
        .replace(/^#?\/case\//, '')
        .replace(/^public\/cases\//i, '')
        .replace(/\.js$/i, '')
        .replace(/^\.\//, '')
        .replace(/^\//, '')
        .trim();
}

function isSameModule(a = '', b = '') {
    return normalizeModuleId(a) === normalizeModuleId(b);
}


function getState(container) {
    return containerState.get(container) || {};
}

function setState(container, nextState) {
    containerState.set(container, nextState);
    return nextState;
}

function getRegisteredModule(moduleId) {
    const normalized = normalizeModuleId(moduleId);
    if (moduleCaseRegistry.has(normalized)) {
        return moduleCaseRegistry.get(normalized);
    }

    const cached = window.caseModules?.[normalized];
    if (cached) {
        const entry = {
            moduleId: normalized,
            relativePath: normalized,
            caseData: cached,
            qaList: Array.isArray(cached.questionsAndAnswers) ? cached.questionsAndAnswers : []
        };
        moduleCaseRegistry.set(normalized, entry);
        return entry;
    }
    return null;
}

function storeModuleCaseData(moduleId, caseData) {
    if (!moduleId || !caseData) return;
    const normalized = normalizeModuleId(moduleId);
    const entry = {
        moduleId: normalized,
        relativePath: normalized,
        caseData,
        qaList: Array.isArray(caseData.questionsAndAnswers) ? caseData.questionsAndAnswers : []
    };
    moduleCaseRegistry.set(normalized, entry);
}

async function ensureModuleEntry(moduleId) {
    if (!moduleId) return null;
    const normalized = normalizeModuleId(moduleId);
    const existing = getRegisteredModule(normalized);
    if (existing) return existing;

    const loaders = window.caseLoaders || caseLoaders;
    const loader = loaders?.[normalized];
    if (!loader) {
        console.warn('qaFillDrillSystem: loader not found for', normalized);
        return null;
    }

    try {
        const moduleResult = await loader();
        const caseData = moduleResult?.default || moduleResult?.caseData || null;
        if (!caseData) {
            console.warn('qaFillDrillSystem: module data missing for', normalized);
            return null;
        }
        window.caseModules = window.caseModules || {};
        window.caseModules[normalized] = caseData;
        storeModuleCaseData(normalized, caseData);
        return moduleCaseRegistry.get(normalized);
    } catch (error) {
        console.error('qaFillDrillSystem: failed to load module', normalized, error);
        return null;
    }
}

function getBlankValue(fillDrill, state, level, blankId) {
    const drafts = state.drafts?.[level] || {};
    const attemptAnswers = fillDrill.attempts?.[level]?.answers || {};
    if (Object.prototype.hasOwnProperty.call(drafts, blankId)) {
        return drafts[blankId];
    }
    if (Object.prototype.hasOwnProperty.call(attemptAnswers, blankId)) {
        return attemptAnswers[blankId];
    }
    return '';
}

function normalizeInlineSegments(template) {
    if (!template) return null;

    const text = template.text || '';
    const blanks = Array.isArray(template.blanks) ? template.blanks : [];

    // ★★★ 1. {{語句}}形式と【id:xxx】形式を検出してセグメントに変換（最優先） ★★★
    if (text && (text.includes('{{') || text.includes('【id:'))) {
        const segments = [];
        // {{語句}}と【id:xxx】を両方マッチ
        const combinedPattern = /(\{\{([^}]+)\}\})|(\u3010id:([^\u3011]+)\u3011)/g;
        let lastIndex = 0;
        let blankIndex = 0;
        let match;

        while ((match = combinedPattern.exec(text)) !== null) {
            // マッチ前のテキスト部分
            if (match.index > lastIndex) {
                segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
            }

            if (match[1]) {
                // {{語句}}形式 - 空欄
                const answer = match[2].trim();
                const blank = blanks[blankIndex] || {};
                segments.push({
                    type: 'blank',
                    id: blank.id || `B${blankIndex + 1}`,
                    label: blank.label || `(${blankIndex + 1})`,
                    placeholder: '',
                    answer: blank.answer || answer
                });
                blankIndex++;
            } else if (match[3]) {
                // 【id:xxx】形式 - Q&A参照
                const qaRef = match[4].trim();
                segments.push({
                    type: 'qaRef',
                    ref: qaRef
                });
            }
            lastIndex = match.index + match[0].length;
        }

        // 残りのテキスト部分
        if (lastIndex < text.length) {
            segments.push({ type: 'text', text: text.slice(lastIndex) });
        }

        if (segments.length > 0) {
            return segments;
        }
    }

    // ★★★ 2. ___形式を検出してセグメントに変換（後方互換） ★★★
    if (text && text.includes('___')) {
        const segments = [];
        let blankIndex = 0;

        // ___で分割
        const parts = text.split(/___/);

        for (let i = 0; i < parts.length; i++) {
            // テキスト部分
            if (parts[i]) {
                segments.push({ type: 'text', text: parts[i] });
            }

            // 空欄部分（最後の部分以外）
            if (i < parts.length - 1) {
                const blank = blanks[blankIndex] || {};
                segments.push({
                    type: 'blank',
                    id: blank.id || `B${blankIndex + 1}`,
                    label: blank.label || `(${blankIndex + 1})`,
                    placeholder: '',
                    answer: blank.answer || ''
                });
                blankIndex++;
            }
        }

        if (segments.length > 0) {
            return segments;
        }
    }

    // 従来の処理
    const inlineSource = template.inlineBody || template.inlineText || template.inlineSegments || template.body;
    if (!inlineSource) return null;

    const normalizeSegment = (segment) => {
        if (typeof segment === 'string') {
            return { type: 'text', text: segment };
        }
        const type = segment.type || (segment.id ? 'blank' : 'text');
        if (type === 'blank') {
            return {
                type: 'blank',
                id: segment.id,
                label: segment.label,
                placeholder: segment.placeholder,
                newline: segment.newline || false
            };
        }
        if (type === 'break' || type === 'linebreak') {
            return { type: 'break' };
        }
        return { type: 'text', text: segment.text || '' };
    };

    if (Array.isArray(inlineSource)) {
        return inlineSource.map(normalizeSegment);
    }

    if (typeof inlineSource === 'string') {
        const segments = [];
        const regex = /\[\[(B\d+)\]\]|【(B\d+)(?:[:：][^】]*)?】/g;
        let lastIndex = 0;
        let match;
        let blankCounter = 0;
        while ((match = regex.exec(inlineSource)) !== null) {
            const chunk = inlineSource.slice(lastIndex, match.index);
            if (chunk) {
                segments.push({ type: 'text', text: chunk });
            }
            blankCounter += 1;
            const id = match[1] || match[2];
            segments.push({ type: 'blank', id: id, label: `(${blankCounter})` });
            lastIndex = regex.lastIndex;
        }
        const tail = inlineSource.slice(lastIndex);
        if (tail) {
            segments.push({ type: 'text', text: tail });
        }
        return segments;
    }

    return null;
}

function buildFallbackInlineSegments(template) {
    const blanks = Array.isArray(template?.blanks) ? template.blanks : [];
    if (!blanks.length) return null;

    const segments = [];
    const intro = template.focus || template.summary || template.question || '';
    if (intro) {
        segments.push({ type: 'text', text: String(intro) });
        segments.push({ type: 'break' });
    }

    blanks.forEach((blank, index) => {
        const promptText = blank.prompt || blank.label || `空欄${blank.id}`;
        segments.push({ type: 'text', text: `${promptText.trim()}を、以下の空欄で一文にまとめましょう。` });
        segments.push({
            type: 'blank',
            id: blank.id,
            label: `(${index + 1})`,
            placeholder: blank.placeholder || blank.prompt || ''
        });
        if (blank.hint) {
            segments.push({ type: 'text', text: `ヒント: ${blank.hint}` });
        }
        segments.push({ type: 'break' });
    });

    return segments;
}

let inlineMeasureSpan = null;

function ensureInlineMeasureSpan() {
    if (typeof document === 'undefined') return null;
    if (!inlineMeasureSpan) {
        inlineMeasureSpan = document.createElement('span');
        inlineMeasureSpan.className = 'qa-inline-measure';
        inlineMeasureSpan.style.position = 'absolute';
        inlineMeasureSpan.style.top = '-9999px';
        inlineMeasureSpan.style.left = '-9999px';
        inlineMeasureSpan.style.whiteSpace = 'pre';
        inlineMeasureSpan.style.visibility = 'hidden';
        inlineMeasureSpan.style.pointerEvents = 'none';
        document.body.appendChild(inlineMeasureSpan);
    }
    return inlineMeasureSpan;
}

function autoResizeInlineInput(input) {
    if (!(input instanceof HTMLElement) || typeof window === 'undefined') {
        return;
    }
    if (input.dataset?.autoResize === 'false') {
        return;
    }
    const measureSpan = ensureInlineMeasureSpan();
    if (!measureSpan) return;
    const computed = window.getComputedStyle(input);
    measureSpan.style.font = computed.font;
    measureSpan.style.fontSize = computed.fontSize;
    measureSpan.style.fontFamily = computed.fontFamily;
    measureSpan.style.fontWeight = computed.fontWeight;
    measureSpan.style.letterSpacing = computed.letterSpacing;
    measureSpan.style.padding = computed.padding;
    const content = (input.value || input.placeholder || '') + '  ';
    measureSpan.textContent = content;
    const measuredWidth = measureSpan.getBoundingClientRect().width;
    const minWidth = Number(input.dataset.minWidth) || 120;
    const maxWidth = Number(input.dataset.maxWidth) || 420;
    const nextWidth = Math.min(maxWidth, Math.max(minWidth, Math.ceil(measuredWidth)));
    input.style.width = `${nextWidth}px`;
}

function syncInlineInputWidths(container, level = null) {
    if (!(container instanceof HTMLElement)) return;
    const selector = level === null
        ? '.inline-blank-input[data-auto-resize="true"]'
        : `.inline-blank-input[data-auto-resize="true"][data-level="${level}"]`;
    const inputs = container.querySelectorAll(selector);
    inputs.forEach(autoResizeInlineInput);
}

function scheduleInlineInputResize(container, level = null) {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => syncInlineInputWidths(container, level));
}

const CHARACTER_NAME_INDEX = new Map();

function registerCharacterKey(key, character) {
    if (!key || !character) return;
    CHARACTER_NAME_INDEX.set(key, character);
    CHARACTER_NAME_INDEX.set(key.toLowerCase(), character);
}

if (Array.isArray(characters)) {
    characters.forEach(character => {
        registerCharacterKey(character.name, character);
        registerCharacterKey(character.baseName, character);
        (character.aliases || []).forEach(alias => registerCharacterKey(alias, character));
    });
}

function normalizeSpeakerLabel(rawName = '') {
    return String(rawName || '').replace(/[【】]/g, '').trim();
}

function resolveCharacterBySpeaker(rawName = '') {
    const label = normalizeSpeakerLabel(rawName);
    if (!label) return null;
    return CHARACTER_NAME_INDEX.get(label) || CHARACTER_NAME_INDEX.get(label.toLowerCase()) || null;
}

function buildCharacterAvatar({ speaker = '', expression = 'normal', size = 'md' } = {}) {
    const resolved = resolveCharacterBySpeaker(speaker);
    // speakerが指定されていればそれを使用、なければ「添削」（キャラクター名優先）
    const displayName = resolved?.name || normalizeSpeakerLabel(speaker) || speaker || '';
    const baseName = resolved?.baseName;
    const availableExpressions = resolved?.availableExpressions || [];

    // 日本語表情→英語表情の変換マップ
    const jpToEnExpression = {
        '笑顔': 'happy', '嬉しい': 'happy', 'うれしい': 'happy',
        '悲しい': 'sad', 'かなしい': 'sad',
        '考え中': 'thinking', '考える': 'thinking', '思考': 'thinking',
        '怒り': 'angry', 'おこり': 'angry', '怒る': 'angry',
        '驚き': 'surprised', 'おどろき': 'surprised',
        '笑い': 'laughing', '大笑い': 'laughing',
        '得意': 'smug', '得意げ': 'smug',
        'イライラ': 'annoyed', 'いらいら': 'annoyed',
        '真剣': 'serious', 'まじめ': 'serious',
        '興奮': 'excited', 'わくわく': 'excited',
        '感心': 'impressed', 'かんしん': 'impressed',
        '普通': 'normal', '通常': 'normal'
    };

    // 表情を英語に正規化
    let normalizedExpression = expression || 'normal';
    if (jpToEnExpression[normalizedExpression]) {
        normalizedExpression = jpToEnExpression[normalizedExpression];
    }
    if (!availableExpressions.includes(normalizedExpression)) {
        normalizedExpression = 'normal';
    }

    const sizeClass = size === 'lg' ? 'qa-character-avatar--lg'
        : size === 'sm' ? 'qa-character-avatar--sm'
            : 'qa-character-avatar--md';
    let markup = '';
    if (baseName) {
        const primarySrc = `/images/${baseName}_${normalizedExpression}.png`;
        const fallbackSrc = normalizedExpression === 'normal' ? '' : `/images/${baseName}_normal.png`;
        const altText = `${displayName} (${normalizedExpression})`;
        const fallbackAttr = fallbackSrc ? ` data-fallback="${fallbackSrc}"` : '';
        markup = `
            <img src="${primarySrc}" alt="${escapeHtml(altText)}" class="qa-character-avatar__img"${fallbackAttr}
                onerror="if(!this.dataset.fallbackTried && this.dataset.fallback){this.dataset.fallbackTried='true';this.src=this.dataset.fallback;}else{this.style.display='none';}">`;
    } else {
        const initials = displayName.slice(-2) || 'AI';
        markup = `<span class="qa-character-avatar__fallback">${escapeHtml(initials)}</span>`;
    }
    return {
        markup: `<div class="qa-character-avatar ${sizeClass}" title="${escapeHtml(displayName)}">${markup}</div>`,
        displayName
    };
}

function escapeRegExpLite(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLawReferenceCandidates() {
    if (typeof window !== 'undefined') {
        if (Array.isArray(window.SUPPORTED_LAWS) && window.SUPPORTED_LAWS.length > 0) {
            return window.SUPPORTED_LAWS;
        }
        if (window.LAW_SETTINGS && typeof window.LAW_SETTINGS === 'object') {
            return Object.keys(window.LAW_SETTINGS);
        }
    }
    return ['民法', '刑法', '刑事訴訟法', '刑事訴訟規則', '民事訴訟法', '憲法', '日本国憲法', '行政法', '会社法', '商法'];
}

function isInsideLawBrackets(source = '', startIndex = 0) {
    const lastOpen = source.lastIndexOf('【', startIndex);
    const lastClose = source.lastIndexOf('】', startIndex);
    return lastOpen !== -1 && lastOpen > lastClose;
}

function autoWrapLooseLawRefs(rawValue = '') {
    if (!rawValue) return '';
    const candidates = getLawReferenceCandidates();
    if (!candidates.length) return rawValue;
    const escaped = candidates
        .map(name => escapeRegExpLite(name))
        .sort((a, b) => b.length - a.length)
        .join('|');
    if (!escaped) return rawValue;
    const digitClass = '0-9０-９';
    // 第はあってもなくてもマッチするように修正
    const articlePattern = `[${digitClass}]+(?:の[${digitClass}]+)?条(?:の[${digitClass}]+)?(?:(?:第)?[${digitClass}]+項)?(?:(?:第)?[${digitClass}]+号)?`;
    const regex = new RegExp(`(${escaped})\\s*(?:第)?${articlePattern}`, 'g');
    return rawValue.replace(regex, (match, _lawName, offset, source) => {
        if (isInsideLawBrackets(source, offset)) {
            return match;
        }
        const normalized = match.replace(/\s+/g, '');
        return `【${normalized}】`;
    });
}

function renderArticleRichText(value = '') {
    if (!value) return '';
    try {
        const normalized = autoWrapLooseLawRefs(String(value));
        return processArticleReferences(escapeHtml(normalized));
    } catch (error) {
        console.warn('qaFillDrillSystem: law text processing failed', error);
        return escapeHtml(String(value));
    }
}

function extractFeedbackSpeaker(feedback = '', explicitSpeaker = '') {
    const result = {
        speaker: explicitSpeaker || '',
        expression: 'normal',
        message: String(feedback || '')
    };
    if (!result.message) {
        return result;
    }

    // パターン1: 【キャラクター名】形式
    const bracketMatch = result.message.match(/^【([^】]+)】\s*/);
    if (bracketMatch) {
        result.speaker = bracketMatch[1] || result.speaker;
        result.message = result.message.slice(bracketMatch[0].length);
        return result;
    }

    // パターン2: キャラクター名@表情: メッセージ 形式
    const atMatch = result.message.match(/^([^@:]+)@([^:]+):\s*/);
    if (atMatch) {
        result.speaker = atMatch[1]?.trim() || result.speaker;
        result.expression = atMatch[2]?.trim() || 'normal';
        result.message = result.message.slice(atMatch[0].length);
        return result;
    }

    // パターン3: キャラクター名: メッセージ 形式
    const colonMatch = result.message.match(/^([^:]{1,20}):\s*/);
    if (colonMatch && !colonMatch[1].includes('。') && !colonMatch[1].includes('、')) {
        result.speaker = colonMatch[1]?.trim() || result.speaker;
        result.message = result.message.slice(colonMatch[0].length);
        return result;
    }

    return result;
}

function renderThinkingIndicator({ isGenerating = false, isGrading = false, message = '' } = {}) {
    if (!isGenerating && !isGrading) return '';
    const mode = isGenerating ? 'generate' : 'grade';
    const fallbackMessage = isGenerating
        ? 'AIがテンプレートを考えています…'
        : 'AIが答案を採点しています…';
    const label = message || fallbackMessage;
    return `
        <div class="qa-ai-thinking" data-mode="${mode}" role="status" aria-live="polite">
            <span class="qa-ai-thinking__pulse"></span>
            <span class="qa-ai-thinking__dots">
                <span></span><span></span><span></span>
            </span>
            <span class="qa-ai-thinking__text">${escapeHtml(label)}</span>
        </div>
    `;
}

const RESULT_SYMBOL_META = {
    circle: {
        icon: '○',
        label: '正解',
        className: 'qa-blank-result--circle'
    },
    triangle: {
        icon: '△',
        label: '要調整',
        className: 'qa-blank-result--triangle'
    },
    cross: {
        icon: '×',
        label: '誤答',
        className: 'qa-blank-result--cross'
    }
};

function extractCanonicalBlanksFromAnswer(answerText = '') {
    const matches = Array.from(String(answerText || '').matchAll(/\{\{\s*([^}]+?)\s*\}\}/g));
    return matches.map((match, index) => ({
        id: `B${index + 1}`,
        answer: match[1]?.trim() || '',
        raw: match[0]
    }));
}

function ensureTemplateCoverage(template, qa) {
    if (!template) return template;

    // ★★★ {{語句}}形式がtextに含まれる場合、古いinlineBodyをクリアして再計算 ★★★
    if (template.text && (template.text.includes('{{') || template.text.includes('【id:'))) {
        delete template.inlineBody;
        delete template.inlineText;
        delete template.inlineSegments;
    }

    const canonicalFromTemplate = Array.isArray(template.canonicalBlanks) && template.canonicalBlanks.length > 0
        ? template.canonicalBlanks
        : extractCanonicalBlanksFromAnswer(qa?.answer || template?.canonicalAnswer || '');
    template.canonicalBlanks = canonicalFromTemplate;

    const canonicalById = new Map(
        canonicalFromTemplate.map(blank => [String(blank.id), { ...blank }])
    );

    let blanks = Array.isArray(template.blanks)
        ? template.blanks.map(blank => ({ ...blank }))
        : [];

    if (!blanks.length && canonicalFromTemplate.length) {
        blanks = canonicalFromTemplate.map(blank => ({
            id: blank.id,
            prompt: blank.prompt || `空欄${blank.id}`,
            answer: blank.answer || '',
            placeholder: blank.placeholder || ''
        }));
    }

    const blankMap = new Map(
        blanks.filter(blank => blank?.id).map(blank => [String(blank.id), { ...blank }])
    );

    const rawSegments = normalizeInlineSegments(template);
    const normalizedSegments = Array.isArray(rawSegments)
        ? rawSegments.filter(Boolean)
        : [];
    const inlineBlankIds = new Set(
        normalizedSegments
            .filter(segment => segment?.type === 'blank' && segment.id)
            .map(segment => String(segment.id))
    );

    inlineBlankIds.forEach(blankId => {
        const canonical = canonicalById.get(blankId) || {};
        if (!blankMap.has(blankId)) {
            blankMap.set(blankId, {
                id: blankId,
                prompt: canonical.prompt || `空欄${blankId}`,
                answer: canonical.answer || '',
                placeholder: canonical.placeholder || ''
            });
        } else {
            const entry = blankMap.get(blankId) || {};
            entry.prompt = entry.prompt || canonical.prompt || `空欄${blankId}`;
            entry.answer = entry.answer || canonical.answer || '';
            entry.placeholder = entry.placeholder || canonical.placeholder || '';
            blankMap.set(blankId, entry);
        }
    });

    if (inlineBlankIds.size > 0) {
        const ordered = [];
        inlineBlankIds.forEach(blankId => {
            const entry = blankMap.get(blankId);
            if (entry) {
                ordered.push(entry);
            }
        });
        template.blanks = ordered;
    } else {
        template.blanks = Array.from(blankMap.values());
    }
    template.inlineBody = normalizedSegments;
    return template;
}

function buildBlankEvaluationMap(fillDrill, level) {
    const attempt = fillDrill?.attempts?.[level];
    const blanks = Array.isArray(attempt?.evaluation?.blanks) ? attempt.evaluation.blanks : [];
    return new Map(blanks.map(item => [String(item.id), item]));
}

function normalizeScore(rawScore, passed = false) {
    if (typeof rawScore !== 'number') {
        return passed ? 100 : 0;
    }
    return rawScore <= 1 ? rawScore * 100 : rawScore;
}

function determineBlankSymbol(blankEvaluation) {
    if (!blankEvaluation) return null;

    // resultフィールドを優先的にチェック（○△☓）
    const result = blankEvaluation.result;
    if (result) {
        if (result === '○' || result === '◯' || result.toLowerCase() === 'circle' || result === '正解') return 'circle';
        if (result === '△' || result.toLowerCase() === 'triangle' || result === '惜しい') return 'triangle';
        if (result === '☓' || result === '✕' || result === '×' || result.toLowerCase() === 'cross' || result === '不正解') return 'cross';
    }

    // フォールバック: scoreベースの判定
    const score = normalizeScore(blankEvaluation.score, blankEvaluation.passed);
    if (score >= 90) return 'circle';
    if (score >= 60) return 'triangle';
    return 'cross';
}

function renderBlankResultIndicator(blankEvaluation) {
    if (!blankEvaluation) return '';
    const symbol = determineBlankSymbol(blankEvaluation);
    if (!symbol || !RESULT_SYMBOL_META[symbol]) return '';
    const meta = RESULT_SYMBOL_META[symbol];
    const baseFeedback = blankEvaluation?.feedback || '';
    const { speaker, expression, message } = extractFeedbackSpeaker(baseFeedback, blankEvaluation?.speaker || '');
    const blankId = blankEvaluation?.id || '';
    const { markup: characterAvatar, displayName } = buildCharacterAvatar({ speaker, expression: expression || blankEvaluation?.expression || 'normal', size: 'sm' });

    // 正解とユーザー回答を取得
    const userAnswer = blankEvaluation?.userAnswer || '';
    const correctAnswer = blankEvaluation?.correctAnswer || '';

    return `
        <button class="qa-blank-result-btn ${meta.className} cursor-pointer hover:scale-110 transition-transform" 
                aria-label="${meta.label}" 
                data-action="toggle-feedback"
                data-blank-id="${blankId}"
                title="クリックして添削を表示">
            ${meta.icon}
        </button>
        <div class="qa-blank-feedback hidden absolute z-10 bg-white border-2 border-indigo-400 rounded-lg shadow-xl p-3 mt-1 min-w-[280px] max-w-[450px]"
             data-feedback-for="${blankId}">
            <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                    ${characterAvatar}
                    <span class="text-sm font-semibold text-indigo-700" style="font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;">${escapeHtml(displayName || '添削')}</span>
                </div>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0" data-action="close-feedback" data-blank-id="${blankId}" title="閉じる">✕</button>
            </div>
            ${correctAnswer ? `
            <div class="text-xs space-y-1 mb-2 p-2 bg-slate-50 rounded">
                <div><span class="text-gray-500">正解：</span><span class="font-medium text-emerald-700">${escapeHtml(correctAnswer)}</span></div>
                ${userAnswer ? `<div><span class="text-gray-500">あなた：</span><span class="font-medium ${symbol === 'circle' ? 'text-emerald-600' : 'text-rose-600'}">${escapeHtml(userAnswer)}</span></div>` : ''}
            </div>
            ` : ''}
            <p class="text-xs text-gray-700 leading-relaxed">${renderArticleRichText(message)}</p>
        </div>
    `;
}

function areAllBlanksCircle(blankEvaluations = []) {
    if (!blankEvaluations.length) return false;
    return blankEvaluations.every(item => determineBlankSymbol(item) === 'circle');
}

// ★点数計算: ○=2点、△=1点、✕=0点 → 100点満点に換算★
function calculateScore(blankEvaluations = []) {
    if (!blankEvaluations.length) return { score: 0, maxScore: 0, percentage: 0 };

    const maxScore = blankEvaluations.length * 2; // 全て○なら最高点
    let totalPoints = 0;

    blankEvaluations.forEach(blank => {
        const symbol = determineBlankSymbol(blank);
        if (symbol === 'circle') {
            totalPoints += 2;
        } else if (symbol === 'triangle') {
            totalPoints += 1;
        }
        // cross = 0点
    });

    const percentage = Math.round((totalPoints / maxScore) * 100);
    return { score: totalPoints, maxScore, percentage };
}

// ★80点以上で合格（Lv3はAIの総合点数を使用）★
function isPassed(blankEvaluations = [], level = null, evaluation = null) {
    // Lv3でAIの総合点数がある場合はそれを使用
    if (level === 3 && evaluation?.overall?.score?.total !== undefined) {
        return evaluation.overall.score.total >= 80;
    }
    // それ以外は従来の空欄ベースの計算
    const { percentage } = calculateScore(blankEvaluations);
    return percentage >= 80;
}

function ensureFillDrill(qa, moduleId = '') {
    // ★★★ localStorageから読み込み ★★★
    if (moduleId && qa.id) {
        const key = `fillDrill_${moduleId}_qa${qa.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const savedData = JSON.parse(stored);
                if (!qa.fillDrill || typeof qa.fillDrill !== 'object') {
                    qa.fillDrill = savedData;
                } else {
                    // 既存データとマージ（メモリ内のテンプレートを優先）
                    qa.fillDrill = {
                        ...savedData,
                        ...qa.fillDrill,
                        clearedLevels: qa.fillDrill.clearedLevels || savedData.clearedLevels || [],
                        // ★★★ 重要: メモリ内のテンプレートを優先（最新の生成結果を上書きしない） ★★★
                        templates: { ...savedData.templates, ...qa.fillDrill.templates },
                        attempts: { ...savedData.attempts, ...qa.fillDrill.attempts }
                    };
                }
                console.log(`📂 穴埋め進捗読み込み（localStorage）: ${key}`);
            } catch (e) {
                console.warn('localStorageからの読み込み失敗:', e);
            }
        }

        // ★★★ R2キャッシュからfillDrillデータを読み込み（localStorageにない場合） ★★★
        if (r2ProgressLoaded) {
            const r2Data = getR2FillDrillData(moduleId, qa.id);
            if (r2Data) {
                if (!qa.fillDrill) qa.fillDrill = {};

                // clearedLevelsを復元（localStorageにない場合のみ）
                if ((!qa.fillDrill.clearedLevels || qa.fillDrill.clearedLevels.length === 0) && r2Data.clearedLevels?.length > 0) {
                    qa.fillDrill.clearedLevels = r2Data.clearedLevels;
                    console.log(`☁️ R2からclearedLevels復元: Q${qa.id} → Lv${r2Data.clearedLevels.join(',')}`);
                }

                // テンプレートを復元（localStorageにない場合のみ）
                if (r2Data.templates && Object.keys(r2Data.templates).length > 0) {
                    qa.fillDrill.templates = { ...r2Data.templates, ...(qa.fillDrill.templates || {}) };
                    console.log(`☁️ R2からテンプレート復元: Q${qa.id} (${Object.keys(r2Data.templates).length}件)`);
                }

                // 採点結果を復元（localStorageにない場合のみ）
                if (r2Data.attempts && Object.keys(r2Data.attempts).length > 0) {
                    qa.fillDrill.attempts = { ...r2Data.attempts, ...(qa.fillDrill.attempts || {}) };
                    console.log(`☁️ R2から採点結果復元: Q${qa.id} (${Object.keys(r2Data.attempts).length}件)`);
                }
            }
        }
    }

    if (!qa.fillDrill || typeof qa.fillDrill !== 'object') {
        qa.fillDrill = {};
    }
    if (!Array.isArray(qa.fillDrill.clearedLevels)) {
        qa.fillDrill.clearedLevels = [];
    }
    if (!qa.fillDrill.templates || typeof qa.fillDrill.templates !== 'object') {
        qa.fillDrill.templates = {};
    }
    if (!qa.fillDrill.attempts || typeof qa.fillDrill.attempts !== 'object') {
        qa.fillDrill.attempts = {};
    }
    return qa.fillDrill;
}

function resolveContext(container) {
    const rawModuleId = container.dataset.moduleId || container.dataset.relativePath || window.currentCaseData?.id || '';
    const moduleId = normalizeModuleId(rawModuleId);
    // Q&A JSONのIDは文字列（例: "1-1"）の場合があるため、まず文字列として取得
    const rawQaId = container.dataset.qaId || null;
    const qaIndex = container.dataset.qaIndex ? Number(container.dataset.qaIndex) : null;
    let qaRef = null;
    let relativePath = moduleId;

    // ★★★ スタンドアロンQ&A対応: data-standalone-qa属性がある場合 ★★★
    // Q&A JSONから読み込んだQ&Aはモジュールがないため、埋め込まれたデータを使用
    const standaloneQAData = container.dataset.standaloneQa;
    if (standaloneQAData) {
        try {
            const qa = JSON.parse(standaloneQAData);

            // ★★★ stateからfillDrillを復元（以前のテンプレートを保持） ★★★
            const currentState = getState(container) || {};
            if (currentState.standaloneQAFillDrill) {
                qa.fillDrill = currentState.standaloneQAFillDrill;
            }

            qaRef = {
                qa: qa,
                qaList: [qa],
                index: 0
            };
            // スタンドアロンQ&A用のrelativePathを設定
            // Q&A JSONのIDは文字列なのでそのまま使用
            const qaIdToUse = qa.id || rawQaId;
            relativePath = `qa-standalone/${qa.subject || 'unknown'}/${qaIdToUse}`;
            console.log('📚 スタンドアロンQ&Aデータを使用:', qaIdToUse, qa.fillDrill ? '(fillDrill復元済み)' : '');
            return {
                moduleId: relativePath,
                qaId: qaIdToUse, // 文字列IDを返す（"1-1"のような形式）
                qaIndex: 0,
                relativePath,
                qaRef
            };
        } catch (e) {
            console.warn('スタンドアロンQ&Aデータのパースに失敗:', e);
        }
    }

    // スタンドアロンでない場合は数値に変換を試みる
    const qaId = rawQaId ? (isNaN(Number(rawQaId)) ? rawQaId : Number(rawQaId)) : null;

    if (moduleId && window.currentCaseData && isSameModule(window.currentCaseData.id, moduleId)) {
        const list = Array.isArray(window.currentCaseData.questionsAndAnswers) ? window.currentCaseData.questionsAndAnswers : [];
        if (!Number.isNaN(qaIndex) && qaIndex !== null && list[qaIndex]) {
            qaRef = {
                qa: list[qaIndex],
                qaList: list,
                index: qaIndex
            };
        } else if (qaId !== null) {
            const foundIndex = list.findIndex(item => String(item.id) === String(qaId));
            if (foundIndex !== -1) {
                qaRef = {
                    qa: list[foundIndex],
                    qaList: list,
                    index: foundIndex
                };
            }
        }
    }

    if (!qaRef && moduleId) {
        const registryEntry = getRegisteredModule(moduleId);
        if (registryEntry?.qaList?.length) {
            const list = registryEntry.qaList;
            const targetIndex = !Number.isNaN(qaIndex) && qaIndex !== null && list[qaIndex]
                ? qaIndex
                : list.findIndex(item => String(item.id) === String(qaId));
            if (targetIndex !== -1 && list[targetIndex]) {
                qaRef = {
                    qa: list[targetIndex],
                    qaList: list,
                    index: targetIndex
                };
                relativePath = registryEntry.relativePath || moduleId;
            }
        }
    }

    return {
        moduleId,
        qaId,
        qaIndex,
        relativePath,
        qaRef
    };
}

function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const target = new Date(timestamp).getTime();
    if (Number.isNaN(target)) return '';
    const diffMinutes = Math.floor((now - target) / 60000);
    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}日前`;
}

function buildHistorySnapshot(fillDrill) {
    if (!fillDrill) return null;
    return {
        clearedLevels: [...(fillDrill.clearedLevels || [])],
        lastAttempts: Object.fromEntries(
            Object.entries(fillDrill.attempts || {}).map(([level, attempt]) => [
                level,
                {
                    timestamp: attempt?.timestamp,
                    score: attempt?.evaluation?.overall?.score || 0
                }
            ])
        )
    };
}

function notify(message, type = 'info') {
    if (typeof window !== 'undefined' && typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        const method = type === 'error' ? 'error' : 'log';
        console[method](message);
    }
}

function buildLevelRow(level, fillDrill, state, qa) {
    const preset = LEVEL_PRESETS[level];
    const cleared = fillDrill.clearedLevels.includes(level);
    const attempt = fillDrill.attempts[level];

    // ★点数を計算してバッジに表示（Lv3はAIの総合点数を使用）★
    let badgeClass, statusText;
    if (attempt?.evaluation) {
        let percentage;

        // Lv3の場合はAIの総合点数を使用
        if (level === 3 && attempt.evaluation.overall?.score?.total !== undefined) {
            percentage = Math.round(attempt.evaluation.overall.score.total);

            // Lv3用の評価表示: 80点以上=○、30-79点=△、30点未満=✕
            if (percentage >= 80) {
                badgeClass = 'bg-green-100 text-green-700 border-green-200';
                statusText = `${percentage}点 ○`;
            } else if (percentage >= 30) {
                badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                statusText = `${percentage}点 △`;
            } else {
                badgeClass = 'bg-rose-100 text-rose-700 border-rose-200';
                statusText = `${percentage}点 ✕`;
            }
        } else if (attempt.evaluation.blanks) {
            // Lv1, Lv2: 従来の空欄ベースの点数計算
            const scoreData = calculateScore(attempt.evaluation.blanks);
            percentage = scoreData.percentage;

            if (percentage >= 80) {
                badgeClass = 'bg-green-100 text-green-700 border-green-200';
                statusText = `${percentage}点`;
            } else if (percentage >= 60) {
                badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                statusText = `${percentage}点`;
            } else {
                badgeClass = 'bg-rose-100 text-rose-700 border-rose-200';
                statusText = `${percentage}点`;
            }
        } else {
            badgeClass = 'bg-gray-100 text-gray-500 border-gray-200';
            statusText = '未挑戦';
        }
    } else if (cleared) {
        badgeClass = 'bg-green-100 text-green-700 border-green-200';
        statusText = 'クリア済';
    } else {
        badgeClass = 'bg-gray-100 text-gray-500 border-gray-200';
        statusText = '未挑戦';
    }

    const isGenerating = state.generatingLevel === level;
    const buttonLabel = state.activeLevel === level
        ? '閉じる'
        : cleared
            ? '振り返る'
            : attempt
                ? '続きから'
                : (isGenerating ? '準備中…' : '開始する');
    const detailVisible = state.activeLevel === level;

    return `
        <div class="qa-fill-level border rounded-lg p-2 bg-white shadow-sm" data-level-wrapper="${level}">
            <div class="flex items-center justify-between gap-2">
                <p class="font-semibold text-gray-800 text-sm">${preset.title}</p>
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border ${badgeClass}">${statusText}</span>
                    <button class="text-xs font-semibold px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        data-action="open-level" data-level="${level}" ${(!detailVisible && isGenerating) ? 'disabled' : ''}>${buttonLabel}</button>
                </div>
            </div>
            <div class="qa-fill-level-body ${detailVisible ? 'mt-3' : 'hidden'}" data-level-body="${level}">
                ${detailVisible ? buildLevelBody(level, fillDrill, state, qa) : ''}
            </div>
        </div>
    `;
}

function buildLevelBody(level, fillDrill, state, qa) {
    const templateBase = fillDrill.templates[level];
    const template = templateBase ? ensureTemplateCoverage(templateBase, qa) : null;
    if (template && template !== templateBase) {
        fillDrill.templates[level] = template;
    }
    const attempt = fillDrill.attempts[level];
    const isGeneratingActive = state.generatingLevel === level;
    const isGenerating = isGeneratingActive && !template;
    const isRegenerating = isGeneratingActive && Boolean(template);
    const isGrading = state.gradingLevel === level;
    const thinkingIndicator = renderThinkingIndicator({
        isGenerating: isGeneratingActive,
        isGrading
    });

    if (!template) {
        if (isGenerating) {
            return `<div class="text-center text-sm text-slate-500 py-6">${thinkingIndicator}</div>`;
        }
        return `<div class="text-center text-sm text-slate-500 py-6">「開始する」ボタンでAIテンプレートが自動生成されます。</div>`;
    }

    const managementButtons = `
        <div class="flex flex-wrap gap-2 mb-3">
            <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                data-action="reset-draft" data-level="${level}">入力をクリア</button>
            <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                data-action="regenerate-template" data-level="${level}" ${isRegenerating ? 'disabled' : ''}>${isRegenerating ? '再生成中…' : '別のテンプレを生成'}</button>
        </div>
    `;

    const blankEvaluations = buildBlankEvaluationMap(fillDrill, level);
    const blanks = Array.isArray(template.blanks) ? template.blanks : [];

    const actionButtons = blanks.length > 0
        ? `<div class="flex flex-wrap gap-2 mt-4">
                <button class="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-60"
                    data-action="grade-level" data-level="${level}" ${isGrading ? 'disabled' : ''}>
                    ${isGrading ? 'AI採点中…' : 'AIで採点する'}
                </button>
            </div>`
        : '';

    const inlineWorksheet = renderInlineWorksheet(level, template, state, fillDrill, blankEvaluations)
        || `<p class="text-xs text-gray-500">このレベルには空欄が設定されていません。</p>`;

    // Q&A参照は文中に埋め込まれるため、relatedQAsセクションは不要

    return `${thinkingIndicator}${managementButtons}${inlineWorksheet}${actionButtons}<div class="qa-fill-result mt-4" data-result-area="${level}">${buildEvaluationBlock(level, fillDrill)}</div>`;
}

function renderInlineWorksheet(level, template, state, fillDrill, blankEvaluations) {
    let segments = normalizeInlineSegments(template);
    if (!segments || segments.length === 0) {
        segments = buildFallbackInlineSegments(template);
    }
    if (!segments || segments.length === 0) {
        return '';
    }

    const blanksById = new Map((template.blanks || []).map(blank => [String(blank.id), blank]));
    const blankMap = blankEvaluations || buildBlankEvaluationMap(fillDrill, level);
    let blankCounter = 0;
    const body = segments.map(segment => {
        if (!segment) return '';
        if (segment.type === 'break') {
            return '<span class="inline-block w-full h-3"></span>';
        }
        // ★★★ Q&A参照セグメントをボタン化 ★★★
        if (segment.type === 'qaRef') {
            const qaRef = segment.ref || '';
            // qaRefをドット区切り形式に正規化（例: "商法1.3" → "商法.1.3"）
            let normalizedRef = qaRef;
            // "科目名数字.数字" パターンを "科目名.数字.数字" に変換
            const match = qaRef.match(/^([^\d.]+)(\d+)\.(\d+)$/);
            if (match) {
                normalizedRef = `${match[1]}.${match[2]}.${match[3]}`;
            }
            // processQAReferencesを使ってQ&Aボタンを生成（【科目名.番号】形式）
            const buttonHtml = processQAReferences(`【${normalizedRef}】`, [], {});
            return `<span class="inline-qa-ref mx-1">${buttonHtml}</span>`
        }
        if (segment.type === 'blank') {
            blankCounter += 1;
            const blankId = segment.id || `B${blankCounter}`;
            const blankMeta = blanksById.get(String(blankId)) || {};
            const label = segment.label || blankMeta.label || `(${blankCounter})`;
            // ★★★ 答えをplaceholderに表示しない ★★★
            const placeholder = '';
            const rawValue = getBlankValue(fillDrill, state, level, blankId);
            const value = typeof rawValue === 'string' ? rawValue : '';
            const indicator = renderBlankResultIndicator(blankMap.get(String(blankId)));
            const forceLongForm = Boolean(blankMeta.longForm || segment.longForm || Number(level) === 3);
            const minChars = Number(blankMeta.minChars || segment.minChars) || (forceLongForm ? 80 : 0);
            const textareaPlaceholder = forceLongForm && !placeholder
                ? 'ここに50文字以上で、条文趣旨や理由付けを自分の言葉で書きましょう'
                : placeholder;
            if (forceLongForm) {
                return `
                    <div class="longform-blank w-full bg-white border border-indigo-200 rounded-lg p-3 mb-2 shadow-sm" data-longform-wrapper="${blankId}">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-xs font-semibold text-indigo-700">${escapeHtml(label)} 長文</span>
                            ${indicator ? `<span class="relative">${indicator}</span>` : ''}
                        </div>
                        <textarea
                            class="inline-blank-input inline-blank-textarea w-full min-h-[140px] text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            data-blank-id="${blankId}"
                            data-level="${level}"
                            data-require-longform="true"
                            data-min-chars="${minChars}"
                            data-auto-resize="false"
                            placeholder="${escapeAttribute(textareaPlaceholder)}">${escapeHtml(value)}</textarea>
                        <p class="text-[11px] text-slate-500 mt-1">※ ${minChars}文字以上で段落全体を書いてください。</p>
                    </div>
                `;
            }
            return `
                <span class="inline-blank-wrapper inline-flex items-center gap-1 mx-1 my-1">
                    <span class="text-[11px] font-bold text-indigo-600">${escapeHtml(label)}</span>
                    <input
                        type="text"
                        class="inline-blank-input text-sm border-b-2 border-indigo-300 bg-indigo-50 px-2 py-0.5 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                        style="min-width: 100px; max-width: 300px;"
                        data-blank-id="${blankId}"
                        data-level="${level}"
                        data-auto-resize="true"
                        data-min-width="100"
                        data-max-width="300"
                        value="${escapeAttribute(value)}"
                        placeholder="${escapeAttribute(placeholder)}"
                    />
                    ${indicator ? `<span class="relative">${indicator}</span>` : ''}
                </span>
            `;
        }
        const textContent = segment.text ?? String(segment);
        if (!textContent) return '';
        return `<span class="inline-text">${renderArticleRichText(textContent)}</span>`;
    }).join('');

    return `
        <div class="qa-inline-body text-sm text-slate-800 leading-relaxed">
            <div class="text-xs font-semibold text-indigo-500 mb-3">文章の流れに沿って空欄を埋めましょう</div>
            <div class="inline-body-flow" style="line-height: 2.2;">${body}</div>
        </div>
    `;
}

function buildEvaluationBlock(level, fillDrill) {
    const attempt = fillDrill.attempts?.[level];
    if (!attempt || !attempt.evaluation) {
        if (fillDrill.clearedLevels.includes(level)) {
            return `<div class="text-sm text-emerald-600">✅ このレベルはクリア済みです。</div>`;
        }
        return `<div class="text-xs text-gray-400">まだ採点結果がありません。</div>`;
    }

    const blanks = Array.isArray(attempt.evaluation.blanks) ? attempt.evaluation.blanks : [];

    // ★Lv3の場合はAIが返した総合点数を使用、それ以外は空欄ベースの計算★
    let percentage, passed, overallResult;

    if (level === 3 && attempt.evaluation.overall?.score?.total !== undefined) {
        // Lv3: AIが返した100点満点の総合点数を使用
        percentage = Math.round(attempt.evaluation.overall.score.total);
        passed = percentage >= 80;

        // 80点以上=○、30-79点=△、30点未満=✕
        if (percentage >= 80) {
            overallResult = '○';
        } else if (percentage >= 30) {
            overallResult = '△';
        } else {
            overallResult = '✕';
        }
    } else {
        // Lv1, Lv2: 従来の空欄ベースの点数計算
        const scoreData = calculateScore(blanks);
        percentage = scoreData.percentage;
        passed = percentage >= 80;
        overallResult = passed ? '○' : '△';
    }

    const baseOverallSummary = attempt.evaluation.overall?.summary || (passed ? '素晴らしい！' : '各空欄の◯/△/☓をクリックして添削を確認しましょう。');

    // Lv3用の結果表示
    let chipClass, chipText, statusText;
    if (level === 3) {
        if (overallResult === '○') {
            chipClass = 'qa-result-chip qa-result-chip--pass';
            chipText = '○ 合格';
            statusText = '🎉 合格！';
        } else if (overallResult === '△') {
            chipClass = 'qa-result-chip qa-result-chip--retry';
            chipText = '△ 惜しい';
            statusText = '🧠 もう少し';
        } else {
            chipClass = 'qa-result-chip qa-result-chip--retry';
            chipText = '✕ 要復習';
            statusText = '📚 要復習';
        }
    } else {
        chipClass = passed ? 'qa-result-chip qa-result-chip--pass' : 'qa-result-chip qa-result-chip--retry';
        chipText = passed ? '80点以上' : '再挑戦';
        statusText = passed ? '🎉 合格！' : '🧠 再挑戦';
    }

    const scoreClass = percentage >= 80 ? 'text-emerald-600' : percentage >= 30 ? 'text-amber-600' : 'text-rose-600';

    // ★複数キャラクターの会話をパース★
    const dialogues = parseMultiCharacterDialogue(baseOverallSummary, attempt.evaluation.overall?.speaker || 'みかん');

    // 会話セクションをレンダリング
    const dialogueHtml = dialogues.map(dialogue => {
        const { markup: charAvatar, displayName } = buildCharacterAvatar({
            speaker: dialogue.speaker,
            expression: dialogue.expression || 'normal',
            size: 'md'
        });
        return `
            <div class="flex items-start gap-2 mb-2">
                ${charAvatar}
                <div class="flex-1">
                    <p class="text-xs font-semibold text-indigo-700 mb-0.5" style="font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;">${escapeHtml(displayName)}</p>
                    <p class="text-xs text-slate-600">${renderArticleRichText(dialogue.message)}</p>
                </div>
            </div>
        `;
    }).join('');

    // Lv3の場合は詳細な採点内訳を表示
    let breakdownHtml = '';
    if (level === 3 && attempt.evaluation.overall?.score?.breakdown) {
        const breakdown = attempt.evaluation.overall.score.breakdown;
        breakdownHtml = `
            <div class="mt-2 pt-2 border-t border-slate-200">
                <p class="text-xs font-semibold text-slate-500 mb-1">採点内訳:</p>
                <div class="grid grid-cols-2 gap-1 text-xs">
                    ${breakdown.logic ? `<div class="text-slate-600">論理構成: ${breakdown.logic.score || 0}点</div>` : ''}
                    ${breakdown.coverage ? `<div class="text-slate-600">網羅性: ${breakdown.coverage.score || 0}点</div>` : ''}
                    ${breakdown.accuracy ? `<div class="text-slate-600">正確性: ${breakdown.accuracy.score || 0}点</div>` : ''}
                    ${breakdown.expression ? `<div class="text-slate-600">表現力: ${breakdown.expression.score || 0}点</div>` : ''}
                </div>
            </div>
        `;
    }

    // Q&A参照は問題文中に埋め込まれるため、ここでの表示は不要

    return `
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-slate-700">${statusText}</p>
                    <span class="text-lg font-bold ${scoreClass}">${percentage}点</span>
                    ${level === 3 ? `<span class="text-lg font-bold">${overallResult}</span>` : ''}
                </div>
                <span class="${chipClass}">${chipText}</span>
            </div>
            <div class="space-y-2">
                ${dialogueHtml}
            </div>
            ${breakdownHtml}
        </div>
    `;
}

// ★複数キャラクターの会話をパースするヘルパー関数★
function parseMultiCharacterDialogue(summary, defaultSpeaker) {
    if (!summary) return [{ speaker: defaultSpeaker, message: '', expression: 'normal' }];

    // 「キャラクター名@表情: メッセージ」または「キャラクター名: メッセージ」パターンを検出
    // 注意: 「みかん、〜」のような呼びかけは話者ではないので除外
    // コロン(:)または@の後に続くものだけを話者として認識
    const speakerPattern = /(みかん|ユズヒコ|しみちゃん|母|父|藤野|ナスオ|石田|川島|須藤|吉岡|岩城|理央|浅田|梶井|新田|山下|ゆかりん|村上先生|宮嶋先生|小川先生|原先生|水島さん|戸山さん|三角さん)(?:@(\w+))?[:：]\s*/g;

    const parts = summary.split(speakerPattern).filter(Boolean);

    // パターンにマッチしない場合や、最初の部分がキャラクター名でない場合は単一の発言として扱う
    // 「みかん、〜」のような呼びかけで始まる場合もここで処理される
    const firstPart = parts[0]?.trim() || '';
    const startsWithSpeakerPattern = /^(みかん|ユズヒコ|しみちゃん|母|父|藤野|ナスオ|石田|川島|須藤|吉岡|岩城|理央|浅田|梶井|新田|山下|ゆかりん|村上先生|宮嶋先生|小川先生|原先生|水島さん|戸山さん|三角さん)(?:@\w+)?[:：]/.test(summary.trim());

    if (!startsWithSpeakerPattern && parts.length <= 1) {
        // パターンにマッチしない場合は、defaultSpeakerの発言として扱う
        return [{ speaker: defaultSpeaker, message: summary.trim(), expression: 'normal' }];
    }

    const dialogues = [];
    let currentSpeaker = defaultSpeaker;
    let currentExpression = 'normal';

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        // キャラクター名かどうかをチェック（コロンなしで）
        const isCharacterName = /^(みかん|ユズヒコ|しみちゃん|母|父|藤野|ナスオ|石田|川島|須藤|吉岡|岩城|理央|浅田|梶井|新田|山下|ゆかりん|村上先生|宮嶋先生|小川先生|原先生|水島さん|戸山さん|三角さん)$/.test(part);

        if (isCharacterName) {
            currentSpeaker = part;
        } else if (/^(normal|happy|thinking|serious|confused|surprised|sad|sigh|angry|crying)$/.test(part)) {
            // 表情パターン（@表情 から抽出された部分）
            currentExpression = part;
        } else {
            // メッセージ部分
            dialogues.push({
                speaker: currentSpeaker,
                message: part.replace(/^[:：]\s*/, '').trim(),
                expression: currentExpression
            });
            currentExpression = 'normal'; // リセット
        }
    }

    // 結果が空の場合はデフォルト
    if (dialogues.length === 0) {
        return [{ speaker: defaultSpeaker, message: summary.trim(), expression: 'normal' }];
    }

    return dialogues;
}
function computeStudyRecordDate(now = new Date()) {
    const local = new Date(now);
    if (local.getHours() < 3) {
        local.setDate(local.getDate() - 1);
    }
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, '0');
    const day = String(local.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateLevelChips(container, fillDrill) {
    const qaItem = container.closest('.qa-item');
    if (!qaItem) return;
    fillDrill.clearedLevels.forEach(level => {
        const chip = qaItem.querySelector(`[data-level-chip="${level}"]`);
        if (chip) {
            chip.classList.remove('bg-gray-100', 'text-gray-500', 'border-gray-200');
            chip.classList.add('bg-green-100', 'text-green-700', 'border-green-200');
        }
    });
}

class QAFillDrillSystem {
    mountAll(root = document) {
        const scope = root instanceof HTMLElement ? root : document;
        const targets = scope.querySelectorAll('.qa-fill-drill');
        targets.forEach(container => this.mount(container));
    }

    mount(container) {
        if (!(container instanceof HTMLElement)) return;
        if (!getState(container)?.instanceId) {
            setState(container, {
                instanceId: Math.random().toString(36).slice(2),
                drafts: {},
                activeLevel: null,
                generatingLevel: null,
                gradingLevel: null,
                listenerAttached: false,
                hydrating: false,
                hydrateError: null,
                draftsLoaded: false
            });
        }
        this.render(container);
        const state = getState(container);
        if (!state.listenerAttached) {
            container.addEventListener('click', (event) => this.handleClick(event, container));
            container.addEventListener('input', (event) => this.handleInput(event, container));
            setState(container, { ...getState(container), listenerAttached: true });
        }
    }

    render(container) {
        const context = resolveContext(container);
        const state = getState(container) || {};
        setState(container, {
            ...state,
            moduleId: context.moduleId,
            qaId: context.qaId,
            qaIndex: context.qaIndex
        });

        // Auto-load drafts if available and not yet loaded
        if (context.moduleId && context.qaId && !state.draftsLoaded) {
            const savedDrafts = this.loadDraftsFromStorage(context.moduleId, context.qaId);
            if (Object.keys(savedDrafts).length > 0) {
                // Merge with existing drafts if any (though usually empty on init)
                const mergedDrafts = { ...state.drafts, ...savedDrafts };
                setState(container, { ...state, drafts: mergedDrafts, draftsLoaded: true });
            } else {
                setState(container, { ...state, draftsLoaded: true });
            }
        }

        const latestState = getState(container);
        if (!context.qaRef) {
            if (latestState.hydrateError) {
                const fallbackButton = context.moduleId
                    ? `<button class="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 underline decoration-dotted" data-action="open-case-link" data-module-id="${context.moduleId}">ケースを開く</button>`
                    : '';
                container.innerHTML = `
                    <div class="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3">
                        ${escapeHtml(latestState.hydrateError)}
                        ${fallbackButton}
                    </div>`;
            } else if (context.moduleId && context.qaId !== null) {
                container.innerHTML = `<div class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">穴埋めデータを準備しています…</div>`;
                this.ensureRemoteContext(container, context);
            } else {
                container.innerHTML = `<div class="text-[11px] text-gray-400">このQ&Aは穴埋め対象外です。</div>`;
            }
            return;
        }

        const qa = context.qaRef.qa;
        // ★★★ stateにfillDrillがあればそれを優先（最新の生成結果を使用） ★★★
        const stateNow = getState(container);
        let fillDrill;
        if (stateNow.cachedFillDrill && stateNow.cachedFillDrill.qaId === qa.id) {
            fillDrill = stateNow.cachedFillDrill.data;
            // qa.fillDrillも同期
            qa.fillDrill = fillDrill;
        } else {
            fillDrill = ensureFillDrill(qa, context.moduleId);
        }
        const nextState = getState(container);
        const content = LEVEL_PRESETS ? Object.keys(LEVEL_PRESETS).map(level => Number(level)).map(level => buildLevelRow(level, fillDrill, nextState, qa)).join('') : '';
        container.innerHTML = `<div class="space-y-3">${content}</div>`;
        scheduleInlineInputResize(container);
        setupArticleRefButtons(container);
    }

    async ensureRemoteContext(container, baseContext) {
        const currentState = getState(container) || {};
        if (currentState.hydrating || !baseContext.moduleId) {
            return;
        }

        setState(container, { ...currentState, hydrating: true, hydrateError: null });

        try {
            const entry = await ensureModuleEntry(baseContext.moduleId);
            if (!entry) {
                throw new Error('モジュールデータの読み込みに失敗しました。');
            }
            const qaList = entry.qaList || [];
            const targetIndex = qaList.findIndex(item => String(item.id) === String(baseContext.qaId));
            if (targetIndex === -1) {
                throw new Error(`Q${baseContext.qaId} がモジュール内で見つかりませんでした。`);
            }
            container.dataset.qaIndex = targetIndex;
            setState(container, { ...getState(container), hydrating: false, hydrateError: null, qaIndex: targetIndex });
        } catch (error) {
            setState(container, { ...getState(container), hydrating: false, hydrateError: error.message || '穴埋めデータの取得に失敗しました。' });
        } finally {
            this.render(container);
        }
    }

    handleClick(event, container) {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        const level = actionEl.dataset.level ? Number(actionEl.dataset.level) : null;

        switch (action) {
            case 'toggle-feedback':
                {
                    const blankId = actionEl.dataset.blankId;
                    if (blankId) {
                        const feedbackEl = container.querySelector(`[data-feedback-for="${blankId}"]`);
                        if (feedbackEl) {
                            // Close all other feedbacks first
                            container.querySelectorAll('.qa-blank-feedback').forEach(el => {
                                if (el !== feedbackEl) el.classList.add('hidden');
                            });
                            feedbackEl.classList.toggle('hidden');
                        }
                    }
                }
                break;
            case 'close-feedback':
                {
                    const blankId = actionEl.dataset.blankId;
                    if (blankId) {
                        const feedbackEl = container.querySelector(`[data-feedback-for="${blankId}"]`);
                        if (feedbackEl) {
                            feedbackEl.classList.add('hidden');
                        }
                    }
                }
                break;
            case 'open-level':
                if (level !== null) {
                    this.toggleLevel(container, level);
                }
                break;
            case 'regenerate-template':
                if (level !== null) {
                    this.generateTemplate(container, level, { forceRefresh: true });
                }
                break;
            case 'grade-level':
                if (level !== null) {
                    this.gradeLevel(container, level);
                }
                break;
            case 'reset-draft':
                if (level !== null) {
                    this.resetDraft(container, level);
                }
                break;
            case 'open-case-link':
                {
                    const moduleId = actionEl.dataset.moduleId || container.dataset.moduleId;
                    if (moduleId) {
                        window.location.hash = `#/case/${moduleId}`;
                    }
                }
                break;
            default:
                break;
        }
    }

    handleInput(event, container) {
        const target = event.target.closest('[data-blank-id][data-level]');
        if (!target) return;
        const level = Number(target.dataset.level);
        const blankId = target.dataset.blankId;
        if (!blankId || Number.isNaN(level)) return;
        const state = getState(container);
        const drafts = { ...(state.drafts || {}) };
        drafts[level] = { ...(drafts[level] || {}) };
        drafts[level][blankId] = target.value;
        setState(container, { ...state, drafts });

        // 同じblankIdを持つすべてのテキストエリアを同時に更新
        const allBlanksWithSameId = container.querySelectorAll(`[data-blank-id="${blankId}"][data-level="${level}"]`);
        allBlanksWithSameId.forEach(textarea => {
            if (textarea !== target && textarea.value !== target.value) {
                textarea.value = target.value;
            }
            if (textarea.classList.contains('inline-blank-input') && textarea.dataset.autoResize !== 'false') {
                autoResizeInlineInput(textarea);
            }
        });
        if (target.classList.contains('inline-blank-input') && target.dataset.autoResize !== 'false') {
            autoResizeInlineInput(target);
        }

        this.debouncedSave(container, level);
    }

    toggleLevel(container, level) {
        const state = getState(container);
        const context = resolveContext(container);
        const qa = context.qaRef?.qa;
        const fillDrill = qa ? ensureFillDrill(qa, context.moduleId) : null;
        const isOpening = state.activeLevel !== level;
        const nextLevel = isOpening ? level : null;
        setState(container, { ...state, activeLevel: nextLevel });
        this.render(container);

        if (isOpening && fillDrill && !fillDrill.templates[level]) {
            this.generateTemplate(container, level, { forceRefresh: false });
        }
    }

    resetDraft(container, level) {
        const state = getState(container);
        const drafts = { ...(state.drafts || {}) };
        drafts[level] = {};
        setState(container, { ...state, drafts });

        const context = resolveContext(container);
        if (context.moduleId && context.qaId) {
            this.clearDraftStorage(context.moduleId, context.qaId, level);
        }

        this.render(container);
    }

    async generateTemplate(container, level, { forceRefresh }) {
        const context = resolveContext(container);
        if (!context.qaRef) {
            notify('ケースページで読み込んでからお試しください', 'info');
            return;
        }
        const qa = context.qaRef.qa;
        const fillDrill = ensureFillDrill(qa, context.moduleId);
        const state = getState(container);
        setState(container, { ...state, generatingLevel: level, activeLevel: level });
        this.render(container);

        // ★★★ 常にQ&Aデータをサーバーに送信 ★★★
        const isStandalone = context.relativePath.startsWith('qa-standalone/');

        try {
            // 通常のケースページでもQ&Aデータを送信
            const qaDataForServer = {
                id: qa.id,
                question: qa.question,
                answer: qa.answer,
                rank: qa.rank,
                subject: qa.subject
            };

            // ★★★ 参照資料を構築（ケースの参考資料 + Q&A解説） ★★★
            let combinedReferenceMaterial = window.currentCaseData?.referenceMaterial || '';
            if (qa.explanation) {
                combinedReferenceMaterial = combinedReferenceMaterial
                    ? `${combinedReferenceMaterial}\n\n【このQ&Aの解説】\n${qa.explanation}`
                    : `【このQ&Aの解説】\n${qa.explanation}`;
            }

            const response = await ApiService.generateQAFillTemplate({
                relativePath: context.relativePath,
                qaId: qa.id,
                level,
                forceRefresh: Boolean(forceRefresh),
                historySnapshot: buildHistorySnapshot(fillDrill),
                standaloneQA: qaDataForServer,
                referenceMaterial: combinedReferenceMaterial
            });

            // ★★★ forceRefresh時は採点結果もクリア ★★★
            if (forceRefresh) {
                delete fillDrill.attempts[level];
                console.log(`🔄 Lv${level}の採点結果をクリアしました`);
            }

            fillDrill.templates[level] = response.template;
            fillDrill.updatedAt = new Date().toISOString();
            await this.persist(context.relativePath, context.qaRef.qa);
            notify('AIテンプレートを取得しました ✅', 'success');
            this.resetDraft(container, level);
        } catch (error) {
            notify(error.message || 'テンプレートの取得に失敗しました', 'error');
        } finally {
            const latestState = getState(container);
            const newState = { ...latestState, generatingLevel: null, activeLevel: level };

            // ★★★ fillDrillをstateにキャッシュ（render時に優先使用） ★★★
            if (fillDrill) {
                newState.cachedFillDrill = {
                    qaId: context.qaRef.qa.id,
                    data: fillDrill
                };
            }

            // スタンドアロンQ&Aの場合も同様
            if (isStandalone && fillDrill) {
                newState.standaloneQAFillDrill = fillDrill;
            }

            setState(container, newState);
            this.render(container);
        }
    }

    collectAnswers(container, level) {
        const inputs = container.querySelectorAll(`[data-level="${level}"][data-blank-id]`);
        const answers = [];
        inputs.forEach(input => {
            answers.push({
                id: input.dataset.blankId,
                text: input.value?.trim() || ''
            });
        });
        return answers;
    }

    validateLevelRequirements(container, level) {
        // ★★★ 全レベルで文字数制限なし - 同じ入力形式に統一 ★★★
        return true;
    }

    async gradeLevel(container, level) {
        const context = resolveContext(container);
        if (!context.qaRef) {
            notify('ケースページで開いてから採点してください', 'info');
            return;
        }
        const qa = context.qaRef.qa;
        const fillDrill = ensureFillDrill(qa, context.moduleId);
        const template = fillDrill.templates[level];
        if (!template) {
            notify('まずAIテンプレートを生成してください', 'info');
            return;
        }
        const answerSnapshot = this.collectAnswers(container, level);
        if (answerSnapshot.length === 0) {
            notify('空欄に答案を入力してください', 'info');
            return;
        }
        if (!this.validateLevelRequirements(container, level)) {
            return;
        }
        const state = getState(container);
        setState(container, { ...state, gradingLevel: level });
        this.render(container);
        try {
            // ★★★ 常にQ&Aデータを送信 ★★★
            const qaDataForServer = {
                id: qa.id,
                question: qa.question,
                answer: qa.answer,
                rank: qa.rank,
                subject: qa.subject
            };

            // ★★★ ケースページのキャラクター情報を取得 ★★★
            let caseCharacters = [];
            const entry = getRegisteredModule(context.moduleId);
            if (entry?.caseData?.story) {
                // ストーリーから登場キャラクターを抽出
                const speakers = [...new Set(
                    entry.caseData.story
                        .filter(s => s.type === 'dialogue' && s.speaker)
                        .map(s => s.speaker)
                )];
                caseCharacters = speakers.slice(0, 3); // 最大3人
            }

            // ★★★ 参照資料を構築（ケースの参考資料 + Q&A解説） ★★★
            let combinedReferenceMaterial = window.currentCaseData?.referenceMaterial || '';
            if (qa.explanation) {
                combinedReferenceMaterial = combinedReferenceMaterial
                    ? `${combinedReferenceMaterial}\n\n【このQ&Aの解説】\n${qa.explanation}`
                    : `【このQ&Aの解説】\n${qa.explanation}`;
            }

            const response = await ApiService.gradeQAFillAnswers({
                relativePath: context.relativePath,
                qaId: qa.id,
                level,
                template,
                answers: answerSnapshot,
                standaloneQA: qaDataForServer,
                characters: caseCharacters,
                referenceMaterial: combinedReferenceMaterial
            });

            console.log('🤖 採点API応答:', response);

            // ★★★ 採点結果を保存 ★★★
            const attempt = {
                timestamp: new Date().toISOString(),
                evaluation: response.evaluation,
                answers: Object.fromEntries(answerSnapshot.map(item => [item.id, item.text]))
            };
            fillDrill.attempts[level] = attempt;
            qa.fillDrill = fillDrill; // 明示的に再代入

            // ★80点以上で合格（Lv3はAIの総合点数を使用）★
            const blanks = Array.isArray(response.evaluation?.blanks) ? response.evaluation.blanks : [];
            let passed, percentage, overallResult;

            if (level === 3 && response.evaluation?.overall?.score?.total !== undefined) {
                // Lv3: AIが返した100点満点の総合点数を使用
                percentage = Math.round(response.evaluation.overall.score.total);
                passed = percentage >= 80;

                // 80点以上=○、30-79点=△、30点未満=✕
                if (percentage >= 80) {
                    overallResult = '○';
                } else if (percentage >= 30) {
                    overallResult = '△';
                } else {
                    overallResult = '✕';
                }
            } else {
                // Lv1, Lv2: 従来の空欄ベースの計算
                passed = isPassed(blanks, level, response.evaluation);
                const scoreData = calculateScore(blanks);
                percentage = scoreData.percentage;
                overallResult = passed ? '○' : '△';
            }

            const alreadyCleared = fillDrill.clearedLevels.includes(level);
            if (passed && !alreadyCleared) {
                fillDrill.clearedLevels = [...fillDrill.clearedLevels, level].sort((a, b) => a - b);
                fillDrill.completedAt = fillDrill.completedAt || {};
                fillDrill.completedAt[level] = attempt.timestamp;
                this.logLevelCompletion({
                    relativePath: context.relativePath,
                    qa,
                    level,
                    evaluation: response.evaluation,
                    template
                }).catch(e => console.warn('学習記録追加失敗:', e));
                updateLevelChips(container, fillDrill);
            }

            // 合格した場合は下書きを削除する
            if (passed) {
                this.clearDraftStorage(context.moduleId, context.qaId, level);
            }

            fillDrill.updatedAt = new Date().toISOString();
            this.persist(context.relativePath, qa).catch(e => console.warn('保存失敗:', e));

            // ★★★ 採点完了後、fillDrillをstateにキャッシュしてからレンダリング ★★★
            const currentState = getState(container);
            setState(container, {
                ...currentState,
                gradingLevel: null,
                cachedFillDrill: {
                    qaId: qa.id,
                    data: fillDrill
                }
            });
            this.render(container);

            console.log('✅ 採点完了・UI更新完了');

            // Lv3用の通知メッセージ
            if (level === 3) {
                if (overallResult === '○') {
                    notify(`🎉 ${percentage}点 ${overallResult} 合格！`, 'success');
                } else if (overallResult === '△') {
                    notify(`🧠 ${percentage}点 ${overallResult} もう少し！（80点以上で合格）`, 'info');
                } else {
                    notify(`📚 ${percentage}点 ${overallResult} 要復習（80点以上で合格）`, 'warning');
                }
            } else {
                notify(passed ? `🎉 ${percentage}点で合格！` : `${percentage}点 - 80点以上で合格です`, passed ? 'success' : 'info');
            }

        } catch (error) {
            console.error('❌ 採点エラー:', error);
            notify(error.message || '採点に失敗しました', 'error');
            setState(container, { ...getState(container), gradingLevel: null });
            this.render(container);
        }
    }

    async persist(relativePath, qaEntryOrList) {
        try {
            const updates = Array.isArray(qaEntryOrList)
                ? qaEntryOrList.filter(Boolean)
                : [qaEntryOrList].filter(Boolean);
            if (updates.length === 0) {
                console.warn('persist: 保存対象のQ&Aがありません');
                return;
            }

            // ★★★ localStorageに保存（確実に動作） ★★★
            const moduleId = normalizeModuleId(relativePath);
            updates.forEach(qa => {
                if (qa.fillDrill) {
                    const key = `fillDrill_${moduleId}_qa${qa.id}`;
                    localStorage.setItem(key, JSON.stringify(qa.fillDrill));
                    console.log(`💾 穴埋め進捗保存（localStorage）: ${key}`);
                }
            });

            // ★★★ R2クラウドに保存（テンプレート・採点結果含む） ★★★
            for (const qa of updates) {
                if (qa.fillDrill) {
                    try {
                        await fetch('/api/fill-drill/progress', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                moduleId: moduleId,
                                qaId: qa.id,
                                fillDrill: qa.fillDrill
                            })
                        });
                        const levels = qa.fillDrill.clearedLevels?.join(',') || 'none';
                        const templateCount = Object.keys(qa.fillDrill.templates || {}).length;
                        console.log(`☁️ R2に進捗保存: ${moduleId}/Q${qa.id} → Lv${levels}, テンプレート${templateCount}件`);
                    } catch (r2Err) {
                        console.warn('⚠️ R2保存失敗（localStorageには保存済み）:', r2Err.message);
                    }
                }
            }

            // ファイル保存は非同期でエラーを無視
            if (window.qaStatusSystem?.saveQADataToFile) {
                window.qaStatusSystem.saveQADataToFile(moduleId, updates).catch(err => {
                    console.warn('⚠️ ファイル保存失敗（localStorageには保存済み）:', err.message);
                });
            }
        } catch (error) {
            console.warn('⚠️ 穴埋め進捗の保存に失敗:', error);
        }
    }

    async logLevelCompletion({ relativePath, qa, level, evaluation, template }) {
        try {
            const now = new Date();
            const payload = {
                relativePath,
                timestamp: now.toISOString(),
                date: computeStudyRecordDate(now),
                title: `Q${qa.id} レベル${level}クリア`,
                detail: evaluation?.overall?.summary || template?.focus || qa.question?.slice(0, 80) || '穴埋めをクリアしました',
                qaId: qa.id,
                level,
                moduleId: normalizeModuleId(relativePath)
            };
            await ApiService.addStudyRecordEntry(payload);
            if (typeof window.updateSingleStudyRecord === 'function') {
                window.updateSingleStudyRecord(normalizeModuleId(relativePath));
            }
        } catch (error) {
            console.warn('⚠️ レベルクリアの学習記録追加に失敗:', error.message);
        }
    }

    registerModuleCaseData(moduleId, caseData) {
        storeModuleCaseData(moduleId, caseData);
    }

    // --- Auto-save / Draft Storage ---

    getDraftStorageKey(moduleId, qaId, level) {
        return `qa_draft_${normalizeModuleId(moduleId)}_qa-${qaId}_lv${level}`;
    }

    saveDraftToStorage(moduleId, qaId, level, draftsForLevel) {
        if (!moduleId || !qaId || level === null) return;
        const key = this.getDraftStorageKey(moduleId, qaId, level);
        if (!draftsForLevel || Object.keys(draftsForLevel).length === 0) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(draftsForLevel));
        }
    }

    loadDraftsFromStorage(moduleId, qaId) {
        if (!moduleId || !qaId) return {};
        const drafts = {};
        // Check for levels 1, 2, 3
        [1, 2, 3].forEach(level => {
            const key = this.getDraftStorageKey(moduleId, qaId, level);
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    if (data && typeof data === 'object') {
                        drafts[level] = data;
                    }
                } catch (e) {
                    console.warn('Failed to parse draft', key, e);
                }
            }
        });
        return drafts;
    }

    clearDraftStorage(moduleId, qaId, level) {
        if (!moduleId || !qaId || level === null) return;
        const key = this.getDraftStorageKey(moduleId, qaId, level);
        localStorage.removeItem(key);
    }

    debouncedSave(container, level) {
        const state = getState(container);
        if (state.saveTimeout) {
            clearTimeout(state.saveTimeout);
        }
        const timeoutId = setTimeout(() => {
            const context = resolveContext(container);
            const currentState = getState(container);
            if (context.moduleId && context.qaId && currentState.drafts?.[level]) {
                this.saveDraftToStorage(context.moduleId, context.qaId, level, currentState.drafts[level]);
            }
        }, 1000); // 1 second debounce
        setState(container, { ...state, saveTimeout: timeoutId });
    }
}

export const qaFillDrillSystem = new QAFillDrillSystem();

if (typeof window !== 'undefined') {
    window.qaFillDrillSystem = qaFillDrillSystem;
    window.loadFillDrillR2Progress = loadR2Progress; // グローバルに公開

    // ★★★ ページ読み込み時にR2から進捗を自動読み込み ★★★
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // 遅延読み込み（他の初期化を優先）
            setTimeout(() => loadR2Progress(), 500);
        });
    } else {
        setTimeout(() => loadR2Progress(), 500);
    }
}
