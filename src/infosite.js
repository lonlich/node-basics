import {
    log,
    warn,
    table,
    block,
    //formatPrice,
} from "./js/utils.js";

import fs from "fs";
import { access } from "fs/promises";
import { constants } from "fs";
import { readFile } from "fs/promises";
import axios, { Axios } from "axios";
import http from "node:http";
import url from "node:url";
import EventEmitter from "node:events";
const eventEmitter = new EventEmitter();
import { upperCase } from "upper-case";
import formidable from "formidable";

/* 
1. Взять url из запроса (/name)
2. Получить из url название html-файла
3. Проверить, есть ли такой файл
   - если есть => считать его содержимое => показать в браузере
   - если нет => показать 404.html
*/

//CONSTANTS
const PORT = 8888;
const HTML_FOLDER_PATH = './public';
const PAGE404_FILEPATH = `${HTML_FOLDER_PATH}/404.html`;

function constructReqFilePath(reqURL) {
    const reqFileName = reqURL === '/' ? '/index.html' : `${reqURL}.html`
    return `${HTML_FOLDER_PATH}${reqFileName}`
}

async function show404(res, reqFilePath) {
    log(`Страница ${reqFilePath} не найдена`);
    const page404Content = await readFile(PAGE404_FILEPATH);
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page404Content);
}

http.createServer((req, res) => {
    
    const reqFilePath = constructReqFilePath(req.url);

    async function showReqPage() {
            try {
                const reqFileContent = await readFile(reqFilePath);
                log(`Файл ${reqFilePath} прочитан`);

                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                res.end(reqFileContent);
            } catch (err) {
                warn(err);
                show404(res, reqFilePath);
            }
    }

    showReqPage();

}).listen(PORT, () => {
    log(`Server running on port ${PORT}!`);
});
