#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config({ override: true });

const GEMINI_PLACEHOLDER_VALUES = new Set([
  'your_actual_api_key_here',
  'your_gemini_api_key_here',
  'YOUR_GEMINI_API_KEY',
  'replace_me',
  ''
]);

const DEFAULT_MODEL = 'gemini-2.5-flash';
const maskKey = (key = '') => {
  if (!key) return '(empty)';
  if (key.length <= 8) return '*'.repeat(key.length);
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

const buildPayload = (prompt) => ({
  contents: [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ]
});

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || GEMINI_PLACEHOLDER_VALUES.has(apiKey)) {
    console.error('❌ GEMINI_API_KEY が未設定かテンプレート値のままです。.env を確認してください。');
    process.exit(1);
  }

  const model = (process.argv[2] || DEFAULT_MODEL).trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  console.log('🌐 REST API 版 Gemini キー診断を開始します');
  console.log(`   • 読み込んだキー: ${maskKey(apiKey)} (len=${apiKey.length})`);
  console.log(`   • 使用モデル: ${model}`);
  console.log(`   • エンドポイント: ${endpoint.split('?')[0]}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload('診断用の疎通テストです。2行以内で返答してください。'))
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('\n❌ REST API 呼び出しに失敗しました');
      console.error(`   • HTTP Status: ${response.status}`);
      if (data?.error) {
        console.error(`   • API Error: ${data.error.message}`);
        console.error(`   • Reason: ${data.error.status || 'UNKNOWN'}`);
        console.error('   • Raw:', JSON.stringify(data.error, null, 2));
      } else {
        console.error('   • 応答本文:', JSON.stringify(data, null, 2));
      }
      process.exit(1);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('\n✅ REST API でのキー検証に成功しました');
    if (text) {
      console.log('--- 応答プレビュー ---');
      console.log(text);
    } else {
      console.log('応答本文:', JSON.stringify(data, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('\n❌ リクエスト実行中にエラーが発生しました');
    console.error('   •', error.message || error);
    process.exit(1);
  }
}

main();
