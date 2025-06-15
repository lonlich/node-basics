import {
    log,
    warn,
    table,
    block,
    //formatPrice,
} from "../js/utils.js";

import {
    __filename,
    __dirname,
    PORT,
    STATIC_FOLDER_PATH,
    PAGE404_FILE
} from "../config.js"

import { serveHTML } from "../serveHTML.js";

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

export const userRouter = express.Router();

const now = new Date(Date.now());
const timeLog = (req, res, next) => {
    log(`Время запроса к ${req.path}: ${now.toLocaleString()}`);
    next();
}

export const addCustomReqProperty = (req, res, next) => {
    req.customProperty = 'Привет, я проперти!';
    next();
}

userRouter.use(timeLog, addCustomReqProperty);

userRouter.get('/', (req, res, next) => {
    res.send('Это список пользователей');
});

userRouter.get('/:username/profile', (req, res) => {
    log('я тут');
    res.render('profile-page');
});

userRouter.get('/json', (req, res) => {
    res.json({
        id: 1,
        name: 'Misha',
        admin: true
    });
});


userRouter.get('/redirect', (req, res) => {
    log('Редирекчу...');
    res.redirect('/hello');
});

userRouter.get('/:id', (req, res, next) => {
    log(req.customProperty);
    const filePath = path.join(__dirname, 'style.css')
    res.download(filePath, (err) => {

        log(`Файл ${filePath} отправлен!`);

        if (err) {
            console.warn('ОШибка при скачивании', err);
            res.status(404).send('Файл не найден');
        }
    });
    
    // res.send(req.params);
    // console.log(req.params);
});

userRouter.post('/:id/:page', (req, res) => {
    console.log('Это ветка post: ', req.body);
    res.send(req.params);
});

userRouter.get('/:id/edit', (req, res) => {
    res.send(`Это страница редактировния профиля пользователя ${req.params.id}`);
});
