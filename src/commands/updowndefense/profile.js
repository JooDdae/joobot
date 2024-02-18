const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const UpdownDefense = require('../../models/UpdownDefense');
const numberToTier = require('../../utils/numberToTier');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            return interaction.reply({ content: '이 명령어는 서버에서만 사용할 수 있습니다.' });
        }

        await interaction.deferReply({ ephemeral: true });

        const mentionedUserId = interaction.options.get('유저')?.value;
        const targetUserId = mentionedUserId || interaction.user.id;
        const targetUserObject = await interaction.guild.members.fetch(targetUserId);

        if (!targetUserObject) {
            return interaction.editReply({ content: '유저가 존재하지 않습니다.' });
        }

        const fetchedUser = await UpdownDefense.findOne({ userId: targetUserId });

        if (!fetchedUser) {
            return interaction.editReply({ content: `${targetUserObject.nickname}님은 아직 업다운 랜덤 디펜스에 등록하지 않았습니다.` });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: targetUserObject.nickname, iconURL: targetUserObject.user.avatarURL() })
            .setTitle(fetchedUser.bojId)
            .setDescription(`현재 랜덤 티어: ${numberToTier(fetchedUser.currentTier)}`)
            .addFields(
                { name: '성공한 문제 수', value: `${fetchedUser.numberOfSolvedProblems}`},
            )
            .setTimestamp()
            .setColor(0xFAAABC);
        
        await interaction.editReply({ content: '프로필을 불러오는 중입니다...' });
        await interaction.followUp({ embeds: [embed] });
    },

    name: 'profile',
    description: '유저의 프로필을 확인합니다.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: '유저',
            description: '프로필을 확인할 유저',
            type: ApplicationCommandOptionType.Mentionable,
        }
    ],
    // deleted: Boolean,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
};