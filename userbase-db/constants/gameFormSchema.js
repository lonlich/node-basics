

export const genreSchema = {
    rpg: { label: "RPG" },
    rts: { label: "RTS" },
    action: { label: "Action" },
};

export const gameSchema = {
    warcraft: { label: "Warcraft" },
    cyberpunk: { label: "Cyberpunk 2077" },
    csgo: { label: "Counter-Strike: Global Offensive" },
};

//определяет, какие поля выводятся в карточке игры. Позволяет выводить не все поля из базы, а только нужные
export const gameCardSchema = {
    id: { label: "ID игры", type: "text", visibleInForm: false },
    name: { label: "Название", type: "text" },
    description: { label: "Описание", type: "text" },
    price: { label: "Цена", type: "number" },
    created_at: { label: "Добавлено", type: "text", visibleInForm: false },
    genre: { label: "Жанр", type: "checkbox", isMultiple: true, options: genreSchema },
};

/*
[ { game_id: 1, genre_id: 2 }, { game_id: 1, genre_id: 3 } ]   
*/