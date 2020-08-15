function get(msg) {
    const { subscriptions } = require("../../config.json");
    const { db_wrapper, get_info } = require("../db.js");
    const { generate_embed } = require("../util.js");

    db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
        .then((res) => {
            const send_msg = generate_embed(res, "now");
            msg.channel.send(send_msg);
        });
}

module.exports = {
    name: "get",
    description: "gets info for your subscriptions now",
    execute: (client, msg) => get(msg),
};