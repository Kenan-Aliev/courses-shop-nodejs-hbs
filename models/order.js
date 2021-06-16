const {Schema, model, ObjectId} = require('mongoose')

const orderSchema = new Schema({
    courses: [
        {
            course: {
                type: Object,
                required: true
            },
            count: {type: Number, required: true}
        }
    ],
    user: {
        name: String,
        userId: {
            type: ObjectId,
            ref: 'users',
            required: true
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = model('orders', orderSchema)