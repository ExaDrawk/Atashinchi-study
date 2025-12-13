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
import { characters, COMMON_EXPRESSIONS } from './public/data/characters.js';
import d1Client from './d1Client.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

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
        sameSite: 'lax' // Google OAuth用にlaxに変更（strictだとコールバックで問題）
    }
}));

// ★★★ Passport.js設定（Google OAuth） ★★★
app.use(passport.initialize());
app.use(passport.session());

// Passportシリアライズ設定
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google OAuth Strategy設定
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // ユーザー情報を構築
            const user = {
                id: profile.id,
                email: profile.emails?.[0]?.value,
                displayName: profile.displayName,
                picture: profile.photos?.[0]?.value,
                provider: 'google'
            };

            console.log('🔐 Googleログイン成功:', user.email);

            // D1にユーザーを登録（存在しない場合）
            if (process.env.D1_API_URL) {
                try {
                    await d1Client.createUser(user.email, `google:${user.id}`);
                    console.log('✅ D1にユーザー登録:', user.email);
                } catch (d1Error) {
                    // 既に存在する場合はエラーを無視
                    console.log('ℹ️ D1ユーザー登録スキップ（既存）:', user.email);
                }
            }

            return done(null, user);
        } catch (error) {
            console.error('❌ Google認証エラー:', error);
            return done(error, null);
        }
    }));
    console.log('✅ Google OAuth設定完了');
} else {
    console.log('⚠️ Google OAuth未設定（GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET が必要）');
}

// ★★★ Google認証ルート ★★★
// ログインページからGoogleへリダイレクト
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Googleからのコールバック
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login.html?error=google_auth_failed' }),
    (req, res) => {
        // セッションにユーザー情報を保存
        req.session.authenticated = true;
        req.session.username = req.user.email;
        req.session.displayName = req.user.displayName;
        req.session.picture = req.user.picture;
        req.session.provider = 'google';
        req.session.lastAccess = new Date();

        console.log('✅ Googleログイン完了:', req.user.email);

        // リダイレクト
        const redirectUrl = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

// カスタム認証ミドルウェア
const requireAuth = (req, res, next) => {
    // 認証不要なパス
    const publicPaths = ['/login.html', '/api/auth/login', '/api/auth/logout', '/api/health', '/api/ping', '/api/subfolders', '/health', '/health.html', '/api/d1-status', '/auth/google'];
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
    req.session.returnTo = req.originalUrl;
    const redirectUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`/login.html?redirect=${redirectUrl}&error=unauthorized`);
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// ★★★ Grok API設定（xAI - OpenAI互換API） ★★★
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-1-fast';
const GROK_MODEL_FOR_RAG = 'grok-4-1-fast'; // RAG（コレクション検索）使用時はgrok-3を使用

// ★★★ xAI Collections（RAG）設定 ★★★
const GROK_QA_COLLECTION_ID = 'collection_64ccd2d1-90ac-444c-bd5b-4e6d4fb3b8e0';

// 現在のAIプロバイダ（デフォルトはGrok）
let currentAIProvider = 'grok';

// ★★★ Grok API呼び出し関数（RAG対応） ★★★
async function callGrokAPI(prompt, systemPrompt = '', useCollectionSearch = false) {
    const messages = [];

    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    // リクエストボディを構築
    const requestBody = {
        model: useCollectionSearch ? GROK_MODEL_FOR_RAG : GROK_MODEL,
        messages: messages,
        temperature: 0.7
    };

    // ★★★ RAG（コレクション検索）を使用する場合 ★★★
    // collection_id をトップレベルパラメータとして指定
    if (useCollectionSearch && GROK_QA_COLLECTION_ID) {
        requestBody.collection_id = GROK_QA_COLLECTION_ID;
        console.log(`📚 RAG有効: コレクション=${GROK_QA_COLLECTION_ID}, モデル=${GROK_MODEL_FOR_RAG}`);
    }

    const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ★★★ 統合AI呼び出し関数（Gemini/Grok切り替え対応） ★★★
// useCollectionSearch: Q&Aコレクションを参照する場合はtrue
async function callAI(prompt, systemPrompt = '', useCollectionSearch = false) {
    if (currentAIProvider === 'grok' && GROK_API_KEY) {
        console.log('🤖 Grok APIを使用' + (useCollectionSearch ? '（Q&Aコレクション参照有効）' : ''));
        return await callGrokAPI(prompt, systemPrompt, useCollectionSearch);
    } else if (process.env.GEMINI_API_KEY) {
        console.log('🤖 Gemini APIを使用');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });
        return response.text;
    } else {
        throw new Error('利用可能なAI APIがありません');
    }
}

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

// ★★★ Q&Aファイル管理API ★★★
const QA_DIR = path.join(process.cwd(), 'public', 'data', 'qa');

// Q&Aファイル一覧取得
app.get('/api/qa/files', async (req, res) => {
    try {
        const files = await fs.readdir(QA_DIR);
        const qaFiles = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(QA_DIR, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);

                // 問題数をカウント
                const questionCount = data.questions ? Object.keys(data.questions).length : 0;

                qaFiles.push({
                    fileName: file,
                    subject: data.subject || '不明',
                    subcategories: data.subcategories || {},
                    version: data.version || '1.0',
                    lastUpdated: data.lastUpdated || '不明',
                    questionCount
                });
            }
        }

        // ファイル名でソート
        qaFiles.sort((a, b) => a.fileName.localeCompare(b.fileName, 'ja'));

        res.json({
            success: true,
            files: qaFiles,
            totalFiles: qaFiles.length
        });
    } catch (error) {
        console.error('❌ Q&Aファイル一覧取得エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Q&Aファイル一覧の取得に失敗しました',
            details: error.message
        });
    }
});

// Q&Aファイル個別取得
app.get('/api/qa/files/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const filePath = path.join(QA_DIR, fileName);

        // ファイル存在チェック
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({
                success: false,
                error: 'ファイルが見つかりません'
            });
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        res.json({
            success: true,
            fileName,
            data
        });
    } catch (error) {
        console.error('❌ Q&Aファイル取得エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Q&Aファイルの取得に失敗しました',
            details: error.message
        });
    }
});

// Q&Aファイル追加（JSONから）
app.post('/api/qa/files', async (req, res) => {
    try {
        const { jsonData, fileName } = req.body;

        if (!jsonData) {
            return res.status(400).json({
                success: false,
                error: 'JSONデータが必要です'
            });
        }

        // JSONをパース
        let data;
        try {
            data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                error: 'JSONの解析に失敗しました',
                details: parseError.message
            });
        }

        // 必須フィールドの検証
        if (!data.subject) {
            return res.status(400).json({
                success: false,
                error: 'subjectフィールドが必要です'
            });
        }

        if (!data.questions || typeof data.questions !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'questionsフィールド（オブジェクト形式）が必要です'
            });
        }

        // ファイル名を決定
        let targetFileName = fileName;
        if (!targetFileName) {
            // サブカテゴリーからファイル名を生成
            const subcategoryKeys = data.subcategories ? Object.keys(data.subcategories) : [];
            const subcategoryId = subcategoryKeys.length > 0 ? subcategoryKeys[0] : '';

            // 既存ファイル数をカウントして次の番号を決定
            const existingFiles = await fs.readdir(QA_DIR);
            const subjectFiles = existingFiles.filter(f => f.startsWith(`${data.subject}_`) && f.endsWith('.json'));

            // 既存の最大番号を取得
            let maxNum = 0;
            for (const f of subjectFiles) {
                const match = f.match(new RegExp(`^${data.subject}_(\\d+)\\.json$`));
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            }

            // サブカテゴリーIDが空の場合は次の番号を使用
            const fileNum = subcategoryId || (maxNum + 1);
            targetFileName = `${data.subject}_${fileNum}.json`;
        }

        // .jsonの拡張子を確保
        if (!targetFileName.endsWith('.json')) {
            targetFileName += '.json';
        }

        const filePath = path.join(QA_DIR, targetFileName);

        // 既存ファイルチェック
        try {
            await fs.access(filePath);
            return res.status(409).json({
                success: false,
                error: 'ファイルが既に存在します',
                fileName: targetFileName
            });
        } catch {
            // ファイルが存在しない＝OK
        }

        // lastUpdatedを設定
        if (!data.lastUpdated) {
            data.lastUpdated = new Date().toISOString().split('T')[0];
        }

        // versionを設定
        if (!data.version) {
            data.version = '1.0';
        }

        // ファイルを保存
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

        console.log(`✅ Q&Aファイル追加完了: ${targetFileName}`);

        res.json({
            success: true,
            message: 'Q&Aファイルを追加しました',
            fileName: targetFileName,
            questionCount: Object.keys(data.questions).length
        });
    } catch (error) {
        console.error('❌ Q&Aファイル追加エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Q&Aファイルの追加に失敗しました',
            details: error.message
        });
    }
});

// Q&Aファイル削除
app.delete('/api/qa/files/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const filePath = path.join(QA_DIR, fileName);

        // ファイル存在チェック
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({
                success: false,
                error: 'ファイルが見つかりません'
            });
        }

        // ファイル削除
        await fs.unlink(filePath);

        console.log(`🗑️ Q&Aファイル削除完了: ${fileName}`);

        res.json({
            success: true,
            message: 'Q&Aファイルを削除しました',
            fileName
        });
    } catch (error) {
        console.error('❌ Q&Aファイル削除エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Q&Aファイルの削除に失敗しました',
            details: error.message
        });
    }
});

// Q&Aファイル更新（上書き保存）
app.put('/api/qa/files/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const { jsonData } = req.body;
        const filePath = path.join(QA_DIR, fileName);

        // ファイル存在チェック
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({
                success: false,
                error: 'ファイルが見つかりません'
            });
        }

        // JSONをパース
        let data;
        try {
            data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                error: 'JSONの解析に失敗しました',
                details: parseError.message
            });
        }

        // lastUpdatedを更新
        data.lastUpdated = new Date().toISOString().split('T')[0];

        // ファイルを上書き保存
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

        console.log(`📝 Q&Aファイル更新完了: ${fileName}`);

        res.json({
            success: true,
            message: 'Q&Aファイルを更新しました',
            fileName,
            questionCount: data.questions ? Object.keys(data.questions).length : 0
        });
    } catch (error) {
        console.error('❌ Q&Aファイル更新エラー:', error);
        res.status(500).json({
            success: false,
            error: 'Q&Aファイルの更新に失敗しました',
            details: error.message
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

        // ★★★ 統合AI呼び出し関数を使用（Grok/Gemini両対応） ★★★
        const responseText = await callAI(finalPrompt, systemInstruction);

        console.log('✅ AI API成功', { responseLength: responseText.length });
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

// ★★★ ヘルスチェックページ ★★★
app.get('/health', (req, res) => {
    res.sendFile('health.html', { root: './public' });
});

app.get('/api/ping', (req, res) => {
    res.json({ pong: true, timestamp: new Date().toISOString() });
});

// ★★★ D1データベースステータス確認API ★★★
app.get('/api/d1-status', async (req, res) => {
    try {
        const d1Health = await d1Client.checkD1Health();
        res.json({
            success: true,
            d1: d1Health,
            d1ApiUrl: process.env.D1_API_URL || 'not configured'
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// ★★★ AI切り替えAPI ★★★
app.get('/api/ai-status', (req, res) => {
    const geminiAvailable = !!process.env.GEMINI_API_KEY;
    const grokAvailable = !!GROK_API_KEY;

    res.json({
        gemini: {
            available: geminiAvailable,
            active: currentAIProvider === 'gemini'
        },
        grok: {
            available: grokAvailable,
            active: currentAIProvider === 'grok'
        },
        currentProvider: currentAIProvider
    });
});

app.post('/api/ai-provider/switch', (req, res) => {
    const { provider } = req.body;

    if (provider !== 'gemini' && provider !== 'grok') {
        return res.status(400).json({
            success: false,
            error: '無効なプロバイダです。geminiまたはgrokを指定してください。'
        });
    }

    if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
        return res.json({
            success: false,
            error: 'Gemini APIキーが設定されていません。'
        });
    }

    if (provider === 'grok' && !GROK_API_KEY) {
        return res.json({
            success: false,
            error: 'Grok APIキーが設定されていません。'
        });
    }

    currentAIProvider = provider;
    console.log(`🤖 AIプロバイダを切り替え: ${provider}`);

    res.json({
        success: true,
        message: `AIプロバイダを ${provider} に切り替えました。`,
        currentProvider: currentAIProvider
    });
});

// ★★★ Q&Aファイル一覧取得API ★★★
app.get('/api/qa-files', async (req, res) => {
    try {
        // ESモジュール用の__dirname取得
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const qaDir = path.join(__dirname, 'public', 'data', 'qa');
        const files = await fs.readdir(qaDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        res.json(jsonFiles);
    } catch (error) {
        console.error('❌ Q&Aファイル一覧取得エラー:', error.message);
        res.json([]); // エラー時は空配列を返す
    }
});

// ★★★ Q&A穴埋めテンプレート生成API ★★★
app.post('/api/qa-fill/generate', async (req, res) => {
    console.log('========================================');
    console.log('🎯 /api/qa-fill/generate リクエスト受信！');
    console.log('📦 req.body:', JSON.stringify(req.body, null, 2).substring(0, 500));
    console.log('========================================');

    try {
        const { relativePath, qaId, level, forceRefresh, historySnapshot, standaloneQA, referenceMaterial } = req.body;

        console.log('📝 Q&A穴埋めテンプレート生成リクエスト:', { relativePath, qaId, level, hasStandaloneQA: !!standaloneQA, hasReference: !!referenceMaterial });

        const qaData = standaloneQA;

        if (!qaData || !qaData.answer) {
            return res.json({
                success: true,
                template: {
                    text: '回答を入力してください',
                    blanks: [],
                    fallback: true
                }
            });
        }

        // ★★★ 参考資料がある場合はプロンプトに含める ★★★
        const referenceSection = referenceMaterial ? `
【参考資料】
${referenceMaterial}

この参考資料を踏まえて、ユーザーの理解を深める穴埋め問題を作成してください。
` : '';

        // ★★★ レベルに応じたプロンプトを生成 ★★★
        let prompt;

        if (level === 3) {
            // Lv3: 応用・全文記述
            prompt = `司法試験の記述式問題を作成してください。

【設問】
${qaData.question || ''}

【模範解答】
${qaData.answer || ''}
${referenceSection}
【最重要：現在のQ&Aに集中すること】
・上記の「設問」と「模範解答」の内容だけを元に問題を作成してください。
・他のQ&Aや関連知識を勝手に追加して問題文を拡張しないでください。
・模範解答に含まれていない内容は出題しないでください。
・関連Q&Aへのリンク【id:xxx】は補足として適宜挿入してください。

【Lv3（全文記述）の出題形式 - 重要】
以下の2パターンのいずれかで出題してください。**「文章の途中に穴埋め（空欄）を作る」ことは絶対に避けてください。**

■ パターンA: 一括記述（推奨）
・設問に対して、まとめて回答させる形式。
・構成：「問題文」＋「{{模範解答全体}}」
・例：「物上代位の定義・要件・効果について説明しなさい。
{{模範解答}}」

■ パターンB: 段階的記述（複雑な場合）
・論点が複数ある場合、(1)(2)のように小問に分けて回答させる形式。
・**各小問は完全な疑問文にし、その直後に回答欄を配置すること。**
・**「〜は{{回答}}である」のように、文中に穴埋めを作ることは禁止（UIが崩れるため）。**
・例：
  「(1) まず、○○の定義を述べなさい。
  {{定義部分の模範解答}}」

  「(2) 次に、この判例の判断基準を説明しなさい。
  {{判断基準部分の模範解答}}」

【絶対厳守ルール】
・**判例の年月日（例：最決平10.12.18）は絶対に空欄にしないこと！**
・**空欄（{{...}}）の中身は、プレースホルダーではなく「実際の模範解答のテキスト」を入れること。**
・採点AIがこの中身を基準に採点するため、正確な解答を入れる必要があります。

【出力形式】
・回答欄は {{模範解答テキスト}} の形式。
・関連Q&A参照は【id:カテゴリー.サブカテゴリー.番号】形式。

【出力】JSONのみ:
{"template": "記述問題文（(1)質問文\n{{回答}}\n(2)質問文\n{{回答}} の形式）"}`
        } else if (level === 2) {
            // Lv2: 発展・穴埋め
            prompt = `司法試験の穴埋め問題を作成してください。

【元の解答】
${qaData.answer || ''}
${referenceSection}
【最重要：現在のQ&Aに集中すること】
・上記の「元の解答」の内容だけを元に問題を作成してください。
・他のQ&Aや関連知識を勝手に追加して問題文を拡張しないでください。
・元の解答に含まれていない内容は出題しないでください。
・空欄数は内容の長さや重要性に応じて適切に決定してください。
・関連Q&Aへのリンク【id:xxx】は補足として適宜挿入してください。

【Lv2（発展・穴埋め）の特徴】
・模範解答の主要部分を残しつつ、重要概念を空欄化
・法的概念、要件、効果などの重要キーワードを空欄化

【絶対厳守ルール】
・**判例の年月日（例：最決平10.12.18、最判昭45.6.24など）は絶対に空欄にしないこと！**
・**元の解答の範囲内で出題すること！関係ない内容を追加しないこと！**
・学習効果を高めるために、文脈を整理し、より洗練された問題文に書き換えること。

【出力形式】
・空欄にしたい語句は {{語句}} の形式で囲んでください。例: 「{{抵当権者}}は物上代位権を行使できる」
・関連Q&A参照は【id:カテゴリー.サブカテゴリー.番号】形式。番号はゼロパディングなし。

【出力】JSONのみ:
{"template": "穴埋め問題文（{{語句}}形式で空欄、【id:xxx】形式でQ&A参照を含む）"}`
        } else {
            // Lv1: 基礎・穴埋め
            prompt = `司法試験の穴埋め問題を作成してください。

【元の解答】
${qaData.answer || ''}
${referenceSection}
【最重要：現在のQ&Aに集中すること】
・上記の「元の解答」の内容だけを元に問題を作成してください。
・他のQ&Aや関連知識を勝手に追加して問題文を拡張しないでください。
・元の解答に含まれていない内容は出題しないでください。
・空欄数は内容の長さや重要性に応じて適切に決定してください。
・関連Q&Aへのリンク【id:xxx】は補足として適宜挿入してください。

【Lv1（基礎・穴埋め）の特徴】
・模範解答の大部分を残し、基本用語を空欄化
・基礎的な法律用語・概念を中心に空欄化
・暗記と基礎知識の確認に重点

【絶対厳守ルール】
・**判例の年月日（例：最決平10.12.18、最判昭45.6.24など）は絶対に空欄にしないこと！**
・**元の解答の範囲内で出題すること！関係ない内容を追加しないこと！**
・読みやすく、学習しやすいように文章を適宜リライトすること。

【出力形式】
・空欄にしたい語句は {{語句}} の形式で囲んでください。例: 「{{民法372条}}によれば」
・関連Q&A参照は【id:カテゴリー.サブカテゴリー.番号】形式。番号はゼロパディングなし。

【出力】JSONのみ:
{"template": "穴埋め問題文（{{語句}}形式で空欄、【id:xxx】形式でQ&A参照を含む）"}`
        }

        // ★★★ Collections Search Toolを使ってQ&Aコレクションを参照 ★★★
        const responseText = await callAI(prompt, '', true);

        console.log('🤖 AI応答（生テキスト）:', responseText.substring(0, 500));

        // JSON部分を抽出
        let templateData;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            console.log('📋 JSONマッチ:', jsonMatch ? jsonMatch[0].substring(0, 300) : 'なし');

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const templateText = parsed.template || responseText;
                console.log('📊 パース結果:', { template: templateText?.substring(0, 100) });

                // ★★★ {{語句}}形式から空欄を抽出 ★★★
                const blankPattern = /\{\{([^}]+)\}\}/g;
                const blanksArray = [];
                let match;
                let blankIndex = 0;

                while ((match = blankPattern.exec(templateText)) !== null) {
                    blankIndex++;
                    blanksArray.push({
                        id: `B${blankIndex}`,
                        label: `(${blankIndex})`,
                        answer: match[1].trim()
                    });
                }

                console.log('📝 抽出された空欄:', blanksArray.map(b => b.answer));

                // テンプレートテキストはそのまま保持（フロントエンドで{{}}と【id:xxx】をパースして表示）
                templateData = {
                    text: templateText,
                    blanks: blanksArray
                };
            } else {
                templateData = { text: responseText, blanks: [] };
            }
        } catch (parseError) {
            console.error('❌ JSONパースエラー:', parseError.message);
            templateData = { text: responseText, blanks: [] };
        }

        console.log('✅ 最終テンプレートデータ:', { textLength: templateData.text?.length, blanksCount: templateData.blanks?.length });

        res.json({
            success: true,
            template: templateData
        });

    } catch (error) {
        console.error('❌ Q&A穴埋めテンプレート生成エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'テンプレート生成に失敗しました'
        });
    }
});

// ★★★ Q&A穴埋め採点API（キャラクター添削付き） ★★★
app.post('/api/qa-fill/grade', async (req, res) => {
    try {
        const { relativePath, qaId, level, template, answers, standaloneQA, characters: requestCharacters, referenceMaterial } = req.body;

        console.log('📝 Q&A穴埋め採点リクエスト:', { relativePath, qaId, level, answersCount: answers?.length, hasReference: !!referenceMaterial });

        // 正解情報を取得
        const correctAnswers = template?.blanks?.map(b => b.answer) || [];

        // ★★★ characters.jsから表情リストを参照 ★★★
        const validExpressions = COMMON_EXPRESSIONS;

        // ★★★ キャラクター選択ロジック ★★★
        let characterSection;
        let characterInstruction;

        if (requestCharacters && requestCharacters.length > 0) {
            // ケースページなど、キャラクターが指定されている場合はそのキャラを使用
            const charData = characters.find(c => c.name === requestCharacters[0] || c.aliases?.includes(requestCharacters[0]));
            const mainPersonality = charData?.persona || '';
            const mainCharacter = requestCharacters[0];
            characterSection = `【添削キャラクター】${mainCharacter}
【キャラクター設定】
${mainPersonality}`;
            characterInstruction = `キャラクター「${mainCharacter}」として添削してください。`;
        } else {
            // キャラクターが指定されていない場合は、全キャラの情報を送ってAIに選ばせる
            const allCharacterPersonas = characters
                .filter(c => c.persona) // ペルソナがあるキャラのみ
                .map(c => `■ ${c.name}（${c.age || '不明'}）: ${c.persona}`)
                .join('\n\n');

            characterSection = `【利用可能なキャラクター一覧】
以下のキャラクターの中から、この問題の内容・科目に最も適したキャラクターを1人選んで添削してください。

${allCharacterPersonas}`;
            characterInstruction = `上記のキャラクター一覧から、この問題の法分野・論点に最も詳しそうなキャラクターを1人選び、そのキャラクターとして添削してください。キャラクターの個性・口調を忠実に再現すること。`;
        }

        // ★★★ レベルに応じた採点プロンプトを生成 ★★★
        let prompt;

        if (level === 3) {
            // Lv3: 応用・記述（長文）の詳細採点
            prompt = `あなたは司法試験対策の添削指導者です。${characterInstruction}

${characterSection}

【Lv3（応用・全文記述）の採点基準 - 100点満点で詳細に採点】
このレベルは論述式問題です。AIが採点基準を決めて、100点満点で採点してください。
以下の観点を参考に、各観点の配点は問題の性質に応じてAIが適切に決定してください：

1. **論理構成**: 論点の整理、順序立て、論理の飛躍がないか
2. **網羅性**: 書くべき論点や要素を落としていないか
3. **正確性**: 法的概念、判例、条文の理解が正確か
4. **表現力**: 司法試験答案として適切な表現ができているか

【問題文】
${template?.text || ''}

【模範解答の核心ポイント】
${standaloneQA?.answer || ''}
${referenceMaterial ? `
【参考資料】
${referenceMaterial}
` : ''}
【採点対象（学習者の回答）】
${correctAnswers.map((ans, i) => `(${i + 1}) 正解「${ans}」 ← 回答「${answers?.[i]?.text || answers?.[i] || ''}`).join('\n')}

【Lv3の総合評価基準（100点満点）】
○ = 80点以上（論点を正確に捉え、適切に論述できている）
△ = 30点以上80点未満（論点は理解しているが、論述が不十分または表現が不正確）
☓ = 30点未満（論点を落としている、または重大な誤解がある）

【フィードバックの書き方（詳細）】
・総合点数（0〜100）を必ず算出すること
・各空欄について：正解か否かだけでなく、その回答が論述全体でどう評価されるかを説明
・論理構成の評価：論点の順序、因果関係の説明が適切か
・網羅性の評価：書くべきだったが書かれていない論点を指摘
・正確性の評価：法的概念の理解度、判例の射程の理解を評価
・改善点の提示：次回どう書けばより良い答案になるか具体的にアドバイス
・選んだキャラクターの口調・個性を忠実に再現すること

【使用可能な表情】${validExpressions.join(', ')}

【出力形式】JSONのみ:
{
  "evaluation": {
    "blanks": [
      {"id": "B1", "result": "○/△/☓", "feedback": "【選んだキャラの口調で】詳細な論述評価", "speaker": "選んだキャラ名", "expression": "表情"}
    ],
    "overall": {
      "passed": true/false,
      "score": {
        "total": 0-100,
        "breakdown": {
          "logic": {"score": 0-100, "weight": "配点割合%", "comment": "論理構成の評価コメント"},
          "coverage": {"score": 0-100, "weight": "配点割合%", "comment": "網羅性の評価コメント"},
          "accuracy": {"score": 0-100, "weight": "配点割合%", "comment": "正確性の評価コメント"},
          "expression": {"score": 0-100, "weight": "配点割合%", "comment": "表現力の評価コメント"}
        }
      },
      "result": "○/△/☓",
      "summary": "【選んだキャラの口調で】論述全体の評価と具体的な改善点（3-4文）",
      "missingPoints": ["書くべきだったが書かれていない論点1", "論点2"],
      "relatedQAs": ["id:カテゴリー.サブカテゴリー.番号", ...],
      "speaker": "選んだキャラ名",
      "expression": "表情"
    }
  }
}`
        } else {
            // Lv1, Lv2: 通常の穴埋め採点
            prompt = `あなたは司法試験対策の添削指導者です。${characterInstruction}

${characterSection}

【重要：添削の質】
・「正解は○○です」「○○が正しい」だけの添削は絶対禁止！
・なぜその答えが正解なのか、法的根拠や制度趣旨を説明する
・間違った場合：なぜその間違いをしがちなのか、何と混同しやすいかを指摘
・正解の場合：その理解が他のどの論点に活きるかを補足
・司法試験論文式試験の採点者が求める視点を意識した解説
・選んだキャラクターの口調・個性を忠実に再現すること

【穴埋め問題】
${template?.text || ''}

【採点対象】
${correctAnswers.map((ans, i) => `(${i + 1}) 正解「${ans}」 ← 回答「${answers?.[i]?.text || answers?.[i] || ''}`).join('\n')}
${referenceMaterial ? `
【参考資料】
${referenceMaterial}

上記の参考資料を踏まえて、ユーザーの理解を深める添削をしてください。
` : ''}
【判定基準】
○ = 正解（同義語・表記揺れも含む）
△ = 惜しい（関連概念だが不正確）
☓ = 不正解

【順不同の採点ルール - 非常に重要】
法律の答案では、複数の要素を列挙する場合、順序が問われないケースが多いです。
以下のような場合は、順番が違っても同じ要素が含まれていれば ○ としてください：
・「A・B・C」のように「・」で区切られた列挙
・「A、B、C」のように「、」で区切られた列挙
・「①A ②B ③C」のように番号付きでも、内容的に順序が本質でない列挙
・要件の列挙（例：成立要件、効果、趣旨など）
・判例の規範で列挙される考慮要素

AIとして文脈から「この列挙は順序が本質的か」を判断し、順序が本質でなければ順不同で採点してください。

【フィードバックの書き方】
・○の場合：「正解！」だけでなく、なぜそれが正解か1文で補足
・△の場合：何が惜しいか、正解との違いを具体的に説明
・☓の場合：なぜ間違いやすいか、何と混同したかを推測して指摘

【使用可能な表情】${validExpressions.join(', ')}

【出力形式】JSONのみ:
{
  "evaluation": {
    "blanks": [
      {"id": "B1", "result": "○", "feedback": "【選んだキャラの口調で】理由付きのフィードバック", "speaker": "選んだキャラ名", "expression": "表情"},
      {"id": "B2", "result": "☓", "feedback": "【選んだキャラの口調で】混同ポイントと正しい理解の解説", "speaker": "選んだキャラ名", "expression": "表情"}
    ],
    "overall": {
      "passed": true/false,
      "summary": "【選んだキャラの口調で】この問題の核心ポイントと今後の学習アドバイス（2-3文）",
      "speaker": "選んだキャラ名",
      "expression": "表情",
      "relatedQAs": ["id:カテゴリー.サブカテゴリー.番号", ...]
    }
  }
}`
        }

        // ★★★ Collections Search Toolを使ってQ&Aコレクションを参照 ★★★
        const responseText = await callAI(prompt, '', true);
        console.log('🤖 採点AI応答:', responseText.substring(0, 500));

        // JSON部分を抽出
        let gradeData;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                gradeData = JSON.parse(jsonMatch[0]);

                // 各blankにuserAnswerとcorrectAnswerを補完
                if (gradeData.evaluation?.blanks) {
                    gradeData.evaluation.blanks = gradeData.evaluation.blanks.map((blank, i) => ({
                        ...blank,
                        userAnswer: blank.userAnswer || answers?.[i]?.text || answers?.[i] || '',
                        correctAnswer: blank.correctAnswer || correctAnswers[i] || ''
                    }));
                }
            } else {
                // JSONが見つからない場合のフォールバック
                const allCorrect = answers?.every((a, i) => {
                    const userAns = (a.text || a || '').trim();
                    const correctAns = (correctAnswers[i] || '').trim();
                    return userAns === correctAns;
                });

                gradeData = {
                    evaluation: {
                        blanks: answers?.map((a, i) => ({
                            id: `B${i + 1}`,
                            result: (a.text || a || '').trim() === (correctAnswers[i] || '').trim() ? '○' : '☓',
                            userAnswer: a.text || a || '',
                            correctAnswer: correctAnswers[i] || '',
                            feedback: responseText.substring(0, 200),
                            speaker: mainCharacter
                        })) || [],
                        overall: {
                            passed: allCorrect,
                            score: allCorrect ? 100 : 50,
                            summary: responseText.substring(0, 300),
                            speaker: mainCharacter,
                            expression: 'normal'
                        }
                    }
                };
            }
        } catch (parseError) {
            console.error('❌ 採点JSONパースエラー:', parseError.message);
            gradeData = {
                evaluation: {
                    blanks: answers?.map((a, i) => ({
                        id: `B${i + 1}`,
                        result: '△',
                        userAnswer: a.text || a || '',
                        correctAnswer: correctAnswers[i] || '',
                        feedback: '採点結果の解析に失敗しました',
                        speaker: mainCharacter
                    })) || [],
                    overall: {
                        passed: false,
                        score: 0,
                        summary: `採点結果の解析に失敗しましたが、もう一度挑戦してみてください。`,
                        speaker: mainCharacter,
                        expression: 'thinking'
                    }
                }
            };
        }

        res.json({
            success: true,
            ...gradeData
        });

    } catch (error) {
        console.error('❌ Q&A穴埋め採点エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message || '採点に失敗しました'
        });
    }
});

// ★★★ Q&A進捗取得API（D1対応） ★★★
app.get('/api/qa-progress', async (req, res) => {
    try {
        const { relativePath } = req.query;
        const username = req.session?.username;

        if (!relativePath) {
            return res.status(400).json({
                success: false,
                error: 'relativePath is required'
            });
        }

        console.log('📊 Q&A進捗取得:', relativePath, '(user:', username || 'none', ')');

        // ★★★ ログインユーザーがいればD1から取得 ★★★
        if (username && process.env.D1_API_URL) {
            try {
                const d1Result = await d1Client.getQAProgress(username, relativePath);
                if (d1Result.progress && d1Result.progress.length > 0) {
                    // D1の配列形式をオブジェクト形式に変換
                    const progressObj = {};
                    d1Result.progress.forEach(item => {
                        progressObj[item.qa_id] = {
                            status: item.status,
                            fillDrill: JSON.parse(item.fill_drill || '{}')
                        };
                    });
                    console.log(`✅ D1から進捗取得: ${d1Result.progress.length}件`);
                    return res.json({
                        success: true,
                        progress: progressObj,
                        source: 'd1'
                    });
                }
            } catch (d1Error) {
                console.warn('⚠️ D1からの取得失敗、ローカルにフォールバック:', d1Error.message);
            }
        }

        // ★★★ ローカルファイルからの取得（フォールバック） ★★★
        const progressDir = path.resolve('./data/qa-progress');
        const safeFileName = relativePath.replace(/[/\\:*?"<>|]/g, '_') + '.json';
        const progressFilePath = path.join(progressDir, safeFileName);

        try {
            const data = await fs.readFile(progressFilePath, 'utf8');
            const progressData = JSON.parse(data);
            res.json({
                success: true,
                progress: progressData,
                source: 'local'
            });
        } catch (readError) {
            // ファイルが存在しない場合は空の進捗を返す
            res.json({
                success: true,
                progress: {},
                source: 'empty'
            });
        }

    } catch (error) {
        console.error('❌ Q&A進捗取得エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ★★★ 全Q&A進捗取得API（D1連携・初期同期用） ★★★
app.get('/api/qa-progress/all', async (req, res) => {
    try {
        const username = req.session?.username;

        console.log('📊 全Q&A進捗取得 (user:', username || 'none', ')');

        // ★★★ ログインユーザーがいればD1から全進捗を取得 ★★★
        if (username && process.env.D1_API_URL) {
            try {
                const d1Result = await d1Client.getQAProgress(username);
                if (d1Result.progress) {
                    console.log(`✅ D1から全進捗取得: ${d1Result.progress.length}件`);
                    return res.json({
                        success: true,
                        progress: d1Result.progress,
                        source: 'd1'
                    });
                }
            } catch (d1Error) {
                console.warn('⚠️ D1からの取得失敗、ローカルにフォールバック:', d1Error.message);
            }
        }

        // ★★★ ローカルファイルから全進捗を集約 ★★★
        const progressDir = path.resolve('./data/qa-progress');
        const allProgress = [];

        try {
            const files = await fs.readdir(progressDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));

            for (const file of jsonFiles) {
                const moduleId = file.replace('.json', '').replace(/_/g, '/');
                const filePath = path.join(progressDir, file);

                try {
                    const data = await fs.readFile(filePath, 'utf8');
                    const progressData = JSON.parse(data);

                    Object.entries(progressData).forEach(([qaId, qaData]) => {
                        allProgress.push({
                            module_id: moduleId,
                            qa_id: parseInt(qaId, 10),
                            status: qaData.status || '未',
                            fill_drill: JSON.stringify(qaData.fillDrill || {})
                        });
                    });
                } catch (readError) {
                    // ファイル読み込みエラーは無視
                }
            }

            res.json({
                success: true,
                progress: allProgress,
                source: 'local'
            });

        } catch (dirError) {
            res.json({
                success: true,
                progress: [],
                source: 'empty'
            });
        }

    } catch (error) {
        console.error('❌ 全Q&A進捗取得エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ★★★ Q&A進捗保存API（D1対応） ★★★
app.post('/api/qa-progress/save', async (req, res) => {
    try {
        const { relativePath, qaData } = req.body;
        const username = req.session?.username;

        if (!relativePath) {
            return res.status(400).json({
                success: false,
                error: 'relativePath is required'
            });
        }

        console.log('💾 Q&A進捗保存:', relativePath, '(user:', username || 'none', ')');

        // ★★★ ログインユーザーがいればD1にも保存 ★★★
        if (username && process.env.D1_API_URL && qaData) {
            try {
                // qaDataをD1形式に変換して保存
                const progressList = [];
                if (Array.isArray(qaData)) {
                    qaData.forEach(item => {
                        progressList.push({
                            moduleId: relativePath,
                            qaId: item.id || item.qaId,
                            status: item.status || '未',
                            fillDrill: item.fillDrill || {}
                        });
                    });
                } else if (typeof qaData === 'object') {
                    Object.entries(qaData).forEach(([qaId, data]) => {
                        progressList.push({
                            moduleId: relativePath,
                            qaId: parseInt(qaId, 10),
                            status: data.status || '未',
                            fillDrill: data.fillDrill || {}
                        });
                    });
                }

                if (progressList.length > 0) {
                    const d1Result = await d1Client.saveQAProgressBatch(username, progressList);
                    console.log(`✅ D1に進捗保存: ${progressList.length}件`);
                }
            } catch (d1Error) {
                console.warn('⚠️ D1への保存失敗:', d1Error.message);
                // D1への保存失敗してもローカル保存は続行
            }
        }

        // ★★★ ローカルファイルにも保存（フォールバック・バックアップ） ★★★
        const progressDir = path.resolve('./data/qa-progress');
        try {
            await fs.access(progressDir);
        } catch {
            await fs.mkdir(progressDir, { recursive: true });
        }

        const safeFileName = relativePath.replace(/[/\\:*?"<>|]/g, '_') + '.json';
        const progressFilePath = path.join(progressDir, safeFileName);

        await fs.writeFile(progressFilePath, JSON.stringify(qaData, null, 2), 'utf8');

        res.json({
            success: true,
            message: 'Q&A進捗を保存しました',
            savedTo: username ? 'd1+local' : 'local'
        });

    } catch (error) {
        console.error('❌ Q&A進捗保存エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ★★★ カレンダー学習記録取得API ★★★
app.get('/api/calendar-study-records', async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                error: 'year and month are required'
            });
        }

        // 学習記録ディレクトリ
        const recordsDir = path.resolve('./data/study-records');
        const fileName = `${year}-${String(month).padStart(2, '0')}.json`;
        const filePath = path.join(recordsDir, fileName);

        try {
            const data = await fs.readFile(filePath, 'utf8');
            const records = JSON.parse(data);
            res.json({
                success: true,
                records: records
            });
        } catch (readError) {
            // ファイルが存在しない場合は空の記録を返す
            res.json({
                success: true,
                records: []
            });
        }
    } catch (error) {
        console.error('❌ カレンダー学習記録取得エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ★★★ 学習記録追加API ★★★
app.post('/api/study-records/add', async (req, res) => {
    try {
        const { relativePath, timestamp, date, title, detail, qaId, level, moduleId } = req.body;

        if (!date || !moduleId) {
            return res.status(400).json({
                success: false,
                error: 'date and moduleId are required'
            });
        }

        // 学習記録ディレクトリを確保
        const recordsDir = path.resolve('./data/study-records');
        try {
            await fs.access(recordsDir);
        } catch {
            await fs.mkdir(recordsDir, { recursive: true });
        }

        // 年月のファイル名
        const [year, month] = date.split('-');
        const fileName = `${year}-${month}.json`;
        const filePath = path.join(recordsDir, fileName);

        // 既存の記録を読み込み
        let records = [];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            records = JSON.parse(data);
        } catch {
            // ファイルが存在しない場合は空配列
        }

        // 新しい記録を追加
        records.push({
            relativePath,
            timestamp: timestamp || new Date().toISOString(),
            date,
            title,
            detail,
            qaId,
            level,
            moduleId
        });

        // 保存
        await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf8');

        res.json({
            success: true,
            message: '学習記録を追加しました'
        });
    } catch (error) {
        console.error('❌ 学習記録追加エラー:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
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
        const username = req.session?.username;

        if (!date || !result || !result.articleNumber || typeof result.score !== 'number') {
            return res.status(400).json({
                success: false,
                error: '必要なフィールドが不足しています'
            });
        }

        console.log(`📝 クイズ結果保存: ${date} - ${result.articleNumber} (${result.score}点, user: ${username || 'none'})`);

        // ★★★ ログインユーザーがいればR2にも保存 ★★★
        if (username && process.env.D1_API_URL) {
            try {
                const r2Result = await d1Client.saveQuizResult(username, date, result);
                console.log(`✅ R2にクイズ結果保存成功`);
            } catch (r2Error) {
                console.warn('⚠️ R2への保存失敗:', r2Error.message);
                // R2への保存失敗してもローカル保存は続行
            }
        }

        // ★★★ ローカルファイルにも保存（フォールバック・バックアップ） ★★★
        const dataDir = path.dirname(QUIZ_RESULTS_FILE);
        await fs.mkdir(dataDir, { recursive: true });

        // 既存の結果を読み込み
        let existingResults = {};
        try {
            const fileContent = await fs.readFile(QUIZ_RESULTS_FILE, 'utf8');
            existingResults = JSON.parse(fileContent);
        } catch (error) {
            existingResults = {};
        }

        // 日付ごとに結果をグループ化
        if (!existingResults[date]) {
            existingResults[date] = [];
        }
        existingResults[date].push(result);

        // ファイルを保存
        await fs.writeFile(QUIZ_RESULTS_FILE, JSON.stringify(existingResults, null, 2), 'utf8');

        res.json({
            success: true,
            message: 'クイズ結果を保存しました',
            savedTo: username ? 'r2+local' : 'local'
        });

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
