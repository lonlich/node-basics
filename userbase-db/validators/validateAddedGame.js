import { body, validationResult } from 'express-validator';

export const validateAddedGame = [
    body('name')
        .trim()
        .escape()
        .stripLow()
        .blacklist('<>"\'%;)(&+)')
        .notEmpty()
        .withMessage('Поле обязательно')
        .isLength({ min: 1, max: 15 })
        .withMessage('Длина от 1 до 50 символов')
        .matches(/^[a-zA-Z0-9_\-а-яА-ЯёЁ\s]+$/)
        .withMessage('Допустимы буквы, цифры, пробелы, дефис и подчёркивания'),

    body('description')
        .trim()
        .escape()
        .stripLow()
        .blacklist('<>"\'%;)(&+)') // удаляет указанные символы. Применять только для Имя, заголовок, простой текст
        .optional({ values: 'falsy' })
        .isLength({ min: 2, max: 3000 })
        .withMessage('Длина от 2 до 3000 символов')
        .matches(/^[a-zA-Z0-9_\-а-яА-ЯёЁ\s]+$/)
        .withMessage('Допустимы буквы, цифры, пробелы, дефис и подчёркивания'),

    validateNumericField('price', {
        allowEmpty: true,
        min: 0,
        maxDigits: 8,
        decimalPlaces: 2,
    }),
];

/**
 * Универсальная функция валидации числового поля.
 *
 * @param {string} fieldName - Название поля (например, 'price').
 * @param {object} options - Настройки валидации.
 * @param {boolean} options.allowEmpty - Разрешить ли пустое значение (true по умолчанию).
 * @param {number} options.min - Минимально допустимое значение (по умолчанию 0).
 * @param {number} options.maxDigits - Максимум цифр до точки (по умолчанию 8).
 * @param {number} options.decimalPlaces - Количество цифр после точки (по умолчанию 2).
 *
 * @returns {ValidationChain} - Возвращает цепочку правил валидации для express-validator.
 */
function validateNumericField(fieldName, { allowEmpty = true, min = 0, maxDigits = 8, decimalPlaces = 2 } = {}) {
    return (
        body(fieldName)
            // Если allowEmpty = true, то поле необязательное, игнорируем falsy значения ('' или null)
            .optional({ checkFalsy: allowEmpty })
            .trim() // убираем пробелы по краям
            .blacklist(' ') // убираем пробелы внутри
            // Проверка, что значение является числом с минимальным порогом min
            .isFloat({ min })
            .withMessage(`${fieldName} должно быть числом не меньше ${min}`)

            // Дополнительная кастомная проверка формата (длина до и после точки)
            .custom((value) => {
                // Если значение пустое (и allowEmpty = true), проверка пройдена
                if (!value) return true;

                // Создаём RegExp: \d{1,maxDigits}(. \d{1,decimalPlaces})?
                // Пример для maxDigits=8, decimalPlaces=2: ^\d{1,8}(\.\d{1,2})?$
                const regex = new RegExp(`^\\d{1,${maxDigits}}(\\.\\d{1,${decimalPlaces}})?$`);

                // Если не совпало с паттерном - выбрасываем ошибку
                if (!regex.test(value)) {
                    throw new Error(`${fieldName} должно содержать максимум ${maxDigits} цифр до запятой и ${decimalPlaces} после`);
                }

                return true; // Всё ок
            })
            .toFloat() // приведение к числу
    );
}
