export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "keihou-jigogoutou",
  title: "事後強盗罪",
  category: "keihou",
  citation: "みかん、万引き犯と大格闘！？",
  rank: "S",
  tags: ["刑法", "財産犯", "事後強盗罪", "窃盗", "暴行", "脅迫"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '事後強盗罪は、【刑法238条】に規定される犯罪で、「窃盗犯」が事後に特定の目的で暴行・脅迫を行うことで、窃盗から強盗へと罪質が転換する点が特徴です。\n\n【基本構造】\n- **主体**: 窃盗犯（未遂も含む）【id:106】\n- **目的**: ①財物の取り返しを防ぐ、②逮捕を免れる、③罪跡を隠滅する、のいずれか【id:105】\n- **行為**: 上記目的のために暴行または脅迫を行うこと。\n\n【重要概念】\n- **暴行・脅迫の程度**: 「強盗として論ずる」とされているため、通常の強盗罪と同様に「相手方の反抗を抑圧するに足りる程度」が必要とされます。【id:107】\n- **窃盗の機会**: 暴行・脅迫は「窃盗の機会」に行われる必要があります。これは、窃盗行為との時間的・場所的接着性や、犯人への追跡が継続しているかといった事情から判断されます。追跡が終わってしまうと、本罪の成立は難しくなります。【id:112】\n- **法的性格**: なぜ事後強盗が強盗と同一視されるのかについては、人身保護を重視する見解（身分犯説）や、財物確保行為を重視する見解（結合犯説）など、学説上の争いがあります。【id:108】\n- **既遂・未遂の判断**: 事後強盗罪の既遂・未遂は、暴行・脅迫の結果ではなく、先行する「窃盗」が既遂か未遂かによって決まります。【id:109】\n- **共犯関係**: 事後強盗罪は、窃盗犯であることを要件とする「真正身分犯」と解されており、窃盗を行っていない者でも、【刑法65条1項】により共同正犯が成立しうるとされています。【id:114】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    {
      id: 105,
      rank: 'A',
      question: '事後強盗罪（【刑法238条】）の構成要件について説明しなさい。',
      answer: '{{窃盗}}が、「{{財物を得てこれを取り返されることを防ぎ、逮捕を免れ、又は罪跡を隠滅するために}}」、「{{暴行又は脅迫をした}}」ことである。'
    },
    {
      id: 106,
      rank: 'B',
      question: '事後強盗罪（【刑法238条】）における「窃盗」の意義について説明しなさい。',
      answer: '窃盗は{{既遂未遂問わない}}。'
    },
    {
      id: 107,
      rank: 'B',
      question: '事後強盗罪（【刑法238条】）における「暴行又は脅迫」の意義について説明しなさい。',
      answer: '事後強盗罪は「強盗として論」じられることから、{{反抗を抑圧するに足りるもの}}である必要がある。ただし、暴行・脅迫が加えられる「相手方」は、必ずしも{{窃盗の被害者であることを要しない}}。また、必ずしも、被害者が実際に財物を取り戻す行為や逮捕する行為をしている場合に限られない。'
    },
    {
      id: 108,
      rank: 'B',
      question: '事後強盗罪（【刑法238条】）を強盗罪として扱う趣旨について説明しなさい。',
      answer: 'A説（人身保護説）は、窃盗犯人が犯行現場を離れる際に暴行・脅迫を加える実態から{{人身保護の要請}}があるとする。B説（財物確保説）は、窃盗犯人が財物確保のために暴行・脅迫を加える場合、実質的に{{暴行・脅迫によって財物を得たと評価できる}}実態に着目する。'
    },
    {
      id: 109,
      rank: 'B',
      question: '事後強盗罪（【刑法238条】）における既遂・未遂の区別について説明しなさい。',
      answer: '通常の強盗罪の既遂・未遂の判断基準は、{{財産取得の有無}}によって決せられるため、これに準ずる事後強盗罪のそれもやはり強盗の場合と同様でなければならない。したがって、{{窃盗の既遂未遂によって決する}}。'
    },
    {
      id: 110,
      rank: 'B',
      question: '窃盗の目的で財物の占有を取得したが（既遂）、その占有を確保する以前に暴行・脅迫を行った場合の処理について説明しなさい。',
      answer: '1項強盗における暴行・脅迫は財物奪取の手段となっていなければならないが、{{占有取得が未完成な時期}}に、引き続き暴行・脅迫を行って占有を確保する場合には、かかる関係が認められる。したがって、{{1項強盗罪}}となる。'
    },
    {
      id: 111,
      rank: 'B',
      question: '窃盗既遂の後に、強盗の犯意で暴行・脅迫を行ったが、新たな財物奪取に失敗した場合の処理について説明しなさい。',
      answer: '強盗未遂説は、暴行・脅迫と因果性のない財物取得を既遂と認められないため、{{窃盗既遂は強盗未遂に吸収される}}と考える。一方、強盗既遂説は、一度物を取った直後に暴行・脅迫が加えられていることから、{{全体として強盗既遂と評価すべき}}であると考える。'
    },
    {
      id: 112,
      rank: 'A',
      question: '窃盗と暴行との間にどの程度の関連性があれば、事後強盗罪（【刑法238条】）の成立を認めてよいかについて説明しなさい。',
      answer: '窃盗と暴行・脅迫が密接に結び付いていなければ、強盗罪と実質的に同視するための基礎が欠ける。そこで、明文はないものの、暴行・脅迫は、{{窃盗の機会になされる必要}}がある。窃盗の機会に当たるか否かは、時間的・場所的接着性などを基礎に、{{窃盗犯人に対する追及が継続していたか否か（追及可能性）}}で決すべきである。'
    },
    {
      id: 113,
      rank: 'B',
      question: '事後強盗罪（【刑法238条】）に予備罪が成立するかについて説明しなさい。',
      answer: '事後強盗は{{強盗をもって論ずるもの}}であり（【刑法238条】）、強盗罪には予備処罰規定がある（【刑法237条】）から、{{成立する}}。'
    },
    {
      id: 114,
      rank: 'B',
      question: '窃盗犯人たる甲が、被害者Aから財物を取り戻されそうになったため、これを防ごうとして、たまたまそこを通りかかった乙に事情を話し、事情を了解した乙と共同してAに暴行を加えたという事例において、乙に事後強盗罪（【刑法238条】）の共同正犯（【刑法60条】）が成立するかについて説明しなさい。',
      answer: '事後強盗罪は、{{窃盗犯人という身分}}があってはじめて行為主体となり、犯罪を構成することができるのであるから、{{真正身分犯}}にほかならない。よって、【刑法65条1項】により、事後強盗罪の共同正犯の罪責を負う。'
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    {
      type: 'scene',
      text: '放課後の教室'
    },
    {
      type: 'narration',
      text: 'みかんがスマホを見ながら、驚きの声を上げる。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'surprised',
      dialogue: 'うわっ、大変！駅前の本屋さんで万引きした人が、店員さんに捕まりそうになって、すごい暴れたんだって！'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'thinking',
      dialogue: 'あー、そのパターンか。それって、ただの万引き（窃盗）と暴行じゃなくて、「事後強盗罪」っていう、もっと重い罪になるかもしれないね。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: 'じごうごうとう？強盗って、最初から脅してお金を奪うイメージだけど…。'
    },
    {
      type: 'dialogue',
      speaker: 'しみちゃん',
      expression: 'cool',
      dialogue: '【刑法238条】だね。窃盗犯が、盗んだ物を取り返されるのを防いだり、逮捕から逃れたりするために暴行や脅迫をすると、窃盗が強盗にクラスチェンジする、っていう規定。【id:105】'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'impressed',
      dialogue: 'クラスチェンジ！？じゃあ、万引きが失敗して、何も盗れてなくても、暴れたら強盗になっちゃうの？'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'normal',
      dialogue: 'その通り！事後強盗罪のベースになる「窃盗」は、未遂でも既遂でも関係ないんだよ。【id:106】'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: 'へぇー！じゃあ、その「暴行」っていうのは、普通の強盗と同じくらい激しいものじゃなきゃダメなの？'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'normal',
      dialogue: 'そうだよ。「強盗として論ずる」って書いてあるから、やっぱり「相手の反抗を抑圧する程度」の強さが必要になるんだ。【id:107】'
    },
    {
      type: 'dialogue',
      speaker: 'しみちゃん',
      expression: 'cool',
      dialogue: '面白いのは、暴行する相手は、万引きされた店員さん本人じゃなくてもいいってこと。例えば、たまたま犯人を追いかけてた通行人に暴力をふるっても成立する。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: '窃盗から事後強盗罪へのクラスチェンジ・フロー',
      description: '窃盗がどのような場合に事後強盗罪に変化するのか、その流れを見てみよう。',
      content: `graph TD
    A(窃盗行為<br/>- 既遂・未遂を問わず -) --> B{目的は？};
    B --"財物を取り返されるのを防ぐ<br/>逮捕を免れる<br/>罪跡を隠滅する"--> C{暴行・脅迫をしたか？};
    B --"上記目的以外"--> F[窃盗罪と暴行罪などを別途検討];
    C -->|はい| D{暴行・脅迫の程度は？};
    C -->|いいえ| F;
    D --"反抗を抑圧する程度"--> E{窃盗の機会か？};
    D --"反抗を抑圧するに至らない"--> F;
    E --"追跡が継続しているなど<br/>密接な関連性あり"--> G[✅ 事後強盗罪 成立];
    E --"追跡が止むなど<br/>関連性なし"--> F;

    classDef start fill:#fce8e6,stroke:#d93025,stroke-width:2px;
    classDef decision fill:#e8f0fe,stroke:#1a73e8,stroke-width:2px;
    classDef end_ok fill:#e6f4ea,stroke:#1e8e3e,stroke-width:2px;
    classDef end_ng fill:#fef7e0,stroke:#f29900,stroke-width:2px;

    class A start;
    class B,C,D,E decision;
    class G end_ok;
    class F end_ng;`
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'impressed',
      dialogue: 'うわー、この図、すごく分かりやすい！じゃあ、「窃盗の機会」っていうのが大事なんだね。【id:112】'
    },
    {
      type: 'dialogue',
      speaker: 'しみちゃん',
      expression: 'cool',
      dialogue: 'そう。万引きして、家に帰って、翌日になってから店員を見つけて暴れても、それは事後強盗にはならない。窃盗と暴行の間に、時間的・場所的な近さとか、追跡が続いてるっていう関連性が必要なんだ。'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'thinking',
      dialogue: 'ここで難しい問題。万引き犯が逃げる途中で、友達に「助けて！」って頼んだとする。で、事情を知ったその友達が、一緒に店員さんに暴力をふるったら、その友達はどうなると思う？'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: 'えー、友達は万引きしてないから、ただの暴行罪じゃないの…？'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'happy',
      dialogue: 'いいところに気づいたね！事後強盗罪は「窃盗犯」っていう特別な身分が必要な犯罪（真正身分犯）なんだけど、【刑法65条1項】っていうルールがあって、身分がない人でも、事情を知って加担したら同じ罪になるんだよ。【id:114】'
    },
    {
      type: 'dialogue',
      speaker: 'しみちゃん',
      expression: 'cool',
      dialogue: 'つまり、その友達も事後強盗の共同正犯になる。共犯のルールは複雑だけど、重要なポイントだね。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'desperate',
      dialogue: 'ひえー、友達を助けるつもりが、自分も強盗犯になっちゃうなんて…。法律って本当に知らないと怖いね…。'
    },
    {
      type: 'scene',
      text: 'タチバナ家・リビング'
    },
    {
      type: 'narration',
      text: '家に帰ったみかんが、夕食を食べながら今日学んだことを家族に話している。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'excited',
      dialogue: '聞いて聞いて！事後強盗罪って、万引きが成功したか失敗したかで、既遂か未遂かが決まるんだって！すごくない？【id:109】'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'annoyed',
      dialogue: 'まあ、強盗として論じるんだから、財産が取れたかどうかで決まるのは当たり前じゃない…。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'smug',
      dialogue: 'ふふん、ユズは分かってないなー。じゃあ、ポケットに商品入れた瞬間は窃盗既遂だけど、まだ店の敷地内で店員に捕まりそうになって、そこで暴れて商品を確保した場合、これは事後強盗になるでしょうか？'
    },
    {
      type: 'dialogue',
      speaker: 'ユズヒコ',
      expression: 'serious',
      dialogue: 'それは…占有の確保がまだ終わってない段階での暴行だから、一連の行為が財物奪取の手段と評価されて、事後強盗じゃなくて、最初から普通の強盗罪（1項強盗）になるんじゃないの。【id:110】'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'surprised',
      dialogue: 'えっ…！そ、そうなの！？'
    },
    {
      type: 'dialogue',
      speaker: '母',
      expression: 'angry',
      dialogue: 'ごはん中に万引きだの強盗だの！縁起でもないこと言わないでちょうだいっ！'
    },
    {
      type: 'dialogue',
      speaker: '父',
      expression: 'normal',
      dialogue: 'はっは…。'
    },
    {
      type: 'narration',
      text: 'みかんの法律談義は、今回もまた母によって遮られるのであった。'
    }
  ],
  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">【刑法238条】事後強盗罪の要点解説</h3>
    <p class="mb-4">
      事後強盗罪は、窃盗犯が犯行後に特定の目的で暴行・脅迫に及んだ場合に、その罪質を「強盗」へと格上げする規定です。窃盗という財産犯が、事後的な暴力行為によって人の身体の安全を脅かす危険な犯罪へと変貌する点に着目し、重く処罰する趣旨があります。
    </p>

    <h4 class="text-lg font-bold mt-6 mb-2">事後強盗罪の成立要件</h4>
    <p class="mb-4">
      本罪の成立には、以下の要素がすべて必要です。
    </p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><strong>主体</strong>: 行為者は「窃盗」である必要があります。この窃盗は、盗み遂げた<span class="text-red-600 font-bold">既遂犯だけでなく、未遂犯も含まれます</span>【id:106】。</li>
      <li><strong>目的</strong>: 暴行・脅迫は、①盗んだ財物を取り返されるのを防ぐ、②逮捕を免れる、③犯罪の証拠を隠滅する、という３つのいずれかの目的で行われなければなりません【id:105】。</li>
      <li><strong>行為</strong>: 「暴行又は脅迫」が必要です。この程度は、通常の強盗罪と同様、<span class="text-red-600 font-bold">相手方の反抗を抑圧するに足りるもの</span>でなければならないと解されています【id:107】。</li>
      <li><strong>機会</strong>: 上記の暴行・脅迫は、<span class="text-red-600 font-bold">「窃盗の機会」</span>に行われる必要があります。判例は、窃盗行為との時間的・場所的な接着性や、犯人に対する追跡が継続しているか否かといった観点から、両者の密接な関連性を要求しています【id:112】。</li>
    </ul>

    <h4 class="text-lg font-bold mt-6 mb-2">通常の強盗罪（1項強盗）との区別</h4>
    <p class="mb-4">
      事後強盗罪と、最初から暴行・脅迫で財物を奪う通常の強盗罪との区別は、特に窃盗行為と暴行・脅迫行為が連続している場合に問題となります。
    </p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li>判例は、財物の占有を完全に確保する前に、つまり<span class="text-red-600 font-bold">占有の取得がまだ未完成な段階</span>で、財物を確保するために暴行・脅迫に及んだ場合、それは一連の財物奪取行為と評価できるとして、事後強盗罪ではなく<span class="text-red-600 font-bold">通常の強盗罪（【刑法236条1項】）が成立する</span>としています【id:110】。例えば、商品をポケットに入れた直後に店内で店員に捕まりそうになり、突き飛ばして逃走するようなケースがこれに当たります。</li>
    </ul>

    <h4 class="text-lg font-bold mt-6 mb-2">既遂・未遂と共犯関係</h4>
    <p class="mb-4">
      事後強盗罪の特殊性から、既遂・未遂の判断や共犯の成立に関しても特有の解釈がなされています。
    </p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><strong>既遂・未遂</strong>: 事後強盗罪の既遂・未遂は、暴行・脅迫行為の結果によって決まるのではなく、その前提となる<span class="text-red-600 font-bold">窃盗行為が既遂であったか未遂であったかによって判断</span>されます【id:109】。つまり、何も盗めていなければ、いくら激しく暴れても事後強盗「未遂」罪となります。</li>
      <li><strong>共犯</strong>: 本罪は「窃盗」という身分を持つ者のみが主体となりうる<span class="text-red-600 font-bold">「真正身分犯」</span>と解されています。しかし、身分を持たない者（窃盗をしていない者）であっても、事情を知りながら窃盗犯の暴行・脅迫に加担した場合、【刑法65条1項】の規定により、<span class="text-red-600 font-bold">事後強盗罪の共同正犯</span>として処罰されうるとするのが判例です【id:114】。</li>
    </ul>

    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験ポイント</h5>
      <p class="mt-2">
        事後強盗罪は、通常の強盗罪との区別、特に「窃盗の機会」の判断が最大の論点です。時間的・場所的接着性や追跡の継続性といった具体的な事実を的確に拾い上げ、窃盗と暴行・脅迫の関連性を論理的に説明できるかが問われます。また、1項強盗罪との使い分け（占有確保前の暴行・脅迫）も重要です。択一式では、既遂・未遂の基準（窃盗が基準）や共犯の成立（真正身分犯と【刑法65条1項】）といった知識が頻出です。条文と判例の立場を正確に押さえておきましょう。
      </p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "事後強盗罪に関する事例問題",
      rank: "S",
      background: `
みかんは、ある日の放課後、コンビニで好きなアイドルの限定グッズが残り1点であるのを発見した。しかし、手持ちのお金が足りなかったため、みかんは一瞬の迷いの後、そのグッズをカバンに隠して店の外に出た（窃盗既遂）。店を出て50メートルほど歩いたところで、店長の宮嶋先生が「そこのキミ、待ちなさい！」と大声で叫びながら追いかけてきた。驚いたみかんは全力で逃走したが、角を曲がったところで、たまたま通りかかった親友のしみちゃんにばったり会った。みかんは「助けて！万引きしちゃった！」と事情を話した。事情を理解したしみちゃんは、追いついてきた宮嶋先生の前に立ちはだかり、みかんを逃がすために宮嶋先生を強く突き飛ばして転倒させた。
      `,
      subProblems: [
        {
          title: "みかんとしみちゃんの刑事責任",
          rank: "S",
          relatedQAs: [105, 106, 107, 109, 112, 114],
          problem: "本事例における、みかんとしみちゃんの刑事責任について、事後強盗罪の成否を中心に論じなさい。",
          hint: "まず、みかんの行為が事後強盗罪の構成要件を満たすかを検討します。特に、しみちゃんの暴行をみかん自身の行為と評価できるかがポイントです。次に、窃盗をしていないしみちゃんに事後強盗罪が成立するかを、共犯の理論、特に【刑法65条】との関係で論じてください。",
          points: [
            "事後強盗罪の構成要件（主体・目的・行為・機会）【id:105】【id:112】",
            "暴行の程度の判断【id:107】",
            "窃盗犯自身の暴行ではない場合の処理（共謀共同正犯）",
            "窃盗の既遂・未遂による罪の区別【id:109】",
            "非身分者（しみちゃん）への事後強盗罪の共同正犯の成否（真正身分犯と【刑法65条1項】）【id:114】"
          ],
          modelAnswer: `
１．みかんの刑事責任
(1) みかんはコンビニでグッズを窃取しており、窃盗既遂罪が成立する。問題は、事後強盗罪（【刑法238条】）が成立するかである。
(2) 事後強盗罪は、①窃盗が、②財物の取り返しを防ぎ、逮捕を免れ、又は罪跡を隠滅する目的で、③暴行・脅迫をした場合に成立する【id:105】。
(3) 本件で暴行を行ったのはしみちゃんであり、窃盗犯であるみかん自身ではない。しかし、みかんはしみちゃんに助けを求め、しみちゃんは事情を理解した上で暴行に及んでおり、両者には共謀とそれに基づく実行行為が認められるため、みかんにも共同正犯（【刑法60条】）としてしみちゃんの暴行の責任を問える。
(4) しみちゃんの暴行は、宮嶋先生を転倒させる程度の強度のものであり、反抗を抑圧するに足りる「暴行」と評価できる【id:107】。
(5) また、この暴行は、店長の宮嶋先生による追跡が継続している「窃盗の機会」になされており【id:112】、みかんの「逮捕を免れる」目的で行われている。
(6) したがって、みかんには事後強盗罪の共同正犯が成立する。そして、窃盗は既遂であるため、事後強盗既遂罪となる【id:109】。

２．しみちゃんの刑事責任
(1) しみちゃんは、みかんと共謀の上、宮嶋先生に暴行を加えているため、事後強盗罪の共同正犯が成立しないかが問題となる。
(2) 事後強盗罪の主体は「窃盗」であり、窃盗犯人という身分が構成要件となっている真正身分犯と解される【id:114】。しみちゃんは窃盗を行っておらず、この身分を有しない。
(3) しかし、【刑法65条1項】は「犯人の身分によって構成すべき犯罪行為に加功したときは、身分のない者であっても、共犯とする」と規定する。本条により、しみちゃんのような非身分者も、身分者であるみかんの犯罪に加功した場合、共同正犯となりうる。
(4) 本件で、しみちゃんはみかんから「万引きしちゃった！」と聞き、事情を認識した上で、逮捕を免れさせる目的で暴行に及んでいる。したがって、みかんとの共謀に基づき、事後強盗罪の共同正犯としての責任を負う。
(5) よって、しみちゃんには事後強盗既遂罪の共同正犯が成立する。
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
