import { log, warn, table, block } from "../js/utils.js";

import {
    __filename,
    __dirname,
    PORT,
    STATIC_FOLDER_PATH,
    PAGE404_FILE,
} from "../config.js";

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
import pool from "../db/pool.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

import express from "express";
import { selectRows } from "../db/queries.js";
import { gameCardSchema as gameCardSchema } from "../constants/gameFormSchema.js";
import { genreSchema } from "../constants/gameFormSchema.js";
import { gameSchema } from "../constants/gameFormSchema.js";
import { validateAddedGame } from "../validators/validateGame.js";
import { addGameGet, addGamePost } from "../controllers/gameController.js";

const app = express();

app.use(express.json());

export const gamesRouter = express.Router();

//Главная - Список игр
gamesRouter.get("/", async (req, res) => {
    try {
        /* Game object structure: 
        basic info: select from games
        genres info: select from genres on id
        developers info: select from developers on id
        */

        //запрос в основную таблицу games для получения базовой инфы
        const games = await selectRows("games");

        //получаем список жанров для каждой игры с помощью связующей таблицы games_genres. Вместо forEach используем for...of, так как forEach не дожидается завершения await-функций
        for (const game of games) {
            const genre = await pool.query(`
                SELECT id, name
                FROM genres
                WHERE id IN (
                    SELECT genre_id 
                    FROM games_genres 
                    WHERE game_id = ${game.id})
                `);
            //записываем жанры в поле game.genre
            game.genre =
                genre.rows.length === 0 ? "Не указан в БД" : genre.rows;
        }

        //у игры могут быть поля разных типов. Поля простых типов (строки, числа) -  передаются в шаблон напрямую, а поля с множественными значениями - массивы - нужно обработать отдельно и выдать готовый код для отрисовки. Также если поле не заполнено, надо вывести соответствующее сообщение

        //собираем массив игр с форматированными полями, соответствующие формату games в шаблоне
        const gamesFormatted = games.map((game) => {
            return constructItemFields(game, genreSchema, '/genres');
        });

        res.render("games-list", {
            games: gamesFormatted,
            formSchema: gameCardSchema,
        });
    } catch (error) {
        warn(error);
    }
});

//Страница жанра
gamesRouter.get("/genres/:genre_id", async (req, res) => {
    try {
        const genreId = req.params.genre_id;

        //деструктуризация массива - получаем первый (и единственный) элемент массива rows и присваиваем его переменной genre
        const [genre] = (await pool.query(
            `SELECT * FROM genres WHERE id = ${genreId}`
        )).rows;
        //Получаем массив игр из базы по genre_id
        // console.log("🚀 ~ gamesRouter.get ~ genre:", genre);
        const games = (
            await pool.query(`
                SELECT *
                FROM games
                WHERE id IN (
                    SELECT game_id
                    FROM games_genres 
                    WHERE genre_id = ${genreId})
                `)
        ).rows;
        // console.log("🔴 ~ gamesRouter.get ~ games:", games);

        //вызываем функцию для генерации HTML
        const gamesFormatted = formatFieldValue(games, gameSchema, '');
        console.log("🔴 ~ gamesRouter.get ~ gamesFormatted:", gamesFormatted);

        res.render("genre", {
            games: gamesFormatted,
            genreSchema,
            genre,
        });
    } catch (error) {
        warn(error);
    }
});

//UTILS

function constructItemFields(item, schema, endpoint) {
    const itemFields = {};
    for (const key in item) {
        //вызываем функцию-обработчик полей
        itemFields[key] = formatFieldValue(item[key], schema, endpoint);
    }
    // console.log("🚀 ~ constructItemFields ~ itemFields:", itemFields);
    return itemFields;
}

function formatFieldValue(value, schema, endpoint = '') {
    //если поле в базе не заполнено
    if (!value) {
        return "Не заполнено";
    }
    //случай с обработкой множественных значений в полях (жанры, разработчики итд)  - массив
    if (Array.isArray(value)) {
        //составление HTML-строки
        return value
            .map((item) => {
                return `<a href="/games${endpoint}/${item.id} "><span>${
                    schema[item.name]?.label
                }</span></a>`;
            })
            .join(", ");
    }

    return value;
}

// ================

//add game
gamesRouter.get("/add-game", addGameGet);

gamesRouter.post("/add-game", validateAddedGame, addGamePost);

//edit user
// app.get("/:id/edit", editUserGet);
// app.post("/:id/edit", validateUpdatedUser, editUserPost);

// //delete user
// app.get("/:id/delete", deleteUserGet);

// //search user
// app.get("/search", searchControllerGet);
