import koa from 'koa'
import koaBP from 'koa-bodyparser'
import Router from 'koa-router'
import koabp from 'koa-bodyparser'
import status from 'http-status-codes'
import path from 'path'
import * as db from '../../../modules/db-persist'
import dotenv from 'dotenv'

dotenv.config()

const adminUser = {
    username: process.env.MONGO_ADMIN_USERNAME,
    password: process.env.MONGO_ADMIN_PASS
}
const app = new koa()
app.use(koaBP())
app.use( async(ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('content-type','application/json')
	await next()
})
const port = 3030
const router = new Router()
router.get('/',async ctx => {
    ctx.set('Allow','GET, POST')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        ctx.status = status.OK
        ctx.body = {path: '/api/v1/courses - path'}
    }
    catch(err) {
        ctx.status = status.NOT_FOUND
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
router.post('/', async ctx => {
    ctx.set('Allow','GET, POST')
    const course = ctx.request.body
    try{
        const result = await db.createCourse(course,adminUser)
        ctx.status = status.ACCEPTED
        ctx.body = result
    }
    catch(err){
        console.log(`error: ${err.message}`)
        ctx.status = status.UNPROCESSABLE_ENTITY
        //ctx.response.message = err.message
        ctx.body = {status: status.UNPROCESSABLE_ENTITY, message: err.message}
    }
})
router.get('/:id', async ctx => {
    ctx.set('Allow','GET, PUT')
    //Read Authorization Header, check json web token, send to db-persist.js for fetching data
    //call db.getCourseById
    try{
        const result = await db.getCourseById(ctx.params.id, adminUser)
        ctx.body = result
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
        ctx.body = Object.assign({},ctx.params,ctx.query,{status: status.BAD_REQUEST, message: err.message})
    }
    //send response
})
router.put('/:id', async ctx => {
    ctx.set('Allow','GET, PUT')
    //Read Authorization Header, check json web token, send to db-persist.js for fetching data
    //call db.getCourseById
    try{
        const result = await db.updateCourse(ctx.request.body, adminUser)
        ctx.status = status.OK
        ctx.body = result
    }
    catch(err) {
        ctx.status = status.UNPROCESSABLE_ENTITY
        ctx.body = Object.assign({},ctx.params,ctx.query,{status: status.UNPROCESSABLE_ENTITY, message: err.message})
    }
    //send response
})

app.use(router.routes())
app.use(router.allowedMethods())

export default app