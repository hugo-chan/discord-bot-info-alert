function execute(client, msg) {
    let retMsg = "Below is the list of valid commands:\n";
    let i = 0;
    for (const [cmdName, cmd] of client.commands) {
        if (i++ != 0) retMsg += "\n";
        console.log("    cmdName", cmdName, "cmd", cmd);
        retMsg += "    " + cmdName + ": " + cmd.description;
    }
    msg.channel.send(retMsg);
}

module.exports = {
    name: "help",
    description: "lists valid commands",
    execute: execute,
};