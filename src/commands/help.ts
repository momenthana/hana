const help = async (text, embed, messages) => {
  if (text.match(/(도움|도와|help)/)) {
    embed.setTitle('하나')
      .setDescription(messages.help)
  }
}

export default help
