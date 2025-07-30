export function setupLocals(req, res, next) {
    res.locals.username = req.query.username || 'Гость';
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
    next();
}