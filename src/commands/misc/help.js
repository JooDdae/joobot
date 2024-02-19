const { ApplicationCommandOptionType } = require("discord.js");

const helpUpdonwDefense = require('../../updowndefense/helpUpdownDefense');
const helpMakgora = require('../../makgora/helpMakgora');

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const content = interaction.options.getString('컨텐츠');

        if (content === "updown-random-defense") {
            await helpUpdonwDefense(interaction);
        }

        if (content === "makgora") {
            await helpMakgora(interaction);
        }
    },

    name: 'help',
    description: '도움말을 불러옵니다.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: '컨텐츠',
            description: '도움말을 불러올 컨텐츠를 선택해주세요.',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "업다운 랜덤 디펜스",
                    value: "updown-random-defense",
                },
                {
                    name: "막고라",
                    value: "makgora",
                },
            ]
        }
    ]
};