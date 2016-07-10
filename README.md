# /b/

_a bot to make an anonymous group chat on telegram, powered by [coffea](https://github.com/caffeinery/coffea)_

[![https://i.imgur.com/m8V75N9.png](https://i.imgur.com/m8V75N9.png)](https://telegram.me/secretloungebot)

Available as [@secretloungebot](https://telegram.me/secretloungebot) on [telegram](https://telegram.org/). **(BETA)**


## Setup

```
git clone https://github.com/6697/secretlounge
cd secretlounge
npm install
```


## Config

Create a `config.json` file:

```js
{
  "protocol": "telegram",
  "token": "PUT_YOUR_TELEGRAM_TOKEN_FROM_BOTFATHER_HERE"
}
```


## Running

Use this for production use:

```
npm start
```

During development, you can also use:

```
npm run start:dev
```

To enable debug messages and run the code with on-the-fly compilation
(via `babel-node`).

Or you can use:

```
npm run watch
```

To automatically restart the bot when the code changes.


## Commands List

List of commands for [@botfather](https://telegram.me/botfather):

```
start - join the chat (start receiving messages)
stop - leave the chat (stop receiving messages)
users - get list of users
info - get info about your account
sign - send your real telegram username
motd - show the welcome message
source - get the source code of this bot
version - show the version of this bot
issues - report issues with this bot
modhelp - show commands for mods
adminhelp - show commands for admins
debug - toggle debug mode (sends back all messages to you)
```
