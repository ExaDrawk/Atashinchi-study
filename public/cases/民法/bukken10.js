export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "minpou-senyuu-185",
  title: "【民法・物権法】占有の性質変更と新権原",
  category: "minpou",
  citation: "最判昭46.11.30・最判平8.11.12",
  rank: "A",
  tags: ["民法", "物権法", "占有", "取得時効", "新権原", "相続"],
  rightSideCharacters: ['ユズヒコ'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `【民法185条】占有の性質変更と新権原\n\n【重要概念】\n- **他主占有**: 所有の意思のない占有（賃借人、受寄者など）\n- **自主占有**: 所有の意思のある占有（所有者、所有者と信じる者など）\n- **新権原**: 自主占有を外形的に基礎づける新たな法的原因【id:1】\n\n【判断基準】\n- 売買・贈与・交換等の契約は典型的な新権原【id:2】\n- 相続は原則として新権原にならない（包括承継の性質）【id:3】\n- 相続人が独自の事実的支配を開始し、所有の意思に基づく占有と認められる特段の事情がある場合は例外【id:4】\n\n【条文】\n【民法185条】権原の性質上占有者に所有の意思がないものとされる場合には、その占有者が、自己に占有をさせた者に対して所有の意思があることを表示し、又は新たな権原により更に所有の意思をもって占有を始めるのでなければ、占有の性質は、変わらない。\n\n【判例の立場】\n- 昭和46年判決: 相続人が新たに事実的支配を開始し、所有の意思がある場合は新権原による自主占有を認める\n- 平成8年判決: 相続人側で外形的客観的に独自の所有の意思に基づく事情を証明する必要がある\n\n【実務への影響】\n- 取得時効の成立要件（自主占有）の判断に直結\n- 相続による占有承継の場面で頻繁に問題となる\n- 186条1項の所有の意思の推定が働かない例外的場面`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'A', 
      question: '【民法185条】の新権原とは何か説明しなさい。', 
      answer: '新権原とは、{{自主占有を外形的に基礎づける新たな法的原因}}のことである。{{売買・贈与・交換}}等の契約が典型例で、他主占有者が{{所有の意思をもって占有を始める}}ための客観的根拠となる。' 
    },
    { 
      id: 2, 
      rank: 'S', 
      question: '相続は新権原にあたるか、判例の立場を述べなさい。', 
      answer: '相続は{{包括承継}}の性質上、原則として新権原にならない。ただし、{{外形的客観的にみて相続人が独自の事実的支配を開始}}し、{{所有の意思に基づく占有}}と認められる{{特段の事情}}がある場合は例外的に新権原となる（最判昭46.11.30・最判平8.11.12）。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: '他主占有から自主占有への変更の要件を述べなさい。', 
      answer: '【民法185条】により、①{{自己に占有をさせた者に対する所有の意思の表示}}、または②{{新たな権原により所有の意思をもって占有を始めること}}のいずれかが必要である。単なる{{内心の意思変更}}では不十分で、{{外形的な変更}}が要求される。' 
    },
    { 
      id: 4, 
      rank: 'B', 
      question: '占有の訴えの種類と要件を説明しなさい。', 
      answer: '占有の訴えには①{{占有保持の訴え}}（妨害の停止・損害賠償）、②{{占有保全の訴え}}（妨害の予防・担保提供）、③{{占有回収の訴え}}（物の返還・損害賠償）がある。いずれも{{本権の証明を要しない}}簡易迅速な救済制度である。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '果実収取権の要件と趣旨を説明しなさい。', 
      answer: '【民法189条】により{{善意の占有者}}は果実を取得する。趣旨は{{善意占有者の資本・労力の投下}}と{{有効利用}}の保護にある。{{不当利得制度の特則}}として、占有者の保護と真正所有者との利益調整を図る。' 
    },
    { 
      id: 6, 
      rank: 'B', 
      question: '共有物の管理・変更・保存の区別を述べなさい。', 
      answer: '{{保存行為}}は各共有者が単独で可能（252条5項）、{{管理行為}}は持分価格の過半数で決定（252条1項）、{{変更行為}}は共有者全員の同意が必要（251条）。{{形状・効用の著しい変更}}の有無で管理と変更を区別する。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ユズヒコの中学校・2年B組の教室。放課後の静寂に包まれた校舎で、ユズヒコが一人机に向かって法律の参考書を読んでいる' },
    { type: 'narration', text: 'クラスメートたちが部活動や帰宅の準備をする中、ユズヒコは占有に関する複雑な判例を読み返していた。表情は真剣そのもので、時折首をかしげながらページをめくっている' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'う〜ん、占有の性質変更って、やっぱり難しいな…。姉ちゃんに聞かれた時にちゃんと説明できるかな【id:1】' },
    
    { type: 'narration', text: 'そこへ、物権法が得意な石田が教室に戻ってきた。彼女は独特の感性を持つ少女で、いつも何か面白いことを考えている' },
    { type: 'dialogue', speaker: '石田', expression: 'normal', dialogue: 'あ、ユズピ！まだ残ってたのネ。何を勉強してるのだ？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'あ、石田さん。占有の性質変更について調べてるんだ。民法185条の新権原の話なんだけど…' },
    { type: 'dialogue', speaker: '石田', expression: 'excited', dialogue: 'おお！物権法ネ！石田の得意分野なのだ！新権原って、他主占有から自主占有に変わる時の話でしょ？' },
    
    { type: 'embed', format: 'mermaid', title: '占有の性質変更の基本構造', description: '他主占有から自主占有への転換プロセス', content: 'graph TD\n    A[他主占有<br/>賃借人・受寄者等] --> B{性質変更の要件}\n    B -->|①所有の意思表示| C[自主占有]\n    B -->|②新権原による占有開始| C\n    C --> D[取得時効の基礎]\n    \n    E[売買契約] --> F[典型的な新権原]\n    G[贈与契約] --> F\n    H[交換契約] --> F\n    F --> B' },
    
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'そうそう！でも相続の場合はどうなるんだろう？相続って新権原になるのかな？' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'うーん、相続ネ…。これは複雑なのだ。基本的には包括承継だから、被相続人の他主占有をそのまま引き継ぐはずなのだ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'confused', dialogue: 'でも、相続人が自分のものだと信じて長年占有してたら、取得時効が成立してもおかしくないよね？' },
    
    { type: 'narration', text: '石田は教室の窓際に移動し、夕日を見つめながら考え込んだ。彼女なりの合理的な思考プロセスが始まったようだ' },
    { type: 'dialogue', speaker: '石田', expression: 'serious', dialogue: 'そこが判例の工夫なのだ！昭和46年の最高裁判決を見るのだ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'surprised', dialogue: 'え？昭和46年？どんな判決なの？' },
    { type: 'dialogue', speaker: '石田', expression: 'passionate', dialogue: '相続人が新たに事実的支配を開始して、所有の意思に基づく占有と認められる特段の事情があれば、新権原による自主占有を認めるのだ！' },
    
    { type: 'embed', format: 'mermaid', title: '相続と新権原の判断フロー', description: '昭和46年・平成8年最高裁判決による判断基準', content: 'graph TD\n    A[被相続人の他主占有] --> B[相続発生]\n    B --> C{相続人の占有態様}\n    C -->|単純承継| D[他主占有継続]\n    C -->|独自の事実的支配開始| E{所有の意思の証明}\n    E -->|外形的客観的事情あり| F[自主占有成立]\n    E -->|証明不十分| D\n    F --> G[取得時効の可能性]\n    D --> H[取得時効不成立]' },
    
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '特段の事情って、具体的にはどんなこと？' },
    { type: 'dialogue', speaker: '石田', expression: 'normal', dialogue: '例えば、相続人が遺言書を発見したとか、他の親戚も認めてたとか、客観的に見て自分のものだと信じるのが無理もない事情なのだ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'なるほど！ただ心の中で「自分のもの」と思ってるだけじゃダメで、外から見てもそう思えるような事情が必要なんだね' },
    
    { type: 'narration', text: 'そこへ、民法総則が得意な須藤が教室に入ってきた。彼女は真面目で成績優秀、いつも的確な指摘をする' },
    { type: 'dialogue', speaker: '須藤', expression: 'normal', dialogue: 'タチバナくん、石田さん、お疲れさま。何の話をしてるの？' },
    { type: 'dialogue', speaker: '石田', expression: 'excited', dialogue: 'スドー！ちょうど良かったのだ！占有の性質変更の話をしてたのだ' },
    { type: 'dialogue', speaker: '須藤', expression: 'serious', dialogue: 'あ、185条ね。確か平成8年の判決で、立証責任についても判断が示されてたよね' },
    
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'surprised', dialogue: '立証責任？' },
    { type: 'dialogue', speaker: '須藤', expression: 'normal', dialogue: '相続人側で、外形的客観的に独自の所有の意思に基づく事情を証明しなければならないの。186条1項の推定は働かないから' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'そうそう！普通なら占有してれば所有の意思が推定されるけど、相続の場合は特別なのだ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'confused', dialogue: 'なんで推定が働かないの？' },
    
    { type: 'embed', format: 'mermaid', title: '186条推定と相続の関係', description: '所有の意思推定が働かない理由', content: 'graph LR\n    A[通常の占有] --> B[186条1項推定]\n    B --> C[所有の意思あり]\n    \n    D[相続による占有] --> E[推定適用除外]\n    E --> F[相続人側立証責任]\n    F --> G{証明成功}\n    G -->|成功| H[自主占有認定]\n    G -->|失敗| I[他主占有継続]' },
    
    { type: 'dialogue', speaker: '須藤', expression: 'serious', dialogue: '被相続人が他主占有者だった場合、相続人も他主占有になる蓋然性があるからよ。相続という事実だけでは、自主占有になったとは言えないの' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'なるほど！だから相続人が積極的に証明しなきゃいけないんだ' },
    
    { type: 'narration', text: '3人の議論は次第に熱を帯びてきた。夕日が教室を赤く染める中、占有制度の奥深さについて語り合っている' },
    { type: 'dialogue', speaker: '石田', expression: 'excited', dialogue: 'ところで、占有には他にも面白い制度があるのだ！果実収取権とか、占有の訴えとか！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'interested', dialogue: '果実収取権？' },
    { type: 'dialogue', speaker: '石田', expression: 'happy', dialogue: '189条なのだ！善意の占有者は果実を取得できるのだ。例えば、境界を間違えて隣の土地で家庭菜園をしてた場合とか' },
    
    { type: 'embed', format: 'html', title: '占有権の内容一覧', description: '占有者に認められる各種権利', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; border: 1px solid #ddd; font-size: 14px;">権利</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 14px;">条文</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 14px;">要件</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 14px;">効果</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">果実収取権</td><td style="padding: 10px; border: 1px solid #ddd;">189条</td><td style="padding: 10px; border: 1px solid #ddd;">善意の占有者</td><td style="padding: 10px; border: 1px solid #ddd;">天然果実・法定果実の取得</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">費用償還請求権</td><td style="padding: 10px; border: 1px solid #ddd;">196条</td><td style="padding: 10px; border: 1px solid #ddd;">占有者（善意・悪意問わず）</td><td style="padding: 10px; border: 1px solid #ddd;">必要費・有益費の償還</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">占有保持の訴え</td><td style="padding: 10px; border: 1px solid #ddd;">198条</td><td style="padding: 10px; border: 1px solid #ddd;">占有の妨害</td><td style="padding: 10px; border: 1px solid #ddd;">妨害停止・損害賠償</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">占有保全の訴え</td><td style="padding: 10px; border: 1px solid #ddd;">199条</td><td style="padding: 10px; border: 1px solid #ddd;">妨害のおそれ</td><td style="padding: 10px; border: 1px solid #ddd;">妨害予防・担保提供</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">占有回収の訴え</td><td style="padding: 10px; border: 1px solid #ddd;">200条</td><td style="padding: 10px; border: 1px solid #ddd;">占有の侵奪</td><td style="padding: 10px; border: 1px solid #ddd;">物の返還・損害賠償</td></tr></tbody></table><div style="margin-top: 12px; padding: 12px; background: #e3f2fd; border-radius: 4px; font-size: 11px;"><strong>注意</strong>：占有の訴えは本権の証明を要しない簡易迅速な救済制度</div></div>' },
    
    { type: 'dialogue', speaker: '須藤', expression: 'normal', dialogue: '採れた野菜は占有者のものになるし、土地を使ってた利益も返さなくていいのよ。不当利得の特則として、善意占有者を保護してるの' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '占有の訴えっていうのは？' },
    { type: 'dialogue', speaker: '石田', expression: 'passionate', dialogue: '197条以下なのだ！占有を侵害された時の簡易迅速な救済制度なのだ！' },
    
    { type: 'dialogue', speaker: '須藤', expression: 'serious', dialogue: '3種類あるの。占有保持の訴え、占有保全の訴え、占有回収の訴え。どれも本権の証明は不要よ' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'surprised', dialogue: '本権の証明が不要？それってすごく便利だね' },
    { type: 'dialogue', speaker: '石田', expression: 'excited', dialogue: 'そうなのだ！例えば自転車を盗まれた時、所有権を証明しなくても、占有してた事実と侵奪された事実だけで返還請求できるのだ！' },
    
    { type: 'narration', text: '教室の外では部活動を終えた生徒たちの声が聞こえてくる。3人の議論はさらに深まっていく' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'でも、犯人が「いや、これは元々俺のものだ」って主張してきたらどうなるの？' },
    { type: 'dialogue', speaker: '須藤', expression: 'cool', dialogue: 'それが202条の問題ね。占有の訴えでは、本権に関する理由で裁判できないの。所有権の争いは別の訴訟でやってくださいってこと' },
    { type: 'dialogue', speaker: '石田', expression: 'normal', dialogue: 'ただし、反訴として同じ手続きで主張することは判例で認められてるのだ' },
    
    { type: 'embed', format: 'mermaid', title: '占有の訴えと本権の訴えの関係', description: '202条による訴訟の分離と例外', content: 'graph TD\n    A[占有侵害] --> B[占有回収の訴え]\n    B --> C{相手方の主張}\n    C -->|占有関係の争い| D[占有の訴えで判断]\n    C -->|所有権の主張| E[本権の訴えで判断]\n    E --> F[別訴提起]\n    E --> G[反訴提起]\n    F --> H[二重の手続き]\n    G --> I[同一手続きで解決]' },
    
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'なるほど！占有という事実状態を仮に保護して、真の権利関係は別途じっくり審理するってことなんだね' },
    { type: 'dialogue', speaker: '石田', expression: 'happy', dialogue: 'その通りなのだ！自力救済を禁止して、法的手続きによる解決を促すのが趣旨なのだ' },
    
    { type: 'narration', text: '時計を見ると、もう6時を回っている。3人は名残惜しそうに資料を片付け始めた' },
    { type: 'dialogue', speaker: '須藤', expression: 'normal', dialogue: 'そろそろ帰らないと。でも、いい勉強になったわ。タチバナくんのお姉さんにもちゃんと説明できそうね' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'happy', dialogue: 'ありがとう、石田さん、須藤さん。おかげで185条の理解が深まったよ。姉ちゃんに聞かれても大丈夫だ' },
    { type: 'dialogue', speaker: '石田', expression: 'excited', dialogue: 'また分からないことがあったら聞くのだ！物権法は奥が深くて面白いのだ！' },
    
    { type: 'narration', text: '3人は教室を後にし、夕暮れの校舎を歩いていく。ユズヒコの頭の中では、今日学んだ占有制度の知識が整理されていく。明日、みかんに聞かれた時には、きっと分かりやすく説明できるだろう' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">【民法185条】占有の性質変更と新権原</h3>
    <p class="mb-4">【民法185条】は、他主占有から自主占有への性質変更の要件を定めた重要条文です。取得時効制度との関係で、実務上極めて重要な意味を持ちます。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">条文の構造と要件</h4>
    <p class="mb-4">【民法185条】は、権原の性質上所有の意思がない占有者について、以下の2つの方法による性質変更を認めています：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">①所有の意思の表示</span>：占有をさせた者に対する直接的な意思表示</li>
      <li><span class="text-red-600 font-bold">②新権原による占有開始</span>：売買・贈与等の新たな法的原因に基づく占有</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">新権原の意義</h4>
    <p class="mb-4">新権原とは、自主占有を外形的に基礎づける新たな法的原因を指します。典型例として売買契約、贈与契約、交換契約等があります。重要なのは、単なる内心の意思変更では足りず、<span class="text-red-600 font-bold">外形的・客観的な変更</span>が必要な点です。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">相続と新権原の問題</h4>
    <p class="mb-4">相続は包括承継の性質上、原則として新権原にはなりません。しかし、判例は以下の場合に例外を認めています：</p>
    
    <div class="bg-blue-100 p-4 rounded-lg mt-4 mb-4">
      <h5 class="font-bold text-blue-800 mb-2">最判昭和46年11月30日</h5>
      <p class="text-sm">相続人が新たに事実的支配を開始し、その占有が所有の意思に基づくものと認められる場合には、新権原による自主占有となる。</p>
    </div>
    
    <div class="bg-blue-100 p-4 rounded-lg mt-4 mb-4">
      <h5 class="font-bold text-blue-800 mb-2">最判平成8年11月12日</h5>
      <p class="text-sm">相続人において、外形的客観的にみて独自の所有の意思に基づく事情を自ら証明する必要がある。この場合、【民法186条1項】の推定は働かない。</p>
    </div>
    
    <h4 class="text-lg font-bold mt-6 mb-2">立証責任の特殊性</h4>
    <p class="mb-4">通常、占有者には【民法186条1項】により所有の意思が推定されますが、相続による占有承継の場面では以下の理由でこの推定が働きません：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li>他主占有から自主占有への<span class="text-red-600 font-bold">法律関係の変動</span>であること</li>
      <li>被相続人が他主占有者の場合、相続人も他主占有となる<span class="text-red-600 font-bold">蓋然性</span>があること</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">占有権の保護</h4>
    <p class="mb-4">【民法189条】以下は、占有それ自体に対する独自の保護を定めています：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">果実収取権（189条）</span>：善意占有者による果実取得</li>
      <li><span class="text-red-600 font-bold">費用償還請求権（196条）</span>：必要費・有益費の償還</li>
      <li><span class="text-red-600 font-bold">占有の訴え（197条以下）</span>：簡易迅速な救済制度</li>
    </ul>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験ポイント</h5>
      <p class="text-sm">①【民法185条】の2つの要件の区別、②相続における新権原の例外的成立要件、③【民法186条1項】推定が働かない理由、④占有の訴えの簡易性と【民法202条】の関係は頻出論点です。特に相続と取得時効の交錯問題は論文式でも重要です。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "占有の性質変更と相続の交錯",
      rank: "A",
      background: `みかんの祖母（母方）は、隣家の岩城家から「しばらく預かってほしい」と頼まれて、貴重な掛け軸甲を20年前から保管していた。祖母は岩城家の当主とは旧知の仲で、無償で保管を引き受けていた。\n\n3年前、祖母が亡くなり、母がその遺品を整理していたところ、掛け軸甲を発見した。母は祖母の日記を読み、「この掛け軸は、愛する娘（母）に譲りたい」との記載を見つけた。また、近所の人々も「おばあさんがいつも『この掛け軸は娘にあげるつもりだ』と話していた」と証言している。\n\n母は掛け軸甲を自分の遺産だと信じ、リビングに飾って大切に保管してきた。ところが最近、岩城家の現当主（岩城くんの父）が「掛け軸を返してほしい」と申し出てきた。`,
      subProblems: [
        {
          title: "祖母の占有の性質",
          rank: "B",
          relatedQAs: [1, 3],
          problem: "みかんの祖母による掛け軸甲の占有は、自主占有と他主占有のいずれにあたるか。その理由とともに論じなさい。",
          hint: "保管を依頼された経緯と、祖母の主観的認識を検討する",
          points: ["占有の意義", "自主占有・他主占有の区別基準", "具体的事実の評価"],
          modelAnswer: "祖母の占有は他主占有である。占有の性質は、占有取得の原因となった客観的事実から外形的に判断される（最判昭45.6.18）。本件では、祖母は岩城家から「預かってほしい」と依頼されて掛け軸を保管しており、これは典型的な寄託契約に基づく占有である。寄託契約は他人のために物を保管する契約であり、受寄者には所有の意思がないものとされる。したがって、祖母の占有は他主占有にあたる。"
        },
        {
          title: "母の占有の性質変更",
          rank: "A",
          relatedQAs: [2, 4],
          problem: "母による掛け軸甲の占有について、【民法185条】に基づく性質変更の成否を論じなさい。",
          hint: "相続と新権原の関係、判例の立場を検討する",
          points: ["相続による占有承継の原則", "新権原の例外的成立", "外形的客観的事情の評価", "立証責任"],
          modelAnswer: "母の占有は【民法185条】により自主占有に変更されている。相続は包括承継の性質上、原則として新権原にならない。しかし、最判昭46.11.30は、相続人が新たに事実的支配を開始し、所有の意思に基づく占有と認められる特段の事情がある場合の例外を認める。本件では、①祖母の日記の記載、②近所の人々の証言により、母が掛け軸を自己の所有物と信じることに客観的合理性がある。また、母は相続後、掛け軸をリビングに飾るなど、所有者としての独自の事実的支配を開始している。最判平8.11.12の基準に照らし、外形的客観的に独自の所有の意思に基づく事情が認められるため、母の占有は自主占有となる。"
        },
        {
          title: "取得時効の成否",
          rank: "S",
          relatedQAs: [2, 5],
          problem: "母による掛け軸甲の取得時効の成否について論じなさい。",
          hint: "占有期間の計算、善意無過失の判断を検討する",
          points: ["取得時効の要件", "占有期間の起算点", "善意無過失の判断", "【民法186条1項】推定の適用"],
          modelAnswer: "母は掛け軸甲を取得時効により取得できない。【民法162条】の取得時効が成立するには、20年間（善意無過失なら10年間）の自主占有が必要である。母の自主占有は相続時（3年前）から開始されており、まだ3年しか経過していない。祖母の他主占有期間（20年間）は、性質が異なるため合算できない。また、仮に【民法162条2項】の短期取得時効を主張する場合、母の善意無過失が必要だが、祖母から保管を依頼された経緯を知っていた可能性もあり、善意無過失の認定は困難である。なお、相続による占有承継の場面では【民法186条1項】の推定が働かないため（最判平8.11.12）、母側で善意無過失を立証する必要がある。したがって、現時点では取得時効は成立していない。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
