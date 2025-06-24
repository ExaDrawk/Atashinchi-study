// server.js - Render.com対応版

import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import fs from 'fs/promises';
import fssync from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import { 
    getFormattedArticle, 
    parseAndGetArticle, 
    getLawFullText,
    loadExistingXMLFiles,
    updateAllSupportedLaws
} from './lawLoader.js';

dotenv.config();

// ★★★ 対応法令一覧（lawLoader.jsと同期） ★★★
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

const app = express();
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
    const publicPaths = ['/login.html', '/api/auth/login', '/api/auth/logout', '/api/health', '/api/ping'];
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

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

// 認証ミドルウェア適用
app.use(requireAuth);

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
        
        // build-case-index.jsのロジックを直接実行
        const casesRootDirectory = path.join(process.cwd(), 'public', 'cases');
        const outputFilePath = path.join(casesRootDirectory, 'index.js');
        
        // ケースファイルを探索
        function findJsFiles(dir) {
            let results = [];
            const list = fssync.readdirSync(dir);
            list.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fssync.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(findJsFiles(filePath));
                } else if (file.endsWith('.js') && file !== 'index.js') {
                    results.push(filePath);
                }
            });
            return results;
        }
        
        const allCaseFiles = findJsFiles(casesRootDirectory);
        console.log(`🔍 発見されたケースファイル: ${allCaseFiles.length}件`);
        
        // 各ケースファイルからメタデータを読み込み
        const summaries = await Promise.all(allCaseFiles.map(async filePath => {
            try {
                // 動的インポートでキャッシュをバイパス
                const fileUrl = `file://${filePath}?timestamp=${Date.now()}`;
                const caseModule = await import(fileUrl);
                const caseData = caseModule.default;
                const id = path.basename(filePath, '.js');
                const category = path.basename(path.dirname(filePath));
                
                return { 
                    id, 
                    category, 
                    title: caseData.title, 
                    citation: caseData.citation, 
                    tags: caseData.tags 
                };
            } catch (error) {
                console.error(`⚠️ ケースファイル読み込みエラー ${filePath}:`, error.message);
                return null;
            }
        }));
        
        // エラーのあるファイルを除外
        const validSummaries = summaries.filter(summary => summary !== null);
        
        // ローダー定義を生成
        const loaders = validSummaries.map(summary => {
            const relativePath = path.relative(casesRootDirectory, path.join(casesRootDirectory, summary.category, `${summary.id}.js`)).replace(/\\/g, '/');
            return `'${summary.id}': () => import('./${relativePath}')`;
        }).join(',\n    ');

        // ファイル内容を生成
        const fileContent = `// このファイルは build-case-index.js によって自動生成されました。
// 手動で編集しないでください。
export const caseSummaries = ${JSON.stringify(validSummaries, null, 4)};
export const caseLoaders = {
    ${loaders}
};
`;

        // ファイルに書き込み
        await fs.writeFile(outputFilePath, fileContent, 'utf8');
        
        console.log(`✅ 目次ファイル再生成完了: ${outputFilePath}`);
        console.log(`📊 処理されたケース: ${validSummaries.length}件`);
        
        res.json({
            success: true,
            message: '目次ファイルの再生成が完了しました',
            casesCount: validSummaries.length,
            categories: [...new Set(validSummaries.map(s => s.category))],
            outputFile: outputFilePath
        });
        
    } catch (error) {
        console.error('❌ 目次ファイル再生成エラー:', error);
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
        
        const { prompt, history, learningContext } = req.body;

        if (!prompt || typeof prompt !== 'string') {
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

        // ★★★ 法令全文をプロンプトに追加（lawLoader.js委任） ★★★
        let finalPrompt = prompt;
        const mentionedLaws = SUPPORTED_LAWS.filter(law => prompt.includes(law));
        
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
                finalPrompt = `以下の法令条文を参考に、ユーザーのプロンプトに回答してください。${lawContext}\n\n---\n\n# ユーザーのプロンプト\n${prompt}`;
            }
        }
        
        const chat = model.startChat({ history: validatedHistory });
        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const responseText = response.text();

        console.log('✅ Gemini API成功', { responseLength: responseText.length });
        res.json({ text: responseText });
    } catch (error) {
        console.error('❌ Gemini APIエラー:', error.message);
        res.status(500).json({ 
            text: '申し訳ございません。現在、AIサーバーが高負荷のため、一時的にサービスを利用できません。',
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
        console.log(`🔧 使用中のAIモデル: models/gemini-2.5-flash`);
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
