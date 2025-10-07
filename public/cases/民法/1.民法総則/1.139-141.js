export default {
  // === 1. モジュール基本情報（必須） ============
  title: "取得時効",
  category: "minpou",
  citation: "ユズ、拾ったゲームは誰のもの？",
  rank: "A",
  tags: ["民法", "物権法", "取得時効", "占有"],
  rightSideCharacters: ['ユズヒコ'],

  // === 2. 知識箱（必須） =======================
  knowledgeBox: '取得時効は、他人の物または財産権を一定期間、所有の意思をもって平穏かつ公然に占有・準占有することで、その権利を取得できる制度です。【民法162条】\n\n【長期取得時効】（【民法162条1項】）\n- **要件**: 20年間の占有、所有の意思、平穏・公然な占有、時効の援用。\n- **占有開始時の善意・無過失は不要**です。\n\n【短期取得時効】（【民法162条2項】）\n- **要件**: 10年間の占有、所有の意思、平穏・公然な占有、時効の援用、そして占有開始時に**善意・無過失**であること。\n\n【占有に関する推定規定】（【民法186条】）\n- **所有の意思、平穏、公然、善意**は占有の事実から推定されます。\n- ただし、短期取得時効の**無過失は推定されません**。占有者が自ら立証する必要があります。\n- 占有の継続も、占有期間の前後両時点での占有の事実を証明すれば推定されます（【民法186条2項】）。\n\n【占有の承継】（【民法187条】）\n- 占有者の承継人は、自己の占有だけを主張することも、前の占有者の占有を併せて主張することもできます。\n- 前の占有者の占有を併せて主張する場合、その**瑕疵（悪意など）も承継**します。判例は、**瑕疵がないこと（善意など）も承継される**と解しています（最判昭53.3.6）。\n\n【所有の意思の判断】\n- 占有者の内心の意思ではなく、占有を取得させた**権原の性質によって客観的に判断**されます。例えば、賃貸借契約に基づいて占有を始めた場合、他主占有となり所有の意思は認められません。\n\n【相続と占有】\n- 相続人は被相続人の占有を包括的に承継するため、被相続人が他主占有であれば相続人も原則として他主占有です。しかし、相続人が独自の所有の意思に基づいて占有したと客観的に認められる場合、「新たな権原」として自主占有への転換が認められることがあります（最判平8.11.12）。',

  // === 3. 個別Q&A（必須） =====================
  questionsAndAnswers: [
    {
      id: 123,
      rank: 'A',
      question: '長期取得時効（【民法162条1項】）の成立要件について説明しなさい。',
      answer: '①{{20年間}}の占有継続、②{{所有の意思}}、③{{平穏}}、{{公然}}、④{{援用}}である。'
    },
    {
      id: 124,
      rank: 'A',
      question: '短期取得時効（【民法162条2項】）の成立要件について説明しなさい。',
      answer: '①{{10年間}}の占有継続、②{{所有の意思}}、③{{平穏}}、{{公然}}、④{{援用}}、⑤{{善意無過失}}である。'
    },
    {
      id: 125,
      rank: 'A',
      question: '取得時効の要件のうち、占有の継続は推定されるか。',
      answer: '{{【民法186条2項】}}により推定される。'
    },
    {
      id: 126,
      rank: 'A',
      question: '取得時効の要件のうち、所有の意思は推定されるか。',
      answer: '{{【民法186条1項】}}により推定される。'
    },
    {
      id: 127,
      rank: 'A',
      question: '取得時効の要件のうち、平穏、公然は推定されるか。',
      answer: '{{【民法186条1項】}}により推定される。'
    },
    {
      id: 128,
      rank: 'A',
      question: '短期取得時効（【民法162条2項】）の要件のうち、善意は推定されるか。',
      answer: '{{【民法186条1項】}}により推定される。'
    },
    {
      id: 129,
      rank: 'A',
      question: '短期取得時効（【民法162条2項】）の要件のうち、無過失は推定されるか。',
      answer: '{{推定されない}}。'
    },
    {
      id: 130,
      rank: 'A',
      question: '短期取得時効（【民法162条2項】）の要件のうち、「善意」の意義について説明しなさい。',
      answer: '自分に{{所有権}}があると信じることをいう。'
    },
    {
      id: 131,
      rank: 'B',
      question: '短期取得時効の要件である善意無過失の判断時期について説明しなさい。',
      answer: '善意無過失は占有の{{始期}}に判断する。\nその後、{{悪意}}に変わっても影響なし。'
    },
    {
      id: 132,
      rank: 'B',
      question: '取得時効の要件事実について説明しなさい。',
      answer: '長期取得時効（{{【民法162条1項】}}）を主張する場合、①ある時点での{{占有}}、②{{20年}}経過時点での占有、③時効{{援用}}の意思表示が要件事実となる。短期取得時効（{{【民法162条2項】}}）を主張する場合には、占有開始時に{{善意}}であることについて{{無過失}}であることを主張することになる。これに対して、抗弁として、{{他主占有権原}}、{{他主占有事情}}、{{悪意}}などを主張することになる。'
    },
    {
      id: 133,
      rank: 'A',
      question: '取得時効の要件のうち、「所有の意思」の判断方法について説明しなさい。',
      answer: '占有取得原因たる事実によって{{客観的}}に決まり、占有者の{{主観}}によるものではない。'
    },
    {
      id: 134,
      rank: 'B',
      question: '相続によって「新たな権原」を取得したといえるかについて説明しなさい。',
      answer: '原則として、「{{新たな権原}}」に当たらないが、事実的支配が{{外形的客観的}}にみて独自の所有の意思に基づくものと解される場合、「{{新たな権原}}」に当たり、{{自主占유}}に転換する(最判平8.11.12)。'
    },
    {
      id: 135,
      rank: 'B',
      question: '二重譲渡の事案で、登記なくして対抗できない買主は、取得時効を主張できるか。',
      answer: '{{時効取得肯定説}}(最判昭42.7.21)が判例である。時効制度の趣旨は、{{永続した事実状態}}を尊重する点にあり、自己物・他人物を区別する必要はない。条文上の「{{他人の物}}」は例示と解される。'
    },
    {
      id: 136,
      rank: 'B',
      question: '占有の承継において、前主の「瑕疵がないこと」も承継されるか。',
      answer: '判例(最判昭53.3.6)は「{{瑕疵がないこと}}」も承継すると解する。{{【民法187条2項】}}が「瑕疵をも」としているのは、「瑕疵のないことはもちろんのこと、{{瑕疵のあることもまた承継する}}」という意味だと説明される。'
    },
    {
      id: 137,
      rank: 'B',
      question: '相続によって占有権は承継されるか説明しなさい。',
      answer: '判例(最判昭44.10.30)は、相続によって占有は{{当然に}}移転すると解する。占有権の{{相続}}を認めなければ、被相続人の下で進行してきた取得時効が、被相続人の死亡により{{無に帰する}}ことになり不都合だからである。'
    },
    {
      id: 138,
      rank: 'B',
      question: '【民法187条1項】の「承継」に相続による包括承継は含まれるか。',
      answer: '{{肯定説}}(最判昭37.5.18)が判例である。特定承継と{{包括承継}}は、占有の承継という点において異ならないと解される。'
    }
  ],

  // === 4. 事案ストーリー（必須） ================
  story: [
    { type: 'scene', text: 'ユズヒコの中学校・昼休み' },
    { type: 'narration', text: '昼食を終えたユズヒコ、藤野、ナスオの3人が教室で談笑している。' },
    { type: 'dialogue', speaker: '藤野', expression: 'normal', dialogue: 'いやー、今日の体育のサッカー、白熱したよな！' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'excited', dialogue: '俺のスーパーシュート、見たかよ！？キーパー動けてなかったぜ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'それよりさ、ちょっと聞いてほしいことがあるんだ。' },
    { type: 'narration', text: 'ユズヒコは少し真剣な顔で、ポケットから古びた携帯ゲーム機を取り出した。' },
    { type: 'dialogue', speaker: '藤野', expression: 'surprised', dialogue: 'うおっ、何だこれ！めちゃくちゃ懐かしい機種じゃん！どこで手に入れたんだよ、ユズピ。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '今朝、学校に来る途中の公園のベンチの下に落ちてて…。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'smug', dialogue: 'ラッキーじゃん！それ、もうユズピのもんだろ！神様からのプレゼントだよ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: 'いや、そんな単純な話じゃないんだよ、ナスオ。勝手に自分のものにしたら、遺失物等横領罪っていう犯罪になる可能性があるんだぞ。' },
    { type: 'dialogue', speaker: '藤野', expression: 'impressed', dialogue: 'へぇ、そうなのか。でもさ、ずっと持ってたら自分のものになったりするって聞いたことあるけど？' },
    { type: 'narration', text: 'そこへ、独特の雰囲気を持つクラスメートの石田がふらりと近づいてきた。' },
    { type: 'dialogue', speaker: '石田', expression: 'serious', dialogue: 'そのゲーム機からは…永い時間の匂いがする。誰かの「所有したい」という意思が染み付いている…。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'surprised', dialogue: '石田さん！…いや、でも、あながち間違いじゃないかも。まさにそれが「取得時効」に関わる話なんだ。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'thinking', dialogue: 'シュトクジコウ？なんだそりゃ、必殺技か？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: '【民法162条】に定められてる制度だよ。他人の物でも、一定期間自分のものだと思って使い続けると、本当に自分のものになるっていう。' },
    { type: 'narration', text: 'ユズヒコは、まるで先生のように説明を始めた。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '取得時効には、長期と短期の2種類があるんだ。' },B -->|YES| C{占有開始時に<br/>善意・無過失？}
            B -->|NO| H[時効不成立]
            C -->|YES| D[10年間占有継続]
            C -->|NO| E[20年間占有継続]
            D --> F[時効援用]
            E --> F
            F --> G[所有権取得]
        end

        classDef decision fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
        classDef process fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
        classDef success fill:#d1fae5,stroke:#10b981,stroke-width:2px
        classDef failure fill:#fee2e2,stroke:#ef4444,stroke-width:2px

        class B,C decision
        class A,D,E,F process
        class G success
        class H failure`
    },
    { type: 'dialogue', speaker: '藤野', expression: 'impressed', dialogue: 'なるほど！この図、分かりやすいな！つまり、善意・無過失なら10年、そうでなければ20年ってことか。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'その通り。でも、この「善意・無過失」っていうのがポイントでさ。【民法186条1項】で善意は推定されるけど、無過失は推定されないんだ。だから、10年での時効を主張するなら、自分に過失がなかったことを証明しないといけない。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'thinking', dialogue: 'じゃあこのゲーム機の場合、ユズピは善意・無過失なのか？「落ちてた」ってことは、誰かのものだって分かってるから「悪意」じゃないのか？' },
    { type: 'narration', text: 'ナスオの鋭い指摘に、ユズヒコは少し感心したように頷いた。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'いい質問だ、ナスオ。確かに落とし物を拾っただけだと「所有の意思」が認められにくい。判例では、占有を始めた原因、つまり権原の性質によって客観的に判断されるんだ。' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'もし、拾った人が…死んでしまったら…その占有は、霧のように消えるのか…？' },
    { type: 'narration', text: '石田の突飛な問いに、藤野とナスオはぎょっとする。だが、ユズヒコは真面目に答えた。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: 'いや、消えないんだ。それが【民法187条】の「占有の承継」の問題。' },
    { type: 'narration', text: 'そこへ、クラスの優等生、須藤が話に加わった。' },
    { type: 'dialogue', speaker: '須藤', expression: 'normal', dialogue: '面白そうな話をしてるわね。占有の承継？相続の話かしら。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'happy', dialogue: '須藤さん！そうなんだ。例えば、このゲームを拾ったAさんが6年間占有したあと、事情を知らないBさんに売って、Bさんが5年間占有した場合、どうなると思う？' },
    { type: 'dialogue', speaker: '藤野', expression: 'thinking', dialogue: 'Bさんは5年しか占有してないから、時効は成立しないだろ？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: 'Bさんは、自分の5年間の占有だけを主張することもできるし、前の占有者であるAさんの6年間を足して、合計11年間の占有を主張することもできるんだ。' },C --"自己の占有のみ主張"--> D[悪意で5年間<br/>時効不成立]
            C --"Aの占有を併せて主張"--> E[合計11年間]
            E --> F{瑕疵の承継は？}
            F --"前主Aの善意・無過失を承継"--> G[短期取得時効<br/>成立！]
            F --"自己Bの悪意が優先"--> H[長期取得時効へ<br/>(20年必要)]
        end
        subgraph "判例の立場"
            I(最判昭53.3.6) ==> G
        end

        classDef person fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
        classDef decision fill:#fff9c4,stroke:#f57f17,stroke-width:2px
        classDef success fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
        classDef failure fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px

        class A,B person
        class C,F decision
        class G success
        class D,H failure
        class I person`
    },
    { type: 'dialogue', speaker: '須藤', expression: 'impressed', dialogue: 'なるほど。判例は前主の瑕疵のなさ、つまり善意・無過失も引き継ぐと判断してるのね。面白いわ。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'excited', dialogue: 'じゃあ、10年経てば誰かのものになる可能性があるってことか！すげえ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '理論上はね。でも、これはあくまで法律上の話。現実問題として、落とし物はまず警察に届けるべきだよ。' },
    { type: 'dialogue', speaker: '藤野', expression: 'laughing', dialogue: 'だよな。法律談義で盛り上がったけど、結論は普通だ。' },
    { type: 'dialogue', speaker: '須藤', expression: 'happy', dialogue: 'でも、すごく勉強になったわ。タチバナくん、ありがとう。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'blush', dialogue: 'いや、それほどでも…。' },
    { type: 'narration', text: 'ユズヒコは、拾ったゲーム機をカバンにしまいながら、放課後に交番へ寄ることを心に決めた。法律の知識と、社会人としての良識。その両方を持つことの大切さを、友人たちとの会話から改めて学んだのだった。' },
    { type: 'scene', text: '放課後・交番の前' },
    { type: 'narration', text: 'ユズヒコは一人で交番の前に立っていた。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '(さて、なんて説明しようかな…。法律の話までする必要はないよな…。)' },
    { type: 'narration', text: 'ユズヒコが意を決して交番に入ろうとしたその時、背後から声がした。' },
    { type: 'dialogue', speaker: '川島', expression: 'surprised', dialogue: 'あ、タ、タチバナくん！？こんなところでどうしたの？' },
    { type: 'narration', text: '振り返ると、そこにはクラスメートの川島と山下がいた。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '川島、山下さん。いや、ちょっと落とし物を届けに…。' },
    { type: 'dialogue', speaker: '山下', expression: 'cool', dialogue: 'へぇ、偉いじゃん、タチバナくん。' },
    { type: 'dialogue', speaker: '川島', expression: 'happy', dialogue: '(キャー！落とし物を届けるなんて、なんて誠実なの！タチバナくん、素敵すぎるー！)' },
    { type: 'narration', text: '川島が内心で悶えているとは露知らず、ユズヒコは少し照れながら交番の中へと入っていった。' },
    { type: 'scene', text: 'タチバナ家・夕食時' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '今日、学校で取得時効の話で盛り上がってさ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'しゅとくじこー？なにそれ、美味しいの？' },
    { type: 'dialogue', speaker: '母', expression: 'normal', dialogue: '人のものを自分のものにするなんて、そんなことしちゃダメに決まってるでしょ！' },
    { type: 'dialogue', speaker: '父', expression: 'normal', dialogue: '………。' },
    { type: 'narration', text: '父は黙ってテレビを見ている。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: 'いや、そういう話じゃなくて、法律で認められてる権利なんだって…。はぁ、この家で法律の話をするんじゃなかった…。' },
    { type: 'narration', text: 'ユズヒコは、家族とのジェネレーションギャップならぬ、リーガルマインドギャップに、静かにため息をつくのだった。' },
    { type: 'narration', text: 'こうして、一つのゲーム機を巡るユズヒコの法的な探求は、多くの友人を巻き込みながら、一つの結論へとたどり着いた。たとえ時効によって権利を取得できる可能性があったとしても、社会のルールに従い、誠実に行動することこそが最も重要なのである。' }
  ],
  
  // === 4. 判旨と解説（必須） ====================
  explanation: "取得時効に関する基本的な理解を深めるモジュールです。",
  
  // === 5. ミニ論文問題（必須） ==================
  quiz: [],
  essay: null
};