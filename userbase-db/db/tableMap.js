//список колонок в каждой таблице. Используется для вставки айтемов в таблицы с данными из формы (addItem, где-то еще?)
export const tableMap = {
    games: [
        { columnName: "name", type: "text" },
        { columnName: "description", type: "text" },
        { columnName: "price", type: "numeric" },
    ],
    games_genres: ["game_id", "genre_id"],
};

// formData: {
//   name: 'ddfdf',
//   description: 'dfdf',
//   price: '33',
//   genre: [ 'rpg', 'rts' ]
// }

// INSERT INTO games_genres (game_id, genre_id) VALUES
// (1, 2),
// (1, 3);
