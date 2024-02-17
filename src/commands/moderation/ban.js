const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async (client, interaction) => {
        await interaction.deferReply();
        
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value;

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            return interaction.editReply({ content: 'User not found' });
        }

        if (targetUser.id === interaction.guild.ownerId) {
            return interaction.editReply({ content: 'You cannot ban the server owner' });
        }

        const targetRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (requestUserRolePosition <= targetRolePosition) {
            return interaction.editReply({ content: 'You cannot ban this user because their role is higher than yours' });
        }

        if (botRolePosition <= targetRolePosition) {
            return interaction.editReply({ content: 'I cannot ban this user because their role is higher than mine' });
        }

        try {
            await targetUser.ban({ reason });
            await interaction.editReply({ content: `User ${targetUser.user.tag} has been banned\nReason: ${reason || 'No reason provided'}` });
        } catch (error) {
            console.log(`There was an error while banning a user: ${error}`);
        }
    },

    name: 'ban',
    description: 'Ban a user',
    deleted: true,
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: 'target-user',
            description: 'Ban a member from the server',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for the ban',
            required: false,
            type: ApplicationCommandOptionType.String,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botsPermissions: [PermissionFlagsBits.BanMembers],
};