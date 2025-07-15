import pool from "./pool.js";
import { normalizeUser } from "./normalizeUser.js";

//select rows from table
export const selectFromTable = async ({
    table,
    columns = "*", // можно передавать массив с названиями колонок или просто строку
    where, // { fieldName: { op: "IN", value: ["rpg", "rts"] }, 
    orderBy = "",
}) => {
    if (!table) {
        warn("Не указано имя целевой таблицы в selectRows");
        return;
    }
    //составляем строку с колонками. Поддерживается columns в виде массива или строки
    const columnsString = Array.isArray(columns) ? columns.join(", ") : columns;

    //составляем строку с условиями (если они переданы)
    let whereClause = "";
    const queryValues = [];

    if (where) {
        // console.log("🚀 ~ where:", where)
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
                queryValues.push(...inValuesArr);
            } else {
                conditions.push(`${column} ${op} $${i++}`);
                queryValues.push(value);
            }
        });

        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
    const query = `SELECT ${columnsString} FROM ${table} ${whereClause} ${orderByClause}`;
    // console.log("🚀 ~ query:", query)
    const { rows } = await pool.query(query, queryValues);

    // console.log("🚀 ~ rows:", rows)
    if (rows.length === 0) {
        log(`В таблице ${table} нет строк с данными`);
    }

    return rows;
};


//add data to table
export const addToTable = async ({ table, columns, rowData }) => {
    try {
        // console.log("🚀 rowData:", rowData);
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

//update in table
export const updateInTable = async ({ table, set, where }) => {

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

//кастомная версия addToTable для добавления одной строки. Значения в виде [массив значений строки] оборачиваются в еще один массив (для соответствия формату значения addToTable - массив массивов значений) и вызывают addToTable
export const addRowToTable = (addQueryParams) => {
    return addToTable({
        ...addQueryParams,
        rowData: [addQueryParams.rowData]
    });
}

//DELETE FROM TABLE
export const deleteFromTable = async ({
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
        // console.log("🚀 ~ where:", where)
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
                queryValues.push(...inValuesArr);
            } else {
                conditions.push(`${column} ${op} $${i++}`);
                queryValues.push(value);
            }
                
        });

        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    // console.log("🚀 ~ Object.entries ~ queryValues:", queryValues)
    const returningClause = returning ? `RETURNING ${returning}` : '';
    const query = `DELETE FROM ${table} ${whereClause} ${returningClause}`;
    // console.log("🚀 ~ query:", query)
    const { rows } = await pool.query(query, queryValues);

    // console.log("🚀 ~ rows:", rows)
    if (rows.length === 0) {
        log(`В таблице ${table} ничего не удалено`);
    }

    return rows;
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