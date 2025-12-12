#!/usr/bin/env python3
"""
Q&Aサブカテゴリファイルを科目ごとに統合するスクリプト

民法_1.json, 民法_2.json, ... → 民法.json に統合
"""

import json
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# パス設定
QA_DIR = Path(r"C:\Users\PC_User\Desktop\Atashinchi-study\public\data\qa")

def merge_qa_files():
    """サブカテゴリファイルを科目ごとに統合"""
    
    # 科目ごとにファイルをグループ化
    subject_files = defaultdict(list)
    
    for file in QA_DIR.glob("*_*.json"):
        # ファイル名から科目名を抽出（例: 民法_1.json → 民法）
        name = file.stem  # 民法_1
        parts = name.rsplit('_', 1)
        if len(parts) == 2 and parts[1].isdigit():
            subject = parts[0]  # 民法
            subcategory_id = parts[1]  # 1
            subject_files[subject].append((int(subcategory_id), file))
    
    print(f"📂 検出された科目: {list(subject_files.keys())}")
    
    for subject, files in subject_files.items():
        # サブカテゴリ番号でソート
        files.sort(key=lambda x: x[0])
        
        print(f"\n📚 {subject} を統合中...")
        
        # 統合データの初期化
        merged_data = {
            "subject": subject,
            "version": "1.0",
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "subcategories": {},
            "questions": {}
        }
        
        for subcategory_id, file_path in files:
            print(f"  📖 読み込み中: {file_path.name}")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # サブカテゴリ情報を追加
                if 'subcategories' in data:
                    merged_data['subcategories'].update(data['subcategories'])
                
                # 質問を追加
                if 'questions' in data:
                    for qid, qa in data['questions'].items():
                        merged_data['questions'][qid] = qa
                        
            except Exception as e:
                print(f"    ⚠️ エラー: {e}")
        
        # 統合ファイルを保存
        output_path = QA_DIR / f"{subject}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ 保存完了: {output_path.name} ({len(merged_data['questions'])}問)")


if __name__ == "__main__":
    print("=" * 50)
    print("Q&Aファイル統合スクリプト")
    print("=" * 50)
    
    merge_qa_files()
    
    print("\n" + "=" * 50)
    print("✅ 統合完了！")
    print("=" * 50)
