const fs = require('fs');
const { token, prefix } = require("../config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const cronjobs = require("./cronjobs.js");

// create propety to store commands
client.commands = new Discord.Collection();

// load possible commands into client
const commandFiles = fs.readdirSync(__dirname + "/commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// upon start
client.once("ready", () => {
    console.log("Bot starting...");
    // trigger jobs upon start
    console.log("Starting daily print job.");
    client.daily_print = cronjobs.daily_print(client);
    client.daily_print.start();
    console.log("Starting alert print job.");
    client.alert_job = cronjobs.alert_print(client);
    client.alert_job.start();
});

// upon receiving a message
client.on("message", async msg => {
    if (msg.author.bot) return;
    console.log(msg.content);

    // if (msg.content == "") {
    //     msg.channel.send("");
    //     return;
    // }

    if (msg.content.startsWith(prefix)) {
        // extract command and arguments of message
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        // execute command using loaded command stored in client
        try {
            client.commands.get(cmd).execute(client, msg, args);
        } catch (e) {
            msg.channel.send("Unknown command. Use /help to view valid commands.");
        }
    }
});

client.login(token);
