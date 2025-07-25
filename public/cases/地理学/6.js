export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: '地理学-6',
  title: '【都市地理学】都市システムと順位・規模の法則',
  category: '地理学',
  citation: '長田進『総合科目 地理学Ⅰ(6)都市の階層性(1)』',
  rank: 'A',
  tags: ['都市地理学', '都市システム', '順位規模の法則', 'プライメイトシティ', '階層性', '都市雇用圏'],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `
【都市システムと階層性】\n
- **都市システム**: 個々の都市を孤立したものとしてではなく、相互に結びついた一つのネットワーク（階層構造を持つシステム）として捉える考え方【id:1】。\n
- **行政的な階層**: 日本では、政令で指定される「指定都市」（人口50万人以上）や「中核市」（人口20万人以上）といった行政上の階層が存在し、権限が異なる【id:2】。\n
\n
【都市の順位・規模の法則】\n
- **基本法則**: ある国や地域の都市を人口順に並べた時、「i番目の都市の人口(Pi)は、第1位都市の人口(P1)をその順位(i)で割ったものにほぼ等しくなる（Pi = P1 / i）」という経験則【id:3】。\n
- **グラフ上の特徴**: 横軸に順位、縦軸に人口をとり、両方を対数でプロットした「両対数グラフ」上では、この法則に従う都市分布は右下がりの直線となる【id:4】。\n
\n
【分布の3パターン】\n
- **理論型（順位・規模の法則型）**: グラフ上で直線状になるパターン。多くの先進国で見られる【id:5】。\n
- **プライメイト型（首位都市型）**: 第1位都市の人口が突出して大きいパターン。発展途上国に多い【id:6】。\n
- **ポリーナリー型（均等分布型）**: 上位の複数の都市の人口規模が拮抗しているパターン。国土が広い国などで見られる【id:7】。\n
\n
【分析上の注意点】\n
- **定義の影響**: この法則は、分析に用いる「都市」の定義（例：行政区画である「市部」か、機能的範囲である「都市雇用圏」か）によって、結果のグラフ形状が大きく異なるため、注意が必要である【id:8】。\n
`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    {
      id: 1,
      rank: 'S',
      question: '都市の「順位・規模の法則」とは何か、簡潔に説明しなさい。',
      answer: 'ある国の都市を人口順に並べた時、i番目の都市の人口は、{{第1位都市の人口をその順位iで割ったものにほぼ等しくなる}}という経験則です。'
    },
    {
      id: 2,
      rank: 'A',
      question: '順位・規模の法則を検証するためによく用いられる「両対数グラフ」上では、法則によく当てはまる都市の分布はどのような形になりますか？',
      answer: '右下がりの{{直線}}になります。'
    },
    {
      id: 3,
      rank: 'A',
      question: '都市の人口分布における「プライメイト型（首位都市型）」とはどのようなパターンですか？',
      answer: '第1位の都市の人口が、2位以下の都市に比べて{{突出して大きい}}パターンです。'
    },
    {
      id: 4,
      rank: 'A',
      question: '都市の人口分布における「ポリーナリー型（均等分布型）」とはどのようなパターンですか？',
      answer: '第1位の都市と2位以下の複数の上位都市の間に人口規模の差が小さく、{{複数の大規模な都市が拮抗している}}パターンです。'
    },
    {
      id: 5,
      rank: 'S',
      question: '順位・規模の法則を分析する際に、なぜ「市部」と「都市雇用圏」といった都市の定義の違いに注意する必要があるのですか？',
      answer: '用いる定義によって各都市の{{人口データそのものが変わる}}ため、結果として描かれる{{グラフの形状が大きく変化}}し、その国の都市システムに対する評価が変わってしまう可能性があるからです。'
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ベア研の部室。テーブルの上には大きな日本地図が広げられ、メンバーたちがのぞき込んでいる。' },
    { type: 'narration', text: '「ご当地ベア」プロジェクトは、どの都市をピックアップするかの議論に移っていた。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '東京とか大阪とか横浜は大きいから絶対作るとして…その次の都市ってどこなんだろう？市のランキングみたいなのって、あるのかな？' },
    { type: 'dialogue', speaker: '浅田', expression: 'cool', dialogue: '良い質問だね、みかん。都市の規模にははっきりとした階層構造があるんだ。それを分析する面白い法則があって、「順位・規模の法則」って言うんだよ。【id:3】' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: 'ああ、聞いたことある。i番目に大きい都市の人口は、1番大きい都市の人口をiで割った数になる、っていう経験則のことよね？【id:3】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'desperate', dialogue: 'え、えっと…アイ…？アイぶんのいち…？ご、ごめん、ちょっとよく分からない…。' },
    { type: 'narration', text: '梶井は呆れたようにため息をつきつつも、スマホで分かりやすい例を探して、みかんに見せた。' },
    {
      type: 'embed',
      format: 'html',
      title: '順位・規模の法則の簡単な例',
      description: 'もし法則が完璧に成り立つなら…という思考実験。',
      content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white; text-align: left;"><thead><tr style="background: #e3f2fd; color: #1e88e5;"><th style="padding: 12px;">順位</th><th style="padding: 12px;">都市名(仮)</th><th style="padding: 12px;">人口</th><th style="padding: 12px;">計算式</th></tr></thead><tbody><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">1位</td><td style="padding: 10px;">東京</td><td style="padding: 10px;">1200万人</td><td style="padding: 10px;">1200万 ÷ 1</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">2位</td><td style="padding: 10px;">大阪</td><td style="padding: 10px; font-weight: bold;">600万人</td><td style="padding: 10px;">1200万 ÷ 2</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">3位</td><td style="padding: 10px;">名古屋</td><td style="padding: 10px; font-weight: bold;">400万人</td><td style="padding: 10px;">1200万 ÷ 3</td></tr><tr><td style="padding: 10px;">10位</td><td style="padding: 10px;">福岡</td><td style="padding: 10px; font-weight: bold;">120万人</td><td style="padding: 10px;">1200万 ÷ 10</td></tr></tbody></table></div>'
    },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'なるほど！順位で割るだけなんだ！分かりやすい！' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: 'でも、これはあくまで理論上の話。実際には、国によってパターンが違うんだ。それを見るために「両対数グラフ」というものを使うよ。【id:4】' },
    { type: 'narration', text: '浅田はパソコンを操作し、モニターに3つのパターンを示したグラフを映し出した。' },
    { type: 'embed', format: 'mermaid', title: '都市分布パターンの分類', description: '都市分布の3パターンをシンプルに分類。', content: 'graph TD\n    A[都市分布パターン] --> B[理論型]\n    A --> C[プライメイト型]\n    A --> D[ポリーナリー型]' },
    { type: 'embed', format: 'mermaid', title: '各パターンの例', description: '各分布パターンの代表的な国の例。', content: 'graph TD\n    B[理論型] --> E[米国など]\n    C[プライメイト型] --> F[タイ・韓国]\n    D[ポリーナリー型] --> G[豪州]' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: '私の父の会社が取引してるタイは、まさにプライメイト型ね。首都のバンコクに人口も経済も文化も、何もかもが集中してるって言ってた。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'じゃあ、日本はどれに当てはまるの？東京がすごく大きいから、プライメイト型かな？' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: 'それが、そう単純じゃないんだよ、タチバナ。前回の勉強会でやった「都市の定義」がここで効いてくる。どの定義を使うかで、グラフの形が全然違ってくるからね。【id:8】' },
    { type: 'narration', text: '梶井は、国勢調査のデータから作成された2種類のグラフを並べて見せた。一つは「市部」人口、もう一つは「都市雇用圏」人口に基づいたものだ。' },
    { type: 'dialogue', speaker: '浅田', expression: 'normal', dialogue: '見て。左の「市部」のグラフは、上位の都市が直線から少し外れて、少しプライメイト型に近い。でも、右の「都市雇用圏」で見ると、かなり綺麗な直線、つまり理論型に近くなる。【id:8】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'annoyed', dialogue: 'えー、また分かんなくなってきた！なんで定義が違うだけで形が変わっちゃうの？' },
    { type: 'dialogue', speaker: '理央', expression: 'impressed', dialogue: 'それは、市部はあくまで行政の区画だからよ。都市雇用圏は、通勤・通学の人の流れ、つまり経済的なつながりの実態を表している。だから、都市雇用圏で見た方が、都市の本当の力関係や階層構造が分かりやすくて、法則に合いやすいってことだと思う。【id:8】' },
    { type: 'dialogue', speaker: '梶井', expression: 'smug', dialogue: 'そういうこと。つまり、私たちが「ご当地ベア」を作るにしても、「○○市ベア」と名乗るのと、「○○都市圏ベア」と名乗るのとでは、その都市の「格」の捉え方が全然違うって話になる。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'そっかー！奥が深い！じゃあ、ただ大きい市のベアを作るだけじゃなくて、「この都市圏のベアです」って言った方が、地理学的には正しい感じがするね！' },
    { type: 'dialogue', speaker: '浅田', expression: 'laughing', dialogue: 'ふふ、みかんもだいぶ分かってきたね。この法則を使えば、日本の都市システムが、世界的に見てどんな特徴を持っているのかが分析できる。面白いテーマだよ。' },
    { type: 'narration', text: 'みかんは、単なる市の人口ランキングの裏に、国の構造を示す壮大な法則が隠れていることを知り、深く感心するのだった。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
<h3 class="text-xl font-bold mb-4">都市の階層構造と「順位・規模の法則」</h3>
<p class="mb-4">
  ある国の都市は、それぞれが孤立して存在するのではなく、互いに影響を与え合いながら、一つの大きな「都市システム」を形成しています。このシステムの中には、大都市から中小都市まで、明確な階層（ヒエラルキー）が存在します。この階層構造を分析するための強力なツールが「順位・規模の法則」です。
</p>

<h4 class="text-lg font-bold mt-6 mb-2">1. 順位・規模の法則とは？</h4>
<p class="mb-4">
  これは、ある国の都市を人口順に並べた時、「i番目の都市の人口は、第1位都市の人口を順位iで割ったものにほぼ等しくなる」という驚くべき経験則です。数式では <b>Pi = P1 / i</b> と表されます。この法則が当てはまる国では、都市の規模と順位が非常に規則的な関係にあることを意味します。この関係を横軸に順位の対数、縦軸に人口の対をとった「両対数グラフ」で示すと、都市の分布はきれいな右下がりの直線を描きます。
</p>

<h4 class="text-lg font-bold mt-6 mb-2">2. 3つの分布パターン</h4>
<p class="mb-4">
  全ての国がこの法則に当てはまるわけではありません。都市の分布は、主に以下の3つのパターンに分類されます。
</p>
<ul class="list-disc list-inside mb-4 pl-4 space-y-2">
  <li><span class="text-blue-600 font-bold">理論型（順位・規模の法則型）</span>: グラフ上で直線状になるパターン。多様な規模の都市がバランス良く発達し、国全体として統合された都市システムを持つ先進国（例：アメリカ）に多く見られます。</li>
  <li><span class="text-blue-600 font-bold">プライメイト型（首位都市型）</span>: 第1位の都市（プライメートシティ）の人口が、2位以下を圧倒して突出しているパターン。政治・経済機能の一極集中が著しい国（例：タイ、韓国）で見られます。</li>
  <li><span class="text-blue-600 font-bold">ポリーナリー型（均等分布型）</span>: 上位の複数の都市の規模が拮抗しているパターン。国土が広く、複数の拠点が独立して発展した国（例：オーストラリア）で見られます。</li>
</ul>

<h4 class="text-lg font-bold mt-6 mb-2">3. 分析における注意点：都市の定義</h4>
<p class="mb-4">
  順位・規模の法則を分析する上で最も重要な注意点は、分析の基となる「都市」の定義です。例えば、日本の都市を行政区画である「市部」で分析した場合と、経済的なつながりを反映した「都市雇用圏」で分析した場合とでは、グラフの形状が大きく異なります。一般的に、経済的実態をより反映する都市雇用圏で分析した方が、法則性がより明瞭に現れるとされています。これは、どの「ものさし」で測るかによって、都市システムの見え方が変わることを示しています。
</p>

<div class="bg-yellow-100 p-4 rounded-lg mt-6">
  <h5 class="font-bold text-yellow-800">学習のポイント</h5>
  <p>順位・規模の法則は、単に都市の人口ランキングを数式で示したものではありません。その国の歴史的背景や政治・経済構造が、都市の階層システムにどのように反映されているかを読み解くための「鍵」となります。ある国の都市分布がなぜプライメイト型なのか、なぜ理論型に近いのかを考察することで、その国の地域構造に対する深い理解を得ることができます。</p>
</div>
`,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: 'ミニ論文：順位・規模の法則を用いた都市システム分析',
      rank: 'A',
      background: `
新田さんは、ベア研のレポート作成のため、発展途上国であるX国と、先進国であるY国の都市システムを比較している。\n
- **X国**: 首都である「タチバナ・シティ」に人口と機能が極端に集中しており、第2位の都市の人口は首都の5分の1にも満たない。\n
- **Y国**: 国土が広く、地域ごとに「シミズ・シティ」「イワキ・シティ」「ヨシオカ・シティ」といった規模の近い大都市が複数存在し、それぞれが独自の経済圏を形成している。\n
新田さんは、この2国の都市システムの特徴を、順位・規模の法則を用いて説明しようとしている。
`,
      subProblems: [
        {
          title: '小問1',
          rank: 'A',
          relatedQAs: [3, 4],
          problem: 'X国とY国の都市人口分布は、「順位・規模の法則」におけるどの分布パターンに該当する可能性が高いか、それぞれの国の特徴と関連付けて述べなさい。',
          hint: 'X国は一極集中型、Y国は多極分散型です。それぞれの特徴がどのパターン（プライメイト型、ポリーナリー型）に対応するか考えましょう。',
          points: [
            'プライメイト型とポリーナリー型の分布パターンの特徴を正しく説明できているか。',
            'X国の一極集中という特徴をプライメイト型に、Y国の多極分散という特徴をポリーナリー型に、それぞれ正しく結び付けられているか。'
          ],
          modelAnswer: `
X国とY国の都市システムは、順位・規模の法則における異なる分布パターンを示す可能性が高い。\n
1.  **X国**: 首都「タチバナ・シティ」に人口と機能が極端に集中し、第2位以下の都市との格差が非常に大きいという特徴から、X国は「プライメイト型（首位都市型）」分布に該当すると考えられる。これは、国の発展が単一の都市に過度に依存している、発展途上国に典型的に見られるパターンである。\n
2.  **Y国**: 複数の大規模な都市がそれぞれ地域経済の核となり、人口規模も拮抗しているという特徴から、Y国は「ポリーナリー型（均等分布型）」分布に該当すると考えられる。これは、国土が広く、複数の拠点がバランス良く発展した国で見られるパターンである。
`
        },
        {
          title: '小問2',
          rank: 'B',
          relatedQAs: [1],
          problem: 'もし、Y国の第1位都市「シミズ・シティ」の人口が800万人だった場合、「順位・規模の法則」が理論通りに当てはまると仮定して、Y国の第4位都市の人口を推計しなさい。',
          hint: '法則の基本公式 Pi = P1 / i を使って計算しましょう。',
          points: [
            '順位・規模の法則の公式を正しく理解し、適用できているか。',
            '計算が正確に行われているか。'
          ],
          modelAnswer: `
順位・規模の法則の公式 Pi = P1 / i を用いる。\n
- 第1位都市の人口 (P1) = 800万人\n
- 求める都市の順位 (i) = 4\n
計算式: P4 = 8,000,000人 ÷ 4 = 2,000,000人\n
よって、第4位都市の人口は200万人と推計される。
`
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};