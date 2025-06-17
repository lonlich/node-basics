import { body, validationResult } from "express-validator";
import { userbase } from "../storage/userbase.js";
import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));


export const userCreationControllerPost = (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const user = req.body;
    user.id = userbase.getUsers().length + 1;
    userbase.addUser(user);
    
    console.table(userbase);
    console.log(req.params)
    res.redirect('/');
}