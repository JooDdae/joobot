const { Interaction, EmbedBuilder, ActionRowBuilder, ComponentType, ButtonStyle, ButtonBuilder } = require('discord.js');

const UpdownDefense = require('../models/UpdownDefense');
const getRandomProblems = require('../solvedac/getRandomProblems');

const getRecentSubmission = require('../boj/getRecentSubmission');
const getSubmissionsBetween = require('../boj/getSubmissionsBetween');

const numberToTier = require('../utils/numberToTier');
const numberToKoTime = require('../utils/numberToKoTime');
const getTimeLimit = require('../utils/getTimeLimit');

const defenseParticipants = new Map();

/**
 * 
 * @param {Interaction} interaction 
 * @returns 
 */
module.exports = async (interaction) => {
    const userId = interaction.user.id;

    try {
        const updownDefense = await UpdownDefense.findOne({ userId });
        if (!updownDefense) {
            return interaction.editReply({ content: `업다운 랜덤 디펜스에 등록되어 있지 않습니다.` });
        }
    
        if (defenseParticipants.has(userId)) {
            return interaction.editReply({ content: '랜덤 디펜스에 이미 참가하고 있습니다.' });
        }
        
        const { bojId, currentTier: problemTier, additionalQuery  } = updownDefense;
        const problemQuery = `-@${bojId} *${problemTier} ${additionalQuery}`;
        const problems = await getRandomProblems(problemQuery, 1);
    
        if (problems.length === 0) {
            return interaction.editReply({ content: `${problemQuery}에 해당하는 문제가 존재하지 않습니다. \`/updown-random-defense [쿼리]\` 명령어를 통해 난이도를 변경하거나 추가 쿼리를 변경해주세요.` });
        }


        // 디펜스 준비
        const randomString = Math.random().toString(15).substring(2, 15) + Math.random().toString(15).substring(2, 15);
        defenseParticipants.set(userId, randomString);

        const problem = problems[0];
        const { problemId, titleKo: problemTitle } = problem;

        const embed = new EmbedBuilder()
            .setAuthor({ name: bojId, iconURL: interaction.user.avatarURL() })
            .setTitle(`${problemId}. ${problemTitle}`)
            .setDescription(`https://www.acmicpc.net/problem/${problemId}`)
            // .setURL(`https://www.acmicpc.net/problem/${problemId}`)
            .addFields(
                {
                    name: '난이도',
                    value: `${numberToTier(problemTier)}`,
                    inline: true
                },
                {
                    name: '제한 시간',
                    value: `${numberToKoTime(getTimeLimit(problemTier))}`,
                    inline: true
                },
                {
                    name: '남은 시간',
                    value: `${numberToKoTime(getTimeLimit(problemTier))}`,
                    inline: true
                },
                {
                    name: '제출 현황',
                    value: ' ',
                })
            .setFooter({ text:'마지막 갱신 시간' })
            .setTimestamp()
            .setColor(0xFAAABC);

        const updateButton = new ButtonBuilder()
            .setLabel('🔄️ 갱신')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`updateButton`);

        const emptyButton = new ButtonBuilder()
            .setLabel('❤️💙🩷💛')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('emptyButton')
            .setDisabled(true);
        
        const giveupButton = new ButtonBuilder()
            .setLabel('🏳️ 포기')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('giveupButton');

        const buttonRow = new ActionRowBuilder().addComponents(updateButton, emptyButton, giveupButton);
        
        
        const lastSubmissionId = (await getRecentSubmission(interaction.user.id))?.submissionId || 0;
        const startTime = Date.now();




        await interaction.editReply({ content: '업다운 랜덤 디펜스를 시작합니다!' });
        await interaction.deleteReply();

        const message = await interaction.followUp({ content: `<@${userId}>`, embeds: [embed], components: [buttonRow] });


        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button, 
            time: getTimeLimit(problemTier),
        });

        const endSession = async () => {
            buttonRow.components[0].setDisabled(true);
            buttonRow.components[2].setDisabled(true);
            await message.edit({ content: ' ', embeds: [embed], components: [buttonRow] });
            defenseParticipants.delete(userId);
            await collector.stop();
        };

        const succeededDefense = async () => {
            updownDefense.numberOfSolvedProblems[problemTier] += 1;
            await updownDefense.save();
            if (updownDefense.currentTier < 30) {
                updownDefense.currentTier += 1;
                await updownDefense.save();
                embed.addFields({ name: '결과', value: '성공적으로 디펜스를 완료하여 난이도가 상승하였습니다! 🎉'});
            } else {
                embed.addFields({ name: '결과', value: '성공적으로 디펜스를 완료하였습니다! 🎉'});
            }

            await endSession();
            return await message.reply({ content: `<@${userId}>(${bojId})님이 디펜스를 성공적으로 완료하였습니다! 🎉` });
        };

        const failedDefense = async (reason) => {
            if (updownDefense.currentTier > 1) {
                updownDefense.currentTier -= 1;
                await updownDefense.save();
                embed.addFields({ name: '결과', value: `${reason} 난이도가 하락하였습니다.`});
            } else {
                embed.addFields({ name: '결과', value: `${reason}`});
            }

            await endSession();
            return await message.reply({ content: `<@${userId}>(${bojId})님이 ${reason}` });
        };

        const updateEmbed = async () => {
            const leftTime = Math.max(0, getTimeLimit(problemTier) - (Date.now() - startTime));
            embed.spliceFields(2, 1, { name: '남은 시간', value: `${numberToKoTime(leftTime)}`, inline: true });

            const submissions = await getSubmissionsBetween(updownDefense.bojId, problemId, lastSubmissionId);
            let submissionStatus = '';
            for (const submission of submissions) {
                if(submissionStatus.length > 0 && submissionStatus.length % 10 === 0) submissionStatus += '\n';

                if (submission.submissionResult === 'ac') submissionStatus += '✅';
                else if (submission.submissionResult === 'judging' || submission.submissionResult === 'wait' || submission.submissionResult === 'compile') submissionStatus += '⏳';
                else submissionStatus += '❌';
            }
            if (submissionStatus.length === 0) submissionStatus = ' ';
            embed.spliceFields(3, 1, { name: '제출 현황', value: `${submissionStatus}` });
            embed.setTimestamp();
            await message.edit({ embeds: [embed], components: [buttonRow] });
            
            if (submissionStatus.includes('✅')) {
                await succeededDefense();
                return true;
            }
            return false;
        };

        collector.on('collect', async (i) => {
            if(await updateEmbed()) {
                return await i.deferUpdate();
            }
            
            if (i.customId === 'updateButton') {
                return await i.deferUpdate();
            }
            
            if (i.customId === 'giveupButton') {
                if (i.user.id !== userId) {
                    return await i.reply({ content: '남의 디펜스를 포기할 수 없습니다.', ephemeral: true });
                }

                await failedDefense('디펜스를 포기하였습니다.');
                return await i.deferUpdate();
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                if(await updateEmbed() === false) {
                    return await failedDefense('제한 시간 초과로 디펜스를 실패하였습니다.');
                }
            }
        });
    } catch (error) {
        console.log(`There was an error trying to start new defense: ${error}`);
    }
}