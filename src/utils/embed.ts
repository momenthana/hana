import discord from 'discord.js'

const embed = msg => {
	return new discord.MessageEmbed()
		.setFooter(msg.channel.type == 'dm' ? msg.author.name : msg.member.displayName, msg.author.avatarURL())
		.setTimestamp(new Date())
		.setColor(msg.channel.type == 'dm' ? null : msg.guild.me.displayColor)
}

export default embed
