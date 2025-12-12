
import fs from 'fs';
import path from 'path';

const CASES_DIR = path.join(process.cwd(), 'public', 'cases', '憲法');

const cases = [
    {
        subcatId: '1',
        subcatName: '総論',
        folderName: '1.総論',
        count: 38,
        title: '憲法総論・人権総論'
    },
    {
        subcatId: '2',
        subcatName: '人権(精神的自由)',
        folderName: '2.人権(精神的自由)',
        count: 43,
        title: '精神的自由権'
    },
    {
        subcatId: '3',
        subcatName: '人権(経済的自由~社会権)',
        folderName: '3.人権(経済的自由~社会権)',
        count: 29,
        title: '経済的自由・社会権'
    },
    {
        subcatId: '4',
        subcatName: '統治',
        folderName: '4.統治',
        count: 30,
        title: '統治機構'
    }
];

cases.forEach(c => {
    const range = `1-${c.count}`;
    const fileName = `${c.subcatId}.${range}.js`;
    const filePath = path.join(CASES_DIR, c.folderName, fileName);

    const content = `export default {
  id: '${c.subcatId}.${range}',
  category: '憲法',
  subcategory: '${c.subcatId}',
  title: '${c.title}',
  citation: '憲法一問一答',
  rank: 'B',
  tags: ['憲法', '${c.subcatName}'],
  questionsAndAnswers: [
    '憲法.${c.subcatId}.〔1.${c.count}〕'
  ],
  story: [
    { type: 'bgm' },
    { type: 'background' },
    { type: 'scene', text: '憲法の一問一答演習です。' },
    { type: 'narration', text: '${c.title}の重要論点を確認します。' }
  ],
  studyRecords: []
};
`;

    // Ensure dir exists (already done via command, but good practice)
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Created ${filePath}`);
});
