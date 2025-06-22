// Cases index - 各法律分野のケースデータを管理

const cases = {
    '憲法': [],
    '民法': [],
    '刑法': [],
    '商法': [],
    '民事訴訟法': [],
    '倫理学': [],
    '行政法': []
};

// ケースデータを取得する関数
function getCases(subject) {
    return cases[subject] || [];
}

// 全てのケースを取得する関数
function getAllCases() {
    return cases;
}

// ケースを追加する関数
function addCase(subject, caseData) {
    if (cases[subject]) {
        cases[subject].push(caseData);
    }
}

export { getCases, getAllCases, addCase };
