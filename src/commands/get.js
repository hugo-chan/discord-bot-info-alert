async function get(client, msg, args) {
    const { subscriptions } = require("../../config.json");
    const { db_wrapper, get_info } = require("../db.js");
    const { generate_embed } = require("../util.js");
    const { get_by_match, find_key } = require("../db.js");
    const user_id = String(msg.author.id);
    let subs = [];
    if (args.length == 0) {
        // get info for all current subscriptions
        subs = user_id in subscriptions ? subscriptions[user_id] : [];
    } else {
        // map each argument to a promise to add to subs if valid
        // then fulfill each promise using await Promise all
        const promises = (args.map((_sub) => {
            if (_sub.split(":")[1] == "*") {
                // subscription is wildcard, get all subs under wildcard
                return db_wrapper(get_by_match, _sub.split(":")[0]).then(ls => {
                    // add sub to array if not included already
                    ls.map((l) => {
                        if (!subs.includes(l)) {
                            subs.push(l);
                        }
                    });
                });
            } else {
                // subscription is not a wildcard
                return db_wrapper(find_key, _sub).then(in_db => {
                    if (in_db && !subs.includes(_sub)) {
                        subs.push(_sub);
                    }
                });
            }
        }));
        await Promise.all(promises);
    }
    db_wrapper(get_info, subs).then((res) => {
        // create embed from info and send to channel
        const send_msg = generate_embed(res, "now");
        msg.channel.send(send_msg);
    });
}

module.exports = {
    name: "get",
    description: "gets info for your subscriptions now",
    execute: get,
};