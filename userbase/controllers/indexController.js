import express from "express";
const app = express();
import { userFormSchema } from "../constants/userFormSchema.js";
import { userbase } from "../storage/userbase.js";


//GET
export const indexGet = (req, res) => {
    res.render("index", {
        users: userbase.getUsers(),
        formSchema: userFormSchema,
        
    });
};