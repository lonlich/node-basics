import { body, validationResult } from "express-validator";
import { userbase } from "../storage/userbase.js";
import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));


export const userCreationControllerPost = (req, res) => {
    const errors = validationResult(req);
    const user = req.body;
    
    if (!errors.isEmpty()) {
        //return res.status(400).json({ errors: errors.array() });
        return res.render('create-user', {
            heading: 'Ошибка ввода данных, введите снова',
            formData: {
                endpoint: `/create-user`,
                errorsArr: errors.array(),  
                // hasErrors: !errors.isEmpty(),
                hasInputValues: true,
                user,
            }
        })
    }
    
    user.id = userbase.getUsers().length + 1;
    userbase.addUser(user);

    res.redirect('/');
}