import {
  log,
  warn,
  table,
  block,
  //formatPrice,
} from "./js/utils.js";

import fs from 'fs';
import axios, { Axios } from 'axios';
import http from 'node:http'

/* 
ИМИТАЦИЯ ПОЛУЧЕНИЯ ПОСТОВ 
1. Клиент делает запрос постов по определенному маршруту (url) - /posts
2. Сервер проверяет, для какого Url пришел запрос и тип запроса. Если /posts и get - отправляет посты в виде JSON.объекта.
*/

//создание сервера и формирование ответа
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, 'pageLoad:OK', {'Content-Type': 'text/plan'});
        res.end('Page loaded!');
    }

    if(req.url === '/posts') {
        log('получен запрос на посты')
        res.writeHead(200, 'writeHead:OK', {'Content-Type': 'application/json'});

        const posts = [
            { id: 1, title: "post 1", body: "lorem ipsum dolor sit amet 1" },
            { id: 2, title: "post 2", body: "lorem ipsum dolor sit amet 2" },
            { id: 3, title: "post 3", body: "lorem ipsum dolor sit amet 3" },
        ];

        res.end(JSON.stringify(posts), err => err ? warn(err) : log('посты отданы'));
        };
    }
);

server.listen(3000, () => { 
    log('server has started');
});

//формирование GET-запроса на получение постов
log('отправляю запрос на посты');
axios
    .get('http://localhost:3000/posts')
    .then(() => log('посты получены'))
    .catch(err => log(err))

