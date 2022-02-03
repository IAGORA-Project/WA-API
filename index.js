const {
    default: makeWASocket,
    generateThumbnail,
    getDevice,
    DisconnectReason,
    downloadContentFromMessage,
    delay,
    useSingleFileAuthState,
    generateWAMessage,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    Browsers,
    isJidGroup,
    S_WHATSAPP_NET,
    toBuffer,
    WAProto,
    extensionForMediaMessage,
    extractMessageContent,
    WAMetric,
    decryptMediaMessageBuffer
} = require('@adiwajshing/baileys-md');

const { Boom } = require('@hapi/boom')

const pino = require('pino');
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta').locale('id');

const session = `./session.json`;
const { state, saveState } = useSingleFileAuthState(session);

const { handler, functions } = require('./lib');
const { os_func } = require('./lib/function');

const PORTS = process.env.PORT || 8001;

const run = async () => {

    const start = async () => {

        const client = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS('Safari'),
        });

        app.set('json spaces', 4);

        app.use(cors())
        app.use(helmet());

        const router = require('./router/router')(client);
        app.get('/', (req, res) => {
            res.send('Client Online')
        })
        app.use('/api/v1', router);
    
        client.ev.on('connection.update', (update) => {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const { connection, lastDisconnect } = update;
            if (connection == 'connecting') {
                console.log(
                    functions.color('[SYS]', '#009FFF'),
                    functions.color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                    functions.color(`WA-API is Authenticating...`, '#f12711')
                );
            } else if (connection === 'close') {
                if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete ${session} and Scan Again`); process.exit(); }
                else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); start(); }
                else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); start(); }
                else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); process.exit(); }
                else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`); process.exit(); }
                else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); start(); }
                else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); start(); }
                else { console.log(`Unknown DisconnectReason: ${reason}|${connection}`) }
            } else if (connection == 'open') {
                console.log(
                    functions.color('[SYS]', '#009FFF'),
                    functions.color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                    functions.color(`WA-API is now Connected...`, '#38ef7d')
                );
            }
        });
    
        client.ev.on('creds.update', () => saveState)
    
        client.ev.on('messages.upsert', async (msg) => {
            try {
                handler.handlerMessage(client, msg)
            } catch (error) {
                console.log(error);
            }
        })
    
    }
    
    start();

    const interval = setInterval(async () => {
        var oz = new os_func();
        oz.execCommand('pm2 restart index.js').then(res => {
            console.log('[DEV] RESTARTING');
        }).catch(err=> {
            console.log("[DEV] >>>", err);
        })
        clearInterval(interval)
    }, 10800000) // 3 JAM

    app.listen(PORTS, () => {
        console.log(functions.color('[~>>]'), functions.color(`App Running http://localhost:${PORTS}`, 'green'))
        console.log(functions.color('==================================================================='))
    })
}
run();