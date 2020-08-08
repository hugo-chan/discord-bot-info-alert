const { token, prefix } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

const subscribes = [];

function subscription_msg(success, failure) {
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
    let msg = "";
    if (success != 0) {
        msg += "Subscribed to " + parse(success) + ". ";
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

client.once("ready", () => {
    console.log("Ready!");
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
            for (let i = 0; i < args.length; i++) {
                // check whether subscription is in fixed database
                if (args[i]) {
                    success.push(args[i]);
                } else {
                    failure.push(args[i]);
                }
            }
            msg.channel.send(subscription_msg(success, failure));
            console.log("subscribes" + subscribes);
        }
    }
});

client.login(token);