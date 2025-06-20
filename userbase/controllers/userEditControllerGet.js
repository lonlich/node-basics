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

    res.render("edit-user", {
        heading: `Редактирование пользователя ${user.firstname}`,
        formData: {
            endpoint: `/${user.id}/edit`,
            hasInputValues: true,
            user, 
        },
    });
};
