import express from "express";
const app = express();
import { body, validationResult } from "express-validator";
import { gameCardSchema, genreSchema } from "../constants/gameFormSchema.js";
import { selectRows, insertUser, addItem } from "../db/queries.js";
import pool from "../db/pool.js";
import { tableMap } from "../db/tableMap.js";


app.use(express.urlencoded({ extended: true }));

//ADD GAME

//GET
export const addGameGet = (req, res) => {
    res.render("add-game", {
        heading: "Добавление игры",
        formData: {
            heading: 'Добавление игры',
            endpoint: `add-game`,
            formSchema: gameCardSchema
        },
    });
};
/* 
1. В схеме ставим флаг isMultiple
2. В шаблоне проверяем - если есть флаг isMultiple - отрисовываем множественный выбор с инпутами у которых свойства взяты из схемы
3. В req.body принимаем значения из поля
*/
//POST
export async function addGamePost(req, res) {

    try {
        const errors = validationResult(req);
        const formInputData = req.body;
        console.log("🚀 ~ formInputData:", formInputData)
        
        if (!errors.isEmpty()) {
            return res.render('add-game', {
                heading: 'Ошибка ввода данных',
                formData: {
                    endpoint: `add-game`,
                    errorsMap: errors.mapped(),  
                    game,
                    formSchema: gameCardSchema,
                    genreSchema,
                }
            })
        }
    
        /*
        Данные из formInputData нужно добавить в разные таблицы:
        1. Таблица games - поля добавляются напрямую в соответствии с колонками из tableMap. Распарсим объект formInputData, чтобы получить список полей, соответствующих таблице games:
        */
        
        const gamesTableData = {};
    
        tableMap.games.forEach(({columnName, type}) => {
            if (columnName in formInputData) {
                const value = formInputData[columnName];
                gamesTableData[columnName] = normalizeByColumnType(value, type);
            } else {
                warn(`Колонка ${columnName} не найдена в formInputData`)
            }
        });
    
        // console.log("🚀 ~ addGamePost ~ gamesTableData:", gamesTableData);
        // console.log(`\n🚀 ~ gamesTableData:\n${JSON.stringify(gamesTableData, null, 2)}\n`);
        const gamesTableColumns = Object.keys(gamesTableData).join(', ');
        // console.log("🚀 ~ addGamePost ~ gamesTableColumns:", gamesTableColumns)
        await addItem('games', gamesTableColumns, gamesTableData);
        
    
        /*
        2. Добавление данных о жанрах игры в связанную таблицу games_genres. Для этого нужно :
        - получить ID игры из таблицы games (добавлено выше) - это будет game_id в таблице games_genres
        - получить ID жанров (по значениям из formInputData.genres) из таблицы genre - это будут genres_id в таблице games_genres
        - добавить строки с жанрами в таблицу games_genres с полученными ID игры и жанров
        */
        res.redirect('/games');
    } catch (error) {
        warn(error);
    }
}

/* 
1.Добавить жанры к игре
a) SELECT id FROM genres
WHERE name IN ('$1', '$2')
AND id LIKE ('$3', '$4')
ORDER BY id ASC

('$1', '$2') <=> values = ['rpg', 'rts']
pool.query(query, values)




SELECT id, name from $table
WHERE name =/LIKE/> $1
('$1') <=> value = ['rpg']

*/

//EDIT USER

//GET
// export const editUserGet = async (req, res) => {

//     const userId = Number(req.params.id);

//     if (isNaN(userId)) {
//         log('Некорректный ID');
//         res.status(404).send('Некорректный ID');
//         return;
//     }
//     const queryResponse = await pool.query(`
//         SELECT * FROM usernames
//         WHERE id = $1
//         `, [userId]);
    
//     const user = queryResponse.rows[0];

//     if (!user) {
//         console.log("Пользователь не найден!");
//         res.status(404).send('Пользователь не найден!');
//         return;
//     }

//     res.render("edit-user", {
//         heading: `Редактирование пользователя ${user.firstname}`,
//         formInputData: {
//             endpoint: `/${user.id}/edit`,
//             user, 
//             formSchema: gameCardSchema
//         },
//     });
// };

// //POST
// export const editUserPost = async (req, res) => {
    
//     const errors = validationResult(req);
//     const user = req.body;
//     const userId = Number(req.params.id);

//     if (!errors.isEmpty()) {
//         return res.render('edit-user', {
//             heading: 'Ошибка ввода данных',
//             formInputData: {
//                 endpoint: `/${req.params.id}/edit`,
//                 errorsMap: errors.mapped(),  
//                 user, 
//                 formSchema: gameCardSchema
//             }
//         })
//     }
//     /* UPDATE table_name
//         SET column1 = value1, column2 = value2
//         WHERE condition; */ 
    
//     const updateParams = Object.entries(req.body).filter(([key, value]) => value.trim() !== '');;

//     let updateQuery = `UPDATE usernames SET`;
//     const columns = [];
//     const values = [];

//     updateParams.forEach(([param, value], i) => {
//         columns.push(`${param} = $${i + 1}`);
//         values.push(value);
//     });

//     updateQuery += ` ` + columns.join(', ') + ` WHERE id = ${userId}`;

//     await pool.query(updateQuery, values);
//     log(await selectRows('usernames'));
//     log('hello');
    
//     res.redirect("/");
// };


// //DELETE USER

// //GET
// export const deleteUserGet = async (req, res) => {
//     const userId = Number(req.params.id);    
//     const deleteQuery = `DELETE FROM usernames
//         WHERE id = $1;`
//     await pool.query(deleteQuery, [userId]);
//     res.redirect('/');
// }

/* UTILS */
function normalizeByColumnType(value, type) {
    if (type === "numeric" || type === "int") {
        if (value === "") return null;
        //если пустая строка, в numeric колонку записываем null
        const num = Number(value);
        //валидация на переданное число
        return isNaN(num) ? null : num;
    }
    return value;
}