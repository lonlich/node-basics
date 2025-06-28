#! /usr/bin/env node

//КАК ЗАПУСКАТЬ: node db/populatedb.js имя_базы имя_таблицы

import dotenv from "dotenv";
dotenv.config();
import { Client } from "pg";

const dbName = process.argv[2];
const tableName = process.argv[3];

// Простое регулярное выражение для проверки допустимых SQL идентификаторов
const isValidIdentifier = (name) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

if (!dbName || !tableName) {
    console.error("Usage: node db/populatedb.js <dbName> <tableName>");
    process.exit(1);
}

if (!isValidIdentifier(dbName) || !isValidIdentifier(tableName)) {
    console.error(
        "❌ Invalid database or table name. Only letters, numbers, and underscores allowed (must not start with number)."
    );
    process.exit(1);
}


const DROP_SQL = `DROP TABLE IF EXISTS ${tableName};`;

const CREATE_SQL = `
CREATE TABLE ${tableName} (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255)
);
`;

const INSERT_SQL = `
INSERT INTO ${tableName} (username)
VALUES
    ('Bryan'),
    ('Odin'),
    ('Damon');
`;

async function main() {
    try {
        console.log(`Seeding database "${dbName}", table "${tableName}"...`);
        const client = new Client({
            connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        });

        await client.connect();
        await client.query(DROP_SQL);
        await client.query(CREATE_SQL);
        await client.query(INSERT_SQL);
        await client.end();
        console.log("✅ Done");
    } catch (error) {
        console.error("❌ Error occurred:", error.message);
        process.exit(1);
    }
}

main();
