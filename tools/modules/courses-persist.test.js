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
describe('Testing getCourseById()', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        id: 1,
        username: 'test',
        test: {
            func: 'getCourseById',
            skip: 0,
            limit: 5,
            username: 'test'
        }
    }

    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        const newOptions = Object.assign({},options,{user})
        try{
            const result = await db.getCourseById(newOptions)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })

    test('If a correct id is supplied, expect 1 document with that id', async done => {
        const results = await db.getCourseById(options)
        expect(results.length).toBe(1)
        expect(results[0]['_id']).toBe(1)
        done()
    })
    test('If an incorrect id is supplied, expect empty array', async done => {
        const results = await db.getCourseById(Object.assign({},options,{id: 15}))
        expect(results.length).toBe(0)
        done()
    })
})
describe('Testing postCourse', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        data: {
            name: 'test',
            username: 'test',
            category: 'test',
            content: [],
            published: true
        }
    }
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        const goodOptions = Object.assign({},options)
        goodOptions.data.level = 1

        const newOptions = Object.assign({},goodOptions,{user})
        try{
            const result = await db.postCourse(newOptions)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })

    test('If course doesn\'t match schema, expect error', async done => {
        try{
            let result = await db.postCourse({data: {}})
        }
        catch(err){

            expect(err.message).toBe('Activity doesn\'t match schema')
        }
        done()
    })
    test('Expect the course id as result of a successful post', async done => {
        const goodOptions = Object.assign({},options)
        goodOptions.data.level = 1

        const result = await db.postCourse(goodOptions)

        expect(result.id).toBe(7)
        done()
    })
})
describe('Testing rateCourse', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        id: 1,
        test: {
            func: 'rateCourse'
        },
        data: {
            rating: 2.3,
            username: 'test'
        }
    }
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        const goodOptions = Object.assign({},options)
        goodOptions.data.level = 1

        const newOptions = Object.assign({},goodOptions,{user})
        try{
            const result = await db.rateCourse(newOptions)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })

    test('If course doesn\'t match schema, expect error', async done => {
        try{
            let result = await db.rateCourse({data: {}})
        }
        catch(err){

            expect(err.message).toBe('Rating doesn\'t match schema')
        }
        done()
    })
    test('Expect value to be updated if it exists', async done => {
        const goodOptions = Object.assign({},options)

        const result = await db.rateCourse(goodOptions)

        expect(result.value.rating).toBe(2.3)
        done()
    })
    test('Expect value to be pushed if it\'s the first username rating', async done => {
        const newOptions = Object.assign({},options)
        newOptions.data.username = 'test2'
        const result = await db.rateCourse(newOptions)

        expect(result.value.rating).toBe(2.3)
        done()
    })
})
describe('Testing progressCourse', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        id: 1,
        test: {
            func: 'progressCourse'
        },
        data: {
            finished: true,
            current_page: 2,
            username: 'test'
        }
    }
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        const goodOptions = Object.assign({},options)
        goodOptions.data.level = 1

        const newOptions = Object.assign({},goodOptions,{user})
        try{
            const result = await db.progressCourse(newOptions)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })

    test('If course doesn\'t match schema, expect error', async done => {
        try{
            let result = await db.progressCourse({data: {}})
        }
        catch(err){

            expect(err.message).toBe('Progress doesn\'t match schema')
        }
        done()
    })
    test('Expect value to be updated if it exists', async done => {
        const goodOptions = Object.assign({},options)

        const result = await db.progressCourse(goodOptions)

        expect(result.value.finished).toBe(true)
        done()
    })
    test('Expect value to be pushed if it\'s the first username progress report', async done => {
        const newOptions = Object.assign({},options)
        newOptions.data.username = 'test5'
        const result = await db.progressCourse(newOptions)

        expect(result.value.finished).toBe(true)
        done()
    })
})
describe('Testing updateCourse', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        id: 1,
        test: {
            func: 'updateCourse'
        },
        data: {
            _id: 1,
            name: 'Git',
            username: 'test',
            category: 'not-git',
            published: true,
            content: [],
            level: 1
        }

    }
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }
        const goodOptions = Object.assign({},options)
        goodOptions.data.level = 1

        const newOptions = Object.assign({},goodOptions,{user})
        try{
            const result = await db.updateCourse(newOptions)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })

    test('If course doesn\'t match schema, expect error', async done => {
        try{
            let result = await db.updateCourse({data: {}})
        }
        catch(err){

            expect(err.message).toBe('Course doesn\'t match schema')
        }
        done()
    })
    test('If course not found, expect result.ok to be 0', async done => {
        let result = await db.updateCourse(Object.assign({},options,{id: 15}))
        expect(result.ok).toBe(0)
        done()
    })
    test('If content was  changed, expect course to be updated and ratings and progress to be reset', async done => {
        let result = await db.updateCourse(Object.assign({},options,{contentChanged: true, id: 2}))
        expect(result.ok).toBe(1)
        expect(result.data.category).toBe('not-git')
        expect(result.data.ratings.length).toBe(0)
        expect(result.data.progress.length).toBe(0)
        done()
    })
    test('If content was not changed, expect result.ok to be 1 and ratings and progress unchanged', async done => {
        let result = await db.updateCourse(options)
        expect(result.ok).toBe(1)
        expect(result.data.category).toBe('not-git')
        expect(result.data.ratings.length).toBeGreaterThan(0)
        expect(result.data.progress.length).toBeGreaterThan(0)
        done()
    })

})
describe('Testing getAssessmentResultsForCourse', () => {
    const user = {
        username: 'test',
        password: 'test'
    }
    const options = {
        course_id: 1,
        username: 'test',
        test: {
            func: 'getAssessmentResultsForCourse'
        }
    }
    test('If connection doesn\'t go through, get error', async done => {
        const user = {
            username: 'forceError',
            password: 'any'
        }

        const newOptions = Object.assign({},options,{user})
        try{
            const result = await db.getAssessmentResultsForCourse(options)
        }
        catch(err){
            expect(err.message).toBe('Connection not established')
        }
        done()
    })

    test('If assessment not found, expect empty array', async done => {
        let result = await db.getAssessmentResultsForCourse(Object.assign({},options,{course_id: 15}))
        expect(result.length).toBe(0)
        done()
    })
    test('If the call is successful, retrieve the assessment', async done => {
        let result = await db.getAssessmentResultsForCourse(options)
        console.log(result)
        expect(result.length).toBe(1)
        expect(result[0].course_id).toBe(1)
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
