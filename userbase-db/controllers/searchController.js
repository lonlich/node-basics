import express from "express";
const app = express();
import { userbase } from "../storage/userbase.js";
import { userFormSchema } from "../constants/userFormSchema.js";
import pool from "../db/pool.js";
import { getAllUsers, insertUser } from "../db/queries.js";


//GET
export const searchControllerGet = async(req, res) => {

    try {
        //определяем, какие поля были заполнены в форме поиска
        const searchParams = Object.entries(req.query).filter(([key, value]) => value.trim() !== '');
    
        /* ФОРМАТ: pool.query('SELECT * FROM usernames 
            WHERE param_name ILIKE '%$1%', values)
        */
    
        let searchQuery = `SELECT * FROM usernames`;
        const conditions = [];
        const values = [];
    
        searchParams.forEach(([key, val], i) => {
            conditions.push(`${key} ILIKE $${i + 1}`);
            values.push(`%${val}%`);
        });
    
        searchQuery += ` WHERE ` + conditions.join(' AND ');
        const searchQueryResponse = await pool.query(searchQuery, values);
    
        res.render('index', { 
            users: await getAllUsers(), 
            formSchema: userFormSchema,
            searchQueryResponse: searchQueryResponse.rows.length > 0 ? searchQueryResponse.rows : 'Пользователи не найдены', 
        });
    } catch (error) {
        console.error('❌ Ошибка при выполнении запроса:', error.message);
        res.status(500).send('Ошибка сервера при поиске пользователей');
    }
};

//TODO: abstract away query composition