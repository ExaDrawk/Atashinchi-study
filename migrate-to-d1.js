// migrate-to-d1.js - ローカルの学習データをCloudflare D1にアップロード
// 使い方: node migrate-to-d1.js <ユーザー名>

import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const D1_API_URL = process.env.D1_API_URL || 'https://study-app-api.drillstudy-api.workers.dev';

async function callD1API(endpoint, method = 'GET', body = null) {
    const url = `${D1_API_URL}${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `API Error: ${response.status}`);
    return data;
}

async function migrateQAProgress(username) {
    console.log('📂 Q&A進捗データを移行中...');

    const progressDir = path.resolve('./data/qa-progress');

    try {
        const files = await fs.readdir(progressDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`📝 発見: ${jsonFiles.length}個の進捗ファイル`);

        let totalItems = 0;
        let successCount = 0;
        let errorCount = 0;

        for (const file of jsonFiles) {
            const filePath = path.join(progressDir, file);
            const moduleId = file.replace('.json', '').replace(/_/g, '/');

            try {
                const data = await fs.readFile(filePath, 'utf8');
                const progressData = JSON.parse(data);

                // オブジェクト形式 {qaId: {status, fillDrill}} を配列に変換
                const items = Object.entries(progressData);

                for (const [qaId, qaData] of items) {
                    try {
                        await callD1API('/api/qa-progress', 'POST', {
                            username,
                            moduleId,
                            qaId: parseInt(qaId, 10),
                            status: qaData.status || '未',
                            fillDrill: qaData.fillDrill || {}
                        });
                        successCount++;
                        totalItems++;
                    } catch (err) {
                        console.error(`  ❌ ${moduleId} Q&A#${qaId}: ${err.message}`);
                        errorCount++;
                    }
                }

                console.log(`  ✅ ${file}: ${items.length}件`);
            } catch (readError) {
                console.error(`  ❌ ${file}: 読み込みエラー`);
            }
        }

        console.log(`\n📊 Q&A進捗移行完了: 成功=${successCount}, エラー=${errorCount}`);
        return { success: successCount, error: errorCount };

    } catch (err) {
        console.log('📂 Q&A進捗ディレクトリが存在しません');
        return { success: 0, error: 0 };
    }
}

async function migrateStudyRecords(username) {
    console.log('\n📂 学習記録を移行中...');

    const recordsDir = path.resolve('./data/study-records');

    try {
        const files = await fs.readdir(recordsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`📝 発見: ${jsonFiles.length}個の学習記録ファイル`);

        let successCount = 0;
        let errorCount = 0;

        for (const file of jsonFiles) {
            const filePath = path.join(recordsDir, file);

            try {
                const data = await fs.readFile(filePath, 'utf8');
                const records = JSON.parse(data);

                for (const record of records) {
                    try {
                        await callD1API('/api/study-records', 'POST', {
                            username,
                            date: record.date,
                            title: record.title,
                            detail: record.detail,
                            moduleId: record.moduleId,
                            qaId: record.qaId,
                            level: record.level
                        });
                        successCount++;
                    } catch (err) {
                        console.error(`  ❌ ${file} record: ${err.message}`);
                        errorCount++;
                    }
                }

                console.log(`  ✅ ${file}: ${records.length}件`);
            } catch (readError) {
                console.error(`  ❌ ${file}: 読み込みエラー`);
            }
        }

        console.log(`\n📊 学習記録移行完了: 成功=${successCount}, エラー=${errorCount}`);
        return { success: successCount, error: errorCount };

    } catch (err) {
        console.log('📂 学習記録ディレクトリが存在しません');
        return { success: 0, error: 0 };
    }
}

async function main() {
    const username = process.argv[2];

    if (!username) {
        console.log('使い方: node migrate-to-d1.js <ユーザー名>');
        console.log('例: node migrate-to-d1.js myuser');
        process.exit(1);
    }

    console.log('🚀 ローカルデータをCloudflare D1に移行');
    console.log(`👤 ユーザー名: ${username}`);
    console.log(`🌐 D1 API: ${D1_API_URL}`);
    console.log('');

    // D1接続確認
    try {
        const health = await callD1API('/api/health');
        console.log('✅ D1接続OK:', health.timestamp);
    } catch (err) {
        console.error('❌ D1接続失敗:', err.message);
        process.exit(1);
    }

    console.log('\n========================================');

    // Q&A進捗を移行
    const qaResult = await migrateQAProgress(username);

    // 学習記録を移行
    const recordsResult = await migrateStudyRecords(username);

    console.log('\n========================================');
    console.log('🎉 移行完了！');
    console.log(`   Q&A進捗: ${qaResult.success}件`);
    console.log(`   学習記録: ${recordsResult.success}件`);
    console.log('\n同じユーザー名でログインすれば、どこからでもこのデータにアクセスできます！');
}

main().catch(console.error);
