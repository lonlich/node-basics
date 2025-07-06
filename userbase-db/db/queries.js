import pool from "./pool.js";
import { normalizeUser } from "./normalizeUser.js";

//get all rows
export const selectRows = async (
    table,
    columns = "*",
    conditionValues = "",
    orderBy = "id ASC"
) => {
    if (!table) {
        warn("Не указано имя целевой таблицы в selectRows");
    }

    const query = `SELECT ${columns} FROM ${table} ORDER BY ${orderBy}`;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
        log(`В таблице ${table} нет строк с данными`);
    }
    return rows;
};

export const selectRowsTest = async ({
    table,
    columns = "*",
    conditionValues = "",
    orderBy = "id ASC",
}) => {
    if (!table) {
        warn("Не указано имя целевой таблицы в selectRows");
    }
    if (conditionValues !== "") {
        const conditions = [];
        const values = [];
        conditionValues.forEach((value) => {
            conditions.push;
        });
    }

    // const whereClause =
    // const query = `SELECT ${columns} FROM ${table} ${whereClause} ORDER BY ${orderBy}`;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
        log(`В таблице ${table} нет строк с данными`);
    }
    return rows;
};

// let searchQuery = `SELECT * FROM usernames`;
//         const conditions = [];
//         const values = [];

//         searchParams.forEach(([key, val], i) => {
//             conditions.push(`${key} ILIKE $${i + 1}`);
//             values.push(`%${val}%`);
//         });

//         searchQuery += ` WHERE ` + conditions.join(' AND ');
//         const searchQueryResponse = await pool.query(searchQuery, values);

//add item to DB
export const addItem = async (table, columns, item) => {
    try {
        //составляем строку с колонками. Поддерживается columns в виде массива или строки
        const columnsString = Array.isArray(columns) ? columns.join(', ') : columns;
        log(item);
        if (!table || !columns) {
            warn(
                "Не указано имя целевой таблицы или колонки для заполнения в addItem"
            );
            return;
        }
        let itemArr = [];
        itemArr =
            typeof item === "object" && item !== null
                ? (itemArr = Object.entries(item))
                : item;

        console.log("🚀 ~ addItem ~ itemArr:", itemArr);
        const valueParams = itemArr
            .map(([key, value], i) => {
                const paramIndex = `$${i + 1}`;
                console.log("🚀 ~ valueParams ~ string:", paramIndex);

                return paramIndex;
            })
            .join(", ");
        const addQuery = `INSERT INTO ${table} (${columnsString}) VALUES (${valueParams})`;

        console.log("🚀 ~ addItem ~ addQuery:", addQuery);
        await pool.query(addQuery, Object.values(item));
        console.log("!!! SUCCESS !!!");
    } catch (error) {
        warn(error);
    }
};

//USERBASE

//insert username
export const insertUser = async (user) => {
    const normalizedUser = normalizeUser(user);
    await pool.query(
        "INSERT INTO usernames (firstname, lastname, email, age) VALUES ($1, $2, $3, $4)",
        Object.values(normalizedUser)
    );
};

//GAMES
export const addGame = async (game) => {
    await pool.query(
        "INSERT INTO games (name, description, price) VALUES ($1, $2, $3)",
        Object.values(game)
    );
};
