/**
 * xAI Collection テストスクリプト
 * OpenAI互換SDKを使用
 */
import 'dotenv/config';
import OpenAI from 'openai';

const COLLECTION_ID = 'collection_be9619b0-dbae-4887-a96e-c691f6e5c5db';

// xAI クライアント（OpenAI互換）
const xai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.x.ai/v1',
});

// ファイル一覧取得
async function listFiles() {
    console.log('=== アップロード済みファイル一覧 ===');
    const files = await xai.files.list();
    console.log('ファイル数:', files.data.length);
    return files.data;
}

// コレクションにファイルを紐づけ
async function attachToCollection(fileId, filename) {
    const url = `https://api.x.ai/v1/collections/${COLLECTION_ID}/documents/${fileId}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.ok) {
        console.log('✅', filename);
        return true;
    } else {
        const text = await res.text();
        if (text.includes('already') || text.includes('exists')) {
            console.log('⏭️ 既存:', filename);
            return true;
        }
        console.log('❌', res.status, filename, text.substring(0, 80));
        return false;
    }
}

// Collections検索ツールを使った回答生成
async function queryWithCollection(question) {
    console.log('\n=== コレクション検索テスト ===');
    console.log('質問:', question);

    const response = await xai.chat.completions.create({
        model: 'grok-3',
        messages: [
            { role: 'user', content: question }
        ],
        tools: [
            {
                type: 'function',
                function: {
                    name: 'collection_search',
                    description: 'コレクション内のドキュメントを検索',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: { type: 'string', description: '検索クエリ' },
                            collection_id: { type: 'string', description: 'コレクションID' }
                        },
                        required: ['query', 'collection_id']
                    }
                }
            }
        ],
        tool_choice: 'auto'
    });

    console.log('使用ソース数:', response.usage?.num_sources_used || 0);
    console.log('回答:', response.choices[0].message.content?.substring(0, 500));
    return response;
}

// メイン
async function main() {
    try {
        // 1. ファイル一覧
        const files = await listFiles();

        // 2. コレクションに紐づけ
        console.log('\n=== コレクションに紐づけ ===');
        let success = 0, failed = 0;
        for (const file of files.slice(0, 5)) { // 最初の5件だけテスト
            const ok = await attachToCollection(file.id, file.filename);
            ok ? success++ : failed++;
        }
        console.log(`結果: 成功 ${success} / 失敗 ${failed}`);

        // 3. 検索テスト
        await queryWithCollection('民法177条について教えて');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', await error.response.text());
        }
    }
}

main();
