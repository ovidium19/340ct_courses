import {MongoClient} from 'mongodb'

export async function connect(user) {
    let conString = process.env.MONGO_CONNECTION_STRING
    let options = {
        ssl: true,
        authSource: 'admin',
        auth: {
            user: user.username,
            password: user.password
        },
        useNewUrlParser: true
    }
    return MongoClient.connect(conString,options).then(client => {
        console.log(`Connected to the database: ${client.isConnected()}`)
        return client
    })
}

export function schemaCheck(schema,data) {
    return Object.keys(schema).reduce((p,c,i) => p && data.hasOwnProperty(c), true)
}

