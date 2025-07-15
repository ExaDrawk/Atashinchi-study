export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "kenpou-gender-1",
  title: "作られる『からだ』",
  category: "kenpou",
  citation: "母、ジェンダーって何？",
  rank: "A",
  tags: ["憲法", "人権", "平等原則", "ジェンダー", "社会"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '本稿は、私たちの身体、特に「性差」と見なされているものが、純粋な生物学的要因だけでなく、社会的・文化的要因によっていかに形成されるかを論じます。【id:1】\n\n【議論の出発点】\n一般的に、男女の身体的・神経学的な違いは、生殖における役割に根ざした、根本的で不変のものだと広く信じられています。この「生物学的決定論」は、男性と女性がそれぞれ異なる能力や社会的役割に適しているという考え方の基礎となっています。【id:2】\n\n【社会的構築主義の視点】\nしかし、本稿はこの見方に疑問を呈します。「性別」や「ジェンダー」の定義や解釈の多様性は、「男」「女」という二元論的な身体の捉え方を問題化します。歴史を振り返ると、「自然な性差」という観念が、人々を固定的で不平等な役割に縛り付けるために利用されてきたことがわかります。【id:3】\n\n【歴史的事例：ヴィクトリア朝の女性】\n19世紀イギリスの中流階級の女性は、過度な身体的・精神的活動が「生殖器官を損なう」という信念に基づき、高等教育や活発なスポーツから排除されました。月経や妊娠といった生物学的特徴が、彼女たちを家庭内の限定的な役割に押し込め、健康、社会的地位、経済的機会を奪う根拠とされたのです。まさに「解剖学が運命を決定した」時代でした。【id:5】\n\n【結論】\n身体的な「性差」が自然で不変であるという考えは、歴史的に固定的なアイデンティティと不平等を正当化してきました。社会関係や文化的意味合いが、人々の身体的能力や運命にどう影響してきたかを探ることは、現代の平等を考える上で非常に重要です。【id:4】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'A', 
      question: '私たちの身体が、純粋な生物学的要因だけでなく、社会的・文化的要因によっても形成されるとする考え方について説明しなさい。', 
      answer: 'これは、身体や性差が生まれつきの生物学的性質によって{{一方的に決定されるのではなく}}、我々が生活する{{社会の慣習、価値観、人間関係}}といった社会的・文化的要因から大きな影響を受けて形作られるという考え方である。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '性差に関する「生物学的決定論」とはどのような考え方か説明しなさい。', 
      answer: '生物学的決定論とは、男女の生理的・神経学的な違いが、主に{{生殖における役割}}に基づいており、その違いは{{根本的かつ不変}}であるとする考え方である。この視点によれば、性差は生まれつきのものであり、個人のアイデンティティや能力、社会的役割までを決定づけるとされる。' 
    },
    { 
      id: 3, 
      rank: 'B', 
      question: '「自然な性差」という考え方が、歴史的にどのように利用されてきたと本稿は指摘しているか。', 
      answer: '本稿は、「自然で変更不可能」とされる性差の観念が、歴史的に男女に{{固定的なアイデンティティ}}を割り当て、彼らを{{限定的で不平等な役割}}に閉じ込めるための正当化の道具として利用されてきたと指摘している。'
    },
    {
      id: 4,
      rank: 'B',
      question: '身体のあり方が「男」と「女」の二つだけではないと考えることは、なぜ重要なのか。',
      answer: '身体のあり方を「男」と「女」の二元論で捉えることは、その枠に収まらない人々を排除する可能性がある。また、{{社会的・文化的に作られた性別の役割}}を、あたかも{{生物学的に決定された自然なもの}}であるかのように見せかけ、不平等を永続させる危険があるため、この二元論を問い直すことは重要である。'
    },
    {
      id: 5,
      rank: 'A',
      question: '本稿が例として挙げたヴィクトリア朝時代のイギリス中流階級の女性は、どのような状況に置かれていたか説明しなさい。',
      answer: 'ヴィクトリア朝時代のイギリス中流階級の女性は、「激しい運動や勉強は{{生殖能力に悪影響を及ぼす}}」という当時の医学的信念に基づき、{{高等教育や活発なスポーツへの参加}}を禁じられていた。その結果、月経や妊娠といった生物学的特徴が彼女たちを家庭内に縛り付け、健康や社会的・経済的成功の機会を男性から奪われる根拠とされた。これは「{{解剖学が運命を決定した}}」典型例である。'
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ある晴れた日の午後、タチバナ家のリビング' },
    { type: 'narration', text: 'リビングでは母、水島さん、戸山さん、三角さんの「マダム・デ・ジュネ」のお茶会が開かれている。テーブルには美味しそうなケーキが並び、その傍らでみかんが司法試験の勉強をしている。' },
    { type: 'dialogue', speaker: '母', expression: 'happy', dialogue: 'いやー、やっぱり男の人は力仕事、女の人は細かい作業が得意よねぇ。うちのお父さんなんて、ボタン付け一つできないんだから。生まれつき決まってるのよ、きっと。' },
    { type: 'dialogue', speaker: '水島さん', expression: 'thinking', dialogue: 'うーん、本当に「生まれつき」なんでしょうかね、奥さん。' },
    { type: 'dialogue', speaker: '母', expression: 'surprised', dialogue: 'え？違うの、水島さん？' },
    { type: 'dialogue', speaker: '水島さん', expression: 'normal', dialogue: '私たちが「当たり前」とか「自然」だと思っている男女の違いって、実は社会や文化によって作られてる部分も大きい、っていう考え方があるんですよ。ちょうど面白い文章を読んだところなんです。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '（社会によって作られた男女の違い…？憲法の平等原則あたりで出てきそうな話だな…）' },
    {
      type: 'embed',
      format: 'html',
      title: '原文紹介',
      description: '水島さんが紹介してくれた英文のテキスト',
      content: '<div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: serif; line-height: 1.6;"><h4>Sexed bodies</h4><p>The idea that our bodies are shaped by social forces and relationships, rather than being ruled and regulated exclusively by natural biological factors, is perhaps most contentious in relation to the subject of sex differences. Indeed, the belief that there exist fundamental and immutable differences in the physiological and neurological make-up of males and females-based significantly on their role in biological reproduction-remains widely held and socially influential. From this perspective, sex differences are evident at birth, amplify during puberty and adolescence, and reach out to influence the personal identities and relationships, leisure preferences and working lives of men and women. They further ensure that the sexes have fundamentally dissimilar bodies, tastes, and abilities, excel at different tasks, and are suited to different social roles. As one popular psychological text expressed it, the gulf that separates us is so pronounced that men might as well have originated from Mars and women from Venus. Space travel is not, however, necessary to the arguments of most who view male and female forms of embodiment as opposites. Rather, it is natural evolutionary processes that are more usually identified as having created the physical, hormonal, and neurological differences between the sexes that determine men\'s dominance in such areas as physical strength, spatial tasks, and logical reasoning, and women\'s superiority in multi-tasking, empathy, and communication. Such a chasm, according to those sociobiologists who were influential exponents of this argument from the 1970s, makes it inevitable that the facts of biologically sexed bodies are bound to constrain and direct the organization of society. Despite the continued popularity of this view, the subject of sexed bodies actually provides us with an excellent means of exploring how social relationships and cultural meanings have, over the centuries, influenced the capacities and destinies of those defined as \'men\' and \'women. The various ways in which \'sex\' and \'gender\' have been defined and interpreted, indeed, renders problematic the idea that there exist, and have always existed, just two forms of embodiment (male and female). Evaluating the salience of social and cultural factors to this process is, moreover,remely important: the suggestion that embodied \'sex differences\' are natural and unalterable has been used historically to assign fixed identities to men and women, identities that condemn them to limited and unequal roles. The effect of such stereotypical views of the body can be illustrated by referring to the position of middle-class women in Victorian Britain. Forbidden from entering higher education and dissuaded from participating in vigorous sports, these exclusions were justified by the belief that physical or mental overexertion would damage their reproductive organs and harm the future fitness of an imperial race. Dominated by the natural cycles of menstruation, pregnancy, and childbirth (biological facts that fitted them for a limited role in the home), these women were precluded from those activities and institutions that provided their male counterparts with benefits in terms of their health, social standing, and economic prospects. Anatomy determined destiny.</p></div>'
    },
    { type: 'dialogue', speaker: '戸山さん', expression: 'normal', dialogue: 'まあ、素敵な文章ね。私が訳してみましょうか。' },
    { type: 'dialogue', speaker: '母', expression: 'impressed', dialogue: 'お願いするわ、戸山さん！' },
    { type: 'narration', text: '戸山さんは、落ち着いた声で文章の日本語訳を読み上げ始める。' },
    { type: 'dialogue', speaker: '戸山さん', expression: 'normal', dialogue: '「私たちの身体が、もっぱら自然な生物学的要因によって支配・調整されるのではなく、社会的勢力や関係によって形成されるという考え方は、こと性差の問題に関しては、おそらく最も議論を呼ぶものでしょう。…」' },
    { type: 'dialogue', speaker: '三角さん', expression: 'thinking', dialogue: '「男は火星から、女は金星から来た」なんて本が昔流行りましたけど、そういう考え方が根強いということでしょうね。' },
    { type: 'dialogue', speaker: '水島さん', expression: 'serious', dialogue: 'そうなんです。でも、この文章が指摘しているのは、そういう「生まれつきの違い」という考え方が、社会の仕組みを方向づけ、時には不平等を生み出す原因にもなってきた、という点です。【id:3】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: '（不平等を…？それって、まさに【憲法14条】が禁止しようとしてることじゃない！）' },
    {
      type: 'embed',
      format: 'mermaid',
      title: '考え方の整理',
      description: '「性差」に対する二つの主要な考え方の流れを図で見てみましょう。',
      content: `graph TD
        subgraph "考え方の分岐"
            A["生物学的な身体の特徴"] --> B{"社会・文化の影響は？"};
            B -- 無視・軽視 --> C[生物学的決定論];
            B -- 重視 --> D[社会的構築主義];
        end

        subgraph "生物学的決定論のロジック"
            C --> E["男女の差は固定的・不変"];
            E --> F["能力・社会的役割も<br>生物学的に決まる"];
        end

        subgraph "社会的構築主義のロジック"
            D --> G["身体は社会から影響を受ける"];
            G --> H["性差やジェンダー役割は<br>時代や文化で変化する"];
        end

        classDef decision fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
        classDef determinism fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
        classDef constructivism fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
        classDef root fill:#e5e7eb,stroke:#4b5563,stroke-width:2px;
        
        class A root;
        class B decision;
        class C,E,F determinism;
        class D,G,H constructivism;`
    },
    { type: 'narration', text: 'リビングのドアが少し開き、ユズヒコが顔を覗かせる。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: '（うわ、母さんの友達勢ぞろいかよ…なんか難しい話してるし…）' },
    { type: 'narration', text: 'ユズヒコはみかんに目配せすると、音を立てずに冷蔵庫からお茶を取り、さっと自室に戻っていった。' },
    { type: 'dialogue', speaker: '戸山さん', expression: 'normal', dialogue: '続きを訳しますね。「…こうした違いが、歴史的に男女に固定的なアイデンティティを割り当て、彼らを限定的で不平等な役割に追いやるために利用されてきたのです。その影響は、ヴィクトリア朝時代の英国における中流階級の女性の地位を参照することで例証できます。」' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'ヴィクトリア時代！具体的にどんな感じだったんだろう…。' },
    { type: 'dialogue', speaker: '戸山さん', expression: 'serious', dialogue: '「高等教育を受けることを禁じられ、激しいスポーツへの参加も思いとどまらされたのですが、これらの排除は、身体的または精神的な過度の運動が、彼女たちの生殖器官を傷つけ、帝国の人種の将来の適応性を害するという信念によって正当化されていました。」【id:5】' },
    { type: 'dialogue', speaker: '母', expression: 'surprised', dialogue: 'ええーっ！？勉強や運動したら子供が産めなくなるって本気で信じられてたの！？ひどい話ねぇ！' },
    { type: 'dialogue', speaker: '三角さん', expression: 'sad', dialogue: 'つまり、女性は「子を産むための身体」という一面だけで捉えられて、他の可能性を全て閉ざされてしまったのですね。' },
    {
      type: 'embed',
      format: 'html',
      title: 'ヴィクトリア朝女性の状況',
      description: '「生物学的特徴」が社会的制約にどう結びついたか',
      content: '<div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 5px solid #f59e0b;"><table style="width: 100%; border-collapse: collapse;"><thead><tr style="color: #92400e;"><th style="padding: 12px; text-align: left; border-bottom: 2px solid #fcd34d;">当時の「常識」・信念</th><th style="padding: 12px; text-align: left; border-bottom: 2px solid #fcd34d;">もたらされた結果（社会的制約）</th></tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #fef3c7;">女性の身体は繊細で、特に生殖機能は過度の活動に弱い。</td><td style="padding: 10px; border-bottom: 1px solid #fef3c7;">高等教育や専門職からの排除。</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #fef3c7;">女性の本来の役割は家庭内にあり、子を産み育てることだ。</td><td style="padding: 10px; border-bottom: 1px solid #fef3c7;">活発なスポーツや公的活動への参加の制限。</td></tr><tr><td style="padding: 10px;">月経や妊娠などの「自然のサイクル」が女性を支配している。</td><td style="padding: 10px;">経済的自立や社会的地位向上の機会剥奪。</td></tr></tbody></table></div>'
    },
    { type: 'dialogue', speaker: '戸山さん', expression: 'serious', dialogue: 'そして、文章の最後はこう締めくくられています。「…解剖学が、運命を決定したのです。」' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: '解剖学が運命を決定した…。すごい言葉…。身体の特徴だけで、その人の生き方全部が決めつけられちゃうなんて、絶対おかしいよ。【id:4】' },
    { type: 'dialogue', speaker: '水島さん', expression: 'happy', dialogue: 'その通りよ、みかんちゃん。だからこそ、今の私たちが、人間の尊厳や個人の尊重、そして法の下の平等といった憲法の価値をしっかり理解して、昔のような過ちを繰り返さないようにしなきゃいけないの。' },
    { type: 'narration', text: '水島さんの言葉に、みかんは深く頷く。リビングの窓から差し込む西日が、真剣な顔でメモを取るみかんを照らしていた。' },
    { type: 'dialogue', speaker: '母', expression: 'normal', dialogue: 'なんだか難しい話だったけど、ためになったわぁ。さ、みなさん、ケーキのおかわりはいかが？' },
    { type: 'dialogue', speaker: '三角さん', expression: 'laughing', dialogue: 'あら、いただきますわ。頭を使うと甘いものが欲しくなりますものね。' },
    { type: 'narration', text: '和やかな笑い声がリビングに響き、お茶会はまだ続くのだった。' }
  ],
    // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">作られる『からだ』：ジェンダーと法の下の平等</h3>
    <p class="mb-4">
      私たちの多くは、男女の身体的な違い（性差）を、生まれつき備わった「自然」で不変のものだと考えがちです。しかし、本稿で取り上げたように、「男らしい身体」「女らしい身体」というイメージや、それに基づいて期待される役割は、生物学的な要因だけで決まるのではなく、私たちが生きる社会の歴史、文化、価値観によって大きく形作られています。このような視点は、<strong>【憲法14条1項】</strong>が保障する「法の下の平等」を考える上で、極めて重要な示唆を与えてくれます。
    </p>

    <h4 class="text-lg font-bold mt-6 mb-2">「生物学的決定論」とその問題点</h4>
    <p class="mb-4">
      「男性は力が強く論理的、女性は共感力が高くきめ細かい」といった考え方は、「生物学的決定論」と呼ばれることがあります【id:2】。これは、男女の役割の違いは生殖機能に根差した生物学的な差から必然的に生じる、という見方です。しかし、この考え方は、二元的な枠に当てはまらない人々の存在を無視するだけでなく、「自然なこと」を口実に、固定的な役割を押し付け、社会的な不平等を正当化する道具として利用されてきた歴史があります【id:3】。
    </p>

    <h4 class="text-lg font-bold mt-6 mb-2">ヴィクトリア朝の教訓：「解剖学が運命を決定した」時代</h4>
    <p class="mb-4">
      19世紀のイギリスにおける中流階級の女性の例は、この問題を鮮やかに示しています。彼女たちは「勉強や激しい運動は、女性固有の生殖器官に害を及ぼす」という、当時の医学的信念に基づいて、高等教育やスポーツから排除されました【id:5】。月経や妊娠といった生物学的特徴が、彼女たちを家庭という狭い空間に縛り付け、健康、社会的地位、経済的機会を男性から奪う根拠とされたのです。まさに「解剖学が運命を決定した」状況でした。これは、生物学的な事実そのものではなく、その事実に対する社会的な<strong>解釈</strong>や<strong>意味付け</strong>が、人々の可能性を制限し、不平等な構造を生み出した典型例と言えます。
    </p>

    <h4 class="text-lg font-bold mt-6 mb-2">【憲法14条】とジェンダー平等</h4>
    <p class="mb-4">
      【憲法14条1項】は、「人種、信条、性別、社会的身分又は門地により、政治的、経済的又は社会的関係において、差別されない」と定めています。この「性別」を理由とする差別を考える際、単に生物学的な違いだけを見るのではなく、その違いに社会がどのような意味を与え、どのような役割を期待してきたか（＝ジェンダー）という視点を持つことが不可欠です。
    </p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">形式的平等から実質的平等へ</span>：単に男女を同じに扱うだけでなく、歴史的・社会的に作られてきた不平等を是正し、実質的な機会の平等を確保することが求められます。</li>
      <li><span class="text-red-600 font-bold">固定観念の打破</span>：「男だから」「女だから」といった固定的な役割分担（ステレオタイプ）に基づいた法制度や慣行は、【憲法14条】が禁止する不合理な差別に該当する可能性が高いと判断されます【id:4】。</li>
    </ul>

    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験・予備試験のポイント</h5>
      <p>
        憲法の平等権に関する問題では、単に条文の文言をなぞるだけでなく、その背後にある差別の構造を深く理解しているかが問われます。特にジェンダーに関する判例（例：再婚禁止期間訴訟、非嫡出子相続分差別訴訟など）を学習する際には、「生物学的な性差」と「社会的に構築された性別役割（ジェンダー）」という二つの視点を区別し、法律が後者の固定観念を助長・再生産していないかを批判的に検討する姿勢が重要です。歴史的な背景を踏まえ、なぜその規制が不合理な差別にあたるのかを、説得的に論証する能力が求められます。
      </p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "性差の社会的構築と平等原則",
      rank: "A",
      background: `ある日、タチバナ家で母が「男は力仕事、女は家事、それが自然な役割分担よ」と話していたところ、友人の水島さんから「『自然な性差』という考え方自体が、実は社会や文化によって作られたものかもしれない」という指摘を受けた。水島さんはその根拠として、かつてヴィクトリア朝の女性が「勉強や運動は生殖能力に悪影響がある」という理由で社会参加を制限されていた歴史的な事実を紹介した。この話を聞いたみかんは、【憲法14条】が保障する法の下の平等と、社会的に作られる「性別」の関係について深く考えることになった。`,
      subProblems: [
        {
          title: "生物学的決定論と社会的構築主義",
          rank: "A",
          relatedQAs: [1, 2, 3],
          problem: "母が主張するような「男女の違いは生まれつきで固定的」という考え方（生物学的決定論）と、水島さんが紹介した「性差は社会的に意味付けされ、作られる」という考え方（社会的構築主義）を対比して説明しなさい。その上で、後者の考え方が【憲法14条1項】の解釈、特に「性別」を理由とする差別の判断において、どのような意義を持つかを論じなさい。",
          hint: "二つの考え方の核心的な違いは何か、そして、社会的構築主義が憲法の「平等」の理念とどのようにつながるのかがポイントです。単なる定義の暗記ではなく、なぜその考え方が重要なのかを説明してください。",
          points: ["生物学的決定論の定義と内容【id:2】", "社会的構築主義の定義と内容【id:1】", "「自然な性差」という観念が歴史的に果たしてきた役割【id:3】", "社会的構築主義と【憲法14条1項】の解釈との関連性"],
          modelAnswer: "生物学的決定論とは、男女の生理的・神経学的な違いが根本的かつ不変であり、個人の能力や社会的役割を決定づけるとする考え方である【id:2】。これに対し社会的構築主義は、身体や性差が純粋な生物学的要因だけでなく、社会の慣習や価値観によっても形成されると捉える【id:1】。歴史的に「自然な性差」の観念は、人々を固定的で不平等な役割に縛り付けるために利用されてきた側面がある【id:3】。\n【憲法14条1項】が「性別」による差別を禁じているのは、まさにこのような社会的・文化的に作られた固定的役割分担（ステレオタイプ）に基づき、個人の尊厳を傷つけ、自由な生き方の選択を阻害することを防ぐ趣旨である。したがって、社会的構築主義の視点は、ある法制度や慣行が、生物学的差異に名を借りた社会的偏見を再生産・固定化するものでないかを厳しく審査することを可能にし、【憲法14条1項】の平等の理念を実質化する上で重要な意義を持つ。"
        },
        {
          title: "歴史的事例の法的意義",
          rank: "A",
          relatedQAs: [4, 5],
          problem: "ヴィクトリア朝の女性が「解剖学が運命を決定した」と評される状況に置かれた具体例を挙げなさい。また、このような歴史的事実が、現代の法解釈、特に「性別」を理由とする不合理な差別を判断する上で、どのような示唆を与えるかについて述べなさい。",
          hint: "歴史的な具体例を正確に指摘し、それが現代の法解釈にとってなぜ重要なのか、という「過去から未来への視点」が問われています。「解剖学が運命を決定した」とはどういうことかを、法的な言葉で説明することが求められます。",
          points: ["ヴィクトリア朝の女性が置かれた具体的状況（教育・スポーツからの排除）【id:5】", "生物学的特徴が社会的制約の根拠とされた点", "「解剖学が運命を決定した」の意味", "歴史的事実が現代の違憲審査に与える示唆（ステレオタイプに基づく差別の警戒）【id:4】"],
          modelAnswer: "ヴィクトリア朝の女性は、「過度の知的・身体的活動が生殖器官に害を及ぼす」という医学的信念に基づき、高等教育や活発なスポーツへの参加を制限された【id:5】。これは、月経や妊娠といった生物学的特徴への社会的意味付けが、彼女たちを家庭内の役割に縛り付け、経済的・社会的な機会を奪うことを正当化したものであり、「解剖学が運命を決定した」と評される。\nこのような歴史的事実は、現代の法解釈において、生物学的差異を根拠とする区別が、真にその差異に由来するものか、あるいは社会的に作られた偏見やステレオタイプを内包していないかを、慎重に吟味する必要性を示唆する。安易に「男女の身体の違い」を根拠とする法規制は、過去の過ちを繰り返す危険をはらんでおり、「性別」を理由とする不合理な差別にあたるとして、厳格な違憲審査が要請されるべきである【id:4】。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
