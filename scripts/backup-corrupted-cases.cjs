#!/usr/bin/env node
/**
 * Backup modified case modules under public/cases into data/case-backups/<timestamp>/.
 *
 * Usage: node scripts/backup-corrupted-cases.js [--dest <folder>] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getRepoRoot() {
  return path.resolve(__dirname, '..');
}

function runGitStatus(repoRoot) {
  try {
    const output = execSync('git -c core.quotepath=false status --porcelain public/cases', {
      cwd: repoRoot,
      encoding: 'utf8'
    });
    return output.trim();
  } catch (error) {
    console.error('Failed to run git status:', error.message);
    process.exit(1);
  }
}

function parseModifiedFiles(stdout) {
  if (!stdout) return [];
  return stdout
    .split(/\r?\n/)
    .map(line => line.replace(/\s+$/, ''))
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^(?:\?\?|..)?\s+(.*)$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .filter(line => line.startsWith('public/cases/'));
}

function normalizePathSegments(filePath) {
  return filePath.split(/[\\/]+/).filter(Boolean);
}

function main() {
  const repoRoot = getRepoRoot();
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const destIndex = args.indexOf('--dest');
  let destFolder = destIndex !== -1 && args[destIndex + 1] ? args[destIndex + 1] : null;

  const statusOutput = runGitStatus(repoRoot);
  const files = parseModifiedFiles(statusOutput);
  if (!files.length) {
    console.log('No modified case files detected under public/cases.');
    return;
  }

  if (!destFolder) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    destFolder = path.join('data', 'case-backups', timestamp);
  }

  const absoluteDestRoot = path.join(repoRoot, destFolder);
  if (!dryRun) {
    fs.mkdirSync(absoluteDestRoot, { recursive: true });
  }

  console.log(`Backing up ${files.length} files to ${destFolder}${dryRun ? ' (dry-run)' : ''}`);

  files.forEach(relPath => {
    const srcPath = path.join(repoRoot, relPath);
    const relSegments = normalizePathSegments(relPath).slice(2); // drop 'public', 'cases'
    const destPath = path.join(absoluteDestRoot, ...relSegments);
    if (dryRun) {
      console.log(`[dry-run] Would copy ${relPath} -> ${path.relative(repoRoot, destPath)}`);
      return;
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${relPath} -> ${path.relative(repoRoot, destPath)}`);
  });
}

main();
