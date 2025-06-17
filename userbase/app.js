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

import express from "express";
import expressLayouts from 'express-ejs-layouts';
import { body, validationResult } from 'express-validator';
import axios, { Axios } from "axios";

// import { serveHTML } from "./serveHTML.js";
import { setupLocals } from "./middleware/setupLocals.js";
import { validateUser } from "./validators/validateUser.js";
import { validateUpdatedUser } from "./validators/validateUpdatedUser.js";
import { userCreationControllerPost } from "./controllers/userCreationControllerPost.js";
import { userEditControllerGet } from "./controllers/userEditControllerGet.js";
import { userEditControllerPost } from "./controllers/userEditControllerPost.js";
import { userbase } from "./storage/userbase.js";

import fs from "fs";
import { access } from "fs/promises";
import { constants } from "fs";
import { readFile } from "fs/promises";
import http from "node:http";
import url from "node:url";
import path from "path";
import EventEmitter from "node:events";
const eventEmitter = new EventEmitter();
import { upperCase } from "upper-case";
import formidable from "formidable";

import { dirname } from "path";
import { fileURLToPath } from "url";

//routers
import { indexRouter } from "./routers/index-router.js";

const app = express();

//use EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout')

//body parsing
app.use(express.json());
app.set('json spaces', 2);
app.use(express.urlencoded({ extended: true }));

//set up res.locals
app.use(setupLocals);

/* MAIN */

app.get('/', (req, res) => {  
    res.render('index', { users : userbase.getUsers() });
});

//create user
app.get('/create-user', (req, res) => {
    res.render('create-user', { heading: 'Создание нового пользователя' });
})
app.post('/create-user', validateUser, userCreationControllerPost);

//edit user
app.get('/:id/edit', userEditControllerGet);
app.post('/:id/edit', validateUpdatedUser, userEditControllerPost);

//запуск сервера
app.listen(PORT, () => {
    log(`Server running on port ${PORT}!`);
});
