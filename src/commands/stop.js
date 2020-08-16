const { exit } = require("process");

function exits(client, msg) {
    const { sudo_user } = require("../../config.json");
    // only sudo users can execute
    if (msg.author.id == sudo_user) {
        msg.channel.send("Alerty exits.");
        setTimeout(() => {
            client.destroy();
            exit(0);
        }, 1000);
    } else {
        msg.channel.send("Sneaky.");
    }
}

module.exports = {
    name: "stop",
    description: "stops the bot, sudo users only",
    execute: exits,
};