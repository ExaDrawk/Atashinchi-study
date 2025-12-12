import path from 'path';
import { fileURLToPath } from 'url';
import { runCaseIndexBuild, generateCaseIndex, findJsFiles, tryReadTxt } from './lib/caseIndexGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { runCaseIndexBuild, generateCaseIndex, findJsFiles, tryReadTxt };

function parseArgs(argv) {
    const result = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            result.help = true;
            continue;
        }
        if (arg === '--quiet' || arg === '-q') {
            result.quiet = true;
            continue;
        }
        if (arg.startsWith('--')) {
            const [key, value] = arg.split('=');
            if (key === '--json') {
                result.json = true;
                continue;
            }
            const resolvedValue = value !== undefined ? value : argv[i + 1];
            if (value === undefined && argv[i + 1] && !argv[i + 1].startsWith('-')) {
                i++;
            }
            switch (key) {
                case '--root':
                    result.root = resolvedValue;
                    break;
                case '--out':
                case '--output':
                    result.out = resolvedValue;
                    break;
                case '--cwd':
                    result.cwd = resolvedValue;
                    break;
                default:
                    result._.push(arg);
            }
            continue;
        }
        if (arg.startsWith('-')) {
            switch (arg) {
                case '-r':
                    result.root = argv[++i];
                    break;
                case '-o':
                    result.out = argv[++i];
                    break;
                case '-c':
                    result.cwd = argv[++i];
                    break;
                case '-j':
                    result.json = true;
                    break;
                default:
                    result._.push(arg);
            }
            continue;
        }
        result._.push(arg);
    }
    return result;
}

function createLogger(quiet = false) {
    if (!quiet) {
        return undefined;
    }
    const noop = () => {};
    return {
        info: noop,
        warn: console.warn,
        error: console.error
    };
}

function printHelp() {
    console.log(`ケース目次生成CLI\n\n` +
        `オプション:\n` +
        `  --root, -r   ケースフォルダのルート (デフォルト: public/cases)\n` +
        `  --out, -o    出力ファイルパス (デフォルト: <root>/index.js)\n` +
        `  --quiet, -q  ログ抑制\n` +
        `  --json, -j   成功時に結果JSONを出力\n` +
        `  --help, -h   このメッセージを表示\n`);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }

    const cwd = args.cwd ? path.resolve(process.cwd(), args.cwd) : process.cwd();
    const casesRootDirectory = args.root
        ? path.resolve(cwd, args.root)
        : path.resolve(__dirname, '..', 'public', 'cases');
    const outputFilePath = args.out
        ? path.resolve(cwd, args.out)
        : path.join(casesRootDirectory, 'index.js');

    const logger = createLogger(args.quiet);

    try {
        const result = await runCaseIndexBuild({
            casesRootDirectory,
            outputFilePath,
            logger
        });

        if (args.json) {
            console.log(JSON.stringify(result, null, 2));
        }
    } catch (error) {
        const targetLogger = logger?.error ? logger : console;
        targetLogger.error('❌ 目次ファイルの生成中にエラーが発生しました:', error);
        process.exitCode = 1;
    }
}

const isCliExecution = process.argv[1]
    ? path.resolve(process.argv[1]) === __filename
    : false;

if (isCliExecution) {
    main();
}

