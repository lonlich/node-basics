const users = [];

const addUser = (user) => users.push(user);

const getUsers = () => users;

const findUser = (userId) => users.find((user) => user.id === userId);

const updateUser = ({ id, firstname, lastname }) => {
    const updatedUser = findUser(id);
    updatedUser.firstname = firstname;
    updatedUser.lastname = lastname;
};

export const userbase = { addUser, getUsers, findUser, updateUser };

//TODO: переделать в объект values
