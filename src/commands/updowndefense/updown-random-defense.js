const { ApplicationCommandOptionType } = require('discord.js');
const startNewDefense = require('../../updowndefense/startNewDefense');


const UpdownDefense = require('../../models/UpdownDefense');
const numberToTier = require('../../utils/numberToTier');
const { defenseParticipants } = require('../../updowndefense/startNewDefense');

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        

        const userId = interaction.user.id;
        const tier = interaction.options.get('난이도')?.value;

        if (tier) {
            if (defenseParticipants.has(userId)) {
                return interaction.editReply({ content: '디펜스 중에는 난이도를 변경할 수 없습니다.' });
            }

            try {
                const updownDefense = await UpdownDefense.findOne({ userId });
                if (!updownDefense) {
                    return interaction.editReply({ content: `업다운 랜덤 디펜스에 등록되어 있지 않습니다.` });
                }

                if (updownDefense.currentTier === tier) {
                    return interaction.editReply({ content: '이미 해당 난이도로 설정되어 있습니다.' });
                }

                updownDefense.currentTier = tier;
                await updownDefense.save();
                await interaction.editReply({ content: `난이도가 ${numberToTier(tier)}로 변경되었습니다.` });
            } catch (error) {
                console.log(`There was an error trying to edit tier: ${error}`);
            }
        } else {
            await startNewDefense(interaction);
        }
    },

    name: 'updown-random-defense',
    description: '업다운 랜덤 디펜스',
    // devOnly: true,
    // testOnly: Boolean,
    // deleted: true,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: '난이도',
            description: '수정할 난이도를 선택합니다.',
            type: ApplicationCommandOptionType.Integer,
            choices: [
                {
                    name: numberToTier(1),
                    value: 1,
                },
                {
                    name: numberToTier(2),
                    value: 2,
                },
                {
                    name: numberToTier(3),
                    value: 3,
                },
                {
                    name: numberToTier(4),
                    value: 4,
                },
                {
                    name: numberToTier(5),
                    value: 5,
                },
                {
                    name: numberToTier(6),
                    value: 6,
                },
                {
                    name: numberToTier(7),
                    value: 7,
                },
                {
                    name: numberToTier(8),
                    value: 8,
                },
                {
                    name: numberToTier(9),
                    value: 9,
                },
                {
                    name: numberToTier(10),
                    value: 10,
                },
                {
                    name: numberToTier(11),
                    value: 11,
                },
                {
                    name: numberToTier(12),
                    value: 12,
                },
                {
                    name: numberToTier(13),
                    value: 13,
                },
                {
                    name: numberToTier(14),
                    value: 14,
                },
                {
                    name: numberToTier(15),
                    value: 15,
                },
                {
                    name: numberToTier(16),
                    value: 16,
                },
                {
                    name: numberToTier(17),
                    value: 17,
                },
                {
                    name: numberToTier(18),
                    value: 18,
                },
                {
                    name: numberToTier(19),
                    value: 19,
                },
                {
                    name: numberToTier(20),
                    value: 20,
                },
                {
                    name: numberToTier(21),
                    value: 21,
                },
                {
                    name: numberToTier(22),
                    value: 22,
                },
                {
                    name: numberToTier(23),
                    value: 23,
                },
                {
                    name: numberToTier(24),
                    value: 24,
                },
                {
                    name: numberToTier(25),
                    value: 25,
                }
            ],
        }
    ]
};