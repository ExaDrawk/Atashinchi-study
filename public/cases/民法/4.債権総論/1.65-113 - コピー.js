export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: 'minpou-saiken-daiiken',
  title: '【民法・債権】債権者代位権',
  category: 'minpou',
  citation: '最判昭50.3.6',
  rank: 'A',
  tags: ['民法', '債権', '債権者代位権', '責任財産保全', '無資力要件'],
  rightSideCharacters: ['ユズヒコ'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '【債権者代位権の概要】\n- **重要概念**: 債権者が、自己の債権を保全するために、債務者が持つ権利（被代位権利）を債務者に代わって行使する制度です。【id:29】\n- **目的**: 債務者の責任財産を保全し、債権回収を確実にすることにあります。\n- **基本要件**: ①被保全債権の存在、②被保全債権の弁済期到来、③保全の必要性（債務者の無資力）、④債務者が権利を行使しないこと、⑤被代位権利が一身専属権でないことが必要です。【id:29】\n\n【債権者代位権の転用】\n- **概要**: 債務者の責任財産保全という本来の目的とは関係なく、特定の債権を保全するために債権者代位権の行使が認められる場合があります。【id:31】\n- **特徴**: この「転用」の場合、債務者の無資力は要件とされません。【id:31】\n- **具体例**: 不動産の買主が、売主のさらに前の所有者に対する登記請求権を代位行使するケースなどがあります（【民法423条の7】）。\n\n【重要判例：最判昭50.3.6】\n- **事案**: 共同相続人の一人が登記義務の履行を拒んだため、買主が代金支払いを拒絶。他の共同相続人が、買主に代位して登記請求権を行使した事案。\n- **判旨**: このような特定債権の保全を目的とする代位権行使では、債務者（買主）の無資力は不要と判断されました。【id:32】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    {
      id: 29,
      rank: 'A',
      question: '債権者代位権（【民法423条1項】本文）が認められるための要件について説明しなさい。',
      answer: '債権者代位権の要件は、①被保全債権が原則として金銭債権であること、②被保全債権が弁済期にあること（【民法423条2項】本文）、③債権保全の必要性があること（債務者の無資力）（【民法423条1項】本文）、④債務者が自ら権利を行使しないこと、⑤被代位権利が一身専属権でないこと（【民法423条1項】ただし書）です。'
    },
    {
      id: 30,
      rank: 'B',
      question: '債権者代位権（【民法423条1項】本文）の要件事実について説明しなさい。',
      answer: '要件事実は、{{被保全債権の発生原因事実}}、{{債務者の無資力}}、{{被代位権利の発生原因事実}}です。'
    },
    {
      id: 31,
      rank: 'A',
      question: '「登記又は登録をしなければ権利の得喪及び変更を第三者に対抗することができない財産を譲り受けた者は、その譲渡人が第三者に対して有する登記手続又は登録手続をすべきことを請求する権利を行使しないときは、その権利を行使することができる」（【民法423条の7】前段）とされていますが、この場合以外にも非金銭債権保全のための債権者代位権（【民法423条1項】本文）の行使は認められますか。',
      answer: '判例（大判明43.7.6）は認めています。このような「転用」の場合、債務者の{{無資力は要件とならない}}と解されています。その理由は、①特定の権利保全という社会的必要性があること、②条文上、被保全債権の種類に制限がないことなどに基づきます。'
    },
    {
      id: 32,
      rank: 'A',
      question: 'BはAに土地を売却し、その代金の一部を受け取った後に死亡し、C・DがBを相続した。DはAから残代金の支払を受けることを望んだが、CはAへの移転登記義務の履行を拒否した。Aは移転登記を含めて土地の提供が完全になされるまでは代金を支払わない（【民法533条】）と主張したが、Cに対して登記請求権を行使しようとしなかった。そこで、DはAに対する残代金請求権を被保全債権として、AのCに対する登記請求権の代位行使を請求した。この事例と債権者代位権（【民法423条1項】本文）の要件の1つである無資力要件との関係について説明しなさい。',
      answer: 'このケースでは、{{無資力要件は不要}}とされています（最判昭50.3.6）。これは、共同相続人の残代金債権という特定の債権を保全するための代位権行使（転用）であり、債務者の責任財産を保全する本来の目的とは異なるためです。'
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ユズヒコの中学校の教室。昼休みのにぎやかな時間。' },
    { type: 'narration', text: '川島が、眉間にしわを寄せて深く思い悩んでいる。その様子を山下が見ていた。' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: '川島、どうしたの？ そんなに難しい顔して。' },
    { type: 'dialogue', speaker: '川島', expression: 'desperate', dialogue: '山下さん…。実は、ユズピに貸してた限定版の丸野丸美のCDを、藤野くんが又貸ししちゃって…。しかも藤野くん、ナスオくんに返してって言わないの！このままだと私のCDが…！' },
    { type: 'dialogue', speaker: '山下', expression: 'thinking', dialogue: 'なるほどね。藤野くんにCDを返してもらう権利があるのに、藤野くんがナスオくんに対する返還請求権を使わないってことか。そういうときに関係してくるのが「債権者代位権」よ。' },
    { type: 'dialogue', speaker: '川島', expression: 'surprised', dialogue: 'サイケンシャダイイケン…？ なにそれ？ 私が代わりにナスオくんに取り立てできるってこと！？' },
    { type: 'narration', text: 'そこへ、たまたま通りかかったユズヒコが会話に加わった。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: 'ちょっと違うよ、川島さん。債権者代位権は、お金を返してもらえない時とかに、お金を借りてる人（債務者）の財産を守るために、その人が持ってる権利を代わりに行使する制度なんだ。' },
    { type: 'embed', format: 'mermaid', title: '債権者代位権の基本関係図', description: '当事者の関係性を整理してみよう', content: 'graph LR\n    A["債権者(川島)"] -- 被保全債権 --> B["債務者(藤野)"]\n    B -- 被代位権利 --> C["第三債務者(ナスオ)"]\n    A -.->|権利を代わりに行使| C' },
    { type: 'dialogue', speaker: '山下', expression: 'serious', dialogue: 'そうそう。ユズヒコの言う通り、この権利を使うにはいくつかの要件があるの。【民法423条】に定められてるんだけど…。【id:29】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'まず、大原則として、川島さんの藤野くんに対するCD返還請求権（被保全債権）を保全する必要がないといけない。具体的には、藤野くんが「無資力」、つまりお金とか財産が全然ない状態じゃないとダメなんだ。【id:29】' },
    { type: 'dialogue', speaker: '川島', expression: 'thinking', dialogue: 'え、藤野くんがお金持ちだったらダメなの？' },
    { type: 'dialogue', speaker: '山下', expression: 'impressed', dialogue: 'うん。藤野くんにお金があるなら、万が一CDが返ってこなくても損害賠償請求してお金で解決できるでしょ？だから、わざわざ代位権を使う必要がないって考えられてるの。これが「保全の必要性」ね。【id:30】' },
    { type: 'narration', text: '山下は、さらに説明を続ける。' },
    { type: 'dialogue', speaker: '山下', expression: 'normal', dialogue: '他にも、藤野くん自身がナスオくんに「返して」って言おうとしないこととか、そのCD返還請求権が藤野くんだけの特別な権利じゃないこと、とかが要件になるよ。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'でも、例外もあるんだ。その「無資力」っていう要件が必要ない場合が。これを債権者代位権の「転用」って言うんだよ。【id:31】' },
    { type: 'dialogue', speaker: '川島', expression: 'excited', dialogue: 'てんよう！？ それなら使えるかも！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '例えば、不動産の登記請求権みたいに、特定された権利を守るためなら、債務者がお金を持っていても代位権を使えることがあるんだ。責任財産を守るっていう本来の目的とはちょっと違う使い方だから「転用」って呼ばれてる。【民法423条の7】にも関連する規定がある。' },
    { type: 'embed', format: 'mermaid', title: '債権者代位権の判断フロー', description: '無資力要件の要否', content: 'graph TD\n    A["債権者代位権の行使を検討"] --> B{"目的は何か？"}\n    B -->|"責任財産の保全(本来型)"| C["無資力要件が必要"]\n    B -->|"特定債権の保全(転用型)"| D["無資力要件は不要"]' },
    { type: 'dialogue', speaker: '山下', expression: 'impressed', dialogue: 'ユズヒコ、詳しいね。有名な判例で、相続が絡んだ複雑な土地売買のケースでも、特定の債権（売買代金請求権）を守るために、買主が無資力じゃなくても代位権の行使を認めたものがあるんだよ。【id:32】' },
    { type: 'dialogue', speaker: '川島', expression: 'thinking', dialogue: 'うーん、じゃあ私の場合は……ユズピとの愛の結晶であるCDを守るという、特定物の引き渡し請求権の保全だから…転用にあたる…！？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: '話が飛躍しすぎだよ…。そもそも僕のCDじゃないし。まあ、理屈としてはそういう考え方もあるかもしれないけど…。' },
    { type: 'narration', text: '昼休み終了のチャイムが鳴り響く。川島は一人で納得したように力強く頷いていた。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: '<h3 class="text-xl font-bold mb-4">債権者代位権（【民法423条】）の要件と転用</h3>\n<p class="mb-4">債権者代位権は、債権者が自己の債権を保全するため、債務者の責任財産を維持する必要がある場合に、債務者に代わってその権利を行使できる制度です。これにより、債務者の財産が不当に減少することを防ぎ、債権の回収を確実にします。</p>\n\n<h4 class="text-lg font-bold mt-6 mb-2">1. 債権者代位権の基本要件</h4>\n<p class="mb-4">債権者代位権の行使には、以下の要件を満たす必要があります[6][7]。</p>\n<ul class="list-disc list-inside mb-4 pl-4 space-y-2">\n  <li><span class="text-red-600 font-bold">被保全債権の存在と弁済期の到来</span>：債権者が債務者に対して有効な債権を持っており、その履行期限が来ていること（【民法423条2項】）。ただし、時効の中断など「保存行為」の場合は期限前でも可能です[6]。</li>\n  <li><span class="text-red-600 font-bold">保全の必要性（無資力要件）</span>：債務者が資力を欠いており、債権者がそのままでは債権の満足な弁済を受けられない状態であること[10][13]。これが最も基本的な要件です。</li>\n  <li><span class="text-red-600 font-bold">債務者の権利不行使</span>：債務者が、自らその権利を行使していないこと[13]。</li>\n  <li><span class="text-red-600 font-bold">被代位権利が専属性を有しないこと</span>：代位行使される権利が、慰謝料請求権や扶養請求権など、債務者の一身に専属する権利でないこと（【民法423条1項】ただし書）[6]。</li>\n</ul>\n\n<h4 class="text-lg font-bold mt-6 mb-2">2. 債権者代位権の「転用」と無資力要件の不要</h4>\n<p class="mb-4">判例は、責任財産の保全という本来の目的以外でも、特定の債権を保全するために債権者代位権の行使を認めてきました。これを「転用」と呼びます[11]。</p>\n<ul class="list-disc list-inside mb-4 pl-4 space-y-2">\n  <li><span class="text-red-600 font-bold">無資力要件の不要</span>：転用の場面では、特定の債権を実現することが主目的となるため、債務者の無資力は要件とされません[11]。例えば、不動産の二重譲渡における登記請求権の代位行使などが典型例です。</li>\n  <li><span class="text-red-600 font-bold">最判昭50.3.6の意義</span>：設問の判例は、共同相続が絡む複雑な事案において、売主（共同相続人）が買主の登記請求権を代位行使する際に、買主の無資力は不要であると判断しました[6]。これは、売主の「残代金請求権」という特定債権を保全するための転用事例であると位置づけられたためです。</li>\n</ul>\n\n<div class="bg-yellow-100 p-4 rounded-lg mt-6">\n  <h5 class="font-bold text-yellow-800">司法試験ポイント</h5>\n  <p>債権者代位権では、まず「本来型」か「転用型」かを見極めることが重要です。金銭債権を保全するための責任財産保全が目的なら「本来型」で無資力要件が必須。一方、登記請求権や妨害排除請求権など、特定の権利の実現が目的なら「転用型」となり、無資力要件は不要と判断します。論文式試験では、事案がどちらの類型に当たるかを的確に分析し、無資力要件の要否を論じる能力が問われます。</p>\n</div>',

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: '債権者代位権の行使に関する問題',
      rank: 'A',
      background: 'ユズヒコはナスオに10万円を貸しているが、ナスオは返済期限が過ぎても全く返済しない。ナスオにはめぼしい財産がなく、事実上の無資力状態である。一方、ナスオは親友の藤野に対して、以前貸したゲームソフトの返還請求権と、アルバイト代の未払金5万円の支払請求権を持っているが、友人関係を気にしてどちらの権利も行使しようとしない。',
      subProblems: [
        {
          title: '債権者代位権の要件と要件事実',
          rank: 'A',
          relatedQAs: [29, 30],
          problem: 'ユズヒコがナスオの藤野に対する権利を代位行使するために必要な【民法423条】上の要件を説明しなさい。また、ユズヒコが訴訟で代位権を行使する場合、主張・立証すべき要件事実は何かを述べなさい。',
          hint: '債権者代位権の基本的な要件を条文に沿って整理し、訴訟における主張立証責任の観点から要件事実を考えてみましょう。',
          points: [
            '被保全債権の存在と弁済期到来',
            '保全の必要性（債務者の無資力）',
            '債務者の権利不行使',
            '被代位権利の非専属性',
            '要件事実としての①被保全債権、②無資力、③被代位権利の発生原因事実'
          ],
          modelAnswer: 'ユズヒコが債権者代位権を行使するには、①自己のナスオに対する10万円の貸金債権（被保全債権）の弁済期が到来していること、②ナスオが無資力であること（保全の必要性）、③ナスオが藤野に対する権利を行使しないこと、④ナスオの藤野に対する権利が一身専属権でないこと、の4つの要件を満たす必要がある【id:29】。訴訟における要件事実は、①ユズヒコのナスオに対する貸金債権の発生原因事実、②ナスオの無資力、③ナスオの藤野に対する各権利（被代位権利）の発生原因事実である【id:30】。'
        },
        {
          title: '債権者代位権の転用と無資力要件',
          rank: 'A',
          relatedQAs: [31, 32],
          problem: '仮に、上記の事案とは異なり、岩城くんが父から土地甲を買い受けたが、父はその前に祖父から土地甲を相続していたものの、所有権移転登記をしていなかった。岩城くんは父に登記を請求したが、父は多忙を理由に登記手続を行わない。この場合、岩城くんは父に代位して、祖父の他の相続人に対し、父への所有権移転登記手続を請求できるか。その際の無資力要件の要否について、判例の考え方（最判昭50.3.6等）を踏まえて論じなさい。',
          hint: 'この事案が責任財産の保全を目的とする「本来型」か、特定の権利の実現を目的とする「転用型」かを判断することが鍵となります。',
          points: [
            '債権者代位権の「転用」の意義',
            '特定債権の保全を目的とする代位権行使であること',
            '転用型における無資力要件不要の考え方',
            '判例（最判昭50.3.6）の射程'
          ],
          modelAnswer: '岩城くんは、父に対する土地甲の所有権移転登記請求権という特定債権を保全するため、父が有する祖父の他の相続人に対する所有権移転登記手続請求権を代位行使できる。これは債権者代位権の「転用」にあたる【id:31】。判例は、このような特定債権の保全を目的とする代位権行使の場合、債務者の責任財産保全を目的とする本来の債権者代位権とは趣旨が異なるため、債務者の無資力を要件としないと解している。最判昭50.3.6も同様の趣旨であり、特定の債権の円滑な実現を図る必要がある場合には、債務者の資力の有無を問わずに代位権行使を認めている【id:32】。したがって、本件でも父が無資力である必要はない。'
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
