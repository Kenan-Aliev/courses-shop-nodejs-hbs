const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [

    body('email', 'Введите корректный email')
        .isEmail().custom(async (value, {req}) => {
        try {
            const user = await User.findOne({email: value})
            if (user) {
                return Promise.reject('Такой email уже занят')
            }
        } catch (e) {
            console.log(e)
        }
    })
        .normalizeEmail(),
    body('password', 'Пароль должен быть минимум 6 символов').isLength({min: 6, max: 56}).isAlphanumeric().trim(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Пароли должны совпадать')
        }
        return true
    }),
    body('name', 'Имя должно быть минимум 3 символа').isLength({min: 3}).trim()
]


exports.courseValidators = [
    body('title', 'Минимальная длина названия 3 символа').isLength({min: 3}).trim(),
    body('price', 'Введите корректную цену').isNumeric(),
    body('img', 'Введите корректный URL картинки').isURL()
]