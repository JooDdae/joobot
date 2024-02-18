const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const isValidBojId = require('../../solvedac/isValidBojId');
const UpdownDefense = require('../../models/UpdownDefense');
const numberToKoTime = require('../../utils/numberToKoTime');
const getSolvedacProfileStatus = require('../../solvedac/getSolvedacProfileStatus');

const registerProgress = new Map(); // bojId, {userId, random String}
const registerUser = new Map(); // userId, bojId
const registerTime = 1000 * 60 * 3;

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.user.id;

        try {
            const updownDefense = await UpdownDefense.findOne({ userId });
            if (updownDefense) {
                return interaction.editReply({ content: `${interaction.user.username}님은 이미 ${updownDefense.bojId}로 등록되어 있습니다.` });
            }

            if (registerUser.has(userId)) {
                return interaction.editReply({ content: `${registerProgress.get(bojId).userId}로 등록 중입니다.` });
            }

            const bojId = interaction.options.get('백준아이디').value;
        
            if (await isValidBojId(bojId) === false) {
                return interaction.editReply({ content: '올바르지 않은 아이디입니다.' });
            }

            const fetchedUser = await UpdownDefense.findOne({ bojId });
            if (fetchedUser) {
                return interaction.editReply({ content: '이미 등록된 아이디입니다.' });
            }

            if (registerProgress.has(bojId)) {
                return interaction.editReply({ content: '다른 사람이 등록 중인 아이디입니다.' });
            }

            const randomString = '주때 팬이에요 ' + Math.random().toString(15).substring(2, 15) + Math.random().toString(15).substring(2, 15);
            registerProgress.set(bojId, { userId, randomString });
            registerUser.set(userId, { bojId });

            const embed = new EmbedBuilder()
                .setTitle(`${bojId}`)
                .setDescription(`5분 이내로 <https://solved.ac/profile/${bojId}> 의 상태 메시지에 아래 코드를 저장한 뒤, ✅버튼을 눌러주세요.\n`)
                .addFields(
                    { name: '코드', value: `\`${randomString}\`` }
                )
                .setTimestamp()
                .setColor(0xFAAABC);
            
            const confirmButton = new ButtonBuilder()
                .setLabel('✅ 확인')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('confirmButton');
            
            const cancelButton = new ButtonBuilder()
                .setLabel('❌ 취소')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('cancelButton');
                
            const buttonRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            const reply = await interaction.editReply({ embeds: [embed], components: [buttonRow] });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button, 
                time: 5 * 60 * 1000,
            });

            const endSession = async (message) => {
                buttonRow.components[0].setDisabled(true);
                buttonRow.components[1].setDisabled(true);
                embed.setDescription(message);
                embed.setFields();
                embed.setTimestamp();
                await interaction.editReply({ embeds: [embed], components: [buttonRow] });
                registerProgress.delete(bojId);
                registerUser.delete(userId);
                collector.stop();
            };

            collector.on('collect', async (i) => {
                if (i.customId === 'confirmButton') {
                    const status = await getSolvedacProfileStatus(bojId);
                    if (status !== randomString) {
                        await interaction.followUp({ content: '⚠️ 올바르지 않은 코드입니다.', ephemeral: true });
                        return await i.deferUpdate();
                    }

                    const newUpdownDefense = new UpdownDefense({ userId, bojId });
                    await newUpdownDefense.save();
                    await endSession('등록되었습니다! ❤️');
                    return await i.deferUpdate();
                }
                
                if (i.customId === 'cancelButton') {
                    await endSession('등록이 취소되었습니다.');
                    return await i.deferUpdate();
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await endSession('등록 시간 초과로 취소되었습니다.');
                }
            });
        } catch (error) {
            console.log(`There was an error trying to register: ${error}`);
        }
    },

    name: 'register',
    description: '주때봇에 등록합니다.',
    // devOnly: true,
    // testOnly: Boolean,
    // deleted: true,
    // permissionsRequired: [PermissionFlagsBits.Administrator],
    // botsPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: '백준아이디',
            description: '등록할 백준 아이디를 입력해주세요.',
            type: ApplicationCommandOptionType.String,
            required: true,
            min_length: 3,
            max_length: 20,
        }
    ],
};