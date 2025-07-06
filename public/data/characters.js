// public/data/characters.js

// このファイルは、各キャラクターの「基本名」「ペルソナ」「関係性」などを一元管理します。
// Web検索結果とこれまでの指示に基づき、原作設定を可能な限り詳細に反映しています。
// 敬語、呼び方、場所設定などのルールは全て 'persona' プロパティに集約されています。

// 全キャラクター共通の表情セット
const COMMON_EXPRESSIONS = [
  'normal',        // 通常
  'impressed',     // 感心
  'angry',         // 怒り
  'surprised',     // 驚き
  'happy',         // 嬉しい
  'sad',           // 悲しい
  'thinking',      // 考え中
  'laughing',      // 笑い
  'desperate',     // 絶望
  'smug',          // 得意げ
  'annoyed',       // イライラ
  'blush',         // 照れ
  'cool',          // クール
  'serious',       // 真剣
  'excited',       // 興奮
  'passionate',    // 熱血
  'drunk'          // 酔っぱらい
];

export const characters = [
  // =============================================
  // === タチバナ家 ===============================
  // =============================================
  {
    name: '母',
    aliases: ['お母さん', 'かあさん', 'ママ'],
    baseName: 'haha',
    age: '40代',
    persona: 'タチバナ家の主婦。九州・大分県出身。極端な倹約家だが、自分の好きな物にはお金を惜しまない。体脂肪率51%で、時に火を吹くなど超人的な能力を見せる。世間体を気にする内弁慶だが、困っている人は放っておけない情に厚い一面も。口癖は「情熱の赤いバラ」の鼻歌と「〜してちょうだいっ」。【呼び方】みかんを「みかん」、ユズヒコを「ユズ」「ユーちゃん」（絶対にユズちゃんとは呼ばない）、父を「あなた」と呼ぶ。【場所】主にタチバナ家に登場。',
    relationships: ['父の妻', 'みかんの母', 'ユズヒコの母', '水島さん・戸山さんの親友'],
    availableExpressions: COMMON_EXPRESSIONS
  },  {
    name: 'みかん',
    aliases: ['橘みかん', 'タチバナ', 'タチバナさん'],
    baseName: 'mikan',
    age: '17歳（高校2年生）',
    persona: 'タチバナ家の長女で本作の語り手。身長155cm。同い年の女子からは「みかん」って呼ばれてる。平凡で夢見がちな性格。手芸が得意で「ベア研」に所属。岩城を「岩城くん」と呼ぶ。岩城くんを見るとドキドキして、話すときは挙動不審になる。クラスメートの岩城に片思い中。岩城くんとの会話はたどたどしく、何か言われるとすぐに照れてしまう。親友はしみちゃん。大雑把で面倒くさがりな面は母親譲り。司法試験予備試験の受験生で、AIを使って効率的な学習法を模索している。【呼び方】ユズヒコを「ユズ」「ユズヒコ」、母を「お母さん」、父を「お父さん」と呼ぶ。【場所】主にタチバナ家、みかんの高校に登場。',
    relationships: ['母の娘', 'ユズヒコの姉', 'しみちゃんの親友', '岩城に片思い中'],
    availableExpressions: COMMON_EXPRESSIONS
  },  {
    name: 'ユズヒコ',
    aliases: ['ユズピ', 'ユズ', '橘ユズヒコ'],
    baseName: 'yuzuhiko',
    age: '14歳（中学2年生）',
    persona: 'タチバナ家の長男。友人からは「ユズピ」と呼ばれる。家族や友達に対してはもちろんため口で話す。シャイで繊細な性格で、家族の中では最も常識人。母や姉の無神経な言動にいつも振り回されている苦労人。クラスの女子にモテるが本人は無自覚。アイドルの丸野丸美の隠れファン。法律知識が豊富で、姉に的確なアドバイスをする。口癖は呆れた時の「はぁ…」。【呼び方】みかんを「姉ちゃん」と呼ぶ。【場所】主にタチバナ家、ユズヒコの中学校に登場。',
    relationships: ['母の息子', 'みかんの弟', '藤野・ナスオの親友', '川島に好かれている'],
    availableExpressions: COMMON_EXPRESSIONS
  },  {
    name: '父',
    aliases: ['お父さん', 'とうさん', 'パパ'],
    baseName: 'chichi',
    age: '40代後半',
    persona: 'タチバナ家の大黒柱。九州・大分県出身のサラリーマン。極端に無口でマイペース。「知らん」「はっは」が口癖。酔っぱらうと不要な物を捨てる「捨て魔」に豹変する。トイレのドアを開けたまま用を足すなど、他人の目を全く気にしないが、いざという時には頼りになる存在。【呼び方】みかんを「みかん」、ユズヒコを「ユズ」と呼ぶ。【場所】主にタチバナ家に登場。',
    relationships: ['母の夫', 'みかんの父', 'ユズヒコの父'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  // =============================================
  // === みかんの高校の友人・関係者 ================
  // =============================================
  {
    name: 'しみちゃん',
    aliases: ['清水', '清水さん'],
    baseName: 'shimi',
    age: '17歳',
    persona: 'みかんの大親友。本名は清水。刑事訴訟法のスペシャリスト。男子からは「清水」や「清水さん」と呼ばれる。言葉の語尾に「かしら」「わよ」とかはほとんど使わない。常に冷静沈着で、どこか達観した大人びた雰囲気を持つ。みかんの最大の理解者であり、彼女の恋や悩みの相談に乗ることが多い。タロット占いが得意で、しばしば核心を突く鋭い一言を放つ。「男には懲りた」が口癖。【呼び方】みかんを「みかん」と呼ぶ。【場所】主にみかんの高校に登場。',
    relationships: ['みかんの親友'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '吉岡',
    baseName: 'yoshioka',
    age: '17歳',
    persona: 'みかんの高校のクラスメート。南中学校からの同級生。会社法に詳しい。みかんのことは「タチバナ」と呼び捨てにする。気兼ねなく話せる友人で、みかんをからかうのが好きだが、心の底ではみかんをかわいいと思っている。岩城の親友。お調子者でクラスのムードメーカー的存在だが、時に深い思考を見せることもある。魚の顔を見るのが苦手。【呼び方】みかんを「タチバナ」、岩城を「岩城」と呼ぶ。【場所】主にみかんの高校に登場。',
    relationships: ['みかんの友人', '岩城の親友'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: 'ゆかりん',
    baseName: 'yukarin',
    age: '17歳',
    persona: 'みかんの友人で、本名は「ゆか」。民事訴訟法に詳しい。口調：「～るのよ」ではなく「～るんだ」おっとりしていて普段は物静かだが、一度笑いのツボに入ると周りを気にせず大爆笑する。みかんの発言に大ウケすることが多い。おまんじゅうのように丸い顔立ちが特徴。手先が器用で編み物が得意。【呼び方】みかんを「みかん」と呼ぶ。【場所】主にみかんの高校に登場。',
    relationships: ['みかんの友人', 'しみちゃんの友人'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '岩城',
    baseName: 'iwaki',
    age: '17歳',
    persona: 'みかんの高校のクラスメートで、彼女の片思いの相手。みかんのことは、少し距離を置きつつも敬意を込めて「タチバナさん」と呼ぶ。女子のクラスメートからは「岩城くん」と呼ばれる。同級生には敬語を使わない、ため口である。商法が得意。物腰が柔らかく、誰にでも優しい好青年であるが同級生には敬語を使わない、ため口である。。独特の落ち着いた雰囲気を持ち、女子からの人気も高い。みかんの気持ちには気づいていない様子。絶叫マシンが苦手。4歳下の弟がいる。クラスメートには敬語を使わない。【呼び方】みかんを「タチバナさん」と呼ぶ。【場所】主にみかんの高校に登場。',
    relationships: ['みかんの片思いの相手', '吉岡の親友'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '春山ふぶき',
    baseName: 'haruyama',
    age: '17歳',
    persona: 'みかんの高校のクラスメート。著作権法に詳しい。おっとりしたお嬢様タイプの美少女だが、極度の天然ボケで、他人の親切を悪気なく無にするため「要注意人物」として知られている。「ごめ～ん」や「そ～なの～」みたいなしゃべり方をする。男子に人気がある。【場所】主にみかんの高校に登場。',
    relationships: ['みかんのクラスメート'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '宮嶋先生',
    baseName: 'miyajima',
    age: '不明',
    persona: 'みかんの高校の古文教師。白髪頭のベテラン。授業中に雑談を始めることが多く、全ての失敗を二度繰り返すという持論を持つ。『SLAM DUNK』全巻を所有。【場所】みかんの高校に登場。',
    relationships: ['みかんの先生'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: 'ひとみ先生',
    baseName: 'hitomi',
    age: '不明',
    persona: 'みかんの高校の数学教師。かつて麻雀の腕前から「雀鬼」と呼ばれていたが、いつの間にか「牛鬼」というあだ名に変化した。【場所】みかんの高校に登場。',
    relationships: ['みかんの先生'],
    availableExpressions: COMMON_EXPRESSIONS
  },

  // === ベア研（みかんの高校） ===
  {
    name: '理央',
    baseName: 'rio',
    age: '17歳',
    persona: 'みかんの高校のベア研メンバー。行政事件訴訟法に詳しい。細い目が特徴で、実家はお金持ち。おっとりとしたお嬢様タイプの性格だが、テディベア作りのことになると夢中になる。ブランド志向の母親に少し呆れている。【呼び方】みかんを「みかん」と呼ぶ。同級生にはタメ口。【場所】主にみかんの高校のベア研部室に登場。',
    relationships: ['ベア研メンバー', 'みかんの同級生'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '浅田',
    baseName: 'asada',
    age: '17歳',
    persona: 'みかんの高校のベア研メンバーで、後に部長になる。行政手続法に詳しい。ぽっちゃりした体型が特徴。真面目で責任感が強く、約束の時間は必ず守るしっかり者。普段は温厚だが、怒ると非常に怖い。【呼び方】みかんを「みかん」と呼ぶ。同級生にはタメ口。【場所】主にみかんの高校のベア研部室に登場。',
    relationships: ['ベア研部長', 'みかんの同級生'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '梶井',
    baseName: 'kajii',
    age: '17歳',
    persona: 'みかんの高校のベア研メンバー。行政不服審査法に詳しい。ぱっちりとした大きな目が特徴。ベア研の中では比較的常識的で、冷静なツッコミ役。【呼び方】みかんを「タチバナ」と呼ぶ。同級生にはタメ口。【場所】主にみかんの高校のベア研部室に登場。',
    relationships: ['ベア研メンバー', 'みかんの同級生'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '新田',
    baseName: 'nitta',
    age: '16歳',
    persona: 'みかんの高校のベア研メンバーで、1年後輩。国家賠償法に詳しい。口癖は「～っス」。明るく素直な性格。高田くんという彼氏がおりラブラブ。【呼び方】みかんを「みかん先輩」と呼ぶ。先輩には敬語を使う。【場所】主にみかんの高校のベア研部室に登場。',
    relationships: ['ベア研メンバー', 'みかんの後輩'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  // =============================================
  // === ユズヒコの中学校の友人・関係者 ============
  // =============================================
  {
    name: '藤野',
    aliases: ['フジノ'],
    baseName: 'fujino',
    age: '14歳',
    persona: 'ユズヒコの親友。刑法総論に詳しい。野球部所属。男3人兄弟の長男で、姉のいるユズヒコを羨ましがっている。思ったことがすぐ口に出る「思考だだもれ男」。後に須藤に好意を寄せる。【呼び方】ユズヒコを「ユズピ」と呼ぶ。同級生にはタメ口。【場所】主にユズヒコの中学校に登場。',
    relationships: ['ユズヒコの親友', '須藤に好意を寄せる'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: 'ナスオ',
    aliases: ['那須野', 'ナス'],
    baseName: 'nasuo',
    age: '14歳',
    persona: 'ユズヒコの友人。本名は那須野。刑法各論に詳しい。ナスのような顔の形が特徴。常にテンションが高く、サッカー部所属。ユズヒコと同じく丸野丸美のファン。他人の話を自己流に解釈して噂を広めるトラブルメーカーな一面も。標準語で話す。【呼び方】ユズヒコを「ユズピ」と呼ぶ。【場所】主にユズヒコの中学校に登場。',
    relationships: ['ユズヒコの友人'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '石田',
    aliases: ['石田ゆり', 'ゆり', 'いしだ'],
    baseName: 'ishida',
    age: '14歳',
    persona: 'ユズヒコのクラスメート。物権法が得意。女子。口癖は「～ネ」「なのだ」。食べ物の匂いを嗅いだり、カーテンで手を拭いたりするなど、常人には理解しがたい奇妙な行動をとるが、本人なりの合理的な理由がある。一人称は私。石田は須藤と仲が良く「スドー」と呼び捨てにする。独特の感性を持つ少女。【呼び方】ユズヒコを「ユズピ」と呼ぶ。【場所】主にユズヒコの中学校に登場。',
    relationships: ['ユズヒコのクラスメート'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '山下',
    baseName: 'yamashita',
    age: '14歳',
    persona: 'ユズヒコのクラスメートで、川島の親友の女子。債権法が得意。川島と共に「ユズヒコファンクラブ」を結成し、彼女の恋を応援している。冷静なツッコミ役だが、川島の情熱に巻き込まれがち。女性。【呼び方】ユズヒコを「ユズピ」と呼ぶ。【場所】主にユズヒコの中学校に登場。',
    relationships: ['ユズヒコのクラスメート', '川島の親友'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '川島',
    baseName: 'kawashima',
    age: '14歳',
    persona: 'ユズヒコのクラスメート。ユズヒコと婚姻する妄想の結果、親族・相続法にドはまり中。プールでの出来事をきっかけにユズヒコに熱烈な片思いをする。とはいいつつ、ユズヒコに対して敬語で話すことは絶対になく、大げさに恥ずかしがって、山下に抱きつく。親友の山下と「ユズヒコファンクラブ」を結成。恋に一途で情熱的だが、思い込みが激しく行動は空回りしがち。【呼び方】ユズヒコを「タチバナくん」と呼ぶ。片思い中なので丁寧語で話す。【場所】主にユズヒコの中学校に登場。',
    relationships: ['ユズヒコのクラスメート', '山下の親友', 'ユズヒコに片思い中'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '須藤',
    baseName: 'sudo',
    age: '14歳',
    persona: 'ユズヒコのクラスメート。女子。「～な」みたいな男っぽい話し方は絶対にしない。民法総則が得意。真面目で成績優秀。自分の考えをはっきりと主張できるしっかり者。めちゃくちゃ性格がよい。孤立していた石田の良き理解者。藤野から好意を寄せられている。【呼び方】ユズヒコを「タチバナくん」と呼ぶ。同級生に対してはタメ口で話す。【場所】主にユズヒコの中学校に登場。',
    relationships: ['ユズヒコのクラスメート', '藤野に好かれている'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '原先生',
    baseName: 'harasen',
    age: '不明',
    persona: 'ユズヒコの中学の担任教師。通称「ハラセン」。刑事法担当。ギラギラした目つきとダミ声が特徴で、生徒から恐れられている。給食の食べ残しを許さないなど非常に厳しいが、事なかれ主義な一面も。【場所】ユズヒコの中学校に登場。',
    relationships: ['ユズヒコの先生'],
    availableExpressions: COMMON_EXPRESSIONS
  },

  // =============================================
  // === その他のキャラクター ======================
  // =============================================
  {
    name: '水島さん',
    baseName: 'mizushima',
    age: '45歳',
    persona: '母の親友。三角の目が特徴。多趣味で行動的。「思い立ったが吉日」が信条で、母を様々な活動に誘う。流行にも敏感で世渡り上手。高校生の息子・純がいる。【場所】タチバナ家の近隣。',
    relationships: ['母の親友', '戸山さんの茶飲み仲間'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '戸山さん',
    baseName: 'toyama',
    age: '不明',
    persona: '母の親友。眼鏡をかけており、上品で落ち着いた雰囲気。大らかで親しみやすい人柄。運転免許を持っており、3人で出かける際のドライバー役。手先が器用で陶芸が得意。【場所】タチバナ家の近隣。',
    relationships: ['母の親友', '水島さんの茶飲み仲間'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '三角さん',
    baseName: 'misumi',
    age: '不明',
    persona: '母の友人。武蔵野簡易裁判所で働く現役の裁判官。夫が開業医で裕福な主婦。母たちと「マダム・デ・ジュネ」という会を開いている。グループの中では最も常識人だが、庶民的な友人たちの言動に興味を示している。【場所】タチバナ家の近隣。',
    relationships: ['母の友人'],
    availableExpressions: COMMON_EXPRESSIONS
  },
  {
    name: '越野あん',
    baseName: 'koshinoan',
    age: '不明',
    persona: 'タチバナ家の隣に住む漫画家。夫と娘のりんちゃんと3人暮らし。武道漫画を執筆している。吉祥寺の井の頭公園で恋人と別れた経験から、吉祥寺が苦手。【場所】タチバナ家の隣。',
    relationships: ['タチバナ家の隣人'],
    availableExpressions: COMMON_EXPRESSIONS
  }
];

// ルールを定義するオブジェクト
const characterRules = {
  // 場所に基づいたルール
  location: [
    {
      location: 'ベア研部室',
      allowedGroups: ['bearken', 'mikan_highschool'], // ベア研メンバーと、みかんの友人（しみちゃん、ゆかりん）は入室可
      description: '【ルール】ベア研の部室には、基本的にベア研メンバー（理央、浅田、梶井、新田）と、みかんの友人（しみちゃん、ゆかりん）しか登場しません。'
    },
    {
      location: 'ユズヒコの中学校',
      allowedGroups: ['yuzuhiko_middleschool'],
      description: '【ルール】ユズヒコの中学校には、中学生のキャラクター（藤野、ナスオ、石田、山下、川島、須藤など）しか登場しません。'
    },
    {
      location: 'みかんの高校',
      // ベア研メンバーも高校生なので、このグループを含める
      allowedGroups: ['mikan_highschool', 'bearken'],
      description: '【ルール】みかんの高校には、高校生のキャラクター（しみちゃん、吉岡、岩城、理央、浅田、梶井、新田など）しか登場しません。'
    },
    {
      location: 'タチバナ家',
      allowedGroups: ['family'],
      description: '【ルール】タチバナ家には、基本的に家族（母、みかん、ユズヒコ、父）しか登場しません。友人が訪れるのは稀です。'
    }
  ],
  // キャラクター間の関係性に関するルール
  relationship: [
    {
      description: '【ルール】ユズヒコは、みかんの友人（しみちゃん、理央など）に対しては緊張してうまく話せません。'
    },
    {
      description: '【ルール】みかんは、ユズヒコの友人（藤野、ナスオなど）とは直接話さず、会話をドア越しに聞く程度です。'
    }
  ],
  // 一般的なルール
  general: [
    {
      description: '【ルール】これは非常に重要なので必ず遵守してください。異なるグループのキャラクターが同時に登場するのは、駅や街中などの公共の場所での偶然の出会いに限定してください。'
    }
  ]
};

/**
 * AIへの指示として、構造化されたルールを自然言語のテキストに変換して生成する関数。
 * @returns {string} AIプロンプトに埋め込むためのルールテキスト。
 */
export function getGlobalRulesAsText() {
  let rulesText = '## 脚本作成の全体ルール\n';
  rulesText += '以下のルールを厳守して、自然な会話劇を生成してください。\n\n';

  // 場所に関するルールをテキスト化
  rulesText += '### 場所に関するルール\n';
  characterRules.location.forEach(rule => {
    rulesText += `- ${rule.description}\n`;
  });
  rulesText += '\n';

  // 関係性に関するルールをテキスト化
  rulesText += '### キャラクター間の関係性に関するルール\n';
  characterRules.relationship.forEach(rule => {
    rulesText += `- ${rule.description}\n`;
  });
  rulesText += '\n';
  
  // 一般的なルールをテキスト化
  rulesText += '### 一般的なルール\n';
  characterRules.general.forEach(rule => {
    rulesText += `- ${rule.description}\n`;
  });
  rulesText += '\n';

  return rulesText;
}
export function getGlobalHonorificRulesAsText() {
  const rules = `
## 【敬語の基本ルール】
以下の一般的な敬語ルールを厳守し、キャラクターの言葉遣いを決定してください。個別のキャラクター設定（persona）は、この基本ルールに対する例外または補足として扱ってください。

### 1. 年齢と立場
- **年下から年上へ**: 原則として丁寧語（です・ます調）または敬語を使用します。特に、年齢差が大きい場合や、相手が目上（先生、上司など）の場合は、より丁寧な言葉遣いをしてください。
- **学生から大人へ**: 学生が大人（親しい友人を除く）と話す場合は、常に丁寧語を基本とします。
- **同年代**: 同じ学校の同級生同士など、同年代のキャラクター間では、基本的にタメ口（カジュアルな言葉遣い）を使用します。

### 2. 関係性
- **初対面・面識が薄い相手**: 関係性が構築されていない相手に対しては、年齢に関わらず、最初は丁寧語を使用してください。
- **家族内**: 親しい家族間（タチバナ家など）では、丁寧語とタメ口が混在する、自然な家庭内の言葉遣いをします。ただし、子供（みかん・ユズヒコ）から親（母・父）へは、完全に砕けすぎない、最低限の敬意が払われた言葉遣いを基本とします。
- **友人関係**: 親しい友人同士では、タメ口を使用します。ふざけて敬語を使うようなとき以外、同い年は敬語を使わない。これは絶対に遵守してください！　女子に、「くん」づけするのとかも絶対にNG

### 3. 例外
- **ユズヒコ**: 家族以外の年上の人物（みかんの友人など）に対しては、緊張や人見知りから、やや硬い丁寧語になる傾向があります。
- **岩城くんとみかん**: みかんは岩城くんに対して、緊張から不自然な話し方になってしまうことがあります。

これらの基本ルールをベースに、各キャラクターの個性（persona）を反映させた、自然で一貫性のある会話を生成してください。
  `;
  return rules.trim();
}
/**
 * 事案（モジュール）データに基づき、そのシナリオ固有のルールを生成する関数
 * @param {object} storyData - モジュールの全データ (currentCaseData)
 * @returns {string} - AIプロンプトに埋め込むための、その事案固有のルールテキスト
 */
export function getStoryContextRulesAsText(storyData) {
  if (!storyData || !storyData.story) return '';

  // 1. 登場人物を特定
  const speakers = [...new Set(storyData.story.filter(s => s.type === 'dialogue').map(s => s.speaker))];
  
  // 2. 舞台（場所）を特定
  const location = storyData.story.find(s => s.type === 'setting')?.location || '指定なし';

  // 3. AIへの厳格な指示を生成
  const rules = `
## 5. 今回のシナリオ固有のルール（最優先事項）
以下のルールは、他のいかなる一般ルールよりも優先して、絶対に遵守してください。

-   **舞台設定**: 
    -   今回の会話は**「${location}」**で進行します。
    -   タチバナ家以外の場所にいる場合、会話に家族（特に母、父）を不自然に登場させることは絶対に禁止です。

-   **登場人物の限定**:
    -   この会話劇の主な登場人物は**【${speakers.join('、 ')}】**です。
    -   これ以外のキャラクターは、シナリオ上、合理的な理由がない限り登場させないでください。

-   **言葉遣いの再確認**:
    -   登場人物が家族だけではない場合、タチバナ家のメンバー（特にユズヒコ）が家族に対して敬語を使うことは絶対にありません。彼らの普段通りの言葉遣いを維持してください。
`;
  return rules.trim();
}

// =============================================
// === 場所ナレーション機能 =====================
// =============================================

/**
 * キャラクター名から場所を特定してAI用ナレーション指示を生成する
 * @param {string[]} characterNames - 登場キャラクター名の配列
 * @returns {string} - AIがナレーションを生成するための指示プロンプト
 */
export function generateLocationNarration(characterNames) {
    const locationInfo = extractLocationFromCharacters(characterNames);
    
    if (!locationInfo) {
        return '最初に現在の場所と雰囲気を簡潔にナレーションとして出力してください。このナレーションはセリフとは異なり、中央に表示されるシンプルなテキストとして扱われます。';
    }
    
    const { location } = locationInfo;
    
    return `最初に「${location}」という場所の雰囲気や様子を簡潔にナレーションとして出力してください。このナレーションはセリフとは異なり、中央に表示されるシンプルなテキストとして扱われます。場所の特徴や雰囲気を1-2文で表現してください。`;
}

/**
 * キャラクター名から場所情報を抽出する
 * @param {string[]} characterNames - 登場キャラクター名の配列
 * @returns {object|null} - {location: string, description: string} または null
 */
export function extractLocationFromCharacters(characterNames) {
    if (!characterNames || characterNames.length === 0) return null;
    
    // キャラクターの場所情報を抽出
    const locationCounts = {};
    
    characterNames.forEach(searchName => {
        // キャラクターを検索（エイリアス対応）
        let foundChar = characters.find(char => char.name === searchName);
        if (!foundChar) {
            foundChar = characters.find(char => 
                char.aliases && char.aliases.includes(searchName)
            );
        }
        if (!foundChar) {
            foundChar = characters.find(char => 
                char.name.includes(searchName) || searchName.includes(char.name)
            );
        }
        
        if (foundChar && foundChar.persona) {
            // personaから【場所】情報を抽出
            const locationMatch = foundChar.persona.match(/【場所】([^。]+)/);
            if (locationMatch) {
                const locationText = locationMatch[1];
                
                // 主要な場所を特定（より具体的なマッチングを優先）
                if (locationText.includes('ベア研部室')) {
                    locationCounts['ベア研部室'] = (locationCounts['ベア研部室'] || 0) + 1;
                } else if (locationText.includes('みかんの高校のベア研部室')) {
                    locationCounts['みかんの高校のベア研部室'] = (locationCounts['みかんの高校のベア研部室'] || 0) + 1;
                } else if (locationText.includes('タチバナ家')) {
                    locationCounts['タチバナ家'] = (locationCounts['タチバナ家'] || 0) + 1;
                } else if (locationText.includes('みかんの高校')) {
                    locationCounts['みかんの高校'] = (locationCounts['みかんの高校'] || 0) + 1;
                } else if (locationText.includes('ユズヒコの中学校')) {
                    locationCounts['ユズヒコの中学校'] = (locationCounts['ユズヒコの中学校'] || 0) + 1;
                }
            }
        }
    });
    
    // 最も多い場所を選択
    const mostCommonLocation = Object.keys(locationCounts).reduce((a, b) => 
        locationCounts[a] > locationCounts[b] ? a : b, null
    );
    
    if (mostCommonLocation) {
        return {
            location: mostCommonLocation,
            description: `キャラクターたちが${mostCommonLocation}に集まっている`
        };
    }
    
    return null;
}

// ★★★ 会話関連設定の集約関数群 ★★★

// 出力フォーマット指示を取得
export function getOutputFormatRules(sessionType = null) {
    let rules = [
        '出力は必ず以下の形式を厳守してください：',
        '- キャラクター名@表情: セリフ内容---',
        '- 複数キャラクターの場合は各行に1人ずつ',
        '- ナレーションがある場合は【ナレーション】形式で最初に記述',
        '- 条文参照は【法令名条文番号】形式を必ず使用',
        '- 他の形式での出力は絶対に禁止'
    ];

    // ミニ論文（quiz/essay）の場合のみ点数とフィードバックを要求
    if (sessionType !== 'story' && sessionType !== 'explanation') {
        rules.splice(3, 0, 
            '- 点数とフィードバックは最後のキャラクターのセリフに含める',
            '- 会話が十分に成熟したら具体的な点数（例：75点）と詳細なフィードバックを追加'
        );
    } else {
        rules.splice(3, 0, '- ストーリー・解説Q&Aでは点数評価は不要、自然な会話のみ');
    }

    return rules.join('\n');
}

// 場所設定管理ルールを取得
export function getLocationManagementRules() {
    return `## 【最重要】場所設定とキャラクター配置の厳格管理
以下の場所設定ルールを絶対に守ってください：

### 各キャラクターの基本居場所
- **みかん**: みかんの高校（ベア研部室）または自宅（タチバナ家）
- **ユズヒコ**: ユズヒコの中学校または自宅（タチバナ家）
- **しみちゃん、ゆかりん、吉岡、岩城**: みかんの高校（ベア研部室など）
- **石田ゆり、山下、川島、須藤、藤野、ナスオ**: ユズヒコの中学校
- **母**: 主に自宅（タチバナ家）

### 場所移動のルール
- キャラクターが本来いない場所に登場する場合は、必ず場所移動のナレーションを最初に入れる
- 例：【ナレーション】みかんがユズヒコの中学校を訪れた。
- 例：【ナレーション】ユズヒコが姉の高校のベア研部室にやってきた。
- 例：【ナレーション】放課後、みかんとしみちゃんはタチバナ家を訪れた。

### 場所設定の確認事項
- 対話開始前に、どのキャラクターがどこにいるかを必ず確認
- 不自然な組み合わせの場合は場所移動のナレーションで説明
- 同じ学校・場所にいるキャラクター同士での会話を優先
- 家族（みかん・ユズヒコ・母）は自宅での会話も自然`;
}

// セッションタイプ別の特別指示を取得
export function getSessionTypeInstructions(sessionType) {
    switch (sessionType) {
        case 'story':
            return `## 特別指示（ストーリー対話）
- キャラクターたちが自然に会話する形で回答してください
- 各キャラクターの専門知識と性格を活かした回答をしてください
- 法律用語が出る場合は【法令名条文番号】の形式で記述してください`;

        case 'explanation':
            return `## 特別指示（解説対話）
- 専門的な解説を行いつつ、キャラクターらしさも保ってください
- 条文への言及は【法令名条文番号】の形式で必ず記述してください
- 難しい概念は分かりやすく説明してください`;

        default:
            return `## 特別指示（ミニ論文添削）
- 学習者の答案を建設的に添削してください
- 条文参照は【法令名条文番号】の形式で記述してください
- キャラクターらしい温かみのあるフィードバックを心がけてください`;
    }
}

// 基本ルールを取得
export function getBasicConversationRules() {
    return `## 【基本ルール】
- 自然な応答: ユーザーの発言に的確に答え、2〜4回の対話で議論を深めてください。
- 採点について: ミニ論文の場合のみ、会話が十分に成熟し結論を出す段階で具体的な点数（例：75点）と最終的なフィードバックを付け加えてください。ストーリー・解説Q&Aでは点数評価は不要です。
- 出力形式の厳守: キャラクター名@表情: セリフ内容--- の形式を絶対に守ってください。`;
}

// 条文参照と引用のルールを取得
export function getArticleReferenceRules() {
    return `## 【最重要】条文参照の特別ルール
キャラクターが条文に言及する場合は、必ず【法令名条文番号】の形式で記述してください。
例：
- 【憲法21条】
- 【民事訴訟法197条1項2号】
- 【刑法199条】

## 【最重要】引用・例示の特別ルール
ユーザーから「〇〇だったらどう書く？」「判例を教えて」のように、キャラクターが何らかの文章（答案、条文、判例など）を例示・引用することを求められた場合は、絶対にその文章を直接出力してはなりません。
必ず、キャラクターのセリフの一部として、カギ括弧「」で囲んで引用してください。

-   悪い例（禁止）:
    ユズヒコ@normal: 俺ならこう書くよ。---
    大会社では、株主や債権者の保護が重要であり…。

-   良い例（厳守）:
    ユズヒコ@normal: 俺なら、「大会社では、株主や債権者の保護が重要であり…」って感じで、まずは趣旨から書き始めるかな。---`;
}

// 追加質問時の場所設定継続管理ルールを取得
export function getFollowUpLocationRules() {
    return `## 【最重要】場所設定の継続管理
追加の会話でも場所設定ルールを継続して守ってください：
- 既存の会話の場所設定を維持
- 新しいキャラクターが登場する場合は場所移動のナレーションを追加
- キャラクターが本来いない場所にいる場合は必ず理由を説明`;
}

// COMMON_EXPRESSIONSをエクスポート
export { COMMON_EXPRESSIONS };