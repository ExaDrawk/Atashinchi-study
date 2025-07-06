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
    const allCaseFiles = findJsFiles(casesRootDirectory);    const summaries = await Promise.all(allCaseFiles.map(async filePath => {
        try {
            const fileUrl = pathToFileURL(filePath);
            const caseModule = await import(fileUrl.href);
            const caseData = caseModule.default;
            const id = path.basename(filePath, '.js');
            const category = path.basename(path.dirname(filePath));
            
            // デバッグ情報を追加
            console.log(`📂 処理中: ${category}/${id}.js`);
            
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
                id, 
                category, 
                title: caseData.title, 
                citation: caseData.citation || '引用情報なし', 
                tags: caseData.tags || []
            };
        } catch (error) {
            console.error(`❌ ファイル読み込みエラー: ${filePath}`, error.message);
            return null;
        }    }));
    
    // null値を除外
    const validSummaries = summaries.filter(summary => summary !== null);
    console.log(`✅ 有効な事例ファイル: ${validSummaries.length}/${summaries.length}件`);

    const loaders = validSummaries.map(summary => {
        // public/casesからの相対パスを正しく生成
        const relativePath = path.relative(casesRootDirectory, path.join(casesRootDirectory, summary.category, `${summary.id}.js`)).replace(/\\/g, '/');
        return `'${summary.id}': () => import('./${relativePath}')`;
    }).join(',\n    ');    const fileContent = `// このファイルは build-case-index.js によって自動生成されました。
// 手動で編集しないでください。
export const caseSummaries = ${JSON.stringify(validSummaries, null, 4)};
export const caseLoaders = {
    ${loaders}
};
`;

    fs.writeFileSync(outputFilePath, fileContent, 'utf8');
    console.log(`✅ 科目別フォルダ対応の目次ファイルが正常に生成されました: ${outputFilePath}`);
}

generateIndex().catch(error => console.error("目次ファイルの生成中にエラーが発生しました:", error));
