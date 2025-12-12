// apiService.js - API通信専用モジュール

export class ApiService {
    // ★★★ 法令名をserver.jsから取得 ★★★
    static async loadSupportedLaws() {
        try {
            console.log('🔄 法令名を取得中...');
            const response = await fetch('/api/supported-laws');
            if (response.ok) {
                const data = await response.json();
                let supportedLaws = data.supportedLaws || [];

                // ★★★ 憲法を確実に含める ★★★
                if (!supportedLaws.includes('日本国憲法')) {
                    supportedLaws.push('日本国憲法');
                }
                if (!supportedLaws.includes('憲法')) {
                    supportedLaws.push('憲法');
                }

                console.log(`✅ 対応法令を取得: ${supportedLaws.length}件`, supportedLaws);
                return supportedLaws;
            } else {
                console.warn(`⚠️ API応答エラー: ${response.status}`);
                return this.getFallbackLaws();
            }
        } catch (error) {
            console.error('❌ 法令名取得エラー:', error);
            return this.getFallbackLaws();
        }
    }

    // ★★★ フォールバック法令名 ★★★
    static getFallbackLaws() {
        const fallbackLaws = [
            '民法', '会社法', '刑法', '商法', '民事訴訟法', '刑事訴訟法',
            '行政法', '日本国憲法', '憲法', '労働基準法', '独占禁止法'
        ];
        console.warn('⚠️ 法令名をフォールバックで設定:', fallbackLaws);
        return fallbackLaws;
    }

    // ★★★ 学習履歴の取得 ★★★
    static async fetchCaseLearningLogs(caseId, problemType, problemIndex) {
        try {
            const indexParam = (problemIndex !== null && problemIndex !== undefined && problemIndex !== '') ? `/${problemIndex}` : '';
            const apiUrl = `/api/get-case-learning-logs/${caseId}/${problemType}${indexParam}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status}`);
            }
            const result = await response.json();
            return result.success ? result.logs : [];
        } catch (error) {
            console.error('学習履歴の取得に失敗:', error);
            return [];
        }
    }

    // ★★★ 民法全文の取得 ★★★
    static async fetchMinpoFullText() {
        try {
            const response = await fetch('/api/minpo-formatted-text');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`APIエラー: ${response.status} - ${errorText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('民法全文の取得に失敗:', error);
            throw error;
        }
    }

    static async generateQAFillTemplate({ relativePath, qaId, level, forceRefresh = false, historySnapshot, standaloneQA, referenceMaterial }) {
        const payload = {
            relativePath,
            qaId,
            level,
            forceRefresh
        };

        if (historySnapshot) {
            payload.historySnapshot = historySnapshot;
        }

        // ★★★ スタンドアロンQ&Aデータを含める ★★★
        if (standaloneQA) {
            payload.standaloneQA = standaloneQA;
        }

        // ★★★ 参考資料を含める ★★★
        if (referenceMaterial) {
            payload.referenceMaterial = referenceMaterial;
        }

        const response = await fetch('/api/qa-fill/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            const message = data?.error || `テンプレート生成に失敗しました (${response.status})`;
            throw new Error(message);
        }

        return data;
    }

    static async gradeQAFillAnswers({ relativePath, qaId, level, template, answers, standaloneQA, characters, referenceMaterial }) {
        const payload = { relativePath, qaId, level, template, answers };

        // ★★★ スタンドアロンQ&Aデータを含める ★★★
        if (standaloneQA) {
            payload.standaloneQA = standaloneQA;
        }

        // ★★★ キャラクター情報を含める ★★★
        if (characters && characters.length > 0) {
            payload.characters = characters;
        }

        // ★★★ 参考資料を含める ★★★
        if (referenceMaterial) {
            payload.referenceMaterial = referenceMaterial;
        }

        const response = await fetch('/api/qa-fill/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            const message = data?.error || `採点リクエストに失敗しました (${response.status})`;
            throw new Error(message);
        }

        return data;
    }

    static async addStudyRecordEntry(payload) {
        const response = await fetch('/api/add-study-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            const message = data?.error || `学習記録の保存に失敗しました (${response.status})`;
            throw new Error(message);
        }

        return data;
    }

    static async fetchQaProgress(relativePath) {
        if (!relativePath) {
            throw new Error('relativePath is required to fetch QA progress');
        }
        const query = new URLSearchParams({ relativePath }).toString();
        const response = await fetch(`/api/qa-progress?${query}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            const message = data?.error || `Q&A進捗の取得に失敗しました (${response.status})`;
            throw new Error(message);
        }
        return data;
    }

    static async saveQaProgress(relativePath, qaData) {
        if (!relativePath) {
            throw new Error('relativePath is required to save QA progress');
        }
        if (!Array.isArray(qaData) || qaData.length === 0) {
            throw new Error('qaData must be a non-empty array');
        }
        const response = await fetch('/api/qa-progress/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ relativePath, qaData })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            const message = data?.error || `Q&A進捗の保存に失敗しました (${response.status})`;
            throw new Error(message);
        }
        return data;
    }
}
