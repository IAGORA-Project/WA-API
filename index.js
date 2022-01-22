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
            const { connection, lastDisconnect } = update;
            if (connection == 'connecting') {
                console.log(
                    functions.color('[SYS]', '#009FFF'),
                    functions.color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                    functions.color(`WA-API is Authenticating...`, '#f12711')
                );
            } else if (connection === 'close') {
                console.log(
                    functions.color('[SYS]', '#009FFF'),
                    functions.color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                    functions.color(`Connection Closed, trying to reconnect`, '#f64f59')
                );
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                    ? start() : start()
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

        app.listen(PORTS, () => {
            console.log(functions.color('[~>>]'), functions.color(`App Running http://localhost:${PORTS}`, 'green'))
            console.log(functions.color('==================================================================='))
        })
}
run();