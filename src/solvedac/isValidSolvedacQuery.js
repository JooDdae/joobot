const getRandomProblems = require("./getRandomProblems")


module.exports = async (query) => {
    return (await getRandomProblems(query)).length > 0;
}