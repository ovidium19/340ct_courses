import koa from 'koa'
import koaBP from 'koa-bodyparser'
import Router from 'koa-router'
import koabp from 'koa-bodyparser'
import status from 'http-status-codes'
import path from 'path'
import * as db from '../../../modules/db-persist'

const app = new koa()
app.use(koaBP())
const port = 3030
const router = new Router()
router.get('/',async ctx => {
    ctx.set('Allow','GET')
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
router.get('/:id', async ctx => {
    ctx.set('Allow','GET')
    //Read Authorization Header, check json web token, send to db-persist.js for fetching data
    //call db.getCourseById
    try{
        const result = await db.getCourseById(ctx.params.id,ctx.query)
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
