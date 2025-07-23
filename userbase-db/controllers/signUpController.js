import express from "express";
const app = express();
import { body, validationResult } from "express-validator";
import { addRowToTable, addToTable, deleteFromTable, selectFromTable, updateInTable } from "../db/queries.js";
import pool from "../db/pool.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export const signUpGet = (req, res) => {
    res.render('sign-up', {
        endpoint: '/signup'
    });
}

export const signUpPost = async (req, res, next) => {
    try {

        const errors = validationResult(req);

        const errorsArr = errors.array();

        // console.log("🚀 ~ signUpPost ~ req,body:", req.body);
        
        // console.log("🚀 ~ signUpPost ~ req.body.repeat_password:", req.body.repeat_password);

            // console.log("🚀 ~ signUpPost ~ req.body.password:", req.body.password);

        // console.log("🚀 ~ signUpPost ~ errors:", errors);

        // console.log("🚀 ~ signUpPost ~ errors.mapped():", errors.mapped());

        // if (req.body.password !== req.body.repeat_password) {

        //     errorsArr.push({
        //         type: 'custom',
        //         msg: 'пароли не совпадают!', 
        //         path: 'repeat_password',
        //         location: 'body',

        //     })
        // }
        // let errorsMap = {};
        
        // errorsArr.forEach(error => {
        //     errorsMap[error.path] = error;
        // });

        // console.log("🚀 ~ signUpPost ~ errorsMap:", errorsMap);

        // console.log("🚀 ~ signUpPost ~ errorsArr:", errorsArr);

        if (!errors.isEmpty()) {
                return res.render('sign-up', {
                        endpoint: `/signup`,
                        errorsMap: errors.mapped(),
                })
            }

        // log(req.body);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        //console.log("🚀 ~ app.post ~ hashedPassword:", hashedPassword);

        const [signedUpUser] = await addToTable({
            table: 'users',
            columns: 'username, password',
            rowData: [req.body.username, hashedPassword],
        });

        // console.log("🚀 ~ signUpPost ~ signedUpUser:", signedUpUser);

        // log('Пользователь добавлен в бд')

        //автологин после регистрации. Передаем в login только id, т.к. passport этого достаточно. Весь объект signedUpUser передавать не нужно (там есть хеш пароля)
        req.login({ id: signedUpUser.id }, (err) => {
            if (err) return next(err);
            return res.redirect('/clubhouse');
        }) 
        
    } catch (error) {
        return next(error);
    }
}