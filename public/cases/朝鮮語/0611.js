export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "korean-grammar-indirect-speech-1",
  title: "【韓国語文法】間接話法と疑問詞の使い分け",
  category: "korean",
  citation: "JLPT N4リーディング対応",
  rank: "A",
  tags: ["韓国語", "間接話法", "疑問詞", "省略形", "不定表現"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `【間接話法の省略形】\n- **「고 하」の省略**: 伝達動詞하다の場合、「고하」を省略可能\n- **基本形→省略形**: 다고 해요 → 대요、라고 해요 → 래요【id:1】\n- **命令文の省略**: (으)라고 해요 → (으)래요【id:2】\n- **勧誘文の省略**: 자고 해요 → 재요【id:3】\n\n【疑問詞の二重用法】\n- **疑問用法**: 누가 왔어요? (誰が来ましたか？) - 下降調\n- **不定用法**: 누가 왔어요? (誰か来ましたか？) - 上昇調【id:4】\n- **明確な不定表現**: 疑問詞 + ㄴ가/은가/인가【id:5】\n\n【よく使う疑問詞】\n- 누구 (誰) → 누군가 (誰か)\n- 무엇/뭐 (何) → 무언가/뭔가 (何か)\n- 언제 (いつ) → 언젠가 (いつか)\n- 어디 (どこ) → 어딘가 (どこか)【id:6】`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'A', 
      question: '間接話法「다고 해요」の省略形を作りなさい。', 
      answer: '{{대요}}となる。例：비가 온다고 해요 → {{비가 온대요}} (雨が降るそうです)' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '命令文「(으)라고 해요」の省略形を説明しなさい。', 
      answer: '{{(으)래요}}となる。例：가라고 해요 → {{가래요}} (行けって)、먹으라고 해요 → {{먹으래요}} (食べろって)' 
    },
    { 
      id: 3, 
      rank: 'B', 
      question: '勧誘文「자고 해요」の省略形を作りなさい。', 
      answer: '{{재요}}となる。例：같이 가자고 해요 → {{같이 가재요}} (一緒に行こうって)' 
    },
    { 
      id: 4, 
      rank: 'S', 
      question: '疑問詞の疑問用法と不定用法の違いを説明しなさい。', 
      answer: '疑問用法は{{下降調}}で「누가 왔어요?」(誰が来ましたか？)、不定用法は{{上昇調}}で「누가 왔어요?」(誰か来ましたか？)となる。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '明確な不定表現を作る方法を述べなさい。', 
      answer: '疑問詞に{{ㄴ가/은가/인가}}を付ける。누구 → {{누군가}}、무엇 → {{무언가}}、언제 → {{언젠가}}' 
    },
    { 
      id: 6, 
      rank: 'B', 
      question: '「어디」の不定形「어딘가」を使った例文を作りなさい。', 
      answer: '{{어딘가 놀러 가고 싶어요}} (どこか遊びに行きたいです)、{{어딘가에서 만났어요}} (どこかで会いました)' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'タチバナ家のリビング。夕食後、みかんが韓国語の宿題に取り組んでいる' },
    { type: 'narration', text: 'みかんは韓国語の教科書を開き、複雑な文法に頭を悩ませていた' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'う〜ん、この間接話法の省略形って何？「다고 해요」が「대요」になるって書いてあるけど、なんで？【id:1】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '姉ちゃん、それは韓国語でよく使われる省略形だよ。会話では長い形より短い形の方が自然なんだ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'ユズ、韓国語も詳しいの？すごいじゃない！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '少しだけね。例えば「비가 온다고 해요」(雨が降ると言います)は「비가 온대요」(雨が降るそうです)って短くできる' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'へえ〜、でもなんで省略するの？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '韓国語は会話のリズムを大切にするから、長い表現は省略して話しやすくするんだ' },
    { type: 'narration', text: 'その時、玄関のチャイムが鳴った。みかんの友人のしみちゃんが遊びに来たのだ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'あ、しみちゃんだ！' },
    { type: 'scene', text: 'タチバナ家のリビング。しみちゃんが加わって勉強会に' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'こんばんは。韓国語の勉強してるのね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'しみちゃん！ちょうど良かった。韓国ドラマが好きなしみちゃんなら、この文法分かるかも' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'どんな文法？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '間接話法の省略形と、疑問詞の使い分けです' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: 'ユズヒコくん、詳しいのね。確かに韓国ドラマでもよく聞くわ' },
    
    { type: 'embed', format: 'mermaid', title: '間接話法の省略パターン', description: '基本形から省略形への変化', content: 'graph LR\n    A[다고 해요] --> B[대요]\n    C[라고 해요] --> D[래요]\n    E[자고 해요] --> F[재요]\n    G[냐고 해요] --> H[냬요]' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'なるほど、パターンがあるのね。でも、この疑問詞の使い方が分からない…【id:4】' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '疑問詞は面白いのよ。同じ「누가 왔어요?」でも、イントネーションで意味が変わるの' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'そうそう！下がる調子で言うと「誰が来ましたか？」、上がる調子で言うと「誰か来ましたか？」になる' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'え〜！同じ文なのに意味が違うの？韓国語って奥が深いなあ' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '実際に例文で練習してみましょう' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'え〜っと…「友達が映画を見に行こうと言ってた」って韓国語でなんて言うの？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '「친구가 영화를 보러 가자고 했어」だね。でも会話では「친구가 영화를 보러 가재」って省略する【id:3】' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: 'ユズヒコくん、すごいじゃない。正確よ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'わあ、だんだん分かってきた！じゃあ「何か食べたい」は？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '「뭔가 먹고 싶어」だね。「뭔가」は「무언가」の省略形で「何か」という意味【id:5】' },
    
    { type: 'embed', format: 'html', title: '疑問詞の不定表現一覧', description: '疑問詞から不定表現への変化', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px;">疑問詞</th><th style="padding: 12px; font-size: 12px;">不定表現</th><th style="padding: 12px; font-size: 12px;">意味</th><th style="padding: 12px; font-size: 12px;">例文</th></tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">누구</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">누군가</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">誰か</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">누군가 왔어요</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">무엇/뭐</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">무언가/뭔가</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">何か</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">뭔가 이상해요</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">언제</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">언젠가</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">いつか</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">언젠가 가보고 싶어요</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">어디</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">어딘가</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">どこか</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">어딘가 놀러 가자</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '表を見ると分かりやすいわね。疑問詞に「ㄴ가」や「인가」を付けると不定の意味になる' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'なるほど〜。でも実際の会話ではどう使い分けるの？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '例えば、ドアをノックする音が聞こえた時、「누가 왔어요?」(誰か来ましたか？)って上がり調子で言うんだ' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'そして、実際にドアを開けて人を見た時は「누가 왔어요?」(誰が来ましたか？)って下がり調子で聞くのね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'わあ！すごく分かりやすい説明！韓国語って面白いね' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '命令文の省略も覚えておくといいよ。「가라고 해요」は「가래요」(行けって)になる【id:2】' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: 'ユズヒコくん、本当に詳しいのね。私も勉強になったわ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'excited', dialogue: 'じゃあ、実際に練習してみよう！「お母さんが早く帰って来いって言ってた」は？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '「엄마가 빨리 돌아오라고 했어」だけど、省略すると「엄마가 빨리 돌아오래」だね' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'happy', dialogue: '完璧！みかんも韓国語が上達しそうね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'ありがとう、二人とも！これで韓国ドラマももっと理解できそう！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '韓国語は練習が大切だから、毎日少しずつでも続けるといいよ' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'そうね。私も韓国ドラマを見る時、今日習った文法を意識してみるわ' },
    { type: 'narration', text: '三人は韓国語の奥深さを実感しながら、楽しく勉強を続けた' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">韓国語間接話法と疑問詞の完全理解</h3>
    <p class="mb-4">韓国語の間接話法は日常会話で頻繁に使用される重要な文法項目です。特に省略形は自然な韓国語を話すために必須の知識となります。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">間接話法の省略パターン</h4>
    <p class="mb-4">基本的な間接話法「고 하다」は、会話では大幅に省略されます。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">平叙文</span>：다고 해요 → 대요（〜だそうです）</li>
      <li><span class="text-red-600 font-bold">命令文</span>：(으)라고 해요 → (으)래요（〜しろって）</li>
      <li><span class="text-red-600 font-bold">勧誘文</span>：자고 해요 → 재요（〜しようって）</li>
      <li><span class="text-red-600 font-bold">疑問文</span>：냐고 해요 → 냬요（〜かって）</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">疑問詞の二重機能</h4>
    <p class="mb-4">韓国語の疑問詞は、イントネーションによって疑問と不定の両方の意味を表現できます。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-blue-600 font-bold">疑問用法（下降調）</span>：具体的な情報を求める質問</li>
      <li><span class="text-green-600 font-bold">不定用法（上昇調）</span>：「〜か」という不確定な状況を表現</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">明確な不定表現</h4>
    <p class="mb-4">疑問詞に「ㄴ가/은가/인가」を付けることで、明確に不定の意味を表現できます。</p>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">学習ポイント</h5>
      <p>省略形は韓国語会話の自然さを大きく左右します。特に「대요」「래요」「재요」は日常会話で非常に頻繁に使用されるため、確実に習得しましょう。また、疑問詞の不定用法は韓国語特有の表現方法なので、イントネーションと合わせて練習することが重要です。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "韓国語間接話法と疑問詞の実践問題",
      rank: "A",
      background: `みかんは韓国人の友人ユジンとカカオトークでやり取りをしています。ユジンから送られてきたメッセージを理解し、適切な韓国語で返事をする必要があります。また、みかんが日本語で考えた内容を自然な韓国語の間接話法や疑問詞を使って表現する場面も含まれています。`,
      subProblems: [
        {
          title: "間接話法の省略形変換",
          rank: "A",
          relatedQAs: [1, 2, 3],
          problem: "以下の韓国語文を省略形に変換し、日本語訳も付けなさい。\n1. 친구가 내일 만나자고 했어요.\n2. 선생님이 숙제를 하라고 하셨어요.\n3. 엄마가 비가 온다고 하셨어요.",
          hint: "자고 해요 → 재요、라고 해요 → 래요、다고 해요 → 대요",
          points: ["正確な省略形への変換", "自然な日本語訳", "文脈に応じた適切な敬語使用"],
          modelAnswer: "1. 친구가 내일 만나재요. (友達が明日会おうって言いました)\n2. 선생님이 숙제를 하래요. (先生が宿題をしろっておっしゃいました)\n3. 엄마가 비가 온대요. (お母さんが雨が降るっておっしゃいました)"
        },
        {
          title: "疑問詞の用法判別",
          rank: "B",
          relatedQAs: [4, 5, 6],
          problem: "次の韓国語文が疑問用法か不定用法かを判別し、それぞれの日本語訳を書きなさい。また、明確な不定表現に書き換えなさい。\n1. 누가 전화했어요? (下降調)\n2. 누가 전화했어요? (上昇調)\n3. 언제 갈 거예요? (下降調)\n4. 언제 갈 거예요? (上昇調)",
          hint: "下降調は疑問、上昇調は不定。불정표현は 疑問詞+ㄴ가/은가/인가",
          points: ["イントネーションによる意味の違いの理解", "適切な日本語訳", "不定表現への正確な変換"],
          modelAnswer: "1. 疑問用法：誰が電話しましたか？ → 누군가 전화했어요.\n2. 不定用法：誰か電話しましたか？ → 누군가 전화했어요.\n3. 疑問用法：いつ行きますか？ → 언젠가 갈 거예요.\n4. 不定用法：いつか行きますか？ → 언젠가 갈 거예요."
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
