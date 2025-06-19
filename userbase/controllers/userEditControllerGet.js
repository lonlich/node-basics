import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));
import { userbase } from "../storage/userbase.js";
import { userFormSchema } from "../constants/userFormSchema.js";

export const userEditControllerGet = (req, res) => {
    const user = userbase.findUser(req.params.id);

    if (!user) {
        console.log("Пользователь не найден!");
        return;
    }
    // res.locals.endpoint = `/${user.id}/edit`;
    // res.locals.heading = `Редактирование пользователя ${user.firstname}`;
    // res.locals.user = user;
    // res.locals.hasValues = true;

    res.render("edit-user", {
        heading: `Редактирование пользователя ${user.firstname}`,
        formState: {
            endpoint: `/${user.id}/edit`,
            hasValues: true,
            user, 
        },
    });
};
