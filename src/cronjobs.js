const cron = require("cron");
const { channel_id } = require("../config.json");

function daily_print(client) {
    const { db_wrapper, get_info } = require("./db.js");
    const { subscriptions, send_time } = require("../config.json");
    const { hour, minute, second } = send_time;

    return (
        // create cron job that sends output of get_info every specified time of the day
        new cron.CronJob(`${second} ${minute} ${hour} * * *`, () => {
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