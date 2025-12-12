export default {
  // === 1. モジュール基本情報 ============
  title: "抵当権侵害と物権的請求権",
  citation: "ナスオ、不法占拠っ！？",
  rank: "A",
  tags: ["民法", "物権", "抵当権", "不法行為"],
  category: "民法",
  subcategory: "3",

  // === 2. Q&A参照 =====================
  questionsAndAnswers: [
    "民法.3.30",
    "民法.3.31",
    "民法.3.32",
    "民法.3.33",
    "民法.3.34",
    "民法.3.35",
    "民法.3.36"
  ],

  // === 3. 事案ストーリー ================
  story: [
    { type: 'bgm', path: 'comical.mp3' },
    { type: 'background', path: 'school_classroom_sunset.jpg' },
    { type: 'scene', text: '夕暮れの南中学校、教室。ナスオが藤野とユズヒコに怪しげな計画を話している。' },

    { type: 'dialogue', speaker: 'ナスオ', expression: 'excited', dialogue: 'おいユズピ！藤野！オレ、すげービジネス思いついたぜ！名付けて「ナスオ・ランド」計画だ！', side: 'left' },
    { type: 'dialogue', speaker: '藤野', expression: 'normal', dialogue: 'またろくでもないこと考えてんだろ。どうせ。', side: 'right' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'smug', dialogue: 'ちげーよ！あの駅前の空き地あるだろ？あそこに産業廃棄物をガンガン積み上げて、業者から引き取り料をもらうんだよ！', side: 'left' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'それ、ただの不法投棄じゃん…。それにあの土地、借金のかたに{{抵当権}}が設定されてるって噂だよ。', side: 'center' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'laughing', dialogue: 'そこがミソなんだよユズピ！{{抵当権者}}の銀行は、土地を使ってねーだろ？オレが占有しても、銀行の邪魔はしてねーじゃん！', side: 'left' },

    { type: 'dialogue', speaker: '原先生', expression: 'angry', dialogue: '君たち。何をしている。', side: 'right' },
    { type: 'narration', text: 'ガラッとドアが開き、竹刀を持った原先生が入ってきた。' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'surprised', dialogue: 'げっ！ハラセン！', side: 'left' },
    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: '廊下まで聞こえていたぞ。{{抵当権侵害}}の話。君の考え。甘い。', side: 'right' },
    { type: 'dialogue', speaker: '藤野', expression: 'nervous', dialogue: 'あ、あいつが勝手に言ってるだけです！', side: 'center' },

    { type: 'bgm', path: 'serious.mp3' },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: 'いい機会だ。黒板。見る。', side: 'right' },

    {
      type: 'embed',
      format: 'board',
      title: '事例の整理',
      description: '原先生が黒板に図を描いた',
      content: '【事案】\nA所有の甲土地に、X銀行が{{被担保債権}}1億円の{{抵当権}}を設定。\nその後、Y（ナスオ）が甲土地に産業廃棄物を大量に搬入し、不法に占拠。\n甲土地の価格は5000万円まで下落した。\n\n【論点】\nX銀行はYに対して何ができるか？'
    },

    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: 'まず、那須野。君の言い分。「銀行は占有していないから文句言えない」。これは{{抵当権に基づく物権的請求権}}が認められるかという問題。', side: 'right' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'confused', dialogue: 'だ、だってよぉ、{{抵当権}}って、使う権利じゃなくて、売って金にする権利だろ？オレが使っても減るもんじゃねーし。', side: 'left' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'でもナスオ、ゴミだらけになったら土地の価値が下がるだろ？{{抵当権}}は{{交換価値}}を把握する権利だから、それが害されるなら文句言えるはずだよ【id:30】。', side: 'center' },

    {
      type: 'embed',
      format: 'board',
      title: '抵当権に基づく物権的請求権',
      description: '抵当権の性質からの帰結',
      content: '{{抵当権}}も{{物権}}である以上、{{効力}}として{{物権的請求権}}を有する。\n\n∵ {{抵当権}}は目的物の{{交換価値}}を把握する権利。\n∴ {{交換価値}}の減少が認められる限り、当然に{{妨害排除請求}}が可能。'
    },

    { type: 'dialogue', speaker: '原先生', expression: 'impressed', dialogue: 'タチバナ。正解。次に、損害賠償。那須野が価値を下げた。X銀行は金銭を請求できるか。藤野。', side: 'right' },
    { type: 'dialogue', speaker: '藤野', expression: 'thinking', dialogue: 'えっと、{{不法行為}}（【民法709条】）ですよね。価値が下がった分、損したんだから請求できるんじゃないっすか？', side: 'left' },
    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: '早計。{{抵当権}}侵害における「損害」の意義。ここが重要。', side: 'right' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '単に価値が下がっただけじゃダメなんだ。{{被担保債権}}の弁済を受けられなくなること、つまり「{{担保割れ}}」が必要なんだよ【id:31】。', side: 'center' },

    { type: 'dialogue', speaker: 'ナスオ', expression: 'smug', dialogue: 'へっ！じゃあまだ貸した金が返ってくる期限（{{弁済期}}）が来てねーなら、損したかどうかなんてわかんねーじゃん！', side: 'left' },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: '良い着眼点。{{損害の算定時期}}。いつ損害額を計算するか。これには争いがある【id:32】。', side: 'right' },

    {
      type: 'embed',
      format: 'board',
      title: '損害の算定時期',
      description: 'いつの時点で損害ありとするか',
      content: 'A {{弁済期後説}}（判例・大判昭7.5.27）\n① {{実行}}前でも、{{弁済期}}を経過すれば{{未弁済額}}が確定する。\n② {{実行時}}まで待たせると{{抵当権者}}保護に欠ける。\n\nB {{実行時説}}\n不動産価格の変動等により、{{実行時}}でなければ損害額は確定しない。'
    },

    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'それに、銀行はAさん（設定者）に対する貸金債権を持ってるから、Aさんがナスオに持ってる損害賠償請求権を差し押さえる（{{物上代位}}）こともできるよね。それとどう関係するの？', side: 'center' },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: '両者は{{競合}}する。{{物上代位}}も可能。{{抵当権に基づく損害賠償請求}}も可能。判例の立場【id:33】。', side: 'right' },

    { type: 'dialogue', speaker: 'ナスオ', expression: 'annoyed', dialogue: 'チッ、金払うのはイヤだ！じゃあオレがただ居座るだけならどうだ？ゴミは捨てねーよ。ただ住み着くだけだ。', side: 'left' },
    { type: 'dialogue', speaker: '藤野', expression: 'normal', dialogue: 'それこそ邪魔だろ…。出てけって言われるぞ。', side: 'center' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'smug', dialogue: 'でもよぉ、{{抵当権}}は「使用する権利」じゃねーんだろ？銀行が出てけって言う権利（{{占有権原}}）なんかねーはずだ！', side: 'left' },
    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: 'そこが最大の論点。{{不法占拠者}}に対する{{明渡請求}}。判例。これを見ろ。', side: 'right' },

    {
      type: 'embed',
      format: 'document',
      title: '最大判平11.11.24（要旨）',
      description: '不法占拠者に対する抵当権に基づく妨害排除請求',
      content: '{{抵当不動産}}の{{交換価値}}の実現が妨げられ、{{抵当権者}}の{{優先弁済請求権}}の行使が困難となるような状態があるときは、{{抵当権}}に基づく{{妨害排除請求}}として、その{{占有}}の排除を求めることができる。\n\n理由：\n{{抵当権}}が{{非占有権}}であることは、{{抵当権者}}が設定者の{{使用収益権能}}を妨げ得ないことを意味するにすぎず、{{不法占拠者}}による{{占有態様}}による{{担保価値の低下}}までを{{受忍すべき}}ことを意味しない。'
    },

    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'なるほど。{{競売妨害}}を目的としてるような場合は、{{交換価値}}の実現が妨げられるから、追い出せるってことか【id:34】。', side: 'center' },
    { type: 'dialogue', speaker: '原先生', expression: 'normal', dialogue: 'さらに。もし那須野がAから土地を借りていた場合。{{賃借人}}ならどうだ。', side: 'right' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'excited', dialogue: 'そうそう！Aから安く借りて、占有屋として居座る作戦もあるぜ！借りてるんだから文句ねーだろ！', side: 'left' },
    { type: 'dialogue', speaker: '原先生', expression: 'angry', dialogue: '悪知恵だけは働く。それも判例が封じている。平成17年判決。', side: 'right' },

    {
      type: 'embed',
      format: 'document',
      title: '最判平17.3.10（要旨）',
      description: '第三者が占有権原を有する場合の明渡請求',
      content: '{{抵当不動産}}の{{占有者}}が、{{抵当権設定登記後}}に{{賃借権}}等の{{占有権原}}を取得したと主張する場合でも、その{{占有権原}}の設定に{{抵当権}}の実行を妨害する目的（{{競売妨害目的}}）が認められ、その{{占有}}により{{抵当不動産}}の{{交換価値}}の実現が妨げられ{{抵当権者}}の{{優先弁済請求権}}の行使が困難となるような状態があるときは、{{抵当権}}に基づく{{妨害排除請求}}が認められる。'
    },

    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '本来は【民法395条】で保護されるはずの賃借人でも、妨害目的があれば追い出せるんだね。要件が厳格になってるけど【id:35】。', side: 'center' },
    { type: 'dialogue', speaker: '藤野', expression: 'confused', dialogue: 'でも先生、追い出すとして、誰に明け渡すんですか？銀行は住まないですよね？A（所有者）に戻しても、またナスオが戻ってくるかも…。', side: 'right' },
    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: '鋭い。通常は所有者Aへ明け渡せと請求する。しかし、Aがナスオとグルだったり、管理を放棄している場合。{{直接自己への明渡請求}}。これが認められるか。', side: 'right' },

    { type: 'dialogue', speaker: 'ナスオ', expression: 'surprised', dialogue: 'えっ？銀行が直接取り上げるのかよ！？', side: 'left' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '所有者が適切に維持管理できないような「例外的な場合」には、直接自分のところに明け渡せって言えるんじゃなかったっけ？', side: 'center' },
    { type: 'dialogue', speaker: '原先生', expression: 'impressed', dialogue: 'その通り。{{直接自己への明渡請求}}も、判例は一定の要件下で肯定している【id:36】。', side: 'right' },

    {
      type: 'embed',
      format: 'board',
      title: '直接自己への明渡請求の要件',
      description: '判例（平11、平17）の結論',
      content: '{{抵当権者}}において{{抵当不動産}}を適切に維持・管理することが期待できない場合には、{{直接自己への明渡請求}}も認められる。\n\n→ その後、{{抵当権者}}が管理しつつ、{{競売手続}}を進めることになる。'
    },

    { type: 'dialogue', speaker: '原先生', expression: 'serious', dialogue: '結論。那須野の計画。{{法}}により完全に粉砕される。さらに{{競売入札妨害罪}}（【刑法96条の3】）の可能性もある。覚悟しておけ。', side: 'right' },
    { type: 'dialogue', speaker: 'ナスオ', expression: 'desperate', dialogue: 'うげげっ！警察は勘弁してくれよ〜！オレはただ、ビッグになりたかっただけなんだぁ〜！', side: 'left' },
    { type: 'dialogue', speaker: '藤野', expression: 'laughing', dialogue: 'ビッグになる前にブタ箱行きだな、こりゃ。', side: 'center' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'happy', dialogue: 'ま、法律の勉強になってよかったじゃん、ナスオ。', side: 'right' },
    { type: 'scene', text: '夕日が差し込む教室で、原先生に説教されるナスオの声が響くのであった。' },
  ],
  studyRecords: [
    {
      date: "2025-12-07",
      timestamp: "2025-12-07T14:31:29.420Z"
    }
  ],

  // === 4. 参考資料（AI添削用） ===========
  referenceMaterial: `
【抵当権に基づく物権的請求権の論点整理】

■ 基本事項
抵当権は非占有担保物権であり、抵当権者は目的物を占有しない。そのため、占有を伴う妨害排除請求権・返還請求権が認められるかが問題となる。

■ 判例の流れ
1. 最大判平11.11.24
  - 抵当権設定登記後に占有権原を取得した者に対し、抵当権に基づく妨害排除請求として占有排除を求めることができる
  - 要件：①交換価値の実現が妨げられる ②優先弁済請求権の行使が困難となる状態
  - 理由：交換価値の減少だけでなく、弁済を受けられなくなることが必要

2. 最判平17.3.10
  - 占有権原の設定に競売妨害目的があり、占有により交換価値の実現が妨げられ、優先弁済請求権の行使が困難となる場合は妨害排除請求が認められる
  - 直接自己への明渡請求：所有者が適切に維持管理できない例外的場合に認められる

■ 論証のポイント
・「交換価値の減少」と「弁済を受けられなくなること」は別概念として区別
・抵当権に基づく請求と所有権に基づく請求の違いを意識
・直接自己への明渡しは「例外的」であることを強調

■ 関連条文
民法369条（抵当権の意義）、民法395条（抵当建物使用者の引渡猶予）
`
};
