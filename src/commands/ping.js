module.exports = {
    name: "ping",
    description: "pings the bot",
    execute: (client, msg) => msg.channel.send("Pong."),
};