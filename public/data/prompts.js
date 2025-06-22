// public/data/prompts.js

import { characters, COMMON_EXPRESSIONS } from './characters.js';
import { getGlobalHonorificRulesAsText, getGlobalRulesAsText, getStoryContextRulesAsText } from './characters.js';

// --- ペルソナ生成用の補助関数群 ---

/**
 * キャラクターのペルソナに基づき、口調の説明を生成する
 * @param {object} char - キャラクターオブジェクト
 * @returns {string} 口調の説明文
 */
function generateToneDescription(char) {
    if (char.name === '母') return '情熱的で、時にせっかちな早口になる。鼻歌をよく歌う。';
    if (char.name === 'ユズヒコ') return '基本的に無口でぶっきらぼうだが、論理的な説明をする際は冷静で淡々とした口調になる。';
    if (char.name === 'しみちゃん') return '常に冷静で大人びており、落ち着いたトーンで話す。';
    if (char.name === '岩城くん') return '物静かで、少し独特の間を持った話し方をする。';
    if (char.name === '吉岡') return '明るく自信家で、みかんをからかうような悪戯っぽい口調。';
    return 'キャラクターの性格に合わせた自然な口調。';
}

/**
 * キャラクター間の人間関係と呼称を説明する文を生成する
 * @param {object} char - 対象キャラクター
 * @param {Array<string>} allCharacterNames - シナリオ登場人物全員の名前
 * @returns {string} 人間関係の説明文
 */
function generateRelationshipDescription(char, allCharacterNames) {
    let description = '';
    if (char.name === '吉岡' && allCharacterNames.includes('みかん')) {
        description += 'みかんのことは「タチバナ」と呼び捨てにする。';
    }
    if (char.name === '岩城くん' && allCharacterNames.includes('みかん')) {
        description += 'みかんのことは敬意を込めて「タチバナさん」と呼ぶ。';
    }
    if (char.name === 'しみちゃん' && allCharacterNames.includes('みかん')) {
        description += '親友であるみかんのことは「みかん」と呼ぶ。';
    }
    if (char.name === 'ユズヒコ' && allCharacterNames.includes('みかん')) {
        description += '姉であるみかんのことは「姉ちゃん」と呼ぶ。';
    }
    return description || '特記事項なし。';
}

/**
 * キャラクターの行動原理を説明する文を生成する
 * @param {object} char - キャラクターオブジェクト
 * @returns {string} 行動原理の説明文
 */
function generateMotivation(char) {
    if (char.lawExpertise) {
        return `自身の専門分野である「${char.lawExpertise}」に関する話題では、知識を披露し、議論を主導しようとする。`;
    }
    if (char.name === 'みかん') {
        return '基本的に受け身で、専門的な会話には素朴な疑問を投げかけることで議論を深める役割を担う。';
    }
    return '他のキャラクターの発言に自然に反応し、会話を繋げる。';
}

/**
 * AIに具体的な話し方を学習させるためのセリフ例（Few-shot）を生成する
 * @param {object} char - キャラクターオブジェクト
 * @returns {string} セリフの例
 */
function generateDialogueExample(char) {
    switch (char.name) {
        case 'みかん': return '「へえー、そうなんだ！でも、それってどういうこと？」';
        case 'ユズヒコ': return '「はぁ…。姉ちゃん、それは基本だよ。」';
        case '母': return '「まあ、お母さんには難しいことは分からないけどさ！」';
        case '父': return '「はっはっは、なるほどな。」';
        case '吉岡': return '「甘いな、タチバナ。会社法の基本だぜ。」';
        case '岩城くん': return '「…なるほど。そういう考え方もあるんだな、タチバナさん。」';
        case 'しみちゃん': return '「みかん、落ち着いて。条文をもう一度よく読んでみましょう。」';
        default: return '「なるほど。」';
    }
}

/**
 * 登場人物リストに基づき、各キャラクターの詳細なペルソナ指示を生成する関数
 * @param {Array<string>} characterNames - 今回のシナリオに登場するキャラクター名の配列
 * @returns {string} - AIプロンプトに埋め込むための、全登場人物の詳細なペルソナ定義テキスト
 */
export function generateCharacterPersonaPrompt(characterNames) {
  let personaPrompts = '## 登場人物の詳細ペルソナ（最優先で遵守すること）\n';

  characterNames.forEach(name => {
    const char = characters.find(c => c.name === name);
    if (!char) return;

    personaPrompts += `
### ペルソナ: ${char.name}
- **基本プロフィール**: ${char.age || ''} ${char.persona.split('。')[0]}。
- **性格**: ${char.persona}
- **口調・語彙**: ${generateToneDescription(char)}
- **人間関係と呼称**: ${generateRelationshipDescription(char, characterNames)}
- **行動原理**: ${generateMotivation(char)}
- **セリフ例（Few-shot）**: ${generateDialogueExample(char)}
---
`;
  });

  return personaPrompts;
}


// --- メインのプロンプト生成関数 ---

/**
 * AIへの初回指示（マスタープロンプト）を生成する関数
 * @param {string} userInput - ユーザーの初期答案
 * @param {string} problemText - 問題文
 * @param {string} modelAnswer - 模範解答の骨子
 * @param {object} storyData - モジュールの全データ
 * @returns {string} - AIに渡すための完全な指示文字列
 */
export function generateInitialPrompt(userInput, problemText, modelAnswer, storyData) {
  const characterNames = [...new Set(storyData.story.filter(s => s.type === 'dialogue').map(s => s.speaker))];
  
  return `# 指示：あなたは『あたしンち』の優秀な脚本家 兼 司法試験の指導講師です

# 【事前知識（必ず参照すること）】
${storyData.knowledgeBox || ''}

# 【第一部：登場人物の完全理解】
以下の登場人物たちのペルソナを**完全に理解し、なりきって**ください。これは、この後の脚本執筆における絶対的な憲法となります。
${generateCharacterPersonaPrompt(characterNames)}

# 【第二部：今回の脚本シナリオ】
上記のペルソナを踏まえ、以下のシナリオで会話劇を生成してください。

## シナリオ概要
-   これから生成するのは、ユーザーの答案に対する**導入から採点までを完結させた、一つの完全な会話劇**です。
-   目的は、一方的な解説ではなく、対話を通じて学習者に「気づき」を与えることです。

## 材料
-   **ユーザーの答案**: ${userInput}
-   **問題文**: ${problemText}
-   **模範解答の骨子**: ${modelAnswer}

## 場所設定とナレーション（最重要）
- **会話開始前に必須**: 現在の場所と雰囲気を簡潔にナレーションとして最初に出力してください
- **ナレーション形式**: 【ナレーション】で囲んで出力し、必ず改行してからキャラクターのセリフを開始してください
- **内容**: 場所の特徴や雰囲気を1-2文で表現し、キャラクターのセリフとは明確に区別してください
- **重要**: ナレーション部分は絶対にキャラクター名として認識されないよう、【ナレーション】形式を厳守してください
- **例**: 
  【ナレーション】タチバナ家のリビングでは、いつものように家族の賑やかな声が響いている。
  ユズヒコ@呆れ: また姉ちゃんが何か騒いでるよ...---

## 今回の脚本構成（絶対厳守）
1.  **導入と採点 (2〜3往復)**:
    -   会話の**冒頭**で、法律に詳しいキャラクター（ユズヒコ、しみちゃん等）の一人が、「この答案、ざっと見たけど、まず点数から言うと**XX点**かな。理由はね…」のように、**最初に点数を自然に告げてください。**
    -   点数は必ず太字で出力してください。

2.  **多角的な検討 (6〜10往復)**:
    -   点数の理由について、法律に詳しいキャラクター達が、答案の良い点や改善点を、具体的な論点を挙げながら徹底的に議論してください。
    -   専門家ではないキャラクター（みかん、母等）は、その議論に対して「それってどういうこと？」「もっと分かりやすく言うと？」のような素朴な質問を投げかける役に徹してください。

3.  **採点基準（AIの内部評価用・会話には出さない）**:
    -   以下の基準で点数を内部的に算出し、セリフに反映させてください。キャラクターにこの基準をそのまま言わせる必要はありません。
    -   **論点の把握（30点）**
    -   **法的知識（25点）**
    -   **論理構成（25点）**
    -   **結論の妥当性（20点）**

4.  **自然な締めくくり**:
    -   議論が一通り終わったら、「次回はこの点を意識するともっと良くなるわね」のような、次につながるアドバイスで会話を自然に締めくくってください。

# 【第三部：マスター・ルール】
上記の執筆にあたり、以下のルールを厳守してください。

## 1. 絶対禁止事項
-   **機械的な応答**: 「採点を開始します」「あなたの答案は…」のような、システムやAIであることを感じさせる無機質なセリフは絶対に禁止です。
-   **カギ括弧\`「」\`の使用**: 全てのセリフにおいて、カギ括弧\`「」\`やその他の引用符は一切使用しないでください。
-   **キャラクターの役割崩壊**: 各キャラクターに設定された役割（専門性や性格）を無視した言動は絶対にさせないでください。
-   **ルールの棒読み**: 「採点基準は…」のように、ルールをそのまま読み上げる行為は不自然であり、絶対に禁止です。
## 2. 出力形式の厳守（ゼロ・トレランス・ポリシー）
-   **基本形式**: 必ず \`キャラクター名@表情: セリフ内容---\` の形式で出力してください。
-   **表情指定**: 以下の表情のみを使用してください：${COMMON_EXPRESSIONS.join(', ')}
-   **表情選択のガイドライン**:
    - セリフの内容や文脈に適した表情を選択してください
    - 指定した画像が存在しない場合は自動的にnormalが表示されます
    - 迷った場合はnormalを使用してください
-   **絶対禁止**: キャラクター名を省略し、\`@表情: セリフ内容---\` のように出力することは、いかなる理由があっても絶対に禁止します。
-   **【罰則】**: この形式に違反した出力は、システムによって即座にエラーとして破棄されます。一字一句、細心の注意を払って形式を遵守してください。

-   **正しい例**: 
    ユズヒコ@surprised: か、川島さん！なんでここに！？---
    みかん@blush: えっと、その…よろしくお願いします---
    母@angry: もう！だから言ったでしょ！---

-   **悪い例（絶対に禁止）**:
    @surprised: か、川島さん！なんでここに！？---
    ユズヒコ: か、川島さん！なんでここに！？---
    ユズヒコ@invalid_expression: こんな表情は存在しません---

## 3. 会話生成の基本原則
-   **自然な会話**: 登場人物たちが、本当にその場で雑談しながら思考しているような、自然でリアルな会話の流れを最優先してください。
-   **多様な応答**: 同じような相槌や質問を繰り返さず、各キャラクターがユニークな視点から発言するようにしてください。
-   **重複の回避**: 同じキャラクターが連続で発言したり、酷似した内容のセリフを繰り返したりすることは避けてください。

## 4. キャラクターとペルソナに関するルール
-   **【敬語の基本ルール】**:
    ${getGlobalHonorificRulesAsText()}
-   **【場所と関係性の一般ルール】**:
    ${getGlobalRulesAsText()}
-   **【最重要・個別ペルソナの優先】**:
    上記の基本ルール（一般法）よりも、\`characters.js\`に定義された各キャラクターの\`persona\`に記述された、**性格、口調、そして特に「他のキャラクターの呼び方」に関する個別ルールを、何よりも最優先**してください。これは「特別法は一般法に優先する」の原則と同じです。
-   **【呼び方の重要ルール】**:
    - 山下、川島、須藤、石田ゆりなどユズヒコのクラスメートは、ユズヒコを「ユズピ」と呼ぶ
    - みかんはユズヒコを「ユズ」と呼ぶ
    - 母はユズヒコを「ユズ」「ユーちゃん」と呼ぶ
    - 吉岡はみかんを「タチバナ」と呼ぶ
    - 岩城はみかんを「タチバナさん」と呼ぶ
-   **【今回のシナリオ固有のルール】**:
    ${getStoryContextRulesAsText(storyData)}

**上記の全ルールを遵守し、最高の会話劇を一度の応答で完全に生成してください。**`;
}
