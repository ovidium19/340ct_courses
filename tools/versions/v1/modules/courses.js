import koa from 'koa'
import koaBP from 'koa-bodyparser'
import Router from 'koa-router'
import koabp from 'koa-bodyparser'
import status from 'http-status-codes'
import * as db from '../../../modules/courses-persist'
import dotenv from 'dotenv'
dotenv.config()
const app = new koa()

app.use(koaBP())

const router = new Router()
router.get('/', async ctx => {
    /*
    query:
        random=true .. random courses
        category= .. specify category
        tags = .. specify tags separated by a dot
        page= .. specify page number
        limit = .. how many items per page
    */
    ctx.set('Allow','GET, POST')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))

        let res = await db.getCourses({...ctx.query})
        ctx.status = status.OK
        ctx.body = res
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
router.post('/create', async ctx => {
    ctx.set('Allow','POST')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))

        let res = await db.postCourse({data: ctx.request.body})
        ctx.status = status.OK
        ctx.body = res
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
router.get('/:id', async ctx => {
    ctx.set('Allow','GET')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        let options = {...ctx.params, ...ctx.query}
        let res = await db.getCourseById(options)
        ctx.status = status.OK
        ctx.body = res
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
router.put('/:id/rate', async ctx => {
    ctx.set('Allow','PUT')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        let options = {...ctx.params, ...ctx.query}
        options.data = ctx.request.body
        let res = await db.rateCourse(options)
        ctx.status = status.OK
        ctx.body = res
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
router.put('/:id/progress', async ctx => {
    ctx.set('Allow','PUT')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        let options = {...ctx.params, ...ctx.query}
        options.data = ctx.request.body
        let res = await db.progressCourse(options)
        ctx.status = status.OK
        ctx.body = res
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
router.put('/:id/update', async ctx => {
    ctx.set('Allow','PUT')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        let options = {...ctx.params, ...ctx.query}
        options.data = ctx.request.body
        let res = await db.updateCourse(options)
        ctx.status = status.OK
        ctx.body = res
    }
    catch(err) {
        ctx.status = status.BAD_REQUEST
		ctx.body = {status: status.BAD_REQUEST, message: err.message}
    }
})
//TODO: Put routes for /rate, /progress, /update
/*
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
*/

app.use(router.routes())
app.use(router.allowedMethods())

export default app
