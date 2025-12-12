export default {
   // === 1. モジュール基本情報 ============
   title: "物上代位のすべて",
   citation: "ナスオ、燃え尽きるっ？",
   rank: "A",
   tags: ["民法", "担保物権", "抵当権", "物上代位"],
   category: "民法",
   subcategory: "3",

   // === 2. Q&A参照 =====================
   questionsAndAnswers: [
      "民法.3.〔20.29〕", // 新規追加分（物上代位の意義〜債権譲渡との優劣）
      "民法.3.5",         // 抵当権の性質（参照用既存Q&Aと仮定）
   ],

   // === 3. 事案ストーリー ================
   story: [
    { type: 'bgm' },
    { type: 'background' },
    { type: 'scene', text: 'ユズヒコの中学校、教室。休み時間。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'excited', dialogue: '聞いたかユズピ！ 親戚の家の話なんだけどさ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'また変な話じゃないだろうな、ナスオ。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'laughing', dialogue: 'その親戚の家、借金のかたに抵当権？とか設定されてたらしいんだけど、昨日火事で全焼しちゃったんだって！' },
    { type: 'dialogue', speaker: '藤野', expression: 'surprised', dialogue: 'ええっ！ 全焼！？ 大変じゃねーか！' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'smug', dialogue: 'それがさ、不幸中の幸いで、ガッツリ火災保険に入ってたらしいんだよ。これで借金のことは忘れて、保険金で豪遊できるって喜んでたぜ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '……それ、本当に大丈夫か？ 抵当権者に持っていかれるんじゃないのか？' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'confused', dialogue: 'は？ 家が燃えたら抵当権も燃えてなくなるだろ？ 物がなきゃ権利もない。これ常識っしょ！' },
    { type: 'bgm' },
    { type: 'dialogue', speaker: '原先生', expression: 'angry', dialogue: '甘い。甘すぎる。ナスオの考え。砂糖漬けのカルビ。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'surprised', dialogue: 'げっ、ハラセン！' },
    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: '抵当権。そんなに柔じゃない。{{物上代位}}。これを理解していない。', check: "1" },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'やっぱり……。【民法372条】で準用する【民法304条】の物上代位ですね【id:20】。' },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: 'その通り。抵当権。目的物の交換価値を把握する権利。形が変わっても、価値さえ残っていれば追いかける。それが物上代位。' },
    { type: 'embed', format: 'board', title: '物上代位の要件（民法304条1項）', description: '原先生が黒板に書いた要件', content: "1. 目的物の売却、賃貸、滅失又は損傷によって債務者が受けるべき金銭その他の物が生じること\n2. 払渡し又は引渡し前の差押え" },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: 'この要件。満たせば、保険金も抵当権者が持っていく。ナスオの親戚。豪遊、不可能。【id:21】' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'desperate', dialogue: 'マジかよ！ 保険金は家の代わりになるのかよ！？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '判例も、保険金請求権は実質的に目的不動産の価値代表物だとして、物上代位を認めているんだ（大連判大12.4.7）【id:24】。' },
    { type: 'dialogue', speaker: '藤野', expression: 'thinking', dialogue: 'じゃあさ、燃える前に売っちゃってたらどうなんだ？ 売った金も持っていかれるのか？' },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: '売買代金。当然対象になる。条文に「売却」とある。明らか。【id:22】' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'thinking', dialogue: 'じゃあさ、オレが職人に頼んで作らせた「ナスオ特製フィギュア」を抵当に入れて、それが売れた代金はどうなんだ？ 請負代金ってやつ？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'それは……動産売買先取特権の話に近いけど、請負代金は材料費や労力も含まれているから、単純に物の代わりとは言えないんじゃないか？' },
    { type: 'dialogue', speaker: '原先生', expression: 'impressed', dialogue: 'ユズヒコ。鋭い。請負代金。原則、物上代位できない。ただし、特段の事情があれば別。これが判例（最決平10.12.18）【id:25】。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'normal', dialogue: 'じゃあ、親戚のおじさんがアパート経営してて、入居者から家賃をもらって、それをさらに誰かに貸してる……えーと、転貸？ その家賃はどうなんだ？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '転貸料債権への物上代位だね。これは結構難しい論点だよ。' },
    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: '原則。否定。転貸人はあくまで別人。「債務者」に含まれない。ただし、例外あり。【id:23】' },
    { type: 'embed', format: 'document', title: '最決平12.4.14（転貸料債権への物上代位）', description: '転貸料債権への物上代位に関する判例', content: "[center]判　　　旨[/center]\n\n[left]　抵当権者は、抵当不動産の賃借人を所有者と同視することを相当とする場合を除き、右賃借人が取得する転貸賃料債権について物上代位権を行使することができない。[/left]" },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'つまり、賃借人を所有者と同視できるような「特段の事情」がない限り、転貸料には物上代位できないってことですね。' },
    { type: 'dialogue', speaker: '藤野', expression: 'normal', dialogue: 'なあ、さっきから「差押え」が必要って言ってるけど、なんでそんな面倒なことしなきゃいけないんだ？ 抵当権があるなら自動的に払わせりゃいいじゃん。' },
    { type: 'dialogue', speaker: '原先生', expression: 'passionate', dialogue: 'そこ重要。テスト出る。差押えの趣旨。第三債務者保護説。これ通説・判例。【id:26】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'もし差押えなしで効力が及ぶと、家賃を払う人（第三債務者）は、大家さんに払っていいのか、銀行に払うべきか分からなくなって二重払いの危険があるからね。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'smug', dialogue: 'へっへっへ。じゃあさ、オレが悪徳大家なら、銀行に差し押さえられる前に、家賃を受け取る権利を友達に売っちゃうね！ 「債権譲渡」ってやつ？ これで銀行も手出しできまい！' },
    { type: 'dialogue', speaker: '藤野', expression: 'surprised', dialogue: 'お前、悪知恵だけは働くな……。' },
    { type: 'dialogue', speaker: '原先生', expression: 'angry', dialogue: '甘い。ナスオ。その手は食わない。最高裁平成10年判決。知ってるか。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '【民法304条】の「払渡し又は引渡し」に債権譲渡は含まれない……つまり、債権譲渡されても、抵当権者は差し押さえれば優先するんじゃなかったっけ？【id:29】' },
    { type: 'dialogue', speaker: '原先生', expression: 'happy', dialogue: '正解。大正解。抵当権設定登記。これが公示されている。譲受人もそれを知るべき。だから抵当権者が勝つ。' },
    { type: 'embed', format: 'board', title: '物上代位と債権譲渡の優劣（最判平10.1.30）', description: '原先生がまとめた重要論点', content: "【問題】\n抵当権設定登記後に賃料債権が譲渡され、対抗要件が具備された場合、抵当権者の物上代位による差押えとどちらが優先するか？\n\n【結論】\n抵当権者が優先する。\n\n【理由】\n1. 差押えは第三債務者保護のためのものであり、第三者との優劣を決めるものではない。\n2. 抵当権は登記により公示されており、譲受人の利益を害しない。\n3. 債権譲渡で物上代位を免れることが容易になると不当。" },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'desperate', dialogue: 'うっそーん！ 結局、逃げ道なしかよ！' },
    { type: 'dialogue', speaker: '原先生', expression: 'cool', dialogue: '借金。返すのが筋。小細工。通用しない。勉強になったな。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'laughing', dialogue: 'ナスオ、親戚の人に「諦めてちゃんと返せ」って伝えておきなよ。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'sad', dialogue: 'トホホ……オレの豪遊計画が……。' }
  ],

   // === 4. 参考資料 ====================
   referenceMaterial: `
【抵当権に基づく物上代位の論点整理】

■ 基本事項
抵当権は、目的物の交換価値を把握する権利であるため、目的物が売却、賃貸、滅失等によって金銭その他の変形物に変わった場合、その変形物の上に効力を及ぼすことができる（民法372条、304条）。これを物上代位という。

■ 物上代位の要件
1. 物上代位の目的となる請求権（売買代金、賃料、保険金等）の発生
2. 払渡し又は引渡し前の差押え

■ 重要論点と判例
1. **保険金請求権への物上代位**（大連判大12.4.7）
   - 肯定。保険金は目的物の価値変形物と認められる。

2. **転貸料債権への物上代位**（最決平12.4.14）
   - 原則否定。賃借人（転貸人）は「債務者」に含まれない。
   - 例外肯定。抵当不動産の賃借人を所有者と同視することを相当とする特段の事情がある場合。

3. **請負代金債権への物上代位**（最決平10.12.18）
   - 動産売買先取特権に基づく事案。原則否定。
   - 請負代金には労務費等が含まれるため、当然には代位できない。特段の事情が必要。

4. **「差押え」の趣旨**（最判平10.1.30 - 第三債務者保護説）
   - 差押えは、抵当権の効力が及ぶことを第三債務者に知らしめ、二重弁済の危険から保護するための要件である（特定性維持説や優先権保全説を排斥）。

5. **物上代位と債権譲渡の優劣**（最判平10.1.30）
   - 抵当権設定登記後に債権譲渡がなされ、対抗要件が具備されても、その後の物上代位による差押えが優先する。
   - 理由：抵当権は登記により公示されており、債権譲渡による物上代位逃れを防止する必要がある。

6. **差押えの主体**（最判平10.3.26）
   - 抵当権者自身が差し押さえる必要がある（第三債務者保護の観点から、誰に弁済すべきか明確にするため）。
   - 他の債権者の差押えに配当加入することはできない。

■ 答案作成上の注意
・「払渡し又は引渡し」の意義について、債権譲渡が含まれるか否かの論証は必須。
・判例（第三債務者保護説）の立場からの論理構成を正確に書くこと。
・転貸料の論点では「所有者と同視」というキーワードを落とさないこと。
`
};
