require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ChannelType } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
    ]
});

client.on(Events.ClientReady, () => {
    console.log(`${client.user.tag}`);
});


client.on(Events.MessageCreate, async (message) => {
    const { content, author, channel, guild } = message;


    if (message.author.id !== client.user.id) {
        const logChannel = await message.guild.channels.fetch(process.env.LOG_CHANNEL_ID).catch(() => null);
        await message.forward(logChannel);
    }

    if (author.id === process.env.RENOISME && content === '!verify') {
        const ruleChannel = await guild.channels.fetch(process.env.ROLE_MESSAGE_CHANNEL_ID).catch(() => null);
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
        const role = await guild.roles.fetch(process.env.VEERIFYED_ROLE_ID).catch(() => null);
        if (!role) {
            interaction.reply({
                content: 'ロールが見つかりませんでした，サーバー管理者にお問い合わせください',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const hasRole = member.roles.cache.has(role.id);
        if (hasRole) {
            interaction.reply({
                content: 'すでにルールに同意しています',
                flags: MessageFlags.Ephemeral
            });
        } else {
            try {
                await member.roles.add(role);
                interaction.reply({
                    content: 'ルールに同意しました',
                    flags: MessageFlags.Ephemeral
                });
            } catch (err) {
                console.error(err);
                interaction.reply({
                    content: 'エラーが発生しました，サーバー管理者にお問い合わせください',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
});

const createChannel = async (state, member) => {
    const channel = await state.guild.channels.create({
        name: `${member.user.username}'s Room`,
        parent: state.channel.parent,
        type: ChannelType.GuildVoice
    });

    await member.voice.setChannel(channel);
}

const deleteChannel = async (channel) => {
    if (channel.name.includes('Room') && channel.members.size === 0) {
        await channel.delete();
    }
}

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (newState.channel && !oldState.channel) {
        if (newState.channel.id === process.env.CREATE_VC_CHANNEL_ID) {
            await createChannel(newState, newState.member);
        }
    } else if (newState.channel && oldState.channel) {
        await deleteChannel(oldState.channel);
        if (newState.channel.id === process.env.CREATE_VC_CHANNEL_ID) {
            await createChannel(newState, newState.member);
        }
    } else if (!newState.channel && oldState.channel) {
        await deleteChannel(oldState.channel);
    }
});

client.login(process.env.TOKEN);
