let axios = require('axios')
jest.mock('mongodb')
jest.mock('axios')
import * as db from './courses-persist'
import dotenv from 'dotenv'
dotenv.config()


describe('Testing getCourses()', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        test: {
            func: 'getCourses',
            skip: 0,
            limit: 5,
            random: false
        }
    }

    test('Five documents should be returned if random is set', async done => {
        let optionsRandom = Object.assign({},options,{random:true})
        optionsRandom.test.random = true
        const results = await db.getCourses(optionsRandom)
        expect(results.length).toBe(5)
        done()
    })

    test('Get a list of documents with length equal to limit', async done => {
        const results = await db.getCourses(options)
        expect(results.length).toBe(5)
        done()
    })
    test('If category is a parameter, all documents have this category', async done => {
        const newOptions = {
            category: 'git',
            test: {
                func: 'getCourses',
                skip: 0,
                limit: 5,
                random: false,
                cat: 'git'
            }
        }
        const results = await db.getCourses(newOptions)
        expect(results.length).toBe(5)
        expect(results.every(e => e.category == 'git')).toBe(true)
        done()
    })
    test('If page and limit are specified, expect some results to be skipped', async done => {
        const newOptions = {
            page: 2,
            limit: 5,
            test: {
                func: 'getCourses',
                skip: 5,
                limit: 5,
                random: false,
            }
        }
        const results = await db.getCourses(newOptions)
        expect(results[0]['_id']).toBe(6)
        done()
    })
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        const newOptions = Object.assign({},options,{user})
        try{
            const result = await db.getCourses(newOptions)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })
})
/*
db-persist should have the following API:
    createUser(userData,userLogin) -> returns user if successful, error message if not
    getCourseById(cid,user) -> returns course if successful, error message if not
    createCourse(courseData,user) -> returns course if successful, error message if not
    collections(user) -> returns collections in db
*/
// describe('Testing connection', () => {
//     const correctUser = {
//         username: 'test',
//         password: 'test'
//     }
//     const wrongUser = {
//         username: 'wrong',
//         password: 'wrong'
//     }
//     test('If authentication succeeds, course should be available', async done => {
//         const result = await db.getCourseById(1,correctUser)
//         expect(result['_id']).toBe(1)
//         done()
//     })

//     test('If wrong user, authentication fails', async done => {
//         try{
//             const result = await db.getCourseById(1,wrongUser)
//         }
//         catch(err){
//             expect(err.message).toBe('Authentication failed')
//         }
//         done()
//     })
// })
/*
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
*/
