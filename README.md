# discord-bot-info-alert

Discord bot to send informative alerts. Keeping track of users' list of subscriptions, this bot can fetch data from APIs periodically or on-demand. 

The information of supported subscriptions (e.g. name, url and endpoint of API, etc.) is stored in MongoDB while miscellaneous and private details (e.g. Discord channel ID and token, time to send info, active subscriptions, etc.) is stored locally in `config.json`—examples shown below.

## Getting Started

Set-up a MongoDB collection containing the subscriptions the bot will support. Documents in the MongoDB collection should follow a format as follows:

```
key: "bitmex:XBTUSD"
method: "GET"
url: "https://www.bitmex.com/api/v1/trade/bucketed?binSize=1d&partial=true&s..."
extract: "close"
last_val: -1
last_update: 6858631217693065217
```
Create `config.json` in the main directory, which will contain private/customoizable information needed and imported by the bot. An example is shown below.

```
{
  "token": "xxx",
  "prefix": "/",
  "mongo_user": "hugo",
  "mongo_pw": "xxx",
  "mongo_uri": "xxx.mongodb.net",
  "channel_id": "000",
  "subscriptions": [],
  "sudo_user": 000,
  "send_time": {
    "hour": "08",
    "minute": "00",
    "second": "00"
  }
}
```

### Prerequisites
* Node.js v12.0.0 or above
* MongoDB
* Discord server, account, bot (authorization token)

### Installing
> Clone this repo to your local machine

```
$ git clone https://github.com/hugo-chan/discord-bot-info-alert.git
```

> Install the project dependencies

```
$ cd .\discord-bot-info-alert\
$ npm install
```

> Follow the Getting Started procedure

> Run the bot

```
$ node .
```


## Built With

* Node.js
* MongoDB


## Acknowledgments

* discord.js
