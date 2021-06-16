const {Router} = require('express')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult} = require("express-validator")
const User = require('../models/user')
const keys = require('../keys/index')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')

const router = Router()
const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: keys.EMAIL_FROM,
            pass: 'kenan484837'
        }
    }, {
        from: `<${keys.EMAIL_FROM}>`
    }
)

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: "Авторизация",
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})


router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})


router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error')
    })
})


router.get('/password/:token', async (req, res) => {
    const {token} = req.params
    if (!token) {
        return res.redirect('/auth/login')
    }
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Восстановить доступ',
                error: req.flash('error'),
                userId: user._id.toString(),
                token
            })
        }
    } catch (error) {
        console.log(error)
    }
})


router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так,повторите попытку позже')
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(req.body.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Такого email нет')
                res.redirect('/auth/reset')
            }
        })

    } catch (error) {
        console.log(error)
    }

})


router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Время жизни токена истекло')
            return res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error)
    }

})


router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password)
            if (isSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save((err) => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Введите верный пароль')
                res.redirect('/auth/login')
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует')
            res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error)
    }
})


router.post('/register',
    registerValidators
    , async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.flash('registerError', errors.array()[0].msg)
                return res.status(422).redirect('/auth/login#register')
            }
            const {email, password, name} = req.body
            const hashPassword = await bcrypt.hash(password, 10)
            await new User({
                email,
                name,
                password: hashPassword,
                cart: {items: []}
            }).save()
            await transporter.sendMail(regEmail(email))
            res.redirect('/auth/login')

        } catch (error) {
            console.log(error)
        }
    })


module.exports = router