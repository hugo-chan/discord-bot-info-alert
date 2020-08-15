function parse(messages) {
    let res = "";
    for (let i = 0; i < messages.length; i++) {
        if (i != messages.length - 1) {
            res += messages[i] + ", ";
        } else {
            res += messages[i];
        }
    }
    return res;
}

function generate_embed(dict, type) {
    const Discord = require('discord.js');
    const { img_link, send_time } = require("../config.json");
    const { hour, minute, second } = send_time;

    let title, description = "";

    // produce different embeds for different circumstances
    if (type === "daily") {
        title = "Daily Info";
        description = `It's ${hour}:${minute}:${second}, here is your daily info:`;
    } else if (type == "now") {
        title = "Immediate Info";
        description = "Here is your immediate info:";
    }

    const embed = new Discord.MessageEmbed()
        .setColor("#ff99ff")
        .setTitle(title)
        .setImage(`${img_link}`)
        .setTimestamp()
        .setFooter("Have a good day!");

    // add info to embed
    dict = JSON.parse(dict);
    if (Object.keys(dict).length === 0) {
        description += "\nYou have no subscriptions.";
    } else {
        for (const key in dict) {
            embed.addFields(
                { name: String(key), value: String(dict[key]), inline: true },
                );
            }
        }

    embed.setDescription(description);

    return embed;
}

module.exports = {
    parse,
    generate_embed,
};