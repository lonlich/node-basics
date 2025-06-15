import {
    log,
    warn,
    table,
    block,
    fakeApiCall,
    now
    //formatPrice,
} from "./js/utils.js";

import {
    __filename,
    __dirname,
    PORT,
    STATIC_FOLDER_PATH,
    PAGE404_FILE
} from "./config.js"

import { serveHTML } from "./serveHTML.js";
import { userRouter } from "./routers/userRouter.js";
import { authorRouter } from "./routers/authorRouter.js";
import { setupLocals } from "./middleware/setupLocals.js";

import fs from "fs";
import { access } from "fs/promises";
import { constants } from "fs";
import { readFile } from "fs/promises";
import axios, { Axios } from "axios";
import http from "node:http";
import url from "node:url";
import path from "path";
import EventEmitter from "node:events";
const eventEmitter = new EventEmitter();
import { upperCase } from "upper-case";
import formidable from "formidable";

import { dirname } from "path";
import { fileURLToPath } from "url";

import express from "express";
const app = express();

app.use(express.json());
app.set('json spaces', 2);
app.use(express.urlencoded({ extended: true }));

//use EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* 
1. Взять url из запроса (/name)
2. Получить из url название html-файла
3. Проверить, есть ли такой файл
   - если есть => считать его содержимое => показать в браузере
   - если нет => показать 404.html
*/

app.use(setupLocals);

//include footer on all pages



app.use(serveHTML);

//serve static files
app.use(express.static(STATIC_FOLDER_PATH));

//ejs views
app.get('/ejs', (req, res) => {
    res.render('ejs-index', { 
        title: 'Тайтл',
        heading: 'Хединг',
        message: 'Мессидж',
        items: [ 'cat', 'dog', 'bird' ]
    });
});

//comment form

const comments = [];

app.get('/comment-form', (req, res) => {
    res.render('comment-form');
});

app.post('/post-comment', (req, res) => {
    comments.push(req.body.comment);
    res.redirect('/all-comments');
});

app.get('/all-comments', (req, res) => {
    log('я тут');
    res.render('all-comments', {
        comments: comments
    }, 
    (err, html) => {
        if (err) {
            log(`Ошибка рендеринга шаблона на странице ${req.path}`);
            log(err)
            res.redirect('/post-comment-failed');
        }
        res.send(html);
    }
);
});

app.post('/submit', (req, res) => {
    log(req.body)
    const {name, age} = req.body;
    log(`Юзера зовут ${name}, его возраст ${age}`)
    res.send('данные отправлены');
});

//user router
app.use('/users', userRouter);

//author router
app.use('/authors', authorRouter);

app.get('/*splat', (req, res) => {
    res.status(200).send(`Ты попал на ${req.params.splat}`)
})

//запуск сервера
app.listen(PORT, () => {
    log(`Server running on port ${PORT}!`);
});
