function parse(messages) {
    /**
     * Parses an array-like object, adding a comma except for the last item
     */
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

function replace_str_excp_last(message, old, nw, remove) {
    /**
     * Returns string with all except the last instance of old replaced
     * with new. remove argument indicates whether the last instance of
     * old should be removed from the string
     */
    const index = message.lastIndexOf(old);
    const first = message.substring(0, index);
    const regex = new RegExp(old, "g");
    const rest = (remove) ?
        message.substring(index + old.length) : message.substring(index);
    const ret = first.replace(regex, nw) + rest;
    return ret;
}

function generate_embed(arr, type) {
    /**
     * Generates and returns a Discord embed message to be sent
     * Used for daily info and /get (hence the type argument)
     */
    const Discord = require('discord.js');
    const { img_links, send_time } = require("../config.json");
    const { hour, minute, second } = send_time;

    // produce different embeds for different circumstances
    let title, description, color = "";
    if (type === "daily") {
        title = "Daily Info";
        description = `It's ${hour}:${minute}:${second}, here is your daily info:`;
        color = "#ff99ff";
    } else if (type == "now") {
        title = "Immediate Info";
        description = "Here is your immediate info:";
        color = "#f0c800";
    } else if (type == "alert") {
        title = "Alert";
        description = "Values of interest:";
        color = "#f00000";
    }

    // initialize embed parameters
    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setTimestamp()
        .setFooter("Have a good day!");

    // add info to embed
    if (arr.length === 0) {
        description += "\nYou have no subscriptions.";
    } else {
        let label = "";
        let count = 0;

        // helper fn to fill line of embed with empty fields
        const fill_embed = (_embed, _count) => {
            const fill = 3 - (_count % 3);
            for (let i = 0; i < fill; i++) {
                _embed.addField('\u200b', '\u200b', true);
                _count++;
            }
            return _count;
        };
        for (let i = 0; i < arr.length; i++) {
            const dict = arr[i];
            const key = Object.keys(dict)[0];
            const label_new = key.split(":")[0];
            if (label_new != label && label != "") {
                // label different from the last one, fill to EOL
                count = fill_embed(embed, count);
            }
            embed.addField(String(key), String(dict[key]), true);
            label = label_new;
            count++;
        }
        fill_embed(embed, count);
    }

    embed.setDescription(description);
    if (img_links) {
        const random_index = Math.floor(Math.random() * img_links.length);
        embed.setImage(`${img_links[random_index]}`);
    }

    return embed;
}

function update_config(section, content, user_id_required, user_id) {
    /**
     * Updates specified section in config file
     */
    const config = require("../config.json");
    const fs = require("fs");
    const path = require("path");

    if (user_id_required) {
        config[section][user_id] = content;
    } else {
        config[section] = content;
    }
    const cfg_path = path.join(__dirname, "../config.json");
    fs.writeFile(cfg_path, JSON.stringify(config, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    });
    return Promise.resolve(true);
}

module.exports = {
    parse,
    generate_embed,
    replace_str_excp_last,
    update_config,
};