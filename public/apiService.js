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
}
