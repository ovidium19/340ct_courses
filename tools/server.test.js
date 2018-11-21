let axios = require('axios')
jest.mock('mongodb')
jest.mock('./modules/db-persist')
jest.mock('axios')
import * as db from './modules/db-persist'
import server from './server'
import status from 'http-status-codes'
import request from 'supertest'
import Axios from 'axios';
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
                console.log(options.headers)
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
/*
describe('GET /api/v1/courses', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api/v1/courses')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('check for NOT_FOUND status if database down', async done => {
		const response = await request(server).get('/api/v1/courses')
			.set('error', 'foo')
        expect(response.status).toEqual(status.NOT_FOUND)
		const data = JSON.parse(response.text)
		expect(data.message).toBe('foo')
		done()
    })
    test('check body for api/v1/courses', async done => {
        const response = await request(server).get('/api/v1/courses')
        expect(response.body).toEqual(expect.objectContaining({
            path: '/api/v1/courses - path'
        }))
        done()
    })
})
describe('POST /api/v1/courses', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).post('/api/v1/courses')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		done()
    })

    test('if course doesn\'t have the right schema, get error', async done => {
        const response = await request(server).post('/api/v1/courses')
                                            .send({id: 1, name: 'Bel'})
                                            .expect(status.UNPROCESSABLE_ENTITY)
        console.log(response.body)
        expect(response.body).toEqual(expect.objectContaining({message:'Course doesn\'t match schema' }))
        done()
    })
    test('if successful, return value should be the course data', async done => {
        const response = await request(server).post('/api/v1/courses')
                                            .send({_id: 2, name: 'Bel'})
                                            .expect(status.ACCEPTED)
        expect(response.body).toEqual(expect.objectContaining({name: 'Bel'}))
        done()
    })
})
describe('GET /api/v1/courses/:id', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).get('/api/v1/courses/1')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })
    test('If course doesn\'t exist, receive error', async done => {
        const response = await request(server).get('/api/v1/courses/5')
        expect(response.body.message).toBe('Course not found')
        done()
    })
    test('If successful, receive course data', async done => {
        const response = await request(server).get('/api/v1/courses/1')
        expect(response.body).toEqual(expect.objectContaining({_id: 1}))
        done()
    })
})

describe('PUT /api/v1/courses/:id', () => {
    beforeAll(runBeforeAll)
    afterAll(runAfterAll)

    test('check common response headers', async done => {
		//expect.assertions(2)
        const response = await request(server).put('/api/v1/courses/1')
        //expect(response.status).toBe(status.OK)
		expect(response.header['access-control-allow-origin']).toBe('*')
		expect(response.header['content-type']).toContain('application/json')
		done()
    })

    test('If course doesn\'t exist, receive error', async done => {
        const response = await request(server).put('/api/v1/courses/5')
                                .send({_id: 5, name: 'changed'})
                                .expect(status.UNPROCESSABLE_ENTITY)
        expect(response.body.message).toBe('Course not found')
        done()
    })

    test('If successful, receive course data', async done => {
        const response = await request(server).put('/api/v1/courses/1')
                    .send({_id: 1, name: 'changed'})
                    .expect(status.OK)
        expect(response.body).toEqual(expect.objectContaining({name: 'changed'}))
        done()
    })
})
*/
