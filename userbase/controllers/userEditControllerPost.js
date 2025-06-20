import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));
import { userbase } from "../storage/userbase.js";
import { validationResult } from "express-validator";

export const userEditControllerPost = (req, res) => {
    const errors = validationResult(req);
    const user = req.body;
    console.log('req.params:', req.params.id);

    if (!errors.isEmpty()) {
        return res.render('edit-user', {
            heading: 'Ошибка ввода данных, введите снова',
            formData: {
                endpoint: `/${req.params.id}/edit`,
                errorsArr: errors.array(),  
                hasInputValues: true,
                user
            }
        })
    }

    userbase.updateUser({
        props: {
            id: req.params.id,
            formData: req.body
        },
    });
    res.redirect("/");
};