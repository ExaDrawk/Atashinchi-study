export default {
  id: '4.32-39',
  category: '刑法',
  subcategory: '4',
  // === 1. モジュール基本情報 ============
  title: '教唆・幇助と故意のズレ',
  citation: 'みかん、共犯論で大ピンチっ',
  rank: 'A',
  tags: ['刑法', '総論', '共犯', '教唆', '幇助', '共同正犯'],
  category: '刑法',
  subcategory: '4',

  // === 2. 参照Q&A（メイン：4-32〜4-39） ============
  questionsAndAnswers: [
    '刑法.4.〔32.39〕'
  ],

  // === 3. ストーリー ===================
  story: [
    { type: 'bgm' },
    { type: 'background' },
    { type: 'scene', text: '東京都立井草高校の教室。放課後の刑法補講の時間。' },
    { type: 'narration', text: '定期テスト前の補講で、村上先生が共犯論の総まとめとして、{{教唆}}・{{幇助}}と{{共同正犯}}を絡めた事案演習を始めようとしている。', check: "0,1,1" },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '今日の補講。{{教唆}}と{{幇助}}、それから{{共同正犯}}の整理。特に故意の食い違いと連鎖的共犯。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'nervous', dialogue: '共犯論って、用語だけで頭がぐるぐるするんだけど……。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'nervous', dialogue: 'みかん、ちょっと復習しておきたいね。まず{{教唆}}って何だったか思い出そうよ【id:32】。', check: "1" },
    { type: 'embed', format: 'board', title: '教唆と幇助の基本整理', description: '村上先生が黒板に書いた共犯類型の基本構造', content: "【1】{{教唆}}【id:32】\n・人に特定の犯罪を実行する決意を生じさせる行為\n\n【2】{{幇助}}【id:33】\n・他人の犯罪を{{容易ならしめる}}行為\n\n【3】共通点・相違点【id:34】\n・いずれも正犯の犯行を外から支える\n・ただし、{{教唆}}は犯意形成への決定的な{{動機付け}}に重点\n・{{精神的幇助}}は単なる{{意思強化}}にとどまる場合が中心" },
    { type: 'dialogue', speaker: '吉岡', expression: 'thinking', dialogue: 'じゃあ、タチバナが「サボっちゃえよ」って言って、相手が初めてサボる気になるのが{{教唆}}ってイメージか【id:32】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'cool', dialogue: 'おおむね、その方向。∵正犯者の心理における犯罪実行の可否について{{決定的な動機付け}}を与えるのが{{教唆}}【id:34】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '一方、すでに犯意を持っている者に「やっぱりやろうよ」と背中を押すだけなら、多くは{{精神的幇助}}にとどまる【id:34】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'その「決定的」とか「背中を押すだけ」とかの線引きが、答案だと書きにくいんだよね……。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'impressed', dialogue: 'だからこそ、正犯者の犯意状況と、発言前後の変化を事実関係から具体的に拾う。∴心理過程の分析がポイント【id:34】。' },
    { type: 'scene', text: '村上先生は、プリントを配りながら別の論点に話題を移す。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '次。連鎖的共犯。いわゆる{{再間接教唆}}と{{間接幇助}}【id:35】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: '連鎖的って、教唆の教唆とか、幇助の幇助みたいなやつ？【id:35】' },
    { type: 'dialogue', speaker: '村上先生', expression: 'normal', dialogue: 'そう。AがBを{{教唆}}し、BがCを{{教唆}}してCが実行する、みたいなパターン【id:35】。' },
    { type: 'embed', format: 'board', title: '連鎖的共犯のイメージ', description: '再間接教唆・間接幇助の因果連鎖イメージ図', content: "A（上位者） → B（中間教唆者） → C（正犯）\n　　｜　　　　　　｜　　　　　　｜\n　　└──── 犯意・計画の伝播 ────┘\n\n・AがBを{{教唆}}し、BがCを{{教唆}}→ Aも{{教唆者}}（{{再間接教唆}}）【id:35】\n・AがBを{{幇助}}し、そのBがCの犯行を支える→ AはCに対する{{間接幇助}}になり得る【id:35】\n・いずれも、正犯の行為に因果的に寄与しているかが核心" },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'thinking', dialogue: '誰に向けた{{教唆}}・{{幇助}}なのか、頭の中でちゃんと線をたどらないといけないってことだよね【id:35】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'うっかり「教唆の教唆は条文ないから不可罰」とか書いちゃいそう……。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'angry', dialogue: '条文の文言だけで短絡しない。∵【刑法61条1項】は「{{教唆者}}」を広くとらえられるように構造化されている【id:35】。' },
    { type: 'scene', text: '議論は、{{過失}}と共犯の関係に移る。' },
    { type: 'dialogue', speaker: '吉岡', expression: 'smug', dialogue: 'じゃ、「うっかり」人をそそのかしたら、{{過失による教唆}}ってあり？【id:36】' },
    { type: 'dialogue', speaker: '村上先生', expression: 'cool', dialogue: '用語としては出てくるが、{{教唆}}はそもそも「故意に犯意を生ぜしめる」概念。∴{{過失による教唆}}は語義に反し不可罰【id:36】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '同様に、{{過失による幇助}}も、他人の犯罪に加功する意思、つまり{{幇助の故意}}を欠くから不可罰【id:36】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'じゃあ、「{{過失犯}}の{{教唆}}」はどうなるの？　そもそも犯意ないよね【id:37】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '{{過失犯}}は「結果発生の認容」がないから、そこに新たに犯意を生ぜしめること自体が観念できない。∴{{過失犯の教唆}}は不可罰【id:37】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'thinking', dialogue: '一方、{{過失犯の幇助}}については、可罰説と不可罰説が対立【id:37】。答案では両説の根拠を押さえる。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'impressed', dialogue: '「片面的でもいいから、{{正犯}}を{{幇助}}すれば足りる」っていう可罰説と、処罰範囲の無限定な拡大を心配する不可罰説だよね【id:37】。' },
    { type: 'scene', text: '少し休憩を挟んだあと、村上先生はプリントの中の「中立的行為」の設問を指さす。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '次のテーマ。いわゆる{{中立的行為}}による{{幇助}}【id:38】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '普通の商売とか、技術提供が、結果的に犯罪に使われちゃうパターンだよね……？【id:38】' },
    { type: 'embed', format: 'board', title: '中立的行為による幇助の三つの整理視点', description: '答案で使いやすい三つのアプローチ', content: "【1】{{幇助行為}}を限定する立場【id:38】\n・{{有用性}}が広く一般的な場合、「{{幇助行為}}性」を否定\n\n【2】{{幇助の故意}}を厳格に要求する立場【id:38】\n・{{確定的故意}}や犯罪促進の意思を要求\n\n【3】{{違法性阻却}}の方向から整理する立場【id:38】\n・{{刑法の謙抑性}}から【刑法35条】による{{違法性阻却}}の余地を検討" },
    { type: 'dialogue', speaker: '吉岡', expression: 'smug', dialogue: '答案では、「客観面で限定」「主観面で限定」「{{違法性}}レベルで調整」の3段階で整理すれば見栄えしそう【id:38】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: '図で見るとちょっとスッキリしたかも……。' },
    { type: 'scene', text: '最後に、故意の内容が異なる{{共同正犯}}の事案が提示される。' },
    { type: 'embed', format: 'document', title: '演習プリント：故意の内容が異なる共同正犯', description: '村上先生が配布した事案プリントの一部', content: "[center]演習：甲と乙の共犯事例[/center]\n\n甲はAを殺害する意思（殺意）をもって包丁を持ち出し、\n乙はAに傷害を加えるにとどめる意思で、甲と共にAに切りかかった。\nAは甲の行為により死亡した。\n\n問：甲・乙間にどのような範囲で{{共同正犯}}が成立するか論じなさい【id:39】。", textAlign: 'left' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'thinking', dialogue: 'これって、いわゆる「部分的に犯罪が重なり合う」ケースだよね【id:39】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: 'そう。判例は、構成要件が同質で重なり合う部分について{{共同正犯}}の成立を認める、いわゆる{{部分的犯罪共同説}}【id:39】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'thinking', dialogue: '∴甲・乙の間では{{傷害致死罪}}の限度で{{共同正犯}}。甲には別途、単独の{{殺人罪}}が問題になると整理する【id:39】。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: '同じ行為をしていても、「どこで構成要件が重なっているか」をちゃんと分けて書く感じか……。' },
    { type: 'dialogue', speaker: '吉岡', expression: 'smug', dialogue: '罪名の一致だけ追いかけてると落とし穴にはまりそうだな。' },
    { type: 'scene', text: 'チャイムが鳴り、補講の時間が終わりに近づく。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'cool', dialogue: '今日の補講、まとめ。{{教唆}}と{{幇助}}の意義【id:32】【id:33】、境界としての{{精神的幇助}}【id:34】、連鎖的共犯【id:35】、{{過失}}との関係【id:36】【id:37】、{{中立的行為}}【id:38】、故意内容のズレと{{共同正犯}}【id:39】。' },
    { type: 'dialogue', speaker: '村上先生', expression: 'serious', dialogue: '答案。まず各概念の定義を正確に書く。次に事実関係をあてはめて、どこで線を引くかを論証。ここで今日の整理を使う。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'nervous', dialogue: 'うう……覚えること多いけど、今日の黒板をノートに写してから帰ろう……。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'happy', dialogue: '一緒に答案構成の練習もしようよ、みかん。共犯論、今のうちに固めちゃおう。' }
  ],
  studyRecords: [
        {
            date: "2025-12-12",
            timestamp: "2025-12-12T15:44:11.268Z"
        },
        {
            date: "2025-12-06",
            timestamp: "2025-12-06T13:55:44.255Z"
        }
    ]
};
