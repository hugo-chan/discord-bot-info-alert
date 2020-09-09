const { MongoClient } = require("mongodb");
const { mongo_user, mongo_pw, mongo_uri } = require("../config.json");

async function db_wrapper(func, ...args) {
    /**
     * A wrapper function for all operations involving MongoDB
     * Connects to DB and gets relevant collection
     */
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

function complex_fetch(params) {
    /**
     * Responsible for more complicated info retrievals (e.g. involves calculations)
     * Name of custom functions used to get and calc data is stored in db under
     * extract and needs to be defined and exported in util_specific.js
     * Returns proceessed data to be displayed
     */
    const utils = require("./util_specific.js");
    return utils[params.extract](params.urls);
}

async function get_info(collection, args) {
    /**
     * Fetches info for subscription list and returns info
     */
    const fetch = require("node-fetch");
    const res_info = [];
    // extract from [] due to ...rest in db_wrapper
    const subs = args[0];
    // fetch info from sources synchronously using map, generate promises
    const promises = subs.map(async (_sub) => {
        const query = { key: _sub };
        const options = {
            projection: { _id: 0, urls: 1, simple: 1, extract: 1 },
        };
        // wait for MongoDB to obtain the document result
        const res = await collection.findOne(query, options);
        // fetch and process data using specified method
        if (res.simple) {
            return fetch(res.urls).then((data) => data.json())
            .then((data) => res_info.push({ [_sub]: data[0][res.extract] }));
        }
        return complex_fetch(res).then((data) => res_info.push({ [_sub]: data }));
    });
    // push all fetched data to res_info dict
    await Promise.all(promises);
    // sort alphabetically by key of dict
    res_info.sort((dict1, dict2) => {
        if (
            Object.keys(dict1)[0].toLowerCase() < Object.keys(dict2)[0].toLowerCase()
        ) return -1;
        return 1;
    });
    return res_info;
}

async function find_key(collection, args) {
    /**
     * Checks if a key is in the database
     */
    const res = await collection.findOne({ key: args[0] });
    return (res === null) ? false : true;
}

async function get_valid_subs(collection) {
    /**
     * Gets all valid subscriptions from the MongoDB by extracting keys
     */
    const valid_subs = [];
    await collection.find({ key: { $exists: true } })
        .toArray(function(err, docs) {
            if (err) {
                console.error(err);
            }
        // add key to valid_subs array
        for (const doc of docs) {
            const key = doc.key;
            valid_subs.push(key);
        }
    });
    return valid_subs;
}

async function get_by_match(collection, args) {
    /**
     * Gets all subscriptions for given key
     */
    const name = args[0];
    const valid_subs = [];
    await collection.find({ key: { $regex: `${name}.*` } })
        .toArray(function(err, docs) {
            if (err) {
                console.error(err);
            }
        // add key to valid_subs array
        for (const doc of docs) {
            const key = doc.key;
            valid_subs.push(key);
        }
    });
    return valid_subs;
}

// module's exports
module.exports = {
    db_wrapper,
    find_key,
    get_info,
    get_valid_subs,
    get_by_match,
};