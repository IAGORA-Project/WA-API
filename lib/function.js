const chalk = require('chalk');
const path = require('path');
const multer = require('multer');

const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

/**
 * Get text with color
 * @param  {String} text
 * @param  {String} color
 * @return  {String} Return text with color
 */
const color = (text, color) => {
    return !color ? chalk.green(text) : color.startsWith('#') ? chalk.hex(color)(text) : chalk.keyword(color)(text);
};

/**
 * 
 * @param {Number} length 
 * @returns {String} Return random text
 */
function randomText(length) {
    const result = [];
    for (let i = 0; i < length; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
    return result.join('');
}

function os_func() {
    this.execCommand = function (command) {
        return new Promise((resolve, reject)=> {
        spawn(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout)
        });
    })
}}

const storage = multer.diskStorage({
    destination: 'public/file',
    filename: (req, file, cb) => {
        cb(null, randomText(24) + path.extname(file.originalname))
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10000000 // 10 MB
    }
})

module.exports = { color, randomText, upload, os_func }