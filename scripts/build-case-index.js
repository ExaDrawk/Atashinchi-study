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

            // --- 大問・小問ごとの模範解答ファイル探索 ---
            // 例: 3.75-88_1-1_answer.txt, 3.75-88_2-1_answer.txt など
            const modelAnswers = [];
            const allFilesInDir = fs.readdirSync(dirName);
            const baseNamePattern = new RegExp(`^${baseName}_(\\d+)-(\\d+)_answer\\.txt$`);
            for (const file of allFilesInDir) {
                const match = file.match(baseNamePattern);
                if (match) {
                    const qNo = match[1];
                    const subNo = match[2];
                    const filePathTxt = path.join(dirName, file);
                    const content = tryReadTxt(filePathTxt);
                    if (content) {
                        modelAnswers.push({
                            question: `${qNo}-${subNo}`,
                            file: file,
                            content: content
                        });
                    }
                }
            }
            // デバッグ用: 生成されたmodelAnswersを出力
            if (modelAnswers.length > 0) {
                console.log(`[modelAnswers] for ${id}:`, modelAnswers.map(m => m.file));
            }

            return {
                id,
                category,
                title: caseData.title || '無題',
                citation: caseData.citation || '',
                tags: caseData.tags || [],
                filePath: relativePath,
                // 追加情報
                modelAnswers, // 必ず出力する
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
