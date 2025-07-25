export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: 'toshichirigaku-covid-toshihenka',
  title: '【都市地理学】コロナ禍と都市の変化',
  category: 'toshichirigaku',
  citation: '長田進『総合科目 地理学Ⅰ(11)コロナ禍をきっかけとして都市について改めて考える』',
  rank: 'A',
  tags: ['都市地理学', 'コロナ禍', 'リモートワーク', '人口移動', '都心回帰', '東京一極集中'],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `
【コロナ禍と都市の未来をめぐる議論】\n
2020年以降の新型コロナウイルスのパンデミックは、都市のあり方について世界的な議論を巻き起こした。その見方は、主に「悲観論」と「楽観論」に大別される【id:1】。\n
- **悲観論**:
  - **人口流出**: 感染リスクの高い「密」な環境を避け、人々が都市から流出する【id:2】。
  - **リモートワークの影響**: リモートワークの普及によりオフィスの需要が減少し、不動産市場や周辺のサービス業が悪化、都市経済が衰退する【id:3】。
  - **財政悪化**: 人口や企業の減少が税収減につながり、行政サービスが低下することで、さらに都市の魅力が失われるという悪循環に陥る【id:4】。\n
- **楽観論**:
  - **歴史的経験**: 都市は過去にもペストなど数多のパンデミックを経験したが、その度に必ず復活してきた【id:5】。
  - **イノベーションの源泉**: 優秀な人材が集住し、対面で交流することによって生まれるイノベーションこそが都市の本質的な強みであり、これはリモートでは代替できない【id:6】。\n
\n
【日本の人口移動の実態】\n
- **東京圏からの転出**: コロナ禍で東京23区からの転出は増加したが、その多くは神奈川、埼玉、千葉といった隣接県への移動であった【id:7】。
- **地方中核都市の動向**: 札幌、仙台、福岡といった地方の中核都市は、コロナ禍においても転入超過の傾向が続いた【id:8】。\n
- **二極化**: 結果として、完全な「脱・東京」ではなく、リモートワークの普及を機に郊外の広い住環境を求める層と、都心の利便性を重視し続ける層との「二極化」が進んだと見られている【id:9】。\n
`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    {
      id: 1,
      rank: 'A',
      question: 'コロナ禍以降の都市の未来について、対立する2つの主要な見解は何ですか？',
      answer: '都市の力が弱まるとする「{{悲観論}}」と、都市は復活しその力は続くと考える「{{楽観論}}」です。'
    },
    {
      id: 2,
      rank: 'A',
      question: '都市の未来に対する悲観論の主な論拠を3つ挙げなさい。',
      answer: '①感染リスクを避けるための{{人口流出}}、②{{リモートワークの普及}}によるオフィス需要の減少、③人口や企業の減少に伴う{{財政の悪化}}です。'
    },
    {
      id: 3,
      rank: 'B',
      question: '都市の未来に対する楽観論が、その根拠として挙げる「歴史的な経験」とはどのようなことですか？',
      answer: '都市は過去にもペストやコレラといった{{深刻なパンデミックに何度も見舞われた}}が、その度に衰退から立ち直り、復活してきたという経験です。'
    },
    {
      id: 4,
      rank: 'S',
      question: 'コロナ禍において、東京23区からの転出者が最も多く移動した先は、どのような地域でしたか？',
      answer: '遠隔地の地方ではなく、{{神奈川県横浜市、川崎市、埼玉県さいたま市}}といった、東京に隣接する郊外の都市でした。'
    },
    {
      id: 5,
      rank: 'A',
      question: 'コロナ禍における札幌、仙台、福岡といった地方中核都市の人口移動には、どのような傾向が見られましたか？',
      answer: '東京圏とは異なり、転出超過にはならず、{{転入超過の傾向が継続}}しました。'
    },
    {
      id: 6,
      rank: 'A',
      question: 'コロナ禍による人々の移住の動きは、単純な「都市からの脱出」ではなく、どのような現象として捉えられていますか？',
      answer: '都心に留まる層と、郊外の広い住環境を求める層に分かれる「{{二極化}}」現象として捉えられています。'
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ベア研の部室。文化祭の企画も一段落し、メンバーたちはお茶を飲みながら雑談に花を咲かせている。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'はー、やっと落ち着いたねー。でも、コロナのせいで文化祭もまだどうなるか分かんないし、なんか色々変わっちゃったよね。' },
    { type: 'dialogue', speaker: '新田', expression: 'normal', dialogue: 'ホントっスよねー。一時期、学校もずっとリモートだったし。私の知り合いの大学生の先輩、大学の近くに高い家賃で引っ越したのに、結局ずっと実家でリモート授業だったってボヤいてたッスよ。' },
    { type: 'dialogue', speaker: '理央', expression: 'thinking', dialogue: 'リモートワークやリモート授業が普及したことで、専門家の間では「大都市の未来」について大きな議論が起きたのよね。' },
    { type: 'narration', text: '理央はそう言うと、タブレットで最新の地理学系の論考を表示した。' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: '「悲観論」と「楽観論」のことだね。悲観的な見方っていうのは、みんな都会の「密」を嫌って、郊外や地方に引っ越していくから、大都市は衰退するっていう考え方。【id:2】' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: 'ニューヨークでは実際に、パンデミック初期に40万人以上が郊外に「逃亡」したっていうデータもあるみたい。【id:3】リモートワークが普及すれば、高い家賃を払って都心に住む必要がなくなるから、都市経済がダメになるって理屈。' },
    { type: 'embed', format: 'mermaid', title: '都市衰退の悪循環（悲観論）', description: 'コロナ禍をきっかけとした都市衰退のメカニズム。', content: 'graph TD\n    A(コロナ禍) --> B(リモートワーク普及)\n    B --> C(オフィスの空室増加)\n    B --> D(都心から郊外への人口流出)\n    C --> E(不動産価値の下落)\n    D --> F(都心での消費減少)\n    E & F --> G(税収の減少)\n    G --> H(行政サービスの低下)\n    H --> I(都市の魅力低下)\n    I --> D' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'えー、じゃあ東京もそのうちガラガラになっちゃうの！？' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: 'でも、それに対して楽観的な見方もあるのよ。歴史的に見て、都市はペストやコレラみたいなパンデミックにもっと酷い目にあっても、その度に必ず復活してきたっていうの。【id:4】' },
    { type: 'dialogue', speaker: '浅田', expression: 'impressed', dialogue: 'そう。人が集まることで生まれるイノベーションや、直接顔を合わせて話すことの重要性は、リモートだけじゃ代替できない。だから、結局、人は都市の魅力に引かれて戻ってくるっていう考え方だね。【id:5】' },
    { type: 'dialogue', speaker: '新田', expression: 'thinking', dialogue: 'じゃあ、実際、日本ではどうだったんスかね？みかん先輩のお父さんの会社とか、リモートになったりしました？' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'うーん、うちはお父さん、基本ずっと会社に行ってたよ。取引先との打ち合わせとか色々あるみたいで。' },
    { type: 'narration', text: '浅田は、国勢調査や住民基本台帳のデータをまとめた資料を画面に映し出した。' },
    {
      type: 'embed',
      format: 'html',
      title: '2021年 東京23区からの転出者が多かった市',
      description: '転出先は地方ではなく、東京近郊の都市が上位を占めている。',
      content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white; text-align: left;"><thead><tr style="background: #e3f2fd; color: #1e88e5;"><th style="padding: 12px;">順位</th><th style="padding: 12px;">転出先</th><th style="padding: 12px;">人数</th></tr></thead><tbody><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">1位</td><td style="padding: 10px;">神奈川県 横浜市</td><td style="padding: 10px;">29,089人</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">2位</td><td style="padding: 10px;">神奈川県 川崎市</td><td style="padding: 10px;">22,757人</td></tr><tr><td style="padding: 10px;">3位</td><td style="padding: 10px;">埼玉県 さいたま市</td><td style="padding: 10px;">13,077人</td></tr></tbody></table></div>'
    },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'あれ？みんな地方に引っ越したのかと思ったら、横浜とか川崎とか、すぐ近くじゃん！【id:7】' },
    { type: 'dialogue', speaker: '梶井', expression: 'cool', dialogue: 'その通り。これは「東京からの脱出」というより、「東京圏の拡大」と見た方が正確なんだよ。リモートワークで毎日通勤しなくてよくなったから、都心から少し離れた、広くて家賃の安い家に住むっていう選択肢が増えただけ。【id:8】' },
    { type: 'dialogue', speaker: '理央', expression: 'normal', dialogue: 'それに、都心のタワーマンションの人気は、コロナ禍でも全然落ちなかったらしいわ。結局、経済的に余裕があって都会の利便性が好きな人は都心に残って、住環境を重視する人が郊外に移るっていう『二極化』が進んだだけかもしれない。【id:9】' },
    { type: 'dialogue', speaker: '浅田', expression: 'serious', dialogue: 'それに、札幌とか福岡みたいな地方の中核都市は、コロナ禍でも転入超過、つまり人が増え続けてる。必ずしも東京一極集中が崩れたわけじゃないんだ。【id:10】' },
    { type: 'narration', text: '議論を通じて、コロナ禍が都市に与えた影響は、単純な「衰退」という言葉では片付けられない、複雑なものであることが明らかになっていった。' },
    { type: 'dialogue', speaker: '新田', expression: 'impressed', dialogue: 'なるほどー！じゃあ、コロナで働き方とか住む場所の選択肢は増えたけど、大都市の力が完全になくなるわけじゃないってことッスね！' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'そっかー。なんか安心したような、でも複雑なような…。' },
    { type: 'dialogue', speaker: '浅田', expression: 'cool', dialogue: 'こういう大きな社会の変化は、すぐに結論が出るものじゃない。これからもデータを注意深く見て、考え続ける必要があるんだよ。' },
    { type: 'narration', text: 'ベア研のメンバーは、パンデミックという未曽有の事態でさえ、都市という巨大なシステムのダイナミズムを簡単には変えられないことを学び、その奥深さに改めて感心するのだった。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
<h3 class="text-xl font-bold mb-4">コロナ禍は都市をどう変えたか？</h3>
<p class="mb-4">
  2020年から始まったコロナ禍は、リモートワークの普及など、私たちの働き方や暮らし方に大きな変化をもたらしました。これを受け、「都市の時代は終わるのではないか」という議論が活発になりましたが、実際のデータはより複雑な実像を示しています。
</p>

<h4 class="text-lg font-bold mt-6 mb-2">1. 悲観論 vs 楽観論</h4>
<p class="mb-4">
  都市の未来については、大きく二つの見方が対立しました。
</p>
<ul class="list-disc list-inside mb-4 pl-4 space-y-2">
  <li><span class="text-red-600 font-bold">悲観論</span>: リモートワークの普及により、人々は「密」で家賃の高い都心を離れ、郊外や地方へ移住する。その結果、都心のオフィスや商業施設は空洞化し、税収も減少、都市は衰退するという見方です。</li>
  <li><span class="text-blue-600 font-bold">楽観論</span>: 都市は歴史上、何度もパンデミックを乗り越えてきた経験があり、今回も必ず復活するという見方です。人々が対面で交流することから生まれる創造性やイノベーションは、都市が持つ本質的な強みであり、リモートでは代替できないと考えます。</li>
</ul>

<h4 class="text-lg font-bold mt-6 mb-2">2. 日本で実際に起きたこと：「東京圏の拡大」と「二極化」</h4>
<p class="mb-4">
  実際の人口移動データを見ると、日本の現実は単純な「都市の衰退」ではありませんでした。
</p>
<ul class="list-disc list-inside mb-4 pl-4 space-y-2">
  <li><span class="text-blue-600 font-bold">転出先は「近郊」</span>: 東京23区からの転出者は確かに増加しましたが、その多くは地方ではなく、横浜市、川崎市、さいたま市といった東京に隣接する郊外都市への移動でした。これは「脱・東京」というよりは、リモートワークを機に、通勤可能な範囲でより広く快適な住環境を求める「東京圏の拡大」と解釈できます。</li>
  <li><span class="text-blue-600 font-bold">地方中核都市への集中</span>: 札幌、仙台、福岡といった地方の中核都市は、コロナ禍においても転入超過が続き、その拠点性は揺るぎませんでした。</li>
  <li><span class="text-blue-600 font-bold">ライフスタイルの二極化</span>: 結果として、都市の利便性を重視して都心に留まる層と、働き方の変化を機に郊外の住環境を求める層への「二極化」が進んだと見られています。都市が全ての人にとって不要になったわけではなく、人々の選択肢が多様化したのです。</li>
</ul>

<div class="bg-yellow-100 p-4 rounded-lg mt-6">
  <h5 class="font-bold text-yellow-800">学習のポイント</h5>
  <p>コロナ禍のような大きな社会変化を考える際は、「都市は終わる」といった単純な言説に飛びつくのではなく、実際のデータを基に、何が本当に起きているのかを冷静に分析する視点が重要です。東京圏の人口移動のデータは、人々の行動が「都市か地方か」という二者択一ではなく、都心、近郊、郊外、地方中核都市といった多様な選択肢の中で、より複雑なグラデーションを持っていることを示しています。</p>
</div>
`,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: 'ミニ論文：コロナ禍における人口移動のデータ分析',
      rank: 'A',
      background: `
あなたは、あるシンクタンクの研究員です。コロナ禍以降の東京圏の人口移動に関するレポートを執筆することになりました。手元には以下の2つのデータがあります。\n
- **データ①**: 2021年、東京23区からの転出者の転出先上位は、神奈川県横浜市、川崎市、埼玉県さいたま市で占められている。\n
- **データ②**: 30代のIT企業に勤める岩城くん夫妻が、『夫婦ともに在宅勤務となり、都心の1LDKでは手狭になった』という理由で、都心から神奈川県鎌倉市へ移住したという新聞記事。
`,
      subProblems: [
        {
          title: '小問1',
          rank: 'A',
          relatedQAs: [1, 2, 3, 4, 5, 6],
          problem: 'これらのデータから、コロナ禍で起きた東京圏の人口移動は、都市の「衰退」を意味するのか、それとも別の現象と解釈すべきか。都市の未来に関する悲観論と楽観論の両方の視点を踏まえつつ、あなたの見解を論じなさい。',
          hint: 'この人口移動は、都市圏からの完全な離脱（反都市化）と言えるでしょうか。それとも、都市圏内部での再配置（郊外化の一種）と考えるべきでしょうか。リモートワークという新しい要因がどのように影響しているかも考慮しましょう。',
          points: [
            '悲観論（リモートワークによる都心離れ）と楽観論（都市の魅力は不変）の両方を理解しているか。',
            'データ①が示す移動先が近郊である点に着目し、これを単純な「衰退」ではなく「東京圏の拡大」と解釈できているか。',
            'データ②を、働き方の変化に伴う新たな郊外化の動きとして位置づけられているか。',
            '結論として、単純な「衰退」ではなく、都市圏の構造変化やライフスタイルの二極化といった、より複雑な現象として論じられているか。'
          ],
          modelAnswer: `
コロナ禍で起きた東京圏の人口移動は、単純な都市の「衰退」ではなく、リモートワークの普及という新しい要因によって引き起こされた「都市圏の構造変化」及び「ライフスタイルの二極化」と解釈すべきである。\n
まず、悲観論が指摘するように、データ②の岩城くん夫妻の事例は、リモートワークの普及が都心に住む必要性を低下させ、郊外への人口流出を促したことを示している。これは都市のオフィス需要や消費を減退させる可能性がある。\n
しかし、データ①は、その流出先が遠隔地の地方ではなく、横浜や川崎といった東京圏内の近郊都市に集中していることを示している。これは、人々が東京圏という大きな経済・生活圏から完全に離脱したわけではなく、圏内での住み替えを行ったに過ぎないことを意味する。これは楽観論が主張する都市の根源的な魅力が失われていないことの証左とも言える。人々は都心へのアクセスを維持しつつ、より良い住環境を手に入れようとしたのであり、この現象は「東京圏の拡大」あるいは新しい形の「郊外化」と捉えるのが適切である。\n
結論として、コロナ禍の人口移動は、都市の「終わり」ではなく、働き方の多様化に対応した都市の「変容」の始まりである。都心の利便性を享受し続ける層と、郊外の快適性を選択する層への二極化が進み、都市圏はより多層的で複雑な構造へと変化していると分析できる。
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