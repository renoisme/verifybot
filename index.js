require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

client.on(Events.ClientReady, () => {
    console.log(`${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.inGuild()) return;
    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!ping') {
        await message.reply('Pong!');
    }
});

client.login(process.env.TOKEN);
