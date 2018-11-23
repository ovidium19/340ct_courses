import {MongoClient, ObjectID} from  'mongodb'
import { connect, schemaCheck } from './utils'
import dotenv from 'dotenv'
dotenv.config()
const basicUser = {
    username: process.env.MONGO_ADMIN_USERNAME,
    password: process.env.MONGO_ADMIN_PASS
}
const courseSchema = {
    name: '',
    username: '',
    content: '',
    published: '',
    level: '',
    category: ''
}
const ratingSchema = {
    username: '',
    rating: ''
}
export async function getCourses(options) {
    let client = options.user ? await connect(options.user): await connect(basicUser)

    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection(process.env.MONGO_COURSES_COLLECTION)
    let aggPipe =  [
        { $match: { published: true } },
        { $addFields:
            {
                'avg_rating': { $avg: '$ratings.rating' },
                'pages': {$size: '$content.pages'}
            }
        },
        { $project: {
            'content': 0
        }},
        { $project:
            {
                ratings: {
                    $filter: {
                        input: '$ratings',
                        as: 'rat',
                        cond: { $eq: ['$$rat.username', options.username] }
                    }
                },
                progress: {
                    $filter: {
                        input: '$progress',
                        as: 'prog',
                        cond: { $eq: ['$$prog.username', options.username] }
                    }
                },
                published: 1,
                name: 1,
                username: 1,
                category: 1,
                tags: 1,
                created_at: 1,
                level: 1,
                avg_rating: 1,
                pages: 1
            }
        }]
    if (options.hasOwnProperty('random')){
        aggPipe.push({$sample: {size: 5}})
    }
    else {
        if (options.hasOwnProperty('category')){
            aggPipe[0].$match.category = options.category
        }

        if (options.hasOwnProperty('page') && options.hasOwnProperty('limit')){
            aggPipe.push({$skip: (options.page-1) * parseInt(options.limit)})
            aggPipe.push({$limit: parseInt(options.limit)})
        }
    }
    let cursor = await collection.aggregate(aggPipe,options)
    let results = await cursor.toArray()
    await cursor.close()
    await client.close()
    return results
}
export async function getCourseById(options) {
    let client = options.user ? await connect(options.user): await connect(basicUser)
    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection(process.env.MONGO_COURSES_COLLECTION)
    let aggPipe =  [
        { $match: { published: true, '_id': ObjectID.createFromHexString(options.id) } },
        { $addFields:
            {
                'avg_rating': { $avg: '$ratings.rating' },
                'pages': {$size: '$content.pages'}
            }
        },
        { $project:
            {
                ratings: {
                    $filter: {
                        input: '$ratings',
                        as: 'rat',
                        cond: { $eq: ['$$rat.username', options.username] }
                    }
                },
                progress: {
                    $filter: {
                        input: '$progress',
                        as: 'prog',
                        cond: { $eq: ['$$prog.username', options.username] }
                    }
                },
                published: 1,
                name: 1,
                username: 1,
                category: 1,
                tags: 1,
                created_at: 1,
                level: 1,
                avg_rating: 1,
                pages: 1
            }
        }]
    let cursor = await collection.aggregate(aggPipe,options)
    let results = await cursor.toArray()
    await cursor.close()
    //let result = await collection.findOne({'_id': ObjectID.createFromHexString(options.id)})
    await client.close(true)
    return results
}
export async function postCourse(options) {
    if (!(schemaCheck(courseSchema,options.data))){
        console.log('Throwing error')
        throw new Error('Activity doesn\'t match schema')
    }

    let client = options.user ? await connect(options.user): await connect(basicUser)

    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection(process.env.MONGO_COURSES_COLLECTION)
    let result = await collection.insertOne(options.data)
    await client.close()
    return {id: result.insertedId}
}
export async function rateCourse(options){
    if (!(schemaCheck(ratingSchema,options.data))){
        console.log('Throwing error')
        throw new Error('Rating doesn\'t match schema')
    }
    console.log(options)
    let client = options.user ? await connect(options.user): await connect(basicUser)
    let result
    let db = await client.db(process.env.MONGO_DBNAME)
    let collection = await db.collection(process.env.MONGO_COURSES_COLLECTION)
    let filter = {
        '_id': ObjectID.createFromHexString(options.id),
        'ratings': { $elemMatch : { 'username': options.data.username}}
    }
    let update = {
        '$set': { 'ratings.$.rating': options.data.rating}
    }
    result = await collection.findOneAndUpdate(filter,update,options)
    if (!result.value) {
        let filter = {
            '_id': ObjectID.createFromHexString(options.id)
        }
        let update = {
            '$push': { 'ratings': options.data}
        }
        result = await collection.findOneAndUpdate(filter,update,options)
    }
    await client.close()
    return result
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
