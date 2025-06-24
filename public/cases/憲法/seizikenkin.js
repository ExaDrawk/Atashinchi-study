export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "kenpou-dantai-seiji-katsudou-1",
  title: "【憲法・人権】団体の政治活動と構成員の協力義務",
  category: "kenpou",
  citation: "最判昭50.11.28（国労広島地本事件）、最判平8.3.19（南九州税理士会事件）、最判平14.4.25（群馬司法書士会事件）、最大判昭45.6.24（八幡製鉄政治献金事件）",
  rank: "S",
  tags: ["憲法", "人権", "思想・良心の自由", "政治活動の自由", "団体自治", "強制加入団体"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `【団体の政治活動と構成員の協力義務の基本構造】\n- **【憲法19条】**: 思想・良心の自由の保障\n- **【憲法21条】**: 政治活動の自由の保障\n- **団体自治の原則**: 多数決による団体運営の尊重【id:1】\n- **個人の自由との調和**: 構成員の基本的人権との均衡【id:2】\n\n【強制加入団体の特殊性】\n- **税理士会・司法書士会**: 業務独占資格に基づく強制加入\n- **労働組合**: ユニオンショップ協定による事実上の強制加入\n- **会社**: 株主の地位に基づく構成員性【id:3】\n\n【判断基準の類型化】\n- **目的との関連性**: 団体の本来目的との合理的関連性【id:4】\n- **政治的中立性**: 特定政党・政治的立場への偏向の有無【id:5】\n- **思想・良心の自由への配慮**: 構成員の内心の自由の尊重【id:6】\n- **比較衡量**: 団体活動の実効性と個人の自由の調和【id:7】\n\n【各事件の特徴】\n- **国労広島地本事件**: 労働組合の政治活動への協力義務\n- **南九州税理士会事件**: 強制加入団体の政治献金の限界\n- **群馬司法書士会事件**: 災害支援寄付の適法性\n- **八幡製鉄事件**: 営利法人の政治献金の自由【id:8】`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '国労広島地本事件における臨時組合費納付義務の判断基準を説明しなさい。', 
      answer: '最高裁は{{具体的組合活動の内容・性質}}、{{組合員に求められる協力の内容・程度・態様}}を{{比較衡量}}し、{{多数決原理に基づく組合活動の実効性}}と{{組合員個人の基本的利益}}の{{調和}}という観点から判断するとした。' 
    },
    { 
      id: 2, 
      rank: 'S', 
      question: '南九州税理士会事件で政治献金が違法とされた理由を述べなさい。', 
      answer: '税理士会は{{強制加入団体}}であり、政治献金は{{税理士会の目的の範囲外}}の行為である。特別会費徴収決議は{{会員の思想・信条の自由を考慮していない}}ため{{無効}}とされた。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: '群馬司法書士会事件で災害支援寄付が適法とされた理由を説明しなさい。', 
      answer: '復興支援寄付は{{会員の政治的・宗教的立場や思想信条の自由を害するものではなく}}、{{公序良俗に反する}}などの{{会員の協力義務を否定すべき特段の事情}}がないため適法とされた。' 
    },
    { 
      id: 4, 
      rank: 'S', 
      question: '八幡製鉄政治献金事件における法人の政治活動の自由について論じなさい。', 
      answer: '最高裁は{{憲法上の権利は性質上可能な限り法人にも適用}}され、会社は{{自然人と同様に政治的行為をなす自由}}を有するとした。政治献金は{{会社の社会的役割を果たすため}}になされる限り{{権利能力の範囲内}}である。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '強制加入団体と任意加入団体における政治活動の制約の違いを説明しなさい。', 
      answer: '強制加入団体は{{脱退の自由がない}}ため、{{構成員の思想・良心の自由により配慮}}が必要。任意加入団体は{{脱退可能}}なため、{{団体自治の尊重}}の度合いが高い。{{目的との関連性}}の判断も厳格になる。' 
    },
    { 
      id: 6, 
      rank: 'A', 
      question: '政治的中立性と災害支援の区別について各判例の立場を述べなさい。', 
      answer: '南九州税理士会事件では{{特定政党への献金}}は{{政治的偏向}}として違法。群馬司法書士会事件では{{災害支援}}は{{政治色がない}}ため適法。{{活動の性質}}により{{思想・良心の自由への影響}}が異なる。' 
    },
    { 
      id: 7, 
      rank: 'B', 
      question: '比較衡量における考慮要素を国労広島地本事件を例に説明しなさい。', 
      answer: '考慮要素：①{{組合活動の内容・性質}}、②{{組合員への協力要求の内容・程度・態様}}、③{{多数決原理による組合活動の実効性}}、④{{組合員個人の基本的利益}}。これらを{{総合的に比較衡量}}する。' 
    },
    { 
      id: 8, 
      rank: 'A', 
      question: '各事件における団体の性格の違いが判断に与える影響を論じなさい。', 
      answer: '{{労働組合}}は労働者の利益代表、{{税理士会・司法書士会}}は業務独占資格の強制加入団体、{{会社}}は営利追求団体。{{団体の目的}}と{{構成員の地位}}により、{{政治活動の許容範囲}}と{{協力義務の程度}}が異なる。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'タチバナ家のリビング。夕食後、みかんが憲法の判例集を開いて勉強している' },
    { type: 'narration', text: 'みかんは司法試験予備試験の憲法の勉強で、団体の政治活動に関する判例に取り組んでいた' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'う〜ん、この団体の政治活動の判例、似たような事件がいっぱいあって混乱する…【id:1】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '姉ちゃん、どんな判例を勉強してるの？' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '国労広島地本事件、南九州税理士会事件、群馬司法書士会事件、八幡製鉄政治献金事件…なんで？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'それは憲法の重要判例だね。団体の政治活動と構成員の協力義務の問題だ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'ユズ、詳しいじゃない！でも、どれも似たような事件に見えるんだけど…' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: 'でも実は、それぞれ団体の性格が違うから、判断も微妙に異なるんだ【id:3】' },
    { type: 'narration', text: 'その時、玄関のチャイムが鳴った。みかんの友人のしみちゃんが遊びに来たのだ' },
    { type: 'scene', text: 'タチバナ家のリビング。しみちゃんが加わって勉強会に' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'こんばんは。憲法の勉強してるのね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'しみちゃん！ちょうど良かった。団体の政治活動の判例で困ってるの' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'thinking', dialogue: '団体の政治活動か…確かに複雑な分野ね。どの事件から整理する？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'まず国労広島地本事件から始めましょうか。これが一番基本的な判断枠組みを示してます' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '国労広島地本事件って、どんな事件だっけ？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '国鉄労働組合が脱退した組合員に対して、未払いの組合費を請求した事件よ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'そうです。特に問題になったのは、他の労働組合への支援資金や安保反対闘争の費用として徴収した臨時組合費でした' },
    
    { type: 'embed', format: 'mermaid', title: '国労広島地本事件の構造', description: '労働組合の政治活動と組合員の協力義務', content: 'graph TD\n    A[国鉄労働組合] --> B[脱退組合員]\n    B --> C[組合費未払い]\n    A --> D[臨時組合費徴収]\n    D --> E[他組合支援資金]\n    D --> F[安保反対闘争費]\n    D --> G[救援費用]\n    \n    H[判断基準] --> I[活動内容・性質]\n    H --> J[協力要求の程度]\n    H --> K[多数決原理の実効性]\n    H --> L[個人の基本的利益]' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'へえ〜、労働組合が政治活動をするのって問題になるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '労働組合の活動自体は認められてるけど、組合員に協力を強制できるかが問題なのよ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '最高裁は比較衡量の手法を使いました。具体的な組合活動の内容・性質と、組合員に求められる協力の内容・程度・態様を総合的に判断したんです【id:1】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '比較衡量って何を比較するの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '多数決原理に基づく組合活動の実効性と、組合員個人の基本的利益の調和を図るのよ【id:2】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'つまり、団体の民主的運営と個人の自由のバランスを取るということですね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'なるほど…でも、南九州税理士会事件はどう違うの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: 'それは強制加入団体の政治献金が問題になった事件よ。税理士会が政治献金のための特別会費を徴収したの' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: 'でも最高裁は、税理士会は強制加入団体だから、政治献金は目的の範囲外だと判断しました【id:4】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'え！同じ団体の政治活動なのに、結論が違うの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'そう、団体の性格が違うからよ。労働組合は労働者の利益代表だけど、税理士会は業務独占資格の管理団体【id:3】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'それに、税理士会からは脱退できないから、構成員の思想・良心の自由により配慮が必要なんです【id:5】' },
    
    { type: 'embed', format: 'html', title: '各事件の団体の性格と判断の比較', description: '団体の特徴と政治活動の許容範囲', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px;">事件名</th><th style="padding: 12px; font-size: 12px;">団体の性格</th><th style="padding: 12px; font-size: 12px;">活動内容</th><th style="padding: 12px; font-size: 12px;">判断</th><th style="padding: 12px; font-size: 12px;">理由</th></tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">国労広島地本</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">労働組合</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">政治闘争支援</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">一部適法</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">比較衡量により判断</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">南九州税理士会</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">強制加入団体</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">政治献金</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">違法</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">目的範囲外・思想良心の自由</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">群馬司法書士会</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">強制加入団体</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">災害支援寄付</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">適法</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">政治色なし・公益性</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">八幡製鉄</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">営利法人</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">政治献金</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">適法</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef; background: #f8f9fa;">法人の政治活動の自由</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'じゃあ、群馬司法書士会事件はどうなの？同じ強制加入団体でしょ？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'それは阪神大震災の復興支援として、兵庫司法書士会に寄付をした事件よ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'この場合は適法とされました。災害支援は政治色がないし、公益性が高いからです【id:6】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'なるほど！同じ強制加入団体でも、活動の内容によって結論が変わるんだ' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: 'そう。政治献金は特定の政治的立場を支持することになるけど、災害支援は思想・良心の自由を害しないのよ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '最高裁も「会員の政治的または宗教的立場や思想信条の自由を害するものではない」と明確に述べています' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'それで、八幡製鉄政治献金事件はどんな事件？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '八幡製鉄の取締役が自民党に政治献金をして、株主が取締役の責任を追及した事件よ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: 'この事件では、法人にも政治活動の自由があるかが争点になりました【id:8】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '法人にも人権があるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '最高裁は「憲法上の権利は性質上可能な限り法人にも適用される」と判断したのよ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '会社も自然人と同様に政治的行為をなす自由を有するとされました。ただし、会社の社会的役割を果たすためという限定がつきます' },
    
    { type: 'embed', format: 'mermaid', title: '判断基準の体系化', description: '各事件における判断要素の整理', content: 'graph TD\n    A[団体の政治活動] --> B[団体の性格]\n    A --> C[活動の内容]\n    A --> D[構成員の地位]\n    \n    B --> E[強制加入団体]\n    B --> F[任意加入団体]\n    \n    E --> G[税理士会・司法書士会]\n    F --> H[労働組合・会社]\n    \n    C --> I[政治献金]\n    C --> J[災害支援]\n    C --> K[政治闘争支援]\n    \n    D --> L[脱退の自由なし]\n    D --> M[脱退可能]\n    \n    N[判断結果] --> O[思想良心の自由重視]\n    N --> P[団体自治尊重]\n    N --> Q[比較衡量]' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'でも、なんで会社の政治献金は良くて、税理士会の政治献金はダメなの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: 'それは団体の性格の違いよ。会社は営利追求が目的で、株主は投資判断で参加してる' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'でも税理士会は業務独占資格の管理が目的で、税理士は強制的に加入させられるんです。だから政治活動は目的外なんです【id:4】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'なるほど！団体の目的と構成員の加入の自由度が重要なのね' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'そう。強制加入団体ほど、構成員の思想・良心の自由に配慮が必要なの【id:5】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'それに、活動の政治的中立性も重要です。災害支援は中立的だけど、特定政党への献金は偏向的ですから【id:6】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'じゃあ、労働組合の場合はどう判断されるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '労働組合は労働者の利益代表だから、ある程度の政治活動は認められる。でも限度があるのよ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '国労広島地本事件では、他の労働組合への支援は適法だけど、安保反対闘争への支援は違法とされました【id:7】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'なんで違いが出るの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '労働組合同士の支援は労働者の利益に直結するけど、安保問題は一般的な政治問題だからよ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '組合の本来目的との関連性が薄くなるほど、組合員の協力義務も弱くなるんです' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'つまり、団体の目的との関連性が判断のポイントなのね' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: 'そう！それに加えて、構成員の思想・良心の自由への配慮も必要' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '結局、団体自治の原則と個人の自由の保障をどうバランスさせるかという問題なんです【id:2】' },
    
    { type: 'embed', format: 'mermaid', title: '各事件の判断フロー', description: '団体の政治活動の適法性判断プロセス', content: 'flowchart TD\n    A[団体の政治活動] --> B{強制加入団体か？}\n    B -->|Yes| C{目的との関連性は？}\n    B -->|No| D[団体自治尊重]\n    \n    C -->|高い| E{政治的中立性は？}\n    C -->|低い| F[目的範囲外で違法]\n    \n    E -->|中立| G[適法]\n    E -->|偏向| H{思想良心の自由への配慮は？}\n    \n    H -->|十分| I[適法]\n    H -->|不十分| J[違法]\n    \n    D --> K{会社の社会的役割か？}\n    K -->|Yes| L[適法]\n    K -->|No| M[比較衡量で判断]' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'だんだん整理できてきた！でも、これらの判例から何が学べるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '団体の民主的運営と個人の自由の調和という、現代社会の重要な課題よ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '特に、多様な価値観を持つ人々が同じ団体に属する場合の難しさを示してますね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: '確かに…みんなが同じ考えじゃないもんね' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'だからこそ、団体の性格や活動の内容に応じた細かい判断が必要なのよ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '憲法は多数決原理を認めつつ、少数者の人権も保障する。その具体的な調整方法を示した重要な判例群です' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'でも実際の試験では、どこがポイントになるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '団体の性格の分類と、それに応じた判断基準の使い分けが重要ね' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '特に強制加入団体では、目的との関連性と政治的中立性が厳格に審査されることを覚えておいてください' },
    { type: 'dialogue', speaker: 'みかん', expression: 'excited', dialogue: 'よし！これで4つの判例の関係がよく分かった' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'happy', dialogue: 'それぞれの事件の特徴を理解できれば、応用問題にも対応できるわ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '憲法の人権保障の実際の機能を理解する上でも、とても参考になる判例群ですね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'ありがとう、二人とも！これで明日の憲法の授業も安心だ' },
    { type: 'narration', text: '三人は団体の政治活動をめぐる憲法判例の複雑さと重要性を実感しながら、深夜まで議論を続けた' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">団体の政治活動と構成員の協力義務に関する判例法理</h3>
    <p class="mb-4">団体の政治活動と構成員の協力義務をめぐる問題は、【憲法19条】の思想・良心の自由、【憲法21条】の政治活動の自由、そして団体自治の原則が複雑に交錯する重要な憲法問題です。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">国労広島地本事件（最判昭50.11.28）の判断枠組み</h4>
    <p class="mb-4">労働組合の政治活動への組合員の協力義務について、最高裁は比較衡量による総合判断の枠組みを確立しました。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">判断要素</span>：①組合活動の内容・性質、②組合員への協力要求の内容・程度・態様</li>
      <li><span class="text-red-600 font-bold">比較衡量</span>：多数決原理に基づく組合活動の実効性と組合員個人の基本的利益の調和</li>
      <li><span class="text-red-600 font-bold">具体的判断</span>：他組合支援は適法、安保反対闘争支援は違法</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">南九州税理士会事件（最判平8.3.19）の厳格審査</h4>
    <p class="mb-4">強制加入団体による政治献金について、最高裁は厳格な制限を課しました。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-blue-600 font-bold">強制加入の特殊性</span>：脱退の自由がないため、構成員の思想・良心の自由により配慮</li>
      <li><span class="text-blue-600 font-bold">目的との関連性</span>：政治献金は税理士会の目的の範囲外</li>
      <li><span class="text-blue-600 font-bold">思想・良心の自由</span>：特別会費徴収決議は会員の内心の自由を考慮せず無効</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">群馬司法書士会事件（最判平14.4.25）の政治的中立性</h4>
    <p class="mb-4">同じ強制加入団体でも、活動の政治的中立性により異なる判断が示されました。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-green-600 font-bold">災害支援の性格</span>：政治的・宗教的立場に関わらない公益的活動</li>
      <li><span class="text-green-600 font-bold">思想・良心の自由への影響</span>：会員の内心の自由を害しない</li>
      <li><span class="text-green-600 font-bold">協力義務の根拠</span>：公序良俗に反する特段の事情なし</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">八幡製鉄政治献金事件（最大判昭45.6.24）の法人の権利</h4>
    <p class="mb-4">営利法人の政治活動の自由について、画期的な判断が示されました。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-purple-600 font-bold">法人の人権享有主体性</span>：憲法上の権利は性質上可能な限り法人にも適用</li>
      <li><span class="text-purple-600 font-bold">政治活動の自由</span>：会社も自然人と同様に政治的行為をなす自由を有する</li>
      <li><span class="text-purple-600 font-bold">権利能力の範囲</span>：会社の社会的役割を果たすためになされる限り適法</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">判例法理の体系化</h4>
    <p class="mb-4">これらの判例から、以下の判断基準が体系化されます。</p>
    
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-orange-600 font-bold">団体の性格</span>：強制加入団体ほど厳格な審査</li>
      <li><span class="text-orange-600 font-bold">目的との関連性</span>：団体の本来目的との合理的関連性の要求</li>
      <li><span class="text-orange-600 font-bold">政治的中立性</span>：特定政党・政治的立場への偏向の回避</li>
      <li><span class="text-orange-600 font-bold">思想・良心の自由への配慮</span>：構成員の内心の自由の尊重</li>
    </ul>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験における重要ポイント</h5>
      <p>これらの判例は、団体自治の原則と個人の人権保障の調和という現代憲法学の中核的課題を扱っています。特に、多元的価値観を持つ現代社会において、異なる性格の団体に応じた柔軟な判断基準の確立は、憲法の実効性確保の観点から極めて重要です。短答式では各事件の事実と判旨の正確な理解が、論文式では判断基準の適切な適用と事案への当てはめが求められます。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "団体の政治活動と構成員の協力義務の総合的検討",
      rank: "S",
      background: `みかんは司法試験予備試験の憲法論文対策として、団体の政治活動に関する判例の比較検討を行っています。しみちゃんは社会学の観点から、ユズヒコは法理論の観点から、それぞれ異なる視点でこれらの判例を分析します。彼らは各判例の射程と限界を理解し、現代社会における団体自治と個人の自由の調和について深く考察する必要があります。`,
      subProblems: [
        {
          title: "国労広島地本事件の判断枠組みの意義と限界",
          rank: "A",
          relatedQAs: [1, 7],
          problem: "国労広島地本事件で確立された比較衡量による判断枠組みについて、その具体的内容を説明し、労働組合の政治活動における組合員の協力義務の範囲を論じなさい。また、この判断枠組みが他の団体類型にも適用可能かについて検討しなさい。",
          hint: "比較衡量、多数決原理の実効性、個人の基本的利益、組合活動の内容・性質",
          points: ["比較衡量の具体的要素の理解", "労働組合の特殊性の把握", "他団体への適用可能性の検討"],
          modelAnswer: "国労広島地本事件では、①組合活動の内容・性質、②組合員への協力要求の内容・程度・態様を比較衡量し、多数決原理に基づく組合活動の実効性と組合員個人の基本的利益の調和を図る判断枠組みが確立された。労働組合の本来目的に関連する活動（他組合支援）は協力義務が認められるが、一般的政治活動（安保反対闘争）は義務が否定される。この枠組みは労働組合の利益代表機能を前提とするため、他の団体類型には修正が必要である。"
        },
        {
          title: "強制加入団体における政治活動の限界",
          rank: "S",
          relatedQAs: [2, 3, 5],
          problem: "南九州税理士会事件と群馬司法書士会事件を比較し、強制加入団体の政治活動における判断基準を明らかにしなさい。特に、政治献金と災害支援寄付で結論が分かれた理由を、【憲法19条】の思想・良心の自由の観点から論じなさい。",
          hint: "強制加入団体、目的の範囲、政治的中立性、思想・良心の自由への配慮",
          points: ["強制加入の特殊性の理解", "活動内容による区別の論理", "思想・良心の自由の具体的適用"],
          modelAnswer: "強制加入団体では脱退の自由がないため、構成員の思想・良心の自由により配慮が必要である。南九州税理士会事件では、政治献金が①税理士会の目的範囲外、②特定政治的立場への偏向、③会員の思想・良心の自由への配慮不足により違法とされた。群馬司法書士会事件では、災害支援が①公益的性格、②政治的中立性、③思想・良心の自由を害しない性質により適法とされた。活動の政治的中立性が【憲法19条】適合性の決定的要因となる。"
        },
        {
          title: "法人の政治活動の自由と株主の権利保護",
          rank: "A",
          relatedQAs: [4, 8],
          problem: "八幡製鉄政治献金事件における法人の政治活動の自由の承認について、その憲法上の根拠と限界を論じなさい。また、法人の政治献金が株主の思想・良心の自由を侵害する可能性について、強制加入団体の場合と比較して検討しなさい。",
          hint: "法人の人権享有主体性、政治活動の自由、会社の社会的役割、株主の地位",
          points: ["法人の人権の理論的根拠", "政治活動の自由の範囲と限界", "株主保護の必要性と限界"],
          modelAnswer: "八幡製鉄事件では、憲法上の権利は性質上可能な限り法人にも適用されるとして、法人の政治活動の自由が承認された。ただし、会社の社会的役割を果たすためという目的的限定がある。株主は投資判断により任意に会社に参加し、脱退（株式売却）も可能であるため、強制加入団体の構成員と異なり思想・良心の自由への配慮の程度は低い。しかし、法人の巨大な経済力を考慮すると、自然人より強い制約を受けると解される。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
