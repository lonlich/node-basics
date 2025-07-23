import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Pool } from "pg";
import pool from "../db/pool.js";
import bcrypt from "bcryptjs";

const setupLocalStrategy = () => {
    return new LocalStrategy(async (username, password, done) => {
        try {
            // log('в localstrategy')
            //ищем пользователя с переданными username и password в бд
            const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = rows[0];

            console.log("🚀 ~ newLocalStrategy ~ user:", user);
            
            //если не нашли, выводим сообщение
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }

            const match = await bcrypt.compare(password, user.password);
            
            if (!match) {
                // passwords do not match!
                return done(null, false, { message: 'Incorrect password' });
            }
            //если юзер найден и пароль правильный, передаем дальше объект user, полученный из бд, в serializeUser
            // log('Пароль правильный, юзер найден')
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
}

export const configurePassport = (passport) => {
    //проверка введенных логина и пароля 
    passport.use(setupLocalStrategy());
    
    //берем из user только id, чтобы не передавать в сессию весь объект (небезопасно хранить все данные о пользователе там - хеш пароля, имейл итд. Также объект может быть большим -> расходует память сервера). Затем этот id передается в сессию: req.session.passport = { user: user.id }
    /*
    serializeUser вызывается только ОДИН РАЗ при логине → кладёт user.id (или другое) в сессию.
    */
    passport.serializeUser((user, done) => {
        // console.log("🚀 ~ passport.serializeUser ~ user:", user);
    
        done(null, user.id);
    });
    
    /*user.id сохраняется в Session store на сервере. Там же автоматически создается Session ID: 
    Session store:
        {
            id: "abc123",
            passport: { user: 42 }
        }
    */
    
    /*В ответе клиенту отправляется кука с Session ID:  Set-Cookie: connect.sid=abc123. Она хранится в браузере. Для каждой сессии создается своя кука - позволяет разлогинивать разные устройства.
    */
    
    //deserializeUser видит в сессии переданный user.id и кладет его в req.user.id. Затем по этому id можно доставать актуального юзера из базы в контроллерах
    /*
    deserializeUser вызывается при КАЖДОМ новом HTTP-запросе, если у пользователя есть активная сессия
    */
    passport.deserializeUser(async (id, done) => {
        try {
            //получаем юзера со свежими данными. Сейчас выполняется для КАЖДОГО запроса. Если в будущем это будет не оптимально, лучше использовать middleware loadCurrentUser из db/utils
            const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            const user = rows[0];
    
            // console.log("🚀 ~ passport.deserializeUser ~ user:", user);
    
            //передает user в req.user, который доступен дальше в запросе
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}