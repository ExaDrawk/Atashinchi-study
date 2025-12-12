# -*- coding: utf-8 -*-
"""
一問一答テキストファイルをJSONファイルに変換するスクリプト
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8')

# ソースフォルダと出力先の設定
SOURCE_BASE = r"C:\Users\PC_User\Documents\予備試験"
OUTPUT_DIR = r"C:\Users\PC_User\Desktop\Atashinchi-study\public\data\qa"

# 科目ごとのサブカテゴリ名の定義
SUBCATEGORIES = {
    "刑事訴訟法": {
        "1": "捜査",
        "2": "公訴",
        "3": "公判",
        "4": "証拠"
    },
    "民法": {
        "1": "総則",
        "2": "物権",
        "3": "債権総論",
        "4": "債権各論",
        "5": "親族・相続"
    },
    "刑法": {
        "1": "総論",
        "2": "各論"
    },
    "民事訴訟法": {
        "1": "総論・訴訟の主体",
        "2": "審理と判決",
        "3": "複雑訴訟・上訴"
    },
    "憲法": {
        "1": "人権総論",
        "2": "精神的自由権",
        "3": "経済的自由権・社会権",
        "4": "統治"
    },
    "商法": {
        "1": "総則・商行為",
        "2": "会社法総論・株式",
        "3": "機関",
        "4": "資金調達・組織再編",
        "5": "設立・その他"
    },
    "行政法": {
        "1": "行政法総論",
        "2": "行政救済法"
    }
}


def detect_and_read_file(file_path):
    """ファイルの内容を適切なエンコーディングで読み取る"""
    # まずutf-8を試す
    encodings = ['utf-8', 'utf-8-sig', 'cp932', 'shift_jis']
    
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
            # 正常に読めたらチェック（日本語が含まれているか確認）
            if any(ord(c) > 127 for c in content[:100]):
                return content, enc
        except (UnicodeDecodeError, UnicodeError):
            continue
    
    # 最後の手段としてcp932でエラーを置換して読む
    with open(file_path, 'rb') as f:
        raw_data = f.read()
    return raw_data.decode('cp932', errors='replace'), 'cp932-replace'


def add_blanks_to_answer(answer, question_text):
    """回答をそのまま返す（空欄追加なし）"""
    if not answer or not answer.strip():
        return answer
    
    # 空欄を追加せずそのまま返す
    return answer


def add_blanks_to_answer_disabled(answer, question_text):
    """回答に{{}}の空欄を追加する（司法試験知識の理解に重要な箇所に）- 無効化"""
    if not answer or not answer.strip():
        return answer
    
    # 既に{{}}がある場合は処理しない
    if '{{' in answer:
        return answer
    
    result = answer
    blanks_added = 0
    max_blanks = 5  # 最大5箇所まで
    
    # 重要度順のパターン
    patterns = [
        # 1. カギ括弧内のテキスト（重要な法律用語）
        (r'「([^」]{3,30})」', 2),
        
        # 2. 学説・判例名
        (r'((?:通説|有力説|判例|多数説|少数説|反対説))', 1),
        
        # 3. 刑事訴訟法関連
        (r'((?:令状主義|任意捜査|強制捜査|比例原則|逮捕|勾留|捜索|差押え|現行犯|準現行犯|緊急逮捕|通常逮捕|'
         r'公訴事実|訴因|一事不再理|起訴便宜主義|職権主義|当事者主義|弁論主義|処分権主義|審判対象|訴訟物|既判力|'
         r'公判手続|証拠法則|自白法則|違法収集証拠排除法則|挙証責任|証明責任|推定無罪|黙秘権|接見交通権|'
         r'被疑者|被告人|検察官|弁護人|裁判官|捜査機関|警察官|'
         r'公訴権|訴追裁量|起訴状一本主義|予断排除|冒頭陳述|論告|弁論|'
         r'証拠能力|証明力|自由心証主義|補強法則|伝聞法則|供述証拠|非供述証拠|'
         r'別件逮捕|違法収集証拠|毒樹の果実|排除法則|相当性|必要性|緊急性|'
         r'意思制圧|権利侵害|プライバシー|住居|財産|身体|自由))', 1),
        
        # 4. 民法関連
        (r'((?:善意|悪意|過失|無過失|有過失|故意|重過失|軽過失|'
         r'物権|債権|所有権|占有権|抵当権|質権|留置権|先取特権|'
         r'契約|不法行為|事務管理|不当利得|相続|遺言|'
         r'意思表示|法律行為|代理|無効|取消|詐欺|強迫|錯誤|'
         r'時効|消滅時効|取得時効|履行|債務不履行|損害賠償|'
         r'連帯債務|保証|担保|対抗要件|公示|登記|引渡し))', 1),
        
        # 5. 刑法関連
        (r'((?:構成要件|違法性|責任|故意|過失|因果関係|実行行為|結果|'
         r'正当防衛|緊急避難|正当行為|被害者の承諾|'
         r'責任能力|心神喪失|心神耗弱|違法性の意識|期待可能性|'
         r'共同正犯|教唆犯|幇助犯|間接正犯|共謀共同正犯|'
         r'未遂|予備|中止犯|不能犯|'
         r'罪刑法定主義|類推解釈|拡張解釈|法益|保護法益))', 1),
        
        # 6. 行政法関連
        (r'((?:処分|行政行為|行政処分|公定力|不可争力|不可変更力|執行力|'
         r'取消訴訟|義務付け訴訟|差止訴訟|当事者訴訟|国家賠償|損失補償|'
         r'原告適格|訴えの利益|処分性|裁量|裁量権|逸脱濫用|'
         r'行政指導|行政契約|行政計画|行政立法|通達|告示|'
         r'法律の留保|侵害留保|全部留保|権力留保))', 1),
        
        # 7. 要件・効果の内容
        (r'(①[^②③④⑤\n]{5,40})', 1),
        (r'(②[^①③④⑤\n]{5,40})', 1),
        (r'(③[^①②④⑤\n]{5,40})', 1),
    ]
    
    for pattern, priority in patterns:
        if blanks_added >= max_blanks:
            break
        
        matches = list(re.finditer(pattern, result))
        for match in matches:
            if blanks_added >= max_blanks:
                break
            
            keyword = match.group(1)
            # 既に{{}}で囲まれていないか確認
            start = match.start()
            if start >= 2 and result[start-2:start] == '{{':
                continue
            
            # 短すぎるものは除外
            if len(keyword) < 2:
                continue
            
            # カギ括弧内テキストの場合
            if pattern.startswith(r'「'):
                old_text = f'「{keyword}」'
                new_text = f'「{{{{{keyword}}}}}」'
            else:
                old_text = keyword
                new_text = '{{' + keyword + '}}'
            
            # 置換（最初の出現のみ）
            old_result = result
            result = result.replace(old_text, new_text, 1)
            if result != old_result:
                blanks_added += 1
    
    # 二重括弧を単一括弧に修正
    while '{{{{' in result:
        result = result.replace('{{{{', '{{')
    while '}}}}' in result:
        result = result.replace('}}}}', '}}')
    
    return result


def get_subcategory_num_from_filename(filename):
    """ファイル名からサブカテゴリ番号を取得"""
    match = re.match(r'^(\d+)\.', filename)
    if match:
        return match.group(1)
    return None


def parse_qa_content(content, subcategory_num):
    """テキスト内容をQ&A形式にパース"""
    questions = {}
    
    # 行に分割（\r\rも考慮）
    content = content.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')
    lines = content.split('\n')
    
    current_num = None
    current_rank = None
    current_question = None
    current_answer_lines = []
    
    # 2つのパターンに対応:
    # パターン1: "123. A　質問文" または "123. A 質問文" (刑事訴訟法など)
    # パターン2: "123.A　質問文" または "123.A 質問文" (行政法など)
    pattern1 = re.compile(r'^(\d+)\.\s*([ABC])[　\s]+(.+)$')  # スペースあり
    pattern2 = re.compile(r'^(\d+)\.([ABC])[　\s]+(.+)$')      # スペースなし
    
    for line in lines:
        line = line.strip()
        
        match = pattern1.match(line) or pattern2.match(line)
        if match:
            # 前の問題を保存
            if current_num is not None and current_question:
                answer_text = '\n'.join(current_answer_lines).strip()
                answer = add_blanks_to_answer(answer_text, current_question)
                question_id = f"{subcategory_num}-{current_num}"
                questions[question_id] = {
                    "rank": current_rank,
                    "question": current_question,
                    "answer": answer
                }
            
            # 新しい問題を開始
            current_num = match.group(1)
            current_rank = match.group(2)
            current_question = match.group(3)
            current_answer_lines = []
        elif current_num is not None and line:
            # 答えの一部として追加（空行以外）
            current_answer_lines.append(line)
    
    # 最後の問題を保存
    if current_num is not None and current_question:
        answer_text = '\n'.join(current_answer_lines).strip()
        answer = add_blanks_to_answer(answer_text, current_question)
        question_id = f"{subcategory_num}-{current_num}"
        questions[question_id] = {
            "rank": current_rank,
            "question": current_question,
            "answer": answer
        }
    
    return questions


def process_subject(subject_name, qa_folder_name):
    """科目を処理してJSONファイルを生成"""
    qa_folder_path = os.path.join(SOURCE_BASE, subject_name, qa_folder_name)
    
    if not os.path.exists(qa_folder_path):
        print(f"Folder not found: {qa_folder_path}")
        return
    
    print(f"\nProcessing: {subject_name}")
    
    # サブカテゴリごとにファイルを処理
    subcategory_questions = {}
    
    for filename in os.listdir(qa_folder_path):
        if not filename.endswith('.txt'):
            continue
        
        subcategory_num = get_subcategory_num_from_filename(filename)
        if not subcategory_num:
            continue
        
        print(f"  Reading: {filename}")
        file_path = os.path.join(qa_folder_path, filename)
        content, enc = detect_and_read_file(file_path)
        
        if content is None:
            continue
        
        print(f"    Encoding: {enc}")
        questions = parse_qa_content(content, subcategory_num)
        
        if subcategory_num not in subcategory_questions:
            subcategory_questions[subcategory_num] = {}
        subcategory_questions[subcategory_num].update(questions)
        print(f"    Parsed {len(questions)} questions")
    
    # サブカテゴリごとにJSONファイルを出力
    for subcategory_num, questions in subcategory_questions.items():
        if not questions:
            continue
        
        subcategory_name = SUBCATEGORIES.get(subject_name, {}).get(subcategory_num, f"カテゴリ{subcategory_num}")
        
        output_data = {
            "subject": subject_name,
            "version": "1.0",
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "subcategories": {
                subcategory_num: subcategory_name
            },
            "questions": questions
        }
        
        output_filename = f"{subject_name}_{subcategory_num}.json"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"  Created: {output_filename} ({len(questions)} questions)")


def main():
    """メイン処理"""
    # 出力ディレクトリの確認
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 科目ごとの一問一答フォルダ名
    subject_folders = {
        "刑事訴訟法": "一問一答刑事訴訟法",
        "民法": "一問一答民法",
        "刑法": "一問一答刑法",
        "民事訴訟法": "一問一答民事訴訟法",
        "商法": "一問一答商法",
        "行政法": "一問一答行政法",
    }
    
    for subject_name, qa_folder_name in subject_folders.items():
        process_subject(subject_name, qa_folder_name)
    
    print("\n=== Conversion complete! ===")


if __name__ == "__main__":
    main()
