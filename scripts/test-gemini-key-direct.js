#!/usr/bin/env node

/**
 * 最小構成の Gemini 疎通テスト
 * 1. 下の apiKey 変数に Google AI Studio で発行したキーをそのまま貼り付ける
 * 2. `node scripts/test-gemini-key-direct.js` を実行
 * 3. 成功すればキーそのものが有効であると判断できる
 */
import { GoogleGenAI } from '@google/genai';

const apiKey = 'AIzaSyAtHsZ6aAmYVc3zn-NZsOkTmxNTITL8JFs'; // ★ここを書き換えてください
const MODEL_NAME = process.argv[2] || 'gemini-2.5-flash';

if (!apiKey || apiKey.includes('PASTE_YOUR_GEMINI_API_KEY_HERE')) {
  console.error('❌ apiKey が設定されていません。ファイル内の apiKey 変数を書き換えてください。');
  process.exit(1);
}

async function main() {
  console.log('🔍 直書きテスト開始');
  console.log(`   • 使用モデル: ${MODEL_NAME}`);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: 'ping'
  });

  console.log('\n✅ 成功。Gemini 応答プレビュー:');
  console.log(response.text ?? JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error('\n❌ 直書きテストでエラーが発生しました');
  console.error('   •', error?.message || error);
  if (error?.response?.data) {
    console.error('   • Raw:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
});
