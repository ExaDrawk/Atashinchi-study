export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "english-gender-studies-1",
  title: "身体とジェンダー：社会は性別をどう作るか",
  category: "english",
  citation: "みかん、身体ってフクザツ！？",
  rank: "A",
  tags: ["英語長文読解", "ジェンダー論", "社会学", "現代思想"],
  rightSideCharacters: ['みかん', 'ユズヒコ'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `このシリーズでは、英語の学術的な文章を通して、「性別(sex)」と「ジェンダー(gender)」が歴史的・社会的にどのように捉えられてきたかを探求します。\n\n【主要テーマ】\n1.  **生物学的決定論 vs 社会構築主義**: 「男女の違いは生まれつき（生物学的）か、それとも社会的に作られるものか」という中心的な対立点を理解します。\n2.  **歴史的変遷**: 古代の「ワンセックス・モデル」から近代の「ツーセックス・モデル」への移行を学び、性差の捉え方が一定ではなかったことを確認します。\n3.  **フェミニズムの視点**: シモーヌ・ド・ボーヴォワール、レイウィン・コンネル、ジュディス・バトラーといった思想家が、いかにして「ジェンダー化された身体」の概念を発展させたかを見ていきます。\n4.  **現代科学の視点**: 内分泌学（ホルモン）や遺伝学の進歩が、単純な男女二元論をいかにして乗り越えようとしているかを解説します。\n\n【学習のポイント】\n- **重要英単語**: "contentious" (論争の的となる), "immutable" (不変の), "malleable" (可鍛性の、影響されやすい), "performativity" (遂行性) など、学術的文章で頻出する単語を文脈の中で覚えます。\n- **複雑な構文の読解**: 長い修飾語句や挿入句を含む、複雑な英文構造を正確に読み解く練習をします。\n- **批判的思考**: ある主張がどのような歴史的・社会的背景から生まれたのかを考えながら読むことで、批判的な読解力を養います。`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    {
      id: 1,
      rank: 'A',
      question: 'ヴィクトリア朝時代のイギリスで、中流階級の女性が教育やスポーツから排除された理由として、どのような考えが用いられましたか？',
      answer: '身体的・精神的な過度の酷使が、彼女たちの{{生殖器官にダメージを与え}}、{{帝国という人種の未来の健全性を害する}}と信じられていたためです。'
    },
    {
      id: 2,
      rank: 'A',
      question: '歴史家トーマス・ラキュールが提唱した「ワンセックス・ワンフレッシュ」モデルとは、どのような考え方ですか？',
      answer: '古代から17世紀末まで主流だった考え方で、男女の身体は{{本質的に類似している}}と見なされていました。例えば、女性の膣は「内側にあるペニス」として描かれるなど、身体は{{対極ではなく同型}}であると理解されていました。'
    },
    {
      id: 3,
      rank: 'B',
      question: '2世紀の医師ガレノスは、男女の身体の違いを何によって説明しましたか？',
      answer: '身体の「熱」の量の違いによって説明しました。男性の器官が外に出ているのは{{過剰な熱}}のためであり、女性の身体の{{冷たさ}}が器官を内側に留めているとされました。'
    },
    {
      id: 4,
      rank: 'A',
      question: '18世紀に「ワンセックス・モデル」から「ツーセックス・モデル」へと移行した背景には、啓蒙思想がもたらしたどのようなジレンマがあったとされていますか？',
      answer: '啓蒙思想が「平等な権利」を掲げたため、男女の身体が類似しているなら{{女性に男性と同じ権利を認めなければならなくなる}}という問題が生じました。このため、男女の身体は{{固定的で不平等な生物学的構造}}であるという見方が、男性の優位性を維持するためのイデオロギー的解決策として浮上したとされています。'
    },
    {
      id: 5,
      rank: 'A',
      question: '20世紀のフェミニストが「セックス（sex）」と「ジェンダー（gender）」を区別したことの重要性は何ですか？',
      answer: '生物学的に与えられた性（セックス）と、文化的に付加された「らしさ」（ジェンダー）を区別することで、{{女性の役割を家庭に限定したり、労働市場で差別したりすることを「自然」として正当化する議論に反論する}}ことが可能になりました。'
    },
    {
      id: 6,
      rank: 'S',
      question: 'シモーヌ・ド・ボーヴォワールの有名な言葉「人は女に生まれるのではなく、女になるのだ」は、何を意味していますか？',
      answer: '生物学的に女性として生まれても、社会の中で「女性らしさ」を教え込まれ、受動的な役割へと社会化されるプロセスを通じて、後天的に社会的な意味での「女」が{{作り上げられる}}ことを意味しています。'
    },
    {
      id: 7,
      rank: 'A',
      question: '社会学者レイウィン・コンネルが提唱した「ジェンダー化された身体」が作られる3つの段階について説明してください。',
      answer: '第1段階は、男女の{{違いを強調するステレオタイプが存在}}すること。第2段階は、そのステレオタイプが{{実際の身体的発達に変化を引き起こす}}こと（例：男の子は体を鍛え、女の子はダイエットを志向する）。第3段階は、その身体的変化が{{元のステレオタイプを裏付けるものとして解釈される}}ことです。'
    },
    {
      id: 8,
      rank: 'B',
      question: '内分泌学（ホルモンの研究）の進歩は、男女の身体に関する見方をどのように変えましたか？',
      answer: '男女ともに「男性ホルモン」「女性ホルモン」の両方を分泌しており、そのレベルは様々な要因で変動するため、「男性の身体」「女性の身体」という明確な区別はなく、むしろ{{性別のある身体の連続体（a continuum of sexed bodies）}}として捉える方が正確だと示唆しました。'
    },
    {
      id: 9,
      rank: 'S',
      question: 'ジュディス・バトラーの「パフォーマティヴィティ（遂行性）」とは、ジェンダーをどのように説明する概念ですか？',
      answer: 'ジェンダーは個人の内なる本質ではなく、日々の行為（服装、話し方、仕草など）の{{反復によって作り上げられ、維持される}}という考え方です。この反復的な「パフォーマンス」が、まるで「男」や「女」という安定した実体があるかのような錯覚を生み出すとされます。'
    },
    {
      id: 10,
      rank: 'A',
      question: 'バトラーの「パフォーマンス」理論には、どのような批判がありますか？',
      answer: 'パフォーマンスを強調しすぎると、纏足や女性器切除のような、{{身体に直接的な危害を加える暴力的な慣習の深刻さ}}を軽視してしまう危険がある、と批判されています。それらが単なる文化的な身体表現の一種として相対化されかねないためです。'
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    {
      type: 'scene',
      text: 'タチバナ家・リビング'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'desperate',
      dialogue: 'うぅーん…だめだ、全然わかんない…。なんで英語のレポートのテーマがよりにもよってジェンダー論なんだろう…。'
    },
    {
      type: 'dialogue',
      speaker: '母',
      expression: 'normal',
      dialogue: 'あらみかん、そんな難しい顔して。またおなかすいたの？'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'annoyed',
      dialogue: '違うよ！学校の課題！この英語の文章が難しすぎて…。ユズ、ちょっとこれ見てくれない？'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'normal',
      dialogue: 'どれ？…ふむふむ、「Sexed bodies」か。ジェンダーと身体に関する社会学の文章だね。面白いテーマじゃない。'
    },
    {
      type: 'narration',
      text: 'ユズヒコはみかんが投げ出したプリントを手に取り、最初のパラグラフを読み始めた。'
    },
    {
      type: 'embed',
      format: 'html',
      title: 'Text 1: Paragraph 1',
      description: '最初の文章を読んでみよう。',
      content: '<div style="background: #f1f5f9; padding: 16px; border-left: 4px solid #64748b; border-radius: 4px; font-family: serif;"><p>The idea that our bodies are shaped by social forces and relationships, rather than being ruled and regulated exclusively by natural biological factors, is perhaps most <strong>contentious</strong> in relation to the subject of sex differences. Indeed, the belief that there exist fundamental and <strong>immutable</strong> differences in the physiological and neurological make-up of males and females...remains widely held and socially influential.</p></div>'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: 'うーん…いきなり「contentious」とか「immutable」とか、難しい単語が出てきて心が折れそう…。'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'cool',
      dialogue: '大丈夫だよ。まず、"contentious"は「論争の的となる」っていう意味。つまり、この考えはすごく意見が分かれるってこと。'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'cool',
      dialogue: 'そして"immutable"は「不変の」っていう意味。"im-"(否定) + "mutable"(変化しうる)で成り立ってる単語だ。つまり、男女には生まれつきで絶対変わらない、根本的な違いがあるっていう信念が根強い、って言ってるんだ。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'impressed',
      dialogue: 'へぇー！なるほど！「私たちの身体は社会によって形作られる」っていう考え方は、特に「男女の違い」っていうテーマだと、すごく議論を呼ぶってことか！'
    },
    {
      type: 'narration',
      text: 'ユズヒコは頷き、次の文章を指さした。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: '二つの対立する考え方',
      description: 'この文章で提示されている基本的な対立構造を図にしてみよう。',
      content: `graph TD
        A["身体(Body)の捉え方"] --> B["生物学的決定論<br/>(Biological Determinism)"];
        A --> C["社会構築主義<br/>(Social Constructionism)"];

        subgraph "生物学的決定論の考え"
            B1["- 性差は自然で不変 (natural & immutable)<br/>- 生物学が運命を決める<br/>- 男性は火星から、女性は金星から"]
        end

        subgraph "社会構築主義の考え"
            C1["- 身体は社会的な力で形作られる<br/> (shaped by social forces)<br/>- 性差の解釈は文化によって変わる"]
        end

        B -.->|対立| C;

        classDef determinism fill:#ffebee,stroke:#c62828,stroke-width:2px;
        classDef constructionism fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
        class B,B1 determinism;
        class C,C1 constructionism;
        class A fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px;`
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'normal',
      dialogue: 'そう。この文章シリーズ全体が、この二つの考え方の対立と、その歴史をテーマにしてるんだ。じゃあ、次の歴史の話を見てみよう。Text 2の「ワンセックス・モデル」。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'surprised',
      dialogue: 'ワンセックス？ 性別が一つってこと？どういうこと？'
    },
    {
      type: 'narration',
      text: 'みかんが驚く中、ユズヒコは18世紀以前の考え方について説明を始めた。'
    },
    {
      type: 'embed',
      format: 'html',
      title: 'Text 2: The "One-Sex/One-Flesh" Model',
      description: '18世紀以前の主流な考え方。',
      content: '<div style="background: #f1f5f9; padding: 16px; border-left: 4px solid #64748b; border-radius: 4px; font-family: serif;"><p>From classical antiquity until the end of the 17th century...male/female bodies were understood on the basis of what the historian Thomas Laqueur refers to as a <strong>\'one sex one flesh\' model</strong>. This model was founded on the belief that the bodies of men and women were essentially <strong>similar</strong>...For example, the Greek physician Galen argued that male and female bodies were <strong>homologous</strong>; an argument reflected in illustrations of the reproductive organs wherein the vagina was depicted as an interior penis and the ovaries interior testes.</p></div>'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'cool',
      dialogue: '昔は、男女の身体は「違うもの」というより「似ているもの」と考えられてたんだ。"homologous"っていうのは「相同の、同型の」って意味。つまり、基本は同じ形で、男性器が外に出てるか、女性器が内側にあるかの違いだけ、みたいな捉え方だね。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'surprised',
      dialogue: 'ええー！？全然違うじゃん！って思うけど、昔はそう考えられてたんだ…。面白い！'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'normal',
      dialogue: 'でも、18世紀以降、科学の発展とともに「ツーセックス・モデル」、つまり男女は生物学的に根本から違う「対極」だっていう考え方が主流になる。Text 3のシモーヌ・ド・ボーヴォワールの議論は、その「ツーセックス・モデル」が定着した後の話だね。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: '性差モデルの歴史的変遷',
      description: '考え方は時代と共に変わってきた。',
      content: `graph LR
        subgraph "古代〜17世紀"
          A["ワンセックス・モデル<br/>(One-Sex Model)<br/>- 身体は<br/>本質的に類似<br/>- 違いは程度の差"]
        end

        subgraph "18世紀〜近代"
          B["ツーセックス・モデル<br/>(Two-Sex Model)<br/>- 身体は<br/>生物学的な対極<br/>- 根本的な差異"]
        end

        subgraph "20世紀〜現代"
          C["セックスとジェンダーの分離<br/>(Sex/Gender Distinction)<br/>- 生物学的性と<br/>社会的性別を区別"]
        end

        A -- "啓蒙思想<br/>科学の発展" --> B
        B -- "フェミニズムの登場" --> C

        classDef ancient fill:#fffde7,stroke:#fbc02d,stroke-width:2px;
        classDef modern fill:#fce4ec,stroke:#d81b60,stroke-width:2px;
        classDef contemporary fill:#e8eaf6,stroke:#3949ab,stroke-width:2px;
        class A ancient;
        class B modern;
        class C contemporary;`
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: 'なるほどー。この流れが分かると、文章が読みやすくなるかも。じゃあ、ボーヴォワールの「人は女に生まれるのではなく、女になるのだ」っていう有名な言葉は…'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'serious',
      dialogue: '生物学的な女性（female）として生まれても、社会の中で「おしとやかに」とか「家庭的に」とか、そういう「女性らしさ（femininity）」を身につけることで、社会的な「女（woman）」になる、ってことだね。Text 4のレイウィン・コンネルは、そのプロセスをさらに具体的に3つの段階で説明してる。'
    },
     {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'impressed',
      dialogue: '身体が社会的に作られるって、そういうことか…。男の子は乱暴な遊びを勧められて、女の子は見た目を気にするように育てられる…。たしかに、そういうので筋肉のつき方とかも変わってきそうだもんね。'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'normal',
      dialogue: 'そう。そして最終的に、その作られた身体の違いが「ほら、やっぱり男女は生まれつき違うんだ」っていう最初のステレオタイプの証拠にされちゃう。この悪循環がポイントだね。'
    },
    {
      type: 'narration',
      text: '二人の議論が白熱してきたところで、話は最後の思想家、ジュディス・バトラーに移った。'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'excited',
      dialogue: 'そして、一番ラディカルなのがバトラーだ。彼女は「ジェンダー」だけじゃなくて、生物学的な「セックス」そのものも、社会的な「パフォーマンス」によって作られるって主張したんだ。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'surprised',
      dialogue: 'え、生物学的な性まで！？どういうこと！？'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'cool',
      dialogue: '彼女が使うキーワードが "performativity"（遂行性）。これは単なる「演技（performance）」とは違う。僕たちが毎日、無意識に「男らしい」「女らしい」とされる振る舞いを繰り返すこと、その行為自体が「男」や「女」というジェンダーを作り出している、という考え方なんだ。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: '私がスカートを履いたり、しみちゃんと恋バナしたりする、そういう毎日の積み重ねが「みかんは女だ」ってことを作り上げてるってこと？'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'normal',
      dialogue: 'そういうこと。その行為の反復が、まるでそれが生まれつきの「本質」であるかのように見せている、とバトラーは言うんだ。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: 'Butler\'s Performativity',
      description: 'バトラーの理論を図で理解しよう。',
      content: `flowchart TD
        subgraph "社会規範 (Social Norms)"
            A["異性愛を標準とする規範など"]
        end

        subgraph "日々の行為の反復 (Repetitive Acts)"
            B["🗣️話し方"]
            C["👕服装"]
            D["🏃‍♀️仕草"]
            E["💄化粧など"]
        end

        A --> B
        A --> C
        A --> D
        A --> E

        F["行為の繰り返し（Performativity）"]

        B & C & D & E --> F

        G["安定したジェンダー・アイデンティティという『錯覚』（Illusion of Stable Gender Identity）"]

        F -- "作り出す" --> G
        G -.->|規範を再生産| A

        classDef norm fill:#f1f5f9,stroke:#64748b,stroke-width:2px;
        classDef act fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px;
        classDef perform fill:#fefce8,stroke:#eab308,stroke-width:2px;
        classDef illusion fill:#fce7f3,stroke:#db2777,stroke-width:2px;

        class A norm;
        class B,C,D,E act;
        class F perform;
        class G illusion;`
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'impressed',
      dialogue: 'うわー、難しいけど、すごく面白い！ジェンダーって、ただの男女の違いの話じゃないんだね。歴史とか社会とか、いろんなものが絡んでるんだ。'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'smug',
      dialogue: 'だろ？こういう学術的な文章も、キーになる概念や単語、全体の構造を掴めば読めるようになるよ。レポート、頑張って。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'happy',
      dialogue: 'うん！ありがとう、ユズ！なんだか書けそうな気がしてきた！'
    }
  ],  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">英語で学ぶジェンダー論：身体と社会の関係</h3>
    <p class="mb-4">このテーマでは、私たちが当たり前だと思っている「男女の身体の違い」が、実は歴史や社会の中で様々に解釈され、作られてきたという視点を、学術的な英語文章を通して学びます。生物学的な性（sex）と社会文化的に作られる性別（gender）の関係性を探ることは、現代社会を理解する上で非常に重要です。</p>

    <h4 class="text-lg font-bold mt-6 mb-2">1. 「ツーセックス・モデル」の誕生と歴史的背景</h4>
    <p class="mb-4">18世紀以降、科学の発展と共に「男女の身体は根本的に異なる2つの性（ツーセックス）である」という考え方が主流になりました。この見方は、ヴィクトリア朝時代のイギリスなどで、女性を教育やスポーツから排除する根拠として利用されました【id:1】。身体的・精神的な過度の活動は女性の生殖能力を損なうという「科学的」な言説が、女性の役割を家庭に限定するために使われたのです。この考え方の根底には、男女の差は<b>immutable</b>（不変の）であるという信念がありました。</p>
    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
      <p class="font-bold">Key Vocabulary: immutable</p>
      <p>「不変の、変わらない」という意味の形容詞。ラテン語の "immutabilis" が語源で、"im-"（否定）と "mutabilis"（変わりやすい）から成り立っています。</p>
    </div>

    <h4 class="text-lg font-bold mt-6 mb-2">2. 歴史の再発見：「ワンセックス・モデル」</h4>
    <p class="mb-4">しかし、歴史を遡ると、全く異なる身体観が存在しました。歴史家トーマス・ラキュールが指摘した「ワンセックス・モデル」です【id:2】。古代から17世紀末まで、男女の身体は対極ではなく、本質的に類似した<b>homologous</b>（相同の）なものと見なされていました。例えば、2世紀の医師ガレノスは、男女の身体の違いを体内の「熱」の量の差で説明し、女性器は内側にある男性器だと考えていました【id:3】。このモデルが「ツーセックス・モデル」に取って代わられた背景には、啓蒙思想が掲げた「平等」の理念が、男性支配の社会構造を揺るがしかねなかったという政治的な理由も指摘されています【id:4】。</p>
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
      <p class="font-bold">Key Vocabulary: homologous</p>
      <p>「（構造・位置・起源が）相同の、対応する」という意味。生物学でよく使われ、起源は同じだが機能が異なる器官（例：人の手とクジラのヒレ）などを指します。</p>
    </div>

    <h4 class="text-lg font-bold mt-6 mb-2">3. フェミニズムの挑戦：「セックス」と「ジェンダー」の分離</h4>
    <p class="mb-4">20世紀のフェミニズムは、生物学的な性「セックス」と、文化的に作られる性別「ジェンダー」を区別するという、極めて重要な理論的武器を生み出しました【id:5】。この区別により、「女らしさ」や女性の役割が「自然」なものではなく、社会的に作られたものであると論じることが可能になったのです。この考え方を象徴するのが、シモーヌ・ド・ボーヴォワールの「人は女に生まれるのではなく、女になるのだ」という言葉です【id:6】。これは、人が社会化の過程で「女性らしさ」を身につけていくことを指摘しています。</p>

    <h4 class="text-lg font-bold mt-6 mb-2">4. 「ジェンダー化された身体」とジュディス・バトラーの「遂行性」</h4>
    <p class="mb-4">社会学者レイウィン・コンネルは、ステレオタイプが実際の身体に影響を与え、その身体的変化が再びステレオタイプを強化するという、ジェンダー化された身体が作られるプロセスを3段階で説明しました【id:7】。さらに、近年の内分泌学や遺伝学の発展は、ホルモンレベルの変動などから、男女の身体を明確な二元論で分けることの難しさを示唆しています【id:8】。</p>
    <p class="mb-4">こうした流れの中で、最もラディカルな議論を展開したのがジュディス・バトラーです。彼女は<b>performativity</b>（遂行性）という概念を用いて、ジェンダーは内的な本質ではなく、日々の振る舞い（服装、話し方、仕草など）の反復によって構築されると主張しました【id:9】。この理論は、固定的と思われがちなジェンダーがいかに<b>malleable</b>（可変的）であるかを示唆する一方で、纏足や女性器切除のような身体への直接的な暴力を軽視してしまう危険性も指摘されています【id:10】。</p>
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">学習のポイント</h5>
      <p>これらの学術的な議論は、単語や構文が複雑ですが、①対立する概念（生物学的決定論 vs 社会構築主義）、②歴史的な変遷（ワンセックス vs ツーセックス）、③重要な思想家の名前とキーワード（ボーヴォワール、コンネル、バトラー）を軸に整理することで、読解しやすくなります。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "英語で学ぶジェンダー論の基礎",
      rank: "A",
      background: `みかんは高校の英語の授業で、「ジェンダーと身体」というテーマについてプレゼンテーションをすることになった。内容を整理するため、親友のしみちゃんに説明を試みている。`,
      subProblems: [
        {
          title: "性差観の歴史的変遷とフェミニズムの視点",
          rank: "A",
          relatedQAs: [1, 2, 3, 4, 5, 6],
          problem: "みかんは、しみちゃんにプレゼンの前半部分として、①ヴィクトリア朝時代に女性が教育などから排除された背景、②それ以前に存在した「ワンセックス・モデル」の内容、③「ツーセックス・モデル」への移行の背景、④20世紀フェミニズムが「セックス」と「ジェンダー」を区別した意義について、ボーヴォワールの言葉を引用しつつ説明することにした。どのような説明をすべきか述べなさい。",
          hint: "歴史的な身体観の変化（ワンセックス→ツーセックス）と、それに対する20世紀フェミニズムの理論的応答（セックス/ジェンダーの区別）という大きな流れを意識して構成することが重要です。",
          points: ["ヴィクトリア朝における女性の身体観と社会的排除【id:1】", "トーマス・ラキュールの「ワンセックス・モデル」の概要【id:2】", "ガレノスによる「熱」の理論【id:3】", "「ツーセックス・モデル」への移行と啓蒙思想のジレンマ【id:4】", "セックスとジェンダーを区別したことの戦略的重要性【id:5】", "シモーヌ・ド・ボーヴォワールの「女になる」という言葉の意味【id:6】"],
          modelAnswer: "まず、①ヴィクトリア朝のイギリスでは、過度な活動は女性の『生殖器官にダメージを与え、帝国の未来を害する』という信念に基づき、中流階級の女性は教育やスポーツから排除された【id:1】。次に、②それ以前の古代から17世紀末までは、男女の身体は『本質的に類似』し『対極ではなく同型』と見なす『ワンセックス・モデル』が主流だった【id:2】。これは、例えばガレノスが男女の身体の違いを『熱』の量で説明したことにも表れている【id:3】。③このモデルが18世紀に『ツーセックス・モデル』へ移行した背景には、啓蒙思想が『平等』を掲げた結果、男女の身体が似ているなら女性にも同じ権利を認めねばならなくなるため、男女は『固定的で不平等な生物学的構造』であるという見方が男性の優位性を維持するために必要とされたという側面がある【id:4】。最後に、④こうした生物学的決定論に対抗するため、20世紀のフェミニズムは生物学的な『セックス』と文化的な『ジェンダー』を区別した【id:5】。これにより、女性の役割を『自然』として正当化する議論に反論することが可能になった。この思想を象徴するのが、シモーヌ・ド・ボーヴォワールの『人は女に生まれるのではなく、女になるのだ』という言葉であり、これは女性が社会の中で後天的に『女』として作り上げられていくプロセスを指摘したものである【id:6】。"
        },
        {
          title: "ジェンダー化された身体の形成とパフォーマティヴィティ理論",
          rank: "S",
          relatedQAs: [7, 8, 9, 10],
          problem: "プレゼンの後半、みかんは、より現代的な議論として、①コンネルの「ジェンダー化された身体」が作られるプロセス、②バトラーの「パフォーマティヴィティ」理論について説明し、③バトラー理論への批判にも言及することにした。どのような説明をすべきか述べなさい。",
          hint: "「身体が社会的に作られる」という考えを、コンネルの具体的なプロセス論と、バトラーのよりラディカルな構築主義の観点から説明することが求められています。ホルモンの研究が単純な二元論を揺るがしている点も補強材料になります。",
          points: ["レイウィン・コンネルが提唱した3つの段階【id:7】", "内分泌学が示唆した『性別のある身体の連続体』【id:8】", "ジュディス・バトラーの『パフォーマティヴィティ』の概念【id:9】", "バトラー理論への批判（身体への直接的暴力の軽視）【id:10】"],
          modelAnswer: "まず、①社会学者レイウィン・コンネルは、「ジェンダー化された身体」が作られるプロセスを3段階で説明した。それは、(1)男女の違いを強調するステレオタイプの存在、(2)それが実際の身体発達に変化を及ぼすこと、(3)その身体変化が元のステレオタイプを裏付けると解釈される、という循環である【id:7】。②こうした社会構築主義的な考え方は、男女ともに両方の性ホルモンを持つことを明らかにした内分泌学の知見によっても補強される【id:8】。③さらにジュディス・バトラーは『パフォーマティヴィティ』という概念で、ジェンダーは内なる本質ではなく、服装や話し方といった日々の行為の『反復によって作り上げられる』と主張した。この反復が、安定した実体があるかのような錯覚を生む【id:9】。しかし、④この理論には、パフォーマンスを強調しすぎることで、纏足や女性器切除のような『身体に直接的な危害を加える暴力的な慣習の深刻さ』を軽視しかねないという批判も存在する【id:10】。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
