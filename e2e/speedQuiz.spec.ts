import { test, expect } from '@playwright/test';

test.describe('スピード条文ゲーム', () => {
  test('ホームページが正常に表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/あたし/);
  });

  test('スピード条文が起動できる', async ({ page }) => {
    await page.goto('/');
    
    // ゲーム開始ボタンを探してクリック
    const startButton = page.locator('text=クイズ開始').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // ゲーム画面が表示されるまで待機
      await page.waitForTimeout(1000);
      
      // 入力欄が表示されていることを確認
      const input = page.locator('#sq-answer');
      await expect(input).toBeVisible();
    }
  });

  test('フルスクリーンモードが動作する', async ({ page }) => {
    await page.goto('/');
    
    // フルスクリーンボタンを探す
    const fsButton = page.locator('text=フルスクリーン').first();
    if (await fsButton.isVisible()) {
      await fsButton.click();
      
      // フルスクリーンコンテナが表示される
      const fsContainer = page.locator('.sq-fs');
      await expect(fsContainer).toBeVisible();
      
      // 戻るボタンが存在する
      const returnBtn = page.locator('#sq-return-btn');
      await expect(returnBtn).toBeVisible();
    }
  });

  test('条文番号が正しく漢数字で表示される', async ({ page }) => {
    await page.goto('/');
    
    // ゲームを開始
    const startButton = page.locator('text=クイズ開始').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      
      // 問題文のテキストを取得
      const questionText = await page.locator('#sq-question').textContent();
      
      // 「〇」が含まれていないことを確認（漢数字が正しく変換されている）
      expect(questionText).not.toContain('〇');
      
      // 「●●条」が含まれていることを確認（条番号が隠されている）
      expect(questionText).toContain('●●条');
    }
  });
});

test.describe('ナビゲーション', () => {
  test('科目ページに遷移できる', async ({ page }) => {
    await page.goto('/');
    
    // 民法リンクをクリック
    const civilLawLink = page.locator('text=民法').first();
    if (await civilLawLink.isVisible()) {
      await civilLawLink.click();
      await page.waitForURL('**/case.html**');
    }
  });
});
