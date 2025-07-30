import express from "express";
const app = express();
import { userbase } from "../storage/userbase.js";
import { body, validationResult } from "express-validator";
import { userFormSchema } from "../constants/userFormSchema.js";
import { getAllUsernames, insertUsername } from "../db/queries.js";

app.use(express.urlencoded({ extended: true }));

//CREATE USER

//GET
export const createUserGet = (req, res) => {
    res.render("create-user", {
        heading: "Создание нового пользователя",
        formData: {
            endpoint: `/create-user`,
            formSchema: userFormSchema
        },
    });
};

//POST
export async function createUserPost(req, res) {
    const errors = validationResult(req);
    const user = req.body;
    
    if (!errors.isEmpty()) {
        return res.render('create-user', {
            heading: 'Ошибка ввода данных',
            formData: {
                endpoint: `/create-user`,
                errorsMap: errors.mapped(),  
                user,
                formSchema: userFormSchema
            }
        })
    }
    
    user.id = userbase.getUsers().length + 1;
    userbase.addUser(user);

    await insertUsername(user.firstname);

    res.redirect('/');
}

//EDIT USER

//GET
export const editUserGet = (req, res) => {
    const user = userbase.findUser(req.params.id);

    if (!user) {
        console.log("Пользователь не найден!");
        return;
    }

    // const inputValues = Object.keys(userFormSchema).map(key => user[key]);

    res.render("edit-user", {
        heading: `Редактирование пользователя ${user.firstname}`,
        formData: {
            endpoint: `/${user.id}/edit`,
            user, 
            formSchema: userFormSchema
        },
    });
};

//POST
export const editUserPost = (req, res) => {
    const errors = validationResult(req);
    const user = req.body;
    console.log('req.params:', req.params.id);

    if (!errors.isEmpty()) {
        return res.render('edit-user', {
            heading: 'Ошибка ввода данных',
            formData: {
                endpoint: `/${req.params.id}/edit`,
                errorsMap: errors.mapped(),  
                user, 
                formSchema: userFormSchema
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


//DELETE USER

//GET
export const deleteUserGet = (req, res) => {
    userbase.deleteUser(+req.params.id);
    res.redirect('/');
}