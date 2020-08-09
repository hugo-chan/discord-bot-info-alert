const fs = require('fs');
const { token, prefix } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();
console.log(client.commands);


const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log("file" + file);
    console.log("name" + command.name);
    client.commands.set(command.name, command);
}

client.once("ready", () => {
    console.log("Bot starting...");
});

client.on("message", async msg => {
    if (msg.author.bot) return;
    console.log(msg.content);
    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        client.commands.get(cmd).execute(msg, args);
    }
});


client.login(token);