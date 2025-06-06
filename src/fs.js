import {
  log,
  warn,
  table,
  block,
  //formatPrice,
} from "./js/utils.js";

import fs from 'fs/promises';
import axios, { Axios } from 'axios';
import http from 'node:http';
import url from 'node:url';
import EventEmitter from 'node:events';
const eventEmitter = new EventEmitter();

const testFile = `./src/test.txt`;
const targetFile = './src/copy.txt';



async function opsChain() {
    try {
        log('appending data...')
        await fs.appendFile(testFile, 'HERRO')
        log('data was appended');

        
        log('copying file...')
        await fs.copyFile(testFile, targetFile);
        log('file was copied');

        log('reading file...')
        const targetFileContents = await fs.readFile(targetFile, 'utf-8');
        log(targetFileContents);
        (log('file has been read'));

        log('writing new file...');
        await fs.writeFile(`./src/${Date.now()}.txt`, 'Primer text', 'utf-8');
        log('file has been written');

        const dirname = './src/txt';
        try {
            await fs.access(dirname);
        } catch {
            log('making dir txt...');
            await fs.mkdir('./src/txt');
            log('txt dir has been created');
        }

        log('renaming/moving file');
        await fs.rename('./src/copy.txt', `./src/txt/${Date.now()}.txt`);
        log('renamed/moved the file');

        try {
            await fs.unlink(`./src/delete.txt`);
        } catch {
            log('delete.txt doesnt exist!...');
        }


    } catch (error) {
        warn(`ОШИБКА: ${error}`)
    }
}


// opsChain();

// appendFile — запускается и логирует по завершению

// writeFile — запускается параллельно
// fs.writeFile(`./src/${Date.now()}.txt`, 'Primer text', 'utf-8').then(() => {
//   console.log('✅ writeFile завершился');
// });

// async function opsChain() {
//     await appendFile();
//     await copyFile();
// }

// fs.readFile(testFile, 'utf-8', (err, data) => err ? warn(err) : log(data));
// fs.readFile(testFile, 'utf-8', (err, data) => err ? warn(err) : log(`File ${testFile} was read, contents are: ${data}`));

// fs.readFile(targetFile, 'utf-8')
//     .then((data) => log(data))
//     .catch(err => warn(err));

/* URL CLASS*/

const testUrl = new URL('http://localhost:3000/user');
log(testUrl);
const newUrl = new URL('/herro', testUrl);
// log(newUrl.toJSON());

const emitterCallback = (...args) => {
    log(args.length)
    log(`IT BEGINS with a ${args}...`);
}

eventEmitter.on('begin', emitterCallback)
eventEmitter.on('begin', () => { log('йа второй лисенер!')});
eventEmitter.emit('begin', 10, 100, 1000, 100000000);
log(eventEmitter.listeners('begin'));
log(eventEmitter.listenerCount('begin'));
// eventEmitter.removeAllListeners('begin');
eventEmitter.emit('begin', 10, 100, 1000, 5);
eventEmitter.emit('begin', 10, 20, 30, 5);
log(eventEmitter.listenerCount('begin'));
