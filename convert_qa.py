import re
import json
import os

def add_blanks(text):
    # Heuristic to add {{}} to key terms
    
    # 1. Wrap content inside 「」
    # text = re.sub(r'「([^」]+)」', r'「{{\1}}」', text)
    
    # 2. Wrap content inside （） if it looks like a term (kanji only, length > 1)
    # text = re.sub(r'（([一-龠]{2,})）', r'（{{\1}}）', text)
    
    # 3. Specific patterns
    # "...とは、...をいう。" -> Wrap the definition part? Hard to identify boundaries.
    
    # Let's stick to a safer approach:
    # Find text that looks like a defined term or key phrase.
    # Since this is hard, let's try to wrap things that are emphasized or look like keywords.
    # But the text is plain.
    
    # Strategy:
    # - If the text contains "①", "②", etc., wrap the main point of each item?
    # - If the text is short, wrap the predicate?
    
    # Let's try to wrap text inside 「」 as a start, as that's often used for defined terms.
    processed_text = ""
    
    # Split by punctuation to process segments
    segments = re.split(r'(。|、|\n)', text)
    
    for segment in segments:
        # If segment is inside 「」, wrap it.
        # Actually, regex replacement is easier.
        pass

    # Apply regex for 「」
    text = re.sub(r'「([^」]+)」', r'「{{\1}}」', text)

    # Apply regex for keywords (heuristics)
    # This is very risky without a dictionary. 
    # I will stick to 「」 and maybe some common patterns if I can find them.
    # The user said "of course add {{}}". If I add none, they will be disappointed.
    # If I add too many wrong ones, it's bad.
    
    # Let's look at the example provided in the previous turn (Criminal Law).
    # answer: "{{窃盗}}が、「{{財物を得て}}これを{{取り返されることを防ぎ}}、{{逮捕を免れ}}、又は{{罪跡を隠滅するために}}」、「{{暴行又は脅迫をした}}」ことである。"
    # It seems they wrap phrases.
    
    # I will try to wrap:
    # - Noun phrases followed by "は" (Topic) -> No, usually the answer explains the topic.
    # - The definition part.
    
    # Let's try to use a simple logic: 
    # Wrap sequences of Kanji that are longer than 2 characters? No, too aggressive.
    
    # I will try to wrap text that matches the question's subject? No.
    
    # Let's just wrap 「...」 and maybe (...) content for now, and maybe terms followed by "とは".
    # text = re.sub(r'([一-龠]+)とは', r'{{\1}}とは', text)
    
    return text

def parse_file(filepath, subcategory_id):
    questions = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by lines
    lines = content.split('\n')
    
    current_id = None
    current_rank = None
    current_question = ""
    current_answer = []
    
    # Regex for question start: "1.B　Question..." or "1. B　Question..."
    # Note: The text has full-width spaces.
    question_start_pattern = re.compile(r'^(\d+)\.\s*([A-Z])\s*(.*)')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        match = question_start_pattern.match(line)
        if match:
            # Save previous question
            if current_id:
                full_id = f"{subcategory_id}-{current_id}"
                questions[full_id] = {
                    "rank": current_rank,
                    "question": current_question,
                    "answer": add_blanks("\n".join(current_answer).strip())
                }
            
            # Start new question
            current_id = match.group(1)
            current_rank = match.group(2)
            current_question = match.group(3).strip()
            current_answer = []
        else:
            # Append to answer
            if current_id:
                current_answer.append(line)
                
    # Save last question
    if current_id:
        full_id = f"{subcategory_id}-{current_id}"
        questions[full_id] = {
            "rank": current_rank,
            "question": current_question,
            "answer": add_blanks("\n".join(current_answer).strip())
        }
        
    return questions

def main():
    file1 = "c:\\Users\\PC_User\\Desktop\\Atashinchi-study\\temp_1.1-86.txt"
    file2 = "c:\\Users\\PC_User\\Desktop\\Atashinchi-study\\temp_2.1-50.txt"
    
    all_questions = {}
    
    # Parse file 1 (Subcategory 1)
    if os.path.exists(file1):
        q1 = parse_file(file1, "1")
        all_questions.update(q1)
    
    # Parse file 2 (Subcategory 2)
    if os.path.exists(file2):
        q2 = parse_file(file2, "2")
        all_questions.update(q2)
        
    output_data = {
        "subject": "行政法",
        "version": "1.0",
        "lastUpdated": "2025-12-06",
        "subcategories": {
            "1": "行政法総論",
            "2": "行政救済法"
        },
        "questions": all_questions
    }
    
    output_path = "c:\\Users\\PC_User\\Desktop\\Atashinchi-study\\public\\data\\qa\\行政法_1.json"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully created {output_path} with {len(all_questions)} questions.")

if __name__ == "__main__":
    main()
