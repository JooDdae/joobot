const getSubmissionsBetween = require("../boj/getSubmissionsBetween")

module.exports = async (bojId, problemId, startSubmissionId = 0, endSubmissionId = Infinity) => {
    try {
        const submissions = await getSubmissionsBetween(bojId, problemId, startSubmissionId, endSubmissionId);

        let submissionStatus = '';
        for (const submission of submissions) {
            if (submission.submissionResult === 'ac') submissionStatus += '✅';
            else if (submission.submissionResult === 'judging' || submission.submissionResult === 'wait' || submission.submissionResult === 'compile') submissionStatus += '⏳';
            else submissionStatus += '❌';
            if(submissionStatus.length % 11 === 10) submissionStatus += '\n';
        }
        if (submissionStatus.length === 0) submissionStatus = '\u200b';

        return submissionStatus;
    } catch (err) {
        console.log(`There was an error in getSubmissionStatus.js : ${err}`);
        return '\u200b';
    }
}