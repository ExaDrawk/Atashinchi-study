export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "minpou-bukkenhou-kyoyuu-sougou-fixed",
  title: "【民法・物権法】共有物分割請求と共有者間の権利調整",
  category: "minpou",
  citation: "最判平8.10.31（全面的価格賠償分割事件）",
  rank: "S",
  tags: ["民法", "物権法", "共有", "共有物分割", "価格賠償", "独占的使用"],
  rightSideCharacters: ['石田'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '【共有物分割請求権】\n- **分割請求の自由性**: 【民法256条】により各共有者は分割を請求可能【id:1】\n- **分割手続**: 協議→調停→訴訟の順序で進行【id:2】\n- **分割方法**: 現物分割・価格賠償分割・換価分割の3類型【id:3】\n\n【全面的価格賠償分割の要件】\n- **相当性**: 特定共有者への取得の合理性【id:4】\n- **価格の適正性**: 適正な評価額での賠償【id:5】\n- **支払能力**: 確実な支払いの見込み【id:6】\n\n【共有者による侵害への対処】\n- **無権限処分**: 持分権に基づく更正登記請求【id:7】\n- **独占的使用**: 明渡請求は原則不可、対価償還請求で調整【id:8】\n- **共有物の変更**: 差止請求・原状回復請求可能【id:9】\n\n【その他の共同所有形態】\n- **合有**: 組合財産など、団体目的による制約【id:10】\n- **総有**: 権利能力なき社団の財産、構成員の持分権否定【id:11】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '【民法256条】の共有物分割請求権の特徴を説明しなさい。', 
      answer: '【民法256条】は{{いつでも分割を請求することができる}}と規定し、{{分割請求の自由性}}を保障している。ただし{{5年を超えない期間内}}での分割禁止特約は有効である。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '全面的価格賠償分割が認められる要件を述べなさい。', 
      answer: '要件は①{{特定の共有者に取得させることの相当性}}、②{{価格の適正性と支払能力}}である。{{共有物支配の実態}}や{{共有者の意思・利益}}を総合考慮し{{実質的公平}}を確保する。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: '共有者の一人による独占的使用に対する法的救済を説明しなさい。', 
      answer: '{{明渡請求は原則として認められない}}。なぜなら占有者も{{持分権に基づく使用収益権限}}を有するからである。救済は{{【民法249条2項】の対価償還請求}}や{{不法行為責任}}による調整となる。' 
    },
    { 
      id: 4, 
      rank: 'B', 
      question: '合有と総有の違いを説明しなさい。', 
      answer: '{{合有}}は{{組合財産}}のように{{共同目的のための制約}}があるが{{持分権は存在}}する。{{総有}}は{{権利能力なき社団の財産}}のように{{構成員の持分権が否定}}され{{団体による管理}}が行われる。' 
    },
    { 
      id: 5, 
      rank: 'B', 
      question: '共有物の変更に対する救済方法を述べなさい。', 
      answer: '共有者は{{差止請求}}および{{場合により原状回復請求}}が可能である（最判平10.3.24）。{{変更}}は{{共有者全員の同意}}が必要だからである。' 
    },
    { 
      id: 6, 
      rank: 'A', 
      question: '【民法258条2項・3項】の分割方法の種類を説明しなさい。', 
      answer: '分割方法は①{{現物分割}}（物理的に分割）、②{{価格賠償分割}}（特定者が取得し他に金銭賠償）、③{{換価分割}}（第三者に売却し代金分配）の3種類である。' 
    },
    { 
      id: 7, 
      rank: 'B', 
      question: '【民法668条・676条】の組合財産の共有について説明しなさい。', 
      answer: '組合財産は{{合有}}の典型例で、{{組合員による共有}}だが{{組合契約の目的による制約}}を受ける。{{持分権の処分}}や{{分割請求}}は{{制限}}される。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ユズヒコの中学校・2年B組の教室。放課後の夕方、西日が差し込む静かな教室で、物権法が得意な石田が一人で法律の資料を読んでいる' },
    { type: 'narration', text: '石田は共有物分割の複雑な問題について考え込んでいた。机の上には物権法の教科書と判例集が広げられている' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'う〜ん、共有物分割の問題って本当に奥が深いのだ…特に全面的価格賠償分割の要件がよく分からないネ【id:1】' },
    { type: 'narration', text: 'そこに債権法が得意な山下と親族・相続法に詳しい川島が教室に入ってきた。二人は石田の真剣な表情を見て興味を示した' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: 'あ、石田。まだ残ってたんだ。何の勉強してるの？' },
    { type: 'dialogue', speaker: '石田', expression: 'surprised', dialogue: '山下！ちょうど良かったのだ。債権法が得意な山下なら、この共有物分割の問題も分かるかもしれないネ' },
    { type: 'dialogue', speaker: '川島', expression: 'happy', dialogue: 'あら、法律の勉強？私も親族・相続法やってるから、役に立てるかも' },
    { type: 'narration', text: '川島は同級生らしくタメ口で話しかけた。3人は机を囲んで座り、共有物分割の問題について議論を始めることになった' },
    
    { type: 'embed', format: 'mermaid', title: '共有物分割の手続きの流れ', description: '分割請求から最終的な分割までの過程を示したフローチャート', content: 'graph LR\n    A[分割請求] --> B[協議による分割]\n    B --> C{協議成立}\n    C -->|成立| D[分割実行]\n    C -->|不成立| E[家庭裁判所での調停]\n    E --> F{調停成立}\n    F -->|成立| D\n    F -->|不成立| G[共有物分割訴訟]\n    G --> H[裁判による分割]' },
    
    { type: 'dialogue', speaker: '山下', expression: 'serious', dialogue: '共有物分割ね。確かに複雑な制度だよ。具体的にはどんな問題で悩んでるの？' },
    { type: 'dialogue', speaker: '石田', expression: 'confused', dialogue: 'えっと、【民法258条2項2号】の価格賠償分割で、特に全面的価格賠償が認められる要件なのだ' },
    { type: 'dialogue', speaker: '川島', expression: 'thinking', dialogue: 'なるほど、全面的価格賠償分割だね。これは平成8年の最高裁判例が重要な基準を示してる' },
    { type: 'dialogue', speaker: '石田', expression: 'impressed', dialogue: 'おお、川島は詳しいのだ！どんな基準なのか教えてほしいネ' },
    { type: 'dialogue', speaker: '川島', expression: 'normal', dialogue: '最判平8.10.31では、特定の共有者に取得させることの相当性と、価格の適正性・支払能力が要件とされてる【id:2】' },
    { type: 'dialogue', speaker: '山下', expression: 'impressed', dialogue: 'さすが川島だね。でも、その「相当性」って具体的にはどう判断するの？' },
    
    { type: 'embed', format: 'mermaid', title: '全面的価格賠償分割の判断要素', description: '裁判所が考慮する具体的な要素を体系的に整理', content: 'graph TD\n    A[全面的価格賠償分割] --> B[相当性の判断]\n    A --> C[価格・支払能力]\n    B --> D[共有物支配の実態]\n    B --> E[共有者の意思]\n    B --> F[共有者の利益]\n    C --> G[適正な価格評価]\n    C --> H[確実な支払見込み]\n    D --> I[実質的公平の確保]\n    E --> I\n    F --> I' },
    
    { type: 'dialogue', speaker: '川島', expression: 'serious', dialogue: '判例では、共有物支配の実態、共有者の意思・利益への配慮などを総合考慮して、全体としての実質的公平を確保することが重要とされてる' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'なるほど…でも、そもそも共有者の一人が勝手に共有物を使っている場合はどうなるのだ？' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: 'あ、それは独占的使用の問題だね。実は明渡請求は原則として認められないんだよ' },
    { type: 'dialogue', speaker: '石田', expression: 'surprised', dialogue: 'えっ！なんで明渡請求ができないのだ？' },
    { type: 'dialogue', speaker: '山下', expression: 'serious', dialogue: '占有している共有者も、自分の持分権に基づいて共有物全体を使用収益する権限があるからなんだ。最判昭41.5.19の判例だよ【id:3】' },
    { type: 'dialogue', speaker: '川島', expression: 'thinking', dialogue: 'じゃあ、独占的使用をされた他の共有者はどんな救済を受けられるの？' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: '【民法249条2項】の持分に応じた対価償還請求や、不法行為責任による損害賠償請求で調整することになるね' },
    
    { type: 'embed', format: 'html', title: '共有者による侵害類型と救済方法', description: '具体的な侵害行為とそれに対する法的救済の整理', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">侵害類型</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">具体例</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">救済方法</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">根拠</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">無権限処分</td><td style="padding: 10px; border: 1px solid #e9ecef;">単独名義での登記・売却</td><td style="padding: 10px; border: 1px solid #e9ecef;">更正登記手続請求</td><td style="padding: 10px; border: 1px solid #e9ecef;">持分権に基づく妨害排除</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">持分譲渡無効</td><td style="padding: 10px; border: 1px solid #e9ecef;">無効な持分移転登記</td><td style="padding: 10px; border: 1px solid #e9ecef;">抹消登記手続請求</td><td style="padding: 10px; border: 1px solid #e9ecef;">最判平15.7.11</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">共有物の変更</td><td style="padding: 10px; border: 1px solid #e9ecef;">無断での建物改築</td><td style="padding: 10px; border: 1px solid #e9ecef;">差止・原状回復請求</td><td style="padding: 10px; border: 1px solid #e9ecef;">最判平10.3.24</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">独占的使用</td><td style="padding: 10px; border: 1px solid #e9ecef;">一人による占有継続</td><td style="padding: 10px; border: 1px solid #e9ecef;">対価償還請求</td><td style="padding: 10px; border: 1px solid #e9ecef;">【民法249条2項】</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '石田', expression: 'impressed', dialogue: 'なるほど、侵害の類型によって救済方法が違うのだネ。でも最終的には共有関係を解消したい場合はどうするのだ？' },
    { type: 'dialogue', speaker: '川島', expression: 'normal', dialogue: 'それが共有物分割請求だね。【民法256条】により、各共有者はいつでも分割を請求できる【id:4】' },
    { type: 'dialogue', speaker: '山下', expression: 'thinking', dialogue: '分割の方法は3つあるよね。現物分割、価格賠償分割、換価分割' },
    { type: 'dialogue', speaker: '石田', expression: 'normal', dialogue: 'そうそう、【民法258条2項・3項】に規定されているのだ。でも実際にはどの方法が選ばれることが多いのかネ？' },
    { type: 'dialogue', speaker: '川島', expression: 'serious', dialogue: '土地などの不動産では現物分割が困難な場合が多くて、価格賠償分割や換価分割が選択されることが多いね' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: '特に全面的価格賠償分割は、一人の共有者が他の共有者の持分を買い取る形だから、実用的だよね' },
    
    { type: 'embed', format: 'mermaid', title: '共有物分割の3つの方法', description: '各分割方法の特徴と適用場面を図解', content: 'graph TD\n    A[共有物分割] --> B[現物分割]\n    A --> C[価格賠償分割]\n    A --> D[換価分割]\n    B --> E[物理的に分割可能]\n    B --> F[各自が分割後の物を取得]\n    C --> G[特定者が物を取得]\n    C --> H[他の共有者に金銭賠償]\n    D --> I[第三者に売却]\n    D --> J[売却代金を分配]' },
    
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'ところで、共有以外にも共同所有の形態があるって聞いたことがあるのだ。合有とか総有とか…' },
    { type: 'dialogue', speaker: '川島', expression: 'impressed', dialogue: 'よく知ってるね！確かに共有、合有、総有という3つの類型がある' },
    { type: 'dialogue', speaker: '山下', expression: 'confused', dialogue: 'え、合有と総有って何が違うの？普通の共有とは何が違うの？' },
    { type: 'dialogue', speaker: '川島', expression: 'normal', dialogue: '共有は各人の持分権が明確で、処分や分割請求の自由がある。合有は組合財産のように共同目的による制約がある' },
    { type: 'dialogue', speaker: '石田', expression: 'impressed', dialogue: 'なるほど、【民法668条・676条】の組合財産の共有のことだネ' },
    { type: 'dialogue', speaker: '川島', expression: 'serious', dialogue: 'そう。そして総有は権利能力なき社団の財産のように、構成員の持分権が否定されて、団体による管理が行われる' },
    { type: 'dialogue', speaker: '山下', expression: 'thinking', dialogue: 'つまり、共同目的の強さによって、個人の権利が制約される度合いが違うってことか' },
    
    { type: 'embed', format: 'html', title: '共同所有の3類型比較', description: '共有・合有・総有の特徴と違いを詳細に比較', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">類型</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">持分権</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">処分の自由</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">分割請求</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">典型例</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">共有</td><td style="padding: 10px; border: 1px solid #e9ecef;">明確に存在</td><td style="padding: 10px; border: 1px solid #e9ecef;">原則自由</td><td style="padding: 10px; border: 1px solid #e9ecef;">可能</td><td style="padding: 10px; border: 1px solid #e9ecef;">通常の共同所有</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">合有</td><td style="padding: 10px; border: 1px solid #e9ecef;">存在するが制約</td><td style="padding: 10px; border: 1px solid #e9ecef;">制限あり</td><td style="padding: 10px; border: 1px solid #e9ecef;">制限あり</td><td style="padding: 10px; border: 1px solid #e9ecef;">組合財産</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">総有</td><td style="padding: 10px; border: 1px solid #e9ecef;">否定</td><td style="padding: 10px; border: 1px solid #e9ecef;">不可</td><td style="padding: 10px; border: 1px solid #e9ecef;">不可</td><td style="padding: 10px; border: 1px solid #e9ecef;">権利能力なき社団財産</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '石田', expression: 'happy', dialogue: 'よく分かったのだ！共有物分割は複雑だけど、体系的に理解できたネ' },
    { type: 'dialogue', speaker: '川島', expression: 'happy', dialogue: '私も勉強になった。特に独占的使用の問題は、相続の場面でも重要だね' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: 'そうだね。債権法でも共有債権とかの問題があるし、横断的に理解することが大切だよ' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'ところで、遺産分割との関係はどうなるのだ？' },
    { type: 'dialogue', speaker: '川島', expression: 'serious', dialogue: '【民法258条の2】により、遺産分割が優先される。ただし相続開始から10年経過すると例外がある' },
    { type: 'dialogue', speaker: '山下', expression: 'impressed', dialogue: 'なるほど、遺産分割の特殊性を考慮した規定なんだね' },
    { type: 'narration', text: '3人は共有物分割の複雑な制度について理解を深めることができた。夕日が教室に差し込む中、充実した勉強時間を過ごしていた' },
    
    { type: 'embed', format: 'mermaid', title: '共有関係解消の全体像', description: '共有関係を解消する各種方法の関係性を総合的に整理', content: 'graph LR\n    A[共有関係] --> B[持分譲渡]\n    A --> C[共有物分割]\n    B --> D[第三者への売却]\n    B --> E[他共有者への売却]\n    C --> F[協議による分割]\n    C --> G[調停による分割]\n    C --> H[訴訟による分割]\n    H --> I[現物分割]\n    H --> J[価格賠償分割]\n    H --> K[換価分割]' },
    
    { type: 'dialogue', speaker: '石田', expression: 'normal', dialogue: '今日はありがとうなのだ。物権法の理解が深まったネ' },
    { type: 'dialogue', speaker: '川島', expression: 'happy', dialogue: 'こっちこそ、とても勉強になった。また一緒に勉強しよう' },
    { type: 'dialogue', speaker: '山下', expression: 'happy', dialogue: 'うん、法律って分野を超えて関連してるから、みんなで勉強すると理解が深まるよね' },
    { type: 'narration', text: '3人は満足そうに教室を後にした。西武新宿線田無駅方面へ向かう夕暮れの道で、今日学んだ共有物分割の知識について話し合いながら帰路についた' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: '<h3 class="text-xl font-bold mb-4">共有物分割請求権と全面的価格賠償分割</h3><p class="mb-4">共有物分割請求権は【民法256条】に基づく重要な権利であり、共有関係の解消を図る制度です。特に全面的価格賠償分割については、最判平8.10.31が重要な判断基準を示しています。</p><h4 class="text-lg font-bold mt-6 mb-2">【民法256条】分割請求権の特徴</h4><p class="mb-4">各共有者は「いつでも」分割を請求することができ、この権利は強行規定です。ただし、5年を超えない期間内での分割禁止特約は【民法256条】ただし書により有効とされています。</p><h4 class="text-lg font-bold mt-6 mb-2">全面的価格賠償分割の要件</h4><p class="mb-4">最判平8.10.31は、全面的価格賠償分割について以下の要件を示しました：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">特定の共有者に取得させることの相当性</span>：共有物支配の実態、共有者の意思・利益への配慮</li><li><span class="text-red-600 font-bold">価格の適正性と支払能力</span>：適正な評価額での賠償と確実な支払見込み</li></ul><p class="mb-4">これらの要件は「全体としての実質的公平の確保」という観点から総合的に判断されます。</p><h4 class="text-lg font-bold mt-6 mb-2">共有者による侵害への対処</h4><p class="mb-4">共有者の一人による独占的使用については、最判昭41.5.19により明渡請求は原則として認められません。これは占有者も持分権に基づく使用収益権限を有するためです。救済は【民法249条2項】の対価償還請求や不法行為責任による調整となります。</p><h4 class="text-lg font-bold mt-6 mb-2">【民法258条2項・3項】の分割方法</h4><p class="mb-4">裁判による分割方法は、①現物分割（物理的分割）、②価格賠償分割（特定者取得・金銭賠償）、③換価分割（売却・代金分配）の3種類があります。</p><h4 class="text-lg font-bold mt-6 mb-2">その他の共同所有形態</h4><p class="mb-4">共有以外にも合有（組合財産等）と総有（権利能力なき社団の財産等）があり、共同目的の強さに応じて個人の権利が制約されます。</p><h4 class="text-lg font-bold mt-6 mb-2">【民法258条の2】遺産分割との関係</h4><p class="mb-4">遺産に属する財産については、遺産分割が共有物分割に優先します。ただし、相続開始から10年経過後は例外的に共有物分割が可能となります。</p><div class="bg-yellow-100 p-4 rounded-lg mt-6"><h5 class="font-bold text-yellow-800">司法試験ポイント</h5><p>全面的価格賠償分割の要件は論文式で頻出です。単なる要件の暗記ではなく、「実質的公平」という判断基準の意味を理解し、具体的事案に適用できるようにしましょう。また、独占的使用の問題では明渡請求が認められない理由を正確に説明できることが重要です。共有・合有・総有の区別も短答式で狙われやすい論点です。</p></div>',

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "共有物分割と独占的使用の総合問題",
      rank: "S",
      background: '石田、山下、川島の3人は、石田の祖父から相続した田無市の土地建物（評価額3000万円）を3分の1ずつ共有している。ところが、石田が一人でこの建物に住み始め、山下と川島の立ち入りを拒否するようになった。山下と川島は石田に対して建物の明渡しを求めたが、石田は拒否している。そこで山下は、石田に対して建物の明渡しを求めるとともに、共有物分割を求めて訴訟を提起した。なお、石田は建物を単独で取得したいと考えており、十分な資力を有している。',
      subProblems: [
        {
          title: "独占的使用に対する明渡請求の可否",
          rank: "A",
          relatedQAs: [3],
          problem: "山下の石田に対する建物明渡請求は認められるか。",
          hint: "共有者の使用収益権限と持分権の関係を考慮する",
          points: ["共有者の使用収益権限", "明渡請求が認められない理由", "代替的救済手段"],
          modelAnswer: "山下の明渡請求は認められない。なぜなら、石田も共有者として持分権に基づき共有物全体を使用収益する権限を有するからである（最判昭41.5.19）。共有者の一人による独占的使用は他の共有者の持分権を侵害するが、占有者の排除もまた持分権の侵害となるため、明渡請求は認められない。山下は【民法249条2項】に基づく対価償還請求や不法行為に基づく損害賠償請求により救済を図ることができる。"
        },
        {
          title: "全面的価格賠償分割の可否",
          rank: "S",
          relatedQAs: [1, 2],
          problem: "石田が山下・川島の持分を買い取る全面的価格賠償分割は認められるか。",
          hint: "最判平8.10.31の判断基準を適用する",
          points: ["特定共有者への取得の相当性", "価格の適正性と支払能力", "実質的公平の確保"],
          modelAnswer: "石田による全面的価格賠償分割は認められる可能性が高い。最判平8.10.31によれば、①特定の共有者に取得させることの相当性、②価格の適正性と支払能力が要件である。本件では、石田が現実に建物を占有使用している実態があり、建物の単独取得を希望している。また、十分な資力を有しており、適正な評価額（1000万円×2）での支払いが可能である。これらを総合すれば、全体としての実質的公平が確保されるため、全面的価格賠償分割が認められると考えられる。"
        },
        {
          title: "遺産分割との関係",
          rank: "B",
          relatedQAs: [1],
          problem: "本件土地建物が相続財産である場合の共有物分割請求の可否について論じなさい。",
          hint: "【民法258条の2】の規定を検討する",
          points: ["遺産分割の優先", "10年経過の例外", "特別受益・寄与分の考慮"],
          modelAnswer: "【民法258条の2】により、遺産に属する財産については遺産分割が共有物分割に優先する。これは遺産分割の特殊性（対象の包括性、特別受益・寄与分の考慮等）を重視したものである。ただし、相続開始から10年経過後は例外的に共有物分割請求が可能となる。本件では相続開始からの期間が重要な判断要素となり、10年未満であれば原則として遺産分割手続きによるべきである。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
