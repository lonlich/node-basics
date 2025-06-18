import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));
import { userbase } from "../storage/userbase.js";
import { validationResult } from "express-validator";

export const userEditControllerPost = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    userbase.updateUser({
        props: {
            id: +req.params.id,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: 'hello@123.com'
        },
    });
    res.redirect("/");
};
