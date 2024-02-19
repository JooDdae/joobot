const { Interaction, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle, EmbedBuilder } = require('discord.js');
const glicko2 = require('glicko2');

const getRandomProblems = require('../solvedac/getRandomProblems');
const User = require('../models/User');
const Makgora = require('../models/Makgora');
const MakgoraHistory = require('../models/MakgoraHistory');
const numberToKoTime = require('../utils/numberToKoTime');
const getSubmissionStatus = require('../utils/getSubmissionStatus');
const getFirstSolvedSubmission = require('../boj/getFirstSolvedSubmission');
const getRecentSubmission = require('../boj/getRecentSubmission');
const getSubmissionsBetween = require('../boj/getSubmissionsBetween');
const colorDelta = require('../utils/colorDelta');

const inButtonProgress = new Set();

/**
 * 
 * @param {Interaction} interaction 
 * @returns 
 */
module.exports = async (userId, targetUserId, query, timeLimit, applyRating, msg) => {
    try {
        const user = await User.findOne({ userId });
        const targetUser = await User.findOne({ userId: targetUserId });

        const userBojId = user.bojId;
        const targetBojId = targetUser.bojId;

        const makgora = await Makgora.findOne({ userId });
        const targetMakgora = await Makgora.findOne({ userId: targetUserId });

        const lastSubmissionId = (await getRecentSubmission())?.submissionId || 0;
        const startTime = Date.now();
        let userTieRequest = false, targetTieRequest = false;

        const problems = await getRandomProblems(query, 1);
        const { problemId, titleKo: problemTitle } = problems[0];

        const embed = new EmbedBuilder()
            .setTitle(`${problemId}. ${problemTitle}`)
            .setDescription(`https://www.acmicpc.net/problem/${problemId}`)
            .addFields(
                { name: '레이팅', value: applyRating ? '적용함' : '적용안함', inline: true },
                { name: '제한시간', value: numberToKoTime(timeLimit), inline: true },
                { name: '남은 시간', value: numberToKoTime(timeLimit), inline: true },
            )
            .addFields({ name: '쿼리', value: `\`${query}\`` })
            .addFields({ name: `${userBojId}의 제출 현황`, value: '\u200b' })
            .addFields({ name: `${targetBojId}의 제출 현황`, value: '\u200b' })
            .addFields({ name: '무승부 요청', value: '\u200b' })
            .setFooter({ text:'마지막 갱신 시간' })
            .setTimestamp()
            .setColor(0xFAAABC);
        
        const updateButton = new ButtonBuilder()
            .setLabel('🔄️ 갱신')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`updateButton`);
        
        const tieButton = new ButtonBuilder()
            .setLabel('🤝 무승부')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('tieButton');

        const giveupButton = new ButtonBuilder()
            .setLabel('🏳️ 포기')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('giveupButton');
        
        const buttonRow = new ActionRowBuilder().addComponents(updateButton, tieButton, giveupButton);

        const message = await msg.reply({ content: `<@${userId}> <@${targetUserId}>`, embeds: [embed], components: [buttonRow] });
        
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button, 
            time: timeLimit,
        });

        const updateEmbed = async () => {
            const leftTime = Math.max(0, timeLimit - (Date.now() - startTime));
            embed.spliceFields(2, 1, { name: '남은 시간', value: `${numberToKoTime(leftTime)}`, inline: true });

            let userSubmissionStatus = await getSubmissionStatus(userBojId, problemId, lastSubmissionId);
            let targetSubmissionStatus = await getSubmissionStatus(targetBojId, problemId, lastSubmissionId);
            embed.spliceFields(4, 1, { name: `${userBojId}의 제출 현황`, value: userSubmissionStatus });
            embed.spliceFields(5, 1, { name: `${targetBojId}의 제출 현황`, value: targetSubmissionStatus });

            embed.spliceFields(6, 1, {
                name: '무승부 요청',
                value: userTieRequest != targetTieRequest ? `${userTieRequest ? userBojId : targetBojId }가 무승부를 요청했습니다.` : '\u200b'
            });

            embed.setTimestamp();
            await message.edit({ embeds: [embed] });
        };
        
        const disableButtons = async () => {
            buttonRow.components[0].setDisabled(true);
            buttonRow.components[1].setDisabled(true);
            buttonRow.components[2].setDisabled(true);
            await message.edit({ content: ' ', components: [buttonRow] });
        };

        const ratingChange = (bojId, oldRating, newRating) => {
            const fixedNewRating = Math.round(newRating);
            const fixedOldRating = Math.round(oldRating);
            return `${bojId} : ${fixedOldRating} ⇒ ${fixedNewRating} (${colorDelta(fixedNewRating - fixedOldRating)})\n`;
        };

        const endMakgora = async (result) => {
            const newMakgoraHistory = new MakgoraHistory({ userId, targetUserId, problemId, query, startTime, timeLimit, result, rated: applyRating });
            await newMakgoraHistory.save();

            const oldUserRating = makgora.rating;
            const oldTargetRating = targetMakgora.rating;

            if (applyRating) {
                const ranking = new glicko2.Glicko2({ tau: 0.5 });
                const p1 = ranking.makePlayer(makgora.rating, makgora.rd, makgora.vol);
                const p2 = ranking.makePlayer(targetMakgora.rating, targetMakgora.rd, targetMakgora.vol);
                ranking.updateRatings([[p1, p2, result === "win" ? 1 : result === "lose" ? 0 : 0.5]]);

                makgora.rating = p1.getRating();
                makgora.rd = p1.getRd();
                makgora.vol = p1.getVol();

                targetMakgora.rating = p2.getRating();
                targetMakgora.rd = p2.getRd();
                targetMakgora.vol = p2.getVol();

                await makgora.save();
                await targetMakgora.save();
            }
            
            embed.addFields({ name: '결과', value: result === "win" ? `승자: <@${userId}>` : result === "lose" ? `승자: <@${targetUserId}>` : '무승부' });
            await message.edit({ content: ' ', embeds: [embed] });

            let messageContent = '';
            if (result == "tie") messageContent += "막고라가 무승부로 종료되었습니다.\n";
            else messageContent += `막고라에서 <@${result === "win" ? userId : targetUserId}>가 승리했습니다!\n`;

            if (applyRating) {
                messageContent += ` <@${userId}>와 <@${targetUserId}>의 레이팅 변화는 다음과 같습니다.\n`;
                messageContent += "```ansi\n";
                messageContent += ratingChange(userBojId, oldUserRating, makgora.rating);
                messageContent += ratingChange(targetBojId, oldTargetRating, targetMakgora.rating);
                messageContent += "```";
            } else {
                messageContent += `레이팅 변화는 적용되지 않았습니다.\n`;
            }

            await message.reply({ content: messageContent });
            await collector.stop();
        };


        const checkMakgora = async () => {
            const userFirstSolvedSubmission = await getFirstSolvedSubmission(userBojId, problemId);
            const targetFirstSolvedSubmission = await getFirstSolvedSubmission(targetBojId, problemId);

            const userSolvedSubmissionId = userFirstSolvedSubmission?.submissionId || Infinity;
            const targetSolvedSubmissionId = targetFirstSolvedSubmission?.submissionId || Infinity;

            const firstSolvedSubmissionId = Math.min(userSolvedSubmissionId, targetSolvedSubmissionId);
            if (firstSolvedSubmissionId === Infinity) {
                return false;
            }

            const submissions = getSubmissionsBetween(firstSolvedSubmissionId === userSolvedSubmissionId ? targetBojId : userBojId,
                                                        problemId, lastSubmissionId, firstSolvedSubmissionId);
            for (const submission of submissions) { // 첫번째 AC 제출 사이에 채점이 끝나지 않은 코드가 있다면..
                if (submission.submissionResult === 'judging' || submission.submissionResult === 'wait' || submission.submissionResult === 'compile') {
                    return false;
                }
            }

            await endMakgora(userSubmissionId < targetSubmissionId ? "win" : "lose");
            return true;
        };

        collector.on('collect', async (i) => {
            await i.deferReply({ ephemeral: true });
            if (i.customId !== 'tieButton' && i.user.id !== targetUserId && i.user.id !== userId) {
                return await i.editReply({ content: `${i.customId === 'tieButton' ? '무승부' : '포기'}할 권한이 없습니다.` });
            }

            if (inButtonProgress.has(userId)) {
                return await i.editReply({ content: '다른 요청을 처리중입니다.' });
            }
            inButtonProgress.add(userId);

            if (i.customId === 'updateButton') {
                await updateEmbed();
                if(await checkMakgora()) {
                    await disableButtons();
                }
            }

            if (i.customId === 'tieButton') {
                if (i.user.id === userId) {
                    userTieRequest = !userTieRequest;
                }
                if (i.user.id === targetUserId) {
                    targetTieRequest = !targetTieRequest;
                }

                await updateEmbed();
                if (userTieRequest && targetTieRequest) {
                    await disableButtons();
                    await endMakgora("tie");
                }
            }

            if (i.customId === 'giveupButton') {
                await disableButtons();
                await endMakgora(i.user.id === userId ? "lose" : "win");
            }

            inButtonProgress.delete(userId);
            return await i.deleteReply();
        });


        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await disableButtons();
                await updateEmbed();
                if (await checkMakgora() === false) { // TODO : 시간제한이 끝났을 때 채점중인 코드가 AC였다면...?
                    await endMakgora("tie");
                }
            }
        });
    } catch (error) {
        console.log(`Error occurred in startMakgora.js : ${error}`);
    }
}