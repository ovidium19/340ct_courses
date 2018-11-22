

const _ = require('underscore')
const dbs = {
    users: 0,
    courses:1
}
export class ObjectID {
    constructor(id) {
        this.id = id
    }
    static createFromHexString(id){
        return new ObjectID(id)
    }
}
const data = [
    {
        s: {
            name: 'users',
            documents: [{
                _id: 1,
                username: 'test',
                password: 'test'
            }]

            }

    },
    {
        s: {
            name: 'courses',
            documents: [
                {
                    _id: 1,
                    name: 'Git',
                    username: 'test',
                    category: 'not-git',
                    published: true
                },
                {
                    _id: 2,
                    name: 'Git',
                    username: 'test',
                    category: 'git',
                    published: true
                },
                {
                    _id: 3,
                    name: 'Git',
                    username: 'test',
                    category: 'git',
                    published: true
                },
                {
                    _id: 4,
                    name: 'Git',
                    username: 'test',
                    category: 'git',
                    published: true
                },
                {
                    _id: 5,
                    name: 'Git',
                    username: 'test',
                    category: 'git',
                    published: true
                },
                {
                    _id: 6,
                    name: 'Git',
                    username: 'test',
                    category: 'git',
                    published: true
                },
        ]
        }
    }
]

export class Cursor {
    constructor(list) {
        this.list = list
    }
    toArray() {
        return Promise.resolve(this.list)
    }
    close() {
        return Promise.resolve()
    }
}

class Collection {
    constructor(name) {
        this.data = Object.assign({},data[dbs[name]])
    }

    findOne(query) {
        return new Promise((resolve) => {
            let result = this.data.s.documents.find(d => d.hasOwnProperty('_id') && d['_id'] == query['_id'])
            resolve(result)
        })
    }
    insertOne(course){
        if (this.data.s.documents.find(c => c['_id'] == course['_id'])) throw new Error('Course ID already exists')
        return new Promise((resolve) => {
            this.data.s.documents.push(course)
            resolve(this.data.s.documents.find(c => c['_id'] == course['_id']))
        })
    }
    replaceOne(filter,course) {
        if (!this.data.s.documents.find(c => c['_id'] == course['_id'])) throw new Error('Course doesn\'t exist')
        return new Promise((resolve) => {
            const index = this.data.s.documents.findIndex(c => c['_id']== course['_id'])
            if (index >= 0){
                const removed = this.data.s.documents.splice(index,1,course)
            }
            const result = this.data.s.documents.find(c => c.name == course.name)

            resolve(result)
        })
    }
    aggregate(pipe,options) {
        let db_data = this.data.s.documents
        switch (options.test.func) {
            case 'getCourses': {
                if (options.test.hasOwnProperty('random') && options.test.random){
                    return new Cursor(_.sample(db_data,5))
                }
                else{
                    let data = db_data.reduce((p,c) => {
                        if (p.values.length>=options.test.limit) return p //we reached page limit, return
                        if (options.test.cat && !(c.category == options.test.cat)) return p // check if category was a parameter
                        if (p.skipped < options.test.skip) return { //check if we skipped enough documents
                            values: Array.from(p.values),
                            skipped: p.skipped + 1
                        }
                        return {
                            values: p.values.concat([Object.assign({},c)]),
                            skipped: p.skipped
                        }
                    },{
                        values: [],
                        skipped: 0
                    })
                    return new Cursor(data.values)
                }
            }
            case 'getCourseById': {
                if (options.id <= db_data.length) return new Cursor([db_data[options.id - 1]])
                return new Cursor([])
            }
        }
    }
}

class MongoDB {
    constructor(name) {
        this.name = name
        this.forceError = false
    }

    collection(name) {
        return new Promise((resolve,reject) => {
            try{
                let collection = new Collection(name)
                resolve(collection)
            }
            catch(err){
                reject(err)
            }
        })
    }

    collections() {
        return new Promise((resolve,reject) => {
            !this.forceError ? resolve(data) : reject({message: 'No data'})
        })
    }
}
class MongoDBClient {
    constructor() {
        this.mocked = true
        this.dbInstance = null
    }
    isConnected() {
        return this.mocked
    }

    db(name) {
        if (!this.dbInstance)
            this.dbInstance = new MongoDB(name)

        return this.dbInstance
    }

    close() {
        return new Promise((resolve,reject) => {
            resolve('closed')
        })
    }
}
export class MongoClient {
    static connect(con,options) {
        return new Promise((resolve,reject) => {
            if (options.auth.user == 'forceError') reject(new Error('Connection not established'))
            resolve(new MongoDBClient())
        })
    }
}


//for testing purposes
export function getData() {
    return data
}
