const { ApplicationCommandOptionType } = require('discord.js');
const startNewDefense = require('../../updowndefense/startNewDefense');


const UpdownDefense = require('../../models/UpdownDefense');
const numberToTier = require('../../utils/numberToTier');
const { defenseParticipants } = require('../../updowndefense/startNewDefense');
const isValidSolvedacQuery = require('../../solvedac/isValidSolvedacQuery');

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const userId = interaction.user.id;
        const updownDefense = await UpdownDefense.findOne({ userId });
        if (!updownDefense) {
            return interaction.editReply({ content: `주때봇에 등록되어 있지 않습니다. \`/register [백준 아이디]\`를 통해 등록해주세요.` });
        }

        const tier = interaction.options.get('난이도변경')?.value;
        const query = interaction.options.get('추가쿼리변경')?.value;

        if (tier || query) {
            console.log(tier, query);
            if (defenseParticipants && defenseParticipants.has(userId)) {
                return interaction.editReply({ content: '디펜스 중에는 옵션을 변경할 수 없습니다.' });
            }

            if(tier) {
                try {
                    if (updownDefense.currentTier === tier) {
                        await interaction.followUp({ content: '이미 해당 난이도로 설정되어 있습니다.', ephemeral: true });
                    } else {
                        const previousTier = updownDefense.currentTier;
                        updownDefense.currentTier = tier;
                        await updownDefense.save();
                        await interaction.followUp({ content: `난이도가 \`${numberToTier(previousTier)}\`에서 \`${numberToTier(tier)}\`로 변경되었습니다.`, ephemeral: true });
                    }
                } catch (error) {
                    console.log(`There was an error trying to edit tier: ${error}`);
                }
            }

            if (query) {
                try {
                    if (query.includes('*') || query.includes('tier')) {
                        await interaction.followUp({ content: '난이도와 관련된 쿼리는 사용할 수 없습니다.', ephemeral: true });
                    } else if (updownDefense.additionalQuery === query) {
                        await interaction.followUp({ content: '이미 해당 쿼리로 설정되어 있습니다.', ephemeral: true });
                    } else if (await isValidSolvedacQuery(query) === false) {
                        await interaction.editReply({ content: '올바르지 않은 쿼리입니다.', ephemeral: true });
                    } else {
                        const previousQuery = updownDefense.additionalQuery;
                        updownDefense.additionalQuery = query;
                        await updownDefense.save();
                        await interaction.followUp({ content: `추가 쿼리가 \`${previousQuery}\`에서 \`${query}\`로 변경되었습니다.`, ephemeral: true });
                    }
                } catch (error) {
                    console.log(`There was an error trying to edit query: ${error}`);
                }
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
            name: '추가쿼리변경',
            description: '문제를 선택할 때 사용할 추가 쿼리를 변경합니다. 추가쿼리는 기본적으로 50명 이상이 푼 문제를 선택하도록 설정되어 있습니다.',
            type: ApplicationCommandOptionType.String,
        },
        {
            name: '난이도변경',
            description: '변경할 난이도를 선택합니다.',
            type: ApplicationCommandOptionType.Integer,
            choices: [
                { name: numberToTier(1), value: 1, },
                { name: numberToTier(2), value: 2, },
                { name: numberToTier(3), value: 3, },
                { name: numberToTier(4), value: 4, },
                { name: numberToTier(5), value: 5, },
                { name: numberToTier(6), value: 6, },
                { name: numberToTier(7), value: 7, },
                { name: numberToTier(8), value: 8, },
                { name: numberToTier(9), value: 9, },
                { name: numberToTier(10), value: 10, },
                { name: numberToTier(11), value: 11, },
                { name: numberToTier(12), value: 12, },
                { name: numberToTier(13), value: 13, },
                { name: numberToTier(14), value: 14, },
                { name: numberToTier(15), value: 15, },
                { name: numberToTier(16), value: 16, },
                { name: numberToTier(17), value: 17, },
                { name: numberToTier(18), value: 18, },
                { name: numberToTier(19), value: 19, },
                { name: numberToTier(20), value: 20, },
                { name: numberToTier(21), value: 21, },
                { name: numberToTier(22), value: 22, },
                { name: numberToTier(23), value: 23, },
                { name: numberToTier(24), value: 24, },
                { name: numberToTier(25), value: 25, }
            ],
        }
    ]
};