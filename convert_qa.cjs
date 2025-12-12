const fs = require('fs');
const path = require('path');

function addBlanks(text) {
    // Heuristic to add {{}} to key terms
    
    // 1. Wrap content inside 「」
    text = text.replace(/「([^」]+)」/g, '「{{$1}}」');
    
    // 2. Wrap terms before '=' (e.g. ①法的安定性=...)
    text = text.replace(/(^|\n)([①-⑩]|\(\d+\))?\s*([^=\n]+)=/g, function(match, p1, p2, p3) {
        return (p1 || '') + (p2 || '') + '{{' + p3 + '}}=';
    });
    
    return text;
}

function parseFile(filepath, subcategoryId) {
    const questions = {};
    let content;
    try {
        content = fs.readFileSync(filepath, 'utf8');
    } catch (e) {
        console.error(`Error reading file ${filepath}:`, e);
        return {};
    }
    
    const lines = content.split(/\r?\n/);
    
    let currentId = null;
    let currentRank = null;
    let currentQuestion = "";
    let currentAnswer = [];
    
    // Regex for question start: "1.B　Question..." or "1. B　Question..."
    const questionStartPattern = /^(\d+)\.\s*([A-Z])\s*(.*)/;
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        const match = line.match(questionStartPattern);
        if (match) {
            // Save previous question
            if (currentId) {
                const fullId = `${subcategoryId}-${currentId}`;
                questions[fullId] = {
                    "rank": currentRank,
                    "question": currentQuestion,
                    "answer": addBlanks(currentAnswer.join('\n').trim())
                };
            }
            
            // Start new question
            currentId = match[1];
            currentRank = match[2];
            currentQuestion = match[3].trim();
            currentAnswer = [];
        } else {
            // Append to answer
            if (currentId) {
                currentAnswer.push(line);
            }
        }
    }
    
    // Save last question
    if (currentId) {
        const fullId = `${subcategoryId}-${currentId}`;
        questions[fullId] = {
            "rank": currentRank,
            "question": currentQuestion,
            "answer": addBlanks(currentAnswer.join('\n').trim())
        };
    }
    
    return questions;
}

function main() {
    const file1 = "c:\\Users\\PC_User\\Desktop\\Atashinchi-study\\temp_1.1-86.txt";
    const file2 = "c:\\Users\\PC_User\\Desktop\\Atashinchi-study\\temp_2.1-50.txt";
    
    let allQuestions = {};
    
    // Parse file 1 (Subcategory 1)
    if (fs.existsSync(file1)) {
        const q1 = parseFile(file1, "1");
        Object.assign(allQuestions, q1);
    } else {
        console.log(`File not found: ${file1}`);
    }
    
    // Parse file 2 (Subcategory 2)
    if (fs.existsSync(file2)) {
        const q2 = parseFile(file2, "2");
        Object.assign(allQuestions, q2);
    } else {
        console.log(`File not found: ${file2}`);
    }
        
    const outputData = {
        "subject": "行政法",
        "version": "1.0",
        "lastUpdated": "2025-12-06",
        "subcategories": {
            "1": "行政法総論",
            "2": "行政救済法"
        },
        "questions": allQuestions
    };
    
    const outputPath = "c:\\Users\\PC_User\\Desktop\\Atashinchi-study\\public\\data\\qa\\行政法_1.json";
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
        
    console.log(`Successfully created ${outputPath} with ${Object.keys(allQuestions).length} questions.`);
}

main();
