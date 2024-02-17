const { ApplicationCommandOptionType } = require('discord.js');
const getRandomProblems = require('../../solvedac/getRandomProblems');

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply();
        const query = interaction.options.getString('쿼리') || "";
        const count = interaction.options.getInteger('개수') || 1;
        const problems = await getRandomProblems(query, count);
        await interaction.editReply(problems.map(problem => `<https://www.acmicpc.net/problem/${problem.problemId}>`).join("\n"));
    },

    name: 'random-problem',
    description: '랜덤한 문제를 뽑습니다.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: '쿼리',
            description: '검색할 쿼리',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: '개수',
            description: '가져올 문제의 개수',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        }
    ]
};