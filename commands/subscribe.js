const config = require("../config.json");
let { subscriptions } = require("../config.json");
const fs = require('fs');

// -------------------------------------
// in separate js
const { MongoClient } = require("mongodb");
const { mongo_user, mongo_pw, mongo_uri } = require("../config.json");
const fetch = require("node-fetch");


async function find_key(key) {
    const uri = `mongodb+srv://${mongo_user}:${mongo_pw}@${mongo_uri}/test?retryWrites=true&w=majority`;

    const mclient = new MongoClient(uri, {
        useUnifiedTopology: true,
    });
    try {
        await mclient.connect();
        const collection = await mclient.db("discord-bot").collection("subscriptions");

        const res = await collection.findOne({ key: key });
        return (res == null) ? false : true;
    } catch (e) {
        console.error(e);
    } finally {
        await mclient.close();
    }
}

async function get_info(subs) {
    const uri = `mongodb+srv://${mongo_user}:${mongo_pw}@${mongo_uri}/test?retryWrites=true&w=majority`;
    const mclient = new MongoClient(uri, {
        useUnifiedTopology: true,
    });
    try {
        await mclient.connect();
        const collection = await mclient.db("discord-bot").collection("subscriptions");

        const res_info = {};

        for (const sub of subs) {
            console.log(sub);
            const query = { key: sub };
            const options = {
                projection: { _id: 0, url: 1, extract: 1 },
            };
            const res = await collection.findOne(query, options);
            const url = res.url;
            const extract = res.extract;
            console.log(extract);
            await fetch(url).then((data) => data.json())
                // .then((data) => res_info.push({ sub: data[0][extract] }));
                .then((data) => res_info[sub] = data[0][extract]);
        }
        console.log(res_info);
        return res_info;

    } catch (e) {
        console.error(e);
    } finally {
        await mclient.close();
    }
}

// get_info(["bitmex:XBTUSD", "bitmex:ETHUSD"]);
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
            await find_key(args[i]).then(in_db => {
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
        // return msg.channel.send(subscription_msg(success, failure, already));
        msg.channel.send(subscription_msg(success, failure, already));
        await get_info(subscriptions).then((res) => JSON.stringify(res))
            .then((res) => {
                if (res != "") msg.channel.send(res);
            });
    }
}

module.exports = {
    name: "subscribe",
    description: "Subscribe",
    execute: ((msg, args) => execute(msg, args)),
};