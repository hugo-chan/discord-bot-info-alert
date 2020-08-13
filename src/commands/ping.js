function pong(msg, args) {
    msg.channel.send("Pong.");
    return args;
}

module.exports = {
    name: "ping",
    execute: (client, msg, args) => pong(msg, args),
};