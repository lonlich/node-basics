import {
  log,
  warn,
  table,
  block,
  //formatPrice,
} from "./js/utils.js";

import fs from 'fs';
import { readFile } from 'fs/promises';
import axios, { Axios } from 'axios';
import http from 'node:http';
import url from 'node:url';
import EventEmitter from 'node:events';
const eventEmitter = new EventEmitter();
import {upperCase} from 'upper-case';

/* 
1. Создать сервер
2. Сохранить запрошенный URL
3. В зависимости от URL показать нужный файл
4. В начале обработать ошибку и выдать сообщение, не обрабатывая дальнейшие ветки
*/

http.createServer((req, res) => {
  
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  const stream = fs.createReadStream('./src/summer.html', 'utf-8');
  stream.on('open', () => log('file opened...'));
  stream.on('data', chunk => log(`Это чанк: ${chunk}`));
  stream.on('close', () => log('file closed...'));
  stream.on('error', err => warn(err));


  const reqFile = './src' + req.url + '.html';

  readFile(reqFile, 'utf-8')
  .then(fileContent => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(fileContent);
  })
  .catch(err => {
    warn(`ОШИБКА ЧТЕНИЯ ФАЙЛА: ${err}`);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>404, страница ${reqFile} ${upperCase('НЕ НАЙДЕНА!!!')}!</h1>`);
});

}).listen(3000, () => {log('Server running!')});

