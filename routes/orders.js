const {Router} = require('express')
const router = Router()
const Order = require('../models/order')
const authMiddleware = require('../middleware/auth')


router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id
        }).populate('user.userId').lean()
        res.render('orders', {
            isOrder: true,
            title: "Заказы",
            orders: orders.map(order => {
                return {
                    ...order,
                    price: order.courses.reduce((total, course) => {
                        return total + (course.course.price * course.count)
                    }, 0)
                }
            })
        })
    } catch (error) {
        console.log(error)
    }
})


router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.courseId').execPopulate()
        const courses = user.cart.items.map(item => ({
            course: {...item.courseId._doc},
            count: item.count
        }))

        const order = new Order({
            courses,
            user: {
                name: user.name,
                userId: user._id
            }
        })
        await order.save()
        await req.user.clearCart()
        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }
})


module.exports = router