const { ApplicationCommandOptionType, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');

const User = require('../../models/User');
const numberToKoTime = require('../../utils/numberToKoTime');
const isValidSolvedacQuery = require('../../solvedac/isValidSolvedacQuery');
const startMakgora = require('../../makgora/startMakgora');

const makgoraProgress = new Set();
const inButtonProgress = new Set();

module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.user.id;
        const targetUserId = interaction.options.get('대상')?.value;
        
        const user = await User.findOne({ userId });
        if (!user) {
            return interaction.editReply({ content: `봇에 등록되어 있지 않습니다. \`/register [백준 아이디]\`를 통해 등록해주세요.` });
        }

        if (userId == targetUserId) {
            return interaction.editReply({ content: '자기 자신을 대상으로 막고라를 신청할 수 없습니다.' });
        }

        const targetUser = await User.findOne({ userId: targetUserId });
        if (!targetUser) {
            return interaction.editReply({ content: `대상이 봇에 등록되어 있지 않습니다.` });
        }

        if (makgoraProgress.has(userId)) {
            return interaction.editReply({ content: '다른 막고라를 진행 중입니다.' });
        }
        if (makgoraProgress.has(targetUserId)) {
            return interaction.editReply({ content: '대상이 다른 막고라를 진행 중입니다.' });
        }

        makgoraProgress.add(userId);
        makgoraProgress.add(targetUserId);

        const { bojId: userBojId } = user;
        const { bojId: targetBojId } = targetUser;

        const query = 'o? ' + (interaction.options.get('쿼리')?.value || '*s5..g3 s#50..') + ` -@${userBojId} -@${targetBojId}`;
        const timeLimit = (interaction.options.get('제한시간')?.value || 60) * 60 * 1000;
        const applyRating = interaction.options.get('레이팅적용')?.value ?? true;

        if (!(await isValidSolvedacQuery(query))) {
            makgoraProgress.delete(userId);
            makgoraProgress.delete(targetUserId);
            return interaction.editReply({ content: '쿼리에 해당하는 문제가 존재하지 않습니다.' });
        }

        const embed = new EmbedBuilder()
            .setTitle('막고라')
            .setDescription(`<@${userId}>님이 <@${targetUserId}>님에게 막고라를 신청하였습니다.\n${5}분 이내에 상대방이 수락하지 않을 경우 자동으로 취소됩니다.`)
            .addFields([{ name: '신청자', value: `[${userBojId}](https://solved.ac/profile/${userBojId})`, inline: true }, { name: '대상', value: `[${targetBojId}](https://solved.ac/profile/${targetBojId})`, inline: true }])
            .addFields({ name: '쿼리', value: `\`${query}\`` })
            .addFields([{ name: '레이팅', value: applyRating ? '적용함' : '적용안함', inline: true }, { name: '제한시간', value: numberToKoTime(timeLimit), inline: true }])
            .setTimestamp()
            .setColor(0xFAAABC);
        
        const acceptButton = new ButtonBuilder()
            .setLabel('✅ 수락')
            .setCustomId('acceptMakgora')
            .setStyle(ButtonStyle.Primary);
        
        const emptyButton = new ButtonBuilder()
            .setLabel('❤️💙🩷💛')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('emptyButton')
            .setDisabled(true);

        const rejectButton = new ButtonBuilder()
            .setLabel('❌ 거절/취소')
            .setCustomId('rejectMakgora')
            .setStyle(ButtonStyle.Secondary);
        
        const buttonRow = new ActionRowBuilder().addComponents(acceptButton, emptyButton, rejectButton);

        await interaction.deleteReply();
        const message = await interaction.followUp({ content: `<@${userId}> <@${targetUserId}>`, embeds: [embed], components: [buttonRow] });
        
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button, 
            time: 5 * 60 * 1000,
        });

        const disableButtons = async () => {
            buttonRow.components[0].setDisabled(true);
            buttonRow.components[2].setDisabled(true);
            await message.edit({ content: ' ', components: [buttonRow] });
        };

        collector.on('collect', async (i) => {
            await i.deferReply({ ephemeral: true });
            if (i.user.id !== targetUserId && (i.customId !== 'rejectMakgora' || i.user.id !== userId)) {
                return await i.editReply({ content: `막고라를 ${i.customId === 'acceptMakgora' ? '수락' : '거절'}할 권한이 없습니다.` });
            }

            if (inButtonProgress.has(userId)) {
                return await i.editReply({ content: '다른 요청을 처리중입니다.' });
            }
            inButtonProgress.add(userId);

            await disableButtons();
            await i.deleteReply();
            if (i.customId === 'acceptMakgora') {
                embed.setDescription(`<@${targetUserId}>님이 신청을 받아들여 막고라를 시작합니다.`);
                await message.edit({ embeds: [embed] });
                await startMakgora(userId, targetUserId, query, timeLimit, applyRating, message);
            }

            if (i.customId === 'rejectMakgora') {
                await message.reply({ content: i.user.id === userId ? '막고라를 취소하였습니다.' : '상대방이 막고라를 거절하였습니다.' });
            }

            inButtonProgress.delete(userId);
            await collector.stop();
        });


        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                if (!makgoraProgress.has(userId) || !makgoraProgress.has(targetUserId)) return;
                await disableButtons();
                await message.reply({ content: '상대방이 5분동안 막고라를 수락하지 않아 자동으로 취소되었습니다.' });
            }
            makgoraProgress.delete(userId);
            makgoraProgress.delete(targetUserId);
        });
    },

    name: 'makgora',
    description: '막고라를 신청합니다.',
    // devOnly: true,
    // testOnly: Boolean,
    // deleted: true,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: '대상',
            description: '막고라를 신청할 대상을 선택하세요.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: '쿼리',
            description: '문제를 선택할 때 사용할 쿼리를 입력하세요. (기본 \`*s5..g3 s#50..\`)',
            type: ApplicationCommandOptionType.String,
        },
        {
            name: '제한시간',
            description: '막고라를 진행할 시간을 입력하세요. (분 단위, 기본 60분)',
            type: ApplicationCommandOptionType.Integer,
        },
        {
            name: '레이팅적용',
            description: '막고라를 진행할 때 레이팅을 적용할지 선택하세요. (기본 적용함)',
            type: ApplicationCommandOptionType.Boolean,
            choices: [
                { name: '적용함', value: true },
                { name: '적용안함', value: false }
            ]
        }
    ]
};