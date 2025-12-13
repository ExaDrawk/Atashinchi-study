// xAI コレクション内容をGrokに要約させるスクリプト（改良版）
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MANAGEMENT_API_KEY = process.env.XAI_MANAGEMENT_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;
const MANAGEMENT_API_BASE = 'https://management-api.x.ai/v1';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

async function getCollectionDocuments(collectionId) {
    const docsRes = await fetch(`${MANAGEMENT_API_BASE}/collections/${collectionId}/documents?limit=100`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${MANAGEMENT_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!docsRes.ok) return [];

    const docsData = await docsRes.json();
    const docs = docsData.documents || docsData.data || [];

    return docs.map(doc => {
        const meta = doc.file_metadata || doc;
        return meta.filename || meta.name || meta.file_id || 'unknown';
    });
}

async function summarizeWithGrok(collectionName, description, documentNames) {
    const docList = documentNames.slice(0, 30).join('\n- ');

    const prompt = `以下のxAIコレクションの内容を100文字程度で簡潔に要約してください。

【コレクション名】${collectionName}
【説明】${description || '(未設定)'}
【ドキュメント数】${documentNames.length}件
【ドキュメント例】
- ${docList}

このコレクションには何が含まれていますか？簡潔に1〜2文で答えてください。`;

    const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'grok-3-mini',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 300
        })
    });

    if (!response.ok) {
        return `(要約取得失敗: ${response.status})`;
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function main() {
    let output = [];

    output.push(`\n${'═'.repeat(70)}`);
    output.push(`📦 xAI コレクション内容の要約`);
    output.push(`${'═'.repeat(70)}\n`);

    // 全コレクション一覧を取得
    const res = await fetch(`${MANAGEMENT_API_BASE}/collections`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${MANAGEMENT_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        console.log(`❌ コレクション取得失敗: ${res.status}`);
        return;
    }

    const data = await res.json();
    const collections = data.collections || [];

    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        const colId = col.collection_id;
        const colName = col.collection_name || '(名前なし)';
        const colDesc = col.collection_description || '';
        const docCount = col.documents_count || 0;

        output.push(`\n【${i + 1}】${colName}`);
        output.push(`${'─'.repeat(50)}`);
        output.push(`ID: ${colId}`);
        output.push(`説明: ${colDesc || '(未設定)'}`);
        output.push(`ドキュメント数: ${docCount}件`);

        // ドキュメント一覧取得
        const docNames = await getCollectionDocuments(colId);

        if (docNames.length > 0) {
            output.push(`\nドキュメント例:`);
            docNames.slice(0, 8).forEach((name, j) => {
                output.push(`  ${j + 1}. ${name}`);
            });
            if (docNames.length > 8) {
                output.push(`  ... 他 ${docNames.length - 8}件`);
            }
        }

        // Grokに要約させる
        output.push(`\n🤖 Grok要約:`);
        const summary = await summarizeWithGrok(colName, colDesc, docNames);
        output.push(summary);
        output.push('');
    }

    output.push(`\n${'═'.repeat(70)}`);
    output.push(`✅ 完了`);
    output.push(`${'═'.repeat(70)}\n`);

    // 結果を出力
    const result = output.join('\n');
    console.log(result);

    // ファイルにも保存
    fs.writeFileSync('collection-summary.txt', result, 'utf8');
    console.log('\n📄 結果を collection-summary.txt に保存しました');
}

main().catch(console.error);
