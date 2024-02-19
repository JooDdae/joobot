const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const UpdownDefense = require('../../models/UpdownDefense');
const User = require('../../models/User');
const numberToTier = require('../../utils/numberToTier');
const Makgora = require('../../models/Makgora');

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

        const fetchedUser = await User.findOne({ userId: targetUserId });
        const nickname = targetUserObject.nickname || targetUserObject.user.displayName;

        if (!fetchedUser) {
            return interaction.editReply({ content: `${ nickname }님은 아직 주때봇에 등록하지 않았습니다.` });
        }

        const bojId = fetchedUser.bojId;
        const updownDefense = await UpdownDefense.findOne({ userId: targetUserId });
        const makgora = await Makgora.findOne({ userId: targetUserId });
        const { currentTier, additionalQuery, numberOfSolvedProblems } = updownDefense;
        const { rating } = makgora;

        const embed = new EmbedBuilder()
            .setAuthor({ name: nickname, iconURL: targetUserObject.user.displayAvatarURL() })
            .setTitle(bojId)
            .setDescription(`현재 랜덤 티어: ${numberToTier(currentTier)}\n현재 추가 쿼리: \`${additionalQuery}\``)
            .addFields(
                { name: '성공한 문제 수', value: `${numberOfSolvedProblems.reduce((acc, cur) => acc + cur, 0)}개`, inline: true },
            )
            .addFields({ name: '막고라 레이팅', value: `${Math.round(rating)}`})
            .setTimestamp()
            .setColor(0xFAAABC);
        
        await interaction.deleteReply();
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