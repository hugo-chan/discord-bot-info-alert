const config = require("../../config.json");
const fs = require("fs");
const { db_wrapper, find_key, get_valid_subs } = require("../db.js");
const { parse } = require("../util.js");

function subscription_msg(success, failure, already) {
    /**
     * Generates response when user subscribes to new sources
     */
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
    /**
     * Updates subscription list in config file
     */
    config.subscriptions = subs;
    fs.writeFile("../config.json", JSON.stringify(config, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    });
}

async function subscribe(client, msg, args) {
    let { subscriptions } = require("../../config.json");

    if (args.length === 0) {
        return msg.channel.send("Command missing argument.");
    }

    // helper function for commands that only require one argument
    const check_one_param = (a, keyword) => {
        if (a.length != 1) {
            return msg.channel.send(`Please enter only one argument with ${keyword}`);
        }
    };

    if (args.includes("LIST")) {
        check_one_param(args, "LIST");
        return msg.channel.send(subscription_msg(subscriptions, [], []));
    }
    // clear subscriptions
    if (args.includes("CLEAR")) {
        check_one_param(args, "CLEAR");
        subscriptions = [];
        update_subscriptions(subscriptions);
        return msg.channel.send("Subscriptions cleared.");
    }
    if (args.includes("VALID")) {
        check_one_param(args, "VALID");
        db_wrapper(get_valid_subs, "").then((list) => {
            return msg.channel.send("Valid subscriptions: " + parse(list)) + ". ";
        });
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
    }
}

// module's exports
module.exports = {
    name: "sub",
    description: "commands related to your subscription list (LIST, CLEAR, VALID, <name(s)>)",
    execute: subscribe,
};