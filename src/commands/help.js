const { replace_str_excp_last } = require("../util.js");

function help(client, msg) {
    let retMsg = "Below is the list of valid commands:\n";
    for (const [cmdName, cmd] of client.commands) {
        retMsg += "    " + cmdName + ": " + cmd.description + "!";
    }
    retMsg = replace_str_excp_last(retMsg, "!", "\n", true);
    msg.channel.send(retMsg);
}

module.exports = {
    name: "help",
    description: "lists valid commands",
    execute: help,
};