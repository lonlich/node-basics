import { body } from 'express-validator';
import validator from 'validator';
const { escape } = validator; 

export const validateAddedComment = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Комментарий не может быть пустым')
        .isLength({ min: 2, max: 500 })
        .withMessage('Комментарий должен быть от 2 до 500 символов')
        .customSanitizer(value => {
            console.log('в санитайзере')
            // Экранируем HTML-специальные символы
            return escape(value);
        })
];
