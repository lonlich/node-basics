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

import { getAuthorByIdHandler } from "../controllers/authorController.js";

import express from "express";
const app = express();

app.use(express.json());

export const authorRouter = express.Router();

authorRouter.get('/:authorId', getAuthorByIdHandler);

authorRouter.use((err, req, res, next) => {
    log('Hi from error middleware')
    res.status().json({ 
        error: 'Ошибка сервера', 
        details: err.message, 
        name: err.name,
        code: err.statusCode || 'Хз какой код',
        stack: err.stack 
    });
})