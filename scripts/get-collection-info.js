// xAI コレクション情報取得スクリプト（デバッグ版）
import dotenv from 'dotenv';
dotenv.config();

const MANAGEMENT_API_KEY = process.env.XAI_MANAGEMENT_API_KEY;
const COLLECTION_IDS = process.env.XAI_COLLECTION_ID?.split(',').map(id => id.trim()).filter(id => id) || [];

// 正しいManagement API Base URL
const MANAGEMENT_API_BASE = 'https://management-api.x.ai/v1';

async function main() {
    console.log(`\n🔍 xAI コレクション情報取得\n`);
    console.log(`設定コレクションID: ${COLLECTION_IDS.join(', ')}`);

    if (!MANAGEMENT_API_KEY) {
        console.log('⚠️ XAI_MANAGEMENT_API_KEY が設定されていません');
        return;
    }

    // 全コレクション一覧を取得
    console.log(`\n━━━━ 全コレクション一覧 ━━━━\n`);

    const res = await fetch(`${MANAGEMENT_API_BASE}/collections`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${MANAGEMENT_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        console.log(`❌ 取得失敗: ${res.status}`);
        console.log(await res.text());
        return;
    }

    const data = await res.json();

    // 生のレスポンスを出力
    console.log('📦 APIレスポンス:');
    console.log(JSON.stringify(data, null, 2));

    // dataがオブジェクトの配列の場合
    const collections = Array.isArray(data) ? data : (data.data || data.collections || []);

    console.log(`\n\n━━━━ コレクション詳細 ━━━━\n`);

    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        console.log(`\n【コレクション ${i + 1}】`);
        console.log(`  全フィールド:`, Object.keys(col));

        // IDを探す（id, collection_id, _id などの可能性）
        const colId = col.id || col.collection_id || col._id;
        console.log(`  ID: ${colId}`);
        console.log(`  名前: ${col.name || col.title || '(未設定)'}`);
        console.log(`  説明: ${col.description || '(未設定)'}`);
        console.log(`  作成日: ${col.created_at || col.createdAt || '(不明)'}`);

        // ドキュメント取得を試みる
        if (colId) {
            console.log(`\n  📁 ドキュメント一覧取得中...`);
            const docsRes = await fetch(`${MANAGEMENT_API_BASE}/collections/${colId}/documents?limit=20`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${MANAGEMENT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (docsRes.ok) {
                const docsData = await docsRes.json();
                const docs = Array.isArray(docsData) ? docsData : (docsData.data || docsData.documents || []);

                console.log(`  📁 ドキュメント数: ${docs.length}件`);
                docs.slice(0, 5).forEach((doc, j) => {
                    console.log(`     ${j + 1}. ${doc.name || doc.filename || doc.id || JSON.stringify(doc).substring(0, 50)}`);
                });
            } else {
                console.log(`  ⚠️ ドキュメント取得失敗: ${docsRes.status}`);
            }
        }
    }

    console.log(`\n✅ 完了\n`);
}

main().catch(console.error);
