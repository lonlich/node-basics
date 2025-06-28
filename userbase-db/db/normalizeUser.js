export const normalizeUser = (user) => ({
    firstname: user.firstname || null,
    lastname: user.lastname || null,
    email: user.email || null,
    age: user.age === '' ? null : Number(user.age)
})