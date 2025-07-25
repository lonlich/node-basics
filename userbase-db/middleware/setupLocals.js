import { addCommentFormSchema } from "../constants/addCommentFormSchema.js";
import { gameCardSchema } from "../constants/gameFormSchema.js";
import { loginFormSchema } from "../constants/loginFormSchema.js";
import { signUpFormSchema } from "../constants/signUpFormSchema.js";
import { userFormSchema } from "../constants/userFormSchema.js";

export function setupLocals(req, res, next) {
    // res.locals.username = req.query.username || 'Гость';
    res.locals.theme = 'dark';
    res.locals.lang = req.query.lang || 'ru';

    //page settings
    res.locals.title = req.path || 'Какой-то тайтл';

    //footer
    res.locals.links = [
        { href: '/', text: 'Главная'},
        { href: '/about', text: 'Абаут'},
        { href: '/users', text: 'Юзвери'},
        { href: '/comment-form', text: 'Оставить камент'}
    ]

    //user-form
    res.locals.userFormSchema = userFormSchema;
    
    //game-form
    res.locals.gameFieldSchema = gameCardSchema;
    
    //signup-form
    res.locals.signUpFormSchema = signUpFormSchema;

    //login-form
    res.locals.loginFormSchema = loginFormSchema;

    //add-comment-form
    res.locals.addCommentFormSchema = addCommentFormSchema;

    res.locals.user = req.user || {}; //защита от undefined - если юзер не залогинен, то req.user будет undefined и будет создан пустой объект (все проверки с ним будут проходить)

    res.locals.isAuthenticated = !!req.user; //если юзер не залогинен, первое отрицание будет true (т.к. req.user undefined), второе - false. Поэтому результат: НЕ авторизован

    res.locals.errorsMap = {};

    next();
}