import express from "express";
const app = express();
import { body, validationResult } from "express-validator";
import { addRowToTable, addToTable, deleteFromTable, selectFromTable, updateInTable } from "../db/queries.js";
import pool from "../db/pool.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export const loginGet = (req, res, next) => {
    res.render('partials/login-form');
}

export const loginPost = async (req, res, next) => {
    try {
        console.log('Внутри loginPost, блок try')
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
                return res.render('sign-up', {
                        endpoint: `/signup`,
                        errorsMap: errors.mapped(),
                })
            }
        next();

    } catch (error) {
        console.warn(error);
        return next(error);
    }
}