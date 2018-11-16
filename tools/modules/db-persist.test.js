let axios = require('axios')
jest.mock('mongodb')
jest.mock('axios')
import * as db from './db-persist'
import dotenv from 'dotenv'
import { getData } from 'mongodb'
const course = {
    _id: 432343,
    name: 'TestCourse'
}
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
describe('Testing connection', () => {
    const correctUser = {
        username: 'test',
        password: 'test'
    }
    const wrongUser = {
        username: 'wrong',
        password: 'wrong'
    }
    test('If authentication succeeds, course should be available', async done => {
        const result = await db.getCourseById(1,correctUser)
        expect(result['_id']).toBe(1)
        done()
    })

    test('If wrong user, authentication fails', async done => {
        try{
            const result = await db.getCourseById(1,wrongUser)
        }
        catch(err){
            expect(err.message).toBe('Authentication failed')
        }
        done()
    })
})
describe('Testing createUser', () => {
    beforeAll(() => {
        axios.mockImplementation((options) => {
            return new Promise((resolve,reject) => {
                if (options.hasOwnProperty('headers')){
                    resolve({data: options.headers['Authorization']})
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
    test('If successfull, result should have a \'response=\' field in its authorization header', async done => {
        const userData = {
            username: 'test',
            password: 'test'
        }
        const result = await db.createUser(userData)
        console.log(result)
        expect(/response=/g.test(result)).toBe(true)
        done()
    })
    test('if userData does not have the right schema, provide error message', async done => {
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

describe('Testing getCourseById', () => {
    const user = {
        username: 'test',
        password: 'test'
    }

    test('A document found should return the document', async done => {
        const result = await db.getCourseById(1,user)
        expect(result['_id']).toBe(1)
        done()
    })

    test('If document not found, should return nothing', async done => {
        const result = await db.getCourseById(2,user)
        expect(result).toBe(undefined)
        done()
    })
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        try{
            const result = await db.getCourseById(1,user)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })
})

describe('Testing db.createCourse(course,user)', () => {
    const course = {
        _id: 2,
        name: 'TestCourse'
    }
    const user = {
        username: 'test',
        password: 'test'
    }

    test('Create course successfully', async done => {
        const result = await db.createCourse(course,user)
        expect(result['_id']).toBe(2)
        done()
    })

    test('Course data doesn\'t match schema', async done => {
        const course = {
            _id: 3
        }
        try{
            const result = await db.createCourse(course,user)
        }
        catch(err){
            expect(err.message).toBe('Course doesn\'t match schema')
        }
        done()
    })

    test('Trying to insert a course with an _id that already exists results in error', async done => {
        const course = {
            _id: 1,
            name: 'TestCourse'
        }
        try{
            const result = await db.createCourse(course,user)
        }
        catch(err) {
            expect(err.message).toBe('Course ID already exists')
        }
        done()
    })
})

describe('Testing db.updateCourse(course,user)', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const course = {
        _id: 1,
        name: 'updated'
    }

    test('Update course successfully', async done => {
        const result = await db.updateCourse(course,user)
        expect(result.name).toBe('updated')
        done()
    })

    test('Course data doesn\'t match schema', async done => {
        const course = {
            _id: 3
        }
        try{
            const result = await db.updateCourse(course,user)
        }
        catch(err){
            expect(err.message).toBe('Course doesn\'t match schema')
        }
        done()
    })

    test('Trying to update a course with an _id that doesn\'t exist results in error', async done => {
        const course = {
            _id: 5,
            name: 'TestCourse'
        }
        try{
            const result = await db.updateCourse(course,user)
        }
        catch(err) {
            expect(err.message).toBe('Course doesn\'t exist')
        }
        done()
    })
})
