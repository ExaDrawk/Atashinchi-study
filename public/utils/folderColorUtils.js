/**
 * フォルダカラーシステム
 * 各フォルダの設定ファイルからカラー情報を読み込み、UIに反映する
 */

// フォルダカラーのキャッシュ
const folderColorCache = new Map();

/**
 * 指定されたカテゴリのフォルダカラーを取得
 * @param {string} category - カテゴリ名（例: "民法"）
 * @returns {Promise<string|null>} - カラーコード（例: "#dc3545"）またはnull
 */
export async function getFolderColor(category) {
    if (!category) return null;
    
    // キャッシュから取得
    if (folderColorCache.has(category)) {
        return folderColorCache.get(category);
    }
    
    try {
        // module_settings.jsonからカラー情報を読み込み
        console.log(`🔍 フォルダカラー取得開始: ${category}`);
        const response = await fetch(`/cases/${category}/module_settings.json`);
        console.log(`📡 API Response: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            console.warn(`❌ フォルダ設定ファイルが見つかりません: ${category}`);
            folderColorCache.set(category, null);
            return null;
        }
        
        // Guard: ensure response is JSON (avoid SPA HTML fallback like index.html)
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            console.warn(`❌ 設定ファイルがJSONではありません: ${category} - content-type: ${contentType}`);
            folderColorCache.set(category, null);
            return null;
        }

        let settings = null;
        try {
            settings = await response.json();
        } catch (e) {
            console.warn(`❌ 設定ファイルのJSON解析に失敗: ${category}`, e);
            folderColorCache.set(category, null);
            return null;
        }

        console.log(`📋 設定ファイル内容:`, settings);
        const folderColor = settings.folderColor || null;
        
        // キャッシュに保存
        folderColorCache.set(category, folderColor);
        
        console.log(`✅ フォルダカラー取得成功: ${category} → ${folderColor}`);
        return folderColor;
        
    } catch (error) {
        console.error(`フォルダカラーの取得エラー (${category}):`, error);
        folderColorCache.set(category, null);
        return null;
    }
}

/**
 * フォルダカラーのキャッシュをクリア
 */
export function clearFolderColorCache() {
    folderColorCache.clear();
    console.log('🗑️ フォルダカラーキャッシュをクリアしました');
}

/**
 * フォルダバッジに適用するスタイルを生成
 * @param {string} folderColor - カラーコード（例: "#dc3545"）
 * @returns {Object} - スタイル情報
 */
export function generateFolderBadgeStyle(folderColor) {
    if (!folderColor) {
        // デフォルトのレインボーアニメーション
        return {
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #a8e6cf, #ff8a80)',
            backgroundSize: '400% 400%',
            animation: 'rainbow 3s ease infinite, glow 2s ease infinite, float 4s ease infinite',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
        };
    }
    
    // カスタムカラーの場合は単色ベースのスタイル
    const hexColor = folderColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // グラデーション用の色バリエーションを生成
    const lighterColor = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
    const darkerColor = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
    
    return {
        background: `linear-gradient(45deg, ${folderColor}, ${lighterColor}, ${folderColor}, ${darkerColor})`,
        backgroundSize: '300% 300%',
        animation: 'folder-color-pulse 3s ease infinite, gentle-glow 2s ease infinite',
        border: `2px solid ${darkerColor}`,
        textShadow: '0 0 8px rgba(0, 0, 0, 0.7)',
        color: 'white'
    };
}

/**
 * フォルダバッジ要素にカラースタイルを適用
 * @param {HTMLElement} badgeElement - バッジ要素
 * @param {string} category - カテゴリ名
 */
export async function applyFolderColorToBadge(badgeElement, category) {
    if (!badgeElement || !category) {
        console.log(`⚠️ バッジまたはカテゴリが無効: badge=${!!badgeElement}, category=${category}`);
        return;
    }
    
    console.log(`🎨 フォルダカラー適用開始: ${category}`);
    const folderColor = await getFolderColor(category);
    const style = generateFolderBadgeStyle(folderColor);
    
    console.log(`🎨 生成されたスタイル:`, style);
    
    // スタイルを適用
    Object.assign(badgeElement.style, style);
    
    // カスタムカラーの場合はデータ属性を追加
    if (folderColor) {
        badgeElement.setAttribute('data-folder-color', folderColor);
        badgeElement.classList.add('custom-folder-color');
        console.log(`✅ カスタムカラー適用完了: ${category} → ${folderColor}`);
    } else {
        console.log(`ℹ️ デフォルトカラー使用: ${category}`);
    }
}

/**
 * 複数のフォルダバッジに一括でカラーを適用
 * @param {NodeList|Array} badgeElements - バッジ要素の配列
 * @param {function} getCategoryFunction - 要素からカテゴリを取得する関数
 */
export async function applyFolderColorsToMultipleBadges(badgeElements, getCategoryFunction) {
    const promises = Array.from(badgeElements).map(async (badge) => {
        const category = getCategoryFunction(badge);
        if (category) {
            await applyFolderColorToBadge(badge, category);
        }
    });
    
    await Promise.all(promises);
}
