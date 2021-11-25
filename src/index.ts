import { ShardingManager } from "discord.js"

import { init } from "@/command"

init()

const manager = new ShardingManager("./src/bot.ts", {
  token: process.env.discordToken,
  execArgv: ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
})

manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`))
manager.spawn()
