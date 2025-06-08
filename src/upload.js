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
import formidable from 'formidable';


http.createServer((req, res) => {

  //обработка POST-запроса (загрузка файлов)
  if (req.method === 'POST' && req.url === '/upload') {
    const form = formidable(); //TODO: try multiples true and false

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500);
        res.end('Ошибка при загрузке файла');
        return;
      };
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.write('<h2>Информация о загруженном файле:</h2>');
      res.write(`<pre>${JSON.stringify(files, null, 2)}</pre>`);

      res.write('<h2>Поля формы:</h2>');
      res.write(`<pre>${JSON.stringify(fields, null, 2)}</pre>`);
      res.end();
    });
  }

  else {//обработка GET-запроса (выдача html-файла)
  const reqFile = './src' + req.url + '.html';

  readFile(reqFile, 'utf-8')
  .then(fileContent => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fileContent);
  })
  .catch(err => {
    warn(`ОШИБКА ЧТЕНИЯ ФАЙЛА: ${err}`);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>404, страница ${reqFile} ${upperCase('НЕ НАЙДЕНА!!!')}!</h1>`);
  });}})
  .listen(8888, () => {
    log('Server running!')
  });