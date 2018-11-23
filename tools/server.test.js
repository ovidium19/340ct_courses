let axios = require('axios')
jest.mock('mongodb')
jest.mock('./modules/courses-persist')
jest.mock('axios')
import * as db from './modules/courses-persist'
import server from './server'
import status from 'http-status-codes'
import request from 'supertest'
/*
Normally I would have a test file for each different module, but because in each other module I would
have to import the server script, then the server script will attempt to listen on the same port every time.
Because of race conditions between server.close() and server.listen(), it is unpredictable if we will get a
EADDRINUSE error in our tests.
In order to avoid this, we test all our modules in this one script, and close the server only after the last
test suite has been executed
*/
async function runBeforeAll() {
    console.log('Testing server!')
    axios.mockImplementation((options) => {
        return new Promise((resolve,reject) => {
            if (options.hasOwnProperty('headers')){
                options.headers['auth'] == 'allow' ? resolve() : reject({message: 'Authorization failed'})
            }
            else{
                reject({message: 'Authorization failed'})
            }
        })
    })

}
async function runAfterAll() {
    await server.close()
    console.log('Server closed')
}

describe('GET /api', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('check body for api', async done => {
        const response = await request(server).get('/api')
        const expected = [{name: 'users'},{name: 'courses'}]
        expect(response.body).toEqual(expect.objectContaining({
            currentVersion: expect.any(String),
            routes: expect.any(Array)
        }))
        done()
    })

    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).get('/api')
			.set('error', 'foo')
        expect(response.status).toEqual(status.NOT_FOUND)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
	})
})

describe('GET /api/v1', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api/v1').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).get('/api/v1').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.NOT_FOUND)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('check body for api/v1', async done => {
        const response = await request(server).get('/api/v1').set('auth','allow')
        expect(response.body).toEqual(expect.objectContaining({path: expect.any(String)}))
        done()
    })
    test('Resource is protected by authorization', async done => {
        const response = await request(server).get('/api/v1').expect(status.UNAUTHORIZED)
        expect(response.body.message).toBe('Authorization failed')
        done()
    })
})
describe('GET /api/v1/courses/', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api/v1/courses').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).get('/api/v1/courses').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).get('/api/v1/courses').expect(status.UNAUTHORIZED)
        done()
    })
    test('A list of courses is returned with no query params', async done => {
        const response = await request(server).get('/api/v1/courses').set('auth','allow').expect(status.OK)
        expect(response.body.length).toBeGreaterThanOrEqual(5)
        done()
    })
    test('if pagination query, expect results to be paginated', async done => {
        const response = await request(server).get('/api/v1/courses?page=2&limit=5').set('auth','allow').expect(status.OK)
        expect(response.body[0]['_id']).toBe(6)
        done()
    })
    test('if category is in the query, expect all results to have that category', async done => {
        const response = await request(server).get('/api/v1/courses?category=git').set('auth','allow').expect(status.OK)
        expect(response.body.every(c => c.category == 'git')).toBeTruthy()
        done()
    })
})
describe('Get /courses/:id', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api/v1/courses/1').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).get('/api/v1/courses/1').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).get('/api/v1/courses/1').expect(status.UNAUTHORIZED)
        done()
    })
    test('In case of a successful call, get an array with 1 element, the course with provided id', async done => {
        const response = await request(server).get('/api/v1/courses/1').set('auth','allow').expect(status.OK)
        expect(response.body.length).toBe(1)
        expect(response.body[0]['_id']).toBe(1)
        done()
    })
    test('In case of a good call but no id found, get an empty array', async done => {
        const response = await request(server).get('/api/v1/courses/15').set('auth','allow').expect(status.OK)
        expect(response.body.length).toBe(0)
        done()
    })
})
describe('Post /courses/create', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).post('/api/v1/courses/create').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).post('/api/v1/courses/create').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).post('/api/v1/courses/create').expect(status.UNAUTHORIZED)
        done()
    })
    test('In case of a good call but no id found, get the inserted id', async done => {
        const response = await request(server).post('/api/v1/courses/create').set('auth','allow').expect(status.OK)
        expect(response.body.id).toBe(7)
        done()
    })
})
describe('Put /courses/:id/rate', () => {
    const rating = {
        username: 'test',
        rating: 5
    }
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).put('/api/v1/courses/1/rate').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).put('/api/v1/courses/1/rate').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).put('/api/v1/courses/1/rate').expect(status.UNAUTHORIZED)
        done()
    })
    test('Expect rating to be updated in case it exists', async done => {
        const response = await request(server).put('/api/v1/courses/1/rate').set('auth','allow').send(rating).expect(status.OK)
        expect(response.body.value.ratings[0].rating).toBe(5)
        done()
    })
    test('Expect rating to be added if it didn\'t already exist', async done => {
        rating.username = 'test2'
        const response = await request(server).put('/api/v1/courses/1/rate').set('auth','allow').send(rating).expect(status.OK)
        expect(response.body.value.ratings.length).toBe(3)
        done()
    })
})
describe('Put /courses/:id/progress', () => {
    const progress = {
        username: 'test',
        finished: true,
        current_page: 2
    }
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).put('/api/v1/courses/1/progress').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).put('/api/v1/courses/1/progress').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).put('/api/v1/courses/1/progress').expect(status.UNAUTHORIZED)
        done()
    })
    test('Expect rating to be updated in case it exists', async done => {
        const response = await request(server).put('/api/v1/courses/1/progress').set('auth','allow').send(progress).expect(status.OK)
        expect(response.body.value.progress[0].finished).toBe(true)
        done()
    })
    test('Expect rating to be added if it didn\'t already exist', async done => {
        progress.username = 'test2'
        const response = await request(server).put('/api/v1/courses/1/progress').set('auth','allow').send(progress).expect(status.OK)
        expect(response.body.value.progress.length).toBe(3)
        done()
    })
})
describe('Put /courses/:id/update', () => {
    const update = {
        username: 'test',
        published: false,
        level: 1
    }
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).put('/api/v1/courses/1/update').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).put('/api/v1/courses/1/update').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).put('/api/v1/courses/1/update').expect(status.UNAUTHORIZED)
        done()
    })
    test('If course not found, expect error', async done => {

        const response = await request(server).put('/api/v1/courses/15/update').set('auth','allow').send(update).expect(status.BAD_REQUEST)
        console.log(response.body)
        expect(response.body.message).toBe('Course not found')
        done()
    })
    test('Expect course to be updated in case it exists', async done => {
        const response = await request(server).put('/api/v1/courses/1/update').set('auth','allow').send(update).expect(status.OK)
        expect(response.body.ok).toBe(1)
        expect(response.body.data.level).toBe(1)
        expect(response.body.data.ratings.length).toBeGreaterThan(0)
        done()
    })
    test('if contentChanged param is passed, expect course to be updated and ratings and progress reset', async done => {
        const response = await request(server).put('/api/v1/courses/2/update?contentChanged=true').set('auth','allow').send(update).expect(status.OK)
        expect(response.body.ok).toBe(1)
        expect(response.body.data.level).toBe(1)
        expect(response.body.data.ratings.length).toBe(0)
        done()
    })
})
describe('GET /api/v1/courses/:course_id/assessment/:username', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api/v1/courses/1/assessment/test').set('auth','allow')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).get('/api/v1/courses/1/assessment/test').set('auth','allow')
			.set('error', 'foo')
        expect(response.status).toEqual(status.BAD_REQUEST)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('This is a protected resource', async done => {
        const response = await request(server).get('/api/v1/courses/1/assessment/test').expect(status.UNAUTHORIZED)
        done()
    })
    test('A list of courses is returned with no query params', async done => {
        const response = await request(server).get('/api/v1/courses/1/assessment/test').set('auth','allow').expect(status.OK)
        expect(response.body.length).toBeGreaterThanOrEqual(1)
        done()
    })
})
