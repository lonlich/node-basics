import { log, warn, table, block } from "../js/utils.js";

import {
    __filename,
    __dirname,
    PORT,
    STATIC_FOLDER_PATH,
    PAGE404_FILE,
} from "../config.js";

import fs from "fs";
import { access } from "fs/promises";
import { constants } from "fs";
import { readFile } from "fs/promises";
import axios, { Axios } from "axios";
import http from "node:http";
import url from "node:url";
import path from "path";
import EventEmitter from "node:events";
const eventEmitter = new EventEmitter();
import { upperCase } from "upper-case";
import formidable from "formidable";
import pool from "../db/pool.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

import express from "express";
import { selectFromTable } from "../db/queries.js";
import { gameCardSchema as gameCardSchema } from "../constants/gameFormSchema.js";
import { genreSchema } from "../constants/gameFormSchema.js";
import { gameSchema } from "../constants/gameFormSchema.js";

import { indexGet } from "../controllers/indexController.js";
import { searchControllerGet } from "../controllers/searchController.js";
import { createUserGet, createUserPost, deleteUserGet, editUserGet, editUserPost } from "../controllers/userController.js";
import { loadCurrentUser } from "../db/dbUtils.js";
import { validateUpdatedUser } from "../validators/validateUpdatedUser.js";
import { validateUser } from "../validators/validateUser.js";

const app = express();

app.use(express.json());

export const usersRouter = express.Router();

usersRouter.get("/", loadCurrentUser, indexGet);

//create user
usersRouter.get("/create-user", createUserGet);
usersRouter.post("/create-user", validateUser, createUserPost);

//edit user
usersRouter.get("/:id/edit", editUserGet);
usersRouter.post("/:id/edit", validateUpdatedUser, editUserPost);

//delete user
usersRouter.get("/:id/delete", deleteUserGet);

//search user
usersRouter.get("/search", searchControllerGet);