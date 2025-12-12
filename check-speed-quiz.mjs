import { chromium } from 'playwright';

async function checkSpeedQuizPanel() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. http://localhost:3000 を開きます...');
  try {
    await page.goto('http://localhost:3000', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
  } catch (e) {
    console.log('ページ読み込みエラー:', e.message);
  }
  
  console.log('2. 「スピード条文」のリンクまたはボタンをクリックします...');
  // スピード条文のリンクを探してクリック（表示モードボタンを使用）
  await page.waitForTimeout(2000);
  
  // スピード条文の表示モードボタンを探す
  const speedQuizButton = await page.locator('button:has-text("スピード条文")').first();
  if (await speedQuizButton.isVisible().catch(() => false)) {
    console.log('スピード条文ボタンを発見、クリックします...');
    await speedQuizButton.click();
    await page.waitForTimeout(2000);
  } else {
    // 直接URLで遷移を試みる
    console.log('ボタンが見つからないため、直接/speedにアクセスします...');
    await page.goto('http://localhost:3000/speed', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  }
  
  console.log('3. スクリーンショットを取得します...');
  await page.screenshot({ path: 'speed-quiz-screenshot.png', fullPage: true });
  console.log('スクリーンショットを speed-quiz-screenshot.png に保存しました');
  
  console.log('\n4. 絞り込みパネルの要素を確認します...');
  
  // 各要素の存在確認
  const results = {};
  
  // 「🎯 条文絞り込み」タイトル
  const filterTitle = await page.locator('text=🎯 条文絞り込み').first();
  results['🎯 条文絞り込みタイトル'] = await filterTitle.isVisible().catch(() => false);
  
  // 「🚀 苦手度で探す」セクション
  const weaknessSection = await page.locator('text=🚀 苦手度で探す').first();
  results['🚀 苦手度で探すセクション'] = await weaknessSection.isVisible().catch(() => false);
  
  // ランクボタン（3つ）を確認
  const rankButtons = await page.locator('.rank-btn, [class*="rank"], button:has-text("ランク")');
  const rankButtonCount = await rankButtons.count();
  results['ランクボタン数'] = rankButtonCount;
  
  // 「🚀 法律名で絞る」セクション
  const lawSection = await page.locator('text=🚀 法律名で絞る').first();
  results['🚀 法律名で絞るセクション'] = await lawSection.isVisible().catch(() => false);
  
  // 法律チェックボックス
  const lawCheckboxes = await page.locator('input[type="checkbox"]');
  const checkboxCount = await lawCheckboxes.count();
  results['法律チェックボックス数'] = checkboxCount;
  
  // 「🚀 出題数」セレクトボックス
  const questionCount = await page.locator('text=🚀 出題数').first();
  results['🚀 出題数セクション'] = await questionCount.isVisible().catch(() => false);
  
  const selectBox = await page.locator('select');
  const selectCount = await selectBox.count();
  results['セレクトボックス数'] = selectCount;
  
  // 「🎮 ゲームスタート」ボタン
  const startButton = await page.locator('text=🎮 ゲームスタート').first();
  results['🎮 ゲームスタートボタン'] = await startButton.isVisible().catch(() => false);
  
  console.log('\n===== 確認結果 =====');
  for (const [key, value] of Object.entries(results)) {
    const status = value === true ? '✅' : (typeof value === 'number' ? `📊 ${value}個` : '❌');
    console.log(`${key}: ${status}`);
  }
  
  // ページのHTMLを確認（デバッグ用）
  console.log('\n===== ページ内の主要テキスト =====');
  const bodyText = await page.locator('body').innerText();
  const lines = bodyText.split('\n').filter(line => line.trim()).slice(0, 50);
  for (const line of lines) {
    console.log(line.substring(0, 100));
  }
  
  // 10秒待ってからブラウザを閉じる
  console.log('\n10秒後にブラウザを閉じます...');
  await page.waitForTimeout(10000);
  await browser.close();
}

checkSpeedQuizPanel().catch(console.error);
