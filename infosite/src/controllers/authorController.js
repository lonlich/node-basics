import {
    log,
    warn,
    table,
    block,
    fakeApiCall,
    now
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
import { userRouter } from "../routers/userRouter.js";
import { authorRouter } from "../routers/authorRouter.js";

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
app.use(express.urlencoded({ extended: true }));
import { getAuthorById } from "../db.js";

export async function getAuthorByIdHandler(req, res, next) {
    
    const { authorId } = req.params;

    try {
        const author = await getAuthorById(Number(authorId));
    
        if (!author) {
            res.status(404).send(`Нет автора с ID ${req.params.authorId}, введите число!`);
            return;
        }
    
        res.send(`Имя автора: ${author.name}`)
    } catch (err) {
        next(err);
    }
};