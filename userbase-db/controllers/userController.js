import express from "express";
const app = express();
import { userbase } from "../storage/userbase.js";
import { body, validationResult } from "express-validator";
import { userFormSchema } from "../constants/userFormSchema.js";
import { getAllUsers, insertUser } from "../db/queries.js";
import pool from "../db/pool.js";


app.use(express.urlencoded({ extended: true }));

//CREATE USER

//GET
export const createUserGet = (req, res) => {
    res.render("create-user", {
        heading: "Создание нового пользователя",
        formData: {
            endpoint: `/create-user`,
            formSchema: userFormSchema
        },
    });
};

//POST
export async function createUserPost(req, res) {
    const errors = validationResult(req);
    const user = req.body;
    
    if (!errors.isEmpty()) {
        return res.render('create-user', {
            heading: 'Ошибка ввода данных',
            formData: {
                endpoint: `/create-user`,
                errorsMap: errors.mapped(),  
                user,
                formSchema: userFormSchema
            }
        })
    }
    await insertUser(user);

    res.redirect('/');
}

//EDIT USER

//GET
export const editUserGet = async (req, res) => {

    const userId = Number(req.params.id);

    if (isNaN(userId)) {
        log('Некорректный ID');
        res.status(404).send('Некорректный ID');
        return;
    }
    const queryResponse = await pool.query(`
        SELECT * FROM usernames
        WHERE id = $1
        `, [userId]);
    
    const user = queryResponse.rows[0];

    if (!user) {
        console.log("Пользователь не найден!");
        res.status(404).send('Пользователь не найден!');
        return;
    }

    res.render("edit-user", {
        heading: `Редактирование пользователя ${user.firstname}`,
        formData: {
            endpoint: `/${user.id}/edit`,
            user, 
            formSchema: userFormSchema
        },
    });
};

//POST
export const editUserPost = async (req, res) => {
    
    const errors = validationResult(req);
    const user = req.body;
    const userId = Number(req.params.id);

    if (!errors.isEmpty()) {
        return res.render('edit-user', {
            heading: 'Ошибка ввода данных',
            formData: {
                endpoint: `/${req.params.id}/edit`,
                errorsMap: errors.mapped(),  
                user, 
                formSchema: userFormSchema
            }
        })
    }
    /* UPDATE table_name
        SET column1 = value1, column2 = value2
        WHERE condition; */ 
    
    const updateParams = Object.entries(req.body).filter(([key, value]) => value.trim() !== '');;

    let updateQuery = `UPDATE usernames SET`;
    const columns = [];
    const values = [];

    updateParams.forEach(([param, value], i) => {
        columns.push(`${param} = $${i + 1}`);
        values.push(value);
    });

    updateQuery += ` ` + columns.join(', ') + ` WHERE id = ${userId}`;

    await pool.query(updateQuery, values);
    log(await getAllUsers());
    log('hello');
    
    res.redirect("/");
};


//DELETE USER

//GET
export const deleteUserGet = async (req, res) => {
    const userId = Number(req.params.id);    
    const deleteQuery = `DELETE FROM usernames
        WHERE id = $1;`
    await pool.query(deleteQuery, [userId]);
    res.redirect('/');
}