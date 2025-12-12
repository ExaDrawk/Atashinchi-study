import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const DEFAULT_LOGGER = {
    info: console.log,
    warn: console.warn,
    error: console.error
};

// 指定ディレクトリを再帰的に探索し、.jsファイル（index.jsを除く）のリストを返す
export function findJsFiles(dir) {
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
export function tryReadTxt(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
    } catch (e) { }
    return null;
}

// 共通のケースインデックス生成関数
export async function generateCaseIndex(casesRootDirectory, outputFilePath, options = {}) {
    const logger = options.logger || DEFAULT_LOGGER;
    const allCaseFiles = findJsFiles(casesRootDirectory);

    const summaries = await Promise.all(allCaseFiles.map(async filePath => {
        try {
            const fileUrl = pathToFileURL(filePath);
            const stats = fs.statSync(filePath);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            if (!fileContent.trim()) {
                logger.warn?.(`⚠️ 空のケースファイルをスキップ: ${filePath}`);
                return null;
            }
            const caseModule = await import(fileUrl.href);
            const caseData = caseModule.default;
            const relativePath = path.relative(casesRootDirectory, filePath).replace(/\\/g, '/');
            const lastModified = stats.mtime.toISOString();
            const id = relativePath.replace(/\.js$/, '');
            const pathParts = relativePath.split('/');
            let category = '';
            let subfolder = '';

            if (pathParts.length >= 3) {
                category = pathParts[0];
                subfolder = pathParts[1];
            } else if (pathParts.length === 2) {
                category = pathParts[0];
                subfolder = '';
            } else {
                category = 'その他';
                subfolder = '';
            }

            const modelAnswers = [];
            const dirName = path.dirname(filePath);
            const baseName = path.basename(filePath, '.js');

            try {
                const allFilesInDir = fs.readdirSync(dirName);
                const baseNamePattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_(\\d+)-(\\d+)_answer\\.txt$`);
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
            } catch (dirError) {
                logger.warn?.(`⚠️ ディレクトリ読み込みエラー: ${dirName} ${dirError.message}`);
            }

            if (modelAnswers.length > 0) {
                logger.info?.(`[modelAnswers] for ${id}: ${modelAnswers.map(m => m.file).join(', ')}`);
            }

            // Extract characters from story
            const characterNames = new Set();
            if (Array.isArray(caseData.story)) {
                caseData.story.forEach(item => {
                    if (item && item.type !== 'scene' && item.type !== 'narration' && item.type !== 'embed' && item.speaker) {
                        characterNames.add(item.speaker);
                    }
                });
            }
            const characters = Array.from(characterNames);

            return {
                id,
                originalId: id,
                category,
                subfolder,
                title: caseData.title || '無題',
                citation: caseData.citation || '',
                tags: caseData.tags || [],
                rank: caseData.rank || caseData.difficulty || 'C',
                filePath: relativePath,
                lastModified,
                characters
            };
        } catch (error) {
            logger.error?.(`❌ エラー: ${filePath} の読み込みに失敗 ${error.message}`);
            return null;
        }
    }));

    const validSummaries = summaries.filter(Boolean);
    const loaders = validSummaries
        .map(s => `'${s.id}': () => import(\`./${s.filePath}?v=\${Math.random()}\`)`)
        .join(',\n    ');
    const fileContent = `// このファイルは build-case-index.js によって自動生成されました。\n// 手動で編集しないでください。\nexport const caseSummaries = ${JSON.stringify(validSummaries, null, 4)};\nexport const caseLoaders = {\n    ${loaders}\n};\n`;
    fs.writeFileSync(outputFilePath, fileContent, 'utf8');

    return {
        casesCount: validSummaries.length,
        categories: [...new Set(validSummaries.map(s => s.category))],
        subfolders: [...new Set(validSummaries.map(s => s.subfolder).filter(Boolean))],
        summaries: validSummaries
    };
}

export async function runCaseIndexBuild(options = {}) {
    const logger = options.logger || DEFAULT_LOGGER;
    const cwd = options.cwd || process.cwd();
    const casesRootDirectory = options.casesRootDirectory || path.resolve(cwd, 'public', 'cases');
    const outputFilePath = options.outputFilePath || path.join(casesRootDirectory, 'index.js');

    logger.info?.(`📁 ケースディレクトリ: ${casesRootDirectory}`);
    logger.info?.(`📝 出力ファイル: ${outputFilePath}`);

    const start = Date.now();
    const result = await generateCaseIndex(casesRootDirectory, outputFilePath, options);
    const durationMs = Date.now() - start;

    logger.info?.(`✅ 相対パスID方式で目次ファイルを生成しました: ${outputFilePath}`);
    logger.info?.(`📊 ケース件数: ${result.casesCount}`);
    logger.info?.(`⏱️ 所要時間: ${durationMs}ms`);

    return result;
}
