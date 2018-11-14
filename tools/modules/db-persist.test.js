let axios = require('axios')
jest.mock('mongodb')
jest.mock('axios')
import * as db from './db-persist'
import dotenv from 'dotenv'
import { getData } from 'mongodb'

dotenv.config()
let adminUser = {
    username: process.env.MONGO_ADMIN_USERNAME,
    password: process.env.MONGO_ADMIN_PASSWORD
}



/*
db-persist should have the following API:
    createUser(userData,userLogin) -> returns user if successful, error message if not
    getCourseById(cid,user) -> returns course if successful, error message if not
    createCourse(courseData,user) -> returns course if successful, error message if not
    collections(user) -> returns collections in db
*/
describe("Testing createUser", () => {
    beforeAll(() => {
        axios.mockImplementation((options) => {
            return new Promise((resolve,reject) => {
                if (options.hasOwnProperty('headers')){
                    console.log(options)
                    resolve(options.headers['Authorization'])
                }
                else{
                    reject({
                        response: {
                            headers: {
                                'www-authenticate': 'Digest realm="MMS Public API", domain="", nonce="testnonce", algorithm=MD5, qop="auth", stale=false'
                            }
                        }
                    })
                }
            })
        })
    })
    test("If successfull, result should have a 'response=' field in its authorization header", async done => {
        const userData = {
            username: 'test',
            password: 'test'
        }
        const result = await db.createUser(userData)
        console.log(result)
        expect(/response=/g.test(result)).toBe(true)
        done()
    })
    test("if userData does not have the right schema, provide error message", async done => {
        const userData = {
            nofields: true
        }
        try{
            const result = await db.createUser(userData)
        }
        catch(result){
            expect(result.message).toBe('Not the right data')
        }
        done()
    })
})
/*
describe('Testing Connection to db', () => {

    test("After connect, database name is set to the parameter", async done => {
        const result = await db.connect('collection')
        expect(result.dbInstance.name).toEqual('collection')
        done()
    })
})

describe('Testing all methods in db-persist',() => {
    let testDb
    let testClient
    beforeAll(async () => {
        testClient = await db.connect('collection')
        testDb = testClient.dbInstance
    })

    test("Fetching collections should return the entire collection data", async done => {
        const expected = getData()
        const result = await db.fetchCollections()
        expect(result).toEqual(expect.arrayContaining(expected))
        done()
    })
    test("Fetching collections simulate error should return No data", async done => {
        testDb.forceError = true
        const result = await db.fetchCollections()
        console.log(result)
        expect(result).toBe('No data')
        done()
    })

    test("Closing the Client should return the string 'closed'", async done=> {
        const result = await db.close()
        expect(result).toBe('closed')
        done()
    })
})
*/
