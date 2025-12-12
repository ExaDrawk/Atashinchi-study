// d1Client.js - Cloudflare D1 API クライアント
// Workers API経由でD1データベースにアクセス

const D1_API_URL = process.env.D1_API_URL || 'https://study-app-api.drillstudy-api.workers.dev';

/**
 * D1 APIを呼び出すヘルパー関数
 */
async function callD1API(endpoint, method = 'GET', body = null) {
    const url = `${D1_API_URL}${endpoint}`;
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
            console.error(`❌ D1 API Error [${endpoint}]:`, data);
            throw new Error(data.error || `D1 API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`❌ D1 API Call Failed [${endpoint}]:`, error.message);
        throw error;
    }
}

// ===== ユーザー関連 =====

/**
 * ユーザー作成
 */
export async function createUser(username, passwordHash) {
    return callD1API('/api/users', 'POST', { username, passwordHash });
}

/**
 * ユーザー取得
 */
export async function getUser(username) {
    return callD1API(`/api/users/${encodeURIComponent(username)}`);
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
    return callD1API(endpoint);
}

/**
 * Q&A進捗保存
 */
export async function saveQAProgress(username, moduleId, qaId, status, fillDrill = {}) {
    return callD1API('/api/qa-progress', 'POST', {
        username,
        moduleId,
        qaId,
        status,
        fillDrill
    });
}

/**
 * Q&A進捗一括保存
 */
export async function saveQAProgressBatch(username, progressList) {
    const results = [];
    for (const item of progressList) {
        try {
            const result = await saveQAProgress(
                username,
                item.moduleId,
                item.qaId,
                item.status,
                item.fillDrill
            );
            results.push({ success: true, ...item });
        } catch (error) {
            results.push({ success: false, error: error.message, ...item });
        }
    }
    return results;
}

// ===== 学習記録関連 =====

/**
 * 学習記録取得
 */
export async function getStudyRecords(username, year, month) {
    const endpoint = `/api/study-records?username=${encodeURIComponent(username)}&year=${year}&month=${month}`;
    return callD1API(endpoint);
}

/**
 * 学習記録追加
 */
export async function addStudyRecord(username, record) {
    return callD1API('/api/study-records', 'POST', {
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
    return callD1API(`/api/user-settings?username=${encodeURIComponent(username)}`);
}

/**
 * ユーザー設定保存
 */
export async function saveUserSettings(username, settings) {
    return callD1API('/api/user-settings', 'POST', { username, settings });
}

// ===== ヘルスチェック =====

/**
 * D1 APIヘルスチェック
 */
export async function checkD1Health() {
    try {
        const result = await callD1API('/api/health');
        return { available: true, ...result };
    } catch (error) {
        return { available: false, error: error.message };
    }
}

export default {
    createUser,
    getUser,
    getQAProgress,
    saveQAProgress,
    saveQAProgressBatch,
    getStudyRecords,
    addStudyRecord,
    getUserSettings,
    saveUserSettings,
    checkD1Health
};
