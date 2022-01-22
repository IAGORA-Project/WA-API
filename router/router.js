const { S_WHATSAPP_NET } = require('@adiwajshing/baileys-md');
const express = require('express');
const router = express.Router();

const fs = require('fs');
const { bot, functions } = require('../lib');

module.exports = function(client) {
    
    router.get('/send', async(req, res) => {
        try {
            const { no, text } = req.query;
            if (!no && !text) return res.status(403).send({
                status: false,
                messsage: 'Input query'
            })
            let check = await client.onWhatsApp(`${no}@s.whatsapp.net`)
            if (Array.isArray(check) && check.length) {
                await client.sendMessage(`${no}@s.whatsapp.net`, { text })
                return res.status(200).send({
                    status: true,
                    text: text,
                    message: `Send Message to ${no} with text ${text}`
                })
            } else {
                res.status(400).send({
                    status: false,
                    message: `the number (${no}) is not registered on whatsapp`
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: 500, message: 'Internal Server Error'});
        }
    })

    router.get('/sendcontact', async(req, res) => {
        try {
            const { no, contact, name } = req.query;
            if (!no && !contact && !name) return res.status(403).send({
                status: false,
                messsage: 'Input query'
            })
            let check = await client.onWhatsApp(`${no}@s.whatsapp.net`)
            if (Array.isArray(check) && check.length) {
                [`${contact}@s.whatsapp.net`].map(async (v) => await bot.sendContact(client, `${no}@s.whatsapp.net`, v.split(S_WHATSAPP_NET)[0], name))
                return res.status(200).send({
                    status: true,
                    message: `Send Contact ${contact} to ${no} with name ${name}`
                })
            } else {
                res.status(400).send({
                    status: false,
                    message: `the number (${no}) is not registered on whatsapp`
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: 500, message: 'Internal Server Error'});
        }
    })

    router.post('/sendfile', functions.upload.single('file'), async (req, res) => {
        try {
            const { no, text, type, filename } = req.query;
            if (!no) return res.status(403).send({
                status: false,
                messsage: 'Input query'
            })
            let check = await client.onWhatsApp(`${no}@s.whatsapp.net`)
            if (Array.isArray(check) && check.length) {
                let texts = text ? text : ''
                if (!req.file && !req.file.path) return res.status(400).json({
                    status: false,
                    message: "No file uploaded!"
                })
                if (!type) return res.status(400).send({
                    status: false,
                    message: 'Input type!'
                })
                if (type == 'audio' || type == 'document') {
                    if (!filename) return res.status(400).send({
                        status: false,
                        message: 'Input Filename!'
                    })
                    var opt = { fileName: filename }
                } else if (type == 'gif') {
                    var opt = { gif: true }
                } else {
                    var opt = ''
                }
                const read = fs.readFileSync(req.file.path)
                await bot.sendFile(client, `${no}@s.whatsapp.net`, req.file.path, req.file.mimetype, opt, texts)
                return res.status(200).json({
                    status: true,
                    result: {
                        target: no,
                        type,
                        filename,
                        caption: texts,
                        originalname: req.file.originalname,
                        mimetype: req.file.mimetype,
                        size: req.file.size,
                        result_base64: `data:${req.file.mimetype};base64,${read.toString('base64')}`
                    }
                })
            } else {
                res.status(400).send({
                    status: false,
                    message: `the number (${no}) is not registered on whatsapp`
                })
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send({status: 500, message: 'Internal Server Error'});
        }

    }, (error, req, res, next) => {
        console.log(error)
        res.status(400).json({
            error: error.message
        })
    })
    return router;
}