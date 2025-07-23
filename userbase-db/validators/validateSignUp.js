// import express from "express";
// const app = express();

import { body, validationResult } from 'express-validator';
import { selectFromTable } from '../db/queries.js';

export const validateSignUp = [
    body('username')
        .trim()
        //.escape() - лучше экранировать на выводе (ejs делает это через <%= %>, в html использовать textContent), т.к. если делать это здесь, то в базу будет записываться username с экранированными символами (измененными)
        .stripLow()
        .blacklist('<>"\'%;)(&+)')
        .notEmpty()
        .withMessage('Поле обязательно')
        .isLength({ min: 2, max: 15 })
        .withMessage('Длина от 2 до 15 символов')
        .matches(/^[a-zA-Z0-9_\-]+$/)
        .withMessage('Допустимы буквы, цифры, дефис и подчёркивания')
        //проверка на уникальность никнейма
        .custom(async (value) => {
            const userFound = await selectFromTable({
                table: 'users',
                columns: 'username',
                where: {
                    username: { op: '=', value }
                }
            })

            // console.log("🚀 ~ .custom ~ userFound:", userFound);

            if (userFound.length > 0) {
                throw new Error('Логин занят!');
            }

        }),

    body('password')
        .isLength({ min: 8, max: 16 })
        .withMessage('Длина пароля должна быть от 8 до 16 символов')
        .matches(/^[a-zA-Z0-9\-_\!@#$%^&*()+=\[\]{}|;:'",.<>?\/]+$/)
        .withMessage('Пароль содержит недопустимые символы')
        .matches(/[a-zA-Z]/)
        .withMessage('Пароль должен содержать хотя бы одну букву')
        .matches(/\d/)
        .withMessage('Пароль должен содержать хотя бы одну цифру'),

    body('repeat_password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли не совпадают!')
            }
            return true;
        })
];
