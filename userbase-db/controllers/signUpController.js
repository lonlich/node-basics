import express from "express";
const app = express();
import { body, validationResult } from "express-validator";
import { addRowToTable, addToTable, deleteFromTable, selectFromTable, updateInTable } from "../db/queries.js";
import pool from "../db/pool.js";

export const signUpGet = (req, res) => {
    res.render('sign-up');
}

export const signUpPost = async (req, res, next) => {
    try {
        // log(req.body);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        //console.log("🚀 ~ app.post ~ hashedPassword:", hashedPassword);

        await addToTable({
            table: 'users',
            columns: 'username, password',
            rowData: [req.body.username, hashedPassword],
        });
        // log('Пользователь добавлен в бд')
        res.redirect('/')
    } catch (error) {
        return next(err);
    }
}