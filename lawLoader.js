// lawLoader.js - 完全書き直し版（getTextContent関数強化版）

import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';
import fetch from 'node-fetch';

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');

// ★★★ ファイル名ベースキャッシュ ★★★
let lawFileNameCache = new Map();

// ★★★ 法令名マッピング ★★★
const LAW_NAME_MAPPING = {
    '民法': '民法',
    '刑法': '刑法',
    '商法': '商法',
    '会社法': '会社法',
    '憲法': '日本国憲法',
    '日本国憲法': '日本国憲法',
    '民事訴訟法': '民事訴訟法',
    '刑事訴訟法': '刑事訴訟法',
    '行政事件訴訟法': '行政事件訴訟法',
    '行政手続法': '行政手続法',
    '行政不服審査法': '行政不服審査法',
    '国家賠償法': '国家賠償法',
    '地方自治法': '地方自治法',
    '労働基準法': '労働基準法',
    '独占禁止法': '私的独占の禁止及び公正取引の確保に関する法律'
};

// ★★★ 特定法令の除外パターン ★★★
const LAW_EXCLUSION_PATTERNS = {
    // 除外パターンは削除されました
};



// ★★★ 数値⇔漢数字変換（完全版） ★★★
const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const kanjiUnits = ['', '十', '百', '千'];

function numToKanji(num) {
    if (num === 0) return '零';
    if (num < 0) return '負' + numToKanji(-num);
    
    let result = '';
    const s = String(num);
    
    for (let i = 0; i < s.length; i++) {
        const digit = parseInt(s[i]);
        if (digit === 0) continue;
        
        const unit = kanjiUnits[s.length - i - 1];
        
        if (digit === 1 && unit && unit !== '' && s.length - i - 1 > 0) {
            result += unit;
            continue;
        }
        
        result += kanjiDigits[digit] + (unit || '');
    }
    
    return result || '零';
}

// ★★★ XMLからテキストを抽出（完全修正版） ★★★
export function getTextContent(node) {
    if (!node) return '';
    if (typeof node === 'string') return node;
    
    // XMLパーサーでのテキストコンテント（_プロパティ）
    if (node._ && typeof node._ === 'string') {
        return node._;
    }
    
    let content = '';
    
    // オブジェクトの場合、すべてのプロパティを再帰的に処理
    for (const key in node) {
        if (key === '$') continue; // 属性はスキップ
        if (key === 'Rt') continue; // ルビの読み仮名はスキップ
        
        const child = node[key];
        
        if (Array.isArray(child)) {
            content += child.map(c => getTextContent(c)).join('');
        } else if (typeof child === 'object' && child !== null) {
            content += getTextContent(child);
        } else if (typeof child === 'string') {
            content += child;
        }
    }
    
    return content;
}

// ★★★ parseInputText関数（1条・2条対応） ★★★
function parseInputText(inputText, supportedLaws) {
    if (!inputText || typeof inputText !== 'string') {
        return { success: false, error: '入力が無効です' };
    }
    
    const trimmedInput = inputText.trim();
    console.log(`🔍 条文解析開始: "${trimmedInput}"`);
    
    const lawPattern = supportedLaws.map(law => 
        law.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    // ★★★ パターン1: 「民法548条の2第1項2号」形式 ★★★
    const pattern1 = new RegExp(`^(${lawPattern})(\\d+)条の(\\d+)第(\\d+)項(\\d+)号$`);
    const match1 = pattern1.exec(trimmedInput);
    if (match1) {
        return {
            success: true,
            lawName: match1[1],
            articleNumber: `${match1[2]}_${match1[3]}`,
            paragraphNumber: match1[4],
            itemNumber: match1[5]
        };
    }

    // ★★★ パターン2: 「民法197条1項2号」形式 ★★★
    const pattern2 = new RegExp(`^(${lawPattern})(\\d+)条(\\d+)項(\\d+)号$`);
    const match2 = pattern2.exec(trimmedInput);
    if (match2) {
        return {
            success: true,
            lawName: match2[1],
            articleNumber: match2[2],
            paragraphNumber: match2[3],
            itemNumber: match2[4]
        };
    }

    // ★★★ パターン3: 「民法548条の2第1項」形式 ★★★
    const pattern3 = new RegExp(`^(${lawPattern})(\\d+)条の(\\d+)第(\\d+)項$`);
    const match3 = pattern3.exec(trimmedInput);
    if (match3) {
        return {
            success: true,
            lawName: match3[1],
            articleNumber: `${match3[2]}_${match3[3]}`,
            paragraphNumber: match3[4]
        };
    }

    // ★★★ パターン4: 「民法548の2第1項」形式 ★★★
    const pattern4 = new RegExp(`^(${lawPattern})(\\d+)の(\\d+)第(\\d+)項$`);
    const match4 = pattern4.exec(trimmedInput);
    if (match4) {
        return {
            success: true,
            lawName: match4[1],
            articleNumber: `${match4[2]}_${match4[3]}`,
            paragraphNumber: match4[4]
        };
    }

    // ★★★ パターン5-11: その他のパターン ★★★
    const patterns = [
        { regex: new RegExp(`^(${lawPattern})(\\d+)条(\\d+)項$`), format: (m) => ({ lawName: m[1], articleNumber: m[2], paragraphNumber: m[3] }) },
        { regex: new RegExp(`^(${lawPattern})(\\d+)条第(\\d+)項$`), format: (m) => ({ lawName: m[1], articleNumber: m[2], paragraphNumber: m[3] }) },
        { regex: new RegExp(`^(${lawPattern})(\\d+)第(\\d+)項$`), format: (m) => ({ lawName: m[1], articleNumber: m[2], paragraphNumber: m[3] }) },
        { regex: new RegExp(`^(${lawPattern})(\\d+)条の(\\d+)$`), format: (m) => ({ lawName: m[1], articleNumber: `${m[2]}_${m[3]}` }) },
        { regex: new RegExp(`^(${lawPattern})(\\d+)の(\\d+)$`), format: (m) => ({ lawName: m[1], articleNumber: `${m[2]}_${m[3]}` }) },
        { regex: new RegExp(`^(${lawPattern})(\\d+)条$`), format: (m) => ({ lawName: m[1], articleNumber: m[2] }) },
        { regex: new RegExp(`^(${lawPattern})第(\\d+)条$`), format: (m) => ({ lawName: m[1], articleNumber: m[2] }) }
    ];

    for (const pattern of patterns) {
        const match = pattern.regex.exec(trimmedInput);
        if (match) {
            return { success: true, ...pattern.format(match) };
        }
    }

    return { 
        success: false, 
        error: `対応していない形式: "${trimmedInput}"`,
        supportedFormats: [
            "民法1条",
            "民法2条",
            "民法548条の2",
            "民法548条の2第1項",
            "民法548の2第1項", 
            "民法109条1項",
            "民法110条",
            "民法第110条"
        ]
    };
}

// ★★★ XMLファイル保存 ★★★
export async function saveLawXMLWithFileName(lawName, xmlText, lawId) {
    try {
        const lawsDir = path.join(__dirname, 'laws');
        await fs.mkdir(lawsDir, { recursive: true });
        
        const fileName = `${lawName}-${lawId}.xml`;
        const filePath = path.join(lawsDir, fileName);
        
        await fs.writeFile(filePath, xmlText, 'utf-8');
        lawFileNameCache.set(lawName, fileName);
        
        console.log(`💾 XMLファイル保存: ${fileName} (${Math.round(xmlText.length / 1024)}KB)`);
        return fileName;
    } catch (error) {
        console.error(`❌ XMLファイル保存エラー (${lawName}):`, error.message);
        throw error;
    }
}

// ★★★ XMLファイル読み込み ★★★
export async function loadLawXMLByFileName(fileName) {
    try {
        const filePath = path.join(__dirname, 'laws', fileName);
        const xmlText = await fs.readFile(filePath, 'utf-8');
        console.log(`📖 XMLファイル読み込み: ${fileName} (${Math.round(xmlText.length / 1024)}KB)`);
        return xmlText;
    } catch (error) {
        console.error(`❌ XMLファイル読み込みエラー (${fileName}):`, error.message);
        throw error;
    }
}

// ★★★ ファイル名からIDを抽出 ★★★
export function extractIdFromFileName(fileName) {
    const match = fileName.match(/^(.+)-([A-F0-9]+)\.xml$/);
    if (match) {
        return { lawName: match[1], lawId: match[2] };
    }
    return null;
}

// ★★★ 既存XMLファイルの読み込み ★★★
export async function loadExistingXMLFiles() {
    const existingFiles = new Map();
    
    try {
        const lawsDir = path.join(__dirname, 'laws');
        await fs.mkdir(lawsDir, { recursive: true });
        
        const files = await fs.readdir(lawsDir);
        const xmlFiles = files.filter(f => f.endsWith('.xml'));
        
        console.log(`📂 既存XMLファイル検索: ${xmlFiles.length}件発見`);
        
        for (const fileName of xmlFiles) {
            try {
                const xmlText = await loadLawXMLByFileName(fileName);
                existingFiles.set(fileName, xmlText);
                
                const extracted = extractIdFromFileName(fileName);
                if (extracted) {
                    lawFileNameCache.set(extracted.lawName, fileName);
                }
                
            } catch (error) {
                console.warn(`⚠️ ${fileName} の読み込みに失敗:`, error.message);
            }
        }
        
        console.log(`✅ 既存XMLファイル読み込み完了: ${existingFiles.size}件`);
        
    } catch (error) {
        console.error('❌ 既存XMLファイル読み込みエラー:', error.message);
    }
    
    return existingFiles;
}

// ★★★ レガシーファイルの移行 ★★★
export async function migrateLegacyFiles(existingFiles) {
    const lawsDir = path.join(__dirname, 'laws');
    let migrationCount = 0;
    
    try {
        const files = await fs.readdir(lawsDir);
        const legacyFiles = files.filter(f => f.endsWith('.xml') && !f.includes('-'));
        
        if (legacyFiles.length === 0) {
            console.log('📁 レガシーファイルは見つかりませんでした');
            return existingFiles;
        }
        
        console.log(`🔄 レガシーファイル移行開始: ${legacyFiles.length}件`);
        
        for (const legacyFile of legacyFiles) {
            try {
                const lawName = path.basename(legacyFile, '.xml');
                const xmlText = await loadLawXMLByFileName(legacyFile);
                
                const lawId = await getLawIdFromAPI(lawName);
                if (lawId) {
                    const newFileName = await saveLawXMLWithFileName(lawName, xmlText, lawId);
                    existingFiles.set(newFileName, xmlText);
                    
                    const legacyPath = path.join(lawsDir, legacyFile);
                    await fs.unlink(legacyPath);
                    
                    migrationCount++;
                    console.log(`✅ 移行完了: ${legacyFile} → ${newFileName}`);
                }
                
            } catch (error) {
                console.warn(`⚠️ ${legacyFile} の移行に失敗:`, error.message);
            }
        }
        
        console.log(`🎉 レガシーファイル移行完了: ${migrationCount}件`);
        
    } catch (error) {
        console.error('❌ レガシーファイル移行エラー:', error.message);
    }
    
    return existingFiles;
}

// ★★★ 法令名の正規化 ★★★
function normalizeLawName(name) {
    if (!name) return '';
    
    return name
        .replace(/（.+?）/g, '') // 日本語括弧内を削除
        .replace(/\(.+?\)/g, '') // 英語括弧内を削除
        .replace(/\s+/g, '') // 空白文字を削除
        .replace(/法律第.+?号/g, '') // 法律番号を削除
        .replace(/^昭和.+?年/, '') // 昭和年を削除
        .replace(/^平成.+?年/, '') // 平成年を削除
        .replace(/^令和.+?年/, '') // 令和年を削除
        .replace(/第.+?条/, '') // 条文番号を削除
        .trim();
}

// ★★★ より厳密な完全一致判定 ★★★
function isStrictExactMatch(target, found) {
    const normalizedTarget = normalizeLawName(target);
    const normalizedFound = normalizeLawName(found);
    
    // 完全一致
    if (normalizedTarget === normalizedFound) return true;
    
    // マッピング後の一致
    const mappedTarget = LAW_NAME_MAPPING[target] || target;
    const normalizedMappedTarget = normalizeLawName(mappedTarget);
    if (normalizedMappedTarget === normalizedFound) return true;
    
    // 「法」を除いた一致
    const targetWithoutLaw = normalizedTarget.replace(/法$/, '');
    const foundWithoutLaw = normalizedFound.replace(/法$/, '');
    if (targetWithoutLaw && foundWithoutLaw && targetWithoutLaw === foundWithoutLaw) return true;
    
    return false;
}

// ★★★ e-Gov APIから法令IDを取得 ★★★
export async function getLawIdFromAPI(lawName, retryCount = 0) {
    const maxRetries = 3;
    const baseDelay = 2000;
    
    try {
        console.log(`🔍 法令ID検索: ${lawName} (試行 ${retryCount + 1}/${maxRetries + 1})`);
        
        const mappedLawName = LAW_NAME_MAPPING[lawName] || lawName;
        console.log(`🔄 法令名マッピング: ${lawName} → ${mappedLawName}`);
        
        const searchPatterns = [
            mappedLawName,
            lawName,
            `${mappedLawName}*`,
            `*${mappedLawName}*`,
            mappedLawName.replace(/法$/, ''),
            lawName.replace(/法$/, '')
        ];
        
        for (const pattern of searchPatterns) {
            console.log(`🔍 検索パターン: "${pattern}"`);
            
            try {
                const searchUrl = `https://elaws.e-gov.go.jp/api/1/lawlists/1?keyword=${encodeURIComponent(pattern)}`;
                
                const response = await fetch(searchUrl, {
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/xml, text/xml, */*',
                        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 15000
                });
                
                if (!response.ok) {
                    console.warn(`⚠️ API応答エラー (${pattern}): ${response.status} ${response.statusText}`);
                    continue;
                }
                
                const xmlText = await response.text();
                console.log(`📄 XMLレスポンス長: ${xmlText.length}文字`);
                
                const parser = new xml2js.Parser({
                    explicitArray: true,
                    ignoreAttrs: false,
                    trim: true
                });
                const result = await parser.parseStringPromise(xmlText);
                
                let laws = [];
                
                if (result?.DataRoot?.ApplData?.[0]?.LawNameListInfo) {
                    laws = result.DataRoot.ApplData[0].LawNameListInfo;
                } else if (result?.DataRoot?.LawNameListInfo) {
                    laws = result.DataRoot.LawNameListInfo;
                } else if (result?.ApplData?.[0]?.LawNameListInfo) {
                    laws = result.ApplData[0].LawNameListInfo;
                } else if (result?.LawNameListInfo) {
                    laws = result.LawNameListInfo;
                }
                
                console.log(`📋 発見された法令数: ${laws.length}`);
                
                // 完全一致と部分一致を分けて処理
                let exactMatches = [];
                let partialMatches = [];
                
                for (const law of laws) {
                    const lawInfo = law.LawNameListInfo?.[0] || law;
                    const foundLawName = lawInfo?.LawName?.[0] || lawInfo?.LawName;
                    const lawId = lawInfo?.LawId?.[0] || lawInfo?.LawId;
                    
                    if (foundLawName && lawId) {
                        // より厳密な完全一致をチェック
                        if (isStrictExactMatch(lawName, foundLawName) || isStrictExactMatch(mappedLawName, foundLawName)) {
                            exactMatches.push({ foundLawName, lawId });
                            console.log(`🎯 厳密完全一致発見: ${lawName} → ${foundLawName} (ID: ${lawId})`);
                        }
                        // 従来の完全一致をチェック
                        else if (foundLawName === lawName || foundLawName === mappedLawName) {
                            exactMatches.push({ foundLawName, lawId });
                            console.log(`🎯 完全一致発見: ${lawName} → ${foundLawName} (ID: ${lawId})`);
                        }
                        // 部分一致をチェック
                        else if (foundLawName.includes(lawName) || lawName.includes(foundLawName) ||
                                foundLawName.includes(mappedLawName) || mappedLawName.includes(foundLawName)) {
                            partialMatches.push({ foundLawName, lawId });
                            console.log(`📝 部分一致発見: ${lawName} → ${foundLawName} (ID: ${lawId})`);
                        }
                    }
                }
                
                // 完全一致を優先して返す
                if (exactMatches.length > 0) {
                    const match = exactMatches[0];
                    console.log(`✅ 完全一致を採用: ${lawName} → ${match.foundLawName} (ID: ${match.lawId})`);
                    return match.lawId;
                }
                
                // 完全一致がない場合は部分一致を使用
                if (partialMatches.length > 0) {
                    const match = partialMatches[0];
                    console.log(`✅ 部分一致を採用: ${lawName} → ${match.foundLawName} (ID: ${match.lawId})`);
                    return match.lawId;
                }
                
            } catch (fetchError) {
                console.warn(`⚠️ パターン "${pattern}" でエラー:`, fetchError.message);
                continue;
            }
        }
        
        console.log(`⚠️ 法令ID未発見: ${lawName}`);
        return null;
        
    } catch (error) {
        console.error(`❌ 法令ID取得エラー (${lawName}, 試行 ${retryCount + 1}):`, error.message);
        
        if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount);
            console.log(`🔄 ${delay}ms後にリトライします...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return getLawIdFromAPI(lawName, retryCount + 1);
        }
        
        return null;
    }
}

// ★★★ XMLファイルを確保 ★★★
export async function ensureLawXMLByFileName(lawName, existingFiles) {
    const cachedFileName = lawFileNameCache.get(lawName);
    if (cachedFileName && existingFiles.has(cachedFileName)) {
        console.log(`📋 キャッシュヒット: ${lawName} → ${cachedFileName}`);
        return existingFiles.get(cachedFileName);
    }
    
    for (const [fileName, xmlText] of existingFiles) {
        const extracted = extractIdFromFileName(fileName);
        if (extracted && extracted.lawName === lawName) {
            lawFileNameCache.set(lawName, fileName);
            console.log(`📋 ファイル名マッチ: ${lawName} → ${fileName}`);
            return xmlText;
        }
    }
    
    try {
        console.log(`🌐 API取得開始: ${lawName}`);
        
        const lawId = await getLawIdFromAPI(lawName);
        if (!lawId) {
            throw new Error(`法令ID取得失敗: ${lawName}`);
        }
        
        const lawUrl = `https://elaws.e-gov.go.jp/api/1/lawdata/${lawId}`;
        
        const response = await fetch(lawUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache'
            },
            timeout: 30000
        });
        
        if (!response.ok) {
            throw new Error(`法令データ取得失敗: ${response.status} ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        console.log(`📄 法令データ取得完了: ${lawName} (${Math.round(xmlText.length / 1024)}KB)`);
        
        const fileName = await saveLawXMLWithFileName(lawName, xmlText, lawId);
        existingFiles.set(fileName, xmlText);
        
        console.log(`✅ API取得完了: ${lawName} → ${fileName}`);
        return xmlText;
        
    } catch (error) {
        console.error(`❌ ${lawName} の取得に失敗:`, error.message);
        throw error;
    }
}

// ★★★ 全法令の更新チェック ★★★
export async function updateAllSupportedLaws(supportedLaws, existingFiles) {
    console.log(`🔄 全法令更新チェック開始: ${supportedLaws.length}件`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    existingFiles = await migrateLegacyFiles(existingFiles);
    
    for (let i = 0; i < supportedLaws.length; i++) {
        const lawName = supportedLaws[i];
        const progress = `[${i + 1}/${supportedLaws.length}]`;
        
        try {
            console.log(`${progress} 処理中: ${lawName}`);
            await ensureLawXMLByFileName(lawName, existingFiles);
            
            results.push({ lawName, status: 'success' });
            successCount++;
            console.log(`${progress} ✅ 完了: ${lawName}`);
            
        } catch (error) {
            results.push({ lawName, status: 'error', error: error.message });
            errorCount++;
            console.log(`${progress} ❌ エラー: ${lawName} - ${error.message}`);
        }
        
        if (i < supportedLaws.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
    
    console.log(`🎉 全法令更新チェック完了: 成功 ${successCount}件, エラー ${errorCount}件`);
    
    return { results, existingFiles };
}

// ★★★ 条文ノードを検索（1条・2条完全対応） ★★★
export function findArticleNode(lawData, articleNumber) {
    console.log(`🔍 条文検索開始: Article Num="${articleNumber}"`);
    
    function searchRecursive(obj, depth = 0, parentType = '') {
        if (!obj || typeof obj !== 'object') return null;
        
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const result = searchRecursive(item, depth, parentType);
                if (result) return result;
            }
            return null;
        }
        
        // ★★★ Article要素のみを対象にする ★★★
        const currentType = obj.$ && obj.$.Num ? (obj.ArticleTitle ? 'Article' : 'Other') : parentType;
        
        if (obj.$ && obj.$.Num && (obj.ArticleTitle || obj.ArticleCaption)) {
            const num = obj.$.Num;
            
            // 完全一致
            if (num === articleNumber) {
                console.log(`🎯 条文発見（完全一致）: Article Num="${num}" (depth: ${depth})`);
                return obj;
            }
            
            // 548条の2対応
            if (articleNumber.includes('_')) {
                const parts = articleNumber.split('_');
                if (parts.length === 2) {
                    const altFormat = `${parts[0]}の${parts[1]}`;
                    if (num === altFormat) {
                        console.log(`🎯 条文発見（548条の2一致）: Article Num="${num}" (depth: ${depth})`);
                        return obj;
                    }
                }
            }
            
            if (num.includes('の') && !articleNumber.includes('_')) {
                const convertedArticle = num.replace('の', '_');
                if (convertedArticle === articleNumber) {
                    console.log(`🎯 条文発見（逆変換一致）: Article Num="${num}" (depth: ${depth})`);
                    return obj;
                }
            }
        }
        
        for (const key in obj) {
            if (key !== '$' && obj[key]) {
                const result = searchRecursive(obj[key], depth + 1, currentType);
                if (result) return result;
            }
        }
        
        return null;
    }
    
    const result = searchRecursive(lawData);
    if (!result) {
        console.log(`❌ 条文が見つかりません: Article Num="${articleNumber}"`);
    }
    return result;
}

// ★★★ 条文ノードを整形（完全修正版・1条・2条完全対応） ★★★
export function formatArticleNode(articleNode, paragraphNumber = null, itemNumber = null) {
    let content = '';
    
    try {
        console.log(`📄 条文ノード整形開始:`, Object.keys(articleNode));
        const articleNum = articleNode.$.Num || '';
        console.log(`📄 条文番号: ${articleNum}`);
        
        // ★★★ 条文番号の表示形式を統一 ★★★
        let displayNum = articleNum;
        if (articleNum.includes('_')) {
            const parts = articleNum.split('_');
            displayNum = `${numToKanji(parseInt(parts[0]))}条の${numToKanji(parseInt(parts[1]))}`;
        } else if (articleNum.includes('の')) {
            const parts = articleNum.split('の');
            displayNum = `${numToKanji(parseInt(parts[0]))}条の${numToKanji(parseInt(parts[1]))}`;
        } else {
            displayNum = numToKanji(parseInt(articleNum));
        }
        
        // ★★★ 条文見出し（ArticleCaption）の処理 ★★★
        const articleCaption = articleNode.ArticleCaption ? getTextContent(articleNode.ArticleCaption) : '';
        console.log(`📄 条文見出し: "${articleCaption}"`);
        
        // ★★★ 表示形式の統一（見出しは括弧内に表示） ★★★
        if (articleCaption) {
            content += `（${articleCaption}）\n`;
        }
        
        content += `第${displayNum}条　`;
        
        // ★★★ 条文本文の処理（Paragraph要素を直接処理） ★★★
        if (articleNode.Paragraph) {
            console.log(`📄 Paragraph要素存在: ${Array.isArray(articleNode.Paragraph) ? '配列' : 'オブジェクト'}`);
            content += formatParagraphs(articleNode.Paragraph, paragraphNumber, itemNumber);
        } else {
            console.log(`❌ Paragraph要素が存在しません`);
            console.log(`利用可能なキー:`, Object.keys(articleNode));
        }
        
        console.log(`📄 整形完了 - 結果: "${content}"`);
        return content;
        
    } catch (error) {
        console.error('❌ 条文整形エラー:', error);
        return '条文の整形中にエラーが発生しました';
    }
}

// ★★★ 段落を整形（完全修正版・explicitArray: false対応） ★★★
function formatParagraphs(paragraphs, targetParagraph, targetItem) {
    let content = '';
    
    try {
        const paragraphArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
        
        paragraphArray.forEach((para, index) => {
            const paraNum = para.$ && para.$.Num ? para.$.Num : (index + 1).toString();
            
            if (targetParagraph && paraNum !== targetParagraph) {
                return;
            }
            
            // ★★★ 項番号の表示（２項以降のみ・半角数字で表示） ★★★
            if (paragraphArray.length > 1 && paraNum !== '1') {
                content += `\n${paraNum}　`;
            }
            
            // ★★★ ParagraphSentence要素の処理 ★★★
            if (para.ParagraphSentence) {
                console.log(`📄 条文処理: Paragraph ${paraNum} - ParagraphSentence発見`);
                const paragraphSentences = Array.isArray(para.ParagraphSentence) ? para.ParagraphSentence : [para.ParagraphSentence];
                paragraphSentences.forEach((paragraphSentence, index) => {
                    // ParagraphSentenceが直接Sentenceを含む場合
                    if (paragraphSentence.Sentence) {
                        const sentenceArray = Array.isArray(paragraphSentence.Sentence) ? paragraphSentence.Sentence : [paragraphSentence.Sentence];
                        sentenceArray.forEach((sent, sentIndex) => {
                            const sentenceText = getTextContent(sent);
                            console.log(`📝 Sentence ${sentIndex} 抽出: "${sentenceText}"`);
                            content += sentenceText;
                        });
                    } else {
                        // ParagraphSentence自体にテキストが含まれる場合
                        const paragraphText = getTextContent(paragraphSentence);
                        console.log(`📝 ParagraphSentence直接テキスト: "${paragraphText}"`);
                        content += paragraphText;
                    }
                });
            } else {
                // ParagraphSentenceが存在しない場合のデバッグ出力
                console.log(`❌ ParagraphSentence未発見 - Paragraph ${paraNum}`);
                console.log(`Paragraph keys:`, Object.keys(para));
            }
            
            // ★★★ Item要素を処理（号の表示・インデント対応） ★★★
            if (para.Item) {
                const items = Array.isArray(para.Item) ? para.Item : [para.Item];
                items.forEach(item => {
                    const itemNum = item.$ && item.$.Num ? item.$.Num : '';
                    
                    if (targetItem && itemNum === targetItem) {
                        content += `\n<span style="background-color: #fef08a; padding: 2px 4px; border-radius: 3px;">`;
                    } else {
                        content += '\n';
                    }
                    
                    // ★★★ 号番号を漢数字で表示（インデント対応） ★★★
                    content += `${numToKanji(parseInt(itemNum))}　`;
                    
                    if (item.ItemSentence) {
                        const itemSentences = Array.isArray(item.ItemSentence) ? item.ItemSentence : [item.ItemSentence];
                        itemSentences.forEach(itemSent => {
                            if (itemSent.Sentence) {
                                const sentenceArray = Array.isArray(itemSent.Sentence) ? itemSent.Sentence : [itemSent.Sentence];
                                sentenceArray.forEach(sent => {
                                    content += getTextContent(sent);
                                });
                            }
                        });
                    }
                    
                    // Subitem1要素も処理（インデント対応）
                    if (item.Subitem1) {
                        const subitems = Array.isArray(item.Subitem1) ? item.Subitem1 : [item.Subitem1];
                        subitems.forEach(subitem => {
                            const subitemNum = subitem.$.Num || '';
                            content += `\n　　${numToKanji(parseInt(subitemNum))}　`;
                            
                            if (subitem.Subitem1Sentence) {
                                const subitemSentences = Array.isArray(subitem.Subitem1Sentence) ? subitem.Subitem1Sentence : [subitem.Subitem1Sentence];
                                subitemSentences.forEach(subitemSent => {
                                    if (subitemSent.Sentence) {
                                        const sentenceArray = Array.isArray(subitemSent.Sentence) ? subitemSent.Sentence : [subitemSent.Sentence];
                                        sentenceArray.forEach(sent => {
                                            content += getTextContent(sent);
                                        });
                                    }
                                });
                            }
                        });
                    }
                    
                    if (targetItem && itemNum === targetItem) {
                        content += '</span>';
                    }
                });
            }
        });
        
        return content;
        
    } catch (error) {
        console.error('❌ 段落整形エラー:', error);
        return '段落の整形中にエラーが発生しました';
    }
}

// ★★★ 整形済み条文を取得（完全修正版） ★★★
export async function getFormattedArticle(lawName, articleNumber, paragraphNumber = null, existingFiles = new Map()) {
    try {
        console.log(`📖 条文取得開始: ${lawName} 第${articleNumber}条${paragraphNumber ? ` 第${paragraphNumber}項` : ''}`);
        
        const xmlText = await ensureLawXMLByFileName(lawName, existingFiles);
        console.log(`📄 XML読み込み完了: ${xmlText.length}文字`);
        
        const parser = new xml2js.Parser({
            explicitArray: false,
            ignoreAttrs: false,
            trim: true,
            mergeAttrs: false,
            explicitCharkey: false
        });
        const lawData = await parser.parseStringPromise(xmlText);
        console.log(`📄 XMLパース完了`);
        
        const articleNode = findArticleNode(lawData, articleNumber);
        if (!articleNode) {
            console.log(`❌ 条文ノードが見つかりません: ${lawName} 第${articleNumber}条`);
            return `❌ 条文が見つかりませんでした: ${lawName} 第${articleNumber}条`;
        }
        
        console.log(`🎯 条文ノード発見: ${lawName} 第${articleNumber}条`);
        const formattedText = formatArticleNode(articleNode, paragraphNumber);
        console.log(`✅ 条文取得成功: ${lawName} 第${articleNumber}条`);
        console.log(`📋 最終結果: "${formattedText}"`);
        
        return formattedText;
        
    } catch (error) {
        console.error(`❌ 条文取得エラー (${lawName} 第${articleNumber}条):`, error.message);
        return `❌ 条文の取得中にエラーが発生しました: ${error.message}`;
    }
}

// ★★★ parseAndGetArticle関数 ★★★
export async function parseAndGetArticle(inputText, supportedLaws = null, existingFiles = new Map()) {
    const lawsList = supportedLaws || ['民法', '会社法', '刑法', '商法', '日本国憲法'];
    const parseResult = parseInputText(inputText, lawsList);
    
    if (!parseResult.success) {
        return `❌ 対応していない形式です: "${inputText}"\n\n対応形式の例：\n- 民法1条\n- 民法2条\n- 民法548条の2\n- 民法548条の2第1項\n- 民法548の2第1項\n- 会社法784条\n- 民法109条1項\n- 民法197条1項2号`;
    }
    
    const { lawName, articleNumber, paragraphNumber, itemNumber } = parseResult;
    
    try {
        const articleText = await getFormattedArticle(lawName, articleNumber, paragraphNumber, existingFiles);
        return articleText;
    } catch (error) {
        return `❌ 条文の取得中にエラーが発生しました: ${error.message}`;
    }
}

// ★★★ 法令全文を取得 ★★★
export async function getLawFullText(lawName, existingFiles = new Map()) {
    try {
        console.log(`📚 法令全文取得: ${lawName}`);
        
        const xmlText = await ensureLawXMLByFileName(lawName, existingFiles);
        
        const parser = new xml2js.Parser({
            explicitArray: false,
            ignoreAttrs: false,
            trim: true,
            mergeAttrs: false,
            explicitCharkey: false
        });
        const lawData = await parser.parseStringPromise(xmlText);
        
        const fullText = extractText(lawData);
        console.log(`✅ 法令全文取得成功: ${lawName} (${Math.round(fullText.length / 1024)}KB)`);
        
        return fullText;
        
    } catch (error) {
        console.error(`❌ 法令全文取得エラー (${lawName}):`, error.message);
        return `❌ 法令全文の取得中にエラーが発生しました: ${error.message}`;
    }
}

// ★★★ XMLからテキストを抽出（全文用） ★★★
function extractText(node, depth = 0) {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (node._) return node._;
    
    let text = '';
    
    if (node.$ && node.$.Num && depth > 0) {
        const articleNum = node.$.Num;
        let displayNum = articleNum;
        if (articleNum.includes('_')) {
            const parts = articleNum.split('_');
            displayNum = `${numToKanji(parseInt(parts[0]))}条の${numToKanji(parseInt(parts[1]))}`;
        } else if (articleNum.includes('の')) {
            const parts = articleNum.split('の');
            displayNum = `${numToKanji(parseInt(parts[0]))}条の${numToKanji(parseInt(parts[1]))}`;
        } else {
            displayNum = numToKanji(parseInt(articleNum));
        }
        text += `\n第${displayNum}`;
        
        if (node.ArticleTitle) {
            const title = getTextContent(node.ArticleTitle[0]);
            if (title) text += ` ${title}`;
        }
        text += '\n';
    }
    
    for (const key in node) {
        if (key === '$') continue;
        
        const child = node[key];
        if (Array.isArray(child)) {
            child.forEach(c => {
                text += extractText(c, depth + 1);
            });
        } else if (typeof child === 'object') {
            text += extractText(child, depth + 1);
        } else if (typeof child === 'string') {
            text += child;
        }
    }
    
    return text;
}

console.log('📦 lawLoader.js モジュール読み込み完了');
