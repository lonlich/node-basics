import express from "express";
const app = express();
import { userbase } from "../storage/userbase.js";

export const searchController = (req, res) => {
    // res.render('search');
    // res.json(req.query);
    log('req.query: ', req.query)
    const users = userbase.getUsers();

    const searchParams = Object.keys(req.query).filter(param => req.query[param].trim() !== '');

    log('searchParams', searchParams)

    const searchResult = []

    users.forEach(user => {
        const userFound = searchParams.every(param => user[param] === (req.query[param]));
        log(userFound);
        if (userFound) {
            searchResult.push(user);
        }
        log('Найденные пользователи', searchResult);
    });

    res.render('index', { users, searchResult, formSchema });



    /*
    1. Взять все параметры из req.query - это заполненные поля в форме поиска
    2.
    */

    // log(searchResult);
};
