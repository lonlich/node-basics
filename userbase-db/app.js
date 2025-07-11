import {
    log,
    warn,
    table,
    block,
    fakeApiCall,
    now,
    //formatPrice,
} from "./js/utils.js";

import "./js/globals.js";

import {
    __filename,
    __dirname,
    PORT,
    STATIC_FOLDER_PATH,
    PAGE404_FILE,
} from "./config.js";

import express from "express";
import expressLayouts from "express-ejs-layouts";
import { body, validationResult } from "express-validator";
import axios, { Axios } from "axios";

// import { serveHTML } from "./serveHTML.js";
import { setupLocals } from "./middleware/setupLocals.js";
import { validateUser } from "./validators/validateUser.js";
import { validateUpdatedUser } from "./validators/validateUpdatedUser.js";

//controllers
import {
    createUserGet,
    createUserPost,
    editUserGet,
    editUserPost,
    deleteUserGet,
} from "./controllers/userController.js";
import { searchControllerGet } from "./controllers/searchController.js";

import { userbase } from "./storage/userbase.js";
import { userFormSchema } from "./constants/userFormSchema.js";

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
import { indexGet } from "./controllers/indexController.js";
import { gamesRouter } from "./routers/games-router.js";
import { selectFromTable } from "./db/queries.js";
import { gameCardSchema } from "./constants/gameFormSchema.js";

const app = express();

//use EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//use express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layout");

//body parsing
app.use(express.json());
app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));

//set up res.locals
app.use(setupLocals);

//serve static files
app.use(express.static(path.join(__dirname, "public")));

/* MAIN */

//USERBASE

app.get("/", indexGet);

//create user
app.get("/create-user", createUserGet);
app.post("/create-user", validateUser, createUserPost);

//edit user
app.get("/:id/edit", editUserGet);
app.post("/:id/edit", validateUpdatedUser, editUserPost);

//delete user
app.get("/:id/delete", deleteUserGet);

//search user
app.get("/search", searchControllerGet);

//GAMEBASE

app.use("/games", gamesRouter);

//обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack); // лог в консоль

    res.status(500).render("error", {
        error: err,
    });
});

//запуск сервера
app.listen(PORT, () => {
    log(`Server running on port ${PORT}!`);
});

//TODO: проверить маршруты на соответствие REST-архитектуре

//TODO: добавить sanitizing для полей игры, которые вводятся пользователем

//TODO: переделать ID с цифр на говорящие. Хотя бы для жанров?
