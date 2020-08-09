const cron = require("cron");
const { channel_id } = require("./config.json");

function daily_print(client) {
    const { db_wrapper, get_info } = require("./db.js");
    const { subscriptions } = require("./config.json");
    return (
        new cron.CronJob("05 08 22 * * *", () => {
            db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
            .then((res) => {
                if (res != "") client.channels.cache.get(channel_id).send(res);
            });
        })
    );
}

module.exports = {
    daily_print,
};