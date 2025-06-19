import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));

export const userCreationControllerGet = (req, res) => {

    res.render("create-user", {
        heading: "Создание нового пользователя",
        formState: {
            endpoint: `/create-user`,
            hasValues: true,
        },
    });
};
