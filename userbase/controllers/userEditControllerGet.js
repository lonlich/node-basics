import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));
import { userbase } from "../storage/userbase.js";

export const userEditControllerGet = (req, res) => {
    const userToEdit = userbase.findUser(+req.params.id);
    console.log(userToEdit.id);
    res.render("edit-user", {
        heading : `Редактирование пользователя ${userToEdit.firstname}`,
        id : userToEdit.id,
        firstnamePlaceholder : userToEdit.firstname,
        lastnamePlaceholder : userToEdit.lastname,
    });
};
