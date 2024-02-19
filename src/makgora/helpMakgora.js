module.exports = async (interaction) => {
    let message = '';
    message += `막고라는 두 사람이 주어진 한 문제를 빨리 푸는 사람이 이기는 컨텐츠입니다.\n`;
    message += `\`/register [백준 아이디]\`를 통해 등록할 수 있습니다.\n`;
    message += `\`/profile\`을 통해 프로필을 확인할 수 있습니다.\n`;
    message += `\`/leaderboard\`를 통해 리더보드를 확인할 수 있습니다.\n`;
    message += `\`/makgora [대상]\`을 통해 막고라를 신청할 수 있습니다.\n`;

    await interaction.editReply({ content: message });
}