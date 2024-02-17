module.exports = async (client, interaction) => {
    try {
        if (!interaction.isButton()) return;
        const role = interaction.guild.roles.cache.find(role => role.id === interaction.customId);
        if(!role) return;
        
        await interaction.deferReply({ ephemeral: true });

        const hasRole = interaction.member.roles.cache.has(role.id);
        
        if(hasRole) {
            await interaction.member.roles.remove(role);
            return interaction.editReply({ content: `역할 ${role.name}을 제거했습니다.` });
        } else {
            await interaction.member.roles.add(role);
            return interaction.editReply({ content: `역할 ${role.name}을 추가했습니다.` });
        }
    } catch (error) {
        console.log(error);
    }
};