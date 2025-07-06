export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "gyouseihou-amarume-yokushitsu-jiken",
  title: "【行政法・行政処分】余目町個室付浴場事件と行政権の濫用",
  category: "gyouseihou",
  citation: "最判昭53.5.26・最判昭53.6.16（余目町個室付浴場事件）",
  rank: "S",
  tags: ["行政法", "行政処分", "行政権の濫用", "公定力", "国家賠償法"],
  rightSideCharacters: [ '梶井', '新田'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '【余目町個室付浴場事件の概要】\n- **事案**: 山形県余目町で個室付浴場営業阻止のため児童遊園設置認可【id:1】\n- **争点**: 行政権の濫用と公定力の関係【id:2】\n- **判決**: 最判昭53.5.26（国賠）・最判昭53.6.16（刑事）【id:3】\n\n【行政権の濫用】\n- **定義**: 行政処分が本来の目的と異なる動機でなされること【id:4】\n- **判断基準**: 主たる動機・目的による判断【id:5】\n- **効果**: 処分の違法性・無効性【id:6】\n\n【公定力と濫用処分】\n- **公定力**: 行政処分の有効性推定効【id:7】\n- **濫用処分の公定力**: 著しい濫用の場合は公定力否定【id:8】\n- **規制効力**: 濫用処分は規制根拠とならない【id:9】\n\n【国家賠償責任】\n- **【国家賠償法1条1項】**: 公権力の違法行使による損害賠償【id:10】\n- **違法性判断**: 行政権の著しい濫用は違法【id:11】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '余目町個室付浴場事件の事案の概要を説明しなさい。', 
      answer: '山形県余目町で{{個室付浴場営業の阻止}}を目的として、{{児童遊園設置認可処分}}がなされた事案。{{風営法の児童福祉施設から200m以内営業禁止規定}}を利用した{{行政権の濫用}}が問題となった。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '行政権の濫用の判断基準を述べなさい。', 
      answer: '行政処分が{{本来の法定目的と異なる動機・目的}}でなされた場合に濫用となる。判断は{{主たる動機・目的}}により行い、{{客観的な必要性・緊急性}}の有無も考慮される。' 
    },
    { 
      id: 3, 
      rank: 'S', 
      question: '行政権の濫用に相当する処分の公定力について説明しなさい。', 
      answer: '{{著しい濫用に相当する処分}}は{{公定力を有しない}}。本件では児童遊園設置認可が{{個室付浴場営業を規制する効力を有しない}}とされた（最判昭53.6.16）。' 
    },
    { 
      id: 4, 
      rank: 'A', 
      question: '【国家賠償法1条1項】における行政権濫用の違法性について説明しなさい。', 
      answer: '{{行政権の著しい濫用}}は{{【国家賠償法1条1項】の公権力の違法な行使}}に該当する。{{処分が適法な形式}}を備えていても{{実質的な濫用}}があれば違法となる。' 
    },
    { 
      id: 5, 
      rank: 'B', 
      question: '風営法と児童福祉施設の関係を説明しなさい。', 
      answer: '{{風営法4条の4}}により{{児童福祉施設から200m以内}}では{{個室付浴場業の営業が禁止}}される。これは{{児童の健全育成}}を目的とした規制である。' 
    },
    { 
      id: 6, 
      rank: 'B', 
      question: '児童遊園の本来の目的を述べなさい。', 
      answer: '{{【児童福祉法40条】}}により{{児童に健全な遊びを与え}}{{健康を増進し情操を豊かにする}}ことが目的である。営業規制は本来の目的ではない。' 
    },
    { 
      id: 7, 
      rank: 'A', 
      question: '本件における国家賠償請求の成否を論じなさい。', 
      answer: '{{児童遊園設置認可処分}}が{{行政権の著しい濫用}}として{{【国家賠償法1条1項】の違法行為}}に該当し、{{営業阻止による損害}}について{{国家賠償責任}}が認められる。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'みかんの高校・ベア研部室。放課後の静かな部室で、行政事件訴訟法に詳しい理央が一人で判例集を読んでいる' },
    { type: 'narration', text: '理央は余目町個室付浴場事件の複雑な問題について考え込んでいた。机の上には行政法の教科書と最高裁判例集が広げられている' },
    { type: 'dialogue', speaker: '理央', expression: 'thinking', dialogue: 'う〜ん、余目町の事件って本当に興味深いケースね…行政権の濫用と公定力の関係が複雑で【id:1】' },
    { type: 'narration', text: 'そこに行政手続法に詳しい浅田、行政不服審査法のスペシャリスト梶井、国家賠償法に詳しい新田が部室に入ってきた' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: 'あ、理央。まだ残ってたんだ。何の勉強してるの？' },
    { type: 'dialogue', speaker: '理央', expression: 'surprised', dialogue: '浅田！ちょうど良かった。行政手続法が得意な浅田なら、この余目町事件の問題も分かるかも' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '余目町個室付浴場事件？確か行政権の濫用が争点になった有名な事件ね' },
    { type: 'dialogue', speaker: '新田', expression: 'excited', dialogue: '国家賠償法の事件っスね！私も興味ありまっス' },
    { type: 'narration', text: '4人はテーブルを囲んで座り、余目町事件について詳しく議論を始めることになった' },
    
    { type: 'embed', format: 'mermaid', title: '余目町事件の時系列', description: '事件の発生から判決までの流れを整理', content: 'graph LR\n    A[1968年3月<br/>土地購入] --> B[1968年5月<br/>建築確認・反対運動]\n    B --> C[1968年6月<br/>児童遊園設置認可]\n    C --> D[1968年8月<br/>営業開始・営業停止処分]\n    D --> E[刑事訴訟<br/>昭53.6.16無罪]\n    D --> F[国賠訴訟<br/>昭53.5.26勝訴]' },
    
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '余目町事件ね。確かに行政権の濫用の典型例だよ。具体的にはどんな問題で悩んでるの？' },
    { type: 'dialogue', speaker: '理央', expression: 'confused', dialogue: 'えっと、児童遊園設置認可処分が行政権の濫用とされた理由と、公定力との関係なの' },
    { type: 'dialogue', speaker: '梶井', expression: 'thinking', dialogue: 'なるほど、行政権の濫用の判断基準と公定力の否定の問題ね。これは重要な論点だわ' },
    { type: 'dialogue', speaker: '新田', expression: 'normal', dialogue: '国家賠償法の観点からも興味深い事件っス。どんな経緯だったんスか？' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '山形県余目町で、個室付浴場（いわゆるソープランド）の営業を阻止するために、町と県が児童遊園の設置認可を行った事件よ【id:2】' },
    
    { type: 'embed', format: 'html', title: '事案の詳細な経緯', description: '余目町事件の具体的な事実関係を整理', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">時期</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">出来事</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">関係者</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">法的意味</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">1968年3月</td><td style="padding: 10px; border: 1px solid #e9ecef;">個室付浴場用地購入</td><td style="padding: 10px; border: 1px solid #e9ecef;">有限会社X</td><td style="padding: 10px; border: 1px solid #e9ecef;">営業準備開始</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">1968年5月</td><td style="padding: 10px; border: 1px solid #e9ecef;">建築確認・住民反対運動</td><td style="padding: 10px; border: 1px solid #e9ecef;">X・住民・行政</td><td style="padding: 10px; border: 1px solid #e9ecef;">適法な営業準備</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">1968年6月</td><td style="padding: 10px; border: 1px solid #e9ecef;">児童遊園設置認可</td><td style="padding: 10px; border: 1px solid #e9ecef;">余目町・山形県</td><td style="padding: 10px; border: 1px solid #e9ecef;">営業阻止目的</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">1968年8月</td><td style="padding: 10px; border: 1px solid #e9ecef;">営業開始・営業停止処分</td><td style="padding: 10px; border: 1px solid #e9ecef;">X・公安委員会</td><td style="padding: 10px; border: 1px solid #e9ecef;">風営法違反認定</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '浅田', expression: 'impressed', dialogue: 'なるほど、風営法の児童福祉施設から200m以内営業禁止規定を利用したのね' },
    { type: 'dialogue', speaker: '梶井', expression: 'serious', dialogue: 'でも問題は、その児童遊園設置認可が本来の目的ではなく、営業阻止が主たる目的だったことよね' },
    { type: 'dialogue', speaker: '新田', expression: 'thinking', dialogue: '行政権の濫用って、どういう基準で判断されるんスか？' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '最高裁は「主たる動機・目的」による判断をしたの。児童遊園の本来の目的は【児童福祉法40条】の児童の健全育成なのに【id:3】' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '本件では営業規制が主たる目的だったから、行政権の濫用に該当するってことね' },
    
    { type: 'embed', format: 'mermaid', title: '行政権濫用の判断構造', description: '濫用認定の判断プロセスを図解', content: 'graph TD\n    A[行政処分] --> B{本来の法定目的}\n    A --> C{実際の動機・目的}\n    B --> D[児童の健全育成]\n    C --> E[営業阻止]\n    D --> F{主たる目的の判断}\n    E --> F\n    F --> G[営業阻止が主目的]\n    G --> H[行政権の濫用]' },
    
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: 'そして重要なのは、この濫用処分の公定力の問題ね' },
    { type: 'dialogue', speaker: '新田', expression: 'confused', dialogue: '公定力って何っスか？' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '公定力っていうのは、行政処分が適法であると推定される効力のことよ。通常は取消訴訟で取り消されるまで有効とされる【id:4】' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: 'でも本件では、著しい濫用の場合は公定力が否定されるという重要な判断がなされたのよ' },
    { type: 'dialogue', speaker: '梶井', expression: 'impressed', dialogue: '最判昭53.6.16では、濫用処分は「個室付浴場業を規制しうる効力を有しない」とされたわね' },
    { type: 'dialogue', speaker: '新田', expression: 'excited', dialogue: 'つまり、処分自体は存在するけど、規制の根拠にはならないってことっスね！' },
    
    { type: 'embed', format: 'mermaid', title: '公定力と濫用処分の関係', description: '通常の処分と濫用処分の公定力の違い', content: 'graph LR\n    A[行政処分] --> B{濫用の程度}\n    B -->|通常の処分| C[公定力あり]\n    B -->|著しい濫用| D[公定力なし]\n    C --> E[取消まで有効]\n    D --> F[規制効力なし]\n    F --> G[刑事処罰不可]' },
    
    { type: 'dialogue', speaker: '理央', expression: 'thinking', dialogue: 'そして国家賠償の観点ではどうなるの？新田、教えて' },
    { type: 'dialogue', speaker: '新田', expression: 'happy', dialogue: '【国家賠償法1条1項】の公権力の違法な行使に該当するっス！最判昭53.5.26で認められました' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '処分が適法な形式を備えていても、実質的に濫用があれば違法になるのね' },
    { type: 'dialogue', speaker: '梶井', expression: 'serious', dialogue: '行政権の著しい濫用は、国家賠償法上の違法性を基礎づけるということね' },
    { type: 'dialogue', speaker: '理央', expression: 'impressed', dialogue: 'この事件は、形式的適法性と実質的適法性の区別を明確にした重要な判例ね' },
    
    { type: 'embed', format: 'html', title: '余目町事件の法的意義', description: '本判例が行政法に与えた影響を整理', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">法的論点</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">従来の理解</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">本判例の意義</th><th style="padding: 12px; font-size: 12px; border: 1px solid #ddd;">実務への影響</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">行政権の濫用</td><td style="padding: 10px; border: 1px solid #e9ecef;">形式的適法性重視</td><td style="padding: 10px; border: 1px solid #e9ecef;">実質的目的による判断</td><td style="padding: 10px; border: 1px solid #e9ecef;">濫用処分の厳格審査</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">公定力の限界</td><td style="padding: 10px; border: 1px solid #e9ecef;">取消まで有効</td><td style="padding: 10px; border: 1px solid #e9ecef;">著しい濫用は公定力否定</td><td style="padding: 10px; border: 1px solid #e9ecef;">刑事処罰の限界</td></tr><tr><td style="padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; font-weight: bold;">国家賠償責任</td><td style="padding: 10px; border: 1px solid #e9ecef;">形式的違法のみ</td><td style="padding: 10px; border: 1px solid #e9ecef;">実質的濫用も違法</td><td style="padding: 10px; border: 1px solid #e9ecef;">損害賠償の拡大</td></tr></tbody></table></div>' },
    
    { type: 'dialogue', speaker: '新田', expression: 'thinking', dialogue: 'ところで、この事件って二つの最高裁判決があるんスよね？' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: 'そうよ。昭53.5.26が国家賠償請求事件、昭53.6.16が刑事事件の判決ね' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '刑事事件では無罪、国賠事件では損害賠償認容という結論で一貫してるのね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '両方とも行政権の濫用を認定して、公権力の違法性を明確にしたわ' },
    { type: 'dialogue', speaker: '理央', expression: 'happy', dialogue: 'この事件のおかげで、行政権の濫用に対するチェック機能が強化されたのね' },
    
    { type: 'embed', format: 'mermaid', title: '余目町事件の判決構造', description: '二つの最高裁判決の関係性と結論', content: 'graph TD\n    A[余目町個室付浴場事件] --> B[刑事事件<br/>昭53.6.16]\n    A --> C[国賠事件<br/>昭53.5.26]\n    B --> D[行政権の濫用認定]\n    C --> E[行政権の濫用認定]\n    D --> F[公定力否定→無罪]\n    E --> G[国賠法上の違法→賠償]\n    F --> H[一貫した法理]\n    G --> H' },
    
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '現在でも、行政権の濫用の判断基準として重要な先例になってるよね' },
    { type: 'dialogue', speaker: '新田', expression: 'excited', dialogue: '行政手続の適正化にも大きな影響を与えた事件っスね！' },
    { type: 'dialogue', speaker: '梶井', expression: 'impressed', dialogue: '形式的な適法性だけでなく、実質的な適法性も重要だということを示した画期的判例ね' },
    { type: 'dialogue', speaker: '理央', expression: 'thinking', dialogue: 'でも実際の適用では、濫用の認定はかなり厳格に判断されてるのよね' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: 'そうね。余目町事件ほど明確な濫用事例は珍しいから、この判例の射程は限定的かも' },
    { type: 'dialogue', speaker: '新田', expression: 'normal', dialogue: 'でも行政権の濫用をチェックする重要な法理として確立されたことは間違いないっス' },
    { type: 'narration', text: '4人は余目町事件の複雑な法的構造について理解を深めることができた。夕日がベア研部室に差し込む中、充実した勉強時間を過ごしていた' },
    
    { type: 'embed', format: 'mermaid', title: '行政権濫用法理の現代的意義', description: '余目町事件が現代行政法に与える影響', content: 'graph LR\n    A[余目町事件] --> B[行政権濫用法理]\n    B --> C[実質的適法性の重視]\n    B --> D[公定力の相対化]\n    B --> E[国家賠償責任の拡大]\n    C --> F[現代行政法への影響]\n    D --> F\n    E --> F' },
    
    { type: 'dialogue', speaker: '理央', expression: 'happy', dialogue: '今日はありがとう。余目町事件の法的意義がよく理解できたわ' },
    { type: 'dialogue', speaker: '浅田', expression: 'happy', dialogue: 'こちらこそ、とても勉強になった。行政法の奥深さを感じるね' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: '行政権の濫用という概念の重要性がよく分かったわ' },
    { type: 'dialogue', speaker: '新田', expression: 'excited', dialogue: '国家賠償法の観点からも非常に興味深い事件でしたっス！' },
    { type: 'narration', text: '4人は満足そうにベア研部室を後にした。西武新宿線田無駅方面へ向かう夕暮れの道で、今日学んだ行政権の濫用について話し合いながら帰路についた' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: '<h3 class="text-xl font-bold mb-4">余目町個室付浴場事件と行政権の濫用</h3><p class="mb-4">余目町個室付浴場事件は、行政権の濫用と公定力の関係について重要な判断を示した画期的な判例です。最判昭53.5.26（国家賠償）と最判昭53.6.16（刑事）の二つの判決により、行政法の基本原理が確立されました。</p><h4 class="text-lg font-bold mt-6 mb-2">事案の概要</h4><p class="mb-4">山形県余目町において、個室付浴場営業の阻止を目的として、町と県が児童遊園設置認可処分を行った事案です。風営法の児童福祉施設から200m以内営業禁止規定を利用した営業阻止策でした。</p><h4 class="text-lg font-bold mt-6 mb-2">行政権の濫用の判断基準</h4><p class="mb-4">最高裁は「主たる動機・目的」による判断基準を示しました：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">本来の法定目的</span>：【児童福祉法40条】の児童の健全育成</li><li><span class="text-red-600 font-bold">実際の動機・目的</span>：個室付浴場営業の阻止</li><li><span class="text-red-600 font-bold">客観的必要性</span>：営業規制以外の緊急性の欠如</li></ul><p class="mb-4">営業阻止が主たる目的である場合、行政権の著しい濫用に該当するとされました。</p><h4 class="text-lg font-bold mt-6 mb-2">公定力の限界</h4><p class="mb-4">最判昭53.6.16は、行政権の濫用に相当する処分の公定力について重要な判断を示しました：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">通常の処分</span>：取消訴訟により取り消されるまで有効（公定力あり）</li><li><span class="text-red-600 font-bold">著しい濫用処分</span>：規制効力を有しない（公定力の否定）</li></ul><p class="mb-4">本件児童遊園設置認可は「個室付浴場業を規制しうる効力を有しない」とされ、刑事処罰の根拠とならないと判断されました。</p><h4 class="text-lg font-bold mt-6 mb-2">【国家賠償法1条1項】の適用</h4><p class="mb-4">最判昭53.5.26は、行政権の濫用と国家賠償責任について判断しました：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">形式的適法性</span>：処分が法定要件を満たしていても</li><li><span class="text-red-600 font-bold">実質的違法性</span>：濫用があれば【国家賠償法1条1項】の違法行為</li><li><span class="text-red-600 font-bold">損害賠償</span>：営業阻止による損害について賠償責任</li></ul><h4 class="text-lg font-bold mt-6 mb-2">現代的意義</h4><p class="mb-4">本判例は以下の点で現代行政法に重要な影響を与えています：</p><ul class="list-disc list-inside mb-4 pl-4 space-y-2"><li><span class="text-red-600 font-bold">実質的適法性の重視</span>：形式的要件充足だけでは不十分</li><li><span class="text-red-600 font-bold">公定力の相対化</span>：著しい濫用の場合の例外</li><li><span class="text-red-600 font-bold">行政統制の強化</span>：司法による行政権のチェック機能</li></ul><div class="bg-yellow-100 p-4 rounded-lg mt-6"><h5 class="font-bold text-yellow-800">司法試験ポイント</h5><p>行政権の濫用は論文式で頻出の論点です。「主たる動機・目的」による判断基準を正確に理解し、公定力との関係、国家賠償責任との関係を体系的に論述できるようにしましょう。また、形式的適法性と実質的適法性の区別も重要なポイントです。</p></div>',

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "行政権の濫用と公定力の総合問題",
      rank: "S",
      background: 'A市では、理央の実家が経営する小規模な娯楽施設の営業に対して住民から反対の声が上がった。A市は、この営業を阻止するため、当該施設から150m以内にある市有地について、急遽「児童公園」としての都市公園設置許可を申請し、県知事から許可を得た。その結果、都市公園法により当該娯楽施設の営業が制限されることとなった。理央の実家は、この都市公園設置許可の取消しを求めるとともに、A市に対して国家賠償請求を行った。なお、当該市有地については、これまで児童公園設置の具体的な計画や住民要望は存在しなかった。',
      subProblems: [
        {
          title: "行政権の濫用の成否",
          rank: "S",
          relatedQAs: [1, 2],
          problem: "A市の都市公園設置許可処分は行政権の濫用に該当するか。",
          hint: "余目町事件の判断基準である「主たる動機・目的」を適用する",
          points: ["本来の法定目的と実際の目的の乖離", "客観的必要性・緊急性の有無", "主たる動機・目的による判断"],
          modelAnswer: "A市の都市公園設置許可処分は行政権の濫用に該当する。余目町事件の判断基準によれば、行政処分が本来の法定目的と異なる動機・目的でなされた場合に濫用となる。本件では、都市公園の本来の目的は住民の健康増進・レクリエーション等であるが、実際の主たる目的は理央の実家の娯楽施設営業阻止である。また、これまで児童公園設置の計画や住民要望が存在しなかったことから、客観的必要性・緊急性も認められない。したがって、営業阻止が主たる動機・目的である本件処分は、行政権の著しい濫用に該当する。"
        },
        {
          title: "濫用処分の公定力",
          rank: "A",
          relatedQAs: [3],
          problem: "本件都市公園設置許可処分に公定力は認められるか。",
          hint: "余目町事件における公定力否定の法理を検討する",
          points: ["著しい濫用処分の公定力", "規制効力の有無", "取消訴訟との関係"],
          modelAnswer: "本件都市公園設置許可処分に公定力は認められない。余目町事件（最判昭53.6.16）によれば、行政権の著しい濫用に相当する処分は公定力を有せず、規制効力を持たない。本件処分は営業阻止を主たる目的とする著しい濫用であり、理央の実家の娯楽施設営業を規制する効力を有しない。ただし、処分自体は存在するため、確認的意味で取消訴訟を提起することは可能である。"
        },
        {
          title: "国家賠償責任の成否",
          rank: "A",
          relatedQAs: [4, 7],
          problem: "A市の国家賠償責任は認められるか。",
          hint: "【国家賠償法1条1項】における行政権濫用の違法性を検討する",
          points: ["公権力の違法な行使", "形式的適法性と実質的違法性", "損害の発生と因果関係"],
          modelAnswer: "A市の国家賠償責任は認められる。余目町事件（最判昭53.5.26）によれば、行政権の著しい濫用は【国家賠償法1条1項】の公権力の違法な行使に該当する。本件都市公園設置許可処分は、形式的には適法要件を満たしていても、実質的には営業阻止を目的とする濫用であり違法である。この違法な処分により理央の実家は営業制限を受け、損害が発生している。したがって、A市は国家賠償責任を負う。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
