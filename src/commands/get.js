function get(client, msg) {
    const { subscriptions } = require("../../config.json");
    const { db_wrapper, get_info } = require("../db.js");
    const { generate_embed } = require("../util.js");
    const user_id = String(msg.author.id);
    const user_subs = user_id in subscriptions ? subscriptions[user_id] : [];
    db_wrapper(get_info, user_subs).then((res) => {
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