
module.exports = async (cells) => { // 0 : submissionId, 1 : bojId, 2 : problemId, 3 : result, 8 : time
    const submissionId = Number(cells[0].innerHTML);
    const submissionProblemId = Number(cells[2].innerHTML.split('"')[1].split('/')[2]);
    const submissionBojId = cells[1].innerHTML.split('"')[1].split('/')[2];
    const submissionResult = cells[3].innerHTML.split('"')[3];
    const submissionTime = Number(cells[8].innerHTML.split('"')[9]);

    return { submissionId, submissionProblemId, submissionBojId, submissionResult, submissionTime };
}