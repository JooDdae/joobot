const getAllSubmissions = require('../../boj/getAllSubmissions');
const getFirstSolvedSubmission = require('../../boj/getFirstSolvedSubmission');
const numberToKoTime = require('../../utils/numberToKoTime');

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        console.log(numberToKoTime(Date.now() - (await getFirstSolvedSubmission('kyo20111', 18691, 0)).submissionTime * 1000));

        await interaction.editReply(`done!`);
    },

    name: 'test',
    description: 'test the function (dev only)',
    devOnly: true,
    // testOnly: Boolean,
    // deleted: Boolean,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    // options: Object[],
};