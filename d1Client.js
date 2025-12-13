// d1Client.js - Cloudflare R2 API クライアント（旧D1対応）
// Workers API経由でR2ストレージにアクセス
// ※ファイル名は後方互換性のためd1Client.jsのまま

const R2_API_URL = process.env.D1_API_URL || 'https://study-app-api.drillstudy-api.workers.dev';

/**
 * R2 APIを呼び出すヘルパー関数
 */
async function callR2API(endpoint, method = 'GET', body = null) {
    const url = `${R2_API_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ R2 API Error [${endpoint}]:`, data);
            throw new Error(data.error || `R2 API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`❌ R2 API Call Failed [${endpoint}]:`, error.message);
        throw error;
    }
}

// ===== ユーザー関連 =====

/**
 * ユーザー作成
 */
export async function createUser(username, passwordHash) {
    return callR2API('/api/users', 'POST', { username, passwordHash });
}

/**
 * ユーザー取得
 */
export async function getUser(username) {
    return callR2API(`/api/users/${encodeURIComponent(username)}`);
}

// ===== Q&A進捗関連 =====

/**
 * Q&A進捗取得
 */
export async function getQAProgress(username, moduleId = null) {
    let endpoint = `/api/qa-progress?username=${encodeURIComponent(username)}`;
    if (moduleId) {
        endpoint += `&moduleId=${encodeURIComponent(moduleId)}`;
    }
    return callR2API(endpoint);
}

/**
 * 全Q&A進捗取得
 */
export async function getAllQAProgress(username) {
    return callR2API(`/api/qa-progress/all?username=${encodeURIComponent(username)}`);
}

/**
 * Q&A進捗保存
 */
export async function saveQAProgress(username, moduleId, qaId, status, fillDrill = {}) {
    return callR2API('/api/qa-progress', 'POST', {
        username,
        moduleId,
        qaId,
        status,
        fillDrill
    });
}

/**
 * Q&A進捗一括保存（バッチAPI使用）
 */
export async function saveQAProgressBatch(username, progressList) {
    return callR2API('/api/qa-progress/batch', 'POST', {
        username,
        progressList
    });
}

// ===== 学習記録関連 =====

/**
 * 学習記録取得
 */
export async function getStudyRecords(username, year, month) {
    const endpoint = `/api/study-records?username=${encodeURIComponent(username)}&year=${year}&month=${month}`;
    return callR2API(endpoint);
}

/**
 * 学習記録追加
 */
export async function addStudyRecord(username, record) {
    return callR2API('/api/study-records', 'POST', {
        username,
        date: record.date,
        title: record.title,
        detail: record.detail,
        moduleId: record.moduleId,
        qaId: record.qaId,
        level: record.level
    });
}

// ===== ユーザー設定関連 =====

/**
 * ユーザー設定取得
 */
export async function getUserSettings(username) {
    return callR2API(`/api/user-settings?username=${encodeURIComponent(username)}`);
}

/**
 * ユーザー設定保存
 */
export async function saveUserSettings(username, settings) {
    return callR2API('/api/user-settings', 'POST', { username, settings });
}

// ===== クイズ結果関連 =====

/**
 * クイズ結果取得
 */
export async function getQuizResults(username) {
    return callR2API(`/api/quiz-results?username=${encodeURIComponent(username)}`);
}

/**
 * クイズ結果保存
 */
export async function saveQuizResult(username, date, result) {
    return callR2API('/api/quiz-results', 'POST', {
        username,
        date,
        result
    });
}

// ===== FillDrill進捗関連 =====

/**
 * FillDrill進捗取得
 */
export async function getFillDrillProgress(username, moduleId = null) {
    let endpoint = `/api/fill-drill?username=${encodeURIComponent(username)}`;
    if (moduleId) {
        endpoint += `&moduleId=${encodeURIComponent(moduleId)}`;
    }
    return callR2API(endpoint);
}

/**
 * FillDrill進捗保存
 */
export async function saveFillDrillProgress(username, moduleId, qaId, clearedLevels) {
    return callR2API('/api/fill-drill', 'POST', {
        username,
        moduleId,
        qaId,
        clearedLevels
    });
}

// ===== ヘルスチェック =====

/**
 * R2 APIヘルスチェック
 */
export async function checkR2Health() {
    try {
        const result = await callR2API('/api/health');
        return { available: true, ...result };
    } catch (error) {
        return { available: false, error: error.message };
    }
}

// 後方互換性のためのエイリアス
export const checkD1Health = checkR2Health;

export default {
    createUser,
    getUser,
    getQAProgress,
    getAllQAProgress,
    saveQAProgress,
    saveQAProgressBatch,
    getStudyRecords,
    addStudyRecord,
    getUserSettings,
    saveUserSettings,
    getQuizResults,
    saveQuizResult,
    getFillDrillProgress,
    saveFillDrillProgress,
    checkR2Health,
    checkD1Health
};
