const cron = require("cron");

const { generate_embed } = require("./util.js");
const { db_wrapper, get_info } = require("./db.js");
const { subscriptions, channel_id_public, channel_id_private, send_time, sudo_user } = require("../config.json");

function daily_print(client) {
    /**
     * Cron job that gets data for subscription list and sends to channel
     * every specified time of the day
     */
    const { hour, minute, second } = send_time;

    return (
        // create cron job that sends output of get_info every specified time of the day
        new cron.CronJob(`${second} ${minute} ${hour} * * *`, () => {
        // new cron.CronJob(`* * * * * *`, () => {
            const sudo_subs = subscriptions[sudo_user];
            db_wrapper(get_info, sudo_subs).then((res) => {
                const msg = generate_embed(res, "daily");
                client.channels.cache.get(channel_id_public).send(msg);
            });
        })
    );
}

function alert_print(client) {
    /**
     * Cron job that gets subscriptions every 30 seconds and prints
     * if value is greater than threshold
     */
    const { alerts } = require("../config.json");
    return (
        new cron.CronJob(`${30} * * * * *`, () => {
        // new cron.CronJob(`* * * * * *`, () => {
            db_wrapper(get_info, Object.keys(alerts)).then((res) => {
                const above_threshold = res.filter((d) => {
                    const key = Object.keys(d);
                    const sign = alerts[key].slice(0, 1);
                    const threshold = alerts[key].slice(1);
                    let data = d[key];
                    if (typeof d[key] != "number") {
                        // percentage
                        data = parseFloat(d[key].slice(0, -1));
                    }
                    return (
                        sign == ">" ? data >= threshold : data <= threshold
                    );
                });
                if (above_threshold.length > 0) {
                    const msg = generate_embed(above_threshold, "alert");
                    client.channels.cache.get(channel_id_private).send(msg);
                }
            });
        })
    );
}

module.exports = {
    daily_print,
    alert_print,
};