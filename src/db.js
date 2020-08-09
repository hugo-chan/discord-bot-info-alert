const { MongoClient } = require("mongodb");
const { mongo_user, mongo_pw, mongo_uri } = require("../config.json");
const fetch = require("node-fetch");

async function db_wrapper(func, ...args) {
    // wrapper function for all operations involving mongo db
    const uri = `mongodb+srv://${mongo_user}:${mongo_pw}@${mongo_uri}/test?retryWrites=true&w=majority`;
    const mclient = new MongoClient(uri, {
        useUnifiedTopology: true,
    });
    try {
        await mclient.connect();
        const collection = await mclient.db("discord-bot").collection("subscriptions");
        return await func(collection, args);

    } catch (e) {
        console.error(e);
    } finally {
        await mclient.close();
    }
}

async function get_info(collection, args) {
    // parses through subscription list, fetches and returns info
    const res_info = {};
    const subs = args[0];
    console.log("key ", subs);
    for (const sub of subs) {
        const query = { key: sub };
        const options = {
            projection: { _id: 0, url: 1, extract: 1 },
        };
        const res = await collection.findOne(query, options);
        const url = res.url;
        const extract = res.extract;
        await fetch(url).then((data) => data.json())
            .then((data) => res_info[sub] = data[0][extract]);
    }
    return res_info;
}

async function find_key(collection, args) {
    // checks if key is in db
    const res = await collection.findOne({ key: args[0] });
    return (res === null) ? false : true;
}

// module's exports
module.exports = {
    find_key,
    get_info,
    db_wrapper,
};