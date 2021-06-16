const {Router} = require('express')
const Course = require('../models/courseMongoDB')
const router = Router()
const authMiddleware = require('../middleware/auth')


function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total + (course.price * course.count)
    }, 0)
}

router.post('/add', authMiddleware, async (req, res) => {
    const course = await Course.findOne({_id: req.body.id})
    await req.user.addToCart(course)
    res.redirect('/card')
})

router.get('/', authMiddleware, async (req, res) => {
    const user = await req.user.populate('cart.items.courseId').execPopulate()
    const courses = user.cart.items.map(item => ({
        ...item.courseId._doc,
        id: item.courseId._id,
        count: item.count
    }))

    res.render('card', {
        title: 'Корзина',
        isCard: true,
        courses,
        price: computePrice(courses)
    })

})

router.delete('/remove/:id', authMiddleware, async (req, res) => {
    await req.user.removeFromCart(req.params.id)
    const user = await req.user.populate('cart.items.courseId').execPopulate()
    const courses = user.cart.items.map(item => ({
        ...item.courseId._doc,
        id: item.courseId._id,
        count: item.count
    }))
    res.status(200).json({courses, price: computePrice(courses)})
})

module.exports = router