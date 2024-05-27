require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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


client.on(Events.MessageCreate, async (message) => {
    const { content, author, channel, guild } = message;

    if (author.id !== '1186812822454276218') return;
    if (content === '!verify') {
        const ruleChannel = await guild.channels.fetch('1243957898455945408').catch(() => null);
        if (!ruleChannel || !ruleChannel.lastMessageId) {
            message.react('❌');
            return;
        }
        const ruleMessage = await ruleChannel.messages.fetch(ruleChannel.lastMessageId).catch(() => null);
        if (!ruleMessage || ruleMessage.content.length === 0) {
            message.react('❌');
            return;
        }

        channel.send({
            content: ruleMessage.content,
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setCustomId('verify')
                            .setLabel('上記のルールに同意する')
                            .setStyle(ButtonStyle.Success)
                    )
            ]
        });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    const { customId, guild, member } = interaction;

    if (customId === 'verify') {
        const role = await guild.roles.fetch('1243953263045513306').catch(() => null);
        if (!role) {
            interaction.reply({
                content: 'ロールが見つかりませんでした',
                ephemeral: true
            });
            return;
        }
        const isHasRole = member.roles.cache.has(role.id);
        if (isHasRole) {
            interaction.reply({
                content: 'すでにルールに同意しています',
                ephemeral: true
            });
        } else {
            try {
                await member.roles.add(role);
                interaction.reply({
                    content: 'ルールに同意しました',
                    ephemeral: true
                });
            } catch (err) {
                console.error(err);
                interaction.reply({
                    content: 'エラーが発生しました',
                    ephemeral: true
                });
            }
        }
    }
});

client.login(process.env.TOKEN);