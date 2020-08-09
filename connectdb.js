const { MongoClient } = require("mongodb");
const { mongo_user, mongo_pw, mongo_uri } = require("./config.json");

(async function main() {
    const uri = `mongodb+srv://${mongo_user}:${mongo_pw}@${mongo_uri}/test?retryWrites=true&w=majority`;

    const client = new MongoClient(uri, {
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const collection = await client.db("discord-bot").collection("subscriptions");
        // console.log(collection);
        console.log(collection.find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
        }));

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
})();
