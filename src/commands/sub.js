const config = require("../../config.json");
const fs = require("fs");
const path = require("path");
const { db_wrapper, find_key, get_valid_subs } = require("../db.js");
const { parse } = require("../util.js");

function subscription_msg(success, failure, already) {
    /**
     * Generates subscription response
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
    const cfg_path = path.join(__dirname, "../../config.json");
    fs.writeFile(cfg_path, JSON.stringify(config, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    });
}

async function subscribe(client, msg, args) {
    /**
     * Processes subscribe message
     * Args contain the arguments of /sub command
     */
    let { subscriptions } = require("../../config.json");

    if (args.length === 0) {
        return msg.channel.send("Command missing argument.");
    }

    // helper function for commands that only require one argument
    const check_one_param = (a, keyword) => {
        if (a.length != 1) return msg.channel.send(`Please enter only one argument with ${keyword}`);
    };

    // list current subscriptions
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
    // list valid subscriptions
    if (args.includes("VALID")) {
        check_one_param(args, "VALID");
        await db_wrapper(get_valid_subs, "").then((list) => {
            msg.channel.send("Valid subscriptions: " + parse(list)) + ". ";
        });
        return;
    }
    // initialize subscription lists
    const success = [];
    const failure = [];
    const already = [];
    // subscribe to all
    if (args.includes("ALL")) {
        subscriptions = [];
        update_subscriptions(subscriptions);
        await db_wrapper(get_valid_subs, "").then((list) => {
            success.push(...list);
        });
    // add to subscriptions
    } else {
        for (let i = 0; i < args.length; i++) {
            const key = args[i].replace(/[,.]/g, "");
            // skip repeated
            if (
                success.includes(key) || failure.includes(key) || already.includes(key)
            ) continue;

            await db_wrapper(find_key, key).then(in_db => {
                // if subscription is in db
                if (in_db) {
                    if (subscriptions.includes(key)) {
                        already.push(key);
                    } else {
                        success.push(key);
                    }
                } else {
                    failure.push(key);
                }
            });
        }
    }
    // execute subscribes
    subscriptions.push(...success);
    update_subscriptions(subscriptions);
    return msg.channel.send(subscription_msg(success, failure, already));
}

// module's exports
module.exports = {
    name: "sub",
    description: "commands related to your subscription list (LIST, CLEAR, VALID, ALL, <name(s)>)",
    execute: subscribe,
};