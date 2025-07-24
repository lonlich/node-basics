import express from "express";
const app = express();
import { body, validationResult } from "express-validator";
import { gameCardSchema, genreSchema } from "../constants/gameFormSchema.js";
import { addRowToTable, addToTable, deleteFromTable, selectFromTable } from "../db/queries.js";
import pool from "../db/pool.js";
import { tableMap } from "../db/tableMap.js";
import { updateInTable } from "../db/queries.js";
import { commentFormSchema } from "../constants/commentFormSchema.js";

/* АЛГОРИТМ ОТРИСОВКИ ПОЛЕЙ АВТОР и CREATED_AT в ЗАВИСИМОСТИ ОТ СТАТУСА ЮЗЕРА

1. Проверяем, правильно ли введено секретное слово
2. Если да - обновляем колонку в бд для этого пользователя isMember = true
3. Далее мне нужно иметь доступ к этому свойству в сессии, чтобы отображать поля автора и created at? Если да, то как туда добавить? Или нужно делать запрос в базу перед отрисовкой этих полей и искать там флаг isMember?
4. Отрисоваем поля в шаблоне в зависимости от статуса мембера:

if (key === 'author' || key === 'created_at') {
    if (user.isMember) {
    <%= commentFormSchema[key].label %>: <%- comment[key] %> 
    } else { return }
} else {
    }
*/


app.use(express.urlencoded({ extended: true }));

//RENDER COMMENTS LIST
export const renderCommentsGet = async (req, res) => {
    const comments = (
        await pool.query(`
        SELECT users.username, comments.comment_id, comments.content, comments.created_at
        FROM users JOIN comments 
        ON users.id = comments.author_id`)
    ).rows;

    // console.log('🚀 ~ renderCommentsGet ~ comments:', comments);

    // console.log("🚀 ~ renderCommentsGet ~ comments:", comments);
    // console.log('🚀 ~ renderCommentsGet ~ req.user:', req.user);

    // console.log('🚀 ~ renderCommentsGet ~ res.locals.user:', res.locals.user);

    res.render('comments-list', {
        comments,
        commentFormSchema,
        // user: req.user //TODO: почему без явной передачи user req user не подтягивается Username?
    });
}

//ADD COMMENT
export const addCommentGet = (req, res) => {
    res.render('add-comment');
}

export const addCommentPost = async (req, res, next) => {
    try {
        // console.log('Внутри addCommentPost, блок addCommentPost')
        const errors = validationResult(req);

        // console.log("🚀 ~ addCommentPost ~ errors.mapped():", errors.mapped());

        // console.log("🚀 req.body:", req.body);
        // console.log("🚀 user:", req.user);

        
        if (!errors.isEmpty()) {
            console.log('есть ошибка!')

                return res.render('add-comment', {
                        endpoint: `/add-comment`,
                        errorsMap: errors.mapped(),
                })
            }

        //добавляем комментарий в базу
        const addedComment = await addToTable({
            table: 'comments',
            columns: 'author_id, content',
            rowData: [req.user.id, req.body.content]
        });

        // console.log("🚀 ~ addCommentPost ~ addedComment:", addedComment);


        res.redirect('/clubhouse');

    } catch (error) {
        console.warn(error);
        return next(error);
    }
}

//VERIFY MEMBERSHIP
export const verifyMembershipGet = async (req, res) => {

}

export const verifyMembershipPost = async (req, res) => {

}

//DELETE COMMENT
export const deleteCommentGet = async(req, res) => {
    console.log(req.params);
    console.log("🚀 ~ req.params:", req.params.comment_id);

    const [deletedComment] = await deleteFromTable({
        table: 'comments',
        where: {
            comment_id: { op: '=', value: req.params.comment_id }
        },
        returning: '*'
    })

    console.log("🚀 ~ deletedComment:", deletedComment);


    console.log(`🚀 Удаленный комментарий: id: ${deletedComment.comment_id}, контент: ${deletedComment.content}`);

    res.redirect('/clubhouse');
}