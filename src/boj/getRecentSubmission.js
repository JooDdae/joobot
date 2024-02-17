const jsdom = require('jsdom');
const cellsToSubmission = require('../utils/cellsToSubmission');

const headers = { "User-Agent": "JooDdae Bot" };

module.exports = async (bojId = null, problemId = null) => {

    try {
        let url = `https://www.acmicpc.net/status?`;
        if(bojId !== null) url += `user_id=${bojId}&`;
        if(problemId !== null) url += `problem_id=${problemId}&`;

        const res = await fetch(url, { headers }).then((res) => res.text());
        const doc = new jsdom.JSDOM(res).window.document;
        const rows = doc.querySelector("#status-table > tbody").rows;

        if(rows.length === 0) return null;
        return cellsToSubmission(rows[0].cells);
    } catch {
        console.log(`There was an error in getFirstSolvedSubmission.js: ${error}`);
        return null;
    }
}