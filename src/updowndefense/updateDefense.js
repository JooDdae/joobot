const { EmbedBuilder, ActionRowBuilder, ComponentType, ButtonStyle } = require('discord.js');

const { defenseParticipants } = require('./defenseVariables');
const numberToTier = require('../utils/numberToTier');
const numberToKoTime = require('../utils/numberToKoTime');
const UpdownDefense = require('../models/UpdownDefense');
const getFirstSolvedSubmission = require('../boj/getFirstSolvedSubmission');
const getSubmissionsBetween = require('../boj/getSubmissionsBetween');

const updateMessage = async (interaction, userId, buttonDisable) => {
    try {
        const query = {
            userId: userId,
            guildId: interaction.guild.id,
        };
    
        const updownDefense = await UpdownDefense.findOne(query);
        const { time, problemId, problemTitle, message, lastSubmissionId, randomString } = defenseParticipants.get(userId);
        
        const firstSolvedSubmission = await getFirstSolvedSubmission(updownDefense.bojId, problemId, lastSubmissionId);
    
        const submissionsBeforeFirstSolve = await getSubmissionsBetween(updownDefense.bojId, problemId, lastSubmissionId, firstSolvedSubmission?.submissionId || Infinity);
        
        const leftTime = updownDefense.timeLimit - submissionsBeforeFirstSolve.length * updownDefense.penalty - (Date.now() - time);
        // if firstSolvedSubmission is not null TODO...
    
        const submissions = await getSubmissionsBetween(updownDefense.bojId, problemId, lastSubmissionId);
    
        let submissionStatus = '';
        for (const submission of submissions) {
            if (submission.submissionResult === 'ac') submissionStatus += '✅';
            else if (submission.submissionResult === 'judging') submissionStatus += '⏳';
            else submissionStatus += '❌';
        }
        if (submissionStatus.length === 0) submissionStatus = ' ';
    
        const embed = new EmbedBuilder()
            .setAuthor({ name: updownDefense.bojId }) //  iconURL: interaction.user.avatarURL()
            .setTitle(`${problemId}. ${problemTitle}`)
            .setDescription(`https://www.acmicpc.net/problem/${problemId}`)
            .addFields(
                {
                    name: '난이도',
                    value: `${numberToTier(updownDefense.currentTier)}`,
                    inline: true
                },
                {
                    name: '제한 시간',
                    value: `${numberToKoTime(updownDefense.timeLimit)}`,
                    inline: true
                },
                {
                    name: '패널티',
                    value: `${numberToKoTime(updownDefense.penalty)}`,
                    inline: true
                }
            )
            .addFields(
                {
                    name: '남은 시간',
                    value: `${numberToKoTime(leftTime)}`,
                }
            )
            .addFields(
                {
                    name: '제출 현황',
                    value: `${submissionStatus}`,
                }
            )
            .setTimestamp()
            .setColor(0xFAAABC);
    
        const buttonRow = new ActionRowBuilder({
            components: [
                {
                    label: '🔄️ 갱신',
                    custom_id: `udd_update_button/${updownDefense.userId}/${randomString}`,
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    disabled: buttonDisable
                },
                {
                    label: '❤️💛💚',
                    custom_id: `udd_empty_button/${updownDefense.userId}/${randomString}`,
                    type: ComponentType.Button,
                    style: ButtonStyle.Secondary,
                    disabled: true
                },
                {
                    label: '🏳️ 포기',
                    custom_id: `udd_giveup_button/${updownDefense.userId}/${randomString}`,
                    type: ComponentType.Button,
                    style: ButtonStyle.Danger,
                    disabled: buttonDisable
                }
            ]
        });
    
        await message.edit({ embeds: [embed], components: [buttonRow]});
    } catch (error) {
        console.log(`There was an error trying to update message: ${error}`);
    }
}



const endDefense = async (interaction, userId) => {
    try {
        await updateMessage(interaction, userId, true);
        defenseParticipants.delete(userId);
    } catch (error) {
        console.log(`There was an error in endDefense : ${error}`);
    }
}

const succededDefense = async (interaction, userId) => {
    try {
        const query = {
            userId,
            guildId: interaction.guild.id,
        };
        const updownDefense = await UpdownDefense.findOne(query);

        if (updownDefense.currentTier < 30) {
            updownDefense.currentTier += 1;
            updownDefense.numberOfSolvedProblems += 1;
            await updownDefense.save();
            await interaction.followUp({ content: '제한시간 내에 문제를 풀어 난이도가 상승하였습니다! 🎉' });
        } else {
            await interaction.followUp({ content: '최고 난이도에 도달하여 난이도가 더 이상 상승하지 않습니다.' });
        }

        await endDefense(interaction, userId);
    } catch (error) {
        console.log(`There was an error in succededDefense : ${error}`);
    }
}

const failedDefense = async (interaction, userId) => {
    try {
        const query = {
            userId,
            guildId: interaction.guild.id,
        };
        const updownDefense = await UpdownDefense.findOne(query);

        if (updownDefense.currentTier > 1) {
            updownDefense.currentTier -= 1;
            await updownDefense.save();
            await interaction.followUp({ content: '제한시간 내에 문제를 풀지 못하여 난이도가 하락하였습니다. 🥲' });
        } else {
            await interaction.followUp({ content: '제한시간 내에 문제를 풀지 못하여 랜덤 디펜스에 실패하였습니다.' });
        }

        await endDefense(interaction, userId);
    } catch (error) {
        console.log(`There was an error in failedDefense : ${error}`);
    }
}

const checkDefense = async (interaction, userId) => {
    try {
        const guildId = interaction.guild.id;
        const updownDefense = await UpdownDefense.findOne({ userId, guildId });
        const { time, problemId, lastSubmissionId } = defenseParticipants.get(userId);
        
        const firstSolvedSubmission = await getFirstSolvedSubmission(updownDefense.bojId, problemId, lastSubmissionId);

        if (!firstSolvedSubmission) {
            return await interaction.editReply({ content: '아직 문제를 풀지 못했습니다.' });
        }

        const submissionsBeforeFirstSolve = await getSubmissionsBetween(updownDefense.bojId, problemId, lastSubmissionId, firstSolvedSubmission.submissionId);

        await interaction.editReply({ content: '결과를 출력합니다.' });

        if (updownDefense.timeLimit >= submissionsBeforeFirstSolve.length * updownDefense.penalty + (firstSolvedSubmission.submissionTime * 1000 - time)) {
            await succededDefense(interaction, userId);
        } else {
            await failedDefense(interaction, userId);
        }
    } catch (error) {
        console.log(`There was an error trying to check defense: ${error}`);
    }
}

const updateDefense = async (interaction, userId, buttonDisable) => {
    if (!defenseParticipants.has(userId)) return;

    try {
        await updateMessage(interaction, userId, buttonDisable);
        await checkDefense(interaction, userId);
    } catch (error) {
        console.log(`There was an error trying to update defense: ${error}`);
    }
}

module.exports = { updateDefense, failedDefense };