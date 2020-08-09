const fs = require('fs');
const config = require("./config.json");
const { token, prefix } = require("./config.json");
let { subscriptions } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

function subscription_msg(success, failure, already, clear) {
    // generates subscription message to be sent
    function parse(messages) {
        let res = "";
        for (let i = 0; i < messages.length; i++) {
            if (i != messages.length - 1) {
                res += messages[i] + ", ";
            } else {
                res += messages[i];
            }
        }
        return res;
    }
    if (clear) {
        return "Subscriptions cleared.";
    }
    let msg = "";
    if (success.length != 0) {
        msg += "Subscribed to " + parse(success) + ". ";
    }
    if (already.length != 0) {
        msg += "Already subscribed to " + parse(already) + ". ";
    }
    if (failure.length != 0) {
        if (failure.length === 1) {
            msg += failure[0] + " is not a valid subscription.";
        } else {
            msg += parse(failure) + " are not valid subscriptions.";
        }
    }
    return msg;
}

function update_subscriptions(subs) {
    // updates subscription list in config file
    config.subscriptions = subs;
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    });
}

client.once("ready", () => {
    console.log("Bot starting...");
});

client.on("message", msg => {
    if (msg.author.bot) return;
    console.log(msg.content);

    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        if (cmd === "subscribe") {
            const success = [];
            const failure = [];
            const already = [];
            let clear = false;
            for (let i = 0; i < args.length; i++) {
                // check whether subscription is in fixed database
                if (args[i] === "CLEAR") {
                    clear = true;
                    break;
                }
                if (args[i]) {
                    if (subscriptions.includes(args[i])) {
                        already.push(args[i]);
                    } else {
                        success.push(args[i]);
                    }
                } else {
                    failure.push(args[i]);
                }
            }
            if (clear) {
                subscriptions = [];
            } else {
                subscriptions.push(...success);
            }
            update_subscriptions(subscriptions);
            msg.channel.send(subscription_msg(success, failure, already, clear));
        }
    }
});

client.login(token);