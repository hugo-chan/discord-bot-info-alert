const cron = require("cron");

const { generate_embed } = require("./util.js");

function daily_print(client) {
    /**
     * Cron job that gets data for subscription list and sends to channel
     * every specified time of the day
     */
    const { db_wrapper, get_info } = require("./db.js");
    const { subscriptions, channel_id, send_time } = require("../config.json");
    const { hour, minute, second } = send_time;

    return (
        // create cron job that sends output of get_info every specified time of the day
        new cron.CronJob(`${second} ${minute} ${hour} * * *`, () => {
        // new cron.CronJob(`* * * * * *`, () => {
            db_wrapper(get_info, subscriptions).then((res) => {
                const msg = generate_embed(res, "daily");
                client.channels.cache.get(channel_id).send(msg);
            });
        })
    );
}

module.exports = {
    daily_print,
};