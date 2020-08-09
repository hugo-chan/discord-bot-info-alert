const { MongoClient } = require("mongodb");
const { mongo_user, mongo_pw, mongo_uri } = require("./config.json");

async function find_key(key) {
    const uri = `mongodb+srv://${mongo_user}:${mongo_pw}@${mongo_uri}/test?retryWrites=true&w=majority`;

    const client = new MongoClient(uri, {
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const collection = await client.db("discord-bot").collection("subscriptions");

        const res = await collection.findOne({key: key });
        console.log(res);
        return (res == null? false : true);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

export {find_key};
