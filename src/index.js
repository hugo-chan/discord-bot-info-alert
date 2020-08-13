const fs = require('fs');
const { token, prefix } = require("../config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const cronjobs = require("./cronjobs.js");

// create propety to store commands
client.commands = new Discord.Collection();

// load possible commands into client
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", () => {
    console.log("Bot starting...");
    // trigger job upon start
    cronjobs.daily_print(client).start();
});

client.on("message", async msg => {
    if (msg.author.bot) return;
    console.log(msg.content);

    // if (msg.content == "") {
    //     msg.channel.send("");
    //     return;

    if (msg.content.startsWith(prefix)) {
        // extract command and arguments of message
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        // execute command using loaded command stored in client
        try {
            client.commands.get(cmd).execute(client, msg, args);
        } catch (e) {
            msg.channel.send("Unknown command.");
        }
    }
});


client.login(token);
