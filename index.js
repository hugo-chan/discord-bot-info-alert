const fs = require('fs');
const config = require("./config.json");
const { token, prefix } = require("./config.json");
let { subscriptions } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
// import { find_key } from "./connectdb.js";

// -------------------------------------
// in separate json
const { MongoClient } = require("mongodb");
const { mongo_user, mongo_pw, mongo_uri } = require("./config.json");


async function find_key(key) {
    const uri = `mongodb+srv://${mongo_user}:${mongo_pw}@${mongo_uri}/test?retryWrites=true&w=majority`;

    const mclient = new MongoClient(uri, {
        useUnifiedTopology: true,
    });
    try {
        await mclient.connect();
        const collection = await mclient.db("discord-bot").collection("subscriptions");

        const res = await collection.findOne({ key: key });
        // console.log(res);
        return (res == null) ? false : true;
    } catch (e) {
        console.error(e);
    } finally {
        await mclient.close();
    }
}
// -------------------------------------

function subscription_msg(success, failure, already) {
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
    return (msg ? msg : "<None>");
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

client.on("message", async msg => {
    if (msg.author.bot) return;
    console.log(msg.content);
    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        if (cmd === "subscribe") {
            // list subscriptions
            if (args.includes("LIST")) {
                if (args.length != 1) {
                    return msg.channel.send("Please enter only one argument with LIST");
                }
                return msg.channel.send(subscription_msg(subscriptions, [], []));
            }
            // clear subscriptions
            if (args.includes("CLEAR")) {
                if (args.length != 1) {
                    return msg.channel.send("Please enter only one argument with CLEAR");
                }
                subscriptions = [];
                update_subscriptions(subscriptions);
                return msg.channel.send("Subscriptions cleared.");
            // add to subscriptions
            } else {
                const success = [];
                const failure = [];
                const already = [];
                for (let i = 0; i < args.length; i++) {
                    await find_key(args[i]).then(function(is_bool) {
                        if (is_bool) {
                            console.log("yes");
                            if (subscriptions.includes(args[i])) {
                                already.push(args[i]);
                            } else {
                                success.push(args[i]);
                            }
                        } else {
                            console.log("no");
                            failure.push(args[i]);
                        }
                    });
                }
                console.log(success);
                console.log(failure);
                subscriptions.push(...success);
                update_subscriptions(subscriptions);
                return msg.channel.send(subscription_msg(success, failure, already));
            }
        }
    }
});

client.login(token);