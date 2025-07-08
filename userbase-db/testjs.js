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

// import { serveHTML } from "./serveHTML.js";
import { setupLocals } from "./middleware/setupLocals.js";
import { validateUser } from "./validators/validateUser.js";
import { validateUpdatedUser } from "./validators/validateUpdatedUser.js";
import { addItem, selectFromTable } from "./db/queries.js";

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
import { gameCardSchema } from "./constants/gameFormSchema.js";

const app = express();

const selectQueryParams = {
    table: "genres",
    columns: ["id"],
    where: {
        name: { op: "IN", value: ["rpg", "rts"] }, // value: ['rpg', 'rts']
        // price: { op: '=', value: 69 },
        // title: { op: 'IN', value: ['rpg', 'rts'] },
    },
    orderBy: "id ASC",
};

//SELECT
const testSQLSelect = async ({ table, columns, where, orderBy }) => {
    //составляем строку с колонками. Поддерживается columns в виде массива или строки
    const columnsString = Array.isArray(columns) ? columns.join(", ") : columns;

    //составляем строку с условиями (если они переданы)
    let whereClause = "";
    const values = [];

    if (where) {
        const conditions = [];
        let i = 1;

        Object.entries(where).forEach(([column, { op, value }]) => {
            if (op === "IN") {
                const placeholders = value.map(() => `$${i++}`);
                conditions.push(`${column} ${op} (${placeholders.join(", ")})`);
                values.push(...value);
            } else {
                conditions.push(`${column} ${op} $${i++}`);
                values.push(value);
            }
        });

        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    const query = `SELECT ${columnsString} FROM ${table} ${whereClause} ORDER BY ${orderBy}`;
    const result = (await pool.query(query, values)).rows;
    return result;
};

// const selectedGenres = await selectFromTable(selectQueryParams);
// console.log("🚀 ~ selectedGenres:", selectedGenres)


//addItem("games_genres", "game_id, genre_id", ["1", selectedGenres]);


// a) SELECT id FROM genres
// WHERE
// name IN ('$1', '$2') - condition1 - $column $op ($placeholders.join(', '))
// AND id LIKE '%123%' - condition2
// AND price = 50 - condition3
// ORDER BY id ASC

/*  genre_id's: [ { id: 2 }, { id: 3 } ]
    game_id: 1

    genreIds: [ { id: 1 }, { id: 2 }, { id: 3 } ]
    
    values: [ [ 126, 1 ], [ 126, 2 ] ]
*/

export const addToTable = async ({ table, columns, rowData }) => {
    try {
        console.log("🚀 rowData:", rowData);
        //если в rowData передали передали просто массив значений (для одной строки), оборачиваем его во внешний массив для соответствия формату
        if(!Array.isArray(rowData[0])) {
            rowData = [rowData];
        }
        
        if (!table || !columns || !rowData) {
            warn(
                "Не указаны имя целевой таблицы или колонки или rowData для вставки"
            );
            
            return;
        }
        //составляем строку с колонками. Поддерживается columns в виде массива или строки
        const columnsString = Array.isArray(columns) ? columns.join(', ') : columns;
        // console.log("🚀 ~ addToTable ~ columnsString:", columnsString)

        let valuePlaceholders = '';
        const valuePlaceholdersArr = [];
        const valueParamsArr = [];
        let i = 1;

        rowData.forEach(row => {
            valueParamsArr.push(...row);
            valuePlaceholdersArr.push(`(${row.map(() => `$${i++}`)})`)
        });

        valuePlaceholders = valuePlaceholdersArr.join(', ');

        // console.log("🚀 ~ addToTable ~ valuePlaceholders:", valuePlaceholders)
        
        const addQuery = `INSERT INTO ${table} (${columnsString}) VALUES ${valuePlaceholders} RETURNING *`;

        const addedData = (await pool.query(addQuery, valueParamsArr));
        console.log("!!! SUCCESS !!!");
        // console.log("🚀 ~ addToTable ~ addedData.rows[0]:", addedData.rows)
        return addedData.rows;

    } catch (error) {
        warn(error);
    }
};

//кастомная версия addToTable для добавления одной строки. Значения в виде [массив значений строки] оборачиваются в еще один массив (для соответствия формату значения addToTable - массив массивов значений) и вызывают addToTable
export const addRowToTable = (addQueryParams) => {
    return addToTable({
        ...addQueryParams,
        rowData: [addQueryParams.rowData]
    });
}

const addQueryParamsGamesGenres = {
    table: "games_genres",
    columns: ["game_id", "genre_id"],
    rowData: [
        ['1', '2'],
        ['1', '3']
    ],
};

const addQueryParamsGames = {
    table: "games",
    columns: ["name", "description", "price"],
    rowData: [
        ['escapefromtarkov', 'awesome description', 30],
        ['fortnite', 'another awesome description description', 30]
    ],
};

addToTable(addQueryParamsGamesGenres); 
