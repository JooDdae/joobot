const { ActivityType } = require('discord.js');

let status = [
    {
        name: 'きゅうくらりん / 星街すいせい(Cover)',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=QkdDWaBtK04',
    },
    {
        name: 'Stellar Stellar',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=a51VH9BYzZA'
    },
    {
        name: '幽霊東京 / 星街すいせい(Cover)',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=tuZty35Fk7M'
    },
    {
        name: 'NEXT COLOR PLANET',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=vQHVGXdcqEQ'
    },
    {
        name: 'GHOST',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=IKKar5SS29E'
    },
    {
        name: 'フォニイ / 星街すいせい(Cover)',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=N029UUlH1Dc'
    },
    {
        name: 'KING / 星街すいせい(Cover)',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=mLwtfg57kbs'
    },
    {
        name: '食虫植物 / 星街すいせい(Cover)',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=kPWv4Xhtnno'
    }
]


module.exports = (client) => {
    setInterval(() => {
        const index = Math.floor(Math.random() * (status.length - 1) + 1);
        client.user.setActivity(status[index].name, { type: status[index].type, url: status[index].url });
    }, 10000);
};