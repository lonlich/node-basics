import {
    STATIC_FOLDER_PATH,
} from "./js/config.js"

import {
    log,
    warn,
    table,
    block,
    //formatPrice,
} from "./js/utils.js";


import path from "path";
import { access } from "fs/promises";
import { constants } from "fs";

export async function serveHTML(req, res, next) {
    if (req.path === '/favicon.ico') {
        return res.end();
    }

    const reqFile = path.join(STATIC_FOLDER_PATH, req.path + ".html");

    try {
        await access(reqFile, constants.F_OK);
        console.log("Файл существует!");
        return res.sendFile(reqFile);
    } catch (err) {
        console.log(`Файл ${reqFile} не найден, иду дальше.`);
        next();
    }
}