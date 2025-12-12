// Cloudflare Workers API for R2 Object Storage
// 学習データのCRUD操作を提供（D1からR2に移行）

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS設定
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // OPTIONSリクエスト（プリフライト）への応答
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // ルーティング
            if (path === '/api/health') {
                return jsonResponse({ status: 'ok', storage: 'r2', timestamp: new Date().toISOString() }, 200, corsHeaders);
            }

            // ユーザー関連
            if (path === '/api/users' && request.method === 'POST') {
                return await createUser(request, env, corsHeaders);
            }
            if (path.startsWith('/api/users/') && request.method === 'GET') {
                const username = path.split('/')[3];
                return await getUser(username, env, corsHeaders);
            }

            // Q&A進捗関連
            if (path === '/api/qa-progress' && request.method === 'GET') {
                const username = url.searchParams.get('username');
                const moduleId = url.searchParams.get('moduleId');
                return await getQAProgress(username, moduleId, env, corsHeaders);
            }
            if (path === '/api/qa-progress' && request.method === 'POST') {
                return await saveQAProgress(request, env, corsHeaders);
            }

            // 全Q&A進捗取得
            if (path === '/api/qa-progress/all' && request.method === 'GET') {
                const username = url.searchParams.get('username');
                return await getAllQAProgress(username, env, corsHeaders);
            }

            // Q&A進捗一括保存
            if (path === '/api/qa-progress/batch' && request.method === 'POST') {
                return await saveQAProgressBatch(request, env, corsHeaders);
            }

            // 学習記録関連
            if (path === '/api/study-records' && request.method === 'GET') {
                const username = url.searchParams.get('username');
                const year = url.searchParams.get('year');
                const month = url.searchParams.get('month');
                return await getStudyRecords(username, year, month, env, corsHeaders);
            }
            if (path === '/api/study-records' && request.method === 'POST') {
                return await addStudyRecord(request, env, corsHeaders);
            }

            // ユーザー設定関連
            if (path === '/api/user-settings' && request.method === 'GET') {
                const username = url.searchParams.get('username');
                return await getUserSettings(username, env, corsHeaders);
            }
            if (path === '/api/user-settings' && request.method === 'POST') {
                return await saveUserSettings(request, env, corsHeaders);
            }

            return jsonResponse({ error: 'Not Found' }, 404, corsHeaders);

        } catch (error) {
            console.error('API Error:', error);
            return jsonResponse({ error: error.message }, 500, corsHeaders);
        }
    }
};

// ヘルパー関数
function jsonResponse(data, status = 200, corsHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}

// R2キー生成ヘルパー
function getUserKey(username) {
    return `users/${encodeURIComponent(username)}.json`;
}

function getQAProgressKey(username, moduleId) {
    return `qa-progress/${encodeURIComponent(username)}/${encodeURIComponent(moduleId)}.json`;
}

function getStudyRecordsKey(username, year, month) {
    return `study-records/${encodeURIComponent(username)}/${year}-${month.padStart(2, '0')}.json`;
}

function getSettingsKey(username) {
    return `settings/${encodeURIComponent(username)}.json`;
}

// ユーザー作成
async function createUser(request, env, corsHeaders) {
    const { username, passwordHash } = await request.json();

    const key = getUserKey(username);

    // 既存ユーザーチェック
    const existing = await env.BUCKET.get(key);
    if (existing) {
        return jsonResponse({ error: 'User already exists' }, 409, corsHeaders);
    }

    const userData = {
        username,
        passwordHash,
        createdAt: new Date().toISOString()
    };

    await env.BUCKET.put(key, JSON.stringify(userData), {
        httpMetadata: { contentType: 'application/json' }
    });

    return jsonResponse({ success: true, username }, 201, corsHeaders);
}

// ユーザー取得
async function getUser(username, env, corsHeaders) {
    const key = getUserKey(username);
    const object = await env.BUCKET.get(key);

    if (!object) {
        return jsonResponse({ error: 'User not found' }, 404, corsHeaders);
    }

    const userData = JSON.parse(await object.text());
    // パスワードハッシュは返さない
    delete userData.passwordHash;

    return jsonResponse(userData, 200, corsHeaders);
}

// Q&A進捗取得
async function getQAProgress(username, moduleId, env, corsHeaders) {
    if (!username) {
        return jsonResponse({ error: 'username is required' }, 400, corsHeaders);
    }

    if (moduleId) {
        // 特定モジュールの進捗を取得
        const key = getQAProgressKey(username, moduleId);
        const object = await env.BUCKET.get(key);

        if (!object) {
            return jsonResponse({ progress: [] }, 200, corsHeaders);
        }

        const data = JSON.parse(await object.text());
        return jsonResponse({ progress: data.progress || [] }, 200, corsHeaders);
    } else {
        // 全進捗を取得
        return await getAllQAProgress(username, env, corsHeaders);
    }
}

// 全Q&A進捗取得
async function getAllQAProgress(username, env, corsHeaders) {
    if (!username) {
        return jsonResponse({ error: 'username is required' }, 400, corsHeaders);
    }

    const prefix = `qa-progress/${encodeURIComponent(username)}/`;
    const listed = await env.BUCKET.list({ prefix });

    const allProgress = [];

    for (const obj of listed.objects) {
        const object = await env.BUCKET.get(obj.key);
        if (object) {
            const data = JSON.parse(await object.text());
            if (data.progress) {
                allProgress.push(...data.progress);
            }
        }
    }

    return jsonResponse({ progress: allProgress }, 200, corsHeaders);
}

// Q&A進捗保存
async function saveQAProgress(request, env, corsHeaders) {
    const { username, moduleId, qaId, status, fillDrill } = await request.json();

    if (!username || !moduleId || qaId === undefined) {
        return jsonResponse({ error: 'username, moduleId, and qaId are required' }, 400, corsHeaders);
    }

    const key = getQAProgressKey(username, moduleId);

    // 既存データを取得
    let progressData = { progress: [], updatedAt: null };
    const existing = await env.BUCKET.get(key);
    if (existing) {
        progressData = JSON.parse(await existing.text());
    }

    // 進捗を更新または追加
    const existingIndex = progressData.progress.findIndex(
        p => p.qa_id === qaId
    );

    const progressItem = {
        module_id: moduleId,
        qa_id: qaId,
        status: status || '未',
        fill_drill: JSON.stringify(fillDrill || {}),
        updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        progressData.progress[existingIndex] = progressItem;
    } else {
        progressData.progress.push(progressItem);
    }

    progressData.updatedAt = new Date().toISOString();

    await env.BUCKET.put(key, JSON.stringify(progressData), {
        httpMetadata: { contentType: 'application/json' }
    });

    return jsonResponse({ success: true }, 200, corsHeaders);
}

// Q&A進捗一括保存
async function saveQAProgressBatch(request, env, corsHeaders) {
    const { username, progressList } = await request.json();

    if (!username || !progressList || !Array.isArray(progressList)) {
        return jsonResponse({ error: 'username and progressList are required' }, 400, corsHeaders);
    }

    // モジュールIDごとにグループ化
    const byModule = {};
    for (const item of progressList) {
        const moduleId = item.moduleId;
        if (!byModule[moduleId]) {
            byModule[moduleId] = [];
        }
        byModule[moduleId].push(item);
    }

    // 各モジュールごとに保存
    for (const [moduleId, items] of Object.entries(byModule)) {
        const key = getQAProgressKey(username, moduleId);

        // 既存データを取得
        let progressData = { progress: [], updatedAt: null };
        const existing = await env.BUCKET.get(key);
        if (existing) {
            progressData = JSON.parse(await existing.text());
        }

        // 各アイテムを更新
        for (const item of items) {
            const existingIndex = progressData.progress.findIndex(
                p => p.qa_id === item.qaId
            );

            const progressItem = {
                module_id: moduleId,
                qa_id: item.qaId,
                status: item.status || '未',
                fill_drill: JSON.stringify(item.fillDrill || {}),
                updated_at: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                progressData.progress[existingIndex] = progressItem;
            } else {
                progressData.progress.push(progressItem);
            }
        }

        progressData.updatedAt = new Date().toISOString();

        await env.BUCKET.put(key, JSON.stringify(progressData), {
            httpMetadata: { contentType: 'application/json' }
        });
    }

    return jsonResponse({ success: true, count: progressList.length }, 200, corsHeaders);
}

// 学習記録取得
async function getStudyRecords(username, year, month, env, corsHeaders) {
    if (!username || !year || !month) {
        return jsonResponse({ error: 'username, year, and month are required' }, 400, corsHeaders);
    }

    const key = getStudyRecordsKey(username, year, month);
    const object = await env.BUCKET.get(key);

    if (!object) {
        return jsonResponse({ records: [] }, 200, corsHeaders);
    }

    const data = JSON.parse(await object.text());
    return jsonResponse({ records: data.records || [] }, 200, corsHeaders);
}

// 学習記録追加
async function addStudyRecord(request, env, corsHeaders) {
    const { username, date, title, detail, moduleId, qaId, level } = await request.json();

    if (!username || !date) {
        return jsonResponse({ error: 'username and date are required' }, 400, corsHeaders);
    }

    const [year, month] = date.split('-');
    const key = getStudyRecordsKey(username, year, month);

    // 既存データを取得
    let recordsData = { records: [] };
    const existing = await env.BUCKET.get(key);
    if (existing) {
        recordsData = JSON.parse(await existing.text());
    }

    // 新しい記録を追加
    recordsData.records.push({
        date,
        title,
        detail,
        moduleId,
        qaId,
        level,
        timestamp: new Date().toISOString()
    });

    await env.BUCKET.put(key, JSON.stringify(recordsData), {
        httpMetadata: { contentType: 'application/json' }
    });

    return jsonResponse({ success: true }, 201, corsHeaders);
}

// ユーザー設定取得
async function getUserSettings(username, env, corsHeaders) {
    if (!username) {
        return jsonResponse({ error: 'username is required' }, 400, corsHeaders);
    }

    const key = getSettingsKey(username);
    const object = await env.BUCKET.get(key);

    if (!object) {
        return jsonResponse({ settings: {} }, 200, corsHeaders);
    }

    const data = JSON.parse(await object.text());
    return jsonResponse({ settings: data.settings || {} }, 200, corsHeaders);
}

// ユーザー設定保存
async function saveUserSettings(request, env, corsHeaders) {
    const { username, settings } = await request.json();

    if (!username) {
        return jsonResponse({ error: 'username is required' }, 400, corsHeaders);
    }

    const key = getSettingsKey(username);

    const settingsData = {
        settings: settings || {},
        updatedAt: new Date().toISOString()
    };

    await env.BUCKET.put(key, JSON.stringify(settingsData), {
        httpMetadata: { contentType: 'application/json' }
    });

    return jsonResponse({ success: true }, 200, corsHeaders);
}
