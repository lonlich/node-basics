import express from "express";
const app = express();
import { body, validationResult } from "express-validator";
import { gameCardSchema, genreSchema } from "../constants/gameFormSchema.js";
import { addRowToTable, addToTable, deleteFromTable, selectFromTable } from "../db/queries.js";
import pool from "../db/pool.js";
import { tableMap } from "../db/tableMap.js";
import { updateInTable } from "../db/queries.js";


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
        console.log("🚀 ~ addGamePost ~ errors:", errors)
        const formInputData = req.body;
        console.log("🚀 ~ formInputData:", formInputData)
        
        if (!errors.isEmpty()) {
            return res.render('add-game', {
                heading: 'Ошибка ввода данных',
                formData: {
                    endpoint: `add-game`,
                    errorsMap: errors.mapped(),  
                    formInputData,
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
    

        // console.log("🚀 ~ addGamePost ~ gamesTableData:", gamesTableData)

        const gamesTableColumns = Object.keys(gamesTableData).join(', ');
        const gamesTableRowData = Object.values(gamesTableData);
        const addedGameTableData = await addToTable({
            table: 'games',
            columns: gamesTableColumns,
            rowData: gamesTableRowData
        });

        console.log("🚀 ~ addGamePost ~ addedGameTableData:", addedGameTableData);
        
    
        /*
        2. Добавление данных о жанрах игры в связанную таблицу games_genres. Для этого нужно :
        - получить ID игры из таблицы games (добавлено выше) - это будет game_id в таблице games_genres
        */
        const gameId = addedGameTableData[0].id;
            // console.log("🚀 ~ gameId:", gameId)

        
        /*
        - получить ID жанров (по значениям из formInputData.genres) из таблицы genre - это будут genres_id в таблице games_genres
        */
        // log('formInputData.genre', formInputData.genre)

        if (formInputData.genre) {
            const genreIds = await selectFromTable({
                table: 'genres',
                columns: 'id',
                where: { name: { op: 'IN', value: formInputData?.genre } }
            })
            console.log("🚀 ~ addGamePost ~ genreIds:", genreIds)
    
            //- добавить строки с жанрами в таблицу games_genres с полученными ID игры и жанров
            const game_idColumnType  = tableMap.games_genres.find(column => column.columnName === 'game_id').type;
            const gameIdNormalized = normalizeByColumnType(gameId, game_idColumnType)
            console.log("🚀 ~ addGamePost ~ gameIdNormalized:", gameIdNormalized)
            
            const genreIdsNormalized = [];
            const genre_idColumnType  = tableMap.games_genres.find(column => column.columnName === 'genre_id').type;

            genreIds.forEach(({id}) => {
                genreIdsNormalized.push(normalizeByColumnType(id, genre_idColumnType));
            })
            console.log("🚀 ~ genreIds.forEach ~ genreIdsNormalized:", genreIdsNormalized)
            
            const games_genresTableRowData = [];

            genreIds.forEach(({ id }) => {
                games_genresTableRowData.push([gameId, id]);
            });
            
            console.log("🚀 ~ addGamePost ~ values:", games_genresTableRowData)

            const games_genresAddedTableData = await addToTable({
                table: 'games_genres',
                columns: 'game_id, genre_id',
                rowData: games_genresTableRowData
            })
            console.log("🚀 ~ addGamePost ~ games_genresAddedTableData:", games_genresAddedTableData)

            // await addToTable({
            //     table: 'games',
            //     columns: 'name, price',
            //     rowData: ['Chupakabra', 25]
            // })
        } else {
            log('Жанр не указан!');
        }
        
        res.redirect('/games');
    } catch (error) {
        warn(error);
    }
}

//EDIT GAME

//GET
export const editGameGet = async (req, res) => {

    //объект для заполнения данными об игре, который будет передан в шаблон
    let formInputData = {};

    const gameId = Number(req.params.id);

    //получаем базовые данные о редактируемой игре из таблицы games. ПРиходит массив с объектом внутри, поэтому сразу раскрываем его и получаем объект
    const [gameData] = await selectFromTable({
        table: "games",
        where: {
            id: { op: "=", value: gameId },
        },
    });
    // console.log("🚀 ~ editGameGet ~ gamesRow:", gameData);

    //добавляем полученные данные в formInputData
    formInputData = gameData;

    //получаем данные о жанрах редактируемой игры из таблицы games_genres
    const games_genresRows = await selectFromTable({
        table: "games_genres",
        where: {
            game_id: { op: "=", value: gameId },
        },
    });
    // console.log("🚀 ~ editGameGet ~ games_genresRows:", games_genresRows);

    const genreNames = [];
    //Если у игры указаны, жанры получаем name жанров из таблицы genres
    if (games_genresRows.length > 0) {
        const genreRows = await selectFromTable({
            table: "genres",
            where: {
                id: {
                    op: "IN",
                    value: games_genresRows.map(
                        ({ game_id, genre_id }) => genre_id
                    ),
                },
            },
        });
        //console.log("🚀 ~ editGameGet ~ genreRows:", genreRows);

        const genreNames = genreRows.map((row) => row.name);
        //console.log("🚀 ~ editGameGet ~ genreNames:", genreNames);

        //добавляем имена жанров в поле genres в formInputData
        formInputData.genre = genreNames;
    }

    //раскрываем массив game и достаем оттуда объект с игрой (в шаблон передается именно объект)
    //console.log("🚀 ~ editGameGet ~ formInputData:", formInputData)
    

    res.render("edit-game", {
        heading: `Редактирование игры`,
        formData: {
            endpoint: `${gameId}/edit`,
            formInputData,
            formSchema: gameCardSchema,
        },
    });
};

// //POST
export const editGamePost = async (req, res) => {
    
    const gameId = Number(req.params.id);
    
    const errors = validationResult(req);

    //собираем обновленные данные из формы
    const formInputData = req.body;

    console.log("🚀 ~ editGamePost ~ formInputData:", formInputData)

    if (!errors.isEmpty()) {
                    console.log("🚀 ~ editGamePost ~ errors.mapped():", errors.mapped());

            return res.render('edit-game', {
                heading: 'Ошибка ввода данных',
                formData: {
                    endpoint: `${gameId}/edit`,
                    errorsMap: errors.mapped(), 
                    formInputData,
                    formSchema: gameCardSchema,
                }
            })
    }
    

    //по айди берем из базы текущие данные об игре из таблицы games
    const [currentGameData] = await selectFromTable({
        table: 'games',
        where: {
            id: { op: '=', value: gameId }
        }
    });

    console.log("🚀 ~ editGamePost ~ currentGameData:", currentGameData);

    //составляем объект с полями базовой инфы, которую нужно обновить

    const gameDataToUpdate = Object.fromEntries(
        tableMap.games.reduce((acc, { columnName, type }) => {
            const normalizedInputValue = normalizeByColumnType(formInputData[columnName], type);
            if (normalizedInputValue !== currentGameData[columnName]) {
                console.log('🚀 ~ columnName:', columnName);
                // console.log("🚀 ~ typeof currentGameData[columnName]:", typeof currentGameData[columnName])
                console.log('🚀 ~ typeof normalizedInputValue:', typeof normalizedInputValue);
                console.log('🚀 ~ currentGameData[columnName]:', currentGameData[columnName]);
                console.log('🚀 ~ formInputData[columnName]:', formInputData[columnName]);
                console.log('🚀 ~ typeof formInputData[columnName]:', typeof formInputData[columnName]);
                // const normalizedInputValue = normalizeByColumnType(formInputData[columnName], type);
                acc.push([columnName, normalizedInputValue]);
            }
            console.log('🚀 ~ editGamePost ~ acc:', acc);
            return acc;
        }, [])
    );
    console.log('🚀 ~ editGamePost ~ gameDataToUpdate:', gameDataToUpdate);

    //обновляем данные в таблице games, если есть что обновлять
    if (Object.entries(gameDataToUpdate).length > 0) {
        const updatedGameData = await updateInTable({
            table: 'games',
            set: gameDataToUpdate,
            where: {
                id: { op: '=', value: gameId },
            },
        });
        console.log('🚀 ~ editGamePost ~ updatedGameData:', updatedGameData);
    }

    //по айди берем из базы текущие данные о жанре игры из таблицы games_genres
    const currentGenreIdsRows =  await selectFromTable({
        table: 'games_genres',
        columns: ['genre_id'],
        where: {
            game_id: { op: '=', value: gameId}
        }
    })
    console.log("🚀 ~ editGamePost ~ currentGenreIdsRows:", currentGenreIdsRows);

    const currentGenreIdsSet = new Set(currentGenreIdsRows.map(r => r.genre_id));
    console.log("🚀 ~ editGamePost ~ currentGenreIdsSet:", currentGenreIdsSet)

    const newGenreNames = formInputData.genre;

    const newGenreIdsRows = await selectFromTable({
        table: 'genres',
        columns: ['id'],
        where: {
            name: { op: 'IN', value: newGenreNames}
        }
    });
    // console.log("🚀 ~ editGamePost ~ newGenreIdsRows:", newGenreIdsRows);

    const newGenreIdsSet = new Set(newGenreIdsRows.map(r => r.id));
    // console.log("🚀 ~ editGamePost ~ newGenreIdsSet:", newGenreIdsSet)

    //сравниваем данные из формы с текущими данными. Если значение отличается - сохраняем имя поля и значение в новый объект - для добавления или удаления
    const genreIdsToInsert = [...newGenreIdsSet].filter(id => !currentGenreIdsSet.has(id));
    // console.log("🚀 ~ editGamePost ~ genreIdsToInsert:", genreIdsToInsert);

    const genreIdsToDelete = [...currentGenreIdsSet].filter(id => !newGenreIdsSet.has(id));
    // console.log("🚀 ~ editGamePost ~ genreIdsToDelete:", genreIdsToDelete)

    //добавляем новые жанры, которым поставили галку
    if (genreIdsToInsert.length > 0) {
        const addedGenres = await addToTable({
            table: 'games_genres',
            columns: ['game_id', 'genre_id'],
            rowData: genreIdsToInsert.map(genreId => [gameId, genreId]),
        });
        // console.log("🚀 ~ editGamePost ~ addedGenres:", addedGenres)
    }
    
    //удаляем жанры, с которых сняли галку
    if (genreIdsToDelete.length > 0) {
        const deletedGenres = await deleteFromTable({
            table: "games_genres",
            where: {
                game_id: { op: "=", value: gameId },
                genre_id: { op: "IN", value: genreIdsToDelete },
            },
            returning: "*",
        });
    }

    res.redirect("/games");
};


//DELETE GAME

//GET
export const deleteGameGet = async (req, res) => {
    
    const gameId = Number(req.params.id);    

    const deletedGame = await deleteFromTable({
        table: 'games',
        where: {
            id: { op: '=', value: gameId},
        },
        returning: '*',
    
    });

    console.log("🚀 ~ deleteGameGet ~ deletedGame:", deletedGame);

    res.redirect('/games');
}

/* UTILS */
function normalizeByColumnType(value, type) {
    if ( type === "integer" || type === 'numeric') {
        if (value === "") return null;
        //если пустая строка, в numeric/integer колонку записываем null
        const num = Number(value);
        //валидация на переданное число
        return isNaN(num) ? null : num;
    }
    return value;
}