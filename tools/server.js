/*
eslint no-console: off
*/
import koa from 'koa'
import koaBP from 'koa-bodyparser'
import Router from 'koa-router'
import status from 'http-status-codes'
import mount from 'koa-mount'
import path from 'path'
import * as db from './modules/db-persist'
import morgan from 'koa-morgan'
import v1 from './versions/v1/v1'
require('dotenv').config()
const app = new koa()
const port = 3030
app.use(koaBP())
app.use(morgan('tiny'))
const router = new Router()
app.use( async(ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('content-type','application/json')
	await next()
})
router.get('/api', async ctx => {
    ctx.set('Allow','GET')
    ctx.status = status.OK
    try{
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        const collections = await db.fetchCollections()
        const names = collections.map(c => {
            return {
                name: c.s.name
            }
        })
        ctx.body = names
    }
    catch(err){
        ctx.status = status.NOT_FOUND
		ctx.body = {status: 'error', message: err.message}
    }
})
app.use(router.routes())
app.use(router.allowedMethods())
app.use(mount('/api/v1',v1))
const server = app.listen(port, async() => {
    console.log(`Listening on port ${port}`)
})
/*
// ctrl-c to trigger
process.on('SIGINT', async () => {
    // let's shut everything down!
    console.log("shutting down...")
    try{
        await db.close()
        console.log("Db connection was shut down")
    }
    catch(err) {
        console.log(err.message)
    }
    server.close(function() {
      console.log("shut down!")
      process.exit()
    })
  })
*/

export default server
