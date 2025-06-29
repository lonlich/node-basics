import express from "express";
const app = express();
import { userFormSchema } from "../constants/userFormSchema.js";
import { userbase } from "../storage/userbase.js";
import { getAllUsers, insertUser } from "../db/queries.js";

//GET
export const indexGet = async (req, res) => {
    // log(await getAllUsers());
    res.render("index", {
        users: await getAllUsers(),
        formSchema: userFormSchema,
    });
};