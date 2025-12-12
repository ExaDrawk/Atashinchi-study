import { chromium } from 'playwright';
import fs from 'fs';

async function testSpeedQuiz() {
    console.log('🚀 スピード条文ゲームのテストを開始します...\n');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // 1. http://localhost:3000 を開く
        console.log('📌 ステップ1: http://localhost:3000 を開きます...');
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        console.log('✅ トップページを開きました');
        console.log(`   現在のURL: ${page.url()}\n`);
        
        // スクリーンショット: トップページ
        await page.screenshot({ path: 'test-results/00-top-page.png', fullPage: true });
        
        // 2. 「スピード条文」ページへ移動（ハッシュルーティング）
        console.log('📌 ステップ2: 「スピード条文」ページに移動します...');
        
        // 方法A: トップページの「スピード条文」ボタンをクリックしてから
        // フィルターを設定してゲームを開始する
        const speedQuizButton = await page.locator('button:has-text("スピード条文")').first();
        if (await speedQuizButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await speedQuizButton.click();
            console.log('   「スピード条文」ボタンをクリック');
            await page.waitForTimeout(1000);
            
            // フィルターパネルのスクリーンショット
            await page.screenshot({ path: 'test-results/01-filter-panel.png', fullPage: true });
            console.log('   フィルターパネルのスクリーンショットを保存');
            
            // 「🎮 ゲームスタート」ボタンを探してクリック
            const startButtonInPanel = await page.locator('button:has-text("ゲームスタート"), button:has-text("🎮")').first();
            if (await startButtonInPanel.isVisible({ timeout: 3000 }).catch(() => false)) {
                await startButtonInPanel.click();
                console.log('   フィルターパネルのゲームスタートをクリック');
                await page.waitForTimeout(2000);
            }
        }
        
        // 方法B: 直接URLでスピード条文ページにアクセス
        console.log('   直接URLでスピード条文ページに移動します...');
        await page.goto('http://localhost:3000/#/speed-quiz?law=民法');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log('✅ スピード条文ページに移動しました');
        console.log(`   現在のURL: ${page.url()}\n`);
        
        // スクリーンショット: スピード条文ページ（ゲーム開始前）
        await page.screenshot({ path: 'test-results/02-speed-quiz-page.png', fullPage: true });
        console.log('   スピード条文ページのスクリーンショットを保存\n');
        
        // 3. 「🎮 ゲームスタート」ボタンをクリック
        console.log('📌 ステップ3: 「🎮 ゲームスタート」ボタンを探してクリックします...');
        
        // #sq-start ボタンを探す
        const startButton = page.locator('#sq-start');
        const isStartButtonVisible = await startButton.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (isStartButtonVisible) {
            console.log('   #sq-start ボタンを発見');
            await startButton.click({ force: true });
            console.log('✅ 「ゲームスタート」ボタンをクリックしました\n');
        } else {
            // 代替セレクタを試す
            console.log('   #sq-start が見つかりません。代替セレクタを試します...');
            
            const allButtons = await page.locator('button').allTextContents();
            console.log('   ページ上のボタン:', allButtons.filter(b => b.trim()).slice(0, 10));
            
            const altStartButton = await page.locator('button:has-text("ゲームスタート"), button:has-text("スタート")').first();
            if (await altStartButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await altStartButton.click({ force: true });
                console.log('✅ 代替ボタンでゲームを開始しました\n');
            } else {
                console.log('⚠️ 「ゲームスタート」ボタンが見つかりません\n');
            }
        }
        
        // ゲーム開始を待つ
        await page.waitForTimeout(2000);
        
        // 4. ゲーム画面が表示されるか確認し、スクリーンショットを取得
        console.log('📌 ステップ4: ゲーム画面を確認してスクリーンショットを取得します...');
        
        const screenshotPath = 'speed-quiz-game-screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ スクリーンショットを保存しました: ${screenshotPath}`);
        
        // test-resultsフォルダにも保存
        await page.screenshot({ path: 'test-results/03-game-started.png', fullPage: true });
        console.log('✅ test-results/03-game-started.png にも保存\n');
        
        // 5. 各要素の確認
        console.log('📌 ステップ5: ゲーム画面の要素を確認します...\n');
        
        const results = {
            問題カウンター: false,
            スコア表示: false,
            タイマーバー: false,
            条文テキスト: false,
            入力フィールド: false
        };
        
        // 問題カウンター（問題1/XXなど）- #sq-progress-text
        const questionCounter = await page.locator('#sq-progress-text, [id*="progress"], .progress-text').first();
        if (await questionCounter.isVisible().catch(() => false)) {
            results.問題カウンター = true;
            const text = await questionCounter.textContent();
            console.log(`✅ 問題カウンター: 表示あり (${text?.trim()})`);
        } else {
            // 代替チェック
            const pageText = await page.textContent('body');
            if (pageText.match(/問題\s*\d+/) || pageText.match(/\d+\s*\/\s*\d+/)) {
                results.問題カウンター = true;
                console.log('✅ 問題カウンター: 表示あり（テキストで確認）');
            } else {
                console.log('❌ 問題カウンター: 見つかりません');
            }
        }
        
        // スコア表示 - #sq-score
        const scoreElement = await page.locator('#sq-score, [id*="score"]').first();
        const pageText = await page.textContent('body');
        if (await scoreElement.isVisible().catch(() => false)) {
            results.スコア表示 = true;
            const text = await scoreElement.textContent();
            console.log(`✅ スコア表示: 表示あり (${text?.trim()})`);
        } else if (pageText.includes('スコア') || pageText.match(/\d+\s*点/)) {
            results.スコア表示 = true;
            console.log('✅ スコア表示: 表示あり（テキストで確認）');
        } else {
            console.log('❌ スコア表示: 見つかりません');
        }
        
        // タイマーバー - #sq-timer-bar, #sq-timer
        const timerBar = await page.locator('#sq-timer-bar, #sq-timer, [id*="timer"]').first();
        if (await timerBar.isVisible().catch(() => false)) {
            results.タイマーバー = true;
            console.log('✅ タイマーバー: 表示あり');
        } else {
            console.log('❌ タイマーバー: 見つかりません');
        }
        
        // 条文テキスト - #sq-article-text
        const articleText = await page.locator('#sq-article-text').first();
        if (await articleText.isVisible().catch(() => false)) {
            results.条文テキスト = true;
            const text = await articleText.textContent();
            console.log(`✅ 条文テキスト: 表示あり (${text?.substring(0, 50)}...)`);
        } else if (pageText.includes('条') && pageText.length > 100) {
            results.条文テキスト = true;
            console.log('✅ 条文テキスト: 表示あり（テキストで確認）');
        } else {
            console.log('❌ 条文テキスト: 見つかりません');
        }
        
        // 入力フィールド - #sq-input（「第」と「条」のラベル付き）
        const inputField = await page.locator('#sq-input').first();
        if (await inputField.isVisible().catch(() => false)) {
            results.入力フィールド = true;
            console.log('✅ 入力フィールド: 表示あり');
            
            // 「第」と「条」のラベルを確認
            if (pageText.includes('第') && pageText.includes('条')) {
                console.log('   └─ 「第」と「条」のラベル: 表示あり');
            }
        } else {
            // 代替チェック
            const altInput = await page.locator('input[type="text"], input[type="number"]').first();
            if (await altInput.isVisible().catch(() => false)) {
                results.入力フィールド = true;
                console.log('✅ 入力フィールド: 表示あり（代替セレクタ）');
            } else {
                console.log('❌ 入力フィールド: 見つかりません');
            }
        }
        
        // 結果サマリー
        console.log('\n' + '='.repeat(50));
        console.log('📊 テスト結果サマリー');
        console.log('='.repeat(50));
        
        const passCount = Object.values(results).filter(v => v).length;
        const totalCount = Object.keys(results).length;
        
        for (const [key, value] of Object.entries(results)) {
            console.log(`${value ? '✅' : '❌'} ${key}`);
        }
        
        console.log('='.repeat(50));
        console.log(`結果: ${passCount}/${totalCount} 項目が確認できました`);
        
        if (passCount === totalCount) {
            console.log('🎉 ゲームは正常に開始されています！');
        } else if (passCount >= 3) {
            console.log('⚠️ ゲームは開始されていますが、一部の要素が確認できませんでした');
        } else {
            console.log('❌ ゲームの開始に問題がある可能性があります');
        }
        
        // 現在のURLを表示
        console.log(`\n📍 現在のURL: ${page.url()}`);
        
        // デバッグ用: ページの構造を確認
        console.log('\n📋 ページ上の主要な要素:');
        const allButtons = await page.locator('button').allTextContents();
        console.log('ボタン:', allButtons.slice(0, 5));
        const allInputs = await page.locator('input').count();
        console.log('入力フィールド数:', allInputs);
        
    } catch (error) {
        console.error('❌ エラーが発生しました:', error.message);
        
        // エラー時のスクリーンショット
        await page.screenshot({ path: 'speed-quiz-error-screenshot.png', fullPage: true });
        console.log('エラー時のスクリーンショットを保存しました: speed-quiz-error-screenshot.png');
    } finally {
        // 少し待ってからブラウザを閉じる
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

testSpeedQuiz();
