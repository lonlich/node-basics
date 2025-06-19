import { userbase } from "../storage/userbase.js";
import express from "express";

export const userDeletionControllerGet = (req, res) => {
    userbase.deleteUser(+req.params.id);
    res.redirect('/');
}