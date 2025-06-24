export default {
  // =============================================
  // === 1. モジュール基本情報（必須） ============
  // =============================================
  id: "kaishaho_boshu_kabushiki",
  title: "【会社法】募集株式の発行と新株予約権",
  category: "kaishaho",
  citation: "特に有利な金額・株式発行差止請求・募集株式発行無効・新株予約権",
  rank: "S",
  tags: ["会社法", "募集株式", "有利発行", "差止請求", "発行無効", "新株予約権"],
  rightSideCharacters: ['みかん'],
  // =============================================
  // === 2. 知識箱（キャラクター対話・解説用）（必須） ==
  // =============================================
  knowledgeBox: `
    【特に有利な金額の意義】
    - **一般的意義**：資金調達の目的からは時価より安価な発行が必要である場合があり、一方で既存株主の保護の観点からはできる限り時価に近い価格による発行が望ましい。そこで、「特に有利な金額」とは、公正価格と比較して特に低い金額であり、公正価格とは、資金調達の目的が達せられる限度で、旧株主にとって最も有利な価額（通常は株式の時価）をいう。【id:5】
    - **非上場会社における特殊性**：非上場会社が株主以外の者に新株を発行するに際し、客観的資料に基づく一応合理的な算定方法によって発行価額が決定されていたといえる場合には、その発行価額は、特別の事情のない限り、「特に有利な金額」に当たらない（最判平27.2.19）。【id:6】
    【株式発行差止請求】
    - **要件**：①「株主が不利益を受けるおそれ」があること（【会社法210条】柱書）、②「法令又は定款に違反する場合」（【会社法210条1号】）又は「著しく不公正な方法により行われる場合」（【会社法210条2号】）【id:7】
    - **「著しく不公正な方法」の意義**：特定株主の持株比率を低下させる等の目的が資金調達等の他の目的に優越し、それが主要目的といえる場合をいう。【id:8】
    【募集株式発行無効の訴え】
    - **訴訟要件**：①提訴期間（公開会社6か月、非公開会社1年）、②原告適格（株主等）、③被告適格（発行会社）【id:9】
    - **本案勝訴要件**：重大な法令・定款違反に限定される。【id:10】
    - **具体的無効事由の判断**：
      - 差止仮処分を無視した発行：無効（最判平5.12.16）【id:11】
      - 募集事項の通知・公告を欠く発行：原則無効、ただし差止原因がない場合は有効（最判平9.1.28）【id:12】
      - 著しく不公正な方法による発行：有効（最判平6.7.14）【id:13】
      - 公開会社における株主総会特別決議を欠く有利発行：有効（最判昭46.7.16）【id:14】
      - 非公開会社における株主総会特別決議を欠く発行：無効（最判平24.4.24）【id:15】
      - 公開会社における取締役会決議を欠く発行：有効（最判昭36.3.31）【id:17】
    【新株予約権】
    - **行使条件の委任**：会社法下では、新株予約権の行使条件は「新株予約権の内容」に含まれ、取締役会への委任はできない。【id:16】
    - **敵対的買収における新株予約権無償割当て**：株主の地位に実質的変動を及ぼすときには、【会社法247条】が類推適用される。【id:20】
  `,
  // =============================================
  // === 3. 個別Q&A（指示した場合のみ） =======================
  // =============================================
  questionsAndAnswers: [
    { id: 5, rank: 'A', question: '「特に有利な金額」（【会社法199条3項】）の意義について説明しなさい。', answer: '資金調達の目的からは、時価より安価な発行が必要である場合があり、一方で既存株主の保護の観点からは、できる限り時価に近い価格による発行が望ましい。そこで、「特に有利な金額」とは、{{公正価格と比較して特に低い金額}}であり、公正価格とは、{{資金調達の目的が達せられる限度で、旧株主にとって最も有利な価額}}({{通常は株式の時価}})をいう。' },
    { id: 6, rank: 'B', question: '非上場会社における「特に有利な金額」（【会社法199条2項】）の意義について説明しなさい。', answer: '非上場会社の株価の算定については、様々な評価手法が存在しているのであって、どのような場合にどの評価手法を用いるべきかについて明確な判断基準が確立されているというわけではなく、また、個々の評価手法においても、ある程度の幅のある判断要素が含まれていることが少なくない。とすれば、取締役会が、新株発行当時、{{客観的資料に基づく一応合理的な算定方法}}によって発行価額を決定していたにもかかわらず、裁判所が、事後的に、他の評価手法を用いたり、異なる予測値等を採用したりするなどして、改めて株価の算定を行った上、その算定結果と現実の発行価額とを比較して「特に有利な金額」に当たるか否かを判断するのは、{{取締役らの予測可能性を害する}}ことともなり、相当ではない。そこで、非上場会社が株主以外の者に新株を発行するに際し、客観的資料に基づく一応合理的な算定方法によって発行価額が決定されていたといえる場合には、その発行価額は、{{特別の事情のない限り}}、「特に有利な金額」に当たらない (最判平27.2.19)。' },
    { id: 7, rank: 'B', question: '株式発行差止請求（【会社法210条】）の要件について説明しなさい。', answer: '①「{{株主が不利益を受けるおそれ}}」があること（{{【会社法210条】柱書}}）、② 「{{法令又は定款に違反する場合}}」（{{【会社法210条1号】}}）又は「{{著しく不公正な方法により行われる場合}}」（{{【会社法210条2号】}}）' },
    { id: 8, rank: 'A', question: '「著しく不公正な方法」（【会社法210条2号】）の意義について説明しなさい。', answer: '募集株式の発行は{{資金調達等のために行われる}}ものであるから、資金調達等の目的を超えて、{{特定の株主の持株比率を下げること}}等を目的とする場合には、不公正な発行に当たる。したがって、「著しく不公正な方法」とは、{{特定株主の持株比率を低下させる等の目的が資金調達等の他の目的に優越し、それが主要目的といえる場合}}をいう(東京地決平元.7.25、東京高決平16.8.4)。※近時は敵対的買収等の場合に、募集株式の発行によって買収者に対抗することに{{必要性と合理性が認められる限り}}で、差止めを否定する方向性を示す裁判例もみられる(東京高決平17.3.23参照)。' },
    { id: 9, rank: 'B', question: '募集株式発行無効の訴え（【会社法828条1項2号】）の訴訟要件について説明しなさい。', answer: '①{{提訴期間}}=「株式の発行の効力が生じた日から{{6箇月以内}}({{公開会社でない株式会社}}にあっては、株式の発行の効力が生じた日から{{1年以内}})」（{{【会社法828条1項2号】}}）②{{原告適格}}= 「{{当該株式会社の株主等}}」（{{【会社法828条2項2号】}}）③{{被告適格}}=「{{株式の発行をした株式会社}}」 （{{【会社法834条2号】}}）' },
    { id: 10, rank: 'A', question: '募集株式発行無効の訴え（【会社法828条1項2号】）の本案勝訴要件(無効原因)について説明しなさい。', answer: '①募集株式の発行は{{取引行為としての色彩が強い}}ため、{{取引の安全を保護する必要}}があること、②{{利害関係人が多数発生}}するため、{{法的安定性を重視}}すべきであることから、{{重大な法令・定款違反}}に限定する。' },
    { id: 11, rank: 'A', question: '差止仮処分を無視した発行は無効となるかについて説明しなさい。', answer: '法が{{差止請求権を株主の権利として特に認めた}}（{{【会社法210条】}}）{{意味がなくなる}}ため、{{無効}}である(最判平5.12.16)。' },
    { id: 12, rank: 'A', question: '募集事項の通知・公告を欠く発行は無効となるかについて説明しなさい。', answer: '募集株式の発行事項の公示をなさなかった場合、{{差止請求権を行使する機会が奪われる}}から{{原則として無効原因}}であると解すべきである。もっとも、{{差止原因がない場合}}は、{{株主の利益を害さない}}ため、{{有効}}とすべきである({{会社が差止原因がないことの立証責任を負う}}) (最判平9.1.28)。' },
    { id: 13, rank: 'A', question: '著しく不公正な方法による発行は無効となるかについて説明しなさい。', answer: '① 株主は{{事前に差止めの機会が与えられている}}こと、②募集株式の発行は{{業務執行行為に準じるもの}}と考えられるため、著しく不公正な方法によることも{{内部事情にすぎない}}とみるべきであることから、{{有効}}である(最判平6.7.14)。' },
    { id: 14, rank: 'A', question: '公開会社における株主総会特別決議を欠く有利発行は無効となるかについて説明しなさい。', answer: '①{{内部手続にすぎない}}ため、{{利害関係人の保護が優先}}されるべきこと、②{{取締役に責任追及}}することによって損害を填補できる（{{【会社法429条】}}、{{【民法709条】}}）こと、③{{差止請求をすればよい}}ことから、{{有効}}である(最判昭46.7.16) (なお、会社法下では、公開会社であっても、有利発行の場合には株主総会の特別決議が要求される（{{【会社法201条1項】}}、{{【会社法199条3項】}}、{{【会社法309条2項5号】}}）ので、「内部手続にすぎない」という理由付けは用いにくい。)。' },
    { id: 15, rank: 'A', question: '非公開会社における株主総会特別決議を欠く発行は無効となるかについて説明しなさい。', answer: '非公開会社について、株主割当て以外の方法により募集株式を発行するためには、原則として{{株主総会の特別決議を要する}}こととされ（{{【会社法199条2項】}}、{{【会社法309条2項5号】}}）、また、募集株式発行無効の訴えの提訴期間を、公開会社においては、6か月とされているのに対し、非公開会社では{{1年}}とされている（{{【会社法828条1項2号】}}）。これは、非公開会社については、その性質上、{{持株比率の維持にかかる既存株主の利益の保護を重視}}し、その意思に反する株式の発行は募集株式発行無効の訴えにより救済するというのが法の趣旨である。したがって、{{無効}}である(最判平24.4.24)。' },
    { id: 16, rank: 'B', question: '(1)新株予約権の行使条件を取締役会に委任することができるか (2) (委任できるとして) 取締役会で決定された新株予約権の行使条件を取締役会限りで廃止できるかについて説明しなさい。', answer: '(1) 最判平24.4.24は、旧商法が適用される事案において、委任することができると判示した。しかし、{{会社法下では}}、新株予約権の行使条件は「{{新株予約権の内容}}」（{{【会社法238条1項1号】}}、{{【同条2項】}}、{{【会社法239条1項】}}）に含まれ、新株予約権の行使条件の決定を{{取締役会に委任することはできない}}と解される(同判決寺田裁判官補足意見)。(2) {{明示の委任がない限り}}、事後的に行使条件を変更する取締役会決議は、当該行使条件の{{細目的な変更にとどまるもの}}であるときを除き{{無効}}である(最判平24.4.24)。' },
    { id: 17, rank: 'A', question: '公開会社における取締役会決議を欠く募集株式の発行は無効となるかについて説明しなさい。', answer: '{{内部手続にすぎない}}ため、{{利害関係人の保護が優先}}されるべきであり、{{有効}}である(最判昭36.3.31)。' },
    { id: 18, rank: 'B', question: '支配株主の異動を伴う募集株式の発行等に関する特則である通知・公告（【会社法206条の2第1項・2項】）義務に違反した新株発行は無効となるかについて説明しなさい。', answer: '{{有効説}}=①募集事項の通知・公告（{{【会社法201条3項・4項】}}）が行われる限り、発行等の実施の事実や募集株式の数（{{【会社法199条1項1号】}}）を知ることができるため、{{株主は差止めを検討する余地が全くないとはいえない}}こと、②{{特別決議が必要となるわけではなく}}、また、反対株主が10%に満たなかった場合等には決議は不要となること、③最判平6.7.14は、発行された新株がその会社の取締役によって引き受けられ、現にその者が保有していること、会社が小規模で閉鎖的であること、といった事情があっても有効とする。よって、{{有効}}である。{{無効説}}=①通知・公告義務違反は、{{事前の株主の差止めの機会を奪う}}ものであること(最判平9.1.28参照)。②支配株主の異動を伴う株式発行は、{{会社の基礎の変更に当たる}}ため、株主が被る不利益は、有利発行のような純粋な経済的不利益ではないこと、③発行株式は支配株主の下にとどまっていることが通例であるから、{{取引安全への配慮が不要}}である。よって、{{無効}}である。' },
    { id: 19, rank: 'B', question: '支配株主の異動を伴う募集株式の発行等に関する特則である株主総会決議（【会社法206条の2第4項】）の欠缺の瑕疵ある新株発行は無効となるかについて説明しなさい(ただし書の要件は満たさないものとする)。', answer: '{{有効説}}=①株主総会の{{普通決議が必要となるにすぎない}}こと（{{【会社法309条】}}、{{【会社法206条の2第4項】}}）、②通知・公告により特定引受人に係る情報が公示されているため、{{差止めを検討する契機が株主に与えられている}}こと、③ 「当該公開会社の財産の状況が著しく悪化している場合において、当該公開会社の事業の継続のため緊急の必要があるとき」（{{【会社法206条の2第4項】ただし書}}）に当たるか否かは、{{不明確で、無効事由となると解すると法的安定性を欠く}}。よって、{{有効}}である。{{無効説}}=①支配株主の異動を伴う株式発行は、{{会社の基礎の変更に当たる}}ため、株主が被る不利益は、有利発行のような純粋な経済的不利益ではないこと。②発行株式は支配株主の下にとどまっていることが通例であるから、{{取引安全への配慮が不要}}であること、③会社には反対通知が10分の1以上の議決権比率に達したことを開示する義務がなく、{{株主がそれを知る手段を有さない}}ため、事前の差止めは難しいこと、④本特則は、だれが支配株主であるかということについての期待を一定程度保護するものということができるから、{{非公開会社において、株主総会決議を経ないでなされる発行等に近い}}と考えるべきである。よって、{{無効}}である。' },
    { id: 20, rank: 'B', question: '新株予約権無償割当てと敵対的買収に関して、(1)差止請求権の根拠 (2)法令・定款違反（【会社法247条1号】）として考えられる事由(敵対的買収を行った者は非適格者として新株予約権を行使できないとする条項が付されていたとする) 及びそれが認められるか否かに関する判断基準 (3) 「著しく不公正な方法」（【会社法247条2号】）の意義及びそれが認められるかについて説明しなさい(最決平19.8.7参照)。', answer: '(1) 新株予約権の無償割当てについて、{{【会社法247条】に相当する規定が設けられていない}}のは、新株予約権の無償割当ての場合、原則として{{株主の有する株式数に応じて割当てが行われる}}ため、株主において不利益を受けることはないと考えられたからにすぎない。したがって、無償割当てが{{株主の地位に実質的変動を及ぼす}}ときには、新株予約権の発行の差止請求の規定である{{【会社法247条】の規定が類推適用}}される。(2) {{株主平等原則違反}}（{{【会社法109条1項】}}）が考えられるところ、会社の企業価値が毀損され、株主の共同の利益が害されるような場合には、{{衡平の理念に反し、相当性を欠くというような事情がない限り}}、差別的取扱いも株主平等原則(の趣旨) に反しない。(3) 新株予約権は必ずしも資金調達の目的でなされるわけではなく、多種多様な目的でなされるから、「著しく不公正な方法」であるか否かは、{{当該目的実現のために必要性・相当性が認められるか}}という基準をもって判断すべき。' }
  ],
  // =============================================
  // === 4. 事案ストーリー（必須） ================
  // =============================================
  story: [
    { type: 'scene', text: 'みかんの高校・放課後の教室' },
    { type: 'narration', text: '放課後、みかん、吉岡、ゆかりんの3人が教室に残り、会社法の勉強をしている。今日のテーマは「募集株式の発行と新株予約権」のようだ。教室には夕日が差し込んでいる。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'desperate', dialogue: 'うーん、会社法って本当に複雑だよー。「特に有利な金額」って何？なんで安く株式を発行しちゃダメなの？【id:5】' },
    { type: 'dialogue', speaker: '吉岡', expression: 'passionate', dialogue: 'タチバナ、それは会社法の中でもすごく重要な論点だよ！会社が資金調達するには時価より安く発行する必要がある場合もあるけど、既存株主の保護も考えなきゃいけない。だから「特に有利な金額」っていうのは、公正価格と比較して特に低い金額のことで、公正価格っていうのは、資金調達の目的が達せられる限度で、旧株主にとって最も有利な価額、つまり通常は株式の時価のことなんだ。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'cool', dialogue: 'でも非上場会社の場合は特殊なのよ。市場価格がないから、色々な評価手法があって、どれを使うべきかの明確な基準がない。だから平成27年の最高裁判例では、客観的資料に基づく一応合理的な算定方法で発行価額を決定していれば、特別の事情がない限り「特に有利な金額」に当たらないとしてるの。' },
    
    // 株式発行の流れを視覚化する図表を追加
    { 
      type: 'embed', 
      format: 'svg',
      title: '募集株式発行の手続きフロー',
      description: '株式発行の各段階での判断基準と法的効果を整理した図表です。',
      content: `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <svg width="100%" height="400" viewBox="0 0 800 400" style="background: white; border: 1px solid #ddd; border-radius: 4px;">
            <!-- 発行前段階 -->
            <rect x="50" y="50" width="150" height="60" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="5"/>
            <text x="125" y="75" text-anchor="middle" font-size="12" font-weight="bold">取締役会決議</text>
            <text x="125" y="90" text-anchor="middle" font-size="10">募集事項決定</text>
            
            <!-- 価格判定 -->
            <rect x="250" y="30" width="140" height="50" fill="#fff3e0" stroke="#f57c00" stroke-width="2" rx="5"/>
            <text x="320" y="50" text-anchor="middle" font-size="11" font-weight="bold">特に有利な金額？</text>
            <text x="320" y="65" text-anchor="middle" font-size="9">時価との比較</text>
            
            <!-- YES分岐 -->
            <rect x="250" y="120" width="140" height="40" fill="#ffebee" stroke="#d32f2f" stroke-width="2" rx="5"/>
            <text x="320" y="140" text-anchor="middle" font-size="10" font-weight="bold">YES: 株主総会決議</text>
            <text x="320" y="150" text-anchor="middle" font-size="8">特別決議必要</text>
            
            <!-- NO分岐 -->
            <rect x="420" y="120" width="140" height="40" fill="#e8f5e8" stroke="#388e3c" stroke-width="2" rx="5"/>
            <text x="490" y="140" text-anchor="middle" font-size="10" font-weight="bold">NO: 取締役会権限</text>
            <text x="490" y="150" text-anchor="middle" font-size="8">そのまま発行可</text>
            
            <!-- 通知・公告 -->
            <rect x="300" y="200" width="200" height="40" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="2" rx="5"/>
            <text x="400" y="220" text-anchor="middle" font-size="11" font-weight="bold">募集事項の通知・公告</text>
            <text x="400" y="230" text-anchor="middle" font-size="8">【会社法201条3項・4項】</text>
            
            <!-- 差止請求 -->
            <rect x="550" y="180" width="120" height="60" fill="#fce4ec" stroke="#c2185b" stroke-width="2" rx="5"/>
            <text x="610" y="205" text-anchor="middle" font-size="10" font-weight="bold">差止請求可能</text>
            <text x="610" y="215" text-anchor="middle" font-size="8">【会社法210条】</text>
            <text x="610" y="225" text-anchor="middle" font-size="8">・法令定款違反</text>
            <text x="610" y="235" text-anchor="middle" font-size="8">・著しく不公正</text>
            
            <!-- 発行実行 -->
            <rect x="300" y="280" width="200" height="40" fill="#e1f5fe" stroke="#0277bd" stroke-width="2" rx="5"/>
            <text x="400" y="300" text-anchor="middle" font-size="11" font-weight="bold">株式発行実行</text>
            <text x="400" y="310" text-anchor="middle" font-size="8">効力発生</text>
            
            <!-- 無効の訴え -->
            <rect x="550" y="280" width="120" height="60" fill="#fff8e1" stroke="#ffa000" stroke-width="2" rx="5"/>
            <text x="610" y="305" text-anchor="middle" font-size="10" font-weight="bold">発行無効の訴え</text>
            <text x="610" y="315" text-anchor="middle" font-size="8">【会社法828条】</text>
            <text x="610" y="325" text-anchor="middle" font-size="8">重大な法令違反</text>
            <text x="610" y="335" text-anchor="middle" font-size="8">のみ無効</text>
            
            <!-- 矢印 -->
            <path d="M 200 80 L 240 60" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 320 80 L 320 110" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 360 55 L 450 55 L 450 110" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 320 160 L 360 190" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 490 160 L 440 190" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 400 240 L 400 270" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 500 220 L 540 210" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 500 300 L 540 310" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
            
            <!-- ラベル -->
            <text x="370" y="50" font-size="9" fill="#f57c00">判定</text>
            <text x="280" y="100" font-size="9" fill="#d32f2f">YES</text>
            <text x="430" y="100" font-size="9" fill="#388e3c">NO</text>
            
            <!-- 矢印マーカー定義 -->
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
              </marker>
            </defs>
          </svg>
          <div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 11px;">
            <strong>図表の説明：</strong><br>
            • <span style="color: #f57c00;">オレンジ</span>：判定段階　• <span style="color: #d32f2f;">赤</span>：株主総会決議必要　• <span style="color: #388e3c;">緑</span>：取締役会権限<br>
            • <span style="color: #7b1fa2;">紫</span>：必須手続　• <span style="color: #c2185b;">ピンク</span>：事前救済　• <span style="color: #ffa000;">黄</span>：事後救済
          </div>
        </div>
      `
    },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'じゃあ、もし会社が違法な株式発行をしようとしたら、株主はどうすればいいの？' },
    { type: 'dialogue', speaker: '吉岡', expression: 'serious', dialogue: '株式発行差止請求ができるんだ！特に「著しく不公正な方法」【id:8】っていうのは、特定株主の持株比率を低下させる等の目的が資金調達等の他の目的に優越して、それが主要目的といえる場合のことだよ。最近は敵対的買収の場面で、買収者に対抗するために募集株式を発行することに必要性と合理性が認められる限りで、差止めを否定する裁判例も出てるんだ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'でも、もし違法な株式発行が実際に行われちゃったらどうするの？' },
    
    // 無効事由の判断基準を整理した比較表を追加
    {
      type: 'embed',
      format: 'html',
      title: '募集株式発行無効事由の判断基準一覧',
      description: '各種手続違反について、判例が示した有効・無効の判断とその理由を整理した表です。',
      content: `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: bold;">手続違反の類型</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: bold;">効力</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: bold;">判断理由・判例</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: bold;">会社の種類</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px; font-size: 11px; font-weight: 500;">差止仮処分を無視した発行</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">無効</span>
                </td>
                <td style="padding: 10px; font-size: 10px;">差止請求権の実効性確保のため<br><span style="color: #666;">(最判平5.12.16)</span></td>
                <td style="padding: 10px; text-align: center; font-size: 10px;">全て</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef; background: #fafafa;">
                <td style="padding: 10px; font-size: 11px; font-weight: 500;">募集事項の通知・公告欠缺</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #fff3e0; color: #ef6c00; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">原則無効</span>
                </td>
                <td style="padding: 10px; font-size: 10px;">差止機会の剥奪、ただし差止原因なしは有効<br><span style="color: #666;">(最判平9.1.28)</span></td>
                <td style="padding: 10px; text-align: center; font-size: 10px;">全て</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px; font-size: 11px; font-weight: 500;">著しく不公正な方法</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">有効</span>
                </td>
                <td style="padding: 10px; font-size: 10px;">事前差止機会あり、内部事情にすぎない<br><span style="color: #666;">(最判平6.7.14)</span></td>
                <td style="padding: 10px; text-align: center; font-size: 10px;">全て</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef; background: #fafafa;">
                <td style="padding: 10px; font-size: 11px; font-weight: 500;">株主総会特別決議欠缺（有利発行）</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">有効</span>
                </td>
                <td style="padding: 10px; font-size: 10px;">内部手続違反、利害関係人保護優先<br><span style="color: #666;">(最判昭46.7.16)</span></td>
                <td style="padding: 10px; text-align: center; font-size: 10px;">公開会社</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px; font-size: 11px; font-weight: 500;">株主総会特別決議欠缺（第三者割当）</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">無効</span>
                </td>
                <td style="padding: 10px; font-size: 10px;">持株比率維持への既存株主利益保護<br><span style="color: #666;">(最判平24.4.24)</span></td>
                <td style="padding: 10px; text-align: center; font-size: 10px;">非公開会社</td>
              </tr>
              <tr style="background: #fafafa;">
                <td style="padding: 10px; font-size: 11px; font-weight: 500;">取締役会決議欠缺</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">有効</span>
                </td>
                <td style="padding: 10px; font-size: 10px;">内部手続違反、利害関係人保護優先<br><span style="color: #666;">(最判昭36.3.31)</span></td>
                <td style="padding: 10px; text-align: center; font-size: 10px;">公開会社</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 16px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 6px; font-size: 11px;">
            <strong>判断基準のポイント：</strong><br>
            • <strong>取引安全vs株主保護</strong>：公開会社では取引安全重視、非公開会社では株主保護重視<br>
            • <strong>内部手続vs外部効果</strong>：内部手続違反は原則有効、外部的効果に影響する違反は無効の可能性<br>
            • <strong>事前救済の有無</strong>：差止請求の機会があるかが重要な判断要素
          </div>
        </div>
      `
    },
    
    { type: 'dialogue', speaker: '吉岡', expression: 'passionate', dialogue: 'それが「募集株式発行無効の訴え」なんだ！本案勝訴要件としては、重大な法令・定款違反に限定される【id:10】。これは取引の安全と法的安定性を重視してるからなんだよ。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'serious', dialogue: '具体的にどんな場合が無効になるかは、判例の積み重ねがあるの。例えば、差止仮処分を無視した発行は無効【id:11】、募集事項の通知・公告を欠く発行は原則無効だけど差止原因がない場合は有効【id:12】とかね。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'えー、でも著しく不公正な方法による発行はどうなの？' },
    { type: 'dialogue', speaker: '吉岡', expression: 'normal', dialogue: '実は著しく不公正な方法による発行は有効なんだ【id:13】。株主は事前に差止めの機会が与えられてるし、募集株式の発行は業務執行行為に準じるから、著しく不公正な方法も内部事情にすぎないって考えられてるんだ。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'impressed', dialogue: '公開会社と非公開会社で扱いが違うのも面白いところよ。公開会社における株主総会特別決議を欠く有利発行は有効【id:14】なの。内部手続にすぎないし、取締役に責任追及できるし、差止請求もできるからって理由ね。ただし、会社法下では公開会社でも有利発行には株主総会の特別決議が必要だから、この理由付けは使いにくくなってるけど。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'じゃあ非公開会社はどうなの？' },
    { type: 'dialogue', speaker: '吉岡', expression: 'serious', dialogue: '非公開会社における株主総会特別決議を欠く発行は無効【id:15】なんだ。非公開会社では持株比率の維持にかかる既存株主の利益の保護を重視してるからね。平成24年の最高裁判例で明確になった。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'cool', dialogue: 'あと、公開会社における取締役会決議を欠く募集株式の発行も有効【id:17】とされてる。これも内部手続にすぎないから、利害関係人の保護が優先されるっていう考え方ね。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'ところで、新株予約権って何？' },
    { type: 'dialogue', speaker: '吉岡', expression: 'passionate', dialogue: '新株予約権は、将来一定の条件で株式を取得できる権利のことだよ！でも会社法下では、新株予約権の行使条件は「新株予約権の内容」に含まれるから、取締役会に委任することはできないんだ【id:16】。これは平成24年の最高裁判例で明確になった。明示の委任がない限り、事後的に行使条件を変更する取締役会決議も、細目的な変更にとどまるものを除いて無効なんだよ。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'normal', dialogue: '新株予約権は敵対的買収の防衛策としても使われるのよ【id:20】。新株予約権の無償割当てが株主の地位に実質的変動を及ぼすときには、【会社法247条】が類推適用されて、差止請求ができることになる。株主平等原則違反が問題になるけど、会社の企業価値が毀損される場合には、衡平の理念に反し相当性を欠く事情がない限り、差別的取扱いも許容されるの。' },
    
    // 新株予約権による敵対的買収防衛の仕組みを図解
    {
      type: 'embed',
      format: 'svg',
      title: '新株予約権による敵対的買収防衛の仕組み',
      description: 'ライツプランなどの敵対的買収防衛策で使われる新株予約権の仕組みを図解したものです。',
      content: `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <svg width="100%" height="480" viewBox="0 0 900 480" style="background: white; border: 1px solid #ddd; border-radius: 4px;">
            <!-- タイトル -->
            <text x="450" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">新株予約権による敵対的買収防衛（ライツプラン）</text>
            
            <!-- ステップ1: 平常時 -->
            <rect x="50" y="60" width="200" height="80" fill="#e8f5e8" stroke="#4caf50" stroke-width="2" rx="8"/>
            <text x="150" y="85" text-anchor="middle" font-size="12" font-weight="bold">STEP 1: 平常時</text>
            <text x="150" y="105" text-anchor="middle" font-size="10">全株主に新株予約権を</text>
            <text x="150" y="120" text-anchor="middle" font-size="10">無償で割当て</text>
            
            <!-- ステップ2: 敵対的買収開始 -->
            <rect x="350" y="60" width="200" height="80" fill="#fff3e0" stroke="#ff9800" stroke-width="2" rx="8"/>
            <text x="450" y="85" text-anchor="middle" font-size="12" font-weight="bold">STEP 2: 買収開始</text>
            <text x="450" y="105" text-anchor="middle" font-size="10">買収者が一定割合</text>
            <text x="450" y="120" text-anchor="middle" font-size="10">（例：15%）以上取得</text>
            
            <!-- ステップ3: 発動 -->
            <rect x="650" y="60" width="200" height="80" fill="#ffebee" stroke="#f44336" stroke-width="2" rx="8"/>
            <text x="750" y="85" text-anchor="middle" font-size="12" font-weight="bold">STEP 3: 発動</text>
            <text x="750" y="105" text-anchor="middle" font-size="10">買収者以外の株主のみ</text>
            <text x="750" y="120" text-anchor="middle" font-size="10">新株予約権行使可能</text>
            
            <!-- 新株予約権の内容 -->
            <rect x="50" y="180" width="300" height="120" fill="#f3e5f5" stroke="#9c27b0" stroke-width="2" rx="8"/>
            <text x="200" y="205" text-anchor="middle" font-size="12" font-weight="bold">新株予約権の内容</text>
            <text x="70" y="230" font-size="10">• 行使価格：市価の50%など</text>
            <text x="70" y="250" font-size="10">• 行使条件：買収者以外の株主のみ</text>
            <text x="70" y="270" font-size="10">• 発動要件：15%以上の買収など</text>
            <text x="70" y="290" font-size="10">• 効果：買収者の持株比率希釈化</text>
            
            <!-- 法的問題 -->
            <rect x="400" y="180" width="450" height="120" fill="#e1f5fe" stroke="#03a9f4" stroke-width="2" rx="8"/>
            <text x="625" y="205" text-anchor="middle" font-size="12" font-weight="bold">法的検討事項</text>
            <text x="420" y="230" font-size="10">1. <strong>株主平等原則</strong>（【会社法109条1項】）：</text>
            <text x="440" y="245" font-size="9">買収者のみ行使できない ⇨ 差別的取扱い</text>
            <text x="420" y="265" font-size="10">2. <strong>企業価値毀損の判断</strong>：</text>
            <text x="440" y="280" font-size="9">衡平の理念に反し相当性を欠く事情がない限り適法</text>
            <text x="420" y="295" font-size="10">3. <strong>必要性・相当性</strong>：当該目的実現のために必要か</text>
            
            <!-- 効果の図示 -->
            <text x="450" y="340" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">買収防衛効果</text>
            
            <!-- 発動前の持株比率 -->
            <g transform="translate(150, 360)">
              <text x="0" y="-10" text-anchor="middle" font-size="11" font-weight="bold">発動前</text>
              <circle cx="0" cy="0" r="40" fill="#ffcdd2" stroke="#f44336" stroke-width="2"/>
              <text x="0" y="-5" text-anchor="middle" font-size="10">買収者</text>
              <text x="0" y="8" text-anchor="middle" font-size="10" font-weight="bold">20%</text>
              
              <circle cx="80" cy="0" r="60" fill="#c8e6c9" stroke="#4caf50" stroke-width="2"/>
              <text x="80" y="-5" text-anchor="middle" font-size="10">その他株主</text>
              <text x="80" y="8" text-anchor="middle" font-size="10" font-weight="bold">80%</text>
            </g>
            
            <!-- 矢印 -->
            <path d="M 350 380 L 400 380" stroke="#333" stroke-width="3" marker-end="url(#arrowhead2)"/>
            <text x="375" y="375" text-anchor="middle" font-size="10" font-weight="bold">権利行使</text>
            
            <!-- 発動後の持株比率 -->
            <g transform="translate(550, 360)">
              <text x="0" y="-10" text-anchor="middle" font-size="11" font-weight="bold">発動後</text>
              <circle cx="0" cy="0" r="25" fill="#ffcdd2" stroke="#f44336" stroke-width="2"/>
              <text x="0" y="-5" text-anchor="middle" font-size="9">買収者</text>
              <text x="0" y="6" text-anchor="middle" font-size="9" font-weight="bold">10%</text>
              
              <circle cx="80" cy="0" r="70" fill="#c8e6c9" stroke="#4caf50" stroke-width="2"/>
              <text x="80" y="-5" text-anchor="middle" font-size="10">その他株主</text>
              <text x="80" y="8" text-anchor="middle" font-size="10" font-weight="bold">90%</text>
            </g>
            
            <!-- 接続線 -->
            <path d="M 250 100 L 340 100" stroke="#666" stroke-width="2" marker-end="url(#arrowhead2)"/>
            <path d="M 550 100 L 640 100" stroke="#666" stroke-width="2" marker-end="url(#arrowhead2)"/>
            
            <!-- 吹き出し -->
            <path d="M 750 160 L 750 180 L 740 170 Z" fill="#ffeb3b"/>
            <rect x="680" y="140" width="140" height="25" fill="#ffeb3b" stroke="#fbc02d" rx="4"/>
            <text x="750" y="155" text-anchor="middle" font-size="9" font-weight="bold">買収阻止効果！</text>
            
            <!-- 矢印マーカー定義 -->
            <defs>
              <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
              </marker>
            </defs>
          </svg>
          <div style="margin-top: 16px; padding: 12px; background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%); color: white; border-radius: 6px; font-size: 11px;">
            <strong>ポイント：</strong> 新株予約権による買収防衛は、株主平等原則との衝突が問題となるが、企業価値の毀損を防ぐために必要性・相当性が認められる場合には適法とされる。最決平19.8.7は、この判断基準を明確化した重要な判例である。
          </div>
        </div>
      `
    },
    
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'ところで、支配株主が変わるような大きな株式発行の場合って、特別なルールがあるの？' },
    { type: 'dialogue', speaker: '吉岡', expression: 'serious', dialogue: 'いい質問だね！支配株主の異動を伴う募集株式の発行には特則があるんだ。まず通知・公告義務【id:18】があって、これに違反した場合の効力については学説が分かれてる。有効説は、通常の募集事項の通知・公告があれば差止めを検討する余地があるから有効だとするけど、無効説は、事前の差止めの機会を奪うし、会社の基礎の変更に当たるから無効だとするんだ。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'serious', dialogue: 'さらに株主総会決議の欠缺【id:19】についても学説対立があるの。有効説は、普通決議で足りるし、通知・公告で情報が公示されてるから有効だとする。でも無効説は、支配株主の異動は会社の基礎の変更だし、株主が反対通知の状況を知る手段がないから事前の差止めが困難だとして無効だとするのよ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'なるほど！会社法って、色々な利害関係者のバランスを取ってるんだね。' },
    { type: 'dialogue', speaker: '吉岡', expression: 'happy', dialogue: 'その通り！株主保護と取引安全、資金調達の必要性と既存株主の利益、色々な要請を調整してるんだ。だからこそ面白いし、実務でも重要なんだよ。' },
    { type: 'dialogue', speaker: 'ゆかりん', expression: 'serious', dialogue: '特に2025年の司法試験では、これらの論点が複合的に出題されることが多いから、それぞれの制度の趣旨と相互関係をしっかり理解しておくことが大切よ。デジタル化の進展で株主総会のオンライン開催や電子投票も普及してるから、手続違反の論点もより複雑になってきてるしね。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: '今日はすごく勉強になった！吉岡とゆかりんのおかげで、会社法の全体像が見えてきたよ。ありがとう！' },
    { type: 'narration', text: '3人は満足そうに教室を後にした。校舎の向こうに夕日が沈んでいく。' }
  ],
  // =============================================
  // === 5. 判旨と解説（必須） ====================
  // =============================================
  explanation: `
    <h3 class="text-xl font-bold mb-4">募集株式の発行と新株予約権の法的枠組み</h3>
    <p class="mb-4">会社法における募集株式の発行と新株予約権は、会社の資金調達と既存株主の利益保護、取引安全の確保という複数の要請を調整する重要な制度です。これらの論点は、実務において頻繁に問題となり、司法試験でも最重要の出題分野となっています。</p>
    <h4 class="text-lg font-bold mt-6 mb-2">1. 「特に有利な金額」の意義【id:5】【id:6】</h4>
    <p class="mb-4">**「特に有利な金額」**とは、公正価格と比較して特に低い金額を指します。ここで「公正価格」とは、資金調達の目的が達せられる限度で、旧株主にとって最も有利な価額（通常は株式の時価）をいいます【id:5】。</p>
    <p class="mb-4">この概念は、会社の資金調達の必要性と既存株主の利益保護の調整を図るものです。時価より安価な発行が資金調達上必要な場合もある一方で、既存株主の持株価値の希釈化を防ぐため、できる限り時価に近い価格での発行が望ましいという相反する要請を調整しています。</p>
    <p class="mb-4">**非上場会社**においては、市場価格が存在しないため、判断がより複雑になります。最判平27.2.19は、「客観的資料に基づく一応合理的な算定方法によって発行価額が決定されていたといえる場合には、その発行価額は、特別の事情のない限り、『特に有利な金額』に当たらない」と判示しました【id:6】。これは、取締役の予測可能性を確保し、事後的な司法審査の限界を明確にした重要な判例です。</p>
    <h4 class="text-lg font-bold mt-6 mb-2">2. 株式発行差止請求【id:7】【id:8】</h4>
    <p class="mb-4">株式発行差止請求は、違法・不当な株式発行を事前に阻止するための重要な株主の権利です。要件は以下の通りです【id:7】：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">株主が不利益を受けるおそれ</span>があること（【会社法210条】柱書）</li>
      <li><span class="text-red-600 font-bold">法令又は定款に違反する場合</span>（【会社法210条1号】）又は<span class="text-red-600 font-bold">著しく不公正な方法により行われる場合</span>（【会社法210条2号】）</li>
    </ul>
    <p class="mb-4">「**著しく不公正な方法**」については、特定株主の持株比率を低下させる等の目的が資金調達等の他の目的に優越し、それが主要目的といえる場合をいうとされています【id:8】。近時は、敵対的買収への対抗として募集株式を発行することに必要性と合理性が認められる限りで、差止めを否定する裁判例も見られます。</p>
    <h4 class="text-lg font-bold mt-6 mb-2">3. 募集株式発行無効の訴え【id:9】-【id:17】</h4>
    <p class="mb-4">募集株式発行無効の訴えは、既に発行された株式の効力を争う手続です。</p>
    <h5 class="text-lg font-semibold mt-4 mb-2">訴訟要件【id:9】</h5>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">提訴期間</span>：公開会社6か月、非公開会社1年</li>
      <li><span class="text-red-600 font-bold">原告適格</span>：当該株式会社の株主等</li>
      <li><span class="text-red-600 font-bold">被告適格</span>：株式の発行をした株式会社</li>
    </ul>
    <h5 class="text-lg font-semibold mt-4 mb-2">本案勝訴要件【id:10】</h5>
    <p class="mb-4">無効事由は**重大な法令・定款違反**に限定されます。これは、①募集株式の発行が取引行為としての色彩が強く取引の安全を保護する必要があること、②利害関係人が多数発生するため法的安定性を重視すべきことによります。</p>
    <h5 class="text-lg font-semibold mt-4 mb-2">具体的無効事由の判断</h5>
    <p class="mb-4">判例は、以下のような基準を示しています：</p>
    <table class="w-full border-collapse border border-gray-300 mb-4">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2">事由</th>
          <th class="border border-gray-300 p-2">効力</th>
          <th class="border border-gray-300 p-2">判例</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-gray-300 p-2">差止仮処分を無視した発行【id:11】</td>
          <td class="border border-gray-300 p-2 font-bold text-red-600">無効</td>
          <td class="border border-gray-300 p-2">最判平5.12.16</td>
        </tr>
        <tr>
          <td class="border border-gray-300 p-2">募集事項の通知・公告を欠く発行【id:12】</td>
          <td class="border border-gray-300 p-2">原則無効、例外的に有効</td>
          <td class="border border-gray-300 p-2">最判平9.1.28</td>
        </tr>
        <tr>
          <td class="border border-gray-300 p-2">著しく不公正な方法による発行【id:13】</td>
          <td class="border border-gray-300 p-2 font-bold text-blue-600">有効</td>
          <td class="border border-gray-300 p-2">最判平6.7.14</td>
        </tr>
        <tr>
          <td class="border border-gray-300 p-2">公開会社の株主総会特別決議を欠く有利発行【id:14】</td>
          <td class="border border-gray-300 p-2 font-bold text-blue-600">有効</td>
          <td class="border border-gray-300 p-2">最判昭46.7.16</td>
        </tr>
        <tr>
          <td class="border border-gray-300 p-2">非公開会社の株主総会特別決議を欠く発行【id:15】</td>
          <td class="border border-gray-300 p-2 font-bold text-red-600">無効</td>
          <td class="border border-gray-300 p-2">最判平24.4.24</td>
        </tr>
      </tbody>
    </table>
    <h4 class="text-lg font-bold mt-6 mb-2">4. 新株予約権【id:16】【id:20】</h4>
    <p class="mb-4">**新株予約権**は、将来一定の条件で株式を取得できる権利です。会社法下では、新株予約権の行使条件は「新株予約権の内容」に含まれ、取締役会への委任はできないとされています【id:16】。</p>
    <p class="mb-4">**敵対的買収における新株予約権無償割当て**については、株主の地位に実質的変動を及ぼすときには、【会社法247条】が類推適用されます【id:20】。この場合の判断基準として、以下が重要です：</p>
    <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
      <li><span class="text-red-600 font-bold">株主平等原則</span>：会社の企業価値が毀損され、株主の共同の利益が害される場合には、衡平の理念に反し相当性を欠く事情がない限り、差別的取扱いも株主平等原則(の趣旨) に反しない。(最決平19.8.7)</li>
      <li><span class="text-red-600 font-bold">著しく不公正な方法</span>：当該目的実現のために必要性・相当性が認められるかという基準で判断される</li>
    </ul>
    <div class="bg-yellow-100 p-4 rounded-lg mt-6">
      <h5 class="font-bold text-yellow-800">司法試験に向けたポイント</h5>
      <p>この分野では、まず**「特に有利な金額」の意義**を正確に理解し、上場会社と非上場会社での判断の違いを説明できることが重要です。**株式発行差止請求**については、要件を正確に記憶し、特に「著しく不公正な方法」の判断基準を具体的事例に適用できるようにしてください。**募集株式発行無効の訴え**では、訴訟要件と本案勝訴要件を明確に区別し、具体的無効事由について判例の立場を整理して覚えることが必要です。特に公開会社と非公開会社での扱いの違い、内部手続違反と外部的瑕疵の区別が重要です。**新株予約権**については、敵対的買収防衛策としての機能と、その際の株主平等原則との調整について論じられるように準備が必要です。</p>
    </div>
  `,
  // =============================================
  // === 6. ミニ論文問題（必須） ==================
  // =============================================
  quiz: [
    {
      title: "特に有利な金額と株式発行差止請求",
      rank: "A",
      background: `
        上場会社である株式会社あたしんちカンパニー（発行済株式総数100万株、1株当たり時価1000円）の取締役会は、業績不振による資金不足を理由として、第三者である水島商事に対し、1株当たり700円で新株15万株を発行することを決議した。
        この発行により、水島商事の持株比率は13%となり、既存株主の持株比率は大幅に希釈化される。
        株主である吉岡は、この株式発行について差止請求を検討している。
      `,
      subProblems: [
        {
          title: "特に有利な金額該当性と著しく不公正な方法",
          rank: "A",
          relatedQAs: [5, 8],
          problem: "本件株式発行について、①「特に有利な金額」に該当するか、②「著しく不公正な方法」に該当するかを検討しなさい。",
          hint: "特に有利な金額の意義と著しく不公正な方法の判断基準を整理しましょう。",
          points: ["特に有利な金額の意義【id:5】", "著しく不公正な方法の意義【id:8】", "資金調達目的との関係"],
          modelAnswer: "①「特に有利な金額」該当性：「特に有利な金額」とは、公正価格と比較して特に低い金額であり、公正価格とは、資金調達の目的が達せられる限度で、旧株主にとって最も有利な価額（通常は株式の時価）をいう【id:5】。本件では時価1000円に対し700円（時価の7割）での発行であり、一般的基準（時価の9割）を大幅に下回るため、「特に有利な金額」に該当する。②「著しく不公正な方法」該当性：「著しく不公正な方法」とは、特定株主の持株比率を低下させる等の目的が資金調達等の他の目的に優越し、それが主要目的といえる場合をいう【id:8】。本件では既存株主の持株比率を大幅に希釈化させる効果があり、資金調達の必要性を超えて支配権に影響を与える可能性があるため、著しく不公正な方法に該当する可能性がある。"
        }
      ]
    },
    {
      title: "募集株式発行無効の訴えと各種手続違反",
      rank: "A",
      background: `
        非公開会社である株式会社タチバナ商事において、以下の株式発行が行われた：
        ①株主総会の特別決議を経ずに、第三者割当により新株100株を発行
        ②裁判所の差止仮処分決定があったにもかかわらず、これを無視して新株発行を実行
        ③募集事項の通知・公告を一切行わずに新株発行を実行
        ④著しく不公正な方法（支配権奪取目的）により新株発行を実行
        ⑤新株予約権の行使条件を取締役会に委任し、後に取締役会限りで行使条件を廃止
        株主らは、これらの発行の無効を求めている。
      `,
      subProblems: [
        {
          title: "各種手続違反による発行の無効事由",
          rank: "A",
          relatedQAs: [10, 11, 12, 13, 14, 15, 16, 17],
          problem: "上記①～⑤の各発行について、募集株式発行無効の訴えにおける無効事由となるか、それぞれ検討しなさい。",
          hint: "各手続違反について、判例の立場を踏まえて無効事由該当性を判断しましょう。",
          points: ["募集株式発行無効の本案勝訴要件【id:10】", "差止仮処分無視【id:11】", "通知・公告欠缺【id:12】", "著しく不公正な方法【id:13】", "公開会社の有利発行【id:14】", "非公開会社の株主総会決議欠缺【id:15】", "新株予約権の行使条件【id:16】", "取締役会決議欠缺【id:17】"],
          modelAnswer: "募集株式発行無効の本案勝訴要件は、重大な法令・定款違反に限定される【id:10】。①非公開会社における株主総会特別決議を欠く発行：無効。非公開会社では持株比率の維持にかかる既存株主の利益保護を重視するため（最判平24.4.24）【id:15】。②差止仮処分を無視した発行：無効。法が差止請求権を株主の権利として特に認めた意味がなくなるため（最判平5.12.16）【id:11】。③募集事項の通知・公告を欠く発行：原則無効。差止請求権を行使する機会が奪われるため。ただし差止原因がない場合は有効（最判平9.1.28）【id:12】。④著しく不公正な方法による発行：有効。株主は事前に差止めの機会が与えられており、内部事情にすぎないため（最判平6.7.14）【id:13】。⑤新株予約権の行使条件の取締役会委任・廃止：会社法下では新株予約権の行使条件は「新株予約権の内容」に含まれ、取締役会への委任はできず、明示の委任なく事後的変更も原則無効（最判平24.4.24）【id:16】。"
        }
      ]
    }
  ],
  // =============================================
  // === 7. 論文トレーニング（廃止） =============
  // =============================================
  essay: null
};
