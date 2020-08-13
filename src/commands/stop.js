const { exit } = require("process");

function exits(client, msg) {
    msg.channel.send("Alerty exits.");
    setTimeout(() => {
        client.destroy();
        exit(0);
    }, 1000);
}

module.exports = {
    name: "stop",
    execute: (client, msg, args) => exits(client, msg),
};