function get(client, msg) {
    const { subscriptions } = require("../../config.json");
    const { db_wrapper, get_info } = require("../db.js");
    const { generate_embed } = require("../util.js");

    db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
        .then((res) => {
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