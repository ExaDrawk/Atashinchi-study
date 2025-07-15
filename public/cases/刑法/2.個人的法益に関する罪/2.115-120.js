export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "keihou-goutou-chishishou",
  title: "強盗致死傷罪",
  category: "keihou",
  citation: "ユズ、それって強盗殺人事件！？",
  rank: "S",
  tags: ["刑法", "財産犯", "強盗致死傷罪", "結果的加重犯", "刑法240条"],
  rightSideCharacters: ['ユズヒコ'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: '強盗致死傷罪は、【刑法240条】に規定される、強盗犯が人を死傷させた場合に成立する犯罪です。単純な強盗罪よりはるかに重い刑罰が科されます。\n\n【構成要件】\n「強盗が」、「人」を「負傷させた」または「死亡させた」ことです。【id:1】\n\n【「負傷」の範囲】\n傷害罪の「傷害」と同じと解されており、特に範囲が限定されることはありません（非限定説）。【id:2】\n\n【「強盗の機会」の解釈】\n死傷の結果が、強盗の手段である暴行・脅迫から直接発生した場合だけでなく、強盗の機会（犯行中、犯行前後を含む）に生じた場合も含まれます。ただし、強盗行為と無関係な死傷は含まれず、「密接な関連性」が必要です。【id:3】\n\n【故意がある場合】\n犯人が当初から殺意や傷害の故意を持っていた場合でも、本罪が成立します。【刑法240条】は結果的加重犯の性質だけでなく、故意犯も含む複合的な構成要件と解されています。【id:4】\n\n【未遂の成否】\n- **強盗殺人罪**: 被害者が死亡しなかった場合は未遂となります。【id:5】\n- **強盗致傷罪**: 未遂は成立しません。傷害の結果が発生しなかった場合（＝暴行に留まった場合）、その暴行は強盗罪の手段として既に評価されているため、強盗罪のみが成立します。【id:6】',

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    {
      id: 1,
      rank: 'A',
      question: '強盗致死傷罪（【刑法240条】）の構成要件について説明しなさい。',
      answer: '「{{強盗が}}」、「{{人}}」を「{{負傷させた}}」又は「{{死亡させた}}」ことである。'
    },
    {
      id: 2,
      rank: 'B',
      question: '強盗致傷罪（【刑法240条前段】）における「負傷」の範囲について説明しなさい。',
      answer: '傷害罪における「傷害」と{{別異に解する理由がない}}ので、{{限定はない}}（非限定説）。'
    },
    {
      id: 3,
      rank: 'A',
      question: '強盗致死傷罪（【刑法240条】）において、死傷結果が被害者の反抗を抑圧する手段としての暴行脅迫から直接生ずることを要するのかについて説明しなさい。',
      answer: '負傷の結果は{{直接生じたことを要せず}}、{{強盗の機会}}に生じたものであれば足りる。ただし、処罰範囲の適正化のため、{{強盗行為と密接な関連性}}をもつ場合に限定すべきである。'
    },
    {
      id: 4,
      rank: 'A',
      question: '強盗致死傷罪（【刑法240条】）において、死傷の結果について故意がある場合の処理について説明しなさい。',
      answer: '【刑法240条】は、強盗の機会に人の殺傷という結果が伴うことが刑事学的に顕著であることから特に構成要件化されたものである。また、【刑法240条】には「よって」という結果加重犯特有の文言が用いられていない。したがって、【刑法240条】は{{結果的加重犯と故意犯の複合形態}}と見ることができるから、{{強盗殺人（強盗傷人）}}となる。'
    },
    {
      id: 5,
      rank: 'B',
      question: '強盗殺人罪（【刑法240条後段】）の未遂・既遂の区別について説明しなさい。',
      answer: '【刑法240条】は、人の死という結果が生じた場合に特に厳罰に処するものであるから、{{人の死亡結果が生じたかどうか}}で決すべきである。'
    },
    {
      id: 6,
      rank: 'B',
      question: '強盗傷人罪（【刑法240条前段】）の未遂の成否について説明しなさい。',
      answer: '一般に傷害の未遂は暴行と評価されているところ、その暴行はもともと強盗の手段なのであるから、{{既に強盗罪の中で評価されている}}。したがって、強盗傷人罪の未遂は{{成立しない}}。'
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
      text: 'みかん、しみちゃん、ゆかりん、吉岡が教室に残り、談笑している。'
    },
    {
      type: 'dialogue',
      speaker: '吉岡',
      expression: 'surprised',
      dialogue: 'うわ、マジかよ…。また物騒な事件だな、これ見てみろよ。'
    },
    {
      type: 'narration',
      text: '吉岡がスマートフォンで見ていたニュース記事をみんなに見せる。そこには「コンビニ強盗、店員が負傷」という見出しが躍っていた。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'sad',
      dialogue: 'えー、こわい…。店員さん、大丈夫なのかな。'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'serious',
      dialogue: 'ただの強盗じゃなくて、人が怪我してるんだね…。こういう場合、すごく罪が重くなるんだよ。'
    },
    {
      type: 'dialogue',
      speaker: 'しみちゃん',
      expression: 'cool',
      dialogue: '強盗致傷罪だね。単なる強盗とは法的な扱いが全く違う。'
    },
    {
      type: 'dialogue',
      speaker: 'みかん',
      expression: 'thinking',
      dialogue: 'ごうとう…ちしょう…？ なにそれ、難しい言葉。'
    },
    {
      type: 'dialogue',
      speaker: 'ゆかりん',
      expression: 'normal',
      dialogue: '【刑法240条】に定められてる犯罪だよ。「強盗が、人を負傷させたときは無期又は六年以上の懲役に処し、死亡させたときは死刑又は無期懲役に処する」っていう条文。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: '強盗致死傷罪（刑法240条）の基本構造',
      description: '強盗に死傷結果が加わると、罪名と法定刑が大きく変わる。',
      content: `graph TD
        A[強盗行為<br/>暴行・脅迫による財物強取] --> B{人を死傷させた？}
        B -->|YES| C[強盗致死傷罪<br/>【刑法240条】]
        B -->|NO| D[強盗罪<br/>【刑法236条】]

        subgraph "法定刑の比較"
            C_刑[無期または6年以上の懲役<br/>(死亡時は死刑または無期)]
            D_刑[5年以上の有期懲役]
        end

        C --> C_刑
        D --> D_刑

        classDef crime fill:#ffebee,stroke:#c62828,stroke-width:2px;
        classDef normal fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
        class C crime;
        class D normal;
      `
    },
    {
        type: 'dialogue',
        speaker: '吉岡',
        expression: 'thinking',
        dialogue: '「負傷」ってどこからが「負傷」なんだ？例えば、犯人ともみ合って、ちょっと擦りむいただけでも「負傷」になるのか？'
    },
    {
        type: 'dialogue',
        speaker: 'ゆかりん',
        expression: 'normal',
        dialogue: 'いい質問だね。判例では、強盗致傷罪の「負傷」は、傷害罪の「傷害」と同じって考えられてるんだ。だから、法律上、特に軽い傷害は除外するっていう考え方は取られてないよ。'
    },
    {
        type: 'dialogue',
        speaker: 'みかん',
        expression: 'surprised',
        dialogue: 'へぇー！じゃあ、ちょっとした怪我でも成立しちゃうんだ。'
    },
    {
        type: 'dialogue',
        speaker: 'しみちゃん',
        expression: 'cool',
        dialogue: 'じゃあ、もっと複雑なケースを考えてみようか。もし、犯人が直接殴ったりしたんじゃなくて、逃げようとした店員がパニックになって自分で転んで骨折した場合、これはどうなると思う？'
    },
    {
        type: 'dialogue',
        speaker: '吉岡',
        expression: 'desperate',
        dialogue: 'うわ、ややこしい！犯人が直接手を出してないなら、セーフじゃないのか？'
    },
    {
        type: 'dialogue',
        speaker: 'ゆかりん',
        expression: 'serious',
        dialogue: 'それがそうでもないんだな。重要なのは、その怪我が「強盗の機会に」生じたかどうか、ってことなんだ。'
    },
    {
        type: 'narration',
        text: 'ゆかりんはスマホのメモ帳アプリを開き、図を書きながら説明を始めた。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: '判断フロー：「強盗の機会」といえるか',
      description: '死傷結果と強盗行為との間の因果関係の判断プロセス。',
      content: `flowchart TD
        A[強盗事件発生] --> B{被害者の死傷結果あり}
        B --> C{原因は犯人の直接の暴行？}
        C -- YES --> E[強盗致死傷罪]
        C -- NO --> D{強盗の機会に生じた？<br>（犯行中、追跡・逃走中など）}
        D -- YES --> F{強盗行為と<br>密接な関連性がある？}
        D -- NO --> H[強盗罪のみ]
        F -- YES --> E
        F -- NO --> H

        classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
        classDef result_ok fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
        classDef result_ng fill:#f1f8e9,stroke:#9e9d24,stroke-width:2px
        class B,C,D,F decision
        class E result_ok
        class H result_ng
      `
    },
    {
        type: 'dialogue',
        speaker: 'しみちゃん',
        expression: 'normal',
        dialogue: 'その通り。判例は、犯行中や、犯行直後の逃走中・追跡中なども含めて「強盗の機会」と広く捉えている。だから、犯人が原因でパニックになって転んだ、という状況なら、強盗行為と怪我の間に密接な関連性が認められて、強盗致傷罪が成立する可能性が高い。'
    },
    {
        type: 'dialogue',
        speaker: 'みかん',
        expression: 'thinking',
        dialogue: 'なるほどー。じゃあさ、もし犯人が最初から「殺してでも奪ってやる！」って思ってた場合はどうなるの？普通の殺人罪とは違うの？'
    },
    {
        type: 'dialogue',
        speaker: 'ゆかりん',
        expression: 'impressed',
        dialogue: 'みかん、良いところに気づくね！その場合でも、成立するのは強盗殺人罪、つまり【刑法240条】なんだ。この条文は、結果的に死傷した場合だけじゃなくて、初めから殺意や傷害の故意があった場合も含む、ハイブリッドな条文だって考えられてるから。'
    },
    {
        type: 'dialogue',
        speaker: '吉岡',
        expression: 'surprised',
        dialogue: 'へえ！じゃあ、強盗が絡むと、殺人の罪も一段と重くなるってことか。'
    },
    {
        type: 'narration',
        text: '話が佳境に入り、教室の空気はまるで法廷のように真剣なものになっていく。'
    },
    {
        type: 'dialogue',
        speaker: 'みかん',
        expression: 'thinking',
        dialogue: 'じゃあ、もう一つ！「未遂」ってどうなるの？たとえば、強盗が刺したけど、お医者さんのおかげで命は助かった、みたいな場合は？'
    },
    {
        type: 'dialogue',
        speaker: 'ゆかりん',
        expression: 'normal',
        dialogue: 'それは「強盗殺人未遂罪」になるね。強盗殺人罪に関しては、実際に被害者が亡くなったかどうかで既遂と未遂を区別するから。'
    },
    {
        type: 'dialogue',
        speaker: '吉岡',
        expression: 'smug',
        dialogue: 'なるほど。じゃあ、怪我をさせようとしたけど、寸前で避けられて無傷だった場合は「強盗致傷未遂罪」だな！'
    },
    {
        type: 'dialogue',
        speaker: 'しみちゃん',
        expression: 'cool',
        dialogue: '残念だけど、それは間違い。'
    },
    {
        type: 'dialogue',
        speaker: '吉岡',
        expression: 'desperate',
        dialogue: 'ええっ！？なんでだよ！'
    },
    {
        type: 'dialogue',
        speaker: 'ゆかりん',
        expression: 'laughing',
        dialogue: 'ふふ、そこが刑法の面白いところだよ。考えてみて。傷害の未遂って、結局は何になる？'
    },
    {
        type: 'dialogue',
        speaker: 'みかん',
        expression: 'thinking',
        dialogue: 'えーっと、怪我させようとしたけど、当たらなかった…。あ、ただの「暴行」？'
    },
    {
        type: 'dialogue',
        speaker: 'しみちゃん',
        expression: 'normal',
        dialogue: 'その通り。そして、その「暴行」は、そもそも強盗罪が成立するための手段として、最初から含まれている。'
    },
    {
        type: 'narration',
        text: 'しみちゃんは黒板に図を書いて説明した。'
    },
    {
      type: 'embed',
      format: 'mermaid',
      title: '未遂罪の成否比較',
      description: '強盗殺人と強盗傷人では未遂の扱いが異なる。',
      content: `graph LR
        subgraph "強盗殺人罪（【刑法240条】後段）"
            A["殺害行為"] --> B{"被害者死亡？"};
            B -- YES --> C[既遂];
            B -- NO --> D[未遂成立];
        end
        
        subgraph "強盗致傷罪（【刑法240条】前段）"
            E["傷害行為"] --> F{"被害者負傷？"};
            F -- YES --> G[既遂];
            F -- NO --> H["未遂不成立<br>（暴行は強盗罪で評価済み）"];
        end

        classDef success fill:#d1fae5,stroke:#10b981,stroke-width:2px;
        classDef fail fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
        class C,G success;
        class D,H fail;
      `
    },
    {
        type: 'dialogue',
        speaker: 'ゆかりん',
        expression: 'happy',
        dialogue: 'だから、強盗が暴行したけど結果的に怪我しなかった、という場合は、強盗致傷罪の未遂にはならず、単純な強盗罪として処理されるんだ。面白いよね。'
    },
    {
        type: 'dialogue',
        speaker: 'みかん',
        expression: 'impressed',
        dialogue: 'すごーい！法律って、パズルみたいにロジカルにできてるんだね！なんだか、ちょっと尊敬しちゃうかも。'
    },
    {
        type: 'dialogue',
        speaker: '吉岡',
        expression: 'laughing',
        dialogue: '俺はもう頭がパンクしそうだぜ…。よし、今日の勉強はここまで！ラーメン食いに行こうぜ、ラーメン！'
    },
    {
        type: 'narration',
        text: '吉岡の一声で、白熱した法律談義は終わりを告げ、4人は笑いながら教室を後にするのだった。'
    }
  ]
}
