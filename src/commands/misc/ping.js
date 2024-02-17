module.exports = {
    callback: async (client, interaction) => {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const latency = reply.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`..Pong! Latency: ${latency}ms`);
    },

    name: 'ping',
    description: 'Ping!',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    // options: Object[],
};