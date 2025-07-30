import pool from "./pool.js";

//get all usernames
export const getAllUsernames = async () => {
    const { rows } = await pool.query('SELECT * FROM usernames');
    return rows;
}

//insert username
export const insertUsername = async (username) => {
    await pool.query('INSERT INTO usernames (username) VALUES ($1)', [username])
}