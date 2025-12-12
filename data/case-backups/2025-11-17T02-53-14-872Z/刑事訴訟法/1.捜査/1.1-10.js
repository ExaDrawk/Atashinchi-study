export default {
  // === 1. モジュール基本情報（必須） ============
  title: "捜査の基本",
  citation: "母、プリン消失事件っ！",
  rank: "A",
  tags: ["刑事訴訟法", "捜査", "人権", "令状主義"],
  rightSideCharacters: ['ユズヒコ'],

  // === 2. 個別Q&A（必須） =====================
  // 🚨警告🚨 answerを省略禁止！「...」「省略」「以下略」等は絶対に使用するな！
  // 🚨警告🚨 各answerは完全で詳細な内容を必ず記述せよ！
  questionsAndAnswers: [
          {
              "id": 1,
              "rank": "A",
              "question": "捜査の意義について説明しなさい。",
              "answer": "{{捜査機関}}が{{犯罪}}が発生したと考えるときに、{{公訴}}の{{提起}}・{{遂行}}のため、{{犯人}}を{{発見}}・{{保全}}し、{{証拠}}を{{収集}}・{{確保}}する{{行為}}をいう。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {
                      "1": {
                          "level": 1,
                          "focus": "捜査の意義の正確な定義と構成要素の理解",
                          "sections": [
                              {
                                  "title": "捜査の定義とその目的",
                                  "summary": "捜査とは、単に犯人を捕まえるだけでなく、公訴を適切に提起し、遂行するために必要な証拠を集める一連の活動です。その定義を正確に理解することは、刑事訴訟法の学習において非常に重要となります。",
                                  "tips": [
                                      "捜査は「公訴の提起・遂行」という最終的な目的のために行われることを意識しましょう。",
                                      "「犯人の発見・保全」と「証拠の収集・確保」という二つの主要な活動側面から捉えましょう。",
                                      "捜査機関が主体となる公的な活動であることを理解しましょう。"
                                  ],
                                  "importance": "★★★"
                              }
                          ],
                          "blanks": [
                              {
                                  "id": "B1",
                                  "prompt": "捜査の主体となるのは？",
                                  "answer": "捜査機関",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B2",
                                  "prompt": "捜査は何が発生したと考えるときに開始されるか？",
                                  "answer": "犯罪",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B3",
                                  "prompt": "捜査の最終目的となるのは何のためか？",
                                  "answer": "公訴",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B4",
                                  "prompt": "公訴について最初に行われる行為は？",
                                  "answer": "提起",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B5",
                                  "prompt": "公訴について、提起された後に行われる行為は？",
                                  "answer": "遂行",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B6",
                                  "prompt": "公訴のために、捜査の対象となるのは誰か？",
                                  "answer": "犯人",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B7",
                                  "prompt": "犯人に対して行われる最初の行為は？",
                                  "answer": "発見",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B8",
                                  "prompt": "発見された犯人に対して行われる、身柄などを確保する行為は？",
                                  "answer": "保全",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B9",
                                  "prompt": "犯人以外に、公訴のために収集・確保されるのは何か？",
                                  "answer": "証拠",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B10",
                                  "prompt": "証拠に対して行われる最初の行為は？",
                                  "answer": "収集",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B11",
                                  "prompt": "収集された証拠を失われないようにする行為は？",
                                  "answer": "確保",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B12",
                                  "prompt": "これら一連の活動を総称して何と呼ぶか？",
                                  "answer": "行為",
                                  "placeholder": "名詞"
                              }
                          ],
                          "evaluationRubric": {
                              "overall": "「捜査」の定義を構成する主要な要素（主体、対象、目的、内容、結果）を正確に記述できているかを確認します。特に、公訴の提起・遂行という目的と、犯人の発見・保全、証拠の収集・確保という具体的な行為内容を網羅しているかが採点ポイントです。",
                              "perBlank": "各空欄において、捜査の定義を構成する適切なキーワード（名詞、動詞）が正確に記述されているかを確認します。特に、「提起・遂行」「発見・保全」「収集・確保」といった対になる概念や、それらの順序を理解しているかが重要です。"
                          },
                          "inlineBody": [
                              {
                                  "type": "text",
                                  "text": "捜査とは、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B1",
                                  "label": "(1)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "が"
                              },
                              {
                                  "type": "blank",
                                  "id": "B2",
                                  "label": "(2)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "が発生したと考えるときに、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B3",
                                  "label": "(3)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "の"
                              },
                              {
                                  "type": "blank",
                                  "id": "B4",
                                  "label": "(4)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "・"
                              },
                              {
                                  "type": "blank",
                                  "id": "B5",
                                  "label": "(5)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "のため、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B6",
                                  "label": "(6)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "を"
                              },
                              {
                                  "type": "blank",
                                  "id": "B7",
                                  "label": "(7)",
                                  "placeholder": "動詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "・"
                              },
                              {
                                  "type": "blank",
                                  "id": "B8",
                                  "label": "(8)",
                                  "placeholder": "動詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "し、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B9",
                                  "label": "(9)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "を"
                              },
                              {
                                  "type": "blank",
                                  "id": "B10",
                                  "label": "(10)",
                                  "placeholder": "動詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "・"
                              },
                              {
                                  "type": "blank",
                                  "id": "B11",
                                  "label": "(11)",
                                  "placeholder": "動詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "する"
                              },
                              {
                                  "type": "blank",
                                  "id": "B12",
                                  "label": "(12)",
                                  "placeholder": "名詞",
                                  "newline": false
                              },
                              {
                                  "type": "text",
                                  "text": "をいう。"
                              }
                          ],
                          "writingGoals": [
                              "「捜査」の定義を構成する各要素（主体、対象、目的、内容、結果）を正確に把握できること。",
                              "与えられたキーワードを用いて、一つの文章として論理的かつ簡潔に定義を記述できること。",
                              "特に「公訴の提起・遂行」と「犯人の発見・保全」、「証拠の収集・確保」が、それぞれ目的と手段の関係にあることを理解して定義を捉えること。"
                          ],
                          "qaId": 1,
                          "moduleId": "刑事訴訟法/1.捜査/1.1-10",
                          "moduleTitle": "捜査の基本",
                          "relativePath": "刑事訴訟法/1.捜査/1.1-10",
                          "question": "捜査の意義について説明しなさい。",
                          "canonicalAnswer": "捜査機関が犯罪が発生したと考えるときに、公訴の提起・遂行のため、犯人を発見・保全し、証拠を収集・確保する行為をいう。",
                          "canonicalBlanks": [
                              {
                                  "id": "B1",
                                  "answer": "捜査機関",
                                  "raw": "{{捜査機関}}"
                              },
                              {
                                  "id": "B2",
                                  "answer": "犯罪",
                                  "raw": "{{犯罪}}"
                              },
                              {
                                  "id": "B3",
                                  "answer": "公訴",
                                  "raw": "{{公訴}}"
                              },
                              {
                                  "id": "B4",
                                  "answer": "提起",
                                  "raw": "{{提起}}"
                              },
                              {
                                  "id": "B5",
                                  "answer": "遂行",
                                  "raw": "{{遂行}}"
                              },
                              {
                                  "id": "B6",
                                  "answer": "犯人",
                                  "raw": "{{犯人}}"
                              },
                              {
                                  "id": "B7",
                                  "answer": "発見",
                                  "raw": "{{発見}}"
                              },
                              {
                                  "id": "B8",
                                  "answer": "保全",
                                  "raw": "{{保全}}"
                              },
                              {
                                  "id": "B9",
                                  "answer": "証拠",
                                  "raw": "{{証拠}}"
                              },
                              {
                                  "id": "B10",
                                  "answer": "収集",
                                  "raw": "{{収集}}"
                              },
                              {
                                  "id": "B11",
                                  "answer": "確保",
                                  "raw": "{{確保}}"
                              },
                              {
                                  "id": "B12",
                                  "answer": "行為",
                                  "raw": "{{行為}}"
                              }
                          ],
                          "generatedAt": "2025-11-16T16:43:16.276Z"
                      }
                  },
                  "attempts": {
                      "1": {
                          "timestamp": "2025-11-16T16:44:37.461Z",
                          "evaluation": {
                              "overall": {
                                  "passed": false,
                                  "score": 0,
                                  "summary": "一部の空欄でキーワードが不足しています。",
                                  "nextStep": "不足している語句を復習し、再挑戦してください。"
                              },
                              "blanks": [
                                  {
                                      "id": "B1",
                                      "passed": false,
                                      "expected": "捜査機関",
                                      "provided": "捜査機関",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B2",
                                      "passed": false,
                                      "expected": "犯罪",
                                      "provided": "犯罪",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B3",
                                      "passed": false,
                                      "expected": "公訴",
                                      "provided": "起訴",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B4",
                                      "passed": false,
                                      "expected": "提起",
                                      "provided": "証拠",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B5",
                                      "passed": false,
                                      "expected": "遂行",
                                      "provided": "収集",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B6",
                                      "passed": false,
                                      "expected": "犯人",
                                      "provided": "犯罪",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B7",
                                      "passed": false,
                                      "expected": "発見",
                                      "provided": "",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B8",
                                      "passed": false,
                                      "expected": "保全",
                                      "provided": "",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B9",
                                      "passed": false,
                                      "expected": "証拠",
                                      "provided": "",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B10",
                                      "passed": false,
                                      "expected": "収集",
                                      "provided": "",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B11",
                                      "passed": false,
                                      "expected": "確保",
                                      "provided": "",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  },
                                  {
                                      "id": "B12",
                                      "passed": false,
                                      "expected": "行為",
                                      "provided": "",
                                      "score": 0,
                                      "feedback": "AI採点エラー: got status: 503 Service Unavailable. {\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\",\"status\":\"UNAVAILABLE\"}}"
                                  }
                              ],
                              "suggestions": [
                                  "ヒント欄を確認し、キーワードを短く正確に書き出してください。"
                              ]
                          },
                          "answers": {
                              "B1": "捜査機関",
                              "B2": "犯罪",
                              "B3": "起訴",
                              "B4": "証拠",
                              "B5": "収集",
                              "B6": "犯罪",
                              "B7": "",
                              "B8": "",
                              "B9": "",
                              "B10": "",
                              "B11": "",
                              "B12": ""
                          }
                      }
                  },
                  "updatedAt": "2025-11-16T16:44:37.461Z"
              }
          },
          {
              "id": 2,
              "rank": "A",
              "question": "捜査の目的について説明しなさい。",
              "answer": "{{犯罪}}の{{嫌疑}}の{{有無}}を{{解明}}して、{{公訴}}を{{提起}}するか否かの{{決定}}をなし、{{公訴}}が{{提起}}される場合に備えてその{{準備}}をすることをいう。具体的には、①{{被疑者}}の{{身柄保全}}、②{{証拠}}の{{収集保全}}を指す。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 3,
              "rank": "A",
              "question": "令状主義（【憲法33条】【憲法35条】、【刑事訴訟法197条1項ただし書】、【刑事訴訟法199条1項】、【刑事訴訟法218条】等）の意義について説明しなさい。",
              "answer": "{{強制処分}}を{{行う}}には{{原則}}として{{裁判所}}又は{{裁判官}}の{{発する}}{{令状}}に{{基づかなければならない}}。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 4,
              "rank": "B",
              "question": "令状主義（【憲法33条】【憲法35条】、【刑事訴訟法197条1項ただし書】、【刑事訴訟法199条1項】、【刑事訴訟法218条】等）の趣旨について説明しなさい。",
              "answer": "{{捜査機関}}が{{逮捕}}、{{捜索}}、{{押収}}など{{最も人権侵害の危険のある}}{{強制処分}}を{{自らの判断だけで行う}}ことができるとすると、{{不当な人権侵害}}が行われるおそれがあるため、{{公正な立場にある}}{{裁判官}}に、{{強制処分}}の{{必要性}}とそれが{{人権}}に及ぼす{{影響}}を{{判断}}させることにより、{{捜査}}による{{不当な人権侵害}}が{{行われることを防止する}}({{司法的抑制}}の理念)。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 5,
              "rank": "B",
              "question": "任意捜査の原則 (【刑事訴訟法197条1項】) の意義について説明しなさい。",
              "answer": "{{捜査目的}}が{{強制処分}}によっても{{任意処分}}によっても{{達成}}される場合には、{{任意処分}}によって{{行われるべき}}とする{{原則}}をいい、{{強制捜査}}を{{法規上}}も{{運用上}}もなるべく{{例外}}にとどめることによって、{{捜査}}と{{人権}}の{{調和}}を図ろうとするものをいう。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 6,
              "rank": "B",
              "question": "強制処分法定主義 (【刑事訴訟法197条1項ただし書】)の意義について説明しなさい。",
              "answer": "{{強制処分}}は、{{法律}}にこれを{{許す特別の規定がある場合}}にしか{{用いることができない}}。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 7,
              "rank": "A",
              "question": "比例原則(【刑事訴訟法197条1項本文】 「必要な」)の意義について説明しなさい。",
              "answer": "{{捜査}}は、{{被疑者}}等の{{自由}}、{{財産}}その他{{私生活上の利益}}に{{直接重大な脅威}}を{{及ぼす}}ものである以上、{{捜査}}の{{必要}}と{{人権保障}}の間には{{ほどよい調和}}を{{図る必要}}があることから、{{捜査上の処分}}は、{{必要性}}に{{見合った相当なもの}}でなければならないという{{原則}}をいう。{{強制処分}}を{{行う}}場合にも、できるだけ{{権利}}・{{利益}}が{{侵害}}される{{程度の少ない方法}}・{{種類}}が{{選択}}されなければならない。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 8,
              "rank": "B",
              "question": "捜査の開始時期について説明しなさい。",
              "answer": "{{捜査}}は、「{{犯罪があると思料}}」したとき（{{【刑事訴訟法189条2項】}}）に{{開始}}される。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 9,
              "rank": "B",
              "question": "捜査の端緒の意義について説明しなさい。",
              "answer": "{{捜査}}の{{開始}}のきっかけとなる、{{捜査機関}}の{{下}}に{{集まってくる}}{{犯罪}}についての{{情報}}の{{手がかり}}をいう。{{捜査の端緒}}には、特に{{制限}}がない。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 10,
              "rank": "B",
              "question": "捜査の端緒の具体例について説明しなさい。",
              "answer": "1. {{捜査機関}}の{{活動}}に{{由来するもの}}\n　{{聞き込み}}、{{風説}}、{{新聞その他出版物の記事}}、{{検視}}、{{職務質問}}、{{自動車検問}}、{{現行犯逮捕}}等\n2. {{犯人}}や{{被害者}}の{{申告}}・{{告知}}等による場合\n　{{被害届}}、{{告訴}}、{{自首}}等\n3. {{第三者}}の{{申告}}・{{告知}}等による場合\n　{{告発}}、{{請求}}、{{匿名の申告}}等",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          }
      ],
                                  "importance": "★★★"
                              }
                          ],
                          "blanks": [
                              {
                                  "id": "B1",
                                  "prompt": "捜査の主体となるのは？",
                                  "answer": "捜査機関",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B2",
                                  "prompt": "捜査は何が発生したと考えるときに開始されるか？",
                                  "answer": "犯罪",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B3",
                                  "prompt": "捜査の最終目的となるのは何のためか？",
                                  "answer": "公訴",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B4",
                                  "prompt": "公訴について最初に行われる行為は？",
                                  "answer": "提起",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B5",
                                  "prompt": "公訴について、提起された後に行われる行為は？",
                                  "answer": "遂行",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B6",
                                  "prompt": "公訴のために、捜査の対象となるのは誰か？",
                                  "answer": "犯人",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B7",
                                  "prompt": "犯人に対して行われる最初の行為は？",
                                  "answer": "発見",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B8",
                                  "prompt": "発見された犯人に対して行われる、身柄などを確保する行為は？",
                                  "answer": "保全",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B9",
                                  "prompt": "犯人以外に、公訴のために収集・確保されるのは何か？",
                                  "answer": "証拠",
                                  "placeholder": "名詞"
                              },
                              {
                                  "id": "B10",
                                  "prompt": "証拠に対して行われる最初の行為は？",
                                  "answer": "収集",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B11",
                                  "prompt": "収集された証拠を失われないようにする行為は？",
                                  "answer": "確保",
                                  "placeholder": "動詞"
                              },
                              {
                                  "id": "B12",
                                  "prompt": "これら一連の活動を総称して何と呼ぶか？",
                                  "answer": "行為",
                                  "placeholder": "名詞"
                              }
                          ],
                          "evaluationRubric": {
                              "overall": "「捜査」の定義を構成する主要な要素（主体、対象、目的、内容、結果）を正確に記述できているかを確認します。特に、公訴の提起・遂行という目的と、犯人の発見・保全、証拠の収集・確保という具体的な行為内容を網羅しているかが採点ポイントです。",
                              "perBlank": "各空欄において、捜査の定義を構成する適切なキーワード（名詞、動詞）が正確に記述されているかを確認します。特に、「提起・遂行」「発見・保全」「収集・確保」といった対になる概念や、それらの順序を理解しているかが重要です。"
                          },
                          "inlineBody": [
                              {
                                  "type": "text",
                                  "text": "捜査とは、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B1",
                                  "label": "(1)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "が"
                              },
                              {
                                  "type": "blank",
                                  "id": "B2",
                                  "label": "(2)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "が発生したと考えるときに、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B3",
                                  "label": "(3)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "の"
                              },
                              {
                                  "type": "blank",
                                  "id": "B4",
                                  "label": "(4)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "・"
                              },
                              {
                                  "type": "blank",
                                  "id": "B5",
                                  "label": "(5)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "のため、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B6",
                                  "label": "(6)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "を"
                              },
                              {
                                  "type": "blank",
                                  "id": "B7",
                                  "label": "(7)",
                                  "placeholder": "動詞"
                              },
                              {
                                  "type": "text",
                                  "text": "・"
                              },
                              {
                                  "type": "blank",
                                  "id": "B8",
                                  "label": "(8)",
                                  "placeholder": "動詞"
                              },
                              {
                                  "type": "text",
                                  "text": "し、"
                              },
                              {
                                  "type": "blank",
                                  "id": "B9",
                                  "label": "(9)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "を"
                              },
                              {
                                  "type": "blank",
                                  "id": "B10",
                                  "label": "(10)",
                                  "placeholder": "動詞"
                              },
                              {
                                  "type": "text",
                                  "text": "・"
                              },
                              {
                                  "type": "blank",
                                  "id": "B11",
                                  "label": "(11)",
                                  "placeholder": "動詞"
                              },
                              {
                                  "type": "text",
                                  "text": "する"
                              },
                              {
                                  "type": "blank",
                                  "id": "B12",
                                  "label": "(12)",
                                  "placeholder": "名詞"
                              },
                              {
                                  "type": "text",
                                  "text": "をいう。"
                              }
                          ],
                          "writingGoals": [
                              "「捜査」の定義を構成する各要素（主体、対象、目的、内容、結果）を正確に把握できること。",
                              "与えられたキーワードを用いて、一つの文章として論理的かつ簡潔に定義を記述できること。",
                              "特に「公訴の提起・遂行」と「犯人の発見・保全」、「証拠の収集・確保」が、それぞれ目的と手段の関係にあることを理解して定義を捉えること。"
                          ],
                          "qaId": 1,
                          "moduleId": "刑事訴訟法/1.捜査/1.1-10",
                          "moduleTitle": "捜査の基本",
                          "relativePath": "刑事訴訟法/1.捜査/1.1-10",
                          "question": "捜査の意義について説明しなさい。",
                          "canonicalAnswer": "捜査機関が犯罪が発生したと考えるときに、公訴の提起・遂行のため、犯人を発見・保全し、証拠を収集・確保する行為をいう。",
                          "canonicalBlanks": [
                              {
                                  "id": "B1",
                                  "answer": "捜査機関",
                                  "raw": "{{捜査機関}}"
                              },
                              {
                                  "id": "B2",
                                  "answer": "犯罪",
                                  "raw": "{{犯罪}}"
                              },
                              {
                                  "id": "B3",
                                  "answer": "公訴",
                                  "raw": "{{公訴}}"
                              },
                              {
                                  "id": "B4",
                                  "answer": "提起",
                                  "raw": "{{提起}}"
                              },
                              {
                                  "id": "B5",
                                  "answer": "遂行",
                                  "raw": "{{遂行}}"
                              },
                              {
                                  "id": "B6",
                                  "answer": "犯人",
                                  "raw": "{{犯人}}"
                              },
                              {
                                  "id": "B7",
                                  "answer": "発見",
                                  "raw": "{{発見}}"
                              },
                              {
                                  "id": "B8",
                                  "answer": "保全",
                                  "raw": "{{保全}}"
                              },
                              {
                                  "id": "B9",
                                  "answer": "証拠",
                                  "raw": "{{証拠}}"
                              },
                              {
                                  "id": "B10",
                                  "answer": "収集",
                                  "raw": "{{収集}}"
                              },
                              {
                                  "id": "B11",
                                  "answer": "確保",
                                  "raw": "{{確保}}"
                              },
                              {
                                  "id": "B12",
                                  "answer": "行為",
                                  "raw": "{{行為}}"
                              }
                          ],
                          "generatedAt": "2025-11-16T16:43:16.276Z"
                      }
                  },
                  "attempts": {},
                  "updatedAt": "2025-11-16T16:43:16.285Z"
              }
          },
          {
              "id": 2,
              "rank": "A",
              "question": "捜査の目的について説明しなさい。",
              "answer": "{{犯罪}}の{{嫌疑}}の{{有無}}を{{解明}}して、{{公訴}}を{{提起}}するか否かの{{決定}}をなし、{{公訴}}が{{提起}}される場合に備えてその{{準備}}をすることをいう。具体的には、①{{被疑者}}の{{身柄保全}}、②{{証拠}}の{{収集保全}}を指す。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 3,
              "rank": "A",
              "question": "令状主義（【憲法33条】【憲法35条】、【刑事訴訟法197条1項ただし書】、【刑事訴訟法199条1項】、【刑事訴訟法218条】等）の意義について説明しなさい。",
              "answer": "{{強制処分}}を{{行う}}には{{原則}}として{{裁判所}}又は{{裁判官}}の{{発する}}{{令状}}に{{基づかなければならない}}。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 4,
              "rank": "B",
              "question": "令状主義（【憲法33条】【憲法35条】、【刑事訴訟法197条1項ただし書】、【刑事訴訟法199条1項】、【刑事訴訟法218条】等）の趣旨について説明しなさい。",
              "answer": "{{捜査機関}}が{{逮捕}}、{{捜索}}、{{押収}}など{{最も人権侵害の危険のある}}{{強制処分}}を{{自らの判断だけで行う}}ことができるとすると、{{不当な人権侵害}}が行われるおそれがあるため、{{公正な立場にある}}{{裁判官}}に、{{強制処分}}の{{必要性}}とそれが{{人権}}に及ぼす{{影響}}を{{判断}}させることにより、{{捜査}}による{{不当な人権侵害}}が{{行われることを防止する}}({{司法的抑制}}の理念)。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 5,
              "rank": "B",
              "question": "任意捜査の原則 (【刑事訴訟法197条1項】) の意義について説明しなさい。",
              "answer": "{{捜査目的}}が{{強制処分}}によっても{{任意処分}}によっても{{達成}}される場合には、{{任意処分}}によって{{行われるべき}}とする{{原則}}をいい、{{強制捜査}}を{{法規上}}も{{運用上}}もなるべく{{例外}}にとどめることによって、{{捜査}}と{{人権}}の{{調和}}を図ろうとするものをいう。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 6,
              "rank": "B",
              "question": "強制処分法定主義 (【刑事訴訟法197条1項ただし書】)の意義について説明しなさい。",
              "answer": "{{強制処分}}は、{{法律}}にこれを{{許す特別の規定がある場合}}にしか{{用いることができない}}。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 7,
              "rank": "A",
              "question": "比例原則(【刑事訴訟法197条1項本文】 「必要な」)の意義について説明しなさい。",
              "answer": "{{捜査}}は、{{被疑者}}等の{{自由}}、{{財産}}その他{{私生活上の利益}}に{{直接重大な脅威}}を{{及ぼす}}ものである以上、{{捜査}}の{{必要}}と{{人権保障}}の間には{{ほどよい調和}}を{{図る必要}}があることから、{{捜査上の処分}}は、{{必要性}}に{{見合った相当なもの}}でなければならないという{{原則}}をいう。{{強制処分}}を{{行う}}場合にも、できるだけ{{権利}}・{{利益}}が{{侵害}}される{{程度の少ない方法}}・{{種類}}が{{選択}}されなければならない。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 8,
              "rank": "B",
              "question": "捜査の開始時期について説明しなさい。",
              "answer": "{{捜査}}は、「{{犯罪があると思料}}」したとき（{{【刑事訴訟法189条2項】}}）に{{開始}}される。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 9,
              "rank": "B",
              "question": "捜査の端緒の意義について説明しなさい。",
              "answer": "{{捜査}}の{{開始}}のきっかけとなる、{{捜査機関}}の{{下}}に{{集まってくる}}{{犯罪}}についての{{情報}}の{{手がかり}}をいう。{{捜査の端緒}}には、特に{{制限}}がない。",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          },
          {
              "id": 10,
              "rank": "B",
              "question": "捜査の端緒の具体例について説明しなさい。",
              "answer": "1. {{捜査機関}}の{{活動}}に{{由来するもの}}\n　{{聞き込み}}、{{風説}}、{{新聞その他出版物の記事}}、{{検視}}、{{職務質問}}、{{自動車検問}}、{{現行犯逮捕}}等\n2. {{犯人}}や{{被害者}}の{{申告}}・{{告知}}等による場合\n　{{被害届}}、{{告訴}}、{{自首}}等\n3. {{第三者}}の{{申告}}・{{告知}}等による場合\n　{{告発}}、{{請求}}、{{匿名の申告}}等",
              "fillDrill": {
                  "clearedLevels": [],
                  "templates": {},
                  "attempts": {}
              }
          }
      ],

  // === 3. 事案ストーリー（必須） ================
  story: [
    { type: 'scene', text: 'ある日の午後、タチバナ家のリビング' },
    { type: 'narration', text: 'キッチンから母の甲高い声が響き渡り、リビングでくつろいでいたみかんと、受験勉強をしていたユズヒコの静寂は破られた。' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: 'ない！ないったら、ない！どこを探してもないじゃないの！私が大事にとっておいた、あの最高級『情熱の赤いバラ』プリンが！' },
    { type: 'dialogue', speaker: 'みかん', expression: 'annoyed', dialogue: 'うわっ、また始まった…。お母さん、ただのプリンでしょ？' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: 'ただのプリンですって！？あれはデパートで一時間並んでやっと手に入れた幻のプリンなのよ！みかん！あんたでしょ！食べたのは！' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'ええーっ！？違うよ！私はさっきからずっとテレビ見てただけだって！' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: 'しらばっくれてもダメよ！この家で甘いものに目がないのはあんただけなんだから！さあ、白状しなさい！' },
    { type: 'narration', text: '母は仁王立ちでみかんに詰め寄る。その剣幕に、リビングの空気がピリピリと緊張する。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'sigh', dialogue: '母さん、姉ちゃん。ちょっと落ち着いてよ。まるで刑事ドラマみたいだね。' },
    { type: 'dialogue', speaker: '母', expression: 'passionate', dialogue: '刑事ドラマなんかじゃないわ、これは現実の事件よ！『タチバナ家プリン消失事件』よ！ユズ、あんたも姉ちゃんが怪しいと思うでしょ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'まあまあ。客観的な証拠もないのに犯人だって決めつけるのは、近代刑事司法の理念に反するよ。こういう時は、まず{{捜査}}を{{開始}}しないと。【id:8】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'そ、捜査？プリン一個のために、そんな大げさな…。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'どんな小さな事件でも、手続きは大事なんだ。そもそも「{{捜査}}」っていうのは、{{犯罪}}が発生したと疑われるときに、{{公訴}}の{{提起}}、つまり犯人を裁判にかける準備のために、{{犯人}}を発見したり{{証拠}}を{{収集}}・{{確保}}したりする一連の活動のことだよ。【id:1】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'へぇ、ユズ詳しいじゃん。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'テスト範囲だからね。{{捜査}}の目的は、最終的に{{犯罪}}の{{嫌疑}}があるかどうかをはっきりさせて、{{公訴}}を{{提起}}するかどうかを決めることなんだ。【id:2】' },
    { type: 'dialogue', speaker: '母', expression: 'excited', dialogue: 'なるほどね！じゃあ、早速{{証拠}}の{{収集}}よ！みかんの部屋にプリンの容器が隠してないか、家宅捜索だわ！' },
    { type: 'narration', text: 'そう言って母が鬼の形相でみかんの部屋に向かおうとするのを、ユズヒコが冷静に制した。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'serious', dialogue: '待って、母さん。それは「{{強制処分}}」にあたるから、勝手にはできないよ。' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'きょーせいしょぶん？なにそれ、必殺技？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: '違うよ…。相手の意思に反して、身体や財産に制約を加える捜査のこと。例えば、無理やり部屋に入る「{{捜索}}」とか、物を持ち去る「{{押収}}」とかだね。' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: '母親が娘の部屋に入るのに、意思も何もあるもんですか！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'いや、そこが重要なんだ。こういう{{強制処分}}は、{{最も人権侵害の危険のある}}行為だから、厳格なルールがあるんだ。それが「{{令状主義}}」だよ。【id:3】【id:4】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'surprised', dialogue: 'れいじょうしゅぎ？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'うん。{{強制処分}}を行うには、原則として、中立公平な{{裁判官}}が出す「{{令状}}」っていう許可状が必要なんだ。捜査機関が自分たちの判断だけでやっちゃうと、人権侵害が起きやすいからね。【id:3】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'laughing', dialogue: 'ってことは、お母さんが私の部屋を捜索するには、裁判所に申請して、許可状をもらってこないといけないんだ！大変だー！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'smug', dialogue: 'その通り。{{捜査機関}}の暴走を防ぐための{{司法的抑制}}っていう考え方が根底にあるんだ。【id:4】' },
    { type: 'narration', text: 'さらに、とユズヒコは続ける。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'それに、どんな{{強制処分}}でも許されるわけじゃない。「{{強制処分法定主義}}」といって、{{法律}}に「こういう場合にこういう処分ができますよ」っていう特別な規定がないと、そもそもできないことになってるんだ。【id:6】' },
    { type: 'dialogue', speaker: '母', expression: 'sigh', dialogue: 'はぁ…法律ってのは、いちいち面倒くさいわねぇ。じゃあ、どうやって犯人を見つけろって言うのよ。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'だから、まずは「{{任意捜査}}の原則」が重要なんだよ。【id:5】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'thinking', dialogue: 'にんいそうさ？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '相手の同意を得て進める捜査のこと。事情聴取とか、持ち物を見せてもらうとか。{{捜査}}は{{人権}}との{{調和}}が大事だから、できるだけ強制的な方法は避けるべき、とされているんだ。【id:5】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'smug', dialogue: 'なるほどね！じゃあ、私の部屋の家宅捜索は任意ってことだから、私は同意しません！プライバシーの侵害よ！' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: 'なんですってー！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'annoyed', dialogue: '姉ちゃん…。まあ、理論上はそうだね。{{任意処分}}で目的が達成できるなら、そっちを優先しないといけない。【id:5】' },
    { type: 'narration', text: '腕を組み、納得いかない顔でユズヒコを睨む母。' },
    { type: 'dialogue', speaker: '母', expression: 'thinking', dialogue: 'でもねぇ、ユズ。たかがプリン一個で、{{捜査}}だの{{令状}}だの、やっぱり大げさじゃないの？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'impressed', dialogue: 'いいところに気づいたね、母さん。それもすごく大事な考え方で、「{{比例原則}}」っていうんだ。【id:7】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'ひれいげんそく？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'うん。捜査の必要性と、それによって侵害される個人の権利や利益のバランスを取らないといけないってこと。プリン一個の捜査のために、部屋をひっくり返すなんてことは、明らかにやり過ぎ。つまり、{{必要性}}に{{見合った相当なもの}}とは言えないから、許されないんだ。【id:7】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'happy', dialogue: 'でしょー！ユズ、よく言った！私の人権は守られたわ！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'sigh', dialogue: 'まあ、今回の「事件」はあくまで、たとえ話としてだけどね。' },
    { type: 'narration', text: 'ユズヒコは一息ついて、二人に向き直った。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'cool', dialogue: 'じゃあ、話を戻そう。そもそも、どうして僕たちの「プリン消失事件」の{{捜査}}は始まったんだろう？' },
    { type: 'dialogue', speaker: 'みかん', expression: 'confused', dialogue: 'え？ユズが勝手に言い出したんじゃん。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'きっかけだよ、きっかけ。「{{捜査の端緒}}」、つまり捜査が始まるきっかけのことだ【id:9】。{{捜査機関}}は、何かきっかけがないと動き出せないんだ。' },
    { type: 'dialogue', speaker: '母', expression: 'interested', dialogue: 'きっかけねぇ。どんなものがあるの？' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: '一番多いのは、母さんみたいに被害者が「盗まれました！」って申告する「{{被害届}}」だね。他にも、犯人自身が「私がやりました」と名乗り出る「{{自首}}」とか、近所の人が「あそこの家でケンカしてる」みたいに通報する「{{告発}}」とか、色々あるんだ。【id:10】' },
    { type: 'dialogue', speaker: 'みかん', expression: 'impressed', dialogue: 'へぇー、面白い！じゃあ、お母さんがさっき大声で叫んだのが、「{{被害届}}」みたいなものだったってことか。' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'normal', dialogue: 'そういうこと。{{捜査機関}}は、そういう{{捜査の端緒}}によって「{{犯罪があると思料}}」したときに、初めて{{捜査}}を{{開始}}するんだ。【id:8】【id:9】' },
    { type: 'narration', text: 'ユズヒコがそこまで説明し終えたとき、リビングの隅で新聞を読んでいた父が、顔も上げずにぼそりと言った。' },
    { type: 'dialogue', speaker: '父', expression: 'normal', dialogue: '…そのプリンなら、さっき俺が食ったぞ。うまかった。' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: 'なんですってぇーーーっ！？あなただったの！？私の情熱を！' },
    { type: 'dialogue', speaker: 'みかん', expression: 'laughing', dialogue: 'なーんだ、犯人お父さんか！じゃあ事件解決だね！ユズ名探偵！' },
    { type: 'dialogue', speaker: 'ユズヒコ', expression: 'sigh', dialogue: '…被疑者、あっさり見つかったね。ともかく、これが{{捜査}}の目的、つまり{{犯罪}}の{{嫌疑}}の{{有無}}を{{解明}}して、起訴するかどうかを決めるっていうプロセスの、ほんの入り口だよ。【id:2】' },
    { type: 'dialogue', speaker: '母', expression: 'angry', dialogue: '起訴よ！起訴！あなたをプリン窃盗罪で訴えてやるわ！' },
    { type: 'dialogue', speaker: '父', expression: 'laughing', dialogue: 'はっは。' },
    { type: 'narration', text: '父の高らかな笑い声と、母の怒りの絶叫がリビングに響き渡る。ユズヒコは、そんな日常の光景にやれやれと肩をすくめ、再び参考書に目を落とすのだった。' }
  ],
  // === 4. 判旨と解説（必須） ====================
  explanation: `
  <h3 class="text-xl font-bold mb-4">捜査の基本原則</h3>
  <p class="mb-4">
    今回のストーリーでは、タチバナ家で発生した「プリン消失事件」を題材に、刑事訴訟法における「捜査」の基本的な考え方について学びました。母がみかんを犯人と決めつけ、部屋を捜索しようとした場面で、ユズヒコが捜査の基本原則を解説しました。これらの原則は、個人の人権を守りながら、犯罪の真相を解明するという、刑事手続の二つの大きな要請を調和させるために不可欠なものです。
  </p>

  <h4 class="text-lg font-bold mt-6 mb-2">捜査の開始と目的【id:1】【id:2】</h4>
  <p class="mb-4">
    捜査は、警察官などが「犯罪があると思料」したときに開始されます【id:8】。ストーリーでは、母が「プリンが盗まれた！」と叫んだことが、捜査のきっかけ、すなわち「捜査の端緒」となりました【id:9】【id:10】。捜査の目的は、犯人を見つけて証拠を集め、最終的にその人物を裁判にかける（公訴を提起する）かどうかを決定し、その準備をすることにあります【id:2】。
  </p>

  <h4 class="text-lg font-bold mt-6 mb-2">任意捜査の原則と強制処分法定主義【id:5】【id:6】</h4>
  <p class="mb-4">
    捜査には、相手の同意を得て行う「任意捜査」と、同意なく強制的に行う「強制処分」があります。【刑事訴訟法197条1項】は、「任意捜査の原則」を定めており、できる限り個人の権利を侵害しない任意捜査によるべきだとされています【id:5】。
  </p>
  <p class="mb-4">
    一方で、家宅捜索のような強制処分は、法律に特別な定めがある場合にしか許されません。これを「強制処分法定主義」といいます【id:6】。ユズヒコが「勝手にはできないよ」と母を止めたのは、この原則に基づいています。
  </p>

  <h4 class="text-lg font-bold mt-6 mb-2">令状主義と司法的抑制【id:3】【id:4】</h4>
  <p class="mb-4">
    強制処分は人権侵害の危険性が高いため、【憲法33条】や【憲法35条】で「令状主義」が定められています。これは、捜査機関の独断を防ぐため、逮捕や捜索・差押えなどを行う際には、原則として中立的な裁判官が発付する「令状」が必要であるとする原則です【id:3】。これにより、捜査機関の権力行使に司法的なコントロール（司法的抑制）を及ぼし、不当な人権侵害を防ぐことを目的としています【id:4】。
  </p>
  
  <ul class="list-disc list-inside mb-4 pl-4 space-y-2">
    <li><span class="text-red-600 font-bold">ポイント</span>：令状主義は、捜査機関の恣意的な権力行使を抑制し、国民の人権を保障するための重要な憲法上の要請です。</li>
  </ul>

  <h4 class="text-lg font-bold mt-6 mb-2">比例原則の重要性【id:7】</h4>
  <p class="mb-4">
    たとえ法律上の要件を満たしていても、どんな捜査でも許されるわけではありません。捜査によって得られる利益と、それによって侵害される個人の権利との間に、適切なバランスが求められます。これが「比例原則」です【id:7】。ストーリーでユズヒコが指摘したように、「プリン1個の捜査のために部屋をひっくり返す」ことは、捜査の必要性に見合った相当な手段とは言えず、比例原則に反する可能性が高いでしょう。
  </p>

  <div class="bg-yellow-100 p-4 rounded-lg mt-6">
    <h5 class="font-bold text-yellow-800">司法試験ポイント</h5>
    <p>
      論文式試験では、具体的な事案において、ある捜査活動が任意捜査の限界を超えて違法な強制処分にあたらないか、また、強制処分だとして令状主義や比例原則に反しないか、といった点が頻繁に問われます。ストーリーで登場した各原則（任意捜査の原則、強制処分法定主義、令状主義、比例原則）の意義と趣旨を正確に理解し、事案のどの事実がどの原則に関連するのかを的確に指摘できるようにしておくことが極めて重要です。
    </p>
  </div>
`,

  // === 5. ミニ論文問題（必須） ==================
  quiz: [
    {
      title: "職務質問と所持品検査の限界",
      rank: "A",
      background: `
      ある夜、パトロール中の警察官である宮嶋先生は、深夜の公園で挙動不審な男、吉岡を発見した。宮嶋先生が吉岡に近づき、職務質問を開始したところ、吉岡はしきりに左ポケットを気にしていた。不審に思った宮嶋先生は、吉岡に対しポケットの中身を見せるよう求めたが、吉岡はこれを拒否した。
      そこで、宮嶋先生は吉岡の腕をつかんで抵抗を抑えつつ、その左ポケットに手を入れ、中からビニール袋入りの白い粉末を発見した。後の鑑定で、この粉末は覚せい剤であることが判明し、吉岡は現行犯逮捕された。
      `,
      subProblems: [
        {
          title: "職務質問に伴う所持品検査の適法性",
          rank: "A",
          relatedQAs: [1, 5, 6, 7],
          problem: "本件における宮嶋先生の一連の行為は適法か。特に、所持品検査の限界という観点から論じなさい。",
          hint: "職務質問は任意捜査の典型例です。その付随行為である所持品検査が、どの時点で任意捜査の限界を超え、違法な強制処分となるのかが中心的な論点となります。判例が示す所持品検査の許容限度に関する基準（必要性、緊急性、相当性）を思い出し、本件の具体的な事実に即して検討してください。特に、吉岡の腕をつかんで抵抗を抑え、ポケットに手を入れた行為が「捜索」という強制処分にあたらないかが鍵となります。",
          points: [
            "職務質問が任意捜査であることの確認【id:5】",
            "所持品検査が職務質問の付随行為として許容されることとその限界",
            "任意捜査と強制処分の区別基準（個人の意思を制圧し、身体、住居、財産等に制約を加えて強制的に捜査目的を実現する行為かどうか）",
            "本件の所持品検査が、判例の示す許容限度（捜索に至らない程度の行為は、必要性・緊急性があり、相当な限度で許容される）を超えているかどうかの具体的な検討",
            "腕をつかみポケットに手を入れる行為が、吉岡の意思を制圧しており、「捜索」という強制処分に該当し、令状なく行われた点で違法であるという結論を導けているか【id:3】【id:6】"
          ],
          modelAnswer: `
第１、問題の所在
本件で宮嶋先生が行った所持品検査は、職務質問に付随する行為として任意捜査の範囲内といえるか。それとも、その限界を超え、違法な強制処分にあたるかが問題となる。

第２、職務質問と所持品検査の適法性
１．職務質問は、警察官職務執行法2条1項に基づく任意処分であり、捜査の端緒ともなる任意捜査の一種である【id:5】【id:10】。そして、職務質問に付随して、所持品を検査することも、質問の効果をあげる上で必要性・有効性が認められる場合がある。

２．しかし、所持品検査は個人のプライバシーを侵害するおそれのある行為であるから、無制約に許されるものではない。判例は、所持品検査が任意性を失い、強制の手段を用いた場合には、強制処分である「捜索」に該当しうるとしつつ、捜索に至らない程度の行為は、捜査の必要性、緊急性、これによって害される個人の法益と保護されるべき公共の利益との権衡などを考慮し、具体的状況の下で相当と認められる限度において許容されるとしている。

３．本件について検討する。
宮嶋先生は、深夜の公園で挙動不審な吉岡を発見し、職務質問を開始している。ここまでは適法である。
問題は、吉岡が任意での開示を拒否したにもかかわらず、その腕をつかんで抵抗を抑え、ポケットに手を入れて中身を取り出した行為である。
この行為は、吉岡の身体の自由を拘束し、その意思を完全に制圧して行われたものであり、プライバシーの侵害の程度も大きい。これはもはや任意捜査の付随行為として許容される限度を明らかに超えており、実質的には令状なく行われた「捜索」そのものというべきである。
したがって、この行為は【刑事訴訟法218条1項】に反する強制処分であり、令状主義の精神（【憲法35条】）を没却する重大な違法があるといわざるを得ない【id:3】【id:4】。

第３、結論
以上より、宮嶋先生が行った一連の行為のうち、吉岡の抵抗を抑えてポケット内を探索した行為は、任意捜査の限界を超えた違法な強制処分（捜索）にあたる。
          `
        }
      ]
    }
  ]
};
