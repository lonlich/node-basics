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
import { validateAddedGame } from "../validators/validateAddedGame.js";
import { addGameGet, addGamePost, deleteGameGet, editGameGet, editGamePost } from "../controllers/gameController.js";
import { addCommentGet, addCommentPost, deleteCommentGet, renderCommentsGet, verifyMembershipGet, verifyMembershipPost } from "../controllers/clubhouseController.js";
import { loadCurrentUser } from "../db/dbUtils.js";
import { validateAddedComment } from "../validators/validateAddedComment.js";

const app = express();

app.use(express.json());

export const clubhouseRouter = express.Router();


//Список комментариев: get
clubhouseRouter.get('/', loadCurrentUser, renderCommentsGet);

//Добавление комментария: get, post
clubhouseRouter.get('/add-comment', addCommentGet);
clubhouseRouter.post('/add-comment', validateAddedComment, addCommentPost);

//Ввод секретного кода
clubhouseRouter.get('/verify-membership', verifyMembershipGet);
clubhouseRouter.post('/verify-membership', verifyMembershipPost);

//Удаление комментария
clubhouseRouter.get('/:comment_id/delete', deleteCommentGet);



