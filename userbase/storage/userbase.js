const users = [];

const addUser = (user) => users.push(user);

const getUsers = () => users;

const findUser = (userId) => users.find(user => user.id === userId);

const updateUser = ( id, firstname, lastname ) => {
    // console.log(values);
    // const updatedUser = findUser(values.id);
    // updatedUser.firstname = values.firstname;
    // updatedUser.lastname = values.lastname;
    console.log('user list: ', userbase.getUsers());
    console.log('updatedUser: ', findUser(id));
    const updatedUser = findUser(id);
    updatedUser.firstname = firstname;
    updatedUser.lastname = lastname;
}

export const userbase = { addUser, getUsers, findUser, updateUser };
