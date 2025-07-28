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
import pool from "./db/pool.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

//Prisma
// import { PrismaClient } from './generated/prisma/index.js';
// const prisma = new PrismaClient();




//auth
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
const PgSession = connectPgSimple(session);
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";



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
import { addToTable, selectFromTable, updateInTable } from "./db/queries.js";
import { gameCardSchema } from "./constants/gameFormSchema.js";
import { clubhouseRouter } from "./routers/clubhouse-router.js";
import { signUpGet, signUpPost } from "./controllers/signUpController.js";
import { loadCurrentUser } from "./db/dbUtils.js";
import { usersRouter } from "./routers/users-router.js";
import { configurePassport } from "./auth/configurePassport.js";
import { validateSignUp } from "./validators/validateSignUp.js";
import { validateLogin } from "./validators/validateLogin.js";
import { loginGet, loginPost } from "./controllers/loginController.js";
import { prismaQueriesTest } from "./js/prismaQueries.js";

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

//serve static files
app.use(express.static(path.join(__dirname, "public")));

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

//session
app.use(
    session({
        store: new PgSession({
            pool: pool, // Используем наш pool
            tableName: 'sessions', // Имя таблицы (по умолчанию "session")
            createTableIfMissing: false, // Автосоздание таблицы
        }),
        secret: process.env.SESSION_SECRET, // Лучше использовать process.env
        resave: false, // Не пересохранять сессию, если не изменялась
        saveUninitialized: false, // Не сохранять пустые сессии
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
            secure: false, // true, если HTTPS
        },
    })
);

//PASSPORT

configurePassport(passport);

app.use(passport.initialize());
app.use(passport.session());

//set up res.locals
app.use(setupLocals);

/* MAIN */

//SIGN UP
app.get('/signup', signUpGet);
app.post('/signup', validateSignUp, signUpPost);

//LOG IN

app.get('/login', loginGet);

app.post('/login', validateLogin, loginPost, passport.authenticate('local', {
    successRedirect: '/clubhouse',
    failureRedirect: '/login-failed'
})
);

app.get('/login-failed', (req, res) => {
    res.render('login-failed');
});

//LOGOUT
app.get('/logout', (req, res, next) => {
    //passport добавляет функцию logout в req object
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/clubhouse');
    });
});

//USERBASE
app.use('/', usersRouter);

//GAMEBASE
app.use("/games", gamesRouter);

//CLUBHOUSE
app.use("/clubhouse", clubhouseRouter);

app.get('/givemember', loadCurrentUser, async (req, res) => {

    // const user = await getCurrentUser(req);

    console.log("🚀 ~ app.get ~ user:", req.user);
    log(typeof req.user.id)

    await updateInTable({
        table: 'users', 
        set: { is_member: true },
        where: {
            id: { op: '=', value: req.user.id}
        }
    })
    // await pool.query(`UPDATE users SET is_member = true WHERE id = $1`, [userId]);
    res.redirect('/');
})


//Prisma Queries Test
prismaQueriesTest();

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



/*
TODO: 
- сделать одну универсальную форму с динамическими заполнениями полей из схемы и заменить везде. Добавить ее в partials. Подумать, целесообразно ли это делать?
- добавить ввод секретной фразы
- добавить выдачу роли админа?
*/



//TODO: реализовать вывод сообщений Incorrect Login, INcorrect password (из Localstrategy и других мест где есть message). Научиться работать с этими message

//TODO: проверить маршруты на соответствие REST-архитектуре

//TODO: добавить sanitizing для полей игры, которые вводятся пользователем

//TODO: переделать ID с цифр на говорящие. Хотя бы для жанров?



