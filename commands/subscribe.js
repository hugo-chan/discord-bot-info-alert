const config = require("../config.json");
let { subscriptions } = require("../config.json");
const fs = require('fs');
const { find_key, get_info, db_wrapper } = require("../db.js");

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

async function execute(msg, args) {
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
            await db_wrapper(find_key, args[i]).then(in_db => {
                // if subscription is in db
                if (in_db) {
                    if (subscriptions.includes(args[i])) {
                        already.push(args[i]);
                    } else {
                        success.push(args[i]);
                    }
                } else {
                    failure.push(args[i]);
                }
            });
        }
        subscriptions.push(...success);
        update_subscriptions(subscriptions);
        return msg.channel.send(subscription_msg(success, failure, already));
        // msg.channel.send(subscription_msg(success, failure, already));
        // await db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
        //     .then((res) => {
        //         if (res != "") msg.channel.send(res);
        //     });
    }
}

// module's exports
module.exports = {
    name: "subscribe",
    description: "Subscribe",
    // value is function to be executed
    execute: ((msg, args) => execute(msg, args)),
};