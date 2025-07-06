export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "kenpou-daisansha-shoyubutsu-bosshuu",
  title: "【憲法・人権】第三者所有物没収事件",
  category: "kenpou",
  citation: "最大判昭37.11.28（第三者所有物没収事件）",
  rank: "S",
  tags: ["憲法", "人権", "財産権", "適正手続", "第三者所有物没収", "刑事手続"],
  rightSideCharacters: ['梶井', '新田'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `【第三者所有物没収事件（最大判昭37.11.28）】\n- **事案**: 賭博に使用された第三者所有の建物について、所有者に告知・弁解の機会を与えずに没収を命じた事件\n- **争点**: 第三者所有物の没収における適正手続の保障【id:1】\n- **判旨**: 【憲法31条】の適正手続の保障は刑事手続にとどまらず、行政手続その他の手続にも及ぶ【id:2】\n- **条文根拠**: 【憲法31条】【憲法29条】【刑法19条の2】\n\n【事案の概要】\n- 賭博場として使用された建物の所有者が、事前の告知・弁解の機会なく没収処分を受けた\n- 所有者は憲法違反を主張して争った\n- 第三者の財産権と刑事政策の調整が問題となった【id:3】\n\n【判旨・解釈】\n- 【憲法31条】は刑事手続に限定されない包括的な適正手続保障【id:4】\n- 第三者の財産権侵害には特に慎重な手続が必要【id:5】\n- 告知・弁解の機会は適正手続の最低限の要請【id:6】\n\n【実務への影響】\n- 行政手続法制定の理論的基礎となった\n- 没収・追徴手続の適正化が図られた\n- 第三者の権利保護制度の整備につながった【id:7】`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '第三者所有物没収事件における争点を説明しなさい。', 
      answer: '争点は{{第三者所有物の没収における適正手続の保障}}である。具体的には、{{賭博に使用された第三者所有の建物}}について、{{所有者に事前の告知・弁解の機会を与えずに没収}}を命じることが【憲法31条】の{{適正手続の保障}}に反するかが問題となった。' 
    },
    { 
      id: 2, 
      rank: 'S', 
      question: '本判決における【憲法31条】の解釈を述べなさい。', 
      answer: '最高裁は【憲法31条】について、{{適正手続の保障は刑事手続にとどまらず、行政手続その他の手続にも及ぶ}}と判示した。これにより【憲法31条】は{{包括的な適正手続保障}}を定めた条文として位置づけられ、{{デュー・プロセス条項}}としての性格が明確になった。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: '第三者の財産権と刑事政策の調整について説明しなさい。', 
      answer: '{{犯罪に使用された物件の没収}}は{{犯罪予防}}という刑事政策上の要請があるが、{{第三者の財産権}}（【憲法29条】）との調整が必要である。本件では{{所有者の善意・悪意を問わず没収}}する制度の合憲性が争われ、{{適正手続の保障}}により第三者の権利保護が図られた。' 
    },
    { 
      id: 4, 
      rank: 'S', 
      question: '【憲法31条】の包括的適正手続保障について説明しなさい。', 
      answer: '【憲法31条】は{{「法律の定める手続によらなければ」}}と規定し、{{刑事手続に限定されない包括的な適正手続保障}}を定める。本判決により{{行政手続その他の手続}}にも及ぶことが明確となり、{{告知・弁解の機会}}などの{{デュー・プロセス}}の要請が確立された。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '第三者の財産権侵害における特別な配慮について述べなさい。', 
      answer: '第三者の財産権侵害には{{特に慎重な手続}}が必要である。理由は{{①当事者でない第三者の権利侵害}}、{{②事前の防御機会の必要性}}、{{③財産権の重要性}}である。本件では{{告知・弁解の機会}}が{{適正手続の最低限の要請}}として位置づけられた。' 
    },
    { 
      id: 6, 
      rank: 'A', 
      question: '告知・弁解の機会の意義について説明しなさい。', 
      answer: '告知・弁解の機会は{{適正手続の最低限の要請}}である。具体的には{{①処分の内容・理由の事前告知}}、{{②反論・弁解の機会の付与}}、{{③適切な時間的余裕の確保}}が必要である。これにより{{当事者の防御権}}が保障され、{{適正な判断}}が可能となる。' 
    },
    { 
      id: 7, 
      rank: 'B', 
      question: '本判決の実務への影響を述べなさい。', 
      answer: '本判決の影響は{{①行政手続法制定の理論的基礎}}、{{②没収・追徴手続の適正化}}、{{③第三者の権利保護制度の整備}}である。特に{{行政手続法}}の制定により{{告知・弁解の機会}}が制度化され、{{適正手続の保障}}が具体化された。' 
    },
    { 
      id: 8, 
      rank: 'A', 
      question: '【憲法29条】と【憲法31条】の関係について説明しなさい。', 
      answer: '【憲法29条】の{{財産権の保障}}と【憲法31条】の{{適正手続の保障}}は密接に関連する。財産権の制限には{{適正な手続}}が必要であり、特に{{第三者の財産権}}については{{より慎重な手続保障}}が求められる。両条文は{{相互補完的}}な関係にある。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'みかんの高校・ベア研部室。放課後の静寂な校舎で、行政法研究会のメンバーたちが集まっている' },
    { type: 'narration', text: '理央、浅田、梶井、新田の4人が机を囲み、憲法の判例集を広げていた' },
    { type: 'dialogue', speaker: '理央', expression: 'thinking', dialogue: '今日は第三者所有物没収事件を勉強しましょう。この判決、行政法にとってもとても重要なのよ【id:1】' },
    { type: 'dialogue', speaker: '新田', expression: 'surprised', dialogue: '第三者所有物没収事件っスか？なんだか難しそうっス…【id:2】' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '確かに複雑な事件ね。まず事案を整理してみましょう。昭和30年代の東京での出来事よ' },
    { type: 'narration', text: '浅田が判例集のページをめくりながら、事案の概要を説明し始めた' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: 'ある建物が賭博場として使用されていたの。でも、その建物の所有者は賭博とは無関係だった【id:3】' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '要するに、犯罪に使われた物件だけど、所有者は善意の第三者だったということね' },
    { type: 'dialogue', speaker: '理央', expression: 'impressed', dialogue: 'そうなの。それなのに、所有者に何の告知もなく、弁解の機会も与えずに没収処分が下されたのよ【id:4】' },
    
    { type: 'embed', format: 'mermaid', title: '第三者所有物没収の基本構造', description: '事案の関係者と法的問題の整理', content: 'graph TD\n    A[建物所有者<br/>善意の第三者] --> B[所有建物]\n    C[賭博犯人] --> |使用| B\n    D[検察官] --> |没収処分| B\n    A --> |告知・弁解なし| E[憲法31条違反の主張]\n    E --> F[最高裁判所]\n    F --> G[適正手続保障の確立]' },
    
    { type: 'dialogue', speaker: '新田', expression: 'confused', dialogue: 'でも、犯罪に使われた物件なら没収されても仕方ないんじゃないっスか？【id:5】' },
    { type: 'dialogue', speaker: '梶井', expression: 'serious', dialogue: 'それが問題なのよ。確かに犯罪予防は重要だけど、無関係な第三者の財産権はどうなるの？' },
    { type: 'dialogue', speaker: '理央', expression: 'passionate', dialogue: 'まさにそこが争点！【憲法29条】の財産権と【憲法31条】の適正手続の保障が問題になったのよ【id:6】' },
    { type: 'dialogue', speaker: '浅田', expression: 'thinking', dialogue: '当時の法制度では、所有者の善意・悪意を問わず没収できる規定があったの。でも、それって憲法的にどうなのかしら？' },
    { type: 'narration', text: '4人は真剣な表情で議論を続けた。理央が立ち上がってホワイトボードに向かう' },
    { type: 'dialogue', speaker: '理央', expression: 'excited', dialogue: '最高裁の判断を見てみましょう。これが憲法史上重要な転換点になったのよ【id:7】' },
    
    { type: 'embed', format: 'mermaid', title: '憲法31条の解釈の発展', description: '本判決による適正手続保障の拡張', content: 'graph LR\n    A[従来の解釈<br/>刑事手続のみ] --> B[第三者所有物没収事件]\n    B --> C[新しい解釈<br/>包括的適正手続保障]\n    C --> D[行政手続にも適用]\n    C --> E[その他の手続にも適用]\n    D --> F[行政手続法制定へ]\n    E --> G[デュー・プロセス確立]' },
    
    { type: 'dialogue', speaker: '梶井', expression: 'impressed', dialogue: '最高裁は【憲法31条】について画期的な判断を示したのね。「適正手続の保障は刑事手続にとどまらない」と【id:8】' },
    { type: 'dialogue', speaker: '新田', expression: 'surprised', dialogue: 'えっ、それまでは刑事手続だけだと思われてたんっスか？【id:9】' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: 'そうなの。この判決で【憲法31条】が包括的な適正手続保障を定めた条文だと明確になったのよ' },
    { type: 'dialogue', speaker: '理央', expression: 'passionate', dialogue: '具体的には「行政手続その他の手続」にも及ぶと判示したの。これでデュー・プロセス条項としての性格が確立されたのよ【id:10】' },
    { type: 'narration', text: '新田が手を挙げて質問する' },
    { type: 'dialogue', speaker: '新田', expression: 'thinking', dialogue: 'デュー・プロセスって何っスか？聞いたことはあるけど…【id:11】' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: 'アメリカ憲法由来の概念ね。適正な法的手続きを経ずに生命・自由・財産を奪われないという原則よ' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '日本では【憲法31条】がその役割を果たしているの。特に告知と弁解の機会が重要なのよ【id:12】' },
    
    { type: 'embed', format: 'html', title: '適正手続の具体的要素', description: '告知・弁解の機会の内容', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">要素</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">内容</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">根拠</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">告知</td><td style="padding: 10px; border: 1px solid #e9ecef;">処分の内容・理由の事前通知</td><td style="padding: 10px; border: 1px solid #e9ecef;">憲法31条</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">弁解の機会</td><td style="padding: 10px; border: 1px solid #e9ecef;">反論・弁明の機会の付与</td><td style="padding: 10px; border: 1px solid #e9ecef;">憲法31条</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">時間的余裕</td><td style="padding: 10px; border: 1px solid #e9ecef;">適切な準備期間の確保</td><td style="padding: 10px; border: 1px solid #e9ecef;">憲法31条</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">公正な判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">偏見のない客観的審査</td><td style="padding: 10px; border: 1px solid #e9ecef;">憲法31条</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '理央', expression: 'serious', dialogue: '本件では、建物所有者に事前の告知も弁解の機会も与えられなかった。これが【憲法31条】違反とされたのよ【id:13】' },
    { type: 'dialogue', speaker: '新田', expression: 'thinking', dialogue: 'でも、なんで第三者の財産権がそんなに重要なんっスか？犯罪に使われたなら…【id:14】' },
    { type: 'dialogue', speaker: '浅田', expression: 'passionate', dialogue: 'それが重要なポイントなの！第三者は犯罪の当事者じゃない。無関係な人の財産を奪うには、より慎重な手続きが必要よ【id:15】' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '【憲法29条】の財産権は重要な基本権。それを制限するには【憲法31条】の適正手続が不可欠なのよ' },
    { type: 'narration', text: '理央が再びホワイトボードに向かい、判決の意義を整理し始めた' },
    { type: 'dialogue', speaker: '理央', expression: 'excited', dialogue: 'この判決の影響は計り知れないの。後の行政手続法制定の理論的基礎になったのよ【id:16】' },
    
    { type: 'embed', format: 'mermaid', title: '第三者所有物没収事件の影響', description: '判決が後の法制度に与えた影響', content: 'graph TD\n    A[第三者所有物没収事件<br/>昭37.11.28] --> B[適正手続保障の確立]\n    B --> C[行政手続法制定<br/>平成5年]\n    B --> D[没収・追徴手続の適正化]\n    B --> E[第三者権利保護制度]\n    C --> F[告知・弁解の機会の制度化]\n    D --> G[刑事手続の適正化]\n    E --> H[財産権保護の強化]' },
    
    { type: 'dialogue', speaker: '新田', expression: 'impressed', dialogue: 'すごいっス！一つの判決がこんなに大きな影響を与えるなんて【id:17】' },
    { type: 'dialogue', speaker: '浅田', expression: 'happy', dialogue: '平成5年の行政手続法では、告知・弁解の機会が明文で規定されたの。この判決があったからこそよ' },
    { type: 'dialogue', speaker: '梶井', expression: 'serious', dialogue: '没収・追徴手続も大きく変わったわね。第三者の権利保護がより重視されるようになった【id:18】' },
    { type: 'dialogue', speaker: '理央', expression: 'passionate', dialogue: '現在では、組織犯罪処罰法や麻薬特例法でも第三者保護規定が設けられているの。すべてこの判決の流れよ【id:19】' },
    { type: 'narration', text: '4人は判決の現代的意義について議論を深めていく' },
    { type: 'dialogue', speaker: '新田', expression: 'thinking', dialogue: '司法試験ではどんな風に出題されるんっスか？【id:20】' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '【憲法31条】の射程範囲や、財産権制限の適正手続について問われることが多いわね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '特に行政法との関連で、行政処分の適正手続について論じさせる問題がよく出るわ【id:21】' },
    { type: 'dialogue', speaker: '理央', expression: 'excited', dialogue: '憲法と行政法の架け橋となる重要判例だから、両方の観点から理解することが大切なのよ【id:22】' },
    
    { type: 'embed', format: 'mermaid', title: '司法試験での出題パターン', description: '第三者所有物没収事件に関する典型的な出題形式', content: 'graph LR\n    A[第三者所有物没収事件] --> B[憲法論点]\n    A --> C[行政法論点]\n    B --> D[31条の射程]\n    B --> E[29条との関係]\n    C --> F[行政手続法]\n    C --> G[適正手続保障]\n    D --> H[デュー・プロセス]\n    E --> I[財産権制限]' },
    
    { type: 'dialogue', speaker: '新田', expression: 'happy', dialogue: 'よく分かったっス！この判決、本当に重要なんっスね【id:23】' },
    { type: 'dialogue', speaker: '浅田', expression: 'impressed', dialogue: '昭和37年の判決が現在の法制度の基礎を築いたのよ。法の発展って素晴らしいわね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '適正手続の保障は民主主義の根幹。この判決はその重要性を示した記念碑的判決ね【id:24】' },
    { type: 'dialogue', speaker: '理央', expression: 'passionate', dialogue: 'みんな、よく理解できたわね！この判決を通じて、憲法と行政法の関係がより深く見えてきたでしょう【id:25】' },
    { type: 'narration', text: '夕日が部室の窓から差し込む中、4人は充実した勉強会を終えた。第三者所有物没収事件の重要性と現代的意義を深く理解することができた' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">第三者所有物没収事件の判旨と解説</h3>
    <p class="mb-4">第三者所有物没収事件（最大判昭37.11.28）は、【憲法31条】の適正手続保障の射程を画期的に拡張した重要判決です。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">事案の概要</h4>
    <p class="mb-4">賭博場として使用された建物について、その所有者（善意の第三者）に事前の告知・弁解の機会を与えることなく没収処分が下された事案です。所有者は【憲法31条】違反を主張して争いました。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">最高裁の判旨</h4>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">【憲法31条】の射程拡張</span>：適正手続の保障は刑事手続にとどまらず、行政手続その他の手続にも及ぶ</li>
      <li><span class="text-red-600 font-bold">包括的適正手続保障</span>：【憲法31条】をデュー・プロセス条項として位置づけ</li>
      <li><span class="text-red-600 font-bold">第三者の権利保護</span>：特に第三者の財産権侵害には慎重な手続が必要</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">【憲法29条】との関係</h4>
    <p class="mb-4">【憲法29条】の財産権保障と【憲法31条】の適正手続保障は相互補完的関係にあります。財産権の制限には適正な手続が不可欠であり、特に第三者の財産権については、より慎重な手続保障が求められます。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">適正手続の具体的内容</h4>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-blue-600 font-bold">告知</span>：処分の内容・理由の事前通知</li>
      <li><span class="text-blue-600 font-bold">弁解の機会</span>：反論・弁明の機会の付与</li>
      <li><span class="text-blue-600 font-bold">時間的余裕</span>：適切な準備期間の確保</li>
      <li><span class="text-blue-600 font-bold">公正な判断</span>：偏見のない客観的審査</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">後の法制度への影響</h4>
    <p class="mb-4">本判決は以下の法制度整備の理論的基礎となりました：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-green-600 font-bold">行政手続法制定</span>：平成5年制定、告知・弁解の機会の制度化</li>
      <li><span class="text-green-600 font-bold">没収・追徴手続の適正化</span>：第三者保護規定の整備</li>
      <li><span class="text-green-600 font-bold">組織犯罪処罰法等</span>：第三者の権利保護制度の確立</li>
    </ul>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験ポイント</h5>
      <p>【憲法31条】の射程範囲、デュー・プロセス概念、【憲法29条】との関係、行政手続法との関連性が頻出論点です。特に適正手続の具体的内容と第三者の権利保護について詳細に理解することが重要です。</p>
    </div>
    
    <div class="bg-blue-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-blue-800">現代的意義</h5>
      <p>デジタル社会における個人情報保護、AI判断システムの適正性確保など、現代の新たな課題にも本判決の理念が適用されています。適正手続保障の普遍的価値を示す記念碑的判決として、今なお重要な意義を有しています。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "第三者所有物没収と適正手続保障",
      rank: "S",
      background: `理央の実家が経営する「理央商事」の倉庫が、従業員の藤野によって無断で賭博場として使用されていた。理央の父は賭博について全く知らなかったが、警察は倉庫の没収処分を決定し、理央の父に事前の告知や弁解の機会を与えることなく処分を執行した。理央の父は、この処分が憲法に違反するとして争っている。なお、当時の法律では、犯罪に使用された建物等は所有者の善意・悪意を問わず没収できる旨が規定されていた。`,
      subProblems: [
        {
          title: "適正手続保障の射程",
          rank: "S",
          relatedQAs: [2, 4],
          problem: "【憲法31条】の適正手続保障が本件没収処分に適用されるか、第三者所有物没収事件の判旨を踏まえて論じなさい。",
          hint: "【憲法31条】の射程が刑事手続に限定されるかが争点となります。包括的適正手続保障の観点から検討してください。",
          points: ["憲法31条の射程拡張", "包括的適正手続保障", "デュー・プロセス概念", "行政手続への適用"],
          modelAnswer: "【憲法31条】は「何人も、法律の定める手続によらなければ、その生命若しくは自由を奪はれ、又はその他の刑罰を科せられない」と規定する。本条の適用範囲について、第三者所有物没収事件（最大判昭37.11.28）は、適正手続の保障は刑事手続にとどまらず、行政手続その他の手続にも及ぶと判示した。これにより【憲法31条】は包括的な適正手続保障を定めた条文、すなわちデュー・プロセス条項として位置づけられた。本件没収処分は行政処分であるが、上記判例により【憲法31条】の適正手続保障が適用される。特に第三者の財産権を侵害する処分については、より慎重な手続保障が要求される。"
        },
        {
          title: "告知・弁解の機会の必要性",
          rank: "A",
          relatedQAs: [5, 6],
          problem: "本件において理央の父に告知・弁解の機会を与えなかったことの憲法適合性について、【憲法29条】との関係も含めて論じなさい。",
          hint: "第三者の財産権制限における適正手続の具体的内容を検討してください。告知・弁解の機会の意義を明確にしましょう。",
          points: ["財産権と適正手続", "告知の内容と方法", "弁解の機会の実質", "第三者保護の必要性"],
          modelAnswer: "【憲法29条】は財産権を保障し、その制限には適正な手続が必要である。【憲法31条】の適正手続保障は、財産権制限の場面でも適用される。適正手続の具体的内容として、①処分の内容・理由の事前告知、②反論・弁解の機会の付与、③適切な時間的余裕の確保、④公正な判断が要求される。本件では、理央の父は犯罪の当事者ではない善意の第三者であり、その財産権を侵害するには特に慎重な手続が必要である。事前の告知・弁解の機会を与えないことは、適正手続保障に反し違憲である。第三者保護の観点から、所有者の善意・悪意の調査や、犯罪との関連性の検討機会を与えることが不可欠である。"
        },
        {
          title: "現代的課題への応用",
          rank: "A",
          relatedQAs: [7, 8],
          problem: "第三者所有物没収事件の判旨が現代の法制度に与えた影響について、行政手続法制定との関連を含めて論じなさい。",
          hint: "判決の射程効果と後の立法への影響を具体的に検討してください。現代的意義も考察しましょう。",
          points: ["行政手続法への影響", "没収・追徴制度の発展", "第三者保護制度", "現代的課題への適用"],
          modelAnswer: "第三者所有物没収事件の判旨は、後の法制度整備に重大な影響を与えた。第一に、平成5年制定の行政手続法は、本判決の理念を具体化し、告知・弁解の機会を制度化した。第二に、没収・追徴手続において第三者の権利保護が重視され、組織犯罪処罰法や麻薬特例法等で第三者保護規定が整備された。第三に、【憲法31条】の包括的適正手続保障は、現代のデジタル社会における個人情報保護、AI判断システムの適正性確保等の新たな課題にも適用される。本判決は、適正手続保障の普遍的価値を示し、民主主義社会における基本的人権保障の基盤を確立した記念碑的判決として、現在もその意義を失っていない。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
