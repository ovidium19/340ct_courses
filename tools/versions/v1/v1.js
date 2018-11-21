import koa from 'koa'
import koaBP from 'koa-bodyparser'
import Router from 'koa-router'
import status from 'http-status-codes'
import courses from './modules/courses'
import mount from 'koa-mount'
import basicAuth from './modules/basicAuthcheck'

const app = new koa()
const router = new Router()
app.use(async (ctx,next) => {
    await next().catch(err => {
        ctx.status = status.UNAUTHORIZED
        ctx.body = {status: status.UNAUTHORIZED, message: err.message}
    })
})
app.use(basicAuth)
router.get('/',async ctx => {
    ctx.set('Allow','GET')
    try {
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        ctx.status = status.OK
        ctx.body = {path: '/api/v1 - path'}
    }
    catch(err) {
        ctx.status = status.NOT_FOUND
		ctx.body = {status: 'error', message: err.message}
    }

})
app.use(mount('/courses',courses))
app.use(router.routes())
app.use(router.allowedMethods())

export default app
