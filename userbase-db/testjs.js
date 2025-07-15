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
import { selectFromTable } from "./db/queries.js";

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

export const addToTableTest = async ({ table, columns, rowData }) => {
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
export const addRowToTableTest = (addQueryParams) => {
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

// addToTable(addQueryParamsGamesGenres); 

/*
UPDATE games
SET
    name  = 'SETwarcraft',
    price = 49.99
WHERE
    price < 20 
    AND
    name IN ('doom', 'quake')
    RETURNING *;


where: { name: { op: 'IN', value: formInputData?.genre } }

===

UPDATE games
SET
    name = $1,
    price = $2
WHERE
    price < $3
    AND
    name IN ($4, $5)
RETURNING *;

UPDATE games
SET
    name  = $1,
    price = $2
WHERE
    price < $3
    AND
    name IN ($4, $5)
RETURNING *;


*/

export const updateInTableTest = async ({ table, set, where }) => {

    if (!table || !set || !where) {
        warn("Не указана таблица, set или where");
        return;
    }

    //формируем setClause
    let setClause = '';
    let i = 1;
    

    const updates = Object.entries(set).map(([key, value]) => { return `${key} = $${i++}`})

    setClause = `SET ${updates.join(', ')}`;
    console.log("🚀 ~ updateInTable ~ setClause:", setClause)
    const queryValues = Object.values(set);
    console.log("🚀 ~ updateInTable ~ queryValues:", queryValues)

    //формируем whereClause
    let whereClause = '';
    const conditions = [];

    Object.entries(where).forEach(([column, { op, value }]) => {
            // console.log("🚀 ~ Object.entries ~ value:", value)
            if (op === "IN") {
                //если пришел не массив (например - одно значение без массива), превращаем его в массив, чтобы сработал value.map
                const inValuesArr = Array.isArray(value) ? value : [value];
            // console.log("🚀 ~ Object.entries ~ value:", value)

                const placeholders = inValuesArr.map(() => `$${i++}`);
                conditions.push(`${column} ${op} (${placeholders.join(", ")})`);
                // values.push(...inValuesArr);
                queryValues.push(...value);
            } else {
                conditions.push(`${column} ${op} $${i++}`);
                queryValues.push(value);
            }
        });
    
    whereClause = `WHERE ${conditions.join(" AND ")}`;

    console.log("🚀 ~ updateInTable ~ whereClause:", whereClause)
    const query = `UPDATE ${table} ${setClause} ${whereClause} RETURNING *`;

    console.log("🚀 ~ updateInTable ~ query:", query)
    const { rows } = await pool.query(query, queryValues);

    // console.log("🚀 ~ updateInTable ~ rows:", rows)
    if (rows.length === 0) {
        log(`В таблице ${table} нет строк с данными`);
    }

    return rows;

}

export const deleteFromTableTest = async ({
    table,
    where, // { fieldName: { op: "IN", value: ["rpg", "rts"] }, 
    returning,
}) => {
    if (!table) {
        warn("Не указано имя целевой таблицы в deleteFromTable");
        return;
    }

    //составляем строку с условиями (если они переданы)
    let whereClause = "";
    const queryValues = [];

    if (where) {
        console.log("🚀 ~ where:", where)
        const conditions = [];
        let i = 1;

        Object.entries(where).forEach(([column, { op, value }]) => {
            console.log("🚀 ~ Object.entries ~ value:", value)
            if (op === "IN") {
                //если пришел не массив (например - одно значение без массива), превращаем его в массив, чтобы сработал value.map
                const inValuesArr = Array.isArray(value) ? value : [value];
                console.log("🚀 ~ Object.entries ~ value:", value)

                const placeholders = inValuesArr.map(() => `$${i++}`);
                conditions.push(`${column} ${op} (${placeholders.join(", ")})`);
                queryValues.push(...inValuesArr);
            } else {
                conditions.push(`${column} ${op} $${i++}`);
                queryValues.push(value);
            }
                
        });

        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    console.log("🚀 ~ Object.entries ~ queryValues:", queryValues)
    const returningClause = returning ? `RETURNING ${returning}` : '';
    const query = `DELETE FROM ${table} ${whereClause} ${returningClause}`;
    console.log("🚀 ~ query:", query)
    const { rows } = await pool.query(query, queryValues);

    console.log("🚀 ~ rows:", rows)
    if (rows.length === 0) {
        log(`В таблице ${table} ничего не удалено`);
    }

    return rows;
};

// const result = await deleteFromTable({
//     table: 'games_genres',
//     where: {
//         game_id: { op: '=', value:  171 },
//         genre_id: { op: 'IN', value: [ 1, 2, 3 ]},
//     },
//     returning: "*",
// })





// updateInTable({
//     table: 'games',
//     set: {
//         name: 'SETwarcraft',
//         price: '49.99'
//     },
//     where: {
//         // price: { op: "<", value: 30 },
//         // name: { op: 'IN', value: ['doom', 'quake'] },
//         id: { op: '=', value: 169 },
//     }
// })

///



/*
1 Случай: жанр или жанры убираются
currentGenres: [
    { game_id: 172, genre_id: 1 },
    { game_id: 172, genre_id: 2 },
    { game_id: 172, genre_id: 3 }
]
*/
//Жанр c genre_id = 1 убрали
/*
newGenres: [ 
    { game_id: 172, genre_id: 2 }, 
    { game_id: 172, genre_id: 3 } 
]

Сравниваю содержимое currentGenres и newGenres. Если пара game_id: 172, genre_id: 1 есть в currentGenres, но ее нет в newGenres => удаляю эту строку из базы

2 случай: жанр или жанры добавляются

currentGenres: [
    { game_id: 172, genre_id: 2 },
    { game_id: 172, genre_id: 3 }
]
*/
//Жанр c genre_id = 2 добавили
/*
newGenres: [ 
    { game_id: 172, genre_id: 2 }, 
    { game_id: 172, genre_id: 3 },
    { game_id: 172, genre_id: 1 } 
]

Сравниваю содержимое currentGenres и newGenres. Если пара game_id: 172, genre_id: 1 есть в newGenres, но ее нет в currentGenres => добавляю эту строку в базу


formInputData: {
    name: 'war',
    description: '',
    price: '60.00',
    genre: [ 'rpg', 'rts', 'action' ] 

currentGenreIdsArr: [ 2, 3 ]
newGenreIdsArr: [ 1, 2, 3 ]

1, 2
1, 3

genreIdsToInsert = [ 2, 3 ]

genreIdsToInsert.map(genreId => [gameId, genreId])


formInputData: { name: 'war', description: '', price: '59', genre: [ 'rpg', 'rts' ] }     
🚀 ~ editGamePost ~ currentGameData: {
    id: 1,
    name: 'warcraft',
   description: null,
    price: '60.00',
    created_at: '12:43:24.25+00'
*/