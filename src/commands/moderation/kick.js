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
            return interaction.editReply({ content: 'You cannot kick the server owner' });
        }

        const targetRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (requestUserRolePosition <= targetRolePosition) {
            return interaction.editReply({ content: 'You cannot kick this user because their role is higher than yours' });
        }

        if (botRolePosition <= targetRolePosition) {
            return interaction.editReply({ content: 'I cannot kick this user because their role is higher than mine' });
        }

        try {
            await targetUser.kick(reason);
            await interaction.editReply({ content: `User ${targetUser.user.displayName} has been kicked\nReason: ${reason || 'No reason provided'}` });
        } catch (error) {
            console.log(`There was an error while kicking a user: ${error}`);
        }
    },

    name: 'kick',
    description: 'Kick a user',
    deleted: true,
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: 'target-user',
            description: 'Kick a member from the server',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for the kick',
            required: false,
            type: ApplicationCommandOptionType.String,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.KickMembers],
    botsPermissions: [PermissionFlagsBits.KickMembers],
};