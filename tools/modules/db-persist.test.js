jest.mock('mongodb')
import * as db from './db-persist'
import dotenv from 'dotenv'
import { getData } from 'mongodb'


dotenv.config()

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
