import express from "express";
const app = express();
import { userFormSchema } from "../constants/userFormSchema.js";
import { userbase } from "../storage/userbase.js";
import { getAllUsernames, insertUser } from "../db/queries.js";

//GET
export const indexGet = async (req, res) => {
    log(await getAllUsernames());
    res.render("index", {
        users: await getAllUsernames(),
        formSchema: userFormSchema,
    });
};