// cloudSystem.js - 雲画像をランダムに割り当てるシステム

class CloudSystem {
    constructor() {
        // 実際のimagesフォルダにある雲画像を使用
        this.cloudImages = [
            '/images/cloud_1.png',
            '/images/cloud_2.png',
            '/images/cloud_3.png',
            '/images/cloud_1.png', // cloud_4.pngがないので1を再利用
            '/images/cloud_2.png'  // cloud_5.pngがないので2を再利用
        ];
        this.init();
    }

    init() {
        // DOM読み込み完了後に実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupClouds());
        } else {
            this.setupClouds();
        }
        
        // 定期的に新しい雲を追加（30秒ごと）- 間隔をさらに延長して軽くする
        setInterval(() => {
            this.addRandomCloud();
        }, 30000); // 20000から30000に変更
    }

    setupClouds() {
        const clouds = document.querySelectorAll('.cloud');
        
        // 既存の雲にランダムプロパティを設定
        clouds.forEach((cloud, index) => {
            // ランダムな雲画像を選択
            const randomImage = this.getRandomCloudImage();
            cloud.style.backgroundImage = `url('${randomImage}')`;
            
            // ランダムなサイズと位置を設定
            this.setRandomCloudProperties(cloud, index);
        });

        // 初期雲が少ない場合は適量追加
        if (clouds.length < 4) { // 8から4に変更して数を減らす
            this.createInitialClouds();
        }

        console.log('雲システム初期化完了 - 画像雲がランダムに配置されました');
    }

    getRandomCloudImage() {
        return this.cloudImages[Math.floor(Math.random() * this.cloudImages.length)];
    }

    setRandomCloudProperties(cloud, index) {
        // 5倍大きいランダムなサイズ（400px～2000px）
        const randomWidth = 400 + Math.random() * 1600;
        const randomHeight = randomWidth * (0.4 + Math.random() * 0.4); // アスペクト比も可変 0.4～0.8

        // ランダムな垂直位置（0%～70%）- 下30%は住宅部分なので雲なし
        const randomTop = Math.random() * 70;

        // ランダムなアニメーション時間（80s～150s）- さらに長時間でゆっくりと
        const randomDuration = 80 + Math.random() * 70; // 40～100から80～150に変更

        // ランダムな遅延（-30s～0s）- 画面内での開始タイミングを調整
        const randomDelay = -Math.random() * 30;

        // ランダムな透明度（0.3～0.9）
        const randomOpacity = 0.3 + Math.random() * 0.6;

        // スタイルを適用
        cloud.style.width = `${randomWidth}px`;
        cloud.style.height = `${randomHeight}px`;
        cloud.style.top = `${randomTop}%`;
        cloud.style.animationDuration = `${randomDuration}s`;
        cloud.style.animationDelay = `${randomDelay}s`;
        cloud.style.opacity = randomOpacity;
    }

    // 雲をリフレッシュする関数
    refreshClouds() {
        // 既存の雲を全て削除
        const cloudLayer = document.querySelector('.cloud-layer');
        if (cloudLayer) {
            cloudLayer.innerHTML = '';
            // 新しく雲を生成
            this.createInitialClouds();
        }
    }

    // 新しい雲を追加する関数
    addCloud() {
        const cloudLayer = document.querySelector('.cloud-layer');
        if (cloudLayer) {
            const newCloud = document.createElement('div');
            newCloud.className = 'cloud';
            cloudLayer.appendChild(newCloud);
            
            // 新しい雲にランダムプロパティを設定
            const randomImage = this.getRandomCloudImage();
            newCloud.style.backgroundImage = `url('${randomImage}')`;
            this.setRandomCloudProperties(newCloud, cloudLayer.children.length - 1);
        }
    }

    // ランダムなタイミングで雲を追加
    addRandomCloud() {
        const cloudLayer = document.querySelector('.cloud-layer');
        if (cloudLayer) {
            // 雲の数が4個を超えたら古いものを削除（8から4に変更して数を減らす）
            if (cloudLayer.children.length > 4) {
                const oldClouds = Array.from(cloudLayer.children).slice(0, 1); // 2から1に変更
                oldClouds.forEach(cloud => cloud.remove());
            }
            
            // 1個の雲を追加（1～2から1に変更）
            const cloudCount = 1;
            for (let i = 0; i < cloudCount; i++) {
                setTimeout(() => {
                    this.addCloud();
                }, i * 1000); // 0.5秒から1秒間隔に変更
            }
        }
    }

    // 初期雲を適量生成
    createInitialClouds() {
        const cloudLayer = document.querySelector('.cloud-layer');
        if (cloudLayer) {
            // 初期は4個の雲を生成（8から4に変更して軽くする）
            for (let i = 0; i < 4; i++) {
                const newCloud = document.createElement('div');
                newCloud.className = 'cloud';
                cloudLayer.appendChild(newCloud);
                
                const randomImage = this.getRandomCloudImage();
                newCloud.style.backgroundImage = `url('${randomImage}')`;
                this.setRandomCloudProperties(newCloud, i);
            }
        }
    }

    // デバッグ用：現在の雲の状態を確認
    debugCloudStatus() {
        const clouds = document.querySelectorAll('.cloud');
        console.log(`🌤️ 現在の雲の数: ${clouds.length}`);
        clouds.forEach((cloud, index) => {
            const style = window.getComputedStyle(cloud);
            const transform = style.transform;
            const opacity = style.opacity;
            const animationDuration = cloud.style.animationDuration;
            console.log(`雲${index + 1}: duration=${animationDuration}, opacity=${opacity}, transform=${transform}`);
        });
    }
}

// グローバルインスタンスを作成
const cloudSystem = new CloudSystem();

// デバッグ用の関数をグローバルに公開
window.refreshClouds = () => cloudSystem.refreshClouds();
window.addCloud = () => cloudSystem.addCloud();
window.addRandomCloud = () => cloudSystem.addRandomCloud();
window.createInitialClouds = () => cloudSystem.createInitialClouds();
window.debugCloudStatus = () => cloudSystem.debugCloudStatus();

export default CloudSystem;
