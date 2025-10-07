// lawArticleListApi.js
// 簡易API: 法律ごとの条文リストをJSONファイルで管理

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const DATA_DIR = path.join(__dirname, 'laws-article-list');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// 取得API: /api/law-articles/:lawName
router.get('/api/law-articles/:lawName', (req, res) => {
    const lawName = req.params.lawName;
    const filePath = path.join(DATA_DIR, `${lawName}.json`);
    if (!fs.existsSync(filePath)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
});

// 追加API: /api/law-articles/:lawName (POST)
router.post('/api/law-articles/:lawName', express.json(), (req, res) => {
    const lawName = req.params.lawName;
    const filePath = path.join(DATA_DIR, `${lawName}.json`);
    let list = [];
    if (fs.existsSync(filePath)) {
        list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    // 条文データを追加（重複は無視）
    const newArticle = req.body;
    const exists = list.some(a => a.articleNumber === newArticle.articleNumber && a.paragraph === newArticle.paragraph);
    if (!exists) {
        list.push(newArticle);
        fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    }
    res.json({ success: true, list });
});

export default router;
