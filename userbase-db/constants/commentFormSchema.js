//определяет, какие поля выводятся в карточке игры. Позволяет выводить не все поля из базы, а только нужные


export const commentFormSchema = {
    id: { label: "ID коммента", type: "text", visibleInForm: false },
    content: { label: "Контент", type: "text" },
    author: { label: "Автор", type: "text" },
    createdAt: { label: "Добавлено", type: "text", visibleInForm: false },
};





//Старая схема (без Prisma)
// export const commentFormSchema = {
//     comment_id: { label: "ID коммента", type: "text", visibleInForm: false },
//     content: { label: "Контент", type: "text" },
//     username: { label: "Автор", type: "text" },
//     created_at: { label: "Добавлено", type: "text", visibleInForm: false },
// };