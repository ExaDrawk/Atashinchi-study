import path from 'path';
import fs from 'fs/promises';
import fssync from 'fs';

const PROGRESS_DIR = path.join(process.cwd(), 'data', 'qa-progress');
const CASES_DIR = path.join(process.cwd(), 'public', 'cases');

export function normalizeRelativeCasePath(relativePath = '') {
  if (!relativePath) return '';
  return relativePath
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^public\/cases\//i, '')
    .replace(/^cases\//i, '')
    .replace(/^\/+/, '')
    .replace(/\.js$/i, '')
    .trim();
}

export function getAbsolutePathFromRelative(relativePath = '') {
  const normalized = normalizeRelativeCasePath(relativePath);
  if (!normalized) {
    return path.join(CASES_DIR, 'unknown.js');
  }
  const targetPath = normalized.endsWith('.js') ? normalized : `${normalized}.js`;
  return path.join(CASES_DIR, targetPath);
}

function getSlugFromRelativePath(relativePath = '') {
  const normalized = normalizeRelativeCasePath(relativePath);
  if (!normalized) return 'unknown';
  return normalized.replace(/[\/]/g, '__');
}

function getProgressFilePath(relativePath = '') {
  const slug = getSlugFromRelativePath(relativePath);
  return path.join(PROGRESS_DIR, `${slug}.json`);
}

async function ensureProgressDirectory() {
  await fs.mkdir(PROGRESS_DIR, { recursive: true });
}

async function readProgressFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid progress file content');
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function deepClone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function sanitizeProgressDoc(doc, relativePath) {
  const normalized = normalizeRelativeCasePath(relativePath || doc?.relativePath);
  return {
    version: 1,
    relativePath: normalized,
    updatedAt: doc?.updatedAt || null,
    qa: doc?.qa && typeof doc.qa === 'object' ? doc.qa : {}
  };
}

async function writeProgressFile(filePath, doc) {
  const payload = JSON.stringify(doc, null, 2);
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, payload, 'utf8');
  await fs.rename(tempPath, filePath);
}

export async function loadQAProgress(relativePath) {
  await ensureProgressDirectory();
  const filePath = getProgressFilePath(relativePath);
  const existing = await readProgressFile(filePath);
  const baseDoc = sanitizeProgressDoc(existing || {}, relativePath);
  return {
    ...baseDoc,
    filePath
  };
}

export async function saveQAProgress(relativePath, mutator) {
  if (typeof mutator !== 'function') {
    throw new Error('saveQAProgress requires a mutator function');
  }
  await ensureProgressDirectory();
  const filePath = getProgressFilePath(relativePath);
  const currentDoc = sanitizeProgressDoc(await readProgressFile(filePath) || {}, relativePath);
  const draft = deepClone(currentDoc) || currentDoc;
  const updated = await mutator(draft) || draft;
  updated.relativePath = normalizeRelativeCasePath(updated.relativePath || relativePath);
  updated.updatedAt = new Date().toISOString();
  if (!updated.version) {
    updated.version = 1;
  }
  if (!updated.qa || typeof updated.qa !== 'object') {
    updated.qa = {};
  }
  await writeProgressFile(filePath, updated);
  return {
    ...updated,
    filePath
  };
}

export function mergeFillDrill(base = {}, progress = {}) {
  if (!progress) return base || {};
  const merged = {
    ...base,
    ...progress,
    clearedLevels: Array.isArray(progress.clearedLevels)
      ? [...progress.clearedLevels]
      : Array.isArray(base?.clearedLevels)
        ? [...base.clearedLevels]
        : [],
    templates: {
      ...(base?.templates || {}),
      ...(progress?.templates || {})
    },
    attempts: {
      ...(base?.attempts || {}),
      ...(progress?.attempts || {})
    }
  };
  if (progress.history) {
    merged.history = progress.history;
  }
  if (progress.lastAttempt) {
    merged.lastAttempt = progress.lastAttempt;
  }
  return merged;
}

export function mergeProgressIntoCase(caseData, progressDoc) {
  if (!caseData || !Array.isArray(caseData.questionsAndAnswers)) {
    return caseData;
  }
  const progressMap = progressDoc?.qa || {};
  caseData.questionsAndAnswers = caseData.questionsAndAnswers.map(qa => {
    const key = String(qa.id);
    const progress = progressMap[key];
    if (!progress) {
      return qa;
    }
    const nextQa = { ...qa };
    if (progress.status) {
      nextQa.status = progress.status;
    }
    if (progress.check) {
      nextQa.check = progress.check;
    }
    if (progress.notes) {
      nextQa.notes = progress.notes;
    }
    if (progress.meta) {
      nextQa.progressMeta = {
        ...(qa.progressMeta || {}),
        ...progress.meta
      };
    }
    if (progress.fillDrill) {
      nextQa.fillDrill = mergeFillDrill(nextQa.fillDrill, progress.fillDrill);
    }
    if (progress.blankStats) {
      nextQa.blankStats = progress.blankStats;
    }
    nextQa.lastProgressUpdate = progress.lastUpdated || progress.updatedAt || progressDoc?.updatedAt;
    return nextQa;
  });
  return caseData;
}

export function buildProgressPayload(qaArray = []) {
  const payload = {};
  qaArray.forEach(entry => {
    if (!entry || entry.id === undefined || entry.id === null) {
      return;
    }
    const key = String(entry.id);
    const sanitized = {};
    if (entry.status) sanitized.status = entry.status;
    if (entry.check !== undefined) sanitized.check = entry.check;
    if (entry.notes) sanitized.notes = entry.notes;
    if (entry.meta) sanitized.meta = entry.meta;
    if (entry.blankStats) sanitized.blankStats = entry.blankStats;
    if (entry.fillDrill) sanitized.fillDrill = entry.fillDrill;
    sanitized.lastUpdated = entry.lastUpdated || new Date().toISOString();
    payload[key] = sanitized;
  });
  return payload;
}

export async function listProgressFiles() {
  await ensureProgressDirectory();
  const files = await fs.readdir(PROGRESS_DIR);
  return files.filter(file => file.endsWith('.json')).map(file => path.join(PROGRESS_DIR, file));
}

export function progressFileExists(relativePath) {
  const filePath = getProgressFilePath(relativePath);
  return fssync.existsSync(filePath);
}
