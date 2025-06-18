const users = [];

const addUser = (user) => users.push(user);

const getUsers = () => users;

const findUser = (userId) => users.find((user) => user.id === userId);

const updateUser = ({ props }) => {
    
    const updatedUser = findUser(props.id);
    
    if (!updatedUser) {
        return console.log(`Пользователь с id ${values.id} не найден`);
    }
    
    for (const prop in props) {
        console.log(prop);
        updatedUser[prop] = props[prop];
    }
    // updatedUser.firstname = values.firstname;
    // updatedUser.lastname = values.lastname;
};

export const userbase = { addUser, getUsers, findUser, updateUser };

//TODO: переделать в объект values
