/*

Пользователь заходит на страницу с айди автора (users/authodId). Айди из урл - это параметр запроса

Запрос к странице /users уходит в приложение

Запрос передается в роутер для авторов userRouter

Контроллер вызывает функцию получения автора из БД

Функция вытаскивает автора из БД по переданному параметру из запроса

Вывести имя автора в браузер или показать, что автора нет

*/

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

//custom errors
import { CustomNotFoundError } from "./errors/customNotFoundError.js";

import express from "express";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//

const authors = [
    { authorId: 1, name: 'Vasya' },
    { authorId: 2, name: 'Petya' },
    { authorId: 3, name: 'Kolya' },
]

export async function getAuthorById(authorId) {
    throw new CustomNotFoundError('Автор не найден (кастомная ошибка)');
    return authors.find(author => author.authorId === authorId)
}