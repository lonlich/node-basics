import pool from "./pool.js";
import { normalizeUser } from "./normalizeUser.js";

//get all usernames
export const getAllUsers = async () => {
    const { rows } = await pool.query(`
        SELECT * FROM usernames
        ORDER BY id ASC
        `);
    return rows;
}

//insert username
export const insertUser = async (user) => {
    const normalizedUser = normalizeUser(user);
    await pool.query('INSERT INTO usernames (firstname, lastname, email, age) VALUES ($1, $2, $3, $4)', Object.values(normalizedUser));
}