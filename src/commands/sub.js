const { db_wrapper, find_key, get_valid_subs } = require("../db.js");
const { parse, update_config } = require("../util.js");

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

async function subscribe(client, msg, args) {
    /**
     * Processes subscribe message
     * Args contain the arguments of /sub command
     */
    let { subscriptions } = require("../../config.json");
    const user_id = String(msg.author.id);
    subscriptions = user_id in subscriptions ? subscriptions[user_id] : [];

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
        await update_config("subscriptions", subscriptions, true, user_id).then(() => {
            msg.channel.send("Subscriptions cleared.");
        });
        return;
    }
    // list valid subscriptions
    if (args.includes("VALID")) {
        check_one_param(args, "VALID");
        await db_wrapper(get_valid_subs, "").then((list) => {
            msg.channel.send("Valid subscriptions: " + parse(list) + ". ");
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
        await update_config("subscriptions", subscriptions, true, user_id);
        await db_wrapper(get_valid_subs, "").then((list) => {
            success.push(...list);
        });
    // add to subscriptions
    } else {
        // remove punctuation and repeated subscriptions
        const subs = [...new Set(args.map((sub) => sub.replace(/[,.]/g, "")))];
        // synchronously process each subscription
        const promises = subs.map((_sub) => {
            if (_sub.split(":")[1] == "*") {
                // if subscription is wildcard (subscribe to all under a certain name)
                const { get_by_match } = require("../db.js");
                return db_wrapper(get_by_match, _sub.split(":")[0]).then(ls => {
                    if (ls.length == 0) failure.push(_sub);
                    ls.map(s => {
                        if (subscriptions.includes(s)) {
                            already.push(s);
                        } else {
                            success.push(s);
                        }
                    });
                });
            }
            // subscription is not a wildcard
            if (subscriptions.includes(_sub)) {
                already.push(_sub);
                return;
            } else {
                return db_wrapper(find_key, _sub).then(in_db => {
                    if (in_db) {
                        success.push(_sub);
                    } else {
                        failure.push(_sub);
                    }
                });
            }
        });
        await Promise.all(promises);
    }
    // execute subscribes
    subscriptions.push(...success);
    await update_config("subscriptions", subscriptions, true, user_id);
    return msg.channel.send(subscription_msg(success, failure, already));
}

// module's exports
module.exports = {
    name: "sub",
    description: "commands related to your subscription list (LIST, CLEAR, VALID, ALL, <name(s)>)",
    execute: subscribe,
};