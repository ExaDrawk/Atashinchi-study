export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "ronrigaku-shizen-enseki-koten",
  title: "【論理学】古典論理の自然演繹",
  category: "ronrigaku",
  citation: "論理学I 第9回（小関）",
  rank: "S",
  tags: ["論理学", "自然演繹", "証明図", "推論規則", "古典論理"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `
【自然演繹（Natural Deduction）】
- **定義**: 実際の人間の推論に近い演繹体系（G. ゲンツェン考案）
- **特徴**: 公理を持たず、複数の推論規則を持つ
- **目的**: 妥当な推論について証明図を構成する

【推論規則の種類】
- **導入則（Introduction）**: 論理結合子を導入する規則
- **除去則（Elimination）**: 論理結合子を除去する規則

【連言の規則】
- **連言導入則（∧I）**: A, B ⇒ A∧B
- **連言除去則（∧E）**: A∧B ⇒ A, A∧B ⇒ B

【含意の規則】
- **含意導入則（→I）**: [A]ⁿ...B ⇒ A→B（仮定の打ち消し）
- **含意除去則（→E）**: A, A→B ⇒ B（モーダスポネンス）

【証明戦略】
- **後ろ向き（Backward）**: 結論から前提に遡る
- **前向き（Forward）**: 前提から結論を導く
- **間接証明**: 矛盾を利用した背理法

【仮定の打ち消し】
- 含意導入則で仮定に[  ]と番号をつけて打ち消す
- 打ち消した仮定の番号を規則適用時に併記
  `,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '自然演繹とは何か、その特徴を説明しなさい。', 
      answer: '自然演繹とは、{{実際の人間の推論に近い演繹体系}}である。{{公理を持たず、複数の推論規則を持つ}}ことが特徴で、G. ゲンツェンによって考案された。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '連言導入則と連言除去則を説明しなさい。', 
      answer: '連言導入則は{{A, B ⇒ A∧B}}で、2つの論理式から連言を作る。連言除去則は{{A∧B ⇒ A, A∧B ⇒ B}}で、連言から各連言肢を取り出す。' 
    },
    { 
      id: 3, 
      rank: 'S', 
      question: '含意導入則における仮定の打ち消しとは何か。', 
      answer: '仮定の打ち消しとは、{{一時的に仮定した論理式を[  ]と番号で囲んで無効化}}することである。{{[A]ⁿ...B ⇒ A→B}}の形で、仮定Aを打ち消してA→Bを導く。' 
    },
    { 
      id: 4, 
      rank: 'A', 
      question: '含意除去則（モーダスポネンス）を説明しなさい。', 
      answer: '含意除去則は{{A, A→B ⇒ B}}の形で、{{前件Aと含意A→Bから後件Bを導く}}規則である。論理学の基本的な推論規則の一つ。' 
    },
    { 
      id: 5, 
      rank: 'A', 
      question: '証明戦略の「後ろ向き」と「前向き」の違いを説明しなさい。', 
      answer: '後ろ向き戦略は{{結論から前提に遡って証明を構成}}する方法で、前向き戦略は{{前提から結論を導いて証明を構成}}する方法である。導入則は後ろ向き、除去則は前向きが適用しやすい。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'タチバナ家のリビング。みかんが論理学の演習問題に取り組んでいる。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'なんで？この自然演繹っていうのがよくわからないよ。証明図って何？【id:1】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '姉ちゃん、自然演繹は人間の推論に近い演繹体系なんだ。公理じゃなくて推論規則を使って証明を作るんだよ。' },
    { type: 'narration', text: 'ユズヒコが教科書を開いて説明を始める。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'まず連言の規則から見てみよう。P, Q, R⇒P∧(Q∧R)っていう推論を証明してみるか。' },
    { type: 'embed', format: 'svg', title: '連言導入則の証明図', description: 'P, Q, R⇒P∧(Q∧R)の証明過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="250" viewBox="0 0 600 250" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="100" y="30" text-anchor="middle" font-size="14" font-weight="bold">P</text><text x="300" y="30" text-anchor="middle" font-size="14" font-weight="bold">Q</text><text x="500" y="30" text-anchor="middle" font-size="14" font-weight="bold">R</text><line x1="350" y1="40" x2="400" y2="70" stroke="#333" stroke-width="2"/><line x1="450" y1="40" x2="400" y2="70" stroke="#333" stroke-width="2"/><text x="400" y="90" text-anchor="middle" font-size="12">Q∧R</text><text x="420" y="105" text-anchor="start" font-size="10" fill="#666">∧I</text><line x1="150" y1="40" x2="300" y2="130" stroke="#333" stroke-width="2"/><line x1="400" y1="100" x2="300" y2="130" stroke="#333" stroke-width="2"/><text x="300" y="150" text-anchor="middle" font-size="12" font-weight="bold">P∧(Q∧R)</text><text x="320" y="165" text-anchor="start" font-size="10" fill="#666">∧I</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①QとRに連言導入則を適用してQ∧Rを導く<br/>②PとQ∧Rに連言導入則を適用してP∧(Q∧R)を導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'おお！下から上に線が伸びてるのね。これが証明図ってやつか！【id:2】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'そうそう！連言導入則は2つの論理式から連言を作る規則だからね。逆に連言除去則もあるよ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '今度はP∧(Q∧R)⇒Qっていう推論はどうなるの？' },
    { type: 'embed', format: 'svg', title: '連言除去則の証明図', description: 'P∧(Q∧R)⇒Qの証明過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="300" y="30" text-anchor="middle" font-size="14" font-weight="bold">P∧(Q∧R)</text><line x1="300" y1="40" x2="300" y2="80" stroke="#333" stroke-width="2"/><text x="300" y="100" text-anchor="middle" font-size="12">Q∧R</text><text x="320" y="115" text-anchor="start" font-size="10" fill="#666">∧E</text><line x1="300" y1="110" x2="300" y2="150" stroke="#333" stroke-width="2"/><text x="300" y="170" text-anchor="middle" font-size="12" font-weight="bold">Q</text><text x="320" y="185" text-anchor="start" font-size="10" fill="#666">∧E</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①P∧(Q∧R)から連言除去則でQ∧Rを取り出す<br/>②Q∧Rから連言除去則でQを取り出す</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'なるほど！今度は連言から部分を取り出してるのね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '次は含意の規則だ。これがちょっと複雑なんだよ。含意導入則では仮定の打ち消しっていうのをするんだ。【id:3】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: '仮定の打ち消し？なんで？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: 'Q⇒P→(P∧Q)っていう推論を考えてみよう。P→(P∧Q)を導くには、Pを仮定してP∧Qが導けることを示すんだ。' },
    { type: 'embed', format: 'svg', title: '含意導入則の証明図', description: 'Q⇒P→(P∧Q)の証明過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><rect x="80" y="20" width="30" height="20" fill="none" stroke="#333" stroke-dasharray="5,5"/><text x="95" y="35" text-anchor="middle" font-size="12">[P]¹</text><text x="300" y="35" text-anchor="middle" font-size="14" font-weight="bold">Q</text><line x1="125" y1="45" x2="200" y2="80" stroke="#333" stroke-width="2"/><line x1="275" y1="45" x2="200" y2="80" stroke="#333" stroke-width="2"/><text x="200" y="100" text-anchor="middle" font-size="12">P∧Q</text><text x="220" y="115" text-anchor="start" font-size="10" fill="#666">∧I</text><line x1="200" y1="110" x2="200" y2="150" stroke="#333" stroke-width="2"/><text x="200" y="170" text-anchor="middle" font-size="12" font-weight="bold">P→(P∧Q)</text><text x="250" y="185" text-anchor="start" font-size="10" fill="#666">→I,1</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①Pを仮定（[P]¹で表示）<br/>②PとQから連言導入則でP∧Qを導く<br/>③仮定Pを打ち消して含意導入則でP→(P∧Q)を導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'あ！Pに四角い枠がついて、番号も振ってある！これが仮定の打ち消しなのね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'その通り！仮定を一時的に設定して、それを使って結論を導いたら、その仮定を打ち消すんだ。' },
    { type: 'narration', text: 'みかんが含意除去則について質問する。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '含意除去則っていうのもあるんでしょ？【id:4】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'うん、それはモーダスポネンスって呼ばれる基本的な推論規則だよ。P, P→(Q∧R)⇒Rっていう推論で見てみよう。' },
    { type: 'embed', format: 'svg', title: '含意除去則の証明図', description: 'P, P→(Q∧R)⇒Rの証明過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="150" y="30" text-anchor="middle" font-size="14" font-weight="bold">P</text><text x="450" y="30" text-anchor="middle" font-size="14" font-weight="bold">P→(Q∧R)</text><line x1="200" y1="40" x2="300" y2="80" stroke="#333" stroke-width="2"/><line x1="400" y1="40" x2="300" y2="80" stroke="#333" stroke-width="2"/><text x="300" y="100" text-anchor="middle" font-size="12">Q∧R</text><text x="320" y="115" text-anchor="start" font-size="10" fill="#666">→E</text><line x1="300" y1="110" x2="300" y2="150" stroke="#333" stroke-width="2"/><text x="300" y="170" text-anchor="middle" font-size="12" font-weight="bold">R</text><text x="320" y="185" text-anchor="start" font-size="10" fill="#666">∧E</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①PとP→(Q∧R)から含意除去則でQ∧Rを導く<br/>②Q∧Rから連言除去則でRを導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'これはわかりやすい！PがあってP→(Q∧R)があるから、Q∧Rが導けるのね！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: '証明戦略も大事なんだ。後ろ向き戦略は結論から遡って、前向き戦略は前提から進むんだよ。【id:5】' },
    { type: 'embed', format: 'html', title: '自然演繹の推論規則一覧', description: '古典論理NKの主要な推論規則', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #667eea; color: white;"><th style="padding: 12px; font-size: 12px;">規則名</th><th style="padding: 12px; font-size: 12px;">記号</th><th style="padding: 12px; font-size: 12px;">形式</th><th style="padding: 12px; font-size: 12px;">説明</th></tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">連言導入則</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">∧I</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">A, B ⇒ A∧B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">2つの論理式から連言を作る</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">連言除去則</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">∧E</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">A∧B ⇒ A, B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">連言から各連言肢を取り出す</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">含意導入則</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">→I</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">[A]ⁿ...B ⇒ A→B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">仮定を打ち消して含意を導く</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">含意除去則</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">→E</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">A, A→B ⇒ B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">モーダスポネンス</td></tr></tbody></table></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'passionate', dialogue: '演習問題もやってみよう！P→Q, P∧R⇒Qはどうかな？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'これは含意除去則と連言除去則を組み合わせるんだ。まずP∧RからPを取り出して、それとP→QからQを導くんだよ。' },
    { type: 'embed', format: 'svg', title: '演習問題の証明図', description: 'P→Q, P∧R⇒Qの証明', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="150" y="30" text-anchor="middle" font-size="14" font-weight="bold">P→Q</text><text x="450" y="30" text-anchor="middle" font-size="14" font-weight="bold">P∧R</text><line x1="450" y1="40" x2="350" y2="80" stroke="#333" stroke-width="2"/><text x="350" y="100" text-anchor="middle" font-size="12">P</text><text x="370" y="115" text-anchor="start" font-size="10" fill="#666">∧E</text><line x1="200" y1="40" x2="300" y2="140" stroke="#333" stroke-width="2"/><line x1="350" y1="110" x2="300" y2="140" stroke="#333" stroke-width="2"/><text x="300" y="160" text-anchor="middle" font-size="12" font-weight="bold">Q</text><text x="320" y="175" text-anchor="start" font-size="10" fill="#666">→E</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>①P∧Rから連言除去則でPを取り出す<br/>②P→QとPから含意除去則でQを導く</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'やった！規則を組み合わせて使うのね！自然演繹って面白い！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: '姉ちゃんもだんだんコツを掴んできたね。複雑な証明では後ろ向きと前向きの戦略を使い分けるのが大事なんだ。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">古典論理の自然演繹による証明図構成</h3>
    <p class="mb-4">自然演繹（natural deduction）は、G. ゲンツェンによって考案された演繹体系で、実際の人間の推論過程により近い形で論理的推論を形式化します。ヒルベルト計算と異なり、公理を持たず、複数の推論規則を用いて証明を構成します。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">連言に関する推論規則</h4>
    <p class="mb-4">連言（∧）に関しては、導入則と除去則の2つの規則があります：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">連言導入則（∧I）</span>：論理式AとBから A∧B を導く</li>
      <li><span class="text-red-600 font-bold">連言除去則（∧E）</span>：A∧B から A または B を導く</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">含意に関する推論規則</h4>
    <p class="mb-4">含意（→）に関する規則は、特に含意導入則で仮定の打ち消しという重要な概念を含みます：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-blue-600 font-bold">含意除去則（→E）</span>：A と A→B から B を導く（モーダスポネンス）</li>
      <li><span class="text-blue-600 font-bold">含意導入則（→I）</span>：A を仮定して B が導けるとき、A→B を導く</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">仮定の打ち消しメカニズム</h4>
    <p class="mb-4">含意導入則の核心は仮定の打ち消し（discharge）です：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li>論理式 A を一時的に仮定し、[A]ⁿ の形で表記</li>
      <li>この仮定を用いて B を導出</li>
      <li>仮定 A を打ち消して A→B を結論</li>
      <li>番号 n により、どの仮定を打ち消したかを明示</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">証明戦略の使い分け</h4>
    <p class="mb-4">効果的な証明図の構成には、適切な戦略の選択が重要です：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-green-600 font-bold">後ろ向き戦略</span>：結論から前提に向かって遡る（導入則に適用しやすい）</li>
      <li><span class="text-green-600 font-bold">前向き戦略</span>：前提から結論に向かって進む（除去則に適用しやすい）</li>
      <li><span class="text-green-600 font-bold">間接証明</span>：矛盾を利用した背理法</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">演習問題の解法パターン</h4>
    <p class="mb-4">第9回演習の各問題について、典型的な解法パターンを示します：</p>
    
    <p class="mb-2"><strong>(1) P→Q, P∧R⇒Q</strong></p>
    <p class="mb-4">P∧Rから連言除去則でPを取り出し、P→Qと組み合わせて含意除去則でQを導きます。除去則中心の前向き戦略が効果的です。</p>
    
    <p class="mb-2"><strong>(5) P→Q, P→R⇒P→(Q∧R)</strong></p>
    <p class="mb-4">Pを仮定し、2つの含意除去則でQとRを導き、連言導入則でQ∧Rを作り、最後に含意導入則でP→(Q∧R)を導きます。仮定の打ち消しが鍵となります。</p>
    
    <p class="mb-2"><strong>(9) ⇒(P→Q)→(P→P→Q)</strong></p>
    <p class="mb-4">前提のない定理の証明で、複数回の含意導入則を適用します。仮定の管理と番号付けが重要です。</p>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">重要なポイント</h5>
      <p>自然演繹は記号操作による機械的な証明構成ではなく、論理的思考の構造を明示化する手法です。各推論規則の意味を理解し、適切な戦略を選択することで、複雑な推論も系統的に証明できます。特に仮定の打ち消しは、条件付き推論の本質を捉えた重要な概念です。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "自然演繹による推論の証明",
      rank: "S",
      background: `論理学において、推論の妥当性を示すためには、前提から結論を導く証明を構成する必要があります。自然演繹は、人間の直観的な推論過程に近い形で、系統的な証明図を構成する手法です。各論理結合子に対する導入則と除去則を適切に組み合わせることで、複雑な推論も証明可能になります。`,
      subProblems: [
        {
          title: "基本的な推論規則の理解",
          rank: "A",
          relatedQAs: [1, 2, 4],
          problem: "自然演繹における連言と含意の推論規則について説明し、それぞれの導入則と除去則の違いを明確にしなさい。また、これらの規則がどのような論理的直観に基づいているかも述べなさい。",
          hint: "導入則は論理結合子を作る規則、除去則は論理結合子を分解する規則です。",
          points: ["各規則の正確な形式", "導入則と除去則の役割の違い", "論理的直観との対応", "具体例による説明"],
          modelAnswer: "連言の規則：連言導入則（∧I）はA, B⇒A∧Bで、2つの事実から連言を構成する。連言除去則（∧E）はA∧B⇒A, A∧B⇒Bで、連言から各部分を取り出す。含意の規則：含意除去則（→E）はA, A→B⇒Bで、条件と含意から結論を導く（モーダスポネンス）。含意導入則（→I）は[A]ⁿ...B⇒A→Bで、仮定Aから結論Bが導けることを示してA→Bを導く。導入則は論理結合子を構成し、除去則は分解する。これは人間の自然な推論パターンに対応している。"
        },
        {
          title: "仮定の打ち消しと証明戦略",
          rank: "S",
          relatedQAs: [3, 5],
          problem: "推論「P→Q, P→R⇒P→(Q∧R)」について、自然演繹を用いた証明図を構成しなさい。仮定の打ち消しの過程を詳しく説明し、どのような証明戦略を用いたかも述べなさい。",
          hint: "Pを仮定して、2つの含意除去則を使ってQとRを導き、連言導入則でQ∧Rを作ります。",
          points: ["証明図の正確な構成", "仮定の打ち消しの適切な処理", "証明戦略の説明", "各ステップの論理的根拠"],
          modelAnswer: "証明図：[P]¹を仮定。P→QとPから含意除去則でQを導く。P→RとPから含意除去則でRを導く。QとRから連言導入則でQ∧Rを導く。仮定[P]¹を打ち消して含意導入則でP→(Q∧R)を導く。証明戦略：結論がP→(Q∧R)の形なので、含意導入則を用いる後ろ向き戦略を採用。Pを仮定してQ∧Rを導くことを目標とし、前提の2つの含意を利用して前向きにQとRを導出。仮定の打ち消しにより、条件付き推論P→(Q∧R)を確立。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
