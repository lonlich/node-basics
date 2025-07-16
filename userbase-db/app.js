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

//auth
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";



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
import { addToTable, selectFromTable } from "./db/queries.js";
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

//session
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());

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

//SIGN UP
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', async (req, res, next) => {
    try {
        await addToTable({
            table: 'users',
            columns: 'username, password',
            rowData: [req.body.username, req.body.password],
        });
        log('Пользователь добавлен в бд')
        res.redirect('/signup')
    } catch (error) {
        return next(err);
    }
});

//LOGIN

//проверка введенных логина и пароля 
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            //ищем пользователя с переданными username и password в бд
            const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = rows[0];

            //если не нашли, выводим сообщение
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            //если не подходит пароль, выводим сообщение
            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password' });
            }
            //если юзер найден и пароль правильный, передаем дальше объект user, полученный из бд, в serializeUser
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

//берем из user только id, чтобы не передавать в сессию весь объект (небезопасно хранить все данные о пользователе там - хеш пароля, имейл итд. Также объект может быть большим -> расходует память сервера). Затем этот id передается в сессию: req.session.passport = { user: user.id }
passport.serializeUser((user, done) => {
    // log(user)
    done(null, user.id);
});

/*user.id сохраняется в Session store на сервере. Там же автоматически создается Session ID: 
Session store:
    {
        id: "abc123",
        passport: { user: 42 }
    }

В ответе клиенту отправляется кука с Session ID:  Set-Cookie: connect.sid=abc123. Она хранится в браузере. Для каждой сессии создается своя кука - позволяет разлогинивать разные устройства.
*/

//deserializeUser видит в сессии переданный user.id и достает из БД объект со ВСЕМИ данными пользователя: email, роль итд (они нужны для работы приложения) => всегда свежие данные. Это особенно актуально если свойства пользователя меняются во время сессии (например изменилась роль)
passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = rows[0];

        //передает user в req.user, который доступен дальше в запросе
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/'
})
);

//LOGOUT
app.get('/logout', (req, res, next) => {
    //passport добавляет функцию logout в req object
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


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
