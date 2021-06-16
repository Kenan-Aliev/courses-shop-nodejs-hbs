const {Schema, model, ObjectId} = require('mongoose')

const userSchema = new Schema({
    email: {type: String, required: true},
    name: {type: String},
    password: {type: String, required: true},
    resetToken: String,
    resetTokenExp: Date,
    avatarUrl: String,
    cart: {
        items: [
            {
                count: {
                    type: Number, required: true, default: 1
                },
                courseId: {
                    type: ObjectId,
                    required: true,
                    ref: 'courses'
                }
            }
        ]
    }
})


userSchema.methods.addToCart = function (course) {
    const items = [...this.cart.items]
    const idx = items.findIndex(item => item.courseId.toString() === course._id.toString())
    if (idx >= 0) {
        this.cart.items[idx].count += 1
    } else {
        this.cart.items.push({
            courseId: course._id
        })
    }
    return this.save()
}


userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items]
    const idx = items.findIndex(item => item.courseId.toString() === id.toString())
    if (items[idx].count === 1) {
        items = items.filter(item => item.courseId.toString() !== id)
    } else {
        items[idx].count -= 1
    }
    this.cart = {items}
    return this.save()
}


userSchema.methods.clearCart = function () {
    this.cart = {items: []}
    return this.save()
}


module.exports = model('users', userSchema)