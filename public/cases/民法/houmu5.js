export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "minpou-kyoudou-fuhoukoi-iryou",
  title: "【民法・不法行為】共同不法行為と医療過誤の競合",
  category: "minpou",
  citation: "最判平成13.3.13（交通事故と医療事故の競合）",
  rank: "S",
  tags: ["民法", "不法行為", "共同不法行為", "医療過誤", "因果関係"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `【共同不法行為の基本構造】\n- **狭義の共同不法行為（【民法719条1項前段】）**: 客観的関連共同性による連帯責任【id:1】\n- **加害者不明の共同不法行為（【民法719条1項後段】）**: 因果関係の擬制【id:2】\n- **教唆・幇助（【民法719条2項】）**: 主観的共同関係の一類型【id:3】\n\n【異時的競合の特殊問題】\n- **交通事故と医療過誤の競合**: 異質の不法行為が時間差で発生【id:4】\n- **不可分一個の結果**: 複数の原因が同一の損害を招来【id:5】\n- **相当因果関係**: 各行為と最終結果との因果関係【id:6】\n\n【過失相殺の処理】\n- **相対的過失相殺**: 各加害者と被害者間の過失割合で処理【id:7】\n- **絶対的過失相殺**: 全当事者の過失を総合的に評価【id:8】\n\n【医療過誤の特殊性】\n- **救命可能性**: 適切な医療が行われていれば救命できた蓋然性【id:9】\n- **因果関係の立証**: 高度の蓋然性（80%程度）の証明が必要【id:10】\n- **生存可能性の保護**: 相当程度の可能性自体を法益として保護【id:11】`,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '【民法719条1項前段】の狭義の共同不法行為の成立要件を述べなさい。', 
      answer: '要件は以下の通り。①{{複数の行為者の存在}}、②{{各行為者に故意・過失があること}}、③{{客観的関連共同性}}（主観的連絡は不要）、④{{同一の損害の発生}}、⑤{{各行為と損害との相当因果関係}}。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '交通事故と医療事故の競合における共同不法行為の成立根拠を説明しなさい。', 
      answer: '最判平成13.3.13は、{{交通事故と医療事故のいずれもが死亡という不可分の一個の結果を招来}}し、{{この結果について相当因果関係を有する関係}}にあるとして【民法719条】の適用を認めた。異時的・異質的な不法行為でも{{同一損害への寄与}}があれば共同不法行為となる。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: '共同不法行為における過失相殺の処理方法を説明しなさい。', 
      answer: '{{加害者及び侵害行為を異にする二つの不法行為が順次競合した共同不法行為}}では{{相対的過失相殺}}を行う。各不法行為の加害者と被害者との間の{{過失の割合に応じて}}過失相殺し、{{他の不法行為者と被害者との間における過失の割合をしん酌することは許されない}}。' 
    },
    { 
      id: 4, 
      rank: 'S', 
      question: '医療過誤における因果関係の立証について説明しなさい。', 
      answer: '因果関係の立証は{{自然科学的証明ではなく、経験則に照らして全証拠を総合検討}}し、{{特定の事実が特定の結果発生を招来した関係を是認し得る高度の蓋然性}}（約80%程度）の証明で足りる。{{通常人が疑いを差し挟まない程度に真実性の確信を持ち得るもの}}であることが必要。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '生存可能性の法的保護について説明しなさい。', 
      answer: '最判平成12.9.22は、医療水準にかなった医療が行われていたならば{{患者がその死亡の時点においてなお生存していた相当程度の可能性の存在}}が証明されるときは損害賠償義務が発生するとした。{{生命を維持することは人にとって最も基本的な利益}}であり、{{右の可能性は法によって保護されるべき利益}}である。' 
    },
    { 
      id: 6, 
      rank: 'B', 
      question: '共同不法行為の効果について説明しなさい。', 
      answer: '効果は{{連帯債務}}となる。①対外的関係：債権者は{{各債務者に対して全部の給付の履行請求}}ができる、②求償関係：弁済した連帯債務者は{{各自の負担部分に応じた求償}}ができる、③影響関係：{{弁済、更改、相殺、混同}}は絶対的効力事由として他の債務者にも影響する。' 
    },
    { 
      id: 7, 
      rank: 'B', 
      question: '寄与度減責について説明しなさい。', 
      answer: '有力説は関連共同性の程度に応じて責任内容を変える。①{{強い関連共同}}（意思的共同不法行為）：連帯責任で寄与度減責なし、②{{弱い関連共同}}（関連的共同不法行為）：連帯責任だが立証できれば寄与度減責あり、③{{独立型}}（競合的不法行為）：寄与度に応じた責任。' 
    },
    { 
      id: 8, 
      rank: 'A', 
      question: '不作為不法行為における因果関係について説明しなさい。', 
      answer: '最判平成11.2.25は、{{医師が注意義務を尽くして診療行為を行っていたならば患者がその死亡の時点においてなお生存していたであろうことを是認し得る高度の蓋然性}}が証明されれば因果関係を肯定するとした。{{患者が右時点の後いかほどの期間生存し得たかは、主に得べかりし利益その他の損害の額の算定に当たって考慮されるべき事由}}である。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'みかんの高校・放課後の図書館。静寂に包まれた学習スペースで、ゆかりんが民事訴訟法の教科書を広げている' },
    { type: 'narration', text: '司法試験予備試験の勉強に励むゆかりんの前に、同じく法律を学ぶみかんが現れた' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'ゆかりん、こんなところにいたのね。難しそうな本読んでるけど…' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'normal', dialogue: 'あ、みかん。民事訴訟法の共同訴訟の勉強をしてたの。でも、実体法の共同不法行為との関係で分からないことがあってね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '共同不法行為かあ…確か【民法719条】の話よね【id:1】。私も最近、複雑な事例に出会ったの' },
    { type: 'narration', text: 'そこへ、刑事訴訟法が得意なしみちゃんが図書館に入ってきた' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'あら、二人とも勉強熱心ね。何の話？' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'confused', dialogue: 'しみちゃん、ちょうど良かった。交通事故の後に医療ミスが重なって患者さんが亡くなった場合の責任関係なんだけど…' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '興味深い問題ね。異なる時点で異なる原因が重なった場合の処理よね' },
    { type: 'narration', text: 'みかんは具体的な事例を思い出しながら説明を始めた' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: '実は、こんな事案があったの。朝早く、岩城くんのお父さんが同僚の車で駅に向かう途中だったのよ' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'interested', dialogue: '岩城くんのお父さんが？それは心配ね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'sad', dialogue: '交差点で、無灯火で停車していた車を避けようとして、別の車と衝突してしまったの。岩城くんのお父さんはフロントガラスに頭を打って…' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'thinking', dialogue: 'それで病院に運ばれたのね。でも医療ミスがあったということ？' },
    { type: 'dialogue', speaker: 'みかん', expression: 'serious', dialogue: 'そうなの。病院では頭部打撲だけと診断されて、CTスキャンもせずに帰宅させられたの。でも実際は脳出血を起こしていて…' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'shocked', dialogue: 'それは大変！適切な検査をしていれば助かったかもしれないのに' },
    
    { type: 'embed', format: 'mermaid', title: '事案の時系列整理', description: '交通事故から医療事故までの流れ', content: 'graph LR\n    A[交通事故発生] --> B[病院搬送]\n    B --> C[診察・帰宅]\n    C --> D[容態悪化]\n    D --> E[再搬送]\n    E --> F[死亡確認]\n    \n    G[適切な医療] --> H[救命可能]\n    C -.-> G\n    G -.-> H' },
    
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'analytical', dialogue: 'なるほど。この場合、交通事故の加害者と医師の両方に責任があるかもしれないけど、どう処理するかが問題ね' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'thinking', dialogue: '普通に考えると、交通事故と医療事故は時間も場所も違うから、別々の不法行為として扱いそうだけど…' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'でも、最終的に亡くなったのは一つの結果よね。これって共同不法行為になるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: '鋭い指摘ね。実は最高裁判例があるのよ。平成13年3月13日の判決【id:2】' },
    { type: 'narration', text: 'しみちゃんは手持ちの判例集を開きながら説明を続けた' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '最高裁は「交通事故と医療事故とのいずれもが、死亡という不可分の一個の結果を招来し、この結果について相当因果関係を有する関係にある」として【民法719条】の共同不法行為を認めたの' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'surprised', dialogue: 'えっ、異時的で異質的な不法行為でも共同不法行為になるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'そうよ。ポイントは「同一の損害」に対する寄与があることね。交通事故で致命傷を負い、医療ミスで救命機会を失った場合、両方が死亡という結果に寄与している' },
    
    { type: 'embed', format: 'mermaid', title: '共同不法行為の成立要件', description: '異時的競合における判断構造', content: 'graph TD\n    A[複数の不法行為] --> B{同一損害への寄与}\n    B -->|あり| C[相当因果関係の検討]\n    B -->|なし| D[個別の不法行為]\n    C --> E{各行為と損害の因果関係}\n    E -->|あり| F[共同不法行為成立]\n    E -->|なし| G[因果関係なし]\n    F --> H[連帯責任]' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'でも、過失相殺はどうなるの？交通事故の被害者にも過失があったとしたら…' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'analytical', dialogue: 'それも複雑な問題ね。交通事故の加害者、医師、被害者の三者の過失をどう処理するか' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '最高裁は「相対的過失相殺」を採用したの。つまり、各不法行為の加害者と被害者との間の過失の割合に応じて過失相殺する【id:3】' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'confused', dialogue: '相対的？絶対的過失相殺じゃないの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '交通事故同士なら絶対的過失相殺だけど、この事案は「加害者及び侵害行為を異にする二つの不法行為が順次競合した共同不法行為」だから相対的処理なの' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'なるほど！同じ共同不法行為でも、事故の性質によって過失相殺の方法が変わるのね' },
    
    { type: 'embed', format: 'html', title: '過失相殺の処理方法比較', description: '相対的過失相殺と絶対的過失相殺の違い', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;"><thead><tr style="background: #4a90e2; color: white;"><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">処理方法</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">適用場面</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">計算方法</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">根拠</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">相対的過失相殺</td><td style="padding: 10px; border: 1px solid #ddd;">異質的不法行為の競合<br>（交通事故＋医療事故）</td><td style="padding: 10px; border: 1px solid #ddd;">各加害者と被害者間の<br>過失割合で個別計算</td><td style="padding: 10px; border: 1px solid #ddd;">最判平13.3.13</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">絶対的過失相殺</td><td style="padding: 10px; border: 1px solid #ddd;">同質的不法行為の競合<br>（交通事故＋交通事故）</td><td style="padding: 10px; border: 1px solid #ddd;">全当事者の過失を<br>総合して一律計算</td><td style="padding: 10px; border: 1px solid #ddd;">最判平15.7.11</td></tr></tbody></table><div style="margin-top: 12px; padding: 12px; background: #fff3cd; border-radius: 4px; font-size: 11px; border-left: 4px solid #ffc107;"><strong>注意点：</strong>同じ共同不法行為でも、不法行為の性質により過失相殺の処理方法が異なる</div></div>' },
    
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'thinking', dialogue: 'ところで、医療過誤の場合の因果関係の立証って難しそうだけど…' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: 'そうね。特に「適切な医療を行っていれば救命できた」という因果関係の証明が問題になる' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '100%確実じゃないと因果関係は認められないの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'いいえ。最高裁は「高度の蓋然性」があれば十分としている【id:4】。大体80%程度の確からしさがあればいいのよ' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'interested', dialogue: 'でも、もし救命可能性が低い場合はどうなるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'analytical', dialogue: 'それも重要な論点ね。平成12年の最高裁判決では、救命可能性が20%以下でも「相当程度の可能性」自体を法益として保護したの【id:5】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: '可能性自体が保護される？どういうこと？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '「生命を維持することは人にとって最も基本的な利益」だから、たとえ救命可能性が低くても、その可能性を奪われたこと自体が損害になるという考え方よ' },
    
    { type: 'embed', format: 'mermaid', title: '医療過誤における因果関係と損害', description: '救命可能性に応じた法的保護の内容', content: 'graph TD\n    A[医療過誤] --> B{救命可能性}\n    B -->|高度の蓋然性あり<br>（約80%以上）| C[完全な因果関係]\n    B -->|相当程度の可能性<br>（20%程度以下）| D[可能性の侵害]\n    C --> E[死亡による全損害]\n    D --> F[精神的損害（慰謝料）]\n    \n    G[適切な医療] -.-> H[救命・延命]\n    A -.-> G' },
    
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'impressed', dialogue: 'なるほど。救命可能性が高い場合は死亡による全損害、低い場合は可能性侵害による慰謝料ということね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'でも実際の事案では、交通事故の加害者と医師の責任をどう分けるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '共同不法行為だから、対外的には連帯責任よ。被害者はどちらからでも全額請求できる' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'analytical', dialogue: 'でも内部的には、それぞれの過失割合に応じて負担することになるのね' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: 'そう。例えば、交通事故の加害者が8割、医師が2割の過失なら、一方が全額支払った場合、相手方にその割合で求償できる' },
    { type: 'dialogue', speaker: 'みかん', expression: 'normal', dialogue: 'それにしても、被害者の立場からすると、連帯責任の方が救済されやすいわね' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'normal', dialogue: 'そうね。一方が無資力でも、もう一方から全額回収できるから' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: 'それが【民法719条】の被害者保護の趣旨なのよ。複数の加害者がいる場合の救済を厚くするという' },
    
    { type: 'embed', format: 'html', title: '共同不法行為の効果まとめ', description: '対外関係と内部関係の整理', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;"><thead><tr style="background: #28a745; color: white;"><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">関係</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">内容</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">根拠条文</th><th style="padding: 12px; border: 1px solid #ddd; font-size: 12px;">効果</th></tr></thead><tbody><tr><td style="padding: 10px; border: 1px solid #ddd; background: #d4edda; font-weight: bold;">対外的関係</td><td style="padding: 10px; border: 1px solid #ddd;">被害者vs加害者たち</td><td style="padding: 10px; border: 1px solid #ddd;">【民法436条】</td><td style="padding: 10px; border: 1px solid #ddd;">各加害者に全額請求可能<br>（連帯債務）</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #d4edda; font-weight: bold;">内部的関係</td><td style="padding: 10px; border: 1px solid #ddd;">加害者同士の求償</td><td style="padding: 10px; border: 1px solid #ddd;">【民法442条】</td><td style="padding: 10px; border: 1px solid #ddd;">過失割合に応じた<br>負担部分での求償</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd; background: #d4edda; font-weight: bold;">影響関係</td><td style="padding: 10px; border: 1px solid #ddd;">一方の事由の他方への影響</td><td style="padding: 10px; border: 1px solid #ddd;">【民法438条】等</td><td style="padding: 10px; border: 1px solid #ddd;">弁済・相殺等は絶対効<br>その他は相対効</td></tr></tbody></table><div style="margin-top: 12px; padding: 12px; background: #d1ecf1; border-radius: 4px; font-size: 11px; border-left: 4px solid #17a2b8;"><strong>被害者保護の観点：</strong>複数加害者の存在により被害者の救済が困難になることを防ぐため、連帯責任を課している</div></div>' },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'ところで、有力説では寄与度減責という考え方もあるって聞いたことがあるけど…' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'analytical', dialogue: 'いい質問ね。学説では、関連共同性の程度に応じて責任の内容を変えるべきという考え方があるの【id:7】' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'interested', dialogue: 'どういう分類になるの？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'serious', dialogue: '強い関連共同の場合は連帯責任で寄与度減責なし、弱い関連共同なら連帯責任だけど寄与度減責あり、独立型なら寄与度に応じた責任という具合に' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'でも最高裁は連帯責任を認めたのよね？' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: 'そうよ。最高裁は「不可分一個の結果」を重視して、従来の【民法719条】の枠組みで処理したの' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'thinking', dialogue: 'つまり、異時的・異質的でも、同一損害への寄与があれば共同不法行為として扱うということね' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'impressed', dialogue: 'その通り。被害者保護を重視した判断と言えるわね' },
    { type: 'narration', text: '三人は図書館の閉館時間が近づく中、複雑な法理論について理解を深めていった' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'おかげで共同不法行為の複雑な問題がよく分かったわ。司法試験でも重要な論点よね' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'normal', dialogue: 'そうね。特に医療過誤との競合は実務でも重要だから、しっかり押さえておかないと' },
    { type: 'dialogue', speaker: 'しみちゃん', expression: 'normal', dialogue: '因果関係の立証や過失相殺の処理も含めて、総合的に理解することが大切ね' },
    { type: 'dialogue', speaker: 'みかん', expression: 'determined', dialogue: 'よし、今度は実際の論文問題で練習してみましょう！' },
    { type: 'narration', text: 'こうして三人は、共同不法行為の奥深い世界について理解を深め、さらなる学習への意欲を新たにするのだった' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">【民法719条】共同不法行為と医療過誤の競合</h3>
    <p class="mb-4">本判例は、交通事故による受傷後の医療過誤により患者が死亡した事案において、異時的・異質的な不法行為間での<span class="text-red-600 font-bold">共同不法行為の成立</span>を認めた重要判例です。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">事案の概要</h4>
    <p class="mb-4">交通事故により頭部を負傷した被害者が病院に搬送されたが、医師が適切な検査・治療を怠ったため、救命可能であったにもかかわらず死亡に至った事案です。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">最高裁の判断</h4>
    <div class="bg-blue-50 p-4 rounded-lg mb-4">
      <p class="font-bold text-blue-800 mb-2">判旨（最判平成13.3.13）</p>
      <p class="text-sm">"本件交通事故と本件医療事故とのいずれもが、Ａの死亡という<span class="text-red-600 font-bold">不可分の一個の結果を招来</span>し、この結果について<span class="text-red-600 font-bold">相当因果関係を有する関係</span>にある。したがって、本件交通事故における運転行為と本件医療事故における医療行為とは<span class="text-red-600 font-bold">【民法719条】所定の共同不法行為</span>に当たるから、各不法行為者は被害者の被った損害の全額について連帯して責任を負うべきものである。"</p>
    </div>
    
    <h4 class="text-lg font-bold mt-6 mb-2">判例の意義</h4>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">異時的競合の処理</span>：時間的に離れた異質の不法行為でも共同不法行為となりうる</li>
      <li><span class="text-red-600 font-bold">同一損害への寄与</span>：各行為が同一の最終損害に寄与していることが重要</li>
      <li><span class="text-red-600 font-bold">被害者保護の強化</span>：連帯責任により被害者の救済を厚くする</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">過失相殺の処理</h4>
    <div class="bg-yellow-50 p-4 rounded-lg mb-4">
      <p class="font-bold text-yellow-800 mb-2">相対的過失相殺の採用</p>
      <p class="text-sm">"過失相殺は不法行為により生じた損害について加害者と被害者との間においてそれぞれの過失の割合を基準にして相対的な負担の公平を図る制度であるから、本件のような共同不法行為においても、<span class="text-red-600 font-bold">過失相殺は各不法行為の加害者と被害者との間の過失の割合に応じてすべき</span>ものであり、他の不法行為者と被害者との間における過失の割合をしん酌して過失相殺をすることは許されない。"</p>
    </div>
    
    <h4 class="text-lg font-bold mt-6 mb-2">医療過誤における因果関係</h4>
    <p class="mb-4">医療過誤事案では、<span class="text-red-600 font-bold">「適切な医療を行っていれば救命できた」という因果関係の立証</span>が重要です。</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">高度の蓋然性</span>：約80%程度の確からしさで足りる（最判昭50.10.24）</li>
      <li><span class="text-red-600 font-bold">生存可能性の保護</span>：相当程度の可能性自体も法益として保護（最判平12.9.22）</li>
      <li><span class="text-red-600 font-bold">立証の軽減</span>：自然科学的証明ではなく、経験則による総合判断</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">学説の対立</h4>
    <div class="bg-gray-50 p-4 rounded-lg mb-4">
      <h5 class="font-bold text-gray-800 mb-2">寄与度減責論</h5>
      <p class="text-sm mb-2">有力説は、関連共同性の程度に応じて責任内容を変えるべきとする：</p>
      <ul class="text-sm list-disc list-inside pl-4 space-y-1">
        <li><span class="font-bold">強い関連共同</span>：連帯責任（寄与度減責なし）</li>
        <li><span class="font-bold">弱い関連共同</span>：連帯責任（寄与度減責あり）</li>
        <li><span class="font-bold">独立型</span>：寄与度に応じた責任</li>
      </ul>
    </div>
    
    <div class="bg-green-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-green-800">司法試験ポイント</h5>
      <ul class="text-sm list-disc list-inside pl-4 space-y-1">
        <li>異時的・異質的不法行為でも「同一損害への寄与」があれば共同不法行為となる</li>
        <li>過失相殺は相対的処理（交通事故同士の場合は絶対的処理）</li>
        <li>医療過誤の因果関係は「高度の蓋然性」で足りる</li>
        <li>救命可能性が低くても「可能性の侵害」として保護される場合がある</li>
        <li>連帯責任の趣旨は被害者保護にある</li>
      </ul>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "交通事故と医療過誤の競合事案",
      rank: "S",
      background: `みかんは、友人のしみちゃんと一緒に自転車で帰宅途中、交差点で岩城の運転する自動車と衝突した。岩城は赤信号を見落として交差点に進入したものであり、一方、みかんも一時停止を怠っていた。みかんは頭部を強打し、救急車でゆかりんの父が院長を務める病院に搬送された。ゆかりんの父は、みかんに頭部打撲が見られるものの、レントゲン写真に異常がないとしてCTスキャン検査を行わず、経過観察の必要もないと判断して帰宅させた。しかし、みかんは帰宅後に容態が悪化し、再搬送されたが脳出血により死亡した。適切な検査・治療が行われていれば、みかんは高い確率で救命できたとされる。みかんの過失割合は2割、岩城の過失割合は6割、ゆかりんの父の医療過誤による過失割合は2割と認定された。`,
      subProblems: [
        {
          title: "設問1：共同不法行為の成否",
          rank: "S",
          relatedQAs: [1, 2],
          problem: "岩城の交通事故とゆかりんの父の医療過誤について、【民法719条】の共同不法行為が成立するか検討しなさい。",
          hint: "異時的・異質的な不法行為間での共同不法行為の成立要件を検討する。特に「同一損害への寄与」と「相当因果関係」がポイント。",
          points: [
            "【民法719条1項前段】の要件の検討",
            "異時的・異質的不法行為における共同不法行為の成立",
            "「不可分の一個の結果」の意義",
            "各行為と死亡との相当因果関係",
            "最判平成13.3.13の射程"
          ],
          modelAnswer: "1. 【民法719条1項前段】の共同不法行為の成立要件は、①複数の行為者の存在、②各行為者の故意・過失、③客観的関連共同性、④同一の損害の発生、⑤各行為と損害との相当因果関係である。2. 本件では、岩城の交通事故とゆかりんの父の医療過誤は時間的・場所的に異なる異質の不法行為であるが、最判平成13.3.13は、「交通事故と医療事故とのいずれもが、死亡という不可分の一個の結果を招来し、この結果について相当因果関係を有する関係にある」として共同不法行為の成立を認めている。3. 本件においても、交通事故により致命的な脳出血が生じ、医療過誤により救命機会が失われており、両者がみかんの死亡という同一の損害に寄与している。4. したがって、異時的・異質的な不法行為であっても、【民法719条】の共同不法行為が成立する。"
        },
        {
          title: "設問2：過失相殺の処理",
          rank: "A",
          relatedQAs: [3],
          problem: "みかんの遺族が岩城とゆかりんの父に対して損害賠償請求をする場合、過失相殺はどのように処理されるか検討しなさい。",
          hint: "相対的過失相殺と絶対的過失相殺の違いを理解し、本件事案の性質に応じた処理方法を検討する。",
          points: [
            "相対的過失相殺と絶対的過失相殺の区別",
            "異質的不法行為競合における過失相殺の処理",
            "最判平成13.3.13の判断",
            "各加害者に対する具体的な過失相殺率",
            "被害者保護の観点"
          ],
          modelAnswer: "1. 共同不法行為における過失相殺には、相対的過失相殺と絶対的過失相殺がある。2. 最判平成13.3.13は、「加害者及び侵害行為を異にする二つの不法行為が順次競合した共同不法行為」では相対的過失相殺を行うとしている。3. 相対的過失相殺では、「各不法行為の加害者と被害者との間の過失の割合に応じて」過失相殺し、「他の不法行為者と被害者との間における過失の割合をしん酌することは許されない」。4. 本件では、岩城に対してはみかん2割：岩城6割の割合で過失相殺（25%減額）、ゆかりんの父に対してはみかん2割：医師2割の割合で過失相殺（50%減額）となる。5. これは、異質的不法行為では各加害者と被害者の個別の関係で公平を図るべきという考慮による。"
        },
        {
          title: "設問3：医療過誤における因果関係",
          rank: "A",
          relatedQAs: [4, 5, 8],
          problem: "ゆかりんの父の医療過誤とみかんの死亡との間の因果関係について、仮に救命可能性が30%程度であった場合の法的評価を検討しなさい。",
          hint: "医療過誤における因果関係の立証基準と、救命可能性の程度に応じた法的保護の内容を検討する。",
          points: [
            "不作為不法行為における因果関係の立証",
            "「高度の蓋然性」の意義",
            "救命可能性30%の場合の評価",
            "「相当程度の可能性」の法益性",
            "損害の内容と範囲"
          ],
          modelAnswer: "1. 医療過誤における因果関係の立証は、「経験則に照らして全証拠を総合検討し、特定の事実が特定の結果発生を招来した関係を是認し得る高度の蓋然性を証明する」ことで足りる（最判昭50.10.24）。2. 「高度の蓋然性」は通常80%程度の確からしさを要するとされるため、救命可能性30%では通常の因果関係は認められない。3. しかし、最判平12.9.22は、「医療水準にかなった医療が行われていたならば患者がその死亡の時点においてなお生存していた相当程度の可能性の存在が証明されるとき」は損害賠償義務が発生するとした。4. 「生命を維持することは人にとって最も基本的な利益」であり、「右の可能性は法によって保護されるべき利益」である。5. したがって、救命可能性30%でも「相当程度の可能性」として保護され、その侵害による精神的損害（慰謝料）の賠償が認められる。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
