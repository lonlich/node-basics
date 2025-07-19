import { selectFromTable } from "./queries.js";

//подгружает текущего юзера из базы по id из сессии
export const loadCurrentUser = async (req, res, next) => {
    try {
        //проверка - залогинен ли пользователь и есть ли у него активная сессия (не истекла/устарела)
        if (!req.user) return next();
        
        const [user] = await selectFromTable({
                table: 'users',
                where: {
                    id: { op: '=', value: req.user.id }
                }
            })
        
        //записываем юзера в req.user и пробрасываем дальше по запросу
        req.user = user;
        // console.log("🚀 ~ getCurrentUser ~ user:", user);

        next();
    } catch (error) {
        console.warn(error);
    }
}