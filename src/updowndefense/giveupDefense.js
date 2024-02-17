const { failedDefense } = require("./updateDefense");


module.exports = async (interaction) => {
    const userId = interaction.user.id;
    await interaction.editReply({ content: '디펜스를 포기하여 실패로 처리됩니다.' });
    await failedDefense(interaction, userId);
}