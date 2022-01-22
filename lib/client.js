const { generateThumbnail, prepareWAMessageMedia, generateWAMessageFromContent } = require("@adiwajshing/baileys-md");
const fs = require('fs-extra');

async function sendContact(client, jid, numbers, name, quoted = '', men) {
    let number = numbers.replace(/[^0-9]/g, '')
    const vcard = 'BEGIN:VCARD\n'
        + 'VERSION:3.0\n'
        + 'FN:' + name + '\n'
        + 'ORG:'+ name +';\n'
        + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
        + 'END:VCARD'
    return client.sendMessage(jid, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions: men ? men : [] }, { quoted: quoted })
}

async function sendFile(client, jid, path, mimetype = '', options = {}, caption = '', mentionedJid = [], quoted = '') {
    let mime = mimetype.split('/')[0];

    if (mimetype == 'image/gif' || options.gif) {
        let thumb = await generateThumbnail(path, mime);
        const message = await prepareWAMessageMedia({ video: { url: path }, caption, gifPlayback: true, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
        let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted })
        await client.relayMessage(jid, media.message, { messageId: media.key.id })

    } else if (mime == 'image') {
        let thumb = await generateThumbnail(path, mime);
        const message = await prepareWAMessageMedia({ image: { url: path }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
        let media = generateWAMessageFromContent(jid, { imageMessage: message.imageMessage }, { quoted })
        return await client.relayMessage(jid, media.message, { messageId: media.key.id }).then(() => fs.unlinkSync(path)).catch(() => console.log(error))
    
    } else if (mime == 'video') {
        let thumb = await generateThumbnail('./public/thumb.jpg', 'image');
        const message = await prepareWAMessageMedia({ video: { url: path }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
        let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted })
        return await client.relayMessage(jid, media.message, { messageId: media.key.id }).then(() => fs.unlinkSync(path)).catch(() => console.log(error))
    
    } else if (mime == 'audio') {
        const message = await prepareWAMessageMedia({ audio: { url: path }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer })
        let media = generateWAMessageFromContent(jid, { audioMessage: message.audioMessage }, { quoted })
        await client.relayMessage(jid, media.message, { messageId: media.key.id }).then(() => fs.unlinkSync(path)).catch(() => console.log(error))

    } else {
        const message = await prepareWAMessageMedia({ document: { url: path }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer, })
        let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted })
        await client.relayMessage(jid, media.message, { messageId: media.key.id }).then(() => fs.unlinkSync(path)).catch(() => console.log(error))
    }
}

module.exports = {
    sendContact,
    sendFile,
}