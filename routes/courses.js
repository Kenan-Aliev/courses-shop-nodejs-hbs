const {Router} = require('express')
const {validationResult} = require('express-validator')
const router = Router()
const Course = require('../models/courseMongoDB')
const authMiddleware = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('userId', 'email name').lean()
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        })
    } catch (e) {
        console.log(e)
    }

})

router.get('/:id/edit', authMiddleware, async (req, res) => {
    try {
        const {id} = req.params
        if (!req.query.allow) {
            return res.redirect('/')
        }
        const course = await Course.findOne({_id: id, userId: req.user._id.toString()}).lean()
        if (!course) {
            return res.redirect('/courses')
        }
        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        })

    } catch (e) {
        console.log(e)
    }

})


router.post('/edit', authMiddleware,
    courseValidators,
    async (req, res) => {
        try {
            const {id} = req.body
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
            }
            delete req.body.id
            const course = await Course.findOne({_id: id, userId: req.user._id})
            if (!course) {
                return res.redirect('/courses')
            }
            await Course.findByIdAndUpdate(id, req.body)
            res.redirect('/courses')
        } catch (error) {
            console.log(error)
        }

    })


router.post('/remove', authMiddleware, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})


router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const course = await Course.findOne({_id: id}).lean()
        res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course
        })
    } catch (e) {
        console.log(e)
    }
})

module.exports = router