import {MongoClient} from  'mongodb'
import axios from 'axios'
import * as auth from 'http-digest-auth'
import md5 from 'md5'

let db
let db_client
let calls = 0
async function connect(dbName, user) {
    let conString = process.env.MONGO_CONNECTION_STRING
    let options = {
        ssl: true,
        authSource: "admin",
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
async function digestAuthFetchNonce(options,user) {
    return await axios(options).catch(err => {
        calls = calls + 1
        const realm = /realm="([\w+!?'\ \/\\-]+)"/g.exec(err.response.headers['www-authenticate'])[1]
        const nonce = /nonce="([\w+!?'\/\\-]+)"/g.exec(err.response.headers['www-authenticate'])[1]
        const nc = calls.toString(16).padStart(16,0)
        const obj = {
            realm,
            nonce,
            nc,
            uri: options.url,
            method: options.method,
            username: user.username,
            password: user.password
        }
        console.log(obj)
        const ha1 = md5(`${user.username}:${realm}:${user.password}`)
        const ha2 = md5(`${options.method}:${options.url}`)
        const response = md5(`${ha1}:${nonce}:${nc}:${nonce}:auth:${ha2}`)

        let authHeader = `Digest username=\"${obj.username}\", realm=\"${obj.realm}\", nonce=\"${obj.nonce}\", uri=\"${obj.uri}\", algorithm=\"MD5\", qop=auth, nc=${obj.nc}, cnonce=\"${obj.nonce}\", response=\"${response}\"`

        return authHeader
    })

}
export async function createUser(userData) {
    const adminData = {
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_APIKEY
    }
    const baseURL = `${process.env.MONGO_API_BASEURL}`
    const url = `/api/atlas/v1.0/groups/${process.env.MONGO_PROJECT_ID}/databaseUsers`
    const opt = {
        roles: [
            {
                roleName: "readWrite",
                databaseName: process.env.MONGO_DBNAME
            }
        ]
    }
    const options = {
        method: 'POST',
        url,
        baseURL,
        data: {
            databaseName: "admin",
            username: userData.username,
            password: userData.password,
            roles: opt.roles,
            groupId: process.env.MONGO_PROJECT_ID
        },
    }

    const authHeader = await digestAuthFetchNonce(options,adminData)
    console.log(authHeader)

    //const digest = auth.passhash('',process.env.MONGO_USERNAME,process.env.MONGO_APIKEY)

    const result = await axios(
        Object.assign({},options,
        {
            headers: {
                'Authorization': authHeader
            }
        })).catch(res => {
        return res.response.data
    })
    return result
}
export function fetchCollections() {
    return db.collections().then(res => res).catch(err => err.message)
}


