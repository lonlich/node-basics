import pool from "./pool.js";
import { normalizeUser } from "./normalizeUser.js";

//get all rows
// export const selectRows = async (
//     table,
//     columns = "*",
//     conditionValues = "",
//     orderBy = "id ASC"
// ) => {
//     if (!table) {
//         warn("Не указано имя целевой таблицы в selectRows");
//     }

//     const query = `SELECT ${columns} FROM ${table} ORDER BY ${orderBy}`;

//     const { rows } = await pool.query(query);

//     if (rows.length === 0) {
//         log(`В таблице ${table} нет строк с данными`);
//     }
//     return rows;
// };


export const selectFromTable = async ({
    table,
    columns = "*", // можно передавать массив с названиями колонок или просто строку
    where, // { fieldName: { op: "IN", value: ["rpg", "rts"] }, 
    orderBy = "id ASC",
}) => {
    if (!table) {
        warn("Не указано имя целевой таблицы в selectRows");
    }
    //составляем строку с колонками. Поддерживается columns в виде массива или строки
    const columnsString = Array.isArray(columns) ? columns.join(", ") : columns;

    //составляем строку с условиями (если они переданы)
    let whereClause = "";
    const values = [];

    if (where) {
        console.log("🚀 ~ where:", where)
        const conditions = [];
        let i = 1;

        Object.entries(where).forEach(([column, { op, value }]) => {
            // console.log("🚀 ~ Object.entries ~ value:", value)
            if (op === "IN") {
                //если пришел не массив (например - одно значение без массива), превращаем его в массив, чтобы сработал value.map
                const inValuesArr = Array.isArray(value) ? value : [value];
            // console.log("🚀 ~ Object.entries ~ value:", value)

                const placeholders = inValuesArr.map(() => `$${i++}`);
                conditions.push(`${column} ${op} (${placeholders.join(", ")})`);
                values.push(...inValuesArr);
            } else {
                conditions.push(`${column} ${op} $${i++}`);
                values.push(value);
            }
        });

        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    const query = `SELECT ${columnsString} FROM ${table} ${whereClause} ORDER BY ${orderBy}`;
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
        log(`В таблице ${table} нет строк с данными`);
    }

    return rows;
};


//add item to DB
export const addItem = async (table, columns, item) => {
    try {
        //составляем строку с колонками. Поддерживается columns в виде массива или строки
        const columnsString = Array.isArray(columns) ? columns.join(', ') : columns;
        console.log("🚀 ~ addItem ~ item:", item);
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
                // console.log("🚀 ~ valueParams ~ string:", paramIndex);

                return paramIndex;
            })
            .join(", ");
        const addQuery = `INSERT INTO ${table} (${columnsString}) VALUES (${valueParams}) RETURNING *`;

        console.log("🚀 ~ addItem ~ addQuery:", addQuery);
        const addedData = (await pool.query(addQuery, Object.values(item)));
        // console.log("🚀 ~ addItem ~ addedData:", addedData)
        // console.log("!!! SUCCESS !!!");
        return addedData.rows[0];
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

// b) INSERT INTO games_genres (game_id, genre_id)
//     VALUES 
//     ($1, $2), 
//     ($3, $4)

//     INSERT INTO games_genres (game_id, genre_id)
//     VALUES 
//     (1, 2), 
//     (1, 3)
// */

    // INSERT INTO games (name, description, price)
    // VALUES 
    // ('warcraft', 'awesome description', 30), 
    // (1, 3)

//  INSERT INTO $table ($columns)
//     VALUES 
//     (valuesArr[1]), 
    // (valuesArr[2]),
    // ...
    // (valuesArr[n])

    // genreIds.forEach(({ id }) => {
    //             valuesArr.push(gameId);
    //             valuesArr.push(id);
    //         });

//     const addQueryParams = {
//     table: "games",
//     columns: ["name", "description", "price"],
//     rowData: [
//         ['escapefromtarkov', 'awesome description', 30],
//         ['fortnite', 'another awesome description', 30]
//     ],
// };