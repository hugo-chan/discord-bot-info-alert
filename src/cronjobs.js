const cron = require("cron");
const { channel_id, img_link } = require("../config.json");
const Discord = require('discord.js');

function daily_print(client) {
    const { db_wrapper, get_info } = require("./db.js");
    const { subscriptions, send_time } = require("../config.json");
    const { hour, minute, second } = send_time;

    function generate_embed(dict) {
        const embed = new Discord.MessageEmbed()
            .setColor("#ff99ff")
            .setTitle("Daily Info test")
            .setImage(`${img_link}`)
            .setTimestamp();

        dict = JSON.parse(dict);
        let description = `It's ${hour}:${minute}:${second}, here is your daily info:`;
        if (Object.keys(dict).length === 0) {
            description += "\nYou have no subscriptions.";
        } else {
            for (const key in dict) {
                embed.addFields(
                    { name: String(key), value: String(dict[key]), inline: true },
                    );
                }
            }
        embed.setDescription(description)
            .setFooter("Have a good day!");
        return embed;
    }

    return (
        // create cron job that sends output of get_info every specified time of the day
        new cron.CronJob(`${second} ${minute} ${hour} * * *`, () => {
        // new cron.CronJob(`* * * * * *`, () => {
            db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
            .then((res) => {
                const msg = generate_embed(res);
                client.channels.cache.get(channel_id).send(msg);
            });
        })
    );
}

module.exports = {
    daily_print,
};