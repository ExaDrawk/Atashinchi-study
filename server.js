// server.js - Render.com対応版

// ★★★ ログ出力制御設定 ★★★
const DEBUG_LOGS = false; // true: 詳細ログ表示, false: ログ非表示

import express from 'express';
// 法律ごとの条文リストAPI
import lawArticleListApi from './lawArticleListApi.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import fs from 'fs/promises';
import fssync from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
import { 
    getFormattedArticle, 
    parseAndGetArticle, 
    getLawFullText,
    loadExistingXMLFiles,
    updateAllSupportedLaws
} from './lawLoader.js';

dotenv.config();

// ★★★ 対応法令一覧（lawLoader.jsと同期） ★★★
const app = express();

const SUPPORTED_LAWS = [
    // ★★★ 憲法・国家組織法 ★★★
    '日本国憲法',
    '日本国憲法の改正手続に関する法律',
    '国会法',
    '内閣法',
    '国家行政組織法',
    '裁判所法',
    '検察庁法',
    '弁護士法',

    '公職選挙法',
    
    // ★★★ 行政法 ★★★
    '行政手続法',
    '行政機関の保有する情報の公開に関する法律',
    '行政代執行法',
    '行政不服審査法',
    '行政事件訴訟法',

// APIルーターを組み込み
    '国家賠償法',
    '個人情報の保護に関する法律',
    '地方自治法',
    
    // ★★★ 民法・関連法 ★★★
    '民法',
    '民法施行法',
    '一般社団法人及び一般財団法人に関する法律',
    '不動産登記法',
    '動産及び債権の譲渡の対抗要件に関する民法の特例等に関する法律',
    '建物の区分所有等に関する法律',
    '仮登記担保契約に関する法律',
    '身元保証ニ関スル法律',
    '消費者契約法',
    '電子消費者契約に関する民法の特例に関する法律',
    '割賦販売法',
    '特定商取引に関する法律',
    '利息制限法',
    '借地借家法',
    '住宅の品質確保の促進等に関する法律',
    '住宅の品質確保の促進等に関する法律施行令',
    '信託法',
    '失火ノ責任ニ関スル法律',
    '製造物責任法',
    '自動車損害賠償保障法',
    '戸籍法',
    '任意後見契約に関する法律',
    '後見登記等に関する法律',
    '法務局における遺言書の保管等に関する法律',
    
    // ★★★ 商法・会社法 ★★★
    '商法',
    '会社法',
    '会社法施行規則',
    '会社計算規則',
    '社債、株式等の振替に関する法律',
    '手形法',
    '小切手法',
    
    // ★★★ 民事訴訟法・関連法 ★★★
    '民事訴訟法',
    '民事訴訟規則',
    '人事訴訟法',
    '人事訴訟規則',
    '民事執行法',
    '民事保全法',
    
    // ★★★ 刑法・刑事訴訟法 ★★★
    '刑法',
    '自動車の運転により人を死傷させる行為等の処罰に関する法律',
    '刑事訴訟法',
    '刑事訴訟規則',
    '犯罪捜査のための通信傍受に関する法律',
    '裁判員の参加する刑事裁判に関する法律',
    '検察審査会法',
    '犯罪被害者等の権利利益の保護を図るための刑事手続に付随する措置に関する法律',
    '少年法',
    '刑事収容施設及び被収容者等の処遇に関する法律',
    '警察官職務執行法',
    
    // ★★★ 倒産法 ★★★
    '破産法',
    '破産規則',
    '民事再生法',
    '民事再生規則',
    
    // ★★★ 知的財産法 ★★★
    '特許法',
    '著作権法'
];

// APIルーターを組み込み
app.use(lawArticleListApi);

// ★★★ 条文統計データ保存API: /api/article-stats/update ★★★
const __dirname2 = path.dirname(new URL(import.meta.url).pathname.replace(/^\/+([A-Za-z]:)/, '$1'));
const ARTICLE_STATS_DIR = path.join(__dirname2, 'laws-article-list');
if (!fssync.existsSync(ARTICLE_STATS_DIR)) fssync.mkdirSync(ARTICLE_STATS_DIR);

app.use(bodyParser.json({ limit: '1mb' }));

// POST /api/article-stats/update
app.post('/api/article-stats/update', async (req, res) => {
    try {
        const { lawName, articleNumber, paragraph, stats } = req.body;
        if (!lawName || !articleNumber || !paragraph || !stats) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const filePath = path.join(ARTICLE_STATS_DIR, `${encodeURIComponent(lawName)}-stats.json`);
        let data = [];
        if (fssync.existsSync(filePath)) {
            data = JSON.parse(fssync.readFileSync(filePath, 'utf8'));
        }
        // 既存データを更新または追加
        const idx = data.findIndex(a => a.articleNumber === articleNumber && a.paragraph === paragraph);
        if (idx >= 0) {
            data[idx] = { ...data[idx], ...stats };
        } else {
            data.push({ articleNumber, paragraph, ...stats });
        }
        fssync.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true });
    } catch (e) {
        console.error('❌ /api/article-stats/update エラー:', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const port = process.env.PORT || 3000;

// ★★★ Render.com対応ミドルウェア ★★★
// セキュリティヘッダー
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"]
        }
    }
}));

// 圧縮とCORS
app.use(compression());
app.use(cors());

// ★★★ 認証設定 ★★★
// 複数ユーザー対応（環境変数で設定）
const getAuthUsers = () => {
    const users = {};
    
    // メインユーザー
    const mainUsername = process.env.AUTH_USERNAME || 'atashinchi';
    const mainPassword = process.env.AUTH_PASSWORD || 'study2024';
    users[mainUsername] = mainPassword;
    
    // 追加ユーザー（AUTH_USERS環境変数で設定: "user1:pass1,user2:pass2"）
    const additionalUsers = process.env.AUTH_USERS;
    if (additionalUsers) {
        additionalUsers.split(',').forEach(userPair => {
            const [username, password] = userPair.trim().split(':');
            if (username && password) {
                users[username] = password;
            }
        });
    }
    
    return users;
};

const AUTH_USERS = getAuthUsers();
console.log(`🔐 認証システム初期化完了 (${Object.keys(AUTH_USERS).length}ユーザー)`);

// セッション設定
app.use(session({
    secret: process.env.SESSION_SECRET || 'atashinchi-secret-key-' + Math.random(),
    resave: false,
    saveUninitialized: false,
    name: 'atashinchi.sid', // セッション名をカスタマイズ
    cookie: { 
        secure: process.env.NODE_ENV === 'production' && !process.env.RENDER, // Render.comではHTTPSが自動
        maxAge: 24 * 60 * 60 * 1000, // 24時間
        httpOnly: true, // XSS対策
        sameSite: 'strict' // CSRF対策
    }
}));

// カスタム認証ミドルウェア
const requireAuth = (req, res, next) => {
    // 認証不要なパス
    const publicPaths = ['/login.html', '/api/auth/login', '/api/auth/logout', '/api/health', '/api/ping', '/api/subfolders'];
    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    
    if (isPublicPath) {
        return next();
    }
    
    // セッションチェック
    if (req.session && req.session.authenticated && req.session.username) {
        // セッション延長
        req.session.lastAccess = new Date();
        return next();
    }
    
    // 認証が必要
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
            success: false, 
            message: 'ログインが必要です。',
            redirectUrl: '/login.html'
        });
    }
    
    // HTMLページへのリダイレクト
    const redirectUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`/login.html?redirect=${redirectUrl}&error=unauthorized`);
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

const LOGS_DIR = path.resolve('./learning-logs');

// ★★★ グローバル変数：XMLファイルキャッシュ ★★★
let globalXMLFiles = new Map();

// --- ユーティリティ関数 ---
async function ensureLogsDirectory() {
    try {
        await fs.access(LOGS_DIR);
    } catch {
        await fs.mkdir(LOGS_DIR, { recursive: true });
        console.log('✅ 学習ログディレクトリを作成しました:', LOGS_DIR);
    }
}

// --- APIエンドポイント ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ★★★ 認証不要のパブリックAPI（認証ミドルウェアより前に配置） ★★★
// サブフォルダ一覧取得API（認証不要）
app.get('/api/subfolders/:category', async (req, res) => {
    try {
        const category = decodeURIComponent(req.params.category);
        const casesDir = path.join(process.cwd(), 'public', 'cases', category);
        
        console.log(`📂 サブフォルダ検索: ${casesDir}`); // デバッグログ
        
        // ディレクトリが存在するかチェック
        try {
            await fs.access(casesDir);
        } catch (error) {
            console.log(`⚠️ ディレクトリが存在しません: ${casesDir}`);
            return res.json([]); // ディレクトリが存在しない場合は空配列
        }
        
        // ディレクトリ内容を読み取り
        const items = await fs.readdir(casesDir, { withFileTypes: true });
        
        // フォルダのみを抽出（ファイルは除外）
        const subfolders = items
            .filter(item => item.isDirectory())
            .map(item => item.name);
        
        console.log(`✅ サブフォルダ一覧: ${JSON.stringify(subfolders)}`);
        res.json(subfolders);
    } catch (error) {
        console.error('サブフォルダ取得エラー:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 認証が必要なAPIエンドポイント用のミドルウェア
// app.use(requireAuth); // 全体適用を無効化

// 静的ファイル配信（icoファイルの特別設定含む）
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.ico')) {
            res.set('Content-Type', 'image/x-icon');
            res.set('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// ★★★ Favicon専用ルート ★★★
app.get('/yuzu.ico', (req, res) => {
    res.set('Content-Type', 'image/x-icon');
    res.set('Cache-Control', 'public, max-age=86400'); // 1日キャッシュ
    res.sendFile(path.resolve('./yuzu.ico'));
});

app.get('/favicon.ico', (req, res) => {
    res.set('Content-Type', 'image/x-icon');
    res.set('Cache-Control', 'public, max-age=86400'); // 1日キャッシュ
    res.sendFile(path.resolve('./yuzu.ico'));
});

// ★★★ module_settings.json取得API ★★★
app.get('/api/module-settings/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const settingsPath = path.join(process.cwd(), 'public', 'cases', category, 'module_settings.json');
        
        try {
            const settingsData = await fs.readFile(settingsPath, 'utf-8');
            const settings = JSON.parse(settingsData);
            res.json(settings);
        } catch (fileError) {
            // ファイルが存在しない場合は404
            res.status(404).json({ error: 'module_settings.json not found' });
        }
    } catch (error) {
        console.error('module_settings.json取得エラー:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/module-settings/:category/:subfolder', async (req, res) => {
    try {
        const { category, subfolder } = req.params;
        const settingsPath = path.join(process.cwd(), 'public', 'cases', category, subfolder, 'module_settings.json');
        
        try {
            const settingsData = await fs.readFile(settingsPath, 'utf-8');
            const settings = JSON.parse(settingsData);
            res.json(settings);
        } catch (fileError) {
            // ファイルが存在しない場合は404
            res.status(404).json({ error: 'module_settings.json not found' });
        }
    } catch (error) {
        console.error('module_settings.json取得エラー:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ★★★ 条文取得API（lawLoader.js委任） ★★★
app.get('/api/get-article', async (req, res) => {
    const { law, article, paragraph } = req.query;

    if (!law || !article) {
        return res.status(400).send('法令名(law)と条文番号(article)を指定してください。');
    }

    if (!SUPPORTED_LAWS.includes(law)) {
        return res.status(400).send(`対応していない法令です: ${law}\n対応法令: ${SUPPORTED_LAWS.join(', ')}`);
    }

    try {
        // ★★★ lawLoader.jsに処理を委任 ★★★
        const articleText = await getFormattedArticle(law, article, paragraph, globalXMLFiles);
        res.set('Content-Type', 'text/plain; charset=UTF-8');
        res.send(articleText);

    } catch (error) {
        console.error(`❌ /api/get-article エラー:`, error);
        res.status(500).send(`条文取得中にエラーが発生しました: ${error.message}`);
    }
});

// ★★★ 認証APIエンドポイント ★★★

// ログインAPI
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'ユーザー名とパスワードを入力してください。'
        });
    }
    
    // ユーザー認証
    if (AUTH_USERS[username] && AUTH_USERS[username] === password) {
        // セッション作成
        req.session.authenticated = true;
        req.session.username = username;
        req.session.loginTime = new Date();
        req.session.lastAccess = new Date();
        
        console.log(`✅ ログイン成功: ${username} (${new Date().toLocaleString('ja-JP')})`);
        
        res.json({
            success: true,
            message: 'ログインに成功しました。',
            user: {
                username: username,
                loginTime: req.session.loginTime
            }
        });
    } else {
        console.log(`❌ ログイン失敗: ${username} (${new Date().toLocaleString('ja-JP')})`);
        
        res.status(401).json({
            success: false,
            message: 'ユーザー名またはパスワードが正しくありません。'
        });
    }
});

// ログアウトAPI
app.post('/api/auth/logout', (req, res) => {
    const username = req.session?.username || 'unknown';
    
    req.session.destroy((err) => {
        if (err) {
            console.error('セッション削除エラー:', err);
            return res.status(500).json({
                success: false,
                message: 'ログアウト処理中にエラーが発生しました。'
            });
        }
        
        console.log(`📤 ログアウト: ${username} (${new Date().toLocaleString('ja-JP')})`);
        
        res.clearCookie('atashinchi.sid');
        res.json({
            success: true,
            message: 'ログアウトしました。'
        });
    });
});

// 認証ステータス確認API
app.get('/api/auth/status', (req, res) => {
    if (req.session?.authenticated && req.session?.username) {
        res.json({
            authenticated: true,
            username: req.session.username,
            loginTime: req.session.loginTime,
            lastAccess: req.session.lastAccess
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// ★★★ 複合文字列解析API（lawLoader.js委任） ★★★
app.post('/api/parse-article', async (req, res) => {
    const { inputText } = req.body;

    if (!inputText || typeof inputText !== 'string') {
        return res.status(400).json({ error: '入力テキスト(inputText)を指定してください。' });
    }

    try {
        // ★★★ lawLoader.jsに処理を委任 ★★★
        const articleText = await parseAndGetArticle(inputText, SUPPORTED_LAWS, globalXMLFiles);
        res.set('Content-Type', 'text/plain; charset=UTF-8');
        res.send(articleText);

    } catch (error) {
        console.error(`❌ /api/parse-article エラー:`, error);
        res.status(500).send(`条文解析中にエラーが発生しました: ${error.message}`);
    }
});

// ★★★ 対応法令一覧API ★★★
app.get('/api/supported-laws', (req, res) => {
    try {
        res.json({
            success: true,
            supportedLaws: SUPPORTED_LAWS,
            count: SUPPORTED_LAWS.length,
            xmlFilesLoaded: globalXMLFiles.size,
            examples: [
                '民法465条の4第1項',
                '会社法784条',
                '民法第110条第1項',
                '民法109条1項',
                '刑法199条'
            ]
        });
    } catch (error) {
        console.error('法令名API取得エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// ★★★ スピードクイズ用条文取得API ★★★
app.get('/api/speed-quiz-article', async (req, res) => {
    try {
        const { lawName, articleNumber, paragraph, item } = req.query;
        
        if (!lawName || !articleNumber) {
            return res.status(400).json({
                success: false,
                error: '法令名と条文番号が必要です'
            });
        }
        
        // 条文文字列を構築
        let inputText = `${lawName}${articleNumber}条`;
        if (paragraph) inputText += `${paragraph}項`;
        if (item) inputText += `${item}号`;
        
        console.log(`🎯 スピードクイズ条文取得: ${inputText}`);
        
        // lawLoader.jsから条文を取得
        const articleContent = await parseAndGetArticle(inputText, SUPPORTED_LAWS, globalXMLFiles);
        
        if (articleContent && articleContent !== '条文が見つかりませんでした') {
            res.json({
                success: true,
                content: articleContent,
                lawName,
                articleNumber,
                paragraph,
                item,
                inputText
            });
        } else {
            res.json({
                success: false,
                error: '条文が見つかりませんでした',
                lawName,
                articleNumber,
                paragraph,
                item,
                inputText
            });
        }
        
    } catch (error) {
        console.error('スピードクイズ条文取得エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

// ★★★ XMLファイル状況API ★★★
app.get('/api/xml-status', (req, res) => {
    const xmlStatus = [];
    for (const [fileName, xmlText] of globalXMLFiles) {
        xmlStatus.push({
            fileName,
            sizeKB: Math.round(xmlText.length / 1024),
            available: true
        });
    }
    
    res.json({
        totalXMLFiles: globalXMLFiles.size,
        supportedLaws: SUPPORTED_LAWS.length,
        xmlFiles: xmlStatus
    });
});

// ★★★ 目次ファイル再生成API ★★★
app.post('/api/regenerate-case-index', async (req, res) => {
    try {
        console.log('📂 目次ファイル再生成リクエストを受信');
        
        // ★★★ build-case-index.jsの共通関数を利用（キャッシュバスティング付き） ★★★
        console.log('🔄 build-case-index.jsをインポート中...');
        const timestamp = Date.now();
        const buildIndexModule = await import(`./scripts/build-case-index.js?t=${timestamp}`);
        console.log('✅ インポート完了:', Object.keys(buildIndexModule));
        
        const { generateCaseIndex } = buildIndexModule;
        const casesRootDirectory = path.join(process.cwd(), 'public', 'cases');
        const outputFilePath = path.join(casesRootDirectory, 'index.js');
        
        console.log('🚀 generateCaseIndex関数を実行中...');
        const result = await generateCaseIndex(casesRootDirectory, outputFilePath);
        console.log('✅ generateCaseIndex実行完了:', result);
        
        console.log(`✅ 目次ファイル再生成完了: ${outputFilePath}`);
        console.log(`📊 処理されたケース: ${result.casesCount}件`);
        console.log('📁 カテゴリ一覧:', result.categories);
        console.log('📂 サブフォルダ一覧:', result.subfolders);
        
        res.json({
            success: true,
            message: '目次ファイルの再生成が完了しました',
            casesCount: result.casesCount,
            categories: result.categories,
            subfolders: result.subfolders,
            outputFile: outputFilePath
        });
        
    } catch (error) {
        console.error('❌ 目次ファイル再生成エラー:', error);
        console.error('❌ スタックトレース:', error.stack);
        res.status(500).json({
            success: false,
            error: '目次ファイルの再生成中にエラーが発生しました',
            details: error.message
        });
    }
});

// ★★★ Gemini対話API（lawLoader.js委任） ★★★
app.post('/api/gemini', async (req, res) => {
    try {
        console.log('=== Gemini APIリクエスト開始 ===');
        
        const { prompt, history, learningContext, message, systemRole } = req.body;

        // 新しいAPIフォーマット（添削機能用）のサポート
        const actualPrompt = message || prompt;
        
        console.log('🔍 リクエストパラメータ:', {
            hasPrompt: !!prompt,
            hasMessage: !!message,
            actualPromptLength: actualPrompt?.length || 0,
            actualPromptPreview: actualPrompt?.substring(0, 100) || 'なし',
            systemRole: systemRole,
            historyLength: history?.length || 0
        });

        console.log('🧾=== クライアント送信プロンプト全文 BEGIN ===');
        console.log(actualPrompt);
        console.log('🧾=== クライアント送信プロンプト全文 END ===');

        if (!actualPrompt || typeof actualPrompt !== 'string') {
            console.error('❌ プロンプトが無効:', { actualPrompt, type: typeof actualPrompt });
            return res.status(400).json({ error: 'プロンプトが無効です' });
        }

        let validatedHistory = [];
        if (Array.isArray(history)) {
            validatedHistory = history.filter(item => 
                item && item.role && (item.role === 'user' || item.role === 'model') &&
                item.parts && Array.isArray(item.parts) && item.parts.every(part => part && part.text)
            );
        }

        if (validatedHistory.length > 0 && validatedHistory[0].role !== 'user') {
            validatedHistory = [];
        }

        // システムロールに基づくプロンプト調整
        let systemInstruction = '';
        if (systemRole === 'legal_essay_corrector') {
            systemInstruction = `あなたは経験豊富な法学教授で、司法試験の論文式試験の添削を専門としています。
学生の答案を客観的かつ建設的に評価し、具体的な改善点を指摘してください。
採点は厳格に行い、論点の理解度、論理構成、条文適用の正確性を重視してください。
回答は必ずJSON形式で返し、文字位置は正確に指定してください。`;
        }

        // ★★★ 法令全文をプロンプトに追加（lawLoader.js委任） ★★★
        let finalPrompt = actualPrompt;
        const mentionedLaws = SUPPORTED_LAWS.filter(law => actualPrompt.includes(law));
        
        if (mentionedLaws.length > 0) {
            console.log(`💡 プロンプトに法令コンテキストを追加: ${mentionedLaws.join(', ')}`);
            
            let lawContext = '';
            for (const law of mentionedLaws.slice(0, 2)) {
                try {
                    // ★★★ lawLoader.jsに処理を委任 ★★★
                    const fullText = await getLawFullText(law, globalXMLFiles);
                    const truncatedText = fullText.length > 10000 
                        ? fullText.substring(0, 10000) + '...(以下省略)'
                        : fullText;
                    lawContext += `\n\n# ${law}\n${truncatedText}`;
                } catch (error) {
                    console.warn(`⚠️ ${law}の全文取得に失敗: ${error.message}`);
                }
            }
            
            if (lawContext) {
                finalPrompt = `以下の法令条文を参考に、ユーザーのプロンプトに回答してください。${lawContext}\n\n---\n\n# ユーザーのプロンプト\n${actualPrompt}`;
            }
        }
        
        console.log('🚀 AI送信前の最終プロンプト確認:', {
            finalPromptLength: finalPrompt.length,
            finalPromptPreview: finalPrompt.substring(0, 200) + '...',
            hasLawContext: mentionedLaws.length > 0,
            mentionedLaws: mentionedLaws
        });

        console.log('📝=== 最終プロンプト全文 BEGIN ===');
        console.log(finalPrompt);
        console.log('📝=== 最終プロンプト全文 END ===');
        
        // 新しいSDKを使用
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: finalPrompt,
            history: validatedHistory.length > 0 ? validatedHistory : undefined
        });
        
        const responseText = response.text;

        console.log('✅ Gemini API成功', { responseLength: responseText.length });
        res.json({ 
            reply: responseText,     // 添削機能用のreplyフィールド
            response: responseText,  // responseフィールドとして返す
            text: responseText      // 既存の互換性のためtextも残す
        });
    } catch (error) {
        console.error('❌ Gemini APIエラー:', error.message);
        const fallbackResponse = '申し訳ございません。現在、AIサーバーが高負荷のため、一時的にサービスを利用できません。';
        res.status(500).json({ 
            reply: fallbackResponse,   // 添削機能用のreplyフィールド
            response: fallbackResponse,  // responseフィールドとして返す
            text: fallbackResponse,     // 既存の互換性のため
            isFallback: true,
            originalError: 'AIとの通信中にエラーが発生しました'
        });
    }
});

// ★★★ Render.com用ヘルスチェックAPI ★★★
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        app: 'あたしんち学習アプリ',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        laws: SUPPORTED_LAWS.length,
        xmlFiles: globalXMLFiles.size
    });
});

app.get('/api/ping', (req, res) => {
    res.json({ pong: true, timestamp: new Date().toISOString() });
});

// ★★★ ファイル編集API（VSCodeでファイルを開く） ★★★
app.post('/api/open-file', async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: 'filePath is required'
            });
        }

        // __dirnameの取得
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        // 相対パスから絶対パスを生成
        const absolutePath = path.join(__dirname, 'public', 'cases', filePath);
        
        // ファイルの存在確認
        const exists = fssync.existsSync(absolutePath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
                path: absolutePath
            });
        }

        // VSCodeでファイルを開く（code コマンドを使用）
        const command = `code "${absolutePath}"`;
        await execPromise(command);
        
        res.json({
            success: true,
            message: 'File opened in VSCode',
            path: absolutePath
        });
        
    } catch (error) {
        console.error('ファイルを開く際にエラーが発生しました:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ★★★ 学習記録API ★★★
app.post('/api/study-record', async (req, res) => {
    try {
        const { caseId, title, timestamp, date } = req.body;
        
        if (!caseId || !timestamp || !date) {
            return res.status(400).json({
                success: false,
                error: '必要なフィールドが不足しています'
            });
        }
        
        // 学習記録をログに記録（実際の実装では、データベースに保存することも可能）
        console.log('📚 学習記録受信:', {
            caseId,
            title,
            timestamp,
            date,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
        
        // 成功レスポンス
        res.json({
            success: true,
            message: '学習記録を受信しました',
            data: {
                caseId,
                title,
                timestamp,
                date
            }
        });
        
    } catch (error) {
        console.error('❌ 学習記録API エラー:', error);
        res.status(500).json({
            success: false,
            error: 'サーバー内部エラー'
        });
    }
});

// ★★★ 学習記録をJSファイルに追加するAPI（相対パス対応） ★★★
app.post('/api/add-study-record', async (req, res) => {
    try {
        const { relativePath, title, timestamp, date } = req.body;
        
        if (!relativePath || !timestamp || !date) {
            return res.status(400).json({
                success: false,
                error: '必要なフィールドが不足しています（relativePath, timestamp, dateは必須）'
            });
        }
        
        console.log('📚 学習記録をJSファイルに追加中:', { relativePath, title, date });
        
        // 相対パスからケースファイルを取得
        const caseFiles = await findCaseFileByPath(relativePath);
        
        if (caseFiles.length === 0) {
            return res.status(404).json({
                success: false,
                error: `ケースファイルが見つかりません: ${relativePath}`
            });
        }
        
        const filePath = caseFiles[0];
        console.log(`📁 対象ファイル: ${filePath}`);
        
        // ファイルを読み込み
        let fileContent = await fs.readFile(filePath, 'utf8');
        
        // 学習記録配列を検索または作成
        const studyRecordPattern = /studyRecords\s*:\s*\[[\s\S]*?\]/;
        const studyRecordMatch = fileContent.match(studyRecordPattern);
        
        const newRecord = {
            date: date,
            timestamp: timestamp
        };
        
        if (studyRecordMatch) {
            // 既存のstudyRecords配列を更新
            console.log('📝 既存のstudyRecords配列を更新');
            
            // 既存の記録を解析
            const existingArrayContent = studyRecordMatch[0];
            const existingRecords = extractStudyRecordsFromString(existingArrayContent);
            
            // 同じ日の記録がある場合は更新、ない場合は追加
            const todayRecord = existingRecords.find(record => record.date === date);
            if (todayRecord) {
                console.log(`📅 本日(${date})の学習記録を更新`);
                todayRecord.timestamp = timestamp;
            } else {
                console.log(`📅 新しい学習記録を追加: ${date}`);
                existingRecords.push(newRecord);
            }
            
            // 日付順にソート（新しい順）
            existingRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // 新しい配列文字列を生成
            const newArrayString = generateStudyRecordsArrayString(existingRecords);
            
            // ファイル内容を更新
            fileContent = fileContent.replace(studyRecordPattern, `studyRecords: ${newArrayString}`);
            
        } else {
            // studyRecords配列が存在しない場合は、オブジェクトの中に追加
            console.log('📝 新しいstudyRecords配列をオブジェクト内に追加');
            
            // essay: null の後に studyRecords を追加
            const essayPattern = /(essay:\s*null)([\s\n]*)(};?\s*(?:export\s+default|$))/;
            const essayMatch = fileContent.match(essayPattern);
            
            if (essayMatch) {
                const newArrayString = generateStudyRecordsArrayString([newRecord]);
                const insertText = `$1,${essayMatch[2]}  studyRecords: ${newArrayString}${essayMatch[2]}$3`;
                fileContent = fileContent.replace(essayPattern, insertText);
            } else {
                // essay文が見つからない場合は、}; の直前に追加
                const endPattern = /([\s\n]*)(};?\s*(?:export\s+default|$))/;
                const endMatch = fileContent.match(endPattern);
                
                if (endMatch) {
                    const newArrayString = generateStudyRecordsArrayString([newRecord]);
                    const insertText = `,$1  studyRecords: ${newArrayString}$1$2`;
                    fileContent = fileContent.replace(endPattern, insertText);
                }
            }
        }
        
        // ファイルに書き込み
        await fs.writeFile(filePath, fileContent, 'utf8');
        console.log(`✅ 学習記録をJSファイルに保存完了: ${filePath}`);
        
        res.json({
            success: true,
            message: '学習記録をJSファイルに保存しました',
            data: newRecord,
            filePath: filePath
        });
        
    } catch (error) {
        console.error('❌ 学習記録保存エラー:', error);
        res.status(500).json({
            success: false,
            error: 'サーバー内部エラー'
        });
    }
});

// ★★★ JSファイルから学習記録を取得するAPI（相対パス対応） ★★★
app.get('/api/get-study-record/:relativePath*', async (req, res) => {
    try {
        const relativePath = req.params.relativePath + (req.params[0] || '');
        
        console.log('📖 学習記録を取得中:', relativePath);
        
        // 相対パスからケースファイルを取得
        const caseFiles = await findCaseFileByPath(relativePath);
        
        if (caseFiles.length === 0) {
            return res.json({
                success: true,
                latestRecord: null,
                message: `ケースファイルが見つかりません: ${relativePath}`
            });
        }
        
        const filePath = caseFiles[0];
        
        // ファイルを読み込み
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // 学習記録配列を検索（オブジェクト内）
        const studyRecordPattern = /studyRecords\s*:\s*\[[\s\S]*?\]/;
        const studyRecordMatch = fileContent.match(studyRecordPattern);
        
        if (studyRecordMatch) {
            const existingRecords = extractStudyRecordsFromString(studyRecordMatch[0]);
            
            // 最新の記録を取得（日付順でソート済み）
            const latestRecord = existingRecords.length > 0 ? existingRecords[0] : null;
            
            // 今日の記録があるかチェック
            const today = getStudyRecordDate(); // 新しい日付計算関数を使用
            const todayRecord = existingRecords.find(record => record.date === today);
            
            console.log(`📊 学習記録取得完了: ${relativePath}`, latestRecord);
            
            res.json({
                success: true,
                latestRecord: latestRecord,
                todayRecord: todayRecord, // 今日の記録がある場合のみ返す（latestRecordと混同しない）
                totalRecords: existingRecords.length
            });
        } else {
            // オブジェクト外部の学習記録も検索（後方互換性のため）
            const externalPattern = /\/\/\s*学習記録[\s\S]*?studyRecords\s*:\s*\[[\s\S]*?\]/;
            const externalMatch = fileContent.match(externalPattern);
            
            if (externalMatch) {
                const existingRecords = extractStudyRecordsFromString(externalMatch[0]);
                const latestRecord = existingRecords.length > 0 ? existingRecords[0] : null;
                
                // 今日の記録があるかチェック
                const today = getStudyRecordDate(); // 新しい日付計算関数を使用
                const todayRecord = existingRecords.find(record => record.date === today);
                
                console.log(`📊 学習記録取得完了（外部）: ${caseId}`, latestRecord);
                
                // 自動修復：外部の学習記録をオブジェクト内に移動
                try {
                    console.log(`🔧 JSファイル自動修復中: ${caseId}`);
                    
                    // 外部の学習記録を削除
                    const cleanedContent = fileContent.replace(externalPattern, '');
                    
                    // オブジェクト内に学習記録を追加
                    let repairedContent = cleanedContent;
                    const essayPattern = /(essay:\s*null)([\s\n]*)(};?\s*(?:export\s+default|$))/;
                    const essayMatch = repairedContent.match(essayPattern);
                    
                    if (essayMatch) {
                        const newArrayString = generateStudyRecordsArrayString(existingRecords);
                        const insertText = `$1,${essayMatch[2]}  studyRecords: ${newArrayString}${essayMatch[2]}$3`;
                        repairedContent = repairedContent.replace(essayPattern, insertText);
                        
                        // ファイルを保存
                        await fs.writeFile(filePath, repairedContent, 'utf8');
                        console.log(`✅ JSファイル修復完了: ${caseId}`);
                    }
                } catch (repairError) {
                    console.warn(`⚠️ JSファイル修復失敗: ${caseId}`, repairError.message);
                }
                
                res.json({
                    success: true,
                    latestRecord: latestRecord,
                    todayRecord: todayRecord, // 今日の記録がある場合のみ返す
                    totalRecords: existingRecords.length
                });
            } else {
                res.json({
                    success: true,
                    latestRecord: null,
                    todayRecord: null,
                    totalRecords: 0
                });
            }
        }
        
    } catch (error) {
        console.error('❌ 学習記録取得エラー:', error);
        res.status(500).json({
            success: false,
            error: 'サーバー内部エラー'
        });
    }
});

// ★★★ JSファイルから学習記録を削除するAPI（相対パス対応） ★★★
app.delete('/api/delete-study-record/:relativePath*', async (req, res) => {
    try {
        const relativePath = req.params.relativePath + (req.params[0] || '');
        const { date } = req.body; // 削除する日付（YYYY-MM-DD形式）

        if (!date) {
            return res.status(400).json({
                success: false,
                error: '削除する日付が指定されていません'
            });
        }

        console.log('🗑️ 学習記録を削除中:', { relativePath, date });

        // 相対パスからケースファイルを取得
        const caseFiles = await findCaseFileByPath(relativePath);

        if (caseFiles.length === 0) {
            return res.status(404).json({
                success: false,
                error: `ケースファイルが見つかりません: ${relativePath}`
            });
        }

        const filePath = caseFiles[0];

        // ファイルを読み込み
        const fileContent = await fs.readFile(filePath, 'utf8');

        // 学習記録配列を検索（オブジェクト内）
        const studyRecordPattern = /studyRecords\s*:\s*\[[\s\S]*?\]/;
        const studyRecordMatch = fileContent.match(studyRecordPattern);

        if (studyRecordMatch) {
            const existingRecords = extractStudyRecordsFromString(studyRecordMatch[0]);

            // 指定された日付の記録を削除
            const filteredRecords = existingRecords.filter(record => record.date !== date);

            if (filteredRecords.length === existingRecords.length) {
                return res.status(404).json({
                    success: false,
                    error: `指定された日付の学習記録が見つかりません: ${date}`
                });
            }

            // 更新された学習記録配列を生成
            const newArrayString = generateStudyRecordsArrayString(filteredRecords);

            // ファイルを更新
            const updatedContent = fileContent.replace(studyRecordMatch[0], `studyRecords: ${newArrayString}`);
            await fs.writeFile(filePath, updatedContent, 'utf8');

            console.log(`✅ 学習記録を削除完了: ${filePath} (${date})`);

            res.json({
                success: true,
                message: `学習記録を削除しました: ${date}`,
                remainingRecords: filteredRecords.length
            });
        } else {
            // オブジェクト外部の学習記録も検索（後方互換性のため）
            const externalPattern = /\/\/\s*学習記録[\s\S]*?studyRecords\s*:\s*\[[\s\S]*?\]/;
            const externalMatch = fileContent.match(externalPattern);

            if (externalMatch) {
                const existingRecords = extractStudyRecordsFromString(externalMatch[0]);

                // 指定された日付の記録を削除
                const filteredRecords = existingRecords.filter(record => record.date !== date);

                if (filteredRecords.length === existingRecords.length) {
                    return res.status(404).json({
                        success: false,
                        error: `指定された日付の学習記録が見つかりません: ${date}`
                    });
                }

                // 更新された学習記録配列を生成
                const newArrayString = generateStudyRecordsArrayString(filteredRecords);

                // ファイルを更新
                const updatedContent = fileContent.replace(externalMatch[0], `// 学習記録
const studyRecords = ${newArrayString};`);
                await fs.writeFile(filePath, updatedContent, 'utf8');

                console.log(`✅ 学習記録を削除完了（外部）: ${filePath} (${date})`);

                res.json({
                    success: true,
                    message: `学習記録を削除しました: ${date}`,
                    remainingRecords: filteredRecords.length
                });
            } else {
                return res.status(404).json({
                    success: false,
                    error: '学習記録が見つかりません'
                });
            }
        }

    } catch (error) {
        console.error('❌ 学習記録削除エラー:', error);
        res.status(500).json({
            success: false,
            error: 'サーバー内部エラー'
        });
    }
});

// ★★★ 全ケースの学習記録を取得するAPI ★★★
app.get('/api/get-all-study-records', async (req, res) => {
    try {
        console.log('📊 全ケースの学習記録を取得中...');
        
        const casesDir = path.join(process.cwd(), 'public', 'cases');
        const allRecords = {};
        
        // 再帰的にJSファイルを検索
        async function searchStudyRecords(dir) {
            try {
                const items = await fs.readdir(dir);
                
                for (const item of items) {
                    const itemPath = path.join(dir, item);
                    const stat = await fs.stat(itemPath);
                    
                    if (stat.isDirectory()) {
                        await searchStudyRecords(itemPath);
                    } else if (item.endsWith('.js')) {
                        try {
                            const content = await fs.readFile(itemPath, 'utf8');
                            
                            // ケースIDを抽出
                            const idMatch = content.match(/id:\s*["']([^"']+)["']/);
                            if (idMatch) {
                                const caseId = idMatch[1];
                                
                                // 学習記録を抽出（オブジェクト内）
                                const studyRecordPattern = /studyRecords\s*:\s*\[[\s\S]*?\]/;
                                const studyRecordMatch = content.match(studyRecordPattern);
                                
                                if (studyRecordMatch) {
                                    const records = extractStudyRecordsFromString(studyRecordMatch[0]);
                                    if (records.length > 0) {
                                        // 最新の記録を保存
                                        allRecords[caseId] = records[0];
                                    }
                                } else {
                                    // オブジェクト外部の学習記録も検索（後方互換性のため）
                                    const externalPattern = /\/\/\s*学習記録[\s\S]*?studyRecords\s*:\s*\[[\s\S]*?\]/;
                                    const externalMatch = content.match(externalPattern);
                                    
                                    if (externalMatch) {
                                        const records = extractStudyRecordsFromString(externalMatch[0]);
                                        if (records.length > 0) {
                                            allRecords[caseId] = records[0];
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.warn(`ファイル読み込みエラー: ${itemPath}`, error.message);
                        }
                    }
                }
            } catch (error) {
                console.warn(`ディレクトリ読み込みエラー: ${dir}`, error.message);
            }
        }
        
        await searchStudyRecords(casesDir);
        
        console.log(`📊 全学習記録取得完了: ${Object.keys(allRecords).length}件`);
        
        res.json({
            success: true,
            records: allRecords,
            totalCases: Object.keys(allRecords).length
        });
        
    } catch (error) {
        console.error('❌ 全学習記録取得エラー:', error);
        res.status(500).json({
            success: false,
            error: 'サーバー内部エラー'
        });
    }
});

/**
 * 学習記録配列文字列からレコードを抽出
 * @param {string} arrayString - studyRecords配列の文字列
 * @returns {Array} - 学習記録の配列
 */
function extractStudyRecordsFromString(arrayString) {
    try {
        // studyRecords: の部分を除去して配列部分のみを抽出
        const arrayPart = arrayString.replace(/studyRecords\s*:\s*/, '').trim();
        
        // 直接evalを試行（最も確実な方法）
        try {
            const records = eval('(' + arrayPart + ')');
            
            if (!Array.isArray(records)) {
                return [];
            }
            
            return records.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (evalError) {
            console.warn('eval による解析失敗:', evalError.message);
        }
        
        // evalが失敗した場合のフォールバック: JSONパース
        let jsonString = arrayPart
            // プロパティ名にクォートを追加（既にクォートされていないもののみ）
            .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '"$1":')
            // 文字列値もクォートで囲む（既にクォートされていないもののみ）
            .replace(/:\s*([^"\[\{][^,\]\}]*[^"\[\{,\]\}\s])/g, ': "$1"')
            // シングルクォートをダブルクォートに変換
            .replace(/'/g, '"')
            // 不正な余分なクォートを修正
            .replace(/""([^"]*)""/g, '"$1"')
            // 既に引用符で囲まれた文字列の再処理を避ける
            .replace(/:\s*"([^"]*)"([^,\]\}])/g, ': "$1$2"');
        
        // JSON.parseで解析を試行
        const records = JSON.parse(jsonString);
        
        // 配列でない場合は空配列を返す
        if (!Array.isArray(records)) {
            return [];
        }
        
        // 日付順にソート（新しい順）
        return records.sort((a, b) => new Date(b.date) - new Date(a.date));
        
    } catch (error) {
        console.warn('学習記録の解析に失敗:', error.message);
        console.warn('解析対象文字列:', arrayString);
        return [];
    }
}

/**
 * 学習記録用の日付を計算する関数（3:00-26:59の27時間制）
 * @param {Date} now - 現在時刻（省略時は現在時刻を使用）
 * @returns {string} - YYYY-MM-DD形式の日付
 */
function getStudyRecordDate(now = new Date()) {
    // Helper to format local YYYY-MM-DD
    function formatLocalDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    // 学習日のルール: 3:00～26:59（翌日の2:59まで）を一日とする
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 現在の時刻が3:00より前（0:00～2:59）の場合、前日の日付を返す
    if (hour < 3) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDate(yesterday);
    }

    // それ以外（3:00～23:59）の場合、当日の日付を返す
    return formatLocalDate(now);
}

/**
 * 学習記録配列をJavaScript配列文字列として生成
 * @param {Array} records - 学習記録の配列
 * @returns {string} - JavaScript配列文字列
 */
function generateStudyRecordsArrayString(records) {
    if (!records || records.length === 0) {
        return '[]';
    }
    
    const recordStrings = records.map(record => {
        return `        {
            date: "${record.date}",
            timestamp: "${record.timestamp}"
        }`;
    });
    
    return `[
${recordStrings.join(',\n')}
    ]`;
}

// ★★★ Q&Aステータス更新API（相対パス対応） ★★★
app.post('/api/update-qa-status', async (req, res) => {
    try {
        const { relativePath, qaData } = req.body;
        
        if (!relativePath || !qaData) {
            return res.status(400).json({ error: 'relativePathとqaDataは必須です' });
        }
        
        console.log(`📝 Q&Aステータス更新API: relativePath=${relativePath}`);
        console.log(`📋 受信したqaData:`, JSON.stringify(qaData, null, 2));
        
        // casesDir を定義
        const casesDir = path.join(process.cwd(), 'public', 'cases');
        
        // 相対パスから完全なファイルパスを構築
        const modulePath = getAbsolutePathFromRelative(relativePath);
        
        // ファイルの存在確認
        if (!fssync.existsSync(modulePath)) {
            console.log(`❌ モジュールファイルが見つかりません: ${relativePath} (${modulePath})`);
            return res.status(404).json({ error: `モジュールファイルが見つかりません: ${relativePath}` });
        }
            const findModuleFile = (dir) => {
                try {
                    const items = fssync.readdirSync(dir, { withFileTypes: true });
                    
                    for (const item of items) {
                        if (item.isDirectory()) {
                            const subDir = path.join(dir, item.name);
                            const found = findModuleFile(subDir);
                            if (found) return found;
                        } else if (item.isFile() && item.name.endsWith('.js')) {
                            const filePath = path.join(dir, item.name);
                            try {
                                const content = fssync.readFileSync(filePath, 'utf8');
                                // ファイル内でmoduleIdを検索（id: "..." または id:"..." の形式）
                                const idMatch = content.match(/id:\s*["']([^"']+)["']/);
                                if (idMatch && idMatch[1] === moduleId) {
                                    console.log(`🎯 完全一致モジュール発見: ${filePath} (ID: ${idMatch[1]})`);
                                    return filePath;
                                }
                            } catch (error) {
                                // ファイル読み込みエラーは無視
                                console.log(`⚠️ ファイル読み込みエラー (無視): ${filePath}`);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`⚠️ ディレクトリ読み込みエラー (無視): ${dir}`);
                }
                return null;
            };
            
            const foundPath = findModuleFile(casesDir);
        
        console.log(`🔍 ファイルパス: ${modulePath}`);
        
        // 既存ファイルを読み込み
        let fileContent = '';
        try {
            fileContent = await fs.readFile(modulePath, 'utf8');
            console.log(`📖 ファイル読み込み成功: ${modulePath}`);
        } catch (error) {
            console.error(`❌ ファイル読み込み失敗: ${modulePath}`, error);
            return res.status(404).json({ error: `モジュールファイルが見つかりません: ${relativePath}` });
        }
        
        // questionsAndAnswers配列部分を新しいデータで置換
        // より安全な正規表現を使用
        const qaArrayPattern = /(questionsAndAnswers\s*:\s*)\[\s*[\s\S]*?\n\s*\]/;
        const qaMatch = fileContent.match(qaArrayPattern);
        
        if (!qaMatch) {
            console.error('❌ questionsAndAnswers配列が見つかりません');
            console.log('🔍 ファイルサイズ:', fileContent.length);
            console.log('🔍 ファイル内容の先頭500文字:', fileContent.substring(0, 500));
            
            // より詳細なデバッグ
            const simpleMatches = fileContent.match(/questionsAndAnswers/g);
            console.log('🔍 questionsAndAnswers出現回数:', simpleMatches ? simpleMatches.length : 0);
            
            return res.status(400).json({ error: 'questionsAndAnswers配列が見つかりません' });
        }
        
        // インデントを正しく検出
        const beforeQA = qaMatch[1]; // "questionsAndAnswers: "
        const matchStart = qaMatch.index;
        const lineStart = fileContent.lastIndexOf('\n', matchStart) + 1;
        const currentIndent = fileContent.substring(lineStart, matchStart);
        
        // データ配列を適切なインデントで整形
        const qaDataFormatted = JSON.stringify(qaData, null, 4)
            .split('\n')
            .map((line, index) => {
                if (index === 0) return line; // 最初の行はそのまま
                return currentIndent + '    ' + line; // 元のインデント + 4スペース
            })
            .join('\n');
        
        // 置換実行
        const replacement = beforeQA + qaDataFormatted;
        const newContent = fileContent.replace(qaArrayPattern, replacement);
        
        // ファイルに書き込み
        try {
            await fs.writeFile(modulePath, newContent, 'utf8');
            console.log(`✅ ファイル書き込み成功: ${modulePath}`);
        } catch (error) {
            console.error(`❌ ファイル書き込み失敗: ${modulePath}`, error);
            return res.status(500).json({ error: 'ファイル書き込みに失敗しました' });
        }
        
        console.log(`✅ Q&Aステータス更新完了: ${relativePath}`);
        res.json({ 
            success: true, 
            message: `${relativePath}のQ&Aステータスを更新しました`,
            updatedCount: qaData.length,
            filePath: modulePath
        });
        
    } catch (error) {
        console.error('❌ Q&Aステータス更新エラー:', error);
        res.status(500).json({ error: 'Q&Aステータス更新に失敗しました' });
    }
});

// ★★★ ストーリーチェック状態保存API ★★★
app.post('/api/save-story-check', async (req, res) => {
    try {
        const { caseId, storyData } = req.body;
        
        if (!caseId || !storyData) {
            return res.status(400).json({ error: 'ケースIDとストーリーデータが必要です' });
        }
        
        console.log('💾 ストーリーチェック状態を保存中:', caseId);
        
        // 相対パスベースのcaseIdからファイルパスを取得
        const caseFiles = await findCaseFileByPath(caseId);
        
        if (caseFiles.length === 0) {
            return res.status(404).json({ error: 'ケースファイルが見つかりません' });
        }
        
        // 最初に見つかったファイルを更新
        const filePath = caseFiles[0];
        
        // ファイルを読み込み
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // ストーリーデータを更新
        const updatedContent = updateStoryDataInFile(fileContent, storyData);
        
        // ファイルに書き戻し
        await fs.writeFile(filePath, updatedContent, 'utf8');
        
        console.log('✅ ストーリーチェック状態の保存完了:', filePath);
        
        res.json({ 
            success: true, 
            message: 'ストーリーチェック状態が保存されました',
            filePath: filePath 
        });
        
    } catch (error) {
        console.error('❌ ストーリーチェック状態保存エラー:', error);
        res.status(500).json({ error: 'ストーリーチェック状態の保存に失敗しました' });
    }
});

// ★★★ ストーリーチェック状態取得API ★★★
app.get('/api/get-story-check/:caseId', async (req, res) => {
    try {
        const { caseId } = req.params;
        
        if (!caseId) {
            return res.status(400).json({ error: 'ケースIDが必要です' });
        }
        
        console.log('📖 ストーリーチェック状態を取得中:', caseId);
        
        // 相対パスベースのcaseIdからファイルパスを取得
        const caseFiles = await findCaseFileByPath(caseId);
        
        if (caseFiles.length === 0) {
            return res.status(404).json({ error: 'ケースファイルが見つかりません' });
        }
        
        // 最初に見つかったファイルを読み込み
        const filePath = caseFiles[0];
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // ファイルからストーリーデータを抽出
        const storyData = extractStoryDataFromFile(fileContent);
        
        console.log('✅ ストーリーチェック状態の取得完了:', filePath);
        
        res.json({ 
            success: true, 
            storyData: storyData,
            filePath: filePath 
        });
        
    } catch (error) {
        console.error('❌ ストーリーチェック状態取得エラー:', error);
        res.status(500).json({ error: 'ストーリーチェック状態の取得に失敗しました' });
    }
});

// ★★★ 解説固定状態保存API ★★★
app.post('/api/save-explanation-check', async (req, res) => {
    try {
        const { caseId, explanationCheck } = req.body;

        if (!caseId) {
            return res.status(400).json({ error: 'ケースIDが必要です' });
        }

        console.log('💾 解説固定状態を保存中:', caseId, explanationCheck);

        const caseFiles = await findCaseFileByPath(caseId);
        if (caseFiles.length === 0) {
            return res.status(404).json({ error: 'ケースファイルが見つかりません' });
        }

        const filePath = caseFiles[0];
        const fileContent = await fs.readFile(filePath, 'utf8');
        const updatedContent = updateExplanationCheckInFile(fileContent, explanationCheck || '');
        await fs.writeFile(filePath, updatedContent, 'utf8');

        console.log('✅ 解説固定状態の保存完了:', filePath);
        res.json({
            success: true,
            message: '解説固定状態が保存されました',
            filePath
        });
    } catch (error) {
        console.error('❌ 解説固定状態保存エラー:', error);
        res.status(500).json({ error: '解説固定状態の保存に失敗しました' });
    }
});

// ★★★ 解説固定状態取得API ★★★
app.get('/api/get-explanation-check/:caseId', async (req, res) => {
    try {
        const { caseId } = req.params;
        if (!caseId) {
            return res.status(400).json({ error: 'ケースIDが必要です' });
        }

        console.log('📖 解説固定状態を取得中:', caseId);

        const caseFiles = await findCaseFileByPath(caseId);
        if (caseFiles.length === 0) {
            return res.status(404).json({ error: 'ケースファイルが見つかりません' });
        }

        const filePath = caseFiles[0];
        const fileContent = await fs.readFile(filePath, 'utf8');
        const explanationCheck = extractExplanationCheckFromFile(fileContent);

        console.log('✅ 解説固定状態の取得完了:', filePath, explanationCheck);
        res.json({
            success: true,
            explanationCheck,
            filePath
        });
    } catch (error) {
        console.error('❌ 解説固定状態取得エラー:', error);
        res.status(500).json({ error: '解説固定状態の取得に失敗しました' });
    }
});

// ★★★ スピード条文データ保存・読み込みAPI ★★★
const SPEED_QUIZ_DIR = path.join(__dirname2, 'public', 'speedQuiz');
if (!fssync.existsSync(SPEED_QUIZ_DIR)) fssync.mkdirSync(SPEED_QUIZ_DIR, { recursive: true });

/**
 * ケースIDからファイルパスを検索
 * @param {string} caseId - ケースID
 * @returns {Promise<Array<string>>} - 見つかったファイルパスのリスト
 */
/**
 * 相対パスからケースファイルを取得する新システム
 * @param {string} relativePath - 相対パス（例: "商法/3.機関/3.1-8.js"）
 * @returns {string} - 完全なファイルパス
 */
function getAbsolutePathFromRelative(relativePath) {
    const casesDir = path.join(__dirname2, 'public', 'cases');
    // .jsが付いていない場合は追加
    const pathWithExtension = relativePath.endsWith('.js') ? relativePath : relativePath + '.js';
    return path.join(casesDir, pathWithExtension);
}

/**
 * 相対パスからケースファイルを検索
 * @param {string} relativePath - 相対パス
 * @returns {Array<string>} - 見つかったファイルパスの配列
 */
async function findCaseFileByPath(relativePath) {
    const fullPath = getAbsolutePathFromRelative(relativePath);
    
    try {
        const stat = await fs.stat(fullPath);
        if (stat.isFile() && fullPath.endsWith('.js')) {
            return [fullPath];
        }
    } catch (error) {
        console.warn(`ファイルが見つかりません: ${fullPath}`, error.message);
    }
    
    return [];
}

/**
 * 廃止予定: ID検索システム（後方互換のため残存）
 * @deprecated 相対パスシステムを使用してください
 */
async function findCaseFile(caseId) {
    const casesDir = path.join(__dirname2, 'public', 'cases');
    const foundFiles = [];
    
    async function searchDirectory(dir) {
        try {
            const items = await fs.readdir(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = await fs.stat(itemPath);
                
                if (stat.isDirectory()) {
                    await searchDirectory(itemPath);
                } else if (item.endsWith('.js')) {
                    try {
                        const content = await fs.readFile(itemPath, 'utf8');
                        if (content.includes(`id: "${caseId}"`)) {
                            foundFiles.push(itemPath);
                        }
                    } catch (error) {
                        console.warn(`ファイル読み込みエラー: ${itemPath}`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn(`ディレクトリ読み込みエラー: ${dir}`, error.message);
        }
    }
    
    await searchDirectory(casesDir);
    return foundFiles;
}

/**
 * ファイル内容のストーリーデータを更新
 * @param {string} fileContent - ファイル内容
 * @param {Array} storyData - 更新するストーリーデータ
 * @returns {string} - 更新されたファイル内容
 */
function updateStoryDataInFile(fileContent, storyData) {
    // story配列の開始を見つける
    const storyStartPattern = /story:\s*\[/;
    const storyStartMatch = fileContent.match(storyStartPattern);
    if (!storyStartMatch) {
        throw new Error('story配列が見つかりません');
    }
    
    const storyStart = storyStartMatch.index;
    const arrayStart = storyStart + storyStartMatch[0].length - 1; // '[' の位置
    
    // story配列の終了位置を見つける（対応する],を検索）
    let bracketCount = 0;
    let storyEnd = -1;
    let i = arrayStart;
    
    // 最初の [ をカウント
    if (fileContent[i] === '[') {
        bracketCount = 1;
        i++;
    }
    
    for (; i < fileContent.length; i++) {
        if (fileContent[i] === '[') {
            bracketCount++;
        } else if (fileContent[i] === ']') {
            bracketCount--;
            if (bracketCount === 0) {
                // 配列の終了を検出
                // その次の文字が , であるかチェック
                if (i + 1 < fileContent.length && fileContent[i + 1] === ',') {
                    storyEnd = i + 1; // ',' を含める
                } else {
                    storyEnd = i; // ']' のみ
                }
                break;
            }
        }
    }
    
    if (storyEnd === -1) {
        throw new Error('story配列の終了が見つかりません');
    }
    
    // 新しいstory配列を生成
    const newStoryArray = generateStoryArrayString(storyData);
    
    // ファイル内容を更新
    const beforeStory = fileContent.substring(0, storyStart);
    const afterStoryComma = storyEnd < fileContent.length && fileContent[storyEnd] === ',' ? storyEnd + 1 : storyEnd + 1;
    const afterStory = fileContent.substring(afterStoryComma);
    
    return beforeStory + 'story: ' + newStoryArray + ',' + afterStory;
}

/**
 * ファイル内容からストーリーデータを抽出
 * @param {string} fileContent - ファイル内容
 * @returns {Array} - ストーリーデータ
 */
function extractStoryDataFromFile(fileContent) {
    try {
        // story配列の開始を見つける
        const storyStartPattern = /story:\s*\[/;
        const storyStartMatch = fileContent.match(storyStartPattern);
        if (!storyStartMatch) {
            console.log('story配列が見つからないため、空の配列を返します');
            return [];
        }

        const storyStart = storyStartMatch.index;
        const arrayStart = storyStart + storyStartMatch[0].length - 1; // '[' の位置

        // story配列の終了位置を見つける（対応する],を検索）
        let bracketCount = 0;
        let storyEnd = -1;
        let i = arrayStart;

        // 最初の [ をカウント
        if (fileContent[i] === '[') {
            bracketCount = 1;
            i++;
        }

        for (; i < fileContent.length; i++) {
            if (fileContent[i] === '[') {
                bracketCount++;
            } else if (fileContent[i] === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                    // 配列の終了を検出
                    storyEnd = i;
                    break;
                }
            }
        }

        if (storyEnd === -1) {
            console.log('story配列の終了が見つからないため、空の配列を返します');
            return [];
        }

        // story配列部分を抽出
        const storyArrayString = fileContent.substring(arrayStart, storyEnd + 1);

        // JavaScriptとして評価して配列を取得
        // 安全のため、evalの代わりにJSON.parseを使用できる形式に変換
        try {
            // シングルクォートをダブルクォートに変換し、JavaScriptオブジェクトをJSON形式に変換
            let jsonString = storyArrayString
                .replace(/'/g, '"')  // シングルクォートをダブルクォートに
                .replace(/(\w+):/g, '"$1":')  // キー名をクォート
                .replace(/,(\s*[}\]])/g, '$1'); // 末尾のカンマを削除

            const storyData = JSON.parse(jsonString);
            return Array.isArray(storyData) ? storyData : [];
        } catch (parseError) {
            console.warn('ストーリーデータのパースに失敗:', parseError.message);
            console.log('パース対象文字列:', storyArrayString);
            return [];
        }
    } catch (error) {
        console.error('ストーリーデータの抽出に失敗:', error);
        return [];
    }
}

/**
 * ストーリーデータからJavaScript配列文字列を生成
 * @param {Array} storyData - ストーリーデータ
 * @returns {string} - JavaScript配列文字列
 */
function generateStoryArrayString(storyData) {
    const items = storyData.map(item => {
        let itemStr = '    { ';
        itemStr += `type: '${item.type}'`;
        
        if (item.text) {
            itemStr += `, text: '${escapeJavaScriptString(item.text)}'`;
        }
        if (item.speaker) {
            itemStr += `, speaker: '${escapeJavaScriptString(item.speaker)}'`;
        }
        if (item.expression) {
            itemStr += `, expression: '${item.expression}'`;
        }
        if (item.dialogue) {
            itemStr += `, dialogue: '${escapeJavaScriptString(item.dialogue)}'`;
        }
        
        // embedオブジェクトの処理を追加
        if (item.type === 'embed') {
            if (item.format) {
                itemStr += `, format: '${item.format}'`;
            }
            if (item.title) {
                itemStr += `, title: '${escapeJavaScriptString(item.title)}'`;
            }
            if (item.description) {
                itemStr += `, description: '${escapeJavaScriptString(item.description)}'`;
            }
            if (item.content) {
                // contentは配列またはオブジェクトの場合があるため、JSONとして保存
                itemStr += `, content: ${JSON.stringify(item.content)}`;
            }
            if (item.textAlign) {
                itemStr += `, textAlign: '${item.textAlign}'`;
            }
        }
        
        if (item.check) {
            itemStr += `, check: "${item.check}"`;
        }
        
        itemStr += ' }';
        return itemStr;
    });
    
    return '[\n' + items.join(',\n') + '\n  ]';
}

/**
 * JavaScript文字列をエスケープ
 * @param {string} str - エスケープする文字列
 * @returns {string} - エスケープされた文字列
 */
function escapeJavaScriptString(str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

function updateExplanationCheckInFile(fileContent, explanationCheck) {
    const explanationCheckPattern = /explanationCheck:\s*['"`](.*?)['"`]/;
    if (explanationCheckPattern.test(fileContent)) {
        return fileContent.replace(explanationCheckPattern, `explanationCheck: "${explanationCheck}"`);
    }

    const explanationIndex = fileContent.indexOf('explanation:');
    if (explanationIndex === -1) {
        throw new Error('explanationセクションが見つかりません');
    }

    const insertionIndex = fileContent.indexOf('\n  //', explanationIndex);
    if (insertionIndex === -1) {
        throw new Error('解説セクションの終了位置が見つかりません');
    }

    return (
        fileContent.slice(0, insertionIndex) +
        `\n  explanationCheck: "${explanationCheck}",` +
        fileContent.slice(insertionIndex)
    );
}

function extractExplanationCheckFromFile(fileContent) {
    const match = fileContent.match(/explanationCheck:\s*['"`](.*?)['"`]/);
    return match ? match[1] : null;
}

// スピード条文データ保存API
app.post('/api/speed-quiz/save', async (req, res) => {
    try {
        const { lawName, data, moduleInfo } = req.body;
        
        if (!lawName || !data) {
            return res.status(400).json({ error: '法令名とデータが必要です' });
        }
        
        // ファイル名を正規化（特殊文字を除去）
        const fileName = lawName.replace(/[<>:"/\\|?*]/g, '_') + '.js';
        const filePath = path.join(SPEED_QUIZ_DIR, fileName);
        
        // 変数名用に法令名を正規化（アルファベットと数字のみ、空文字の場合はlawDataを使用）
        const variableName = lawName.replace(/[^a-zA-Z0-9]/g, '') || 'lawData';
        
        // 新しいデータ構造を作成（articlesにmodulesを含める）
        const fullData = {
            lawName: lawName,
            articles: data
        };
        
        // データをJavaScript形式で保存
        const jsContent = `// ${lawName}のスピード条文回答データ
// 自動生成ファイル - 手動編集は推奨されません
// 最終更新: ${new Date().toLocaleString('ja-JP')}

const ${variableName}_speedQuizData = ${JSON.stringify(fullData, null, 2)};

export default ${variableName}_speedQuizData;
`;
        
        await fs.writeFile(filePath, jsContent, 'utf8');
        console.log(`📊 スピード条文データ保存: ${fileName}`);
        
        res.json({ success: true, fileName });
        
    } catch (error) {
        console.error('❌ スピード条文データ保存エラー:', error);
        res.status(500).json({ error: 'データ保存に失敗しました' });
    }
});

// ★★★ クイズ結果保存API ★★★
const QUIZ_RESULTS_FILE = path.join(process.cwd(), 'data', 'quiz-results.json');

// クイズ結果保存
app.post('/api/quiz-results', async (req, res) => {
    try {
        const { date, result } = req.body;

        if (!date || !result || !result.articleNumber || typeof result.score !== 'number' || typeof result.isCorrect !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: '必要なフィールドが不足しています'
            });
        }

        // データディレクトリが存在することを確認
        const dataDir = path.dirname(QUIZ_RESULTS_FILE);
        await fs.mkdir(dataDir, { recursive: true });

        // 既存の結果を読み込み
        let existingResults = {};
        try {
            const fileContent = await fs.readFile(QUIZ_RESULTS_FILE, 'utf8');
            existingResults = JSON.parse(fileContent);
        } catch (error) {
            // ファイルが存在しない場合は新規作成
            existingResults = {};
        }

        // 日付ごとに結果をグループ化
        const dateKey = date;
        if (!existingResults[dateKey]) {
            existingResults[dateKey] = [];
        }

        // 結果を追加
        existingResults[dateKey].push(result);

        // ファイルを保存
        await fs.writeFile(QUIZ_RESULTS_FILE, JSON.stringify(existingResults, null, 2), 'utf8');

        console.log(`📝 クイズ結果を保存: ${dateKey} - ${result.isCorrect ? '正解' : '不正解'} (${result.articleNumber})`);
        res.json({ success: true, message: 'クイズ結果を保存しました' });

    } catch (error) {
        console.error('❌ クイズ結果保存エラー:', error);
        res.status(500).json({ error: 'クイズ結果の保存に失敗しました' });
    }
});

// 指定日のクイズ結果取得
app.get('/api/quiz-results/:date', async (req, res) => {
    try {
        const { date } = req.params;

        // ファイルが存在するか確認
        if (!fssync.existsSync(QUIZ_RESULTS_FILE)) {
            return res.json([]);
        }

        // 結果を読み込み
        const fileContent = await fs.readFile(QUIZ_RESULTS_FILE, 'utf8');
        const allResults = JSON.parse(fileContent);

        // 指定日の結果を返す
        const dayResults = allResults[date] || [];
        res.json(dayResults);

    } catch (error) {
        console.error('❌ クイズ結果取得エラー:', error);
        res.status(500).json({ error: 'クイズ結果の取得に失敗しました' });
    }
});

// 全クイズ結果取得
app.get('/api/quiz-results', async (req, res) => {
    try {
        // ファイルが存在するか確認
        if (!fssync.existsSync(QUIZ_RESULTS_FILE)) {
            return res.json({});
        }

        // 結果を読み込み
        const fileContent = await fs.readFile(QUIZ_RESULTS_FILE, 'utf8');
        const allResults = JSON.parse(fileContent);

        res.json(allResults);

    } catch (error) {
        console.error('❌ 全クイズ結果取得エラー:', error);
        res.status(500).json({ error: 'クイズ結果の取得に失敗しました' });
    }
});

// スピード条文データ読み込みAPI
app.get('/api/speed-quiz/load/:lawName', async (req, res) => {
    try {
        const { lawName } = req.params;
        
        // ファイル名を正規化
        const fileName = lawName.replace(/[<>:"/\\|?*]/g, '_') + '.js';
        const filePath = path.join(SPEED_QUIZ_DIR, fileName);
        
        // ファイルが存在するかチェック
        try {
            await fs.access(filePath);
        } catch {
            // ファイルが存在しない場合は空データを返す
            return res.json({});
        }
        
        // ファイルを読み込んでJSONデータを抽出
        const content = await fs.readFile(filePath, 'utf8');
        const variableName = lawName.replace(/[^a-zA-Z0-9]/g, '') || 'lawData';
        const match = content.match(new RegExp(`const\\s+${variableName}_speedQuizData\\s+=\\s+(\\{[\\s\\S]*\\});`));
        
        if (match) {
            const data = JSON.parse(match[1]);
            
            // 新しいデータ構造の場合は articles 部分を返す、古い構造の場合はそのまま返す
            if (data.articles && data.lawName) {
                res.json(data.articles);
            } else {
                res.json(data);
            }
        } else {
            // フォールバック: より汎用的なパターンでマッチングを試行
            const fallbackMatch = content.match(/const\s+\w+_speedQuizData\s+=\s+(\{[\s\S]*\});/);
            if (fallbackMatch) {
                const data = JSON.parse(fallbackMatch[1]);
                if (data.articles && data.lawName) {
                    res.json(data.articles);
                } else {
                    res.json(data);
                }
            } else {
                res.json({});
            }
        }
        
    } catch (error) {
        console.error('❌ スピード条文データ読み込みエラー:', error);
        res.status(500).json({ error: 'データ読み込みに失敗しました' });
    }
});

// 全スピード条文データ一覧API
app.get('/api/speed-quiz/list', async (req, res) => {
    try {
        const files = await fs.readdir(SPEED_QUIZ_DIR);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        const lawNames = jsFiles.map(file => 
            file.replace('.js', '').replace(/_/g, '')
        );
        
        res.json({ laws: lawNames, fileCount: jsFiles.length });
        
    } catch (error) {
        console.error('❌ スピード条文データ一覧取得エラー:', error);
        res.status(500).json({ error: 'データ一覧取得に失敗しました' });
    }
});

// ★★★ SPAルーティング対応（Render.com用） ★★★
// 全てのAPIルート以外をindex.htmlにリダイレクト
app.get('*', (req, res) => {
    // APIルートは除外
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.resolve('./public/index.html'));
});

// ★★★ エラーハンドリングミドルウェア ★★★
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        error: 'あたしんち学習アプリでエラーが発生しました',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// --- サーバー起動 ---
async function startServer() {
    await ensureLogsDirectory();

    // ★★★ Step 1: サーバー起動前 - 既存XMLファイルの読み込み（lawLoader.js委任） ★★★
    console.log('📂 サーバー起動前: 既存XMLファイルの読み込み開始');
    globalXMLFiles = await loadExistingXMLFiles();

    // ★★★ Step 2: サーバー起動 ★★★
    app.listen(port, () => {
        console.log(`🚀 あたしんち学習アプリサーバーが http://localhost:${port} で起動しました。`);
        if (process.env.RENDER) {
            console.log(`🌐 Render.com デプロイURL: https://atashinchi-study.onrender.com`);
        }
        console.log('═'.repeat(60));
        console.log(`📚 対応法令 (${SUPPORTED_LAWS.length}件): ${SUPPORTED_LAWS.join(', ')}`);
        console.log(`📁 読み込み済みXMLファイル: ${globalXMLFiles.size}件`);
        console.log(`🔧 使用中のAIモデル: ${MODEL_NAME}`);
        console.log(`📁 学習ログディレクトリ: ${LOGS_DIR}`);
        console.log('═'.repeat(60));
        console.log('🎯 利用可能なAPI:');
        console.log('   GET  /api/get-article?law=民法&article=110');
        console.log('   POST /api/parse-article {"inputText": "民法465条の4第1項"}');
        console.log('   GET  /api/supported-laws');
        console.log('   GET  /api/xml-status');
        console.log('   POST /api/gemini');
        console.log('   GET  /api/health');
        console.log('   GET  /api/ping');
        console.log('═'.repeat(60));
        console.log('💡 あたしんち学習アプリ - Render.com対応版で動作中');
    });

    // ★★★ Step 3: サーバー起動後 - 全法令の更新チェック（lawLoader.js委任） ★★★
    console.log('\n🔄 サーバー起動後: 全法令の更新チェック開始');
    
    try {
        const { results, existingFiles } = await updateAllSupportedLaws(SUPPORTED_LAWS, globalXMLFiles);
        globalXMLFiles = existingFiles;
        
        console.log('\n🎉 法令管理システム起動完了！');
        console.log(`📊 利用可能な法令: ${globalXMLFiles.size}件`);
        console.log('🎯 司法試験の勉強を開始できます！');
        
    } catch (error) {
        console.error('\n❌ 法令更新チェック中にエラーが発生しました:', error.message);
        console.log('⚠️ 一部の法令で問題が発生している可能性があります。');
    }
}

startServer();
