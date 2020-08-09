const cron = require("cron");
const { channel_id } = require("../config.json");
const Discord = require('discord.js');

function daily_print(client) {
    const { db_wrapper, get_info } = require("./db.js");
    const { subscriptions, send_time } = require("../config.json");
    const { hour, minute, second } = send_time;

    function generate_embed(dict) {
        const embed = new Discord.MessageEmbed()
            .setColor("#ff99ff")
            .setTitle("Daily Info");

        dict = JSON.parse(dict);
        let description = `It's ${hour}:${minute}:${second}, here is your daily info:`;
        if (Object.keys(dict).length === 0) {
            description += "\nYou have no subscriptions.";
        } else {
            for (const key in dict) {
                console.log(key, dict[key]);
                embed.addFields(
                    { name: String(key), value: String(dict[key]), inline: true },
                    );
                }
            }
        embed.setDescription(description);
        return embed;
    }

    return (
        // create cron job that sends output of get_info every specified time of the day
        new cron.CronJob(`${second} ${minute} ${hour} * * *`, () => {
            db_wrapper(get_info, subscriptions).then((res) => JSON.stringify(res))
            .then((res) => {
                console.log("res", res);
                if (res != "") {
                    const msg = generate_embed(res);
                    client.channels.cache.get(channel_id).send(msg);
                }
            });
        })
    );
}

module.exports = {
    daily_print,
};