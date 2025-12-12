#!/usr/bin/env node

import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const GEMINI_PLACEHOLDER_VALUES = new Set([
  'your_actual_api_key_here',
  'your_gemini_api_key_here',
  'YOUR_GEMINI_API_KEY',
  'replace_me',
  ''
]);

const DEFAULT_MODEL = 'gemini-2.5-flash';
const SAMPLE_PROMPT = 'You are a diagnostics bot. Reply with a short confirmation that the Gemini API key works.';

const maskKey = (key = '') => {
  if (!key) return '(empty)';
  if (key.length <= 8) return '*'.repeat(key.length);
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

async function main() {
  dotenv.config({ override: true });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || GEMINI_PLACEHOLDER_VALUES.has(apiKey)) {
    console.error('❌ GEMINI_API_KEY が見つからないか、テンプレート値のままです。.env と環境変数を確認してください。');
    process.exit(1);
  }

  const modelNameFromCli = process.argv[2]?.trim();
  const model = modelNameFromCli || DEFAULT_MODEL;

  console.log('🔍 Gemini APIキー診断を開始します');
  console.log(`   • 読み込んだキー: ${maskKey(apiKey)} (len=${apiKey.length})`);
  console.log(`   • 使用モデル: ${model}`);

  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.generateContent({
      model,
      contents: SAMPLE_PROMPT
    });

    const textOutput = typeof response?.text === 'string' ? response.text : JSON.stringify(response, null, 2);
    console.log('\n✅ Gemini APIキーは有効です。応答プレビュー:');
    console.log(textOutput.slice(0, 400));
    if (textOutput.length > 400) {
      console.log('... (省略)');
    }
    process.exit(0);
  } catch (error) {
    const statusCode = error?.response?.status ?? error?.status ?? error?.code ?? 'unknown';
    const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
    const reason = error?.response?.data?.error?.status || 'NO_STATUS';

    console.error('\n❌ Gemini APIキー診断に失敗しました');
    console.error(`   • Status: ${statusCode}`);
    console.error(`   • Reason: ${reason}`);
    console.error(`   • Message: ${errorMessage}`);
    if (error?.response?.data) {
      console.error('   • Raw response:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\nヒント: Google AI Studio で新しい API キーを発行し、\n.env の GEMINI_API_KEY を更新したあとにサーバーを再起動してください。');
    process.exit(1);
  }
}

main();
