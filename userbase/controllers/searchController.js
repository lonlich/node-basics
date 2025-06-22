import express from "express";
const app = express();
import { userbase } from "../storage/userbase.js";
import { userFormSchema } from "../constants/userFormSchema.js";

//GET
export const searchController = (req, res) => {
    
    //получаем массив всех юзеров из базы
    const users = userbase.getUsers();

    //определяем, какие поля были заполнены в форме поиска
    // const searchParams = Object.keys(req.query).filter(param => req.query[param].trim() !== '');
    const searchParams = Object.entries(req.query).filter(([key, value]) => value.trim() !== '');


    //факт найденного пользователя определяется так: значение каждого параметра (req.query.param), заполенного в форме поиска, должно равняться значению аналогичного параметра у юзера. Только если это выполняется для каждого параметра = юзер найден
    const result = users.filter(user => searchParams.every(([key, value]) => user[key] === value));


    res.render('index', { 
        users, 
        formSchema: userFormSchema,
        result: result.length > 0 ? result : 'Пользователи не найдены', 
    });
};
