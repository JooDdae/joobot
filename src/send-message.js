require('dotenv').config();
const { Client, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const roles = [
    {
        id : '1203916372883804200',
        label : '주때사생팬'
    },
    {
        id : '1203656906456170516',
        label : '주때팬'
    },
    {
        id : '1203916467234676746',
        label : '주때안티팬'
    },
];

client.on('ready', async (c) => {
    try {
        const channel = c.channels.cache.find(channel => channel.name === '봇-개발');
        if(!channel) throw new Error('채널을 찾을 수 없습니다.');

        const row = new ActionRowBuilder();
        roles.forEach(role => {
            row.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
            )
        });

        await channel.send({
            content: '역할을 선택해주세요.',
            components: [row]
        });
        process.exit();
    } catch (error) {
        console.log(error);
    }
});

client.login(process.env.DISCORD_TOKEN);