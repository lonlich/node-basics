import express from "express";
const app = express();
import { userFormSchema } from "../constants/userFormSchema.js";
import { userbase } from "../storage/userbase.js";
import { selectFromTable, insertUser } from "../db/queries.js";

//GET
export const indexGet = async (req, res) => {
    // log(await selectAllRows('usernames'));
    // console.log("🚀 ~ indexGet ~ req.user:", req.user);

    // log('В index.get')
    res.render("index", {
        users: await selectFromTable({ table: 'usernames' }),
        formSchema: userFormSchema,
        user: req.user,
    });
};


