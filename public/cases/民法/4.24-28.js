export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "minpo_saiken_juyotaitai",
  title: "【民法債権】受領遅滞の要件と効果、法的性質",
  category: "minpo",
  citation: "【民法413条】改正民法と受領遅滞",
  rank: "A",
  tags: ["民法", "債権", "受領遅滞", "債務不履行", "法定責任説", "債務不履行説"],
  rightSideCharacters: ['ユズヒコ', '石田'],

  // =============================================
  // === 2. 知識箱（キャラクター対話・解説用）（必須） ==
  // =============================================
  knowledgeBox: `
    【受領遅滞（【民法413条】）の要件】
    - 受領遅滞とは、債務者が履行の提供をしたにもかかわらず、債権者がこれを受領しないか、または受領できない状態をいう[3][7]。
    - 要件は以下の2点である。【id:24】
      1. 債務者が債務の本旨に従った適法な履行の提供（弁済提供）があること[2][4]。
      2. 債権者が受領を拒み、又は受領できないこと[2][4]。
    - 債権者の故意・過失（帰責事由）は要件ではないとするのが判例・通説である（法定責任説の立場）[4][7]。

    【受領遅滞（【民法413条】）の効果】
    - 受領遅滞の効果は以下の通りである[2][3][7]。【id:25】
      1. **弁済提供としての効果**：
         - 債務者は履行遅滞責任を免れる（【民法492条】）。これにより、債務者は契約解除や損害賠償請求を受けなくなる[10]。
         - 債権者の同時履行の抗弁権を奪う。
      2. **受領遅滞としての効果**：
         - 特定物の引渡債務における債務者の保存義務の軽減（【民法413条1項】）：債務者は、善管注意義務（【民法400条】）から「自己の財産に対するのと同一の注意」（自己物と同一の注意義務）で足りるようになる[2][3][10]。これにより、保存義務が軽減されたことで生じるリスクは債権者が負担する[10]。
         - 増加費用の債権者負担（【民法413条2項】）：受領遅滞によって債務者の履行費用が増加した場合は、その増加額は債権者が負担する[2][3][10]。
         - 受領遅滞中の危険負担：受領遅滞中に当事者双方の責めに帰すことができない事由によって履行不能となった場合、その履行不能は債権者の責めに帰すべき事由によるものとみなされる（【民法413条の2第2項】）。これにより、債務者は反対給付（代金）を請求でき、債権者は給付（目的物）を受けられなくなる（債権者主義、【民法536条2項】前段類推適用）。また、債権者は危険負担の原則（【民法543条】）により契約解除権を失う。

    【受領遅滞（【民法413条】）の法的性質】
    - 受領遅滞の法的性質については、主に二つの学説が対立する[6]。【id:26】
      1. **法定責任説（判例・通説）**：受領遅滞は、公平の観点から、履行遅延から生じる不利益を債権者に負担させるという、法律が定めた責任（債務者の責任を免れさせる制度）と捉える[6]。
         - 債権はあくまで権利であり義務ではないため、債権者に受領義務は認められない[6]。
         - 債権者に受領義務がないため、受領遅滞は債権者の債務不履行とは異なる。
         - 債権者が受領遅滞にある場合、通常は反対債務（代金支払債務など）も履行遅滞に陥っており、債務者はそちらの債務不履行を理由に契約解除や損害賠償請求が可能であるため、受領遅滞を債務不履行の特則とみる必要はない[6]。
      2. **債務不履行説（有力説）**：受領遅滞を債権者の一種の債務不履行と捉え、債務不履行責任の特則と位置付ける[6]。
         - 債権者には、債務者と協力して債権の目的を実現するという法律上の義務（受領義務）があり、これを怠ることは債務不履行にあたる[6]。
         - 条文上、受領遅滞が債務不履行の規定（【民法413条】）の中に置かれていることを根拠とする[6]。

    【受領義務の有無】
    - 法定責任説からは、債権は権利であり義務ではないため、債権者に受領義務は認められない（ただし、具体的な事案に応じて信義則を根拠に受領義務を認める余地はある）。【id:27】
    - 債務不履行説からは、債権者には法律上の受領義務があるとされる。【id:27】

    【債務者からの解除・損害賠償請求の可否】
    - 法定責任説からは、受領遅滞があっただけでは、債務不履行責任は生じないため、債務者からの契約解除や損害賠償請求は当然には認められない（ただし、具体的な事案に応じて信義則を根拠に認める余地はある）。[5][7]【id:28】
    - 債務不履行説からは、受領遅滞は債権者の債務不履行であるため、債務者からの契約解除や損害賠償請求が認められる。【id:28】
    - 改正民法では、受領遅滞の効果を具体的に明記し、債務者の注意義務軽減や増加費用負担を規定したが、受領遅滞それ自体を債権者の債務不履行とは明示せず、債務者からの解除・損害賠償請求については引き続き解釈に委ねられている[3][5][7]。
  `,

  // =============================================
  // === 3. 個別Q&A（指示した場合のみ） =======================
  // =============================================
  questionsAndAnswers: [    { id: 24, rank: 'A', question: '受領遅滞（【民法413条】）の要件について説明しなさい。', answer: '①{{債務の本旨に従った履行の提供}}があること（弁済提供があること）、②{{債権者が受領を拒み、又は受領することができない}}ことである。' },
    { id: 25, rank: 'B', question: '受領遅滞（【民法413条】）の効果について説明しなさい。', answer: '①弁済提供としての効果（{{履行遅滞責任を免れる}}、{{同時履行の抗弁を奪う}}）、②受領遅滞としての効果（特定物の引渡債務における{{善管注意義務が軽減}}、{{増加費用は債権者の負担}}、受領遅滞中の双方無責による履行不能・{{債権者の責めに帰すべき事由によるものとみなされる}}）。' },
    { id: 26, rank: 'A', question: '受領遅滞（【民法413条】）の法的性質について説明しなさい。', answer: '{{法定責任説}}（判例・通説）と{{債務不履行説}}（有力説）がある。法定責任説は、公平の観点から債務者の責任を免れさせる{{法定責任}}と捉え、債権者に{{受領義務は認めない}}。債務不履行説は、債権者にも{{受領義務があり}}、受領遅滞を債権者の一種の{{債務不履行}}と捉える。' },
    { id: 27, rank: 'B', question: '受領遅滞（【民法413条】）の効果の1つとして、受領義務が認められるかについて説明しなさい。', answer: '{{法定責任説}}からは{{認められない}}（具体的な事案に応じて{{信義則}}を根拠に求める）。{{債務不履行説}}からは{{認められる}}。' },
    { id: 28, rank: 'B', question: '受領遅滞（【民法413条】）の効果の1つとして、債務者からの解除・損害賠償請求が認められるかについて説明しなさい。', answer: '{{法定責任説}}からは{{当然には認められない}}（具体的な事案に応じて{{信義則}}を根拠に認める）。{{債務不履行説}}からは{{認められる}}。' }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'ユズヒコの中学校・放課後の教室' },
    { type: 'narration', text: 'ユズヒコ、山下、須藤、石田の4人が、今日の民法の授業のテーマである「受領遅滞」について議論している。日暮れが迫り、教室はオレンジ色に染まっている。' },
    { type: 'dialogue', speaker: '山下', expression: 'serious', dialogue: '受領遅滞って、債権者が債務者からの履行を受け取らない場合のことよね。先生が、中古車の納車を拒否する買主の例を出してたけど。あれって、どんな時に成立するの？要件は？【id:24】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: '受領遅滞の要件は２つ。まず「債務の本旨に従った適法な履行の提供」があること、つまり債務者がちゃんと弁済しようとすること。そして「債権者が受領を拒むか、受領できない」状態であることだね【id:24】。債権者に受け取る意思がなくても、受け取れない物理的状況でも成立する。' },
    { type: 'dialogue', speaker: '須藤', expression: 'thinking', dialogue: 'そうそう。債権者の故意や過失は要件じゃないって、先生言ってたわ。そこが大事よね。' },
    { type: 'dialogue', speaker: '石田', expression: 'thinking', dialogue: 'ねえ、ユズピ、ちょっと質問なのだ。もし、私がスドーに「美味しいお菓子あげるネ」って約束したとする。で、私がちゃんとお菓子を持って行ったのに、スドーが「今、ダイエット中だからいらない」って受け取らなかったとするネ。この場合、私、もうスドーにお菓子をあげる義務から解放されるの？私、お菓子作り、大変だったのだ。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: '石田の例は分かりやすいね。それが受領遅滞の効果だよ。まず、弁済提供の効果として、債務者である石田は「履行遅滞責任を免れる」んだ（【民法492条】）。つまり、スドーから「なんでお菓子持ってこないんだ！」って損害賠償とか契約解除とか請求されなくなるってことだ【id:25】。' },
    { type: 'dialogue', speaker: '山下', expression: 'passionate', dialogue: 'さらに！受領遅滞の効果として、債務者の注意義務が軽減されるのよ！特定物の場合、普通は善管注意義務だけど、受領遅滞になったら「自己の財産に対するのと同一の注意」で良くなるの【id:25】（【民法413条1項】）。もしそのお菓子が「特定物」で、冷蔵庫に入れてたのにちょっと形が崩れちゃっても、石田は責任を問われにくくなるってことね。そして、もしお菓子を保存する費用が増えたら、それはスドーの負担よ【id:25】（【民法413条2項】）。' },
    { type: 'dialogue', speaker: '須藤', expression: 'impressed', dialogue: 'ちょっと、石田、私のダイエットの邪魔しないでよ！でも、なるほどね。債務者側がかなり保護されるってことか。' },
    { type: 'dialogue', speaker: '石田', expression: 'normal', dialogue: 'ねー、私、納得なのだ。でも、もしお菓子が私の不注意じゃなくて、地震とかで潰れちゃった場合はどうなるの？私、スドーにお菓子渡せないけど、それでもスドーから代金もらえるの？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'そこが改正民法の重要なポイントで、「受領遅滞中の危険負担」だね。受領遅滞中に、債権者・債務者双方の責めに帰すことができない事由、つまり地震みたいに誰のせいでもない理由で履行不能になった場合、その履行不能は「債権者の責めに帰すべき事由によるものとみなされる」んだ（【民法413条の2第2項】）。だから、石田はスドーにお菓子を渡せなくても、代金は請求できるし、スドーは代金を払わなきゃいけないのに、お菓子は手に入らないっていうことになる。これが危険負担における債権者主義（【民法536条2項】前段類推適用）ってやつだ【id:25】。' },
    { type: 'narration', text: '石田がうんうんと頷く中、須藤が少し難しい顔で口を開いた。' },
    { type: 'dialogue', speaker: '須藤', expression: 'thinking', dialogue: 'あのね、先生が「受領遅滞の法的性質」について、学説が対立してるって言ってたの。法定責任説と債務不履行説…これ、何がどう違うの？【id:26】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: 'それも重要だね。判例・通説は「法定責任説」を採ってるんだ。これは、受領遅滞は公平の観点から、法律が債権者に負わせる責任、つまり債務者の責任を免れさせる制度だと考える。債権はあくまで権利であって義務じゃないから、債権者に「受け取る義務」なんてものは元々ない、というのがこの説の考え方なんだ【id:26】【id:27】。だから、債権者が受け取らないからといって、それ自体が債務不履行になるわけじゃない。' },
    { type: 'dialogue', speaker: '山下', expression: 'serious', dialogue: 'そうよ。法定責任説からは、債務者が債権者の受領遅滞を理由に、解除や損害賠償請求を「当然には」できないのよ【id:28】。だって、債権者に受領義務がないんだから、義務違反にはならないでしょ？でも、具体的な事案によっては、信義則を根拠にそういう請求が認められる余地はあるんだけどね。' },
    { type: 'dialogue', speaker: '石田', expression: 'passionate', dialogue: 'でも、債務不履行説っていうのもあるのだ！そっちは「債権者にも受け取る義務がある」って考えるんだよね？債務不履行が成立するの？【id:26】【id:27】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'その通り。債務不履行説は、債務の実現には債権者の協力も不可欠だから、債権者には法律上の「受領義務」がある、と考える。だから、債権者が受領を拒んだりできない状態になったりするのは、この受領義務の違反、つまり債権者側の債務不履行にあたるんだ。この説だと、債務者は受領遅滞を理由に解除や損害賠償請求ができることになるね【id:28】。' },
    { type: 'dialogue', speaker: '須藤', expression: 'thinking', dialogue: 'なるほど。改正民法では、受領遅滞の効果が具体的に条文に明記されたけど、受領遅滞それ自体を債権者の債務不履行とは明示してないから、この学説の対立は今も続いているってことね。' },
    { type: 'narration', text: '今日の議論も深まり、日もすっかり暮れていた。ユズヒコたちは、それぞれの鞄を手に、教室を後にした。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">受領遅滞の要件、効果、法的性質</h3>
    <p class="mb-4">受領遅滞とは、債務者が債務の本旨に従った履行の提供をしたにもかかわらず、債権者が正当な理由なくこれを受領しないか、または受領できない状態を指します。【民法413条】に規定され、債務者の履行の準備が整っているにもかかわらず、債権者の協力が得られない場合に生じる法律関係を規律します。</p>

    <h4 class="text-lg font-bold mt-6 mb-2">1. 受領遅滞の要件【id:24】</h4>
    <p class="mb-4">受領遅滞が成立するためには、以下の2つの要件を満たす必要があります。</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">① 債務の本旨に従った履行の提供があること（弁済提供）</span>：債務者が、債務の内容通りに履行する意思と能力を示し、実際に履行の準備が整っている必要があります。</li>
      <li><span class="text-red-600 font-bold">② 債権者が受領を拒み、又は受領することができないこと</span>：債権者が故意に受領を拒否する場合だけでなく、債権者の過失の有無にかかわらず、債権者が客観的に受領できない状態にある場合も含まれます。判例・通説は、債権者の故意・過失は要件ではないとする法定責任説の立場をとります。</li>
    </ul>

    <h4 class="text-lg font-bold mt-6 mb-2">2. 受領遅滞の効果【id:25】</h4>
    <p class="mb-4">受領遅滞が生じると、債務者および債権者に以下のような効果が生じます。</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">弁済提供としての効果</span>：
        <ul>
          <li>債務者は履行遅滞責任を免れます（【民法492条】）。これにより、債務不履行による契約解除や損害賠償請求を受けなくなります。</li>
          <li>債権者の同時履行の抗弁権を奪います。</li>
        </ul>
      </li>
      <li><span class="text-red-600 font-bold">受領遅滞としての効果</span>：
        <ul>
          <li>**債務者の保存義務の軽減（【民法413条1項】）**：特定物の引渡債務の場合、債務者の保存義務が善管注意義務（【民法400条】）から「自己の財産に対するのと同一の注意」に軽減されます。</li>
          <li>**増加費用の債権者負担（【民法413条2項】）**：受領遅滞によって債務者の履行費用が増加した場合、その増加額は債権者が負担します。</li>
          <li>**受領遅滞中の危険負担（【民法413条の2第2項】）**：受領遅滞中に当事者双方の責めに帰すことができない事由によって履行不能となった場合、その履行不能は債権者の責めに帰すべき事由によるものとみなされます。これにより、債務者は反対給付を請求できるのに対し、債権者は給付を受けられなくなります。</li>
        </ul>
      </li>
    </ul>

    <h4 class="text-lg font-bold mt-6 mb-2">3. 受領遅滞の法的性質と学説の対立【id:26】</h4>
    <p class="mb-4">受領遅滞の法的性質については、主に**法定責任説**と**債務不履行説**が対立しています。</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">法定責任説（判例・通説）</span>：
        <ul>
          <li>受領遅滞は、公平の観点から債権者に一定の不利益を負担させる法律上の責任であり、債務者の責任を免れさせる制度と捉えます。</li>
          <li>債権は権利であり、原則として債権者に受領義務はないと解します【id:27】。そのため、債権者が受領しないこと自体は債務不履行にはあたりません。</li>
          <li>したがって、債務者は受領遅滞のみを理由に契約解除や損害賠償請求を当然にはできません【id:28】。</li>
        </ul>
      </li>
      <li><span class="text-red-600 font-bold">債務不履行説（有力説）</span>：
        <ul>
          <li>債務の実現には債権者の協力が不可欠であるため、債権者にも法律上の受領義務があると解します【id:27】。</li>
          <li>この受領義務に違反した場合、受領遅滞は債権者の一種の債務不履行にあたると捉えます。</li>
          <li>この説によれば、債務者は受領遅滞を理由に契約解除や損害賠償請求をすることができます【id:28】。</li>
        </ul>
      </li>
    </ul>
    <p class="mb-4">改正民法は、受領遅滞の効果を具体的に明記しましたが、受領遅滞自体を債権者の債務不履行と明示せず、債務者からの解除・損害賠償請求については引き続き解釈に委ねています。</p>

    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験に向けたポイント</h5>
      <p>受領遅滞の論点では、まず**要件**【id:24】と**効果**【id:25】を正確に押さえることが重要です。特に、債務者の注意義務の軽減（特定物債務の場合）と、増加費用負担、そして危険負担の転換は、事案解決に直結するため確実に理解してください。そして、最も重要なのが**法的性質**に関する学説の対立【id:26】です。判例・通説である法定責任説の立場を理解し、なぜ債権者の帰責事由が不要とされるのか、なぜ受領義務が当然には認められないのか、なぜ債務者からの解除・損害賠償請求が当然にはできないのか【id:27】【id:28】、そのロジックを説明できるようにすることが求められます。これらの論点は、事例問題の事実認定や、論証の組み立てに大きく影響するため、学説の理解を深めることが合格への鍵となります。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "受領遅滞の総合問題",
      rank: "A",
      background: `
        家具職人Aは、注文を受けて制作した特注の木製テーブル（特定物、代金20万円）を顧客Bに引き渡す契約を締結した。引渡し期日は6月1日とされ、B宅への配送をAが行うことになっていた。
        Aは6月1日、契約通りにテーブルをB宅に配送しようとトラックで向かった。ところが、BはAからの事前連絡を無視し、当日は不在で電話にも出なかった。Aは仕方なくテーブルを持ち帰り、Aの工房の片隅に保管することにした。このテーブルの保管には特別の費用はかからなかった。
        6月10日、Bからテーブルの引渡しを要求されたが、その前日の6月9日、工房近くを震源とする大規模な地震が発生し、テーブルは転倒・破損して完全に使用不能となってしまっていた。この地震は不可抗力であり、Aに落ち度はなかった。
      `,
      subProblems: [
        {
          title: "受領遅滞の成立と効果",
          rank: "A",
          relatedQAs: [24, 25, 26, 27],
          problem: "本件において、Bの受領遅滞は成立するか。また、受領遅滞が成立した場合、その効果としてどのようなものが生じるか、特に債務者Aの注意義務の軽減と危険負担の転換に触れつつ説明しなさい。",
          hint: "受領遅滞の要件を満たしているか、そして特定物債務における注意義務の軽減と、受領遅滞中の危険負担のルールを適用しましょう。",
          points: ["受領遅滞の要件【id:24】", "債務者の履行遅滞責任の免除【id:25】", "特定物保存義務の軽減【id:25】", "危険負担の転換（債権者主義）【id:25】"],
          modelAnswer: "本件において、Bの受領遅滞は成立する。Aは6月1日に契約通りテーブルをB宅へ配送しようとしており、債務の本旨に従った適法な履行の提供があった【id:24】。しかし、Bは不在で電話にも出ず、テーブルの受領を拒んでいるため、受領拒絶の状態にある【id:24】。よって、6月1日からBの受領遅滞が成立する。\n受領遅滞の効果として、まずAは履行遅滞責任を免れる【id:25】（【民法492条】）。また、テーブルは特定物であるため、Aのテーブル保存義務は、善管注意義務（【民法400条】）から「自己の財産に対するのと同一の注意」に軽減される【id:25】（【民法413条1項】）。\nさらに、受領遅滞中に地震という双方の責めに帰すことができない事由によりテーブルが破損し履行不能となった場合、その履行不能は債権者Bの責めに帰すべき事由によるものとみなされる【id:25】（【民法413条の2第2項】）。これにより、危険負担は債権者主義（【民法536条2項】前段類推適用）となり、AはBに対し代金20万円を請求でき、Bは代金を支払わなければならないにもかかわらず、テーブルの引渡しを受けることはできない。"
        }
      ]
    },
    {
      title: "受領遅滞の法的性質と債務者の請求権",
      rank: "A",
      background: `
        先の家具職人Aと顧客Bの事案において、Bの受領遅滞が生じた後、Aはテーブルの保管に困り、他の顧客からの注文を断らざるを得ない状況に陥った。Aは、Bの受領遅滞を理由に、本件契約を解除し、生じた損害の賠償を請求したいと考えている。
      `,
      subProblems: [
        {
          title: "債務者からの解除・損害賠償請求",
          rank: "A",
          relatedQAs: [26, 27, 28],
          problem: "AはBに対し、Bの受領遅滞を理由に、本件契約を解除し、損害賠償を請求することができるか。受領遅滞の法的性質に関する学説の対立に触れつつ、検討しなさい。",
          hint: "判例・通説である法定責任説と、債務不履行説、それぞれの立場から解除・損害賠償請求が認められるか否かを論じましょう。",
          points: ["受領遅滞の法的性質（法定責任説・債務不履行説）【id:26】", "債権者の受領義務の有無【id:27】", "債務者からの解除・損害賠償請求の可否【id:28】"],
          modelAnswer: "AがBに対し、Bの受領遅滞を理由に本件契約を解除し、損害賠償を請求できるかについては、受領遅滞の法的性質に関する学説の対立がある。\n1. **法定責任説（判例・通説）の立場**：この説は、債権は権利であって義務ではないため、債権者に受領義務はないと考える【id:27】。したがって、受領遅滞は債権者の義務違反ではないため、債務不履行には当たらない。そのため、債務者AはBの受領遅滞のみを理由に当然には契約解除や損害賠償請求をすることはできない【id:28】。ただし、具体的な事案において、債権者の行為が信義則に反するなど、債務不履行と評価しうる別の要件を満たす場合には、例外的に解除や損害賠償が認められる余地がある。\n2. **債務不履行説の立場**：この説は、債務の実現には債権者の協力も不可欠であるため、債権者にも法律上の受領義務があると考える【id:27】。この受領義務に違反した場合、受領遅滞は債権者の一種の債務不履行にあたると捉える。この説によれば、債務者AはBの受領遅滞を理由に、本件契約を解除し、損害賠償を請求することができる【id:28】。\n**結論**：判例・通説である法定責任説に従えば、AはBの受領遅滞のみを理由に契約解除や損害賠償請求を当然にはできない。Aが契約を解除し、損害賠償を請求するためには、Bの行為が信義則に反するなど、債務不履行と評価しうる別の要件を立証する必要がある。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
