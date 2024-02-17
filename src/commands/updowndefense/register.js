const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const isValidBojId = require('../../solvedac/isValidBojId');
const UpdownDefense = require('../../models/UpdownDefense');
const numberToKoTime = require('../../utils/numberToKoTime');
const getSolvedacProfileStatus = require('../../solvedac/getSolvedacProfileStatus');

const registerProgress = new Map(); // bojId, {userId, guildId, random String}
const registerUser = new Set();
const registerTime = 1000 * 60 * 3;

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const query = {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        };

        try {
            const updownDefense = await UpdownDefense.findOne(query);
            if (updownDefense) {
                return interaction.editReply({ content: `업다운 랜덤 디펜스에 ${updownDefense.bojId}로 이미 등록되어 있습니다.` });
            }

            const bojId = interaction.options.get('백준아이디').value;
        
            if (await isValidBojId(bojId) === false) {
                return interaction.editReply({ content: '올바르지 않은 아이디입니다.' });
            }

            if (registerProgress.has(bojId)) {
                const { userId, guildId, randomString } = registerProgress.get(bojId);
                if (userId !== query.userId || guildId !== query.guildId) {
                    return interaction.editReply({ content: '다른 유저가 등록 중인 아이디입니다.' });
                }

                const status = await getSolvedacProfileStatus(bojId);
                if (status !== randomString) {
                    return interaction.editReply({ content: '올바르지 않은 코드입니다.' });
                }

                const newUpdownDefense = new UpdownDefense({
                    userId,
                    guildId,
                    bojId,
                });
                
                registerProgress.delete(bojId);
                registerUser.delete(userId);

                await newUpdownDefense.save().catch((error) => console.log(`There was an error trying to save: ${error}`));
                return interaction.editReply({ content: `${bojId}로 등록되었습니다! ❤️` });
            } else {
                if (registerUser.has(query.userId)) {
                    return interaction.editReply({ content: `${registerProgress.get(bojId).userId}로 등록 중입니다.` });
                }

                const randomString = '주때 팬이에요 ' + Math.random().toString(36);
                registerProgress.set(bojId, { userId: query.userId, guildId: query.guildId, randomString });
                registerUser.add(query.userId);

                const message = `3분 이내로 <https://solved.ac/profile/${bojId}> 의 상태 메시지에 아래 코드를 저장한 뒤, \`/register ${bojId}\`를 다시 입력주세요.\n\`${randomString}\``
                await interaction.editReply(message); //  + numberToKoTime(registerTime)

                setTimeout(() => {
                    if (registerProgress.has(bojId)) {
                        registerProgress.delete(bojId);
                        registerUser.delete(query.userId);
                        interaction.followUp({ content: '시간이 초과되었습니다.', ephemeral: true });
                    }
                }, registerTime);
            }
            
        } catch (error) {
            console.log(`There was an error trying to register: ${error}`);
        }
    },

    name: 'register',
    description: '업다운 랜덤 디펜스에 등록합니다.',
    // devOnly: true,
    // testOnly: Boolean,
    // deleted: true,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: '백준아이디',
            description: '백준 아이디',
            type: ApplicationCommandOptionType.String,
            required: true,
            min_length: 3,
            max_length: 20,
        }
    ],
};