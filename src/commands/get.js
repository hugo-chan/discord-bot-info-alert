function get(client) {
    const { subscriptions, channel_id } = require("../../config.json");
    const { db_wrapper, get_info } = require("../db.js");
    const { generate_embed } = require("../util.js");

    db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
        .then((res) => {
            const msg = generate_embed(res, "now");
            client.channels.cache.get(channel_id).send(msg);
        });
}

module.exports = {
    name: "get",
    description: "gets info for your subscriptions now",
    execute: (client) => get(client),
};