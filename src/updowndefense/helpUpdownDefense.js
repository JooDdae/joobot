module.exports = async (interaction) => {
    let message = '';
    message += `업다운 랜덤 디펜스는 일정 티어를 시작으로, 문제를 제한 시간 내에 풀면 티어를 높이고, 못 풀면 티어를 낮추는 컨텐츠입니다.\n`;
    message += `\`/register [백준 아이디]\`를 통해 등록할 수 있습니다.\n`;
    message += `\`/profile\`을 통해 프로필을 확인할 수 있습니다.\n`;
    message += `\`/updown-random-defense\`를 통해 업다운 랜덤 디펜스를 시작할 수 있습니다.\n`;
    message += `\`/updown-random-defense [옵션]\`을 통해 \`시작 티어\`혹은 \`추가 쿼리\`을 설정할 수 있습니다.\n`;

    await interaction.editReply({ content: message });
}