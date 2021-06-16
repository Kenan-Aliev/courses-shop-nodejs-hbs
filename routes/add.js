const {Router} = require('express')
const {validationResult} = require('express-validator')
const router = Router()
const Course = require('../models/courseMongoDB')
const authMiddleware = require('../middleware/auth')
const {courseValidators} = require('../utils/validators.js')


router.get('/', authMiddleware, (req, res) => {
    res.render('add', {
        title: "Добавить курс",
        isAdd: true
    })
})

router.post('/',
    authMiddleware,
    courseValidators,
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(422).render('add', {
                    title: 'Добавить курс',
                    isAdd: true,
                    error: errors.array()[0].msg,
                    data: {
                        title: req.body.title,
                        price: req.body.price,
                        img: req.body.img
                    }
                })
            }

            const course = new Course({
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
                userId: req.user._id
            })
            await course.save()
            res.redirect('/courses')
        } catch (e) {
            console.log(e)
        }

    })

module.exports = router