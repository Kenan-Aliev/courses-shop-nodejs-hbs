const path = require('path')
const fs = require('fs')

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'card.json'
)

class CardFileDB {

    static async add(course) {
        const card = await CardFileDB.fetch()
        const idx = card.courses.findIndex(c => c.id === course.id)
        const candidate = card.courses[idx]
        if (candidate) {
            //курс уже есть
            candidate.count += 1
            card.courses[idx] = candidate
        } else {
            //нужно добавить курс
            course.count = 1
            card.courses.push(course)
        }

        card.price += +course.price

        return new Promise((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(card), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    static fetch() {
        return new Promise((resolve, reject) => {
            fs.readFile(p, 'utf-8', (err, content) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(content))
                }
            })
        })
    }

    static async remove(id) {
        const card = await CardFileDB.fetch()

        const idx = card.courses.findIndex(c => c.id === id)
        const course = card.courses[idx]

        if (course.count === 1) {
            //нужно удалить
            card.courses = card.courses.filter(c => c.id !== id)
        } else {
            //изменить количество
            card.courses[idx].count -= 1
        }

        card.price -= course.price

        return new Promise((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(card), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(card)
                }
            })
        })
    }
}

module.exports = CardFileDB