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
dotenv.config();

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
app.use(passport.initialize());
app.use(passport.session());





/* MAIN */

//USERBASE

app.get("/", loadCurrentUser, indexGet);

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
app.get('/signup', signUpGet);
app.post('/signup', signUpPost);

//LOGIN

//проверка введенных логина и пароля 
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            // log('в localstrategy')
            //ищем пользователя с переданными username и password в бд
            const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = rows[0];

            console.log("🚀 ~ newLocalStrategy ~ user:", user);
            
            //если не нашли, выводим сообщение
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }

            const match = await bcrypt.compare(password, user.password);
            
            if (!match) {
                // passwords do not match!
                return done(null, false, { message: 'Incorrect password' });
            }
            //если юзер найден и пароль правильный, передаем дальше объект user, полученный из бд, в serializeUser
            // log('Пароль правильный, юзер найден')
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

//берем из user только id, чтобы не передавать в сессию весь объект (небезопасно хранить все данные о пользователе там - хеш пароля, имейл итд. Также объект может быть большим -> расходует память сервера). Затем этот id передается в сессию: req.session.passport = { user: user.id }
/*
serializeUser вызывается только ОДИН РАЗ при логине → кладёт user.id (или другое) в сессию.
*/
passport.serializeUser((user, done) => {
    console.log("🚀 ~ passport.serializeUser ~ user:", user);

    done(null, user.id);
});



/*user.id сохраняется в Session store на сервере. Там же автоматически создается Session ID: 
Session store:
    {
        id: "abc123",
        passport: { user: 42 }
    }
*/

/*В ответе клиенту отправляется кука с Session ID:  Set-Cookie: connect.sid=abc123. Она хранится в браузере. Для каждой сессии создается своя кука - позволяет разлогинивать разные устройства.
*/

//deserializeUser видит в сессии переданный user.id и кладет его в req.user.id. Затем по этому id можно доставать актуального юзера из базы в контроллерах
/*
deserializeUser вызывается при КАЖДОМ новом HTTP-запросе, если у пользователя есть активная сессия
*/
passport.deserializeUser(async (id, done) => {
    
    // try {

        //получаем юзера со свежими данными
        // const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        // const user = rows[0];

        // console.log("🚀 ~ passport.deserializeUser ~ user:", user);

        //передает user в req.user, который доступен дальше в запросе
        done(null, { id });
    // } catch (err) {
    //     done(err);
    // }
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

//TODO: добавить CONFIRM PASSWORD

//TODO: сделать автологин после signup

//TODO: проверить маршруты на соответствие REST-архитектуре

//TODO: добавить sanitizing для полей игры, которые вводятся пользователем

//TODO: переделать ID с цифр на говорящие. Хотя бы для жанров?



