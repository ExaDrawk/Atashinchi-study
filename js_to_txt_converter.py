import os
import sys
import re
import tkinter as tk
from tkinter import filedialog, messagebox
import windnd


def find_matching_delimiter(s, start_idx, open_ch, close_ch):
    """Find matching close_ch for the delimiter at start_idx (which points to open_ch).
    Handles nested delimiters and ignores characters inside single/double quotes.
    Returns index of the closing delimiter or -1 if not found."""
    i = start_idx
    n = len(s)
    if i >= n or s[i] != open_ch:
        return -1
    depth = 0
    in_single = False
    in_double = False
    escape = False
    while i < n:
        ch = s[i]
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == "'" and not in_double:
            in_single = not in_single
        elif ch == '"' and not in_single:
            in_double = not in_double
        elif not in_single and not in_double:
            if ch == open_ch:
                depth += 1
            elif ch == close_ch:
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def extract_block(content, key, open_ch='[', close_ch=']'):
    # find key occurrence
    m = re.search(rf'{re.escape(key)}\s*:', content)
    if not m:
        return ''
    # find first open_ch after m.end()
    idx = content.find(open_ch, m.end())
    if idx == -1:
        return ''
    end_idx = find_matching_delimiter(content, idx, open_ch, close_ch)
    if end_idx == -1:
        return ''
    return content[idx+1:end_idx]

def extract_value(content, key):
    # Try multiple patterns: quoted/unquoted key, quoted/unquoted value
    # 1) backtick template literal: `...` (multiline)
    pattern = rf'"{re.escape(key)}"\s*:\s*`([^`]*)`'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        return m.group(1)

    pattern = rf'{re.escape(key)}\s*:\s*`([^`]*)`'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        return m.group(1)

    # 2) "key": 'value' or "value"
    pattern = rf'"{re.escape(key)}"\s*:\s*["\']([^"\']*)["\']'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        return m.group(1)

    # 2) key: 'value' or key: "value"
    pattern = rf'{re.escape(key)}\s*:\s*["\']([^"\']*)["\']'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        return m.group(1)

    # 3) "key": unquoted (number/array/object snippet)
    pattern = rf'"{re.escape(key)}"\s*:\s*([^,}}\n]+)'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        return m.group(1).strip().strip("'\"")

    # 4) key: unquoted
    pattern = rf'{re.escape(key)}\s*:\s*([^,}}\n]+)'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        return m.group(1).strip().strip("'\"")

    return ""

def extract_array(content, key):
    # Extract array content robustly (handles nested ] inside strings)
    return extract_block(content, key, open_ch='[', close_ch=']')

def extract_object(content, key):
    # Extract object content robustly
    return extract_block(content, key, open_ch='{', close_ch='}')

def parse_js_module(js_content):
    data = {}
    
    # Title
    data['title'] = extract_value(js_content, 'title')
    
    # Citation
    data['citation'] = extract_value(js_content, 'citation')
    
    # Rank
    data['rank'] = extract_value(js_content, 'rank')
    
    # Tags
    tags_str = extract_array(js_content, 'tags')
    data['tags'] = [tag.strip().strip("'\"") for tag in tags_str.split(',') if tag.strip()]
    
    # Right Side Characters
    chars_str = extract_array(js_content, 'rightSideCharacters')
    data['rightSideCharacters'] = [char.strip().strip("'\"") for char in chars_str.split(',') if char.strip()]
    
    # Questions and Answers
    qa_pattern = r'questionsAndAnswers\s*:\s*\[([^\]]*)\]'
    qa_match = re.search(qa_pattern, js_content, re.DOTALL)
    qas = []
    if qa_match:
        qa_content = qa_match.group(1)
        # Split by }, {
        qa_items = re.split(r'}\s*,\s*{', qa_content)
        for item in qa_items:
            item = '{' + item + '}'
            qa = {}
            qa['id'] = extract_value(item, 'id')
            qa['rank'] = extract_value(item, 'rank')
            qa['question'] = extract_value(item, 'question')
            qa['answer'] = extract_value(item, 'answer')
            qa['status'] = extract_value(item, 'status')
            qa['check'] = extract_value(item, 'check')
            qas.append(qa)
    data['questionsAndAnswers'] = qas
    
    # Story (robust extraction)
    story = []
    story_block = extract_array(js_content, 'story')
    if story_block:
        content = story_block
        i = 0
        n = len(content)
        while i < n:
            # find next '{'
            idx = content.find('{', i)
            if idx == -1:
                break
            end_idx = find_matching_delimiter(content, idx, '{', '}')
            if end_idx == -1:
                break
            item_block = content[idx+1:end_idx]
            raw = '{' + item_block + '}'
            s = {}
            s['type'] = extract_value(raw, 'type')
            s['text'] = extract_value(raw, 'text')
            s['speaker'] = extract_value(raw, 'speaker')
            s['expression'] = extract_value(raw, 'expression')
            s['dialogue'] = extract_value(raw, 'dialogue')
            s['title'] = extract_value(raw, 'title')
            s['description'] = extract_value(raw, 'description')
            # For embed, content can be a string literal possibly with escaped quotes/newlines
            s['content'] = extract_value(raw, 'content')
            # Also try to extract format if present
            s['format'] = extract_value(raw, 'format')
            story.append(s)
            i = end_idx + 1
    data['story'] = story
    
    # Explanation
    exp_pattern = r'explanation\s*:\s*`([^`]*)`'
    exp_match = re.search(exp_pattern, js_content, re.DOTALL)
    if exp_match:
        data['explanation'] = exp_match.group(1)
    else:
        data['explanation'] = ""
    
    # Quiz (robust extraction)
    quizzes = []
    quiz_block = extract_array(js_content, 'quiz')
    if quiz_block:
        content = quiz_block
        i = 0
        n = len(content)
        while i < n:
            idx = content.find('{', i)
            if idx == -1:
                break
            end_idx = find_matching_delimiter(content, idx, '{', '}')
            if end_idx == -1:
                break
            item_block = content[idx+1:end_idx]
            raw = '{' + item_block + '}'
            q = {}
            q['title'] = extract_value(raw, 'title')
            q['rank'] = extract_value(raw, 'rank')
            q['background'] = extract_value(raw, 'background')
            # Sub problems: extract array block and parse each {..}
            subs = []
            sub_block = extract_array(raw, 'subProblems')
            if sub_block:
                sc = sub_block
                si = 0
                sn = len(sc)
                while si < sn:
                    sidx = sc.find('{', si)
                    if sidx == -1:
                        break
                    send = find_matching_delimiter(sc, sidx, '{', '}')
                    if send == -1:
                        break
                    sub_item_block = sc[sidx+1:send]
                    sub_raw = '{' + sub_item_block + '}'
                    sub = {}
                    sub['title'] = extract_value(sub_raw, 'title')
                    sub['rank'] = extract_value(sub_raw, 'rank')
                    # relatedQAs may be an array of numbers
                    rqas = extract_array(sub_raw, 'relatedQAs')
                    if rqas:
                        sub['relatedQAs'] = [int(x.strip()) for x in re.split(r',\s*', rqas) if x.strip()]
                    else:
                        sub['relatedQAs'] = []
                    sub['problem'] = extract_value(sub_raw, 'problem')
                    sub['hint'] = extract_value(sub_raw, 'hint')
                    sub['modelAnswer'] = extract_value(sub_raw, 'modelAnswer')
                    points_str = extract_array(sub_raw, 'points')
                    if points_str:
                        sub['points'] = [p.strip().strip("'\"") for p in points_str.split(',') if p.strip()]
                    else:
                        sub['points'] = []
                    subs.append(sub)
                    si = send + 1
            q['subProblems'] = subs
            quizzes.append(q)
            i = end_idx + 1
    data['quiz'] = quizzes
    
    # Study Records
    records_pattern = r'studyRecords\s*:\s*\[([^\]]*)\]'
    records_match = re.search(records_pattern, js_content, re.DOTALL)
    records = []
    if records_match:
        records_content = records_match.group(1)
        record_items = re.split(r'}\s*,\s*{', records_content)
        for item in record_items:
            item = '{' + item + '}'
            r = {}
            r['date'] = extract_value(item, 'date')
            r['timestamp'] = extract_value(item, 'timestamp')
            records.append(r)
    data['studyRecords'] = records
    
    return data

def format_to_txt(data):
    txt = ""
    
    # Title
    txt += f"タイトル: {data.get('title', '')}\n\n"
    
    # Citation
    txt += f"引用: {data.get('citation', '')}\n\n"
    
    # Rank
    txt += f"ランク: {data.get('rank', '')}\n\n"
    
    # Tags
    tags = data.get('tags', [])
    txt += f"タグ: {', '.join(tags)}\n\n"
    
    # Right Side Characters
    characters = data.get('rightSideCharacters', [])
    txt += f"右側キャラクター: {', '.join(characters)}\n\n"
    
    # Questions and Answers
    txt += "=== Q&A ===\n\n"
    qas = data.get('questionsAndAnswers', [])
    for qa in qas:
        txt += f"ID: {qa.get('id', '')}\n"
        txt += f"ランク: {qa.get('rank', '')}\n"
        txt += f"質問: {qa.get('question', '')}\n"
        txt += f"回答: {qa.get('answer', '')}\n\n"
    
    # Story
    txt += "=== ストーリー ===\n\n"
    story = data.get('story', [])
    for item in story:
        if item.get('type') == 'scene':
            txt += f"シーン: {item.get('text', '')}\n"
        elif item.get('type') == 'narration':
            txt += f"ナレーション: {item.get('text', '')}\n"
        elif item.get('type') == 'dialogue':
            speaker = item.get('speaker', '')
            expression = item.get('expression', '')
            dialogue = item.get('dialogue', '')
            txt += f"{speaker} ({expression}): {dialogue}\n"
        elif item.get('type') == 'embed':
            title = item.get('title', '')
            description = item.get('description', '')
            content = item.get('content', '')
            # Unescape common sequences like \n and \t for readability
            content = content.replace('\\n', '\n').replace('\\t', '\t')
            txt += f"埋め込み: {title}\n"
            if description:
                txt += f"説明: {description}\n"
            if content:
                txt += f"--- 埋め込み内容開始 ---\n{content}\n--- 埋め込み内容終了 ---\n"
        txt += "\n"
    
    # Explanation
    txt += "=== 判旨と解説 ===\n\n"
    explanation = data.get('explanation', '')
    # Remove HTML tags roughly
    explanation = re.sub(r'<[^>]+>', '', explanation)
    txt += explanation + "\n\n"
    
    # Quiz: always include when quiz array exists
    quizzes = data.get('quiz', [])
    if quizzes:
        txt += "=== ミニ論文問題 ===\n\n"
        for quiz in quizzes:
            txt += f"タイトル: {quiz.get('title', '')}\n"
            txt += f"ランク: {quiz.get('rank', '')}\n"
            txt += f"背景: {quiz.get('background', '')}\n"
            # If there are subProblems, print all their fields
            sub_problems = quiz.get('subProblems', [])
            for sub in sub_problems:
                txt += f"サブタイトル: {sub.get('title', '')}\n"
                txt += f"ランク: {sub.get('rank', '')}\n"
                txt += f"関連Q&A: {', '.join(str(x) for x in sub.get('relatedQAs', []) if x) }\n" if sub.get('relatedQAs') else ""
                txt += f"問題: {sub.get('problem', '')}\n"
                txt += f"ヒント: {sub.get('hint', '')}\n"
                txt += f"モデル回答: {sub.get('modelAnswer', '')}\n"
                points = sub.get('points', [])
                if points:
                    txt += "ポイント:\n"
                    for point in points:
                        txt += f"- {point}\n"
                    txt += "\n"
    
    # 学習記録は出力しない（ユーザー指定）
    
    return txt

def process_file(js_file_path):
    if not os.path.exists(js_file_path):
        print(f"File not found: {js_file_path}")
        return False

    try:
        with open(js_file_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
    except Exception as e:
        print(f"Failed to read file: {e}")
        return False

    data = parse_js_module(js_content)
    txt_content = format_to_txt(data)

    # Output file path: same directory, same name with .txt extension
    dir_path = os.path.dirname(js_file_path)
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    txt_file_path = os.path.join(dir_path, base_name + '.txt')

    try:
        with open(txt_file_path, 'w', encoding='utf-8') as f:
            f.write(txt_content)
    except Exception as e:
        print(f"Failed to write TXT file: {e}")
        return False

    print(f"TXT file created: {txt_file_path}")
    return True


def main():
    # CLI mode: if path passed as argument, process and exit
    if len(sys.argv) > 1:
        js_file_path = sys.argv[1]
        process_file(js_file_path)
        return

    # GUI mode with drag-and-drop
    root = tk.Tk()
    root.title('JS → TXT Converter (ドラッグ＆ドロップ)')
    root.geometry('480x200')

    frame = tk.Frame(root, relief='ridge', bd=2)
    frame.pack(fill='both', expand=True, padx=12, pady=12)

    label = tk.Label(frame, text='ここにJSファイルをドラッグ＆ドロップしてください\nまたはボタンで選択', justify='center')
    label.pack(fill='both', expand=True, padx=8, pady=8)

    def on_drop(files):
        # files is a list of bytes paths
        for f in files:
            try:
                try:
                    path = f.decode('utf-8')
                except Exception:
                    path = f.decode('mbcs')
                path = path.strip('\x00')
            except Exception:
                continue
            if os.path.isfile(path) and path.lower().endswith('.js'):
                ok = process_file(path)
                if ok:
                    messagebox.showinfo('完了', f'TXT作成しました:\n{os.path.splitext(path)[0]}.txt')
                else:
                    messagebox.showerror('エラー', f'ファイルの処理に失敗しました:\n{path}')
            else:
                messagebox.showwarning('無効', f'JSファイルを指定してください:\n{path}')

    # hook drop
    try:
        windnd.hook_dropfiles(frame, func=on_drop)
    except Exception as e:
        print('ドラッグ＆ドロップの初期化に失敗しました:', e)

    def select_file():
        file_path = filedialog.askopenfilename(filetypes=[('JavaScript files', '*.js')])
        if file_path:
            ok = process_file(file_path)
            if ok:
                messagebox.showinfo('完了', f'TXT作成しました:\n{os.path.splitext(file_path)[0]}.txt')
            else:
                messagebox.showerror('エラー', 'ファイルの処理に失敗しました。')

    btn = tk.Button(root, text='ファイルを選択', command=select_file)
    btn.pack(pady=(0,12))

    root.mainloop()


if __name__ == '__main__':
    main()
