export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "gyouseihou-kojin-taxi-jiken",
  title: "【行政法・営業許可】個人タクシー事件と行政裁量の統制",
  category: "gyouseihou",
  citation: "最判昭46.10.28（個人タクシー事件）",
  rank: "S",
  tags: ["行政法", "行政裁量", "営業許可", "行政事件訴訟法", "裁量統制"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '【個人タクシー事件の概要】\n- **事案**: 個人タクシー営業許可申請の拒否処分【id:1】\n- **争点**: 行政裁量の範囲と司法審査の限界【id:2】\n- **判決**: 最判昭46.10.28（裁量権の逸脱・濫用審査）【id:3】\n\n【行政裁量の類型】\n- **要件裁量**: 法律要件の認定における裁量【id:4】\n- **効果裁量**: 法的効果の選択における裁量【id:5】\n- **専門技術裁量**: 専門的・技術的判断における裁量【id:6】\n\n【裁量統制の基準】\n- **社会通念**: 社会通念に照らして著しく妥当性を欠く場合【id:7】\n- **比例原則**: 目的と手段の均衡性【id:8】\n- **平等原則**: 同種事案の取扱いの一貫性【id:9】\n\n【司法審査の限界】\n- **審査密度**: 行政の専門的判断への配慮【id:10】\n- **立証責任**: 裁量権逸脱・濫用の立証【id:11】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '個人タクシー事件の事案の概要を説明しなさい。', 
      answer: '{{個人タクシー営業許可申請}}に対する{{拒否処分}}の取消訴訟。申請者は{{法定要件を満たしていた}}が、{{需給調整}}を理由として許可が拒否された事案である。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '行政裁量の意義と種類を述べなさい。', 
      answer: '行政裁量とは{{行政庁に認められた判断の幅}}である。{{要件裁量}}（法律要件の認定）と{{効果裁量}}（法的効果の選択）に分類され、{{専門技術裁量}}も重要な類型である。' 
    },
    { 
      id: 3, 
      rank: 'S', 
      question: '裁量権の逸脱・濫用の審査基準を説明しなさい。', 
      answer: '{{社会通念に照らして著しく妥当性を欠く}}場合に裁量権の逸脱・濫用となる。具体的には{{比例原則}}{{平等原則}}{{適正手続}}の違反が審査される。' 
    },
    { 
      id: 4, 
      rank: 'A', 
      question: '個人タクシー事件における最高裁の判断を述べなさい。', 
      answer: '{{需給調整}}は{{道路運送法の目的}}に含まれるが、{{申請者の既得権的利益}}も考慮すべきとし、{{社会通念上著しく妥当性を欠く}}場合は違法とした。' 
    },
    { 
      id: 5, 
      rank: 'B', 
      question: '道路運送法における個人タクシー許可の要件を説明しなさい。', 
      answer: '{{【道路運送法6条】}}により{{需要に対し供給が不足している}}こと、{{申請者が適格である}}ことなどが要件とされる。{{需給調整}}が重要な考慮要素である。' 
    },
    { 
      id: 6, 
      rank: 'B', 
      question: '司法審査における審査密度について説明しなさい。', 
      answer: '行政の{{専門的・技術的判断}}については{{司法審査は抑制的}}となる。ただし{{裁量権の逸脱・濫用}}については{{司法審査の対象}}となる。' 
    },
    { 
      id: 7, 
      rank: 'A', 
      question: '行政裁量統制の現代的意義を論じなさい。', 
      answer: '{{行政権の肥大化}}に対する{{司法統制の必要性}}が高まっている。{{比例原則}}{{平等原則}}による統制で{{行政の恣意}}を防止し{{国民の権利保護}}を図る。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'みかんの高校・ベア研部室。放課後の静かな部室で、みかんが司法試験の勉強をしている。机の上には行政法の教科書と判例集が広げられている' },
    { type: 'narration', text: 'みかんは個人タクシー事件の複雑な問題について考え込んでいた。行政裁量という概念がなかなか理解できずにいる' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'う〜ん、個人タクシー事件って本当に難しいなあ…行政裁量の統制ってどういうことなんだろう【id:1】' },
    { type: 'narration', text: 'そこに行政事件訴訟法に詳しい理央、行政手続法のスペシャリスト浅田、行政不服審査法に詳しい梶井がベア研部室に入ってきた' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: 'あ、みかん。まだ残ってたのね。何の勉強してるの？' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: '理央！ちょうど良かった。行政事件訴訟法が得意な理央なら、この個人タクシー事件の問題も分かるかな？' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '個人タクシー事件？確か行政裁量の統制に関する重要な判例ね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '最判昭46.10.28の事件ね。行政法の基本的な判例だわ' },
    { type: 'narration', text: '4人はテーブルを囲んで座り、個人タクシー事件について詳しく議論を始めることになった' },
    
    { type: 'embed', format: 'mermaid', title: '個人タクシー事件の争点構造', description: '事件の法的争点を体系的に整理', content: 'graph TD\n    A[個人タクシー許可申請] --> B[拒否処分]\n    B --> C[取消訴訟]\n    C --> D{行政裁量の範囲}\n    D --> E[需給調整の必要性]\n    D --> F[申請者の既得権的利益]\n    E --> G{裁量権の逸脱・濫用}\n    F --> G\n    G --> H[司法審査の限界]' },
    
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '個人タクシー事件ね。確かに行政裁量の統制を考える上で重要な事件よ。具体的にはどんな問題で悩んでるの？' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'えっと、行政裁量っていう概念がよく分からないの。行政が自由に判断できるってことなのかな？' },
    { type: 'dialogue', speaker: '浅田', expression: 'thinking', dialogue: '行政裁量っていうのは、法律が行政庁に一定の判断の幅を認めることよ。でも無制限じゃないの' },
    { type: 'dialogue', speaker: '梶井', expression: 'serious', dialogue: 'そうね。裁量があっても、それが逸脱・濫用された場合は違法になるのよ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'なるほど！でも、どういう場合に逸脱・濫用になるの？' },
    
    { type: 'embed', format: 'html', title: '行政裁量の類型と特徴', description: '行政裁量の種類とそれぞれの特徴を整理', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">裁量の種類</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">内容</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">具体例</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">統制の程度</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">要件裁量</td><td style="padding: 10px; border: 1px solid #e9ecef;">法律要件の認定における判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">「公益上必要」の判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">比較的厳格</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">効果裁量</td><td style="padding: 10px; border: 1px solid #e9ecef;">法的効果の選択における判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">許可・不許可の選択</td><td style="padding: 10px; border: 1px solid #e9ecef;">中程度</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">専門技術裁量</td><td style="padding: 10px; border: 1px solid #e9ecef;">専門的・技術的判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">需給調整の判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">抑制的</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '理央', expression: 'serious', dialogue: '最高裁は「社会通念に照らして著しく妥当性を欠く」場合に裁量権の逸脱・濫用になるって判断したの【id:2】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '社会通念に照らして著しく妥当性を欠くって、具体的にはどういうこと？' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '比例原則や平等原則に反する場合とか、目的と手段が釣り合わない場合よ' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '個人タクシー事件では、需給調整という目的は正当だけど、申請者の既得権的利益も考慮すべきとされたのよ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '既得権的利益って何？申請者にはまだ許可が出てないんでしょ？' },
    { type: 'dialogue', speaker: '理央', expression: 'impressed', dialogue: 'いい質問ね。申請者は長年タクシー運転手として働いて、法定要件も満たしていたの。そういう地位への期待も保護に値するってことよ【id:3】' },
    
    { type: 'embed', format: 'mermaid', title: '裁量統制の判断構造', description: '裁量権の逸脱・濫用を判断するプロセス', content: 'graph LR\n    A[行政処分] --> B{裁量の存在}\n    B -->|あり| C{裁量の範囲内}\n    B -->|なし| D[羈束行為→厳格審査]\n    C -->|範囲内| E[適法]\n    C -->|範囲外| F{逸脱・濫用の審査}\n    F --> G[社会通念による判断]\n    G --> H[比例原則・平等原則]' },
    
    { type: 'dialogue', speaker: '浅田', expression: 'thinking', dialogue: 'でも実際の司法審査では、行政の専門的判断にはかなり配慮するのよね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'え？じゃあ裁判所はあまり厳しくチェックしないってこと？' },
    { type: 'dialogue', speaker: '梶井', expression: 'serious', dialogue: 'そうね。特に専門技術的な判断については、司法審査は抑制的になるの。審査密度って言葉で表現されるわ' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '行政には専門的知識や経験があるから、裁判所が安易に判断を覆すのは適切じゃないってことね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'なるほど…でも、それだと国民の権利保護が不十分になりそうだけど' },
    { type: 'dialogue', speaker: '浅田', expression: 'impressed', dialogue: 'みかん、いいところに気づいたね。だからこそ、明らかに不当な場合には司法がチェックする必要があるのよ' },
    
    { type: 'embed', format: 'mermaid', title: '司法審査の審査密度', description: '行政処分の種類による司法審査の強度の違い', content: 'graph TD\n    A[行政処分] --> B[羈束行為]\n    A --> C[裁量行為]\n    B --> D[厳格審査]\n    C --> E[専門技術裁量]\n    C --> F[一般的裁量]\n    E --> G[抑制的審査]\n    F --> H[中程度審査]\n    D --> I[適法性の厳格判定]\n    G --> J[明白性の原則]\n    H --> K[社会通念による判断]' },
    
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '個人タクシー事件の意義は、裁量統制の基準を明確にしたことよ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: '具体的にはどんな基準なの？' },
    { type: 'dialogue', speaker: '理央', expression: 'serious', dialogue: '比例原則、平等原則、適正手続の観点から審査するのよ。目的と手段の均衡性とか、同種事案の取扱いの一貫性とかね【id:4】' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: 'それに、行政庁は判断の理由を明確にする必要もあるわ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'そうか、行政も勝手に判断していいわけじゃないんだね' },
    
    { type: 'embed', format: 'html', title: '裁量統制の具体的基準', description: '裁量権の逸脱・濫用を判断する具体的な基準', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">統制原理</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">内容</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">具体的審査</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">個人タクシー事件での適用</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">比例原則</td><td style="padding: 10px; border: 1px solid #e9ecef;">目的と手段の均衡性</td><td style="padding: 10px; border: 1px solid #e9ecef;">必要性・相当性の審査</td><td style="padding: 10px; border: 1px solid #e9ecef;">需給調整と申請者利益の衡量</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">平等原則</td><td style="padding: 10px; border: 1px solid #e9ecef;">同種事案の同等取扱い</td><td style="padding: 10px; border: 1px solid #e9ecef;">差別的取扱いの有無</td><td style="padding: 10px; border: 1px solid #e9ecef;">同様の申請者間の公平性</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">適正手続</td><td style="padding: 10px; border: 1px solid #e9ecef;">手続的適正性の確保</td><td style="padding: 10px; border: 1px solid #e9ecef;">理由提示・聴聞機会</td><td style="padding: 10px; border: 1px solid #e9ecef;">拒否理由の明確化</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '梶井', expression: 'thinking', dialogue: 'ところで、この事件って現在の行政法にどんな影響を与えてるの？' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '行政手続法の制定とか、行政不服審査法の改正とかに大きな影響を与えてるのよ' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '特に理由提示の義務化は、この判例の考え方が反映されてるわね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'なるほど！昔の判例が今の法律にも影響してるんだね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '行政裁量の統制は、現代の行政国家では特に重要な問題よ' },
    { type: 'dialogue', speaker: '理央', expression: 'impressed', dialogue: '行政権が肥大化する中で、司法による統制の必要性はますます高まってるからね【id:5】' },
    
    { type: 'embed', format: 'mermaid', title: '個人タクシー事件の現代的意義', description: '判例が現代行政法に与えた影響と発展', content: 'graph LR\n    A[個人タクシー事件] --> B[裁量統制理論の確立]\n    B --> C[行政手続法の制定]\n    B --> D[行政不服審査法の改正]\n    B --> E[行政事件訴訟法の改正]\n    C --> F[現代行政法の発展]\n    D --> F\n    E --> F' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'でも実際の試験では、どんなポイントが重要なの？' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '裁量の種類の区別と、それぞれに対する司法審査の密度の違いを理解することが大切ね' },
    { type: 'dialogue', speaker: '梶井', expression: 'normal', dialogue: 'それと、「社会通念に照らして著しく妥当性を欠く」という基準の具体的な適用方法も重要よ' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '比例原則、平等原則、適正手続という統制原理も押さえておく必要があるわ' },
    { type: 'dialogue', speaker: 'みかん', expression: 'excited', dialogue: 'よし！これで個人タクシー事件のポイントが整理できた。ありがとう、みんな！' },
    { type: 'narration', text: '4人は個人タクシー事件の複雑な法的構造について理解を深めることができた。夕日がベア研部室に差し込む中、充実した勉強時間を過ごしていた' },
    
    { type: 'embed', format: 'mermaid', title: '行政裁量統制の全体像', description: '個人タクシー事件を起点とした裁量統制理論の体系', content: 'graph TD\n    A[行政裁量] --> B[要件裁量]\n    A --> C[効果裁量]\n    A --> D[専門技術裁量]\n    B --> E[厳格審査]\n    C --> F[中程度審査]\n    D --> G[抑制的審査]\n    E --> H[裁量統制の実現]\n    F --> H\n    G --> H' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: '今日はありがとう。行政裁量の統制について、すごくよく理解できた' },
    { type: 'dialogue', speaker: '理央', expression: 'happy', dialogue: 'こちらこそ、とても勉強になったわ。行政法の奥深さを感じるね' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '個人タクシー事件は本当に重要な判例だから、しっかり覚えておいてね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '裁量統制の理論は現代行政法の基礎だから、応用問題でも役立つはずよ' },
    { type: 'narration', text: '4人は満足そうにベア研部室を後にした。西武新宿線田無駅方面へ向かう夕暮れの道で、今日学んだ行政裁量の統制について話し合いながら帰路についた' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: '<h3 class="text-xl font-bold mb-4">個人タクシー事件と行政裁量の統制</h3><p class="mb-4">個人タクシー事件（最判昭46.10.28）は、行政裁量の統制に関する重要な判例です。行政裁量の範囲と司法審査の限界について基本的な判断基準を示し、現代行政法の発展に大きな影響を与えました。</p><h4 class="text-lg font-bold mt-6 mb-2">事案の概要</h4><p class="mb-4">個人タクシー営業許可申請に対する拒否処分の取消訴訟です。申請者は【道路運送法6条】の法定要件を満たしていましたが、需給調整を理由として許可が拒否されました。</p><h4 class="text-lg font-bold mt-6 mb-2">行政裁量の類型</h4><p class="mb-4">最高裁は行政裁量について以下の整理を行いました：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">要件裁量</span>：法律要件の認定における判断の幅</li><li><span class="text-red-600 font-bold">効果裁量</span>：法的効果の選択における判断の幅</li><li><span class="text-red-600 font-bold">専門技術裁量</span>：専門的・技術的判断における裁量</li></ul><h4 class="text-lg font-bold mt-6 mb-2">裁量統制の基準</h4><p class="mb-4">最高裁は「社会通念に照らして著しく妥当性を欠く」場合に裁量権の逸脱・濫用となると判示しました。具体的な統制原理として：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">比例原則</span>：目的と手段の均衡性</li><li><span class="text-red-600 font-bold">平等原則</span>：同種事案の取扱いの一貫性</li><li><span class="text-red-600 font-bold">適正手続</span>：手続的適正性の確保</li></ul><h4 class="text-lg font-bold mt-6 mb-2">司法審査の限界</h4><p class="mb-4">行政の専門的・技術的判断については司法審査は抑制的となります。これは審査密度の理論として発展し、行政処分の性質に応じて司法審査の強度が調整されます。</p><h4 class="text-lg font-bold mt-6 mb-2">本件における具体的判断</h4><p class="mb-4">需給調整は道路運送法の目的に含まれるものの、申請者の既得権的利益も考慮すべきとし、両者の適切な調和が必要であると判断されました。</p><h4 class="text-lg font-bold mt-6 mb-2">現代的意義</h4><p class="mb-4">本判例は以下の点で現代行政法に重要な影響を与えています：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">行政手続法の制定</span>：理由提示義務の法定化</li><li><span class="text-red-600 font-bold">行政不服審査法の改正</span>：審査基準の明確化</li><li><span class="text-red-600 font-bold">行政事件訴訟法の改正</span>：司法審査の充実</li></ul><div class="bg-yellow-100 p-4 rounded-lg mt-6"><h5 class="font-bold text-yellow-800">司法試験ポイント</h5><p>行政裁量の統制は論文式で頻出の論点です。裁量の種類（要件裁量・効果裁量・専門技術裁量）とそれぞれに対する司法審査の密度の違いを正確に理解し、「社会通念に照らして著しく妥当性を欠く」という基準を具体的事案に適用できるようにしましょう。比例原則・平等原則・適正手続による統制も重要なポイントです。</p></div>',

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "行政裁量と司法審査の総合問題",
      rank: "S",
      background: 'みかんの父は長年サラリーマンとして働いてきたが、定年を機に個人タクシー事業を始めることを決意した。みかんの父は必要な資格を取得し、【道路運送法6条】の法定要件をすべて満たして個人タクシー営業許可を申請した。しかし、運輸局は「当該地域における需要に対し供給が過剰である」として申請を拒否した。みかんの父は、同時期に申請した他の申請者の中には許可を受けた者もいることを知り、処分の取消しを求めて訴訟を提起した。なお、みかんの父は10年間タクシー運転手として無事故で勤務した経歴があり、地域住民からの評価も高い。',
      subProblems: [
        {
          title: "行政裁量の存在と範囲",
          rank: "A",
          relatedQAs: [2, 5],
          problem: "個人タクシー営業許可における行政裁量の存在と範囲について論じなさい。",
          hint: "【道路運送法6条】の要件と需給調整の関係を検討する",
          points: ["法定要件の性質", "需給調整における裁量", "専門技術裁量の特徴"],
          modelAnswer: "【道路運送法6条】は個人タクシー営業許可の要件として「需要に対し供給が不足していること」等を定めており、需給調整に関して行政庁に裁量を認めている。この裁量は専門技術裁量の性質を有し、交通政策上の専門的・技術的判断を要する。ただし、裁量は無制限ではなく、法の目的である「道路運送事業の健全な発達」の範囲内でなければならない。本件では需給調整という目的は正当であるが、申請者の既得権的利益との調和も必要である。"
        },
        {
          title: "裁量権の逸脱・濫用の審査",
          rank: "S",
          relatedQAs: [3, 4],
          problem: "本件拒否処分が裁量権の逸脱・濫用に該当するかを個人タクシー事件の基準に従って論じなさい。",
          hint: "「社会通念に照らして著しく妥当性を欠く」かどうかを検討する",
          points: ["社会通念による判断基準", "比例原則の適用", "平等原則の適用"],
          modelAnswer: "個人タクシー事件の基準によれば、「社会通念に照らして著しく妥当性を欠く」場合に裁量権の逸脱・濫用となる。本件では、①みかんの父が法定要件を満たし10年間の無事故経歴を有すること、②同時期の他の申請者には許可された者がいること、③地域住民からの評価が高いことから、拒否処分は比例原則・平等原則に反する可能性が高い。需給調整の必要性を考慮しても、申請者の既得権的利益を過度に軽視した判断として、社会通念上著しく妥当性を欠くと評価される。"
        },
        {
          title: "司法審査の密度",
          rank: "A",
          relatedQAs: [6, 7],
          problem: "本件における司法審査の密度について論じなさい。",
          hint: "専門技術裁量に対する司法審査の特徴を考慮する",
          points: ["審査密度の理論", "専門的判断への配慮", "権利保護の必要性"],
          modelAnswer: "需給調整は専門技術的判断を要するため、司法審査は原則として抑制的となる。しかし、裁量権の逸脱・濫用については司法審査の対象となり、特に基本的権利に関わる場合は一定の審査密度が要求される。本件では営業の自由という経済的自由権が制約されており、また明らかに不合理な差別的取扱いの疑いがあることから、抑制的審査の範囲内でも十分な審査が可能である。裁判所は行政の専門的判断を尊重しつつも、明白な不当性については積極的に審査すべきである。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
