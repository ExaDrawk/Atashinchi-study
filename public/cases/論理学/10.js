export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "ronrigaku-koten-enseki-hitei-hairihoo",
  title: "【論理学】古典論理の自然演繹（否定と背理法）",
  category: "ronrigaku",
  citation: "論理学I 第10回（小関）",
  rank: "S",
  tags: ["論理学", "自然演繹", "否定", "背理法", "古典論理"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `
【否定の推論規則】
- **否定導入則（¬I）**: [A]ⁿ...⊥ ⇒ ¬A（仮定の打ち消し）
- **否定除去則（¬E）**: A, ¬A ⇒ ⊥（矛盾の導出）

【背理法（RAA: Reductio ad Absurdum）】
- **定義**: [¬A]ⁿ...⊥ ⇒ A（否定を仮定して矛盾を導く）
- **原理**: Aでないと仮定すると矛盾が導かれるとき、Aと結論できる

【否定と含意の関係】
- **実質的定義**: ¬A ⇔ A→⊥
- **二重否定**: A ⇔ ¬¬A（古典論理で成立）

【爆発律（Ex Falso Quodlibet）】
- **形式**: ⊥ ⇒ A（矛盾から任意の論理式を導出）
- **記号**: ⊥E（⊥除去則）

【論理体系の分類】
- **古典論理**: 背理法と爆発律を含む
- **直観主義論理**: 爆発律のみ、背理法なし
- **最小論理**: 背理法も爆発律もなし

【証明戦略】
- **間接証明**: 矛盾を利用した背理法
- **否定の証明**: 仮定から矛盾を導く否定導入則
  `,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '否定導入則と否定除去則を説明しなさい。', 
      answer: '否定導入則は{{[A]ⁿ...⊥ ⇒ ¬A}}で、Aを仮定して矛盾⊥が導かれるとき¬Aを結論する。否定除去則は{{A, ¬A ⇒ ⊥}}で、AとAの否定から矛盾を導く。' 
    },
    { 
      id: 2, 
      rank: 'S', 
      question: '背理法（RAA）とは何か説明しなさい。', 
      answer: '背理法とは{{[¬A]ⁿ...⊥ ⇒ A}}の形で、{{Aでないと仮定すると矛盾が導かれるとき、Aと結論}}する推論規則である。間接証明の代表的手法。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: '否定と含意の関係を述べなさい。', 
      answer: '否定は実質的に{{¬A ⇔ A→⊥}}として定義される。つまり{{Aの否定は、Aから矛盾が導かれること}}と同値である。' 
    },
    { 
      id: 4, 
      rank: 'A', 
      question: '爆発律とは何か説明しなさい。', 
      answer: '爆発律とは{{⊥ ⇒ A}}の形で、{{矛盾から任意の論理式を導出}}できる規則である。「矛盾からは何でも導ける」という原理。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '古典論理と直観主義論理の違いを説明しなさい。', 
      answer: '古典論理は{{背理法と爆発律の両方}}を含むが、直観主義論理は{{爆発律のみで背理法を含まない}}。そのため{{二重否定律や排中律が成り立たない}}。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'タチバナ家のリビング。みかんが論理学の演習問題に取り組んでいる。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'なんで？否定の規則って複雑すぎない？背理法とか意味わからないよ。【id:1】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '姉ちゃん、否定の規則は実は人間の自然な推論に近いんだよ。否定導入則から見てみよう。' },
    { type: 'narration', text: 'ユズヒコが教科書を開いて説明を始める。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'P→¬Q, Q⇒¬Pっていう推論を考えてみよう。これは否定導入則の典型例だ。' },
    { type: 'embed', format: 'svg', title: '否定導入則の証明図', description: 'P→¬Q, Q⇒¬Pの証明過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="250" viewBox="0 0 600 250" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><rect x="80" y="20" width="30" height="20" fill="none" stroke="#333" stroke-dasharray="5,5"/><text x="95" y="35" text-anchor="middle" font-size="12">[P]¹</text><text x="200" y="35" text-anchor="middle" font-size="14" font-weight="bold">P→¬Q</text><line x1="125" y1="45" x2="250" y2="80" stroke="#333" stroke-width="2"/><line x1="225" y1="45" x2="250" y2="80" stroke="#333" stroke-width="2"/><text x="250" y="100" text-anchor="middle" font-size="12">¬Q</text><text x="270" y="115" text-anchor="start" font-size="10" fill="#666">→E</text><text x="400" y="100" text-anchor="middle" font-size="14" font-weight="bold">Q</text><line x1="275" y1="110" x2="350" y2="150" stroke="#333" stroke-width="2"/><line x1="375" y1="110" x2="350" y2="150" stroke="#333" stroke-width="2"/><text x="350" y="170" text-anchor="middle" font-size="12">⊥</text><text x="370" y="185" text-anchor="start" font-size="10" fill="#666">¬E</text><line x1="350" y1="180" x2="350" y2="220" stroke="#333" stroke-width="2"/><text x="350" y="240" text-anchor="middle" font-size="12" font-weight="bold">¬P</text><text x="370" y="255" text-anchor="start" font-size="10" fill="#666">¬I,1</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①Pを仮定（[P]¹で表示）<br/>②PとP→¬Qから含意除去則で¬Qを導く<br/>③¬QとQから否定除去則で矛盾⊥を導く<br/>④仮定Pを打ち消して否定導入則で¬Pを導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'あ！Pを仮定したら矛盾が出てきたから、Pは偽だって結論してるのね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'その通り！これが否定導入則の考え方だ。仮定から矛盾が導かれたら、その仮定の否定が成り立つんだ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '否定除去則っていうのもあるんでしょ？【id:1】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'うん、それは簡単だよ。AとAの否定¬Aがあったら矛盾⊥が導けるっていう規則だ。' },
    { type: 'embed', format: 'svg', title: '否定除去則の例', description: 'P∧¬P⇒⊥の証明', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="300" y="30" text-anchor="middle" font-size="14" font-weight="bold">P∧¬P</text><line x1="300" y1="40" x2="200" y2="80" stroke="#333" stroke-width="2"/><line x1="300" y1="40" x2="400" y2="80" stroke="#333" stroke-width="2"/><text x="200" y="100" text-anchor="middle" font-size="12">P</text><text x="220" y="115" text-anchor="start" font-size="10" fill="#666">∧E</text><text x="400" y="100" text-anchor="middle" font-size="12">¬P</text><text x="420" y="115" text-anchor="start" font-size="10" fill="#666">∧E</text><line x1="225" y1="110" x2="300" y2="150" stroke="#333" stroke-width="2"/><line x1="375" y1="110" x2="300" y2="150" stroke="#333" stroke-width="2"/><text x="300" y="170" text-anchor="middle" font-size="12" font-weight="bold">⊥</text><text x="320" y="185" text-anchor="start" font-size="10" fill="#666">¬E</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①P∧¬Pから連言除去則でPと¬Pを取り出す<br/>②PとPの否定¬Pから否定除去則で矛盾⊥を導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'これはわかりやすい！同じものが真と偽だったら矛盾だもんね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: '次は背理法だ。これが古典論理の特徴的な規則なんだよ。【id:2】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '背理法って何？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '「Aでない」と仮定して矛盾が導かれたら、「A」が成り立つっていう規則だ。⇒¬¬P→Pの証明で見てみよう。' },
    { type: 'embed', format: 'svg', title: '背理法の証明図', description: '⇒¬¬P→Pの証明過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="250" viewBox="0 0 600 250" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><rect x="80" y="20" width="50" height="20" fill="none" stroke="#333" stroke-dasharray="5,5"/><text x="105" y="35" text-anchor="middle" font-size="12">[¬¬P]¹</text><rect x="200" y="60" width="30" height="20" fill="none" stroke="#333" stroke-dasharray="5,5"/><text x="215" y="75" text-anchor="middle" font-size="12">[¬P]²</text><line x1="130" y1="45" x2="250" y2="100" stroke="#333" stroke-width="2"/><line x1="230" y1="85" x2="250" y2="100" stroke="#333" stroke-width="2"/><text x="250" y="120" text-anchor="middle" font-size="12">⊥</text><text x="270" y="135" text-anchor="start" font-size="10" fill="#666">¬E</text><line x1="250" y1="130" x2="250" y2="170" stroke="#333" stroke-width="2"/><text x="250" y="190" text-anchor="middle" font-size="12">P</text><text x="270" y="205" text-anchor="start" font-size="10" fill="#666">RAA,2</text><line x1="250" y1="200" x2="250" y2="240" stroke="#333" stroke-width="2"/><text x="250" y="260" text-anchor="middle" font-size="12" font-weight="bold">¬¬P→P</text><text x="300" y="275" text-anchor="start" font-size="10" fill="#666">→I,1</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①¬¬Pを仮定（[¬¬P]¹）<br/>②¬Pを仮定（[¬P]²）<br/>③¬¬Pと¬Pから否定除去則で矛盾⊥を導く<br/>④背理法（RAA）で仮定¬Pを打ち消してPを導く<br/>⑤含意導入則で¬¬P→Pを導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'おお！「Pでない」と仮定したら矛盾したから、「P」が成り立つって結論してるのね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'そう！これが背理法の原理だ。否定を仮定して矛盾を導けば、元の命題が成り立つんだ。' },
    { type: 'narration', text: 'みかんが爆発律について質問する。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '爆発律っていうのも聞いたことがあるけど、何？【id:4】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '爆発律は「矛盾からは何でも導ける」っていう規則だよ。⊥→Pの形で、矛盾⊥から任意の論理式Pを導出できるんだ。' },
    { type: 'embed', format: 'html', title: '論理体系の比較', description: '古典論理・直観主義論理・最小論理の違い', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #667eea; color: white;"><th style="padding: 12px; font-size: 12px;">論理体系</th><th style="padding: 12px; font-size: 12px;">背理法（RAA）</th><th style="padding: 12px; font-size: 12px;">爆発律（⊥E）</th><th style="padding: 12px; font-size: 12px;">特徴</th></tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">古典論理</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">○</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">○</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">二重否定律・排中律が成立</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">直観主義論理</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">×</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">○</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">構成的証明を重視</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">最小論理</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">×</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">×</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">矛盾許容論理の一種</td></tr></tbody></table></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '論理体系によって使える規則が違うの？【id:5】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'そうなんだ。古典論理は背理法も爆発律も使えるけど、直観主義論理は爆発律だけで背理法は使えない。最小論理はどちらも使えないんだ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'passionate', dialogue: '演習問題もやってみよう！P→⊥⇒¬Pはどうかな？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'これは否定と含意の関係を示す問題だね。¬AはA→⊥と実質的に同じだから、簡単に証明できるよ。【id:3】' },
    { type: 'embed', format: 'svg', title: '演習問題の証明図', description: 'P→⊥⇒¬Pの証明', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><rect x="80" y="20" width="30" height="20" fill="none" stroke="#333" stroke-dasharray="5,5"/><text x="95" y="35" text-anchor="middle" font-size="12">[P]¹</text><text x="300" y="35" text-anchor="middle" font-size="14" font-weight="bold">P→⊥</text><line x1="120" y1="45" x2="250" y2="80" stroke="#333" stroke-width="2"/><line x1="275" y1="45" x2="250" y2="80" stroke="#333" stroke-width="2"/><text x="250" y="100" text-anchor="middle" font-size="12">⊥</text><text x="270" y="115" text-anchor="start" font-size="10" fill="#666">→E</text><line x1="250" y1="110" x2="250" y2="150" stroke="#333" stroke-width="2"/><text x="250" y="170" text-anchor="middle" font-size="12" font-weight="bold">¬P</text><text x="270" y="185" text-anchor="start" font-size="10" fill="#666">¬I,1</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①Pを仮定（[P]¹）<br/>②PとP→⊥から含意除去則で⊥を導く<br/>③仮定Pを打ち消して否定導入則で¬Pを導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'やった！否定の規則も理解できたよ！背理法って面白いね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: '姉ちゃんもだんだん論理学の面白さがわかってきたね。これで古典論理の主要な規則は全部マスターだよ。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">古典論理における否定と背理法</h3>
    <p class="mb-4">否定の推論規則と背理法は、古典論理の自然演繹において重要な役割を果たします。これらの規則により、間接証明や矛盾を利用した推論が可能になります。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">否定の推論規則</h4>
    <p class="mb-4">否定に関する規則は、導入則と除去則の2つがあります：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">否定導入則（¬I）</span>：論理式Aを仮定して矛盾⊥が導かれるとき、¬Aを結論</li>
      <li><span class="text-red-600 font-bold">否定除去則（¬E）</span>：AとAの否定¬Aから矛盾⊥を導出</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">背理法（Reductio ad Absurdum）</h4>
    <p class="mb-4">背理法は古典論理の特徴的な推論規則です：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-blue-600 font-bold">基本形式</span>：[¬A]ⁿ...⊥ ⇒ A</li>
      <li><span class="text-blue-600 font-bold">原理</span>：「Aでない」と仮定して矛盾が導かれるとき、Aが成り立つ</li>
      <li><span class="text-blue-600 font-bold">応用</span>：二重否定の除去（¬¬A ⇒ A）や対偶の証明</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">否定と含意の関係</h4>
    <p class="mb-4">否定は含意を用いて定義されます：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-green-600 font-bold">実質的定義</span>：¬A ⇔ A→⊥</li>
      <li><span class="text-green-600 font-bold">意味</span>：Aの否定は、Aから矛盾が導かれることと同値</li>
      <li><span class="text-green-600 font-bold">証明論的等価性</span>：否定導入則と含意導入則の対応</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">爆発律（Ex Falso Quodlibet）</h4>
    <p class="mb-4">爆発律は矛盾の性質を表す重要な規則です：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-purple-600 font-bold">形式</span>：⊥ ⇒ A（任意のA）</li>
      <li><span class="text-purple-600 font-bold">意味</span>：矛盾からは任意の論理式を導出可能</li>
      <li><span class="text-purple-600 font-bold">記号</span>：⊥E（⊥除去則）</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">論理体系の分類</h4>
    <p class="mb-4">背理法と爆発律の有無により、論理体系が分類されます：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-orange-600 font-bold">古典論理</span>：背理法と爆発律の両方を含む</li>
      <li><span class="text-orange-600 font-bold">直観主義論理</span>：爆発律のみ、背理法なし（構成的証明重視）</li>
      <li><span class="text-orange-600 font-bold">最小論理</span>：どちらも含まない（矛盾許容論理の一種）</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">演習問題の解法パターン</h4>
    <p class="mb-4">第10回演習の各問題について、典型的な解法を示します：</p>
    
    <p class="mb-2"><strong>(1) P→¬Q, Q⇒¬P</strong></p>
    <p class="mb-4">Pを仮定し、含意除去則で¬Qを導き、Qとの矛盾から否定導入則で¬Pを導きます。</p>
    
    <p class="mb-2"><strong>(2) P→⊥⇒¬P, ¬P⇒P→⊥</strong></p>
    <p class="mb-4">否定と含意の実質的等価性を示す問題です。¬A ⇔ A→⊥の関係を利用します。</p>
    
    <p class="mb-2"><strong>(3) ¬¬P⇒P, P⇒¬¬P</strong></p>
    <p class="mb-4">二重否定の除去と導入を示します。前者は背理法、後者は否定導入則を使用します。</p>
    
    <p class="mb-2"><strong>(4) ⇒⊥→P（爆発律）</strong></p>
    <p class="mb-4">⊥を仮定し、爆発律（⊥E）を直接適用してPを導きます。</p>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">重要なポイント</h5>
      <p>否定と背理法は、古典論理の表現力を大幅に拡張します。特に背理法は、直接的な証明が困難な場合の強力な証明手法です。ただし、これらの規則は論理体系によって採用されない場合もあり、構成的数学や計算機科学では直観主義論理がしばしば用いられます。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "否定と背理法を用いた証明の構成",
      rank: "S",
      background: `論理学において、否定の概念と背理法は重要な推論手法です。否定導入則は仮定から矛盾を導いて否定を証明し、背理法は否定を仮定して矛盾を導くことで肯定を証明します。これらの規則の組み合わせにより、古典論理では強力な証明能力が実現されています。`,
      subProblems: [
        {
          title: "否定の推論規則の理解",
          rank: "A",
          relatedQAs: [1, 3],
          problem: "否定導入則と否定除去則について説明し、否定と含意の関係（¬A ⇔ A→⊥）がなぜ成り立つのかを論理的に説明しなさい。また、具体例を用いて両規則の使い方を示しなさい。",
          hint: "否定の本質は矛盾の導出にあります。含意との関係を考えてみてください。",
          points: ["否定導入則・除去則の正確な形式", "否定と含意の等価性の説明", "具体例による規則の適用", "論理的根拠の明確化"],
          modelAnswer: "否定導入則は[A]ⁿ...⊥⇒¬Aで、Aを仮定して矛盾⊥が導かれるとき¬Aを結論する。否定除去則はA, ¬A⇒⊥で、AとAの否定から矛盾を導く。¬A ⇔ A→⊥の関係は、否定の本質が「Aから矛盾が導かれること」にあるため成立する。具体例：P→¬Q, Q⇒¬Pでは、Pを仮定し含意除去則で¬Qを導き、Qとの矛盾から否定導入則で¬Pを導く。この過程で否定の両規則が効果的に使用される。"
        },
        {
          title: "背理法の原理と応用",
          rank: "S",
          relatedQAs: [2, 4, 5],
          problem: "背理法（RAA）の原理を説明し、推論「⇒(P→Q)→(¬Q→¬P)」について背理法を用いた証明図を構成しなさい。また、背理法が古典論理の特徴である理由を、他の論理体系との比較を通じて説明しなさい。",
          hint: "対偶の証明には背理法が有効です。直観主義論理との違いに注目してください。",
          points: ["背理法の原理の正確な説明", "証明図の正しい構成", "論理体系間の比較", "古典論理の特徴の理解"],
          modelAnswer: "背理法は[¬A]ⁿ...⊥⇒Aで、「Aでない」と仮定して矛盾が導かれるときAを結論する。証明：(P→Q)を仮定し、¬Qを仮定し、さらに¬(¬Q→¬P)すなわち¬Q∧¬¬Pを仮定。¬¬PからPを導き、P→QとPから含意除去則でQを導く。これは¬Qと矛盾するため、背理法により¬Q→¬Pが導かれる。背理法は古典論理の特徴で、直観主義論理では採用されない。これは構成的証明を重視する立場から、存在の証明に実際の構成を要求するためである。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
