import express from "express";
const app = express();
import { userFormSchema } from "../constants/userFormSchema.js";
import { userbase } from "../storage/userbase.js";
import { getAllUsernames, insertUsername } from "../db/queries.js";

//GET
export const indexGet = async (req, res) => {
    log(await getAllUsernames());
    res.render("index", {
        users: userbase.getUsers(),
        formSchema: userFormSchema,
    });
};