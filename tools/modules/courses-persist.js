import {MongoClient, ObjectID} from  'mongodb'
import { connect } from './utils'
import dotenv from 'dotenv'
dotenv.config()
const basicUser = {
    username: process.env.MONGO_ADMIN_USERNAME,
    password: process.env.MONGO_ADMIN_PASS
}

export async function getCourses(options) {
    let client = options.user ? await connect(options.user): await connect(basicUser)

    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection(process.env.MONGO_COURSES_COLLECTION)
    let aggPipe =  [
        { $addFields: {
        'avg_rating': { $avg: '$ratings.rating' }
                }
        },
        { $project: {
            'content': 0
        }},
        { $match: { published: true } }]
    if (options.hasOwnProperty('random')){
        aggPipe.push({$sample: {size: 5}})
    }
    else {
        if (options.hasOwnProperty('category')){
            aggPipe[2].$match.category = options.category
        }

        if (options.hasOwnProperty('page') && options.hasOwnProperty('limit')){
            aggPipe.push({$skip: (options.page-1) * parseInt(options.limit)})
            aggPipe.push({$limit: parseInt(options.limit)})
        }
    }

    let cursor = await collection.aggregate(aggPipe,options)
    let results = await cursor.toArray()
    await client.close()
    return results
}

/*
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

*/
