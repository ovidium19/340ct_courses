import {MongoClient, ObjectID} from  'mongodb'
import { connect } from './utils'
import dotenv from 'dotenv'
dotenv.config()


const basicUser = {
    username: process.env.MONGO_ADMIN_USERNAME,
    password: process.env.MONGO_ADMIN_PASS
}
async function getClientAndCollection(user,dbName,colName) {
    let client = await connect(user)
    let db = await client.db(dbName)
    let collection = await db.collection(colName)
    return {client, collection}
}
export async function getCourses(options) {
    let client = await connect(basicUser)
    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection(process.env.MONGO_COURSES_COLLECTION)
    console.log(options)
    let results
    if (options.hasOwnProperty('random')){
        let cursor = await collection.aggregate([


            { $project: {
                'content': 0
            }},
            { $project: {
                'ratings': { $filter: {
                    'input': '$ratings',
                    'as': 'rat',
                    'cond': { $eq: ['$$rat.username', options.username]}
                }}
            }},
            { $match: { published: true } },
            { $sample: { size: 5 }}
        ])
        results = await cursor.toArray()
    }

    await client.close()
    return results
}

export async function getCourseById(id){
    let client
    let result

    client = await connect(basicUser)
    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection('courses')
    result = await collection.findOne({'_id': parseInt(id)})
    await client.close()


    return result
}
export async function createCourse(course, user){

    if (!course.hasOwnProperty('name') || !course.hasOwnProperty('_id')) throw new Error('Course doesn\'t match schema')
    let client
    let result

    client = await connect(user)

    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection('courses')
    result = await collection.insertOne(course)

    await client.close()

    return result
}
export async function updateCourse(course, user){
    if (!course.hasOwnProperty('name') || !course.hasOwnProperty('_id')) throw new Error('Course doesn\'t match schema')
    let client
    let result
    client = await connect(user)
    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection('courses')
    result = await collection.replaceOne({'_id': course['_id']},course)
    //result = await collection.replaceOne({"_id": course['_id']},course)
    await client.close()
    return result
}


