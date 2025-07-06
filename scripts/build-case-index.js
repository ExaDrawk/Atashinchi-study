import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

// 指定ディレクトリを再帰的に探索し、.jsファイル（index.jsを除く）のリストを返す
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

// txtファイルの読み込み（存在しなければnull）
function tryReadTxt(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
    } catch (e) {}
    return null;
}

async function generateIndex() {
    // __dirnameを正しく取得（Windows対応）
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const casesRootDirectory = path.resolve(__dirname, '..', 'public', 'cases');
    const outputFilePath = path.join(casesRootDirectory, 'index.js');
    const allCaseFiles = findJsFiles(casesRootDirectory);

    const summaries = await Promise.all(allCaseFiles.map(async filePath => {
        try {
            const fileUrl = pathToFileURL(filePath);
            const caseModule = await import(fileUrl.href);
            const caseData = caseModule.default;
            const relativePath = path.relative(casesRootDirectory, filePath).replace(/\\/g, '/');
            const id = relativePath.replace(/\.js$/, '');
            const category = path.basename(path.dirname(filePath));

            // txtファイル探索: 例 3.75-88_1-1_answer.txt
            const baseName = path.basename(filePath, '.js');
            const dirName = path.dirname(filePath);
            // 例: _1-1_answer.txt, _1-1_correction.txt など
            const txtTypes = ['answer', 'correction', 'grading'];
            let txtData = {};
            for (const type of txtTypes) {
                // 例: 3.75-88_1-1_answer.txt
                const txtFile = path.join(dirName, `${baseName}_${type}.txt`);
                const content = tryReadTxt(txtFile);
                if (content) {
                    txtData[type] = content;
                }
            }

            // js側定義が優先
            const modelAnswer = (caseData.modelAnswer !== undefined) ? caseData.modelAnswer : (txtData['answer'] || undefined);
            const correctionInfo = (caseData.correctionInfo !== undefined) ? caseData.correctionInfo : (txtData['correction'] || undefined);
            const gradingInfo = (caseData.gradingInfo !== undefined) ? caseData.gradingInfo : (txtData['grading'] || undefined);

            return {
                id,
                category,
                title: caseData.title || '無題',
                citation: caseData.citation || '',
                tags: caseData.tags || [],
                filePath: relativePath,
                // 追加情報
                ...(modelAnswer !== undefined ? { modelAnswer } : {}),
                ...(correctionInfo !== undefined ? { correctionInfo } : {}),
                ...(gradingInfo !== undefined ? { gradingInfo } : {})
            };
        } catch (error) {
            console.error(`❌ エラー: ${filePath} の読み込みに失敗`, error.message);
            return null;
        }
    }));
    const validSummaries = summaries.filter(Boolean);
    const loaders = validSummaries.map(s => `'${s.id}': () => import('./${s.filePath}')`).join(',\n    ');
    const fileContent = `// このファイルは build-case-index.js によって自動生成されました。\n// 手動で編集しないでください。\nexport const caseSummaries = ${JSON.stringify(validSummaries, null, 4)};\nexport const caseLoaders = {\n    ${loaders}\n};\n`;
    fs.writeFileSync(outputFilePath, fileContent, 'utf8');
    console.log(`✅ 相対パスID方式で目次ファイルを生成しました: ${outputFilePath}`);
}

generateIndex().catch(error => console.error('目次ファイルの生成中にエラーが発生しました:', error));
