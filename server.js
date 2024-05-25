const http = require('http');
const querystring = require('querystring');
const { Events, GatewayIntentBits, Client } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

http.createServer(function (req, res) {
    if (req.method == 'POST') {
        let data = "";
        req.on('data', function (chunk) {
            data += chunk;
        });
        req.on('end', function () {
            if (!data) {
                res.end("No post data");
                return;
            }
            let dataObject = querystring.parse(data);
            console.log("post:" + dataObject.type);
            if (dataObject.type == "wake") {
                console.log("Woke up in post");
                res.end();
                return;
            }
            res.end();
        });
    }
    else if (req.method == 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Discord Bot is active now\n');
    }
}).listen(3000);

client.on(Events.ClientReady, c => {
    console.log(`${c.user.tag} でログインしました`);
});

client.on(Events.ClientReady, message => {
    if (message.author.bot || message.webhookID || message.system) {
        return;
    }
});

if (process.env.TOKEN == undefined) {
    console.log('TOKENが設定されていません。');
    process.exit(0);
}

client.login(process.env.TOKEN);