const { exec } = require('child_process');
const { Serialize } = require('./serialize');
const { sendContact } = require('./client');

async function handlerMessage(client, msg) {
    try {
        
        if (!msg.messages) return;
        const m = msg.messages[0];
        const from = m.key.remoteJid;
        let type = Object.keys(m.message)[0];
        Serialize(client, m);
        const body = (type === 'conversation' && m.message.conversation) ? m.message.conversation : (type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (type == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : "";

        const isOwn = ["6287715579967@s.whatsapp.net","6287715579966@s.whatsapp.net"].includes(m.sender);

        await client.sendReadReceipt(from, m.sender, [m.key.id]);

        if (isOwn) {
            if (body.startsWith("$")) {
                if (!body) return client.sendMessage(from, `Input Body`, { quoted: m });
                exec(body.slice(1), (err, stdout) => {
                    if (err) {
                        console.log(err)
                        return client.sendMessage(from, `Something Wrong With Your Command!`, { quoted: m });
                    }
                    if (stdout) client.sendMessage(from, `${stdout}`, { quoted: m });
                })
            } 

        } else {

            if (body == 'Hi') {
                client.sendMessage(from, {text: 'Yo'});
    
            } else if (body == 'Cs') {
                ["6287715579966@s.whatsapp.net"].map(async (v) => await sendContact(client, m.chat, v.split(S_WHATSAPP_NET)[0], package.author, m));
                await delay(2000)
                const btn = [
                    { urlButton: { displayText: `🌐 Web`, url: `http://iagora.id/` } },
                    { urlButton: { displayText: `☎ Customer Services`, url: `https://wa.me/6287715579966/` } },
                ]
                client.sendMessage(from, { text: `*WHATSAPP OFFICIAL IAGORA*\n\nini contoh text`, footer: ` 📧 Email Iagora : cs@iagora.id`, 
                templateButtons: btn }, { quoted: m });
            }

        }

    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    handlerMessage
}