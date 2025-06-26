const users = [
    {
        id: 1,
        firstname: 'MIKHAIL',
        lastname: 'ORENKIN',
        email: 'navi-lonely@mail.ru'
    },
    {
        id: 2,
        firstname: 'MIKHAIL',
        lastname: 'Pupkin',
        email: 'vasya@mail.ru'
    }
];

export const userbase = {
    
    addUser(user) {
        users.push(user);
    },

    getUsers() {
        return users;
    },

    findUser(userId) {
        return users.find((user) => user.id === Number(userId));
    },

    updateUser({ props }) {
        const updatedUser = this.findUser(props.id);

        if (!updatedUser) {
            console.log(`Пользователь с id ${props.id} не найден`);
            return;
        }

        for (const prop in props.formData) {
            updatedUser[prop] = props.formData[prop];
        }
    },

    deleteUser(userId) {
        //находим индекс пользователя, которого надо удалить
        const index = users.findIndex(user => user.id === userId)
        console.log(index);

        //findIndex возвращает -1, если индекс не найден. Если передать -1 в splice, он удалит последний элемент (!)
        if (index === -1) {
            return console.log(`Пользователь с id ${userId} не найден!`); 
        }
        users.splice(index, 1);
        console.log(`Удалил пользователя с id ${userId}`);

    },
};
