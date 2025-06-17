import { body, validationResult } from "express-validator";

export const validateUpdatedUser = [
    body("firstname")
        .trim()
        .escape()
        .stripLow()
        .blacklist("<>\"'%;)(&+)")
        .notEmpty()
        .withMessage("Поле обязательно")
        .isLength({ min: 2, max: 15 })
        .withMessage("Длина от 2 до 50 символов")
        .matches(/^[a-zA-Z0-9_\-а-яА-ЯёЁ\s]+$/)
        .withMessage("Допустимы буквы, цифры, пробелы, дефис и подчёркивания"),
    
    body('lastname')
        .trim()
        .escape()
        .stripLow()
        .blacklist('<>"\'%;)(&+)') // удаляет указанные символы. Применять только для Имя, заголовок, простой текст
        .optional({ values: "falsy" })
        .isLength({ min: 2, max: 50 }).withMessage('Длина от 2 до 50 символов')
        .matches(/^[a-zA-Z0-9_\-а-яА-ЯёЁ\s]+$/).withMessage('Допустимы буквы, цифры, пробелы, дефис и подчёркивания')
];

