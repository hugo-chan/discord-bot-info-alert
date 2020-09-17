const { update_config, parse } = require("../util.js");
const cronjobs = require("../cronjobs.js");

const restart_job = (client) => {
    client.alert_job.stop();
    client.alert_job = cronjobs.alert_print(client);
    client.alert_job.start();
};

async function alert(client, msg, args) {
    const { alerts, sudo_user } = require("../../config.json");
    if (msg.author.id != Number(sudo_user)) {
        return msg.channel.send("Sneaky.");
    }
    if (args.length < 1) {
        return msg.channel.send("Command requires at least one argument.");
    }
    const { db_wrapper, find_key } = require("../db.js");
    if (args.length == 1 && args[0] == "LIST") {
        let a = "<None>";
        if (Object.keys(alerts).length > 0) {
            a = parse(Object.keys(alerts));
        }
        return msg.channel.send("Current alerts are " + a + ".");
    }
    if (args.length == 1 && args[0] == "CLEAR") {
        await update_config("alerts", {}, false);
        restart_job(client);
        return msg.channel.send("Alerts cleared.");
    }
    if (args[0] == "REMOVE") {
        if (Object.keys(alerts).includes(args[1])) {
            delete alerts[args[1]];
            await update_config("alerts", alerts, false);
            restart_job(client);
            return msg.channel.send(args[1] + " removed as an alert.");
        } else {
            return msg.channel.send(args[1] + " is not an active alert right now.");
        }
    }
    const key = args[0];
    const threshold = args[1];
    db_wrapper(find_key, key).then(async in_db => {
        if (in_db) {
            if (threshold.slice(0, 1) != ">" && threshold.slice(0, 1) != "<") {
                console.log(threshold);
                console.log(threshold.slice(0, 1));
                return msg.channel.send("Threshold has to start with > or <.");
            }
            alerts[key] = threshold;
            await update_config("alerts", alerts, false);
            restart_job(client);
            msg.channel.send(key + " added as an alert with threshold " + threshold + ".");
        } else {
            msg.channel.send("Alert key " + key + " is not valid.");
        }
    });
}

module.exports = {
    name: "alert",
    description: "set users' alerts",
    execute: alert,
};