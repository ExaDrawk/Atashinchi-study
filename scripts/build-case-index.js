import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// 指定されたディレクトリを再帰的に探索し、.jsファイル（index.jsを除く）のリストを返す関数
function findJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findJsFiles(filePath));
        } else if (file.endsWith('.js') && file !== 'index.js') {
            results.push(filePath);
        }
    });
    return results;
}

async function generateIndex() {
    const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
    const casesRootDirectory = path.resolve(__dirname, '..', 'public', 'cases');
    const outputFilePath = path.join(casesRootDirectory, 'index.js');
    const allCaseFiles = findJsFiles(casesRootDirectory);    // 同名ファイルの競合を検出するためのマップ
    const fileNameMap = new Map();
    
    const summaries = await Promise.all(allCaseFiles.map(async filePath => {
        try {
            const fileUrl = pathToFileURL(filePath);
            const caseModule = await import(fileUrl.href);
            const caseData = caseModule.default;
            const originalId = path.basename(filePath, '.js');
            const category = path.basename(path.dirname(filePath));
            
            // 競合防止のための一意ID生成
            let uniqueId;
            const fileNameKey = originalId;
            if (fileNameMap.has(fileNameKey)) {
                // 既に同名ファイルが存在する場合、カテゴリ名を含めたIDを使用
                uniqueId = `${category}-${originalId}`;
                // 既存のエントリも更新
                const existingEntry = fileNameMap.get(fileNameKey);
                existingEntry.needsCategoryPrefix = true;
                console.log(`⚠️  同名ファイル検出: ${originalId} (${category}と${existingEntry.category})`);
            } else {
                uniqueId = originalId;
                fileNameMap.set(fileNameKey, { 
                    category, 
                    uniqueId, 
                    needsCategoryPrefix: false 
                });
            }
            
            // デバッグ情報を追加
            console.log(`📂 処理中: ${category}/${originalId}.js → ID: ${uniqueId}`);
            
            if (!caseData) {
                console.error(`❌ エラー: ${filePath} - caseData が undefined です`);
                return null;
            }
            
            if (!caseData.title) {
                console.error(`❌ エラー: ${filePath} - title プロパティが見つかりません`);
                console.error(`利用可能なプロパティ:`, Object.keys(caseData));
                return null;
            }
            
            return { 
                id: uniqueId,
                originalId,
                category, 
                title: caseData.title, 
                citation: caseData.citation || '引用情報なし', 
                tags: caseData.tags || [],
                filePath: path.relative(path.resolve(__dirname, '..', 'public', 'cases'), filePath).replace(/\\/g, '/')
            };
        } catch (error) {
            console.error(`❌ ファイル読み込みエラー: ${filePath}`, error.message);
            return null;
        }    }));    
    // null値を除外
    const validSummaries = summaries.filter(summary => summary !== null);
    
    // 競合ファイルのIDを再設定
    const finalSummaries = validSummaries.map(summary => {
        const fileNameKey = summary.originalId;
        const mapEntry = fileNameMap.get(fileNameKey);
        
        if (mapEntry && mapEntry.needsCategoryPrefix) {
            // 同名ファイルが複数存在する場合、カテゴリプレフィックスを付与
            return {
                ...summary,
                id: `${summary.category}-${summary.originalId}`
            };
        }
        return summary;
    });
    
    console.log(`✅ 有効な事例ファイル: ${finalSummaries.length}/${summaries.length}件`);
    
    // 競合ファイルのレポート
    const conflicts = Array.from(fileNameMap.entries())
        .filter(([, entry]) => entry.needsCategoryPrefix);
    if (conflicts.length > 0) {
        console.log(`⚠️  ファイル名競合を検出し、カテゴリプレフィックスを適用しました:`);
        conflicts.forEach(([fileName]) => {
            const conflictingFiles = finalSummaries.filter(s => s.originalId === fileName);
            conflictingFiles.forEach(file => {
                console.log(`   - ${fileName} → ${file.id} (${file.category}カテゴリ)`);
            });
        });
    }

    // 競合統計レポートを生成
    console.log(`\n📊 ファイル名競合レポート:`);
    console.log(`   - 総ファイル数: ${finalSummaries.length}`);
    console.log(`   - 競合ファイル数: ${conflicts.length}`);
    console.log(`   - 一意ID生成率: ${((finalSummaries.length - conflicts.length) / finalSummaries.length * 100).toFixed(1)}%`);
    
    if (conflicts.length === 0) {
        console.log(`✅ ファイル名競合はありません。すべてのファイルが一意のIDを持っています。`);
    }

    const loaders = finalSummaries.map(summary => {
        // 実際のファイルパスを使用してloaderを生成
        return `'${summary.id}': () => import('./${summary.filePath}')`;
    }).join(',\n    ');    const fileContent = `// このファイルは build-case-index.js によって自動生成されました。
// 手動で編集しないでください。
export const caseSummaries = ${JSON.stringify(finalSummaries, null, 4)};
export const caseLoaders = {
    ${loaders}
};
`;

    fs.writeFileSync(outputFilePath, fileContent, 'utf8');
    console.log(`✅ 科目別フォルダ対応の目次ファイルが正常に生成されました: ${outputFilePath}`);
}

generateIndex().catch(error => console.error("目次ファイルの生成中にエラーが発生しました:", error));
