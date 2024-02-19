const getAllSubmissions = require('../../boj/getAllSubmissions');
const getFirstSolvedSubmission = require('../../boj/getFirstSolvedSubmission');
const numberToKoTime = require('../../utils/numberToKoTime');
const Makgora = require('../../models/Makgora');
const UpdownDefense = require('../../models/UpdownDefense');
const User = require('../../models/User');

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const users = await UpdownDefense.find();
        console.log(users);
        for (const user of users) {
            const { userId, bojId } = user;

            if (!(await User.findOne({ userId }))) {
                console.log(`User ${userId} not found, added to DB`);
                const newUser = new User({ userId, bojId });
                await newUser.save();
                const newMakgora = new Makgora({ userId, bojId });
                await newMakgora.save();
            }
        }

        await interaction.editReply({ content: 'done' });
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