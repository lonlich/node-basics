//определяет, какие поля выводятся в форме регистрации. Позволяет выводить не все поля из базы, а только нужные
export const signUpFormSchema = {
    username:  { label: 'Логин', type: 'text'},
    password: { label: 'Пароль', type: 'password'},
    repeat_password: { label: 'Повторите пароль', type: 'password'}
}