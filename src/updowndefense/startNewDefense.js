const { Interaction, EmbedBuilder, ActionRowBuilder, ComponentType, ButtonStyle } = require('discord.js');

const UpdownDefense = require('../models/UpdownDefense');
const getRandomProblems = require('../solvedac/getRandomProblems');

const { defenseParticipants } = require('./defenseVariables');
const { updateDefense } = require('./updateDefense');
const getRecentSubmission = require('../boj/getRecentSubmission');

/**
 * 
 * @param {Interaction} interaction 
 * @returns 
 */
module.exports = async (interaction) => {
    try {
        const query = {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        };
        const updownDefense = await UpdownDefense.findOne(query);
        if (!updownDefense) {
            return interaction.editReply({ content: `업다운 랜덤 디펜스에 등록되어 있지 않습니다.` });
        }
    
        if (defenseParticipants.has(interaction.user.id)) {
            return interaction.editReply({ content: '랜덤 디펜스에 이미 참가하고 있습니다.' });
        }
    
        const problemQuery = `-@${updownDefense.bojId} *${updownDefense.currentTier}`;
        const problems = await getRandomProblems(problemQuery, 1);
    
        if (problems.length === 0) {
            return interaction.editReply({ content: '해당 난이도의 문제가 존재하지 않습니다.' }); // TODO : 존재하지 않을 때 동작 추가
        }
        const problem = problems[0];

        await interaction.editReply({ content: '업다운 랜덤 디펜스를 시작합니다!' });
    
        const embed = new EmbedBuilder()
            .setAuthor({ name: updownDefense.bojId, iconURL: interaction.user.avatarURL() })
            .setColor(0xFAAABC);

        const message = await interaction.followUp({ embeds: [embed] });
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        defenseParticipants.set(interaction.user.id, {
            time: Date.now() + 1000,
            problemId: problem.problemId,
            problemTitle: problem.titleKo,
            message,
            lastSubmissionId: (await getRecentSubmission(interaction.user.id))?.submissionId || 0,
            randomString
        });
        
        await updateDefense(interaction, interaction.user.id, false);

        // TODO : 자동종료 추가
    } catch (error) {
        console.log(`There was an error trying to start new defense: ${error}`);
    }
    
}