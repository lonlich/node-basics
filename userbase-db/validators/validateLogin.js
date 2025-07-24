// проверяем только то что поля не пустые и что не шлется мусор

import { body, validationResult } from 'express-validator';
import { selectFromTable } from '../db/queries.js';

export const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Имя пользователя обязательно')
        .isLength({ max: 50 })
        .withMessage('Слишком длинное имя пользователя')
        .custom(value => {
            // console.log('Юзернейм валидирован при логине');
            return true;
        })
        ,

    body('password')
        .notEmpty().withMessage('Пароль обязателен')
        .custom(value => {
            // console.log('Пароль валидирован при логине');
            return true;
        }),

];
