const getAllSubmissions = require("./getAllSubmissions");

module.exports = async (bojId, problemId, startSubmissionId = 0, endSubmissionId = Infinity) => {
    const submissions = await getAllSubmissions(bojId, problemId);

    const ret = [];
    for (const submission of submissions) {
        if (startSubmissionId < submission.submissionId && submission.submissionId < endSubmissionId) {
            ret.push(submission);
        }
    }
    return ret;
}