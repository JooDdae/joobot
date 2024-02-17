const getAllSubmissions = require("./getAllSubmissions");


/*
    returns {submissionId, submissionProblemId, submissionBojId, submissionResult, submissionTime}
*/
module.exports = async (bojId, problemId, lastSubmissionId) => {
    if (!bojId) return null;
    if(!(Number.isInteger(problemId) && 1000 <= problemId && problemId <= 99999)) return null;

    try {
        const submissions = await getAllSubmissions(bojId, problemId);
        
        for (const submission of submissions) {
            if (submission.submissionId > lastSubmissionId && submission.submissionResult === 'ac') {
                return submission;
            }
        }
        return null;
    } catch (error) {
        console.log(`There was an error in getFirstSolvedSubmission.js: ${error}`);
        return null;
    }
}