const users = [
    {}
]
const data = [
    {
        s: {
            name: 'users'

            }

    },
    {
        s: {
            name: 'courses'
        }
    }
]
class MongoDB {
    constructor(name) {
        this.name = name
        this.data = data[this.name]
        this.forceError = false
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
            resolve(new MongoDBClient())
        })
    }
}
//for testing purposes
export function getData() {
    return data
}
