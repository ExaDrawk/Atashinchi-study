-- D1 Database Schema for Study App
-- ユーザー、Q&A進捗、学習記録、設定を管理

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Q&A進捗テーブル
CREATE TABLE IF NOT EXISTS qa_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    module_id TEXT NOT NULL,
    qa_id INTEGER NOT NULL,
    status TEXT DEFAULT '未',
    fill_drill TEXT DEFAULT '{}',
    updated_at TEXT NOT NULL,
    UNIQUE(username, module_id, qa_id),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- 学習記録テーブル
CREATE TABLE IF NOT EXISTS study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    title TEXT,
    detail TEXT,
    module_id TEXT,
    qa_id INTEGER,
    level INTEGER,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);

-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
    username TEXT PRIMARY KEY,
    settings TEXT DEFAULT '{}',
    updated_at TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_qa_progress_username ON qa_progress(username);
CREATE INDEX IF NOT EXISTS idx_qa_progress_module ON qa_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_study_records_username ON study_records(username);
CREATE INDEX IF NOT EXISTS idx_study_records_date ON study_records(date);
