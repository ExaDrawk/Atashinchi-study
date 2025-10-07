// qaDataManager.js - Q&Aデータ管理システム

/**
 * Q&Aデータ管理クラス
 * モジュールファイル内にユーザーの回答データを保存・管    /**
     * ユーザーメモの保存（無効化）
     */
    saveUserNotes(moduleId, qaId, notes) {
        console.log(`⚠️ saveUserNotes は無効化されています: ${moduleId}/Q${qaId}`);
        return true;
    }ataManager {
    constructor() {
        this.loadedModules = new Map(); // モジュールID -> モジュールデータ
        console.log('📊 Q&Aデータ管理システム初期化');
    }

    /**
     * モジュールのQ&Aデータを取得・初期化
     * @param {string} moduleId - モジュールID
     * @param {Array} questionsAndAnswers - 元のQ&Aデータ
     * @returns {Array} 拡張されたQ&Aデータ
     */
    initializeModuleQAData(moduleId, questionsAndAnswers) {
        if (!moduleId || !questionsAndAnswers) {
            console.warn('⚠️ 無効なモジュールデータ:', moduleId, questionsAndAnswers);
            return questionsAndAnswers || [];
        }

        console.log(`📋 Q&Aデータ初期化: ${moduleId} (${questionsAndAnswers.length}問)`);

        // 各Q&Aデータをそのまま使用（userResponseフィールドの自動追加を無効化）
        const enhancedQAData = questionsAndAnswers.map(qa => {
            const enhanced = { ...qa };
            
            // userResponseフィールドの自動追加は行わない
            // ユーザーが必要に応じてstatusフィールドのみを使用する

            return enhanced;
        });

        this.loadedModules.set(moduleId, {
            id: moduleId,
            questionsAndAnswers: enhancedQAData,
            lastUpdated: new Date().toISOString()
        });

        console.log(`✅ Q&Aデータ初期化完了: ${moduleId}`);
        return enhancedQAData;
    }

    /**
     * ユーザーの回答を記録（無効化）
     * 注：userResponseフィールドは使用しないため、この機能は無効化されています
     * statusフィールドはqaStatusSystemで管理されます
     */
    recordUserResponse(moduleId, qaId, responseData) {
        console.log(`⚠️ recordUserResponse は無効化されています: ${moduleId}/Q${qaId}`);
        console.log(`💡 statusフィールドの管理はqaStatusSystemを使用してください`);
        return true;
    }

    /**
     * Q&Aステータスを自動更新
     * @param {string} moduleId - モジュールID
     * @param {number} qaId - Q&A ID
     */
    updateQAStatus(moduleId, qaId) {
        const moduleData = this.loadedModules.get(moduleId);
        if (!moduleData) return;

        const qa = moduleData.questionsAndAnswers.find(q => q.id === qaId);
        if (!qa) return;

        const response = qa.userResponse;
        
        // スコアベースでステータス決定
        if (response.bestScore >= 80) {
            response.status = '済'; // 完了
        } else if (response.bestScore >= 50 || response.reviewCount >= 3) {
            response.status = '要'; // 要復習
        } else {
            response.status = '未'; // 未学習
        }

        // qaStatusSystemとの同期
        if (window.qaStatusSystem) {
            window.qaStatusSystem.setStatus(moduleId, qaId, response.status);
        }

        console.log(`📊 ステータス更新: ${moduleId}/Q${qaId} → ${response.status}`);
    }

    /**
     * ユーザーメモを保存
     * @param {string} moduleId - モジュールID
     * @param {number} qaId - Q&A ID
     * @param {string} notes - メモ内容
     */
    saveUserNotes(moduleId, qaId, notes) {
        const moduleData = this.loadedModules.get(moduleId);
        if (!moduleData) return false;

        const qa = moduleData.questionsAndAnswers.find(q => q.id === qaId);
        if (!qa) return false;

        qa.userResponse.notes = notes;
        this.saveToLocalStorage(moduleId);
        
        console.log(`📝 メモ保存: ${moduleId}/Q${qaId}`);
        return true;
    }

    /**
     * Q&Aの学習データを取得
     * @param {string} moduleId - モジュールID
     * @param {number} qaId - Q&A ID
     * @returns {Object} 学習データ
     */
    getQAData(moduleId, qaId) {
        const moduleData = this.loadedModules.get(moduleId);
        if (!moduleData) return null;

        return moduleData.questionsAndAnswers.find(q => q.id === qaId);
    }

    /**
     * モジュール全体の学習進捗を取得
     * @param {string} moduleId - モジュールID
     * @returns {Object} 進捗データ
     */
    getModuleProgress(moduleId) {
        const moduleData = this.loadedModules.get(moduleId);
        if (!moduleData) return null;

        const totalQA = moduleData.questionsAndAnswers.length;
        const completedQA = moduleData.questionsAndAnswers.filter(qa => 
            qa.userResponse.status === '済').length;
        const reviewQA = moduleData.questionsAndAnswers.filter(qa => 
            qa.userResponse.status === '要').length;

        return {
            total: totalQA,
            completed: completedQA,
            needReview: reviewQA,
            untouched: totalQA - completedQA - reviewQA,
            completionRate: totalQA > 0 ? Math.round((completedQA / totalQA) * 100) : 0
        };
    }

    /**
     * ローカルストレージに保存
     * @param {string} moduleId - モジュールID
     */
    saveToLocalStorage(moduleId) {
        const moduleData = this.loadedModules.get(moduleId);
        if (!moduleData) return;

        try {
            const key = `qa_data_${moduleId}`;
            const dataToSave = {
                questionsAndAnswers: moduleData.questionsAndAnswers,
                lastUpdated: moduleData.lastUpdated
            };
            
            localStorage.setItem(key, JSON.stringify(dataToSave));
            console.log(`💾 ローカルストレージ保存: ${moduleId}`);
        } catch (error) {
            console.error('❌ ローカルストレージ保存エラー:', error);
        }
    }

    /**
     * ローカルストレージから読み込み
     * @param {string} moduleId - モジュールID
     * @returns {Object|null} 保存されたデータ
     */
    loadFromLocalStorage(moduleId) {
        try {
            const key = `qa_data_${moduleId}`;
            const saved = localStorage.getItem(key);
            
            if (saved) {
                const data = JSON.parse(saved);
                console.log(`📂 ローカルストレージ読み込み: ${moduleId}`);
                return data;
            }
        } catch (error) {
            console.error('❌ ローカルストレージ読み込みエラー:', error);
        }
        
        return null;
    }

    /**
     * モジュールデータをローカルストレージと統合
     * @param {string} moduleId - モジュールID
     * @param {Array} questionsAndAnswers - 元のQ&Aデータ
     * @returns {Array} 統合されたQ&Aデータ
     */
    mergeWithLocalStorage(moduleId, questionsAndAnswers) {
        const savedData = this.loadFromLocalStorage(moduleId);
        
        if (!savedData || !savedData.questionsAndAnswers) {
            return this.initializeModuleQAData(moduleId, questionsAndAnswers);
        }

        console.log(`🔄 データ統合開始: ${moduleId}`);

        // 元データとローカルストレージデータを統合
        const mergedData = questionsAndAnswers.map(qa => {
            const savedQA = savedData.questionsAndAnswers.find(saved => saved.id === qa.id);
            
            if (savedQA && savedQA.userResponse) {
                // 保存されたユーザーレスポンスデータを使用
                return {
                    ...qa,
                    userResponse: savedQA.userResponse
                };
            } else {
                // 新しいQ&Aまたはユーザーレスポンスがない場合は初期化
                return {
                    ...qa,
                    userResponse: {
                        attempts: [],
                        bestScore: 0,
                        lastAttempt: null,
                        status: '未',
                        notes: '',
                        studyTime: 0,
                        reviewCount: 0
                    }
                };
            }
        });

        this.loadedModules.set(moduleId, {
            id: moduleId,
            questionsAndAnswers: mergedData,
            lastUpdated: new Date().toISOString()
        });

        console.log(`✅ データ統合完了: ${moduleId}`);
        return mergedData;
    }

    /**
     * 学習データをエクスポート
     * @param {string} moduleId - モジュールID
     * @returns {Object} エクスポートデータ
     */
    exportModuleData(moduleId) {
        const moduleData = this.loadedModules.get(moduleId);
        if (!moduleData) return null;

        return {
            moduleId,
            exportDate: new Date().toISOString(),
            progress: this.getModuleProgress(moduleId),
            qaData: moduleData.questionsAndAnswers.map(qa => ({
                id: qa.id,
                question: qa.question,
                userResponse: qa.userResponse
            }))
        };
    }
}

// グローバルインスタンスを作成
window.qaDataManager = new QADataManager();

export { QADataManager };
