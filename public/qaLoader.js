/**
 * Q&A ローダー - 科目横断Q&A参照システム
 * 
 * 【参照形式】
 * - "民法.3-1"      : 科目名.番号 の完全形式
 * - "3-1"           : 現在の科目のQ&Aを参照（省略形式）
 * - "民法.3-〔4-6〕" : 範囲指定形式（民法.3-4, 3-5, 3-6 に展開）
 * 
 * 【データ構造】
 * /data/qa/民法.json, /data/qa/刑法.json などに科目ごとのQ&Aを格納
 */

// グローバルQ&Aキャッシュ
window.qaCache = window.qaCache || {};
window.currentSubject = window.currentSubject || null;

/**
 * 範囲指定を展開する
 * 新形式: "科目.サブカテゴリー.〔開始.終了〕" → ["科目.サブカテ.開始", "科目.サブカテ.開始+1", ...]
 * 旧形式: "科目.プレフィックス-〔開始-終了〕" → ["科目.プレフィックス-開始", ...]
 * @param {string} ref - 参照ID（範囲指定を含む可能性がある）
 * @returns {string[]} - 展開された参照IDの配列
 */
export function expandQARefRange(ref) {
    if (!ref || typeof ref !== 'string') return [];

    const trimmed = ref.trim();

    // 新形式範囲指定: "科目.サブカテ.〔開始.終了〕" (例: "民法.1.〔3.6〕")
    const newRangePattern = /^([^.]+)\.([^.]+)\.[〔〚](\d+)\.(\d+)[〕〛]$/;
    const newMatch = trimmed.match(newRangePattern);

    if (newMatch) {
        const subject = newMatch[1];        // "民法"
        const subcategory = newMatch[2];    // "1"
        const start = parseInt(newMatch[3], 10);  // 3
        const end = parseInt(newMatch[4], 10);    // 6

        const expanded = [];
        for (let i = start; i <= end; i++) {
            expanded.push(`${subject}.${subcategory}.${i}`);
        }
        console.log(`📚 範囲展開(新形式): ${trimmed} → [${expanded.join(', ')}]`);
        return expanded;
    }

    // 旧形式範囲指定: "科目.プレフィックス-〔開始-終了〕" (例: "民法.3-〔4-6〕")
    const legacyRangePattern = /^(.+?)\.(.+?)-[〔〚](\d+)-(\d+)[〕〛]$/;
    const legacyMatch = trimmed.match(legacyRangePattern);

    if (legacyMatch) {
        const subject = legacyMatch[1];      // "民法"
        const prefix = legacyMatch[2];       // "3"
        const start = parseInt(legacyMatch[3], 10);  // 4
        const end = parseInt(legacyMatch[4], 10);    // 6

        const expanded = [];
        for (let i = start; i <= end; i++) {
            expanded.push(`${subject}.${prefix}-${i}`);
        }
        console.log(`📚 範囲展開(旧形式): ${trimmed} → [${expanded.join(', ')}]`);
        return expanded;
    }

    // 範囲指定なし: そのまま配列で返す
    return [trimmed];
}

/**
 * questionsAndAnswers配列の参照IDをすべて展開
 * @param {(string|Object)[]} qaRefs - 参照ID配列（文字列またはオブジェクト）
 * @returns {string[]} - 展開された参照IDの配列
 */
export function expandAllQARefs(qaRefs) {
    if (!Array.isArray(qaRefs)) return [];

    const expanded = [];
    for (const ref of qaRefs) {
        if (typeof ref === 'string') {
            // 文字列の場合は範囲展開を試みる
            expanded.push(...expandQARefRange(ref));
        } else if (typeof ref === 'object' && ref !== null) {
            // オブジェクト形式（旧形式）の場合はそのままスキップ
            // この関数は文字列参照のみを処理
        }
    }
    return expanded;
}

/**
 * Q&A JSONファイルを読み込む（複数ファイル対応）
 * ファイル形式: {subject}_1.json, {subject}_2.json, ... 
 * 各ファイル内の"subject"フィールドで識別
 * @param {string} subject - 科目名（例: "民法", "刑法"）
 * @returns {Promise<Object|null>} - Q&Aデータオブジェクト
 */
export async function loadQAData(subject) {
    if (!subject) {
        console.warn('⚠️ Q&Aローダー: 科目名が指定されていません');
        return null;
    }

    // キャッシュにあればそれを返す
    if (window.qaCache[subject]) {
        console.log(`📚 Q&Aキャッシュヒット: ${subject}`);
        return window.qaCache[subject];
    }

    try {
        console.log(`📚 Q&Aデータ読み込み中: ${subject}`);

        // サーバーからQ&Aファイル一覧を取得
        let qaFiles = [];
        try {
            const listResponse = await fetch('/api/qa-files');
            if (listResponse.ok) {
                const fileList = await listResponse.json();
                // 科目名で始まるファイルをフィルタリング（例: "民法_1.json", "民法_2.json"）
                qaFiles = fileList.filter(f => {
                    // ファイル名が "{subject}_" で始まり ".json" で終わるものを抽出
                    // サブカテゴリーは数字または任意の文字列（例: "刑法_1.json", "刑法_共犯.json"）
                    const pattern = new RegExp(`^${subject}_(.+)\\.json$`);
                    return pattern.test(f);
                }).sort((a, b) => {
                    // ソート順: 数字を先に、その後に非数字を五十音順
                    const matchA = a.match(new RegExp(`^${subject}_(.+)\\.json$`));
                    const matchB = b.match(new RegExp(`^${subject}_(.+)\\.json$`));
                    const subA = matchA ? matchA[1] : '';
                    const subB = matchB ? matchB[1] : '';
                    const isNumA = /^\d+$/.test(subA);
                    const isNumB = /^\d+$/.test(subB);
                    if (isNumA && isNumB) {
                        return parseInt(subA, 10) - parseInt(subB, 10);
                    } else if (isNumA) {
                        return -1; // 数字を先に
                    } else if (isNumB) {
                        return 1; // 数字を先に
                    } else {
                        return subA.localeCompare(subB, 'ja'); // 非数字は五十音順
                    }
                });
            }
        } catch (e) {
            console.warn('⚠️ Q&Aファイル一覧取得失敗、フォールバック使用');
        }

        // ファイル一覧が取得できない場合は番号を順に試す
        if (qaFiles.length === 0) {
            for (let i = 1; i <= 20; i++) {
                const testUrl = `/data/qa/${subject}_${i}.json`;
                try {
                    const testResponse = await fetch(testUrl, { method: 'HEAD' });
                    if (testResponse.ok) {
                        qaFiles.push(`${subject}_${i}.json`);
                    }
                } catch (e) {
                    // ファイルが見つからない
                }
            }
        }

        if (qaFiles.length === 0) {
            console.warn(`⚠️ Q&Aデータが見つかりません: ${subject}`);
            return null;
        }

        console.log(`📚 ${subject}のQ&Aファイル発見: ${qaFiles.length}件`);

        // 全ファイルを読み込んで統合
        const mergedData = {
            subject: subject,
            version: "1.0",
            subcategories: {},
            questions: {}
        };

        for (const filename of qaFiles) {
            const url = `/data/qa/${filename}`;

            // ファイル名からサブカテゴリーIDを抽出（例: "刑法_8.json" → "8", "刑法_共犯.json" → "共犯"）
            const subcategoryMatch = filename.match(new RegExp(`^${subject}_(.+)\.json$`));
            const fileSubcategoryId = subcategoryMatch ? subcategoryMatch[1] : '';

            try {
                const response = await fetch(url);
                if (response.ok) {
                    const fileData = await response.json();

                    // subjectフィールドで確認（ファイル名ではなく中身で判別）
                    if (fileData.subject !== subject) {
                        console.log(`⏭️ スキップ: ${filename} (subject=${fileData.subject})`);
                        continue;
                    }

                    // subcategoriesをマージ
                    if (fileData.subcategories) {
                        Object.assign(mergedData.subcategories, fileData.subcategories);
                    }

                    // questionsをマージ（各Q&Aにサブカテゴリー情報を付与）
                    // キーを「サブカテゴリー-番号」形式にして重複を防ぐ
                    if (fileData.questions) {
                        for (const [qaId, qa] of Object.entries(fileData.questions)) {
                            // マージ用キー: "8-1", "4-14" など
                            const mergeKey = fileSubcategoryId ? `${fileSubcategoryId}-${qaId}` : qaId;
                            mergedData.questions[mergeKey] = {
                                ...qa,
                                _qaId: qaId,  // 元のQ&A番号
                                _subcategoryId: fileSubcategoryId,
                                _subcategoryName: fileData.subcategories?.[fileSubcategoryId] || ''
                            };
                        }
                    }

                    console.log(`  ✅ ${filename}: ${Object.keys(fileData.questions || {}).length}問 (サブカテ: ${fileSubcategoryId})`);
                }
            } catch (e) {
                console.warn(`  ⚠️ ${filename}: 読み込み失敗`, e);
            }
        }

        const totalQuestions = Object.keys(mergedData.questions).length;
        if (totalQuestions === 0) {
            console.warn(`⚠️ Q&Aデータが見つかりません: ${subject}`);
            return null;
        }

        window.qaCache[subject] = mergedData;
        console.log(`✅ Q&Aデータ読み込み完了: ${subject} (合計${totalQuestions}問)`);

        return mergedData;
    } catch (error) {
        console.error(`❌ Q&Aデータ読み込みエラー: ${subject}`, error);
        return null;
    }
}

/**
 * 現在の科目を設定
 * @param {string} subject - 科目名
 */
export function setCurrentSubject(subject) {
    window.currentSubject = subject;
    console.log(`📚 現在の科目を設定: ${subject}`);
}

/**
 * Q&A参照IDを解析
 * 新形式: 「科目名.サブカテゴリー.Q&A番号」（例: "民法.1.3"）
 * 旧形式: 「科目名.サブカテゴリー-番号」（例: "民法.3-1"）も後方互換
 * @param {string} ref - 参照ID
 * @returns {{subject: string, subcategory: string, qaId: string}|null}
 */
export function parseQARef(ref) {
    if (!ref || typeof ref !== 'string') return null;

    const trimmed = ref.trim();

    // 新形式: "科目名.サブカテゴリー.番号" (例: "民法.1.3", "刑法.4.14")
    const newFormatMatch = trimmed.match(/^([^.]+)\.([^.]+)\.(\d+)$/);
    if (newFormatMatch) {
        return {
            subject: newFormatMatch[1],
            subcategory: newFormatMatch[2],
            qaId: newFormatMatch[3]
        };
    }

    // 旧形式完全: "科目名.サブカテ-番号" (例: "民法.3-1")
    const legacyFullMatch = trimmed.match(/^([^.]+)\.(\d+)-(\d+)$/);
    if (legacyFullMatch) {
        return {
            subject: legacyFullMatch[1],
            subcategory: legacyFullMatch[2],
            qaId: legacyFullMatch[3]
        };
    }

    // 完全形式（旧）: "科目名.番号" (例: "民法.3-1") - サブカテゴリーなし
    const oldFullMatch = trimmed.match(/^(.+?)\.(.+)$/);
    if (oldFullMatch) {
        // IDにハイフンがあればサブカテゴリー-番号形式として解析
        const idParts = oldFullMatch[2].split('-');
        if (idParts.length === 2) {
            return {
                subject: oldFullMatch[1],
                subcategory: idParts[0],
                qaId: idParts[1]
            };
        }
        // それ以外はそのまま
        return {
            subject: oldFullMatch[1],
            subcategory: '',
            qaId: oldFullMatch[2]
        };
    }

    // 省略形式: "番号" のみ（現在の科目を使用）
    if (window.currentSubject) {
        return {
            subject: window.currentSubject,
            subcategory: '',
            qaId: trimmed
        };
    }

    console.warn(`⚠️ Q&A参照解析失敗: ${ref} (現在の科目が設定されていません)`);
    return null;
}

/**
 * Q&Aを取得
 * 新形式: 「科目名.サブカテゴリー.番号」でファイル {科目名}_{サブカテゴリー}.json の ID "{番号}" を取得
 * @param {string} ref - 参照ID（例: "民法.1.3" または "刑法.4.14"）
 * @returns {Promise<{id: string, subject: string, subcategory: string, rank: string, question: string, answer: string}|null>}
 */
export async function getQA(ref) {
    const parsed = parseQARef(ref);
    if (!parsed) return null;

    // サブカテゴリーが指定されている場合は特定のファイルから取得
    if (parsed.subcategory) {
        try {
            // ファイルパス: {科目名}_{サブカテゴリー}.json
            const url = `/data/qa/${parsed.subject}_${parsed.subcategory}.json`;
            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`⚠️ Q&Aファイルが見つかりません: ${url}`);
                return null;
            }

            const data = await response.json();

            // ID "{番号}" でQ&Aを検索（サブカテゴリー番号は含まない）
            const qa = data.questions?.[parsed.qaId];
            if (!qa) {
                console.warn(`⚠️ Q&Aが見つかりません: ${parsed.subject}.${parsed.subcategory}.${parsed.qaId}`);
                return null;
            }

            return {
                id: parsed.qaId,
                subcategory: parsed.subcategory,
                fullId: `${parsed.subject}.${parsed.subcategory}.${parsed.qaId}`,
                subject: parsed.subject,
                rank: qa.rank || 'C',
                question: qa.question,
                answer: qa.answer
            };
        } catch (error) {
            console.error(`❌ Q&A取得エラー: ${ref}`, error);
            return null;
        }
    }

    // サブカテゴリーなしの旧形式: 全ファイルをマージして検索
    const data = await loadQAData(parsed.subject);
    if (!data || !data.questions) return null;

    const qa = data.questions[parsed.qaId];
    if (!qa) {
        console.warn(`⚠️ Q&Aが見つかりません: ${parsed.subject}.${parsed.qaId}`);
        return null;
    }

    return {
        id: parsed.qaId,
        subcategory: '',
        fullId: `${parsed.subject}.${parsed.qaId}`,
        subject: parsed.subject,
        rank: qa.rank || 'C',
        question: qa.question,
        answer: qa.answer
    };
}

/**
 * 複数のQ&Aを一括取得
 * @param {string[]} refs - 参照IDの配列
 * @returns {Promise<Object[]>}
 */
export async function getQAs(refs) {
    const results = await Promise.all(refs.map(ref => getQA(ref)));
    return results.filter(qa => qa !== null);
}

/**
 * 科目のQ&A一覧を取得
 * @param {string} subject - 科目名
 * @returns {Promise<Object[]>}
 */
export async function getQAsBySubject(subject) {
    const data = await loadQAData(subject);
    if (!data || !data.questions) return [];

    const subcategories = data.subcategories || {};

    return Object.entries(data.questions).map(([mergeKey, qa]) => {
        // 新形式: _subcategoryId と _qaId プロパティから情報を取得
        const subcategoryId = qa._subcategoryId || '';
        const actualQaId = qa._qaId || mergeKey;  // _qaId があればそれを使用、なければマージキーを使用
        const subcategoryName = qa._subcategoryName || subcategories[subcategoryId] || '';

        // 表示ID: 「サブカテゴリー-Q&A番号」（例: "8-1", "4-14"）
        const displayId = subcategoryId ? `${subcategoryId}-${actualQaId}` : actualQaId;

        return {
            id: displayId,
            numericId: parseInt(actualQaId, 10) || 0,
            qaId: actualQaId,  // 元のQ&A番号
            fullId: `${subject}.${subcategoryId}.${actualQaId}`,
            subject,
            subcategoryId,
            subcategoryName,
            subfolder: subcategoryId && subcategoryName ? `${subcategoryId}.${subcategoryName}` : (subcategoryName || subcategoryId || ''),
            rank: qa.rank || 'C',
            question: qa.question,
            answer: qa.answer
        };
    });
}

/**
 * ★★★ 高速版: 科目＋サブカテゴリ指定でQ&Aを取得（単一ファイルのみ読み込み） ★★★
 * @param {string} subject - 科目名
 * @param {string} subcategoryId - サブカテゴリID（番号）
 * @returns {Promise<Object[]>}
 */
export async function getQAsBySubjectAndSubcategory(subject, subcategoryId) {
    if (!subject || !subcategoryId) {
        console.warn('⚠️ getQAsBySubjectAndSubcategory: 科目名またはサブカテゴリIDが指定されていません');
        return [];
    }

    const url = `/data/qa/${subject}_${subcategoryId}.json`;
    console.log(`⚡ 高速読み込み: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`⚠️ ファイルが見つかりません: ${url}`);
            return [];
        }

        const fileData = await response.json();
        if (fileData.subject !== subject) {
            console.warn(`⚠️ スキップ: ${url} (subject=${fileData.subject})`);
            return [];
        }

        const subcategories = fileData.subcategories || {};
        const subcategoryName = subcategories[subcategoryId] || '';

        const result = Object.entries(fileData.questions || {}).map(([qaId, qa]) => {
            const displayId = `${subcategoryId}-${qaId}`;
            return {
                id: displayId,
                numericId: parseInt(qaId, 10) || 0,
                qaId: qaId,
                fullId: `${subject}.${subcategoryId}.${qaId}`,
                subject,
                subcategoryId,
                subcategoryName,
                subfolder: subcategoryId && subcategoryName ? `${subcategoryId}.${subcategoryName}` : (subcategoryName || subcategoryId || ''),
                rank: qa.rank || 'C',
                question: qa.question,
                answer: qa.answer
            };
        });

        console.log(`⚡ 高速読み込み完了: ${subject}/${subcategoryId} (${result.length}問)`);
        return result;
    } catch (error) {
        console.error(`❌ 高速読み込みエラー: ${url}`, error);
        return [];
    }
}

/**
 * 利用可能な全科目リスト
 */
export const AVAILABLE_SUBJECTS = [
    '民法',
    '刑法',
    '刑事訴訟法',
    '民事訴訟法',
    '商法',
    '行政法',
    '憲法'
];

/**
 * 全科目のQ&Aを一括取得
 * @returns {Promise<Object[]>} - 全科目のQ&A配列
 */
export async function getAllQAs() {
    console.log('📚 全科目のQ&Aを読み込み中...');

    const allQAs = [];

    for (const subject of AVAILABLE_SUBJECTS) {
        try {
            const qas = await getQAsBySubject(subject);
            if (qas.length > 0) {
                console.log(`  ✅ ${subject}: ${qas.length}問`);
                allQAs.push(...qas);
            }
        } catch (error) {
            console.warn(`  ⚠️ ${subject}: 読み込み失敗`, error);
        }
    }

    console.log(`📚 全Q&A読み込み完了: ${allQAs.length}問`);
    return allQAs;
}

/**
 * モジュールで使用するQ&Aリストを構築（後方互換性用）
 * @param {string} subject - 科目名
 * @param {string[]} qaRefs - Q&A参照IDの配列（例: ["3-1", "3-2", "民法.1-5"]）
 * @returns {Promise<Object[]>} - 従来形式のquestionsAndAnswers配列
 */
export async function buildModuleQAList(subject, qaRefs) {
    setCurrentSubject(subject);

    const qaList = [];
    let index = 1;

    for (const ref of qaRefs) {
        const qa = await getQA(ref);
        if (qa) {
            qaList.push({
                id: index,
                refId: qa.fullId,  // 完全参照ID
                rank: qa.rank,
                question: qa.question,
                answer: qa.answer
            });
            index++;
        }
    }

    return qaList;
}

/**
 * モジュールのquestionsAndAnswers配列を解決する
 * 文字列参照（"民法.3-1"形式）をQ&Aデータオブジェクトに変換
 * 範囲指定（"民法.3-〔4-6〕"形式）も展開して解決
 * 
 * @param {(string|Object)[]} questionsAndAnswers - 参照IDまたはQ&Aオブジェクトの配列
 * @returns {Promise<Object[]>} - 解決されたQ&Aオブジェクトの配列
 */
export async function resolveQuestionsAndAnswers(questionsAndAnswers) {
    if (!Array.isArray(questionsAndAnswers)) return [];

    const resolvedList = [];
    let autoId = 1;

    for (const item of questionsAndAnswers) {
        if (typeof item === 'string') {
            // 文字列参照の場合: 範囲展開 → Q&A取得
            const expandedRefs = expandQARefRange(item);

            for (const ref of expandedRefs) {
                const qa = await getQA(ref);
                if (qa) {
                    // 表示用ID: サブカテゴリー-番号 形式（例: "4-14"）
                    const displayId = qa.subcategory ? `${qa.subcategory}-${qa.id}` : qa.id;
                    resolvedList.push({
                        id: displayId,
                        numericId: parseInt(qa.id, 10) || autoId++,
                        refId: qa.fullId,
                        subject: qa.subject,
                        subcategory: qa.subcategory,
                        rank: qa.rank,
                        question: qa.question,
                        answer: qa.answer
                    });
                } else {
                    console.warn(`⚠️ Q&A参照が解決できません: ${ref}`);
                }
            }
        } else if (typeof item === 'object' && item !== null) {
            // オブジェクト形式（旧形式）: そのまま使用
            resolvedList.push({
                ...item,
                id: item.id || autoId++
            });
        }
    }

    console.log(`📚 Q&A解決完了: ${resolvedList.length}件`);
    return resolvedList;
}

// グローバル公開
window.qaLoader = {
    loadQAData,
    setCurrentSubject,
    parseQARef,
    getQA,
    getQAs,
    getQAsBySubject,
    getQAsBySubjectAndSubcategory,
    getAllQAs,
    AVAILABLE_SUBJECTS,
    buildModuleQAList,
    expandQARefRange,
    expandAllQARefs,
    resolveQuestionsAndAnswers
};

export default {
    loadQAData,
    setCurrentSubject,
    parseQARef,
    getQA,
    getQAs,
    getQAsBySubject,
    getQAsBySubjectAndSubcategory,
    getAllQAs,
    AVAILABLE_SUBJECTS,
    buildModuleQAList,
    expandQARefRange,
    expandAllQARefs,
    resolveQuestionsAndAnswers
};
