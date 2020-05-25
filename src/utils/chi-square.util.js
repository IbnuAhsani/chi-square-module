const calculateChiSquareValues = (tokenList) => {
  let totalJournalAbstracts = 0;
  const tokenListLength = tokenList.length - 1;
  const appendedArticle = {};
  const abstractsPerJournal = {};
  const invertedIndex = {};

  for (let i = 0; i <= tokenListLength; i++) {
    const tokenListRow = tokenList[i];
    const { JOURNAL_ID, ARTICLE_ID, TOKEN } = tokenListRow;

    if (!appendedArticle[ARTICLE_ID]) {
      appendedArticle[ARTICLE_ID] = 1;

      totalJournalAbstracts++;

      if (!abstractsPerJournal[JOURNAL_ID]) abstractsPerJournal[JOURNAL_ID] = 0;

      abstractsPerJournal[JOURNAL_ID] += 1;
    }

    if (!invertedIndex[TOKEN]) invertedIndex[TOKEN] = [];

    const tempObj = { JOURNAL_ID, ARTICLE_ID };

    invertedIndex[TOKEN].push(tempObj);
  }

  console.log("invertedIndex keys: ", Object.keys(invertedIndex).length);

  let invertedIndexProcessNum = 0;
  const chiSquareValues = [];

  for (const token in invertedIndex) {
    const tokenArray = invertedIndex[token];
    const tokenArrayLength = tokenArray.length;

    const journalIdsObj = tokenArray.reduce((obj, val) => {
      obj[val.JOURNAL_ID] = (obj[val.JOURNAL_ID] || 0) + 1;
      return obj;
    }, {});

    for (const journalId in journalIdsObj) {
      const journalIdAbstracts = abstractsPerJournal[journalId];
      const aValue = journalIdsObj[journalId];
      const bValue = tokenArrayLength - aValue;
      const cValue = journalIdAbstracts - aValue;
      const dValue = totalJournalAbstracts - journalIdAbstracts - bValue;
      const chiSquare =
        (aValue * dValue - bValue * cValue) ** 2 /
        ((aValue + bValue) * (cValue + dValue));

      const tempObj = {
        JOURNAL_ID: journalId,
        TOKEN: token,
        A_VALUE: aValue,
        B_VALUE: bValue,
        C_VALUE: cValue,
        D_VALUE: dValue,
        CHI_SQUARE: chiSquare,
      };

      chiSquareValues.push(tempObj);
    }

    if (invertedIndexProcessNum % 10000 == 0)
      console.log("invertedIndexProcessNum: ", invertedIndexProcessNum);

    invertedIndexProcessNum++;
  }

  return chiSquareValues;
};

// spread the tokens of the articles into a single layer array of objects
const createTokenList = (jsonData) => {
  const tokenList = [];
  let tokenAmount = 0;

  for (const jsonDataRow of jsonData) {
    const {
      JOURNAL_ID,
      JOURNAL_TITLE,
      ARTICLE_ID,
      TOKENS_DUPLICATE_REMOVED,
    } = jsonDataRow;

    tokenAmount += TOKENS_DUPLICATE_REMOVED.length;

    for (const token of TOKENS_DUPLICATE_REMOVED) {
      const tokenListObj = {
        JOURNAL_ID,
        JOURNAL_TITLE,
        ARTICLE_ID,
        TOKEN: token,
      };

      tokenList.push(tokenListObj);
    }
  }

  console.log("tokenAmount: ", tokenAmount);

  return tokenList;
};

const mapAbstractFeatureVectors = (list, jsonData) =>
  list.map((item) => {
    const { JOURNAL_ID, ARTICLE_ID } = item;
    const { ARTICLE_ABSTRACT } = jsonData.find(
      (item) => item.JOURNAL_ID === JOURNAL_ID && item.ARTICLE_ID === ARTICLE_ID
    );

    item.ARTICLE_ABSTRACT = ARTICLE_ABSTRACT;
    return item;
  });

const sliceTopTermsFeatureVectors = (list, mTerms) => list.slice(0, mTerms);

const sortChiSquareValueDescendingly = (list) =>
  list.sort((a, b) => b.CHI_SQUARE - a.CHI_SQUARE);

module.exports = {
  calculateChiSquareValues,
  createTokenList,
  mapAbstractFeatureVectors,
  sliceTopTermsFeatureVectors,
  sortChiSquareValueDescendingly,
};
