const jsdom = require('jsdom');
const cellsToSubmission = require('../utils/cellsToSubmission');

const headers = { "User-Agent": "JooDdae Bot" };


/*
    returns {submissionId, submissionProblemId, submissionBojId, submissionResult, submissionTime}
*/
module.exports = async (bojId, problemId) => {
    if (!bojId) return null;
    if (!(Number.isInteger(problemId) && 1000 <= problemId && problemId <= 99999)) return null;

    // console.log(`bojId: ${bojId}, problemId: ${problemId}`);

    let ret = [];

    try {
        let lastSubmissionId = 5000000000;

        while (true) {
            const url = `https://www.acmicpc.net/status?problem_id=${problemId}&user_id=${bojId}&top=${lastSubmissionId-1}`;
            const res = await fetch(url, { headers }).then((res) => res.text());
            const doc = new jsdom.JSDOM(res).window.document;

            const rows = doc.querySelector("#status-table > tbody").rows;
            if (rows.length === 0) break;

            for (const row of rows) {
                ret.push(await cellsToSubmission(row.cells));
            }

            lastSubmissionId = ret[ret.length-1].submissionId;
        }
    } catch (error) {
        console.log(`There was an error in getAllSubmissions: ${error}`);
    }

    // console.log(ret);
    return ret.reverse();
}