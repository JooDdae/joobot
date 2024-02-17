const { devs, testServer} = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(command => command.name === interaction.commandName);

        if(!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.user.id)) {
                return interaction.reply({ content: 'This command is only available to the bot developers.', ephemeral: true });
            }
        }

        if (commandObject.testOnly) {
            if (interaction.guildId !== testServer) {
                return interaction.reply({ content: 'This command is only available in the test server.', ephemeral: true });
            }
        }

        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    return interaction.reply({ content: `You need the \`${permission}\` permission to use this command.`, ephemeral: true });
                }
            }
        }

        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;
                if (!bot.permissions.has(permission)) {
                    return interaction.reply({ content: `Bot need the \`${permission}\` permission to execute this command.`, ephemeral: true });
                }
            }
        }

        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(`There was an error while handling commands: ${error}`);
    }
}