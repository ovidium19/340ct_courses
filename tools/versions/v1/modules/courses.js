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
const port = 3030
const router = new Router()
router.get('/',async ctx => {
    ctx.set('Allow','GET, POST')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        ctx.status = status.OK
        ctx.body = {path: "/api/v1/courses - path"}
    }
    catch(err) {
        ctx.status = status.NOT_FOUND
		ctx.body = {status: 'error', message: err.message}
    }
})
router.post('/', async ctx => {
    const course = ctx.request.body
    try{
        const result = await db.createCourse(course,adminUser)
        ctx.status = status.ACCEPTED
        ctx.body = result
    }
    catch(err){
        ctx.body = {status: status.NOT_MODIFIED, message: err.message}
    }
})
router.get('/:id', async ctx => {
    ctx.set('Allow','GET')
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

app.use(router.routes())
app.use(router.allowedMethods())

export default app
