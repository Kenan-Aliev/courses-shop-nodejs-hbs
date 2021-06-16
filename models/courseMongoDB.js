const {Schema, model, ObjectId} = require('mongoose')

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: {
        type: String
    },
    userId: {type: ObjectId, ref: 'users'}
})






module.exports = model('courses', courseSchema)