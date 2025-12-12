// Cloudflare Workers API for D1 Database
// 学習データのCRUD操作を提供

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

        // APIキー認証（オプション）
        // const authHeader = request.headers.get('Authorization');
        // if (authHeader !== `Bearer ${env.API_SECRET}`) {
        //   return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
        // }

        try {
            // ルーティング
            if (path === '/api/health') {
                return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, corsHeaders);
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

// ユーザー作成
async function createUser(request, env, corsHeaders) {
    const { username, passwordHash } = await request.json();

    await env.DB.prepare(`
    INSERT INTO users (username, password_hash, created_at)
    VALUES (?, ?, datetime('now'))
  `).bind(username, passwordHash).run();

    return jsonResponse({ success: true, username }, 201, corsHeaders);
}

// ユーザー取得
async function getUser(username, env, corsHeaders) {
    const result = await env.DB.prepare(`
    SELECT username, created_at FROM users WHERE username = ?
  `).bind(username).first();

    if (!result) {
        return jsonResponse({ error: 'User not found' }, 404, corsHeaders);
    }

    return jsonResponse(result, 200, corsHeaders);
}

// Q&A進捗取得
async function getQAProgress(username, moduleId, env, corsHeaders) {
    let query = `SELECT * FROM qa_progress WHERE username = ?`;
    const params = [username];

    if (moduleId) {
        query += ` AND module_id = ?`;
        params.push(moduleId);
    }

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse({ progress: results }, 200, corsHeaders);
}

// Q&A進捗保存
async function saveQAProgress(request, env, corsHeaders) {
    const { username, moduleId, qaId, status, fillDrill } = await request.json();

    await env.DB.prepare(`
    INSERT INTO qa_progress (username, module_id, qa_id, status, fill_drill, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(username, module_id, qa_id) 
    DO UPDATE SET status = excluded.status, fill_drill = excluded.fill_drill, updated_at = datetime('now')
  `).bind(username, moduleId, qaId, status, JSON.stringify(fillDrill || {})).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
}

// 学習記録取得
async function getStudyRecords(username, year, month, env, corsHeaders) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { results } = await env.DB.prepare(`
    SELECT * FROM study_records 
    WHERE username = ? AND date BETWEEN ? AND ?
    ORDER BY timestamp DESC
  `).bind(username, startDate, endDate).all();

    return jsonResponse({ records: results }, 200, corsHeaders);
}

// 学習記録追加
async function addStudyRecord(request, env, corsHeaders) {
    const { username, date, title, detail, moduleId, qaId, level } = await request.json();

    await env.DB.prepare(`
    INSERT INTO study_records (username, date, title, detail, module_id, qa_id, level, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(username, date, title, detail, moduleId, qaId, level).run();

    return jsonResponse({ success: true }, 201, corsHeaders);
}

// ユーザー設定取得
async function getUserSettings(username, env, corsHeaders) {
    const result = await env.DB.prepare(`
    SELECT settings FROM user_settings WHERE username = ?
  `).bind(username).first();

    if (!result) {
        return jsonResponse({ settings: {} }, 200, corsHeaders);
    }

    return jsonResponse({ settings: JSON.parse(result.settings || '{}') }, 200, corsHeaders);
}

// ユーザー設定保存
async function saveUserSettings(request, env, corsHeaders) {
    const { username, settings } = await request.json();

    await env.DB.prepare(`
    INSERT INTO user_settings (username, settings, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(username) 
    DO UPDATE SET settings = excluded.settings, updated_at = datetime('now')
  `).bind(username, JSON.stringify(settings)).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
}
