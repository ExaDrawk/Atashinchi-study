import { test, expect } from '@playwright/test';

test.describe('スピード条文ゲーム詳細テスト', () => {
  test('条文番号が正しく隠されているか確認', async ({ page }) => {
    // 刑事訴訟法のスピード条文ページへ直接アクセス
    await page.goto('/#/speed-quiz?law=刑事訴訟法');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // アニメーションを無効化
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    
    // スクリーンショット: 初期画面
    await page.screenshot({ path: 'test-results/01-speed-quiz-menu.png', fullPage: true });
    
    // ゲーム開始ボタンをクリック（forceでアニメーション無視）
    const startButton = page.locator('#sq-start');
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click({ force: true });
      await page.waitForTimeout(2000);
      
      // スクリーンショット: ゲーム画面
      await page.screenshot({ path: 'test-results/02-game-start.png', fullPage: true });
      
      // 条文表示エリアのテキストを取得
      const articleBox = page.locator('#sq-article-text');
      if (await articleBox.isVisible({ timeout: 5000 })) {
        const questionText = await articleBox.textContent();
        console.log('問題文:', questionText?.substring(0, 200));
        
        // 「第●●条」が含まれていないこと（条文番号は完全に削除される）
        expect(questionText).not.toContain('第●●条');
        
        // 「第〇〇条」形式の漢数字条文番号が含まれていないこと
        const hasKanjiArticleNumber = /第[一二三四五六七八九十百千〇零]+(?:の[一二三四五六七八九十百千〇零]+)*条/.test(questionText || '');
        console.log('漢数字条番号残存:', hasKanjiArticleNumber);
        expect(hasKanjiArticleNumber).toBe(false);
        
        // 「第123条」形式のアラビア数字条文番号が含まれていないこと
        const hasArabicArticleNumber = /第\d+(?:の\d+)?条/.test(questionText || '');
        console.log('アラビア数字条番号残存:', hasArabicArticleNumber);
        expect(hasArabicArticleNumber).toBe(false);
        
        // 条文本文が表示されていること（少なくとも何かテキストがある）
        expect(questionText?.trim().length).toBeGreaterThan(10);
      }
    }
  });

  test('文字サイズが連続的に変化するか確認', async ({ page }) => {
    await page.goto('/#/speed-quiz?law=刑法');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // アニメーションを無効化（ボタンのpulseアニメのみ）
    await page.addStyleTag({ content: '.sq-btn-start { animation: none !important; }' });
    
    const startButton = page.locator('#sq-start');
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click({ force: true });
      await page.waitForTimeout(1000);
      
      // 入力欄のfont-sizeを取得
      const input = page.locator('#sq-input');
      if (await input.isVisible({ timeout: 5000 })) {
        // 初期サイズを取得
        const initialSize = await input.evaluate(el => getComputedStyle(el).fontSize);
        console.log('初期フォントサイズ:', initialSize);
        
        // 2秒待って再取得（連続的に変化しているか）
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/03-after-2sec.png', fullPage: true });
        
        const midSize = await input.evaluate(el => getComputedStyle(el).fontSize);
        console.log('2秒後フォントサイズ:', midSize);
        
        // フォントサイズが大きくなっていることを確認
        const initialPx = parseFloat(initialSize);
        const midPx = parseFloat(midSize);
        console.log('サイズ比較:', initialPx, '->', midPx);
        expect(midPx).toBeGreaterThan(initialPx);
        
        // さらに3秒待って確認
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/04-after-5sec.png', fullPage: true });
        
        const finalSize = await input.evaluate(el => getComputedStyle(el).fontSize);
        console.log('5秒後フォントサイズ:', finalSize);
        
        const finalPx = parseFloat(finalSize);
        expect(finalPx).toBeGreaterThan(midPx);
      }
    }
  });
});
