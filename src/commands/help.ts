const help = async (text, embed) => {
  embed.setTitle('도움말')
    .addField('하나야 급식, 내일 급식, 월요일 급식, 3일 뒤 급식', '급식 정보는 다양하게 확인할 수 있어')
    .addField('하나야 일정', '일정 정보를 확인할 수 있어')
    .addField('하나야 [학교명] 검색', '채널마다 학교를 등록할 수 있어')
    .addField('하나야 도움말', '도움말 확인이 가능해')
}

export default help
