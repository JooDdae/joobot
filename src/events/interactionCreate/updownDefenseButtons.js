const { updateDefense } = require("../../updowndefense/updateDefense");
const giveupDefense = require("../../updowndefense/giveupDefense");

const { defenseParticipants } = require('../../updowndefense/defenseVariables');

module.exports = async (client, interaction) => {
    try {
        if (!interaction.isButton()) return;
        if (interaction.customId.substring(0, 3) !== 'udd') return;

        const userId = interaction.user.id;
        const buttonOwnerUserId = interaction.customId.split('/')[1];
        const randomDefenseId = interaction.customId.split('/')[2];
        
        await interaction.deferReply({ ephemeral: true });

        if(!defenseParticipants.has(buttonOwnerUserId) || defenseParticipants.get(buttonOwnerUserId).randomString !== randomDefenseId) {
            return interaction.editReply({ content: '이미 종료된 디펜스입니다.' }); // TODO : 버튼 비활성화
        }

        if (!(userId === buttonOwnerUserId || interaction.customId.includes('update'))) {
            return interaction.editReply({ content: '다른 사람의 랜덤 디펜스는 정보 갱신을 제외한 기능을 사용할 수 없습니다.' });
        }

        if (interaction.customId.includes('update')) {
            await updateDefense(interaction, buttonOwnerUserId, false);
            await interaction.deleteReply();
        }
        if (interaction.customId.includes('giveup')) await giveupDefense(interaction);
    } catch (error) {
        console.log(error);
    }
};