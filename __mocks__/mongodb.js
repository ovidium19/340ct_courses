const dbs = {
    users: 0,
    courses:1
}
const data = [
    {
        s: {
            name: 'users'

            }

    },
    {
        s: {
            name: 'courses',
            documents: [{
                _id: 1,
                name: "Git"
            }]
        }
    }
]
class Collection {
    constructor(name) {
        this.data = data[dbs[name]]
    }

    findOne(query) {
        return new Promise((resolve) => {
            let result = this.data.s.documents.find(d => d.hasOwnProperty('_id') && d['_id'] == query['_id'].id)
            resolve(result)
        })


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
export class ObjectID {
    constructor(id) {
        this.id = id
    }
}

//for testing purposes
export function getData() {
    return data
}
