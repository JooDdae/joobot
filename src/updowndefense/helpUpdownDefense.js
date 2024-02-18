module.exports = async (interaction) => {
    let message = '';
    message += `업다운 랜덤 디펜스는 ... (설명 추가 TODO)\n`;
    message += `\`/register [백준 아이디]\`를 통해 등록할 수 있습니다.`;
    message += `\`/profile\`을 통해 프로필을 확인할 수 있습니다.`;
    message += `\`/updown-random-defense\`를 통해 업다운 랜덤 디펜스를 시작할 수 있습니다.`;
    message += `\`/updown-random-defense [옵션]\`을 통해 옵션을 설정할 수 있습니다.`;

    await interaction.editReply({ content: message });
}