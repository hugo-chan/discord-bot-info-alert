const { exit } = require("process");

function exits(client, msg) {
    if (msg.author.id == 294984430311702532) {
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
    execute: (client, msg, args) => exits(client, msg),
};