import 'dotenv/config'
import discord from "discord.js"
import ytdl from "ytdl-core"

const { URL, CHANNELID, TOKEN, STATUS } = process.env
const client = new discord.Client();

if (!TOKEN) {
    console.error("token invalido");
} else if (!CHANNELID || !Number(CHANNELID)) {
    console.error("id do canal inválido");
} else if (!ytdl.validateURL(URL)) {
    console.error("link do vídeo inválido.");
}

let channel = null;
let broadcast = null;
let interval = null;
let stream = ytdl(URL, { highWaterMark: 100 << 150 });

client.on('ready', async() => {

    client.user.setActivity(STATUS || "Radio lo-fi",{ type: 'LISTENING'})
    channel = client.channels.cache.get(CHANNELID) || await client.channels.fetch(CHANNELID);

    if (!channel || channel.type !== "voice") return console.error("canal de voz não existe")

    broadcast = client.voice.createBroadcast();
    stream.on('error', console.error);
    broadcast.play(stream);

    if (!interval) {
        interval = setInterval(async () => await channel.leave(), 1800000)
    }
    try {
        const connection = await channel.join();
        connection.play(broadcast);
    } catch (error) {
        console.error(error);
    }
    console.log("sucess")
});

client.on('voiceStateUpdate', async userEvent => {
    if (userEvent.id !== client.user.id) return;
    if(!channel) return;
    const connection = await channel.join();
    connection.play(broadcast);
})

client.login(TOKEN);