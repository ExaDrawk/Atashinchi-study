import { chromium } from 'playwright';

async function testSpeedQuizDetailed() {
    console.log('🚀 スピード条文ゲームの詳細テストを開始します...\n');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // コンソールログを表示
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('🔴 ブラウザエラー:', msg.text());
        }
    });
    
    try {
        // 1. トップページを開く
        console.log('📌 ステップ1: http://localhost:3000 を開きます...');
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        console.log('✅ トップページを開きました\n');
        
        await page.screenshot({ path: 'test-results/00-top-page.png', fullPage: true });
        
        // 2. スピード条文ページに直接アクセス
        console.log('📌 ステップ2: スピード条文ページに直接アクセスします...');
        await page.goto('http://localhost:3000/#/speed-quiz?law=民法');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log('✅ スピード条文ページに移動しました');
        console.log(`   URL: ${page.url()}\n`);
        
        await page.screenshot({ path: 'test-results/01-speed-quiz-initial.png', fullPage: true });
        
        // ページの状態を確認
        console.log('📋 現在のページ要素を確認:');
        
        // #sq-start ボタンの確認
        const sqStart = page.locator('#sq-start');
        const sqStartVisible = await sqStart.isVisible().catch(() => false);
        console.log(`   #sq-start ボタン: ${sqStartVisible ? '表示あり' : '表示なし'}`);
        
        // フィルターパネルの確認
        const filterPanel = page.locator('[id*="filter"], .filter-panel');
        const filterVisible = await filterPanel.first().isVisible().catch(() => false);
        console.log(`   フィルターパネル: ${filterVisible ? '表示あり' : '表示なし'}`);
        
        // すべてのボタンを表示
        const allButtons = await page.locator('button').allTextContents();
        console.log('   ボタン一覧:', allButtons.filter(b => b.trim()).map(b => b.trim().substring(0, 30)));
        
        // 3. 「🎮 ゲームスタート」ボタンをクリック
        console.log('\n📌 ステップ3: ゲームスタートボタンをクリックします...');
        
        // 「🎮 ゲームスタート」を含むボタンを探す
        const startButtons = page.locator('button:has-text("ゲームスタート")');
        const startButtonCount = await startButtons.count();
        console.log(`   「ゲームスタート」ボタン数: ${startButtonCount}`);
        
        if (startButtonCount > 0) {
            // 最初のボタンをクリック
            const btn = startButtons.first();
            const btnText = await btn.textContent();
            console.log(`   クリック対象: "${btnText?.trim()}"`);
            
            // ボタンの位置情報
            const box = await btn.boundingBox();
            console.log(`   ボタン位置: x=${box?.x}, y=${box?.y}, width=${box?.width}, height=${box?.height}`);
            
            // クリック
            await btn.click({ force: true });
            console.log('✅ ボタンをクリックしました');
            
            // 5秒待機（ゲーム開始を待つ）
            console.log('   ゲーム開始を5秒待機...');
            await page.waitForTimeout(5000);
        }
        
        // 4. ゲーム画面の状態を確認
        console.log('\n📌 ステップ4: ゲーム画面の状態を確認します...');
        
        await page.screenshot({ path: 'test-results/02-after-start-click.png', fullPage: true });
        console.log('   スクリーンショットを保存: test-results/02-after-start-click.png');
        
        // ゲーム要素の確認
        const gameElements = {
            '#sq-article-text': 'sq-article-text（条文表示）',
            '#sq-input': 'sq-input（入力フィールド）',
            '#sq-score': 'sq-score（スコア表示）',
            '#sq-bar': 'sq-bar（タイマーバー）',
            '#sq-progress': 'sq-progress（進捗）',
        };
        
        console.log('\n📋 ゲーム要素の確認:');
        let gameStarted = false;
        
        for (const [selector, name] of Object.entries(gameElements)) {
            const elem = page.locator(selector);
            const visible = await elem.isVisible().catch(() => false);
            const text = visible ? await elem.textContent().catch(() => '') : '';
            console.log(`   ${visible ? '✅' : '❌'} ${name}: ${visible ? `表示あり "${text?.substring(0, 50)}"` : '表示なし'}`);
            if (visible && selector.includes('input')) gameStarted = true;
        }
        
        // ページ全体のHTML構造を確認（フルスクリーンコンテナ）
        const fsContainer = page.locator('.sq-fs, [class*="fullscreen"]');
        const fsVisible = await fsContainer.first().isVisible().catch(() => false);
        console.log(`\n   フルスクリーンコンテナ: ${fsVisible ? '表示あり' : '表示なし'}`);
        
        // 5. 結果サマリー
        console.log('\n' + '='.repeat(50));
        if (gameStarted) {
            console.log('🎉 ゲームが正常に開始されました！');
        } else {
            console.log('⚠️ ゲームが開始されていない可能性があります');
            console.log('   → フィルター設定画面のままの可能性');
            console.log('   → 条文データの読み込み待ちの可能性');
        }
        console.log('='.repeat(50));
        
        // 追加: さらに5秒待って再確認
        console.log('\n📌 追加確認: さらに5秒待機して再確認...');
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'test-results/03-after-10sec.png', fullPage: true });
        
        const inputVisibleLater = await page.locator('#sq-input').isVisible().catch(() => false);
        console.log(`   10秒後の#sq-input表示状態: ${inputVisibleLater ? '✅表示あり' : '❌表示なし'}`);
        
        if (inputVisibleLater) {
            const articleText = await page.locator('#sq-article-text').textContent().catch(() => '');
            console.log(`   条文テキスト: "${articleText?.substring(0, 100)}..."`);
        }
        
        // 10秒待ってから終了
        console.log('\n10秒後にブラウザを閉じます...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ エラー:', error.message);
        await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

testSpeedQuizDetailed();
