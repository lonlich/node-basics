import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));

export const userCreationControllerGet = (req, res) => {

    res.render("create-user", {
        heading: "Создание нового пользователя",
        formData: {
            endpoint: `/create-user`,
        },
    });
};
