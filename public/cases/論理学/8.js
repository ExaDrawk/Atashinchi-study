export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "ronrigaku-tableau-hanrei",
  title: "【論理学】意味論的タブローと反例の構成",
  category: "ronrigaku",
  citation: "論理学I 第7回（小関）",
  rank: "A",
  tags: ["論理学", "意味論的タブロー", "反例", "妥当性", "推論"],
  rightSideCharacters: ['みかん'],

  // =============================================
  // === 2. 知識箱（必須） =======================
  // =============================================
  knowledgeBox: `
【意味論的タブロー（Semantic Tableau）】
- **定義**: 木構造を用いた妥当性の証明/反例の構成方法
- **目的**: 推論が妥当かどうかを判定し、妥当でない場合は反例を構成する
- **基本原理**: 推論が妥当でないと仮定し、背理法により妥当性を証明

【反例（Counter-example）】
- **定義**: 前提がすべて真で、結論が偽となるような値の割り当て
- **重要性**: 推論が妥当でない場合の具体的証拠を提供

【タブローの手続き】
1. 推論が妥当でないと仮定（前提真、結論偽）
2. 複合論理式を部分論理式に分解
3. 矛盾が生じた枝を閉じる（×印）
4. すべての枝が閉じれば妥当、開いた枝があれば反例存在

【分解規則】
- **選言**: v(A∨B)=0 → v(A)=0かつv(B)=0 / v(A∨B)=1 → v(A)=1またはv(B)=1
- **連言**: v(A∧B)=0 → v(A)=0またはv(B)=0 / v(A∧B)=1 → v(A)=1かつv(B)=1
- **含意**: v(A→B)=0 → v(A)=1かつv(B)=0 / v(A→B)=1 → v(A)=0またはv(B)=1
- **否定**: v(¬A)=0 → v(A)=1 / v(¬A)=1 → v(A)=0
  `,

  // =============================================
  // === 3. 個別Q&A（必須） =====================
  // =============================================
  questionsAndAnswers: [
    { 
      id: 1, 
      rank: 'S', 
      question: '意味論的タブローとは何か説明しなさい。', 
      answer: '意味論的タブローとは、{{木構造を用いた妥当性の証明/反例の構成方法}}である。推論が妥当でないと仮定し、{{背理法}}により妥当性を証明する手法である。' 
    },
    { 
      id: 2, 
      rank: 'A', 
      question: '反例とは何か定義しなさい。', 
      answer: '反例とは、{{前提がすべて真で、結論が偽となるような値の割り当て}}の例である。推論が妥当でない場合の{{具体的証拠}}を提供する。' 
    },
    { 
      id: 3, 
      rank: 'A', 
      question: 'タブローで枝が閉じるとはどういう意味か。', 
      answer: '枝が閉じるとは、{{付値に矛盾が生じる}}ことを意味する。同じ命題変項に対して{{真と偽の両方}}が割り当てられた場合に×印をつけて枝を閉じる。' 
    },
    { 
      id: 4, 
      rank: 'S', 
      question: 'すべての枝が閉じた場合と開いた枝が残る場合の違いを説明しなさい。', 
      answer: 'すべての枝が閉じた場合は{{反例が存在しない}}ため推論が{{妥当}}である。開いた枝が残る場合は{{反例が存在}}するため推論は{{妥当でない}}。' 
    }
  ],

  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'タチバナ家のリビング。みかんが論理学の課題に取り組んでいる。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'なんで？この推論が妥当かどうかって、どうやって判断すればいいの？【id:1】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '姉ちゃん、意味論的タブローっていう方法があるんだよ。木構造を使って妥当性を証明したり反例を構成したりする方法だ。' },
    { type: 'narration', text: 'ユズヒコが教科書を開いて説明を始める。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: '例えば、P⇒P∧¬Qという推論を考えてみよう。まず、この推論が妥当でないと仮定するんだ。' },
    { type: 'embed', format: 'svg', title: 'タブローの構成例', description: 'P⇒P∧¬Qの反例構成過程', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="300" viewBox="0 0 600 300" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="300" y="30" text-anchor="middle" font-size="14" font-weight="bold">v(P) = 1, v(P∧¬Q) = 0</text><line x1="300" y1="40" x2="200" y2="80" stroke="#333" stroke-width="2"/><line x1="300" y1="40" x2="400" y2="80" stroke="#333" stroke-width="2"/><text x="150" y="100" text-anchor="middle" font-size="12">v(P) = 1, v(P) = 0</text><text x="450" y="100" text-anchor="middle" font-size="12">v(P) = 1, v(¬Q) = 0</text><text x="150" y="120" text-anchor="middle" font-size="16" fill="red">×</text><line x1="400" y1="110" x2="400" y2="150" stroke="#333" stroke-width="2"/><text x="400" y="170" text-anchor="middle" font-size="12">v(P) = 1, v(Q) = 1</text><rect x="350" y="180" width="100" height="30" fill="#e3f2fd" stroke="#1976d2" rx="5"/><text x="400" y="200" text-anchor="middle" font-size="12" font-weight="bold">反例発見</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>左の枝は矛盾（Pが真かつ偽）で閉じる。右の枝は開いたまま残り、v(P)=1, v(Q)=1が反例となる。</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'おお！左の枝は矛盾してるから×がついて、右の枝が残ってるってことは反例があるってことね！【id:2】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'そうそう！反例っていうのは、前提がすべて真で結論が偽になるような値の割り当てのことだからね。' },
    { type: 'narration', text: 'みかんが別の例を考えてみる。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: '今度はP⇒P∨¬Qっていう推論はどうかな？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '同じように妥当でないと仮定してみよう。v(P)=1かつv(P∨¬Q)=0だ。' },
    { type: 'embed', format: 'svg', title: '妥当な推論のタブロー', description: 'P⇒P∨¬Qの妥当性証明', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><svg width="100%" height="200" viewBox="0 0 600 200" style="background: white; border: 1px solid #ddd; border-radius: 4px;"><text x="300" y="30" text-anchor="middle" font-size="14" font-weight="bold">v(P) = 1, v(P∨¬Q) = 0</text><line x1="300" y1="40" x2="300" y2="80" stroke="#333" stroke-width="2"/><text x="300" y="100" text-anchor="middle" font-size="12">v(P) = 1, v(P) = 0, v(¬Q) = 0</text><text x="300" y="120" text-anchor="middle" font-size="16" fill="red">×</text><rect x="250" y="140" width="100" height="30" fill="#c8e6c9" stroke="#4caf50" rx="5"/><text x="300" y="160" text-anchor="middle" font-size="12" font-weight="bold">推論は妥当</text></svg><div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;"><strong>図の説明</strong><br/>選言v(P∨¬Q)=0となるには、v(P)=0かつv(¬Q)=0が必要だが、仮定のv(P)=1と矛盾するため枝が閉じる。</div></div>' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'あ！今度はすべての枝が閉じちゃった！ってことは反例がないから妥当な推論ってことね！【id:4】' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: 'その通り！背理法の原理で、反例が存在しないことが証明されたから推論は妥当だ。' },
    { type: 'narration', text: '演習問題に取り組むことにした。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'passionate', dialogue: '演習問題もやってみよう！P→(P∧¬P) ⇒¬Pはどうかな？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'thinking', dialogue: 'これは面白い問題だね。まず前提P→(P∧¬P)が真で、結論¬Pが偽になる場合を考えてみよう。' },
    { type: 'embed', format: 'html', title: '分解規則一覧', description: 'タブローで使用する主要な分解規則', content: '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; background: white;"><thead><tr style="background: #667eea; color: white;"><th style="padding: 12px; font-size: 12px;">論理式</th><th style="padding: 12px; font-size: 12px;">真の場合</th><th style="padding: 12px; font-size: 12px;">偽の場合</th></tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">A∨B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=1 または v(B)=1（枝分かれ）</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=0 かつ v(B)=0</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">A∧B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=1 かつ v(B)=1</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=0 または v(B)=0（枝分かれ）</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">A→B</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=0 または v(B)=1（枝分かれ）</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=1 かつ v(B)=0</td></tr><tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">¬A</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=0</td><td style="padding: 10px; border-bottom: 1px solid #e9ecef;">v(A)=1</td></tr></tbody></table></div>' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '結論¬Pが偽ということは、v(P)=1だ。そして前提P→(P∧¬P)が真になる条件を考えると...【id:3】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'P∧¬Pって矛盾してない？Pが真で同時に偽なんてありえないよね？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'いいところに気づいたね！P∧¬Pは常に偽だから、P→(P∧¬P)が真になるのはPが偽の場合だけなんだ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'あ！でも結論¬Pが偽だからv(P)=1なのに、前提が真になるにはv(P)=0じゃないといけない。これって矛盾じゃない？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'happy', dialogue: '正解！反例が存在しないから、この推論は妥当だよ。姉ちゃんもタブローの考え方がわかってきたね。' }
  ],

  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">意味論的タブローによる推論の妥当性判定</h3>
    <p class="mb-4">意味論的タブロー（semantic tableau）は、推論の妥当性を判定し、妥当でない場合には反例を構成する強力な手法です。木構造を用いて系統的に付値の可能性を探索します。</p>
    
    <h4 class="text-lg font-bold mt-6 mb-2">タブローの基本手続き</h4>
    <p class="mb-4">タブローは以下の4つのステップで進行します：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">仮定設定</span>：推論が妥当でないと仮定し、前提を真、結論を偽とする付値を設定</li>
      <li><span class="text-red-600 font-bold">分解処理</span>：複合論理式を分解規則に従って部分論理式の付値に展開</li>
      <li><span class="text-red-600 font-bold">矛盾検出</span>：同一命題変項に真と偽が同時に割り当てられた枝を閉じる（×印）</li>
      <li><span class="text-red-600 font-bold">結果判定</span>：すべての枝が閉じれば妥当、開いた枝があれば反例存在</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">分解規則の詳細</h4>
    <p class="mb-4">各論理結合子に対する分解規則は以下の通りです：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-blue-600 font-bold">選言（∨）</span>：真の場合は枝分かれ、偽の場合は両方偽</li>
      <li><span class="text-blue-600 font-bold">連言（∧）</span>：真の場合は両方真、偽の場合は枝分かれ</li>
      <li><span class="text-blue-600 font-bold">含意（→）</span>：真の場合は枝分かれ、偽の場合は前件真かつ後件偽</li>
      <li><span class="text-blue-600 font-bold">否定（¬）</span>：真偽を反転</li>
    </ul>
    
    <h4 class="text-lg font-bold mt-6 mb-2">演習問題の解法</h4>
    <p class="mb-4">第7回演習の各問題について、タブローによる解法を示します：</p>
    
    <p class="mb-2"><strong>(1) P→(P∧¬P) ⇒¬P</strong></p>
    <p class="mb-4">この推論では、P∧¬Pが矛盾式（常に偽）であることがポイントです。前提が真になるのはPが偽の場合のみですが、結論¬Pが偽（つまりPが真）という仮定と矛盾するため、推論は妥当です。</p>
    
    <p class="mb-2"><strong>(2) P, Q⇒¬(¬P→Q)</strong></p>
    <p class="mb-4">前提P, Qが真で結論¬(¬P→Q)が偽の場合を考えます。¬P→Qが真になる条件を分析すると、Pが真の場合は自動的に真になるため、反例は存在しません。</p>
    
    <p class="mb-2"><strong>(3) ¬(P∧Q), P∨Q, P↔Q⇒R</strong></p>
    <p class="mb-4">この問題では、前提の組み合わせが矛盾を含むかどうかを確認する必要があります。3つの前提がすべて真になる付値が存在しない場合、推論は自明に妥当となります。</p>
    
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">重要なポイント</h5>
      <p>タブローは真理表よりも効率的に妥当性を判定できる手法です。特に命題変項が多い場合や、早期に矛盾が発見できる場合に威力を発揮します。分解規則を正確に適用し、枝の管理を丁寧に行うことが成功の鍵です。</p>
    </div>
  `,

  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "タブローによる推論妥当性の判定",
      rank: "A",
      background: `論理学において、推論の妥当性を判定することは基本的かつ重要な作業です。真理表による方法もありますが、命題変項が多くなると計算量が指数的に増加します。意味論的タブローは、より効率的に妥当性を判定し、反例を構成する手法として広く用いられています。`,
      subProblems: [
        {
          title: "タブローの基本概念",
          rank: "A",
          relatedQAs: [1, 2],
          problem: "意味論的タブローの定義と基本的な手続きについて説明し、反例の概念との関係を明確にしなさい。",
          hint: "木構造、背理法、分解規則がキーワードです。",
          points: ["タブローの定義と目的", "基本手続きの4ステップ", "反例との関係", "背理法の原理"],
          modelAnswer: "意味論的タブローとは、木構造を用いて推論の妥当性を判定し、反例を構成する手法である。基本手続きは以下の通り：①推論が妥当でないと仮定して付値を設定、②分解規則に従って複合論理式を展開、③矛盾する枝を閉じる、④すべての枝が閉じれば妥当、開いた枝があれば反例存在。反例とは前提がすべて真で結論が偽となる付値であり、タブローはこの反例の存在を系統的に調べる。背理法により、反例が存在しなければ推論は妥当と結論できる。"
        },
        {
          title: "分解規則の適用",
          rank: "S",
          relatedQAs: [3, 4],
          problem: "推論「(P∨Q)∧¬P ⇒ Q」について、タブローを用いて妥当性を判定しなさい。各ステップの分解規則を明示し、枝の開閉を正確に示すこと。",
          hint: "連言と選言の分解規則に注意し、枝分かれのタイミングを正確に把握してください。",
          points: ["初期設定の正確性", "分解規則の正しい適用", "枝分かれの処理", "矛盾の検出", "結論の妥当性"],
          modelAnswer: "初期設定：v((P∨Q)∧¬P)=1, v(Q)=0と仮定。連言の分解により：v(P∨Q)=1, v(¬P)=1, v(Q)=0。否定の分解により：v(P∨Q)=1, v(P)=0, v(Q)=0。選言の分解により枝分かれ：左枝v(P)=1, v(P)=0, v(Q)=0（矛盾で閉じる）、右枝v(Q)=1, v(P)=0, v(Q)=0（矛盾で閉じる）。すべての枝が閉じるため、推論は妥当である。"
        }
      ]
    }
  ],

  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
