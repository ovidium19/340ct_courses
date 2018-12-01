import koa from 'koa'
import koaBP from 'koa-bodyparser'
import Router from 'koa-router'
import status from 'http-status-codes'
import mount from 'koa-mount'
import morgan from 'koa-morgan'
import v1 from './versions/v1/v1'
require('dotenv').config()
const currentVersion = 'v1'
const api_schema = {
    base: 'http://localhost:3031/',
    currentVersion: currentVersion,
    routes: [
        {
            path: '/api',
            description: 'Documentation for this api',
            methods : 'GET'
        },
        {
            path: `/api/${currentVersion}/courses`,
            method: 'GET',
            params: 'username, page, limit, category, random',
            description: 'Get courses from the database. Params greatly influence this method. If random is specified, you get 5 random courses'
        },
        {
            path: `/api/${currentVersion}/courses/:id`,
            method: 'GET',
            description: 'Get course by id'
        },
        {
            path: `/api/${currentVersion}/courses/:course_id/assessment/:username`,
            method: 'GET',
            description: 'Get grades of (username) related to the course with (course_id)'
        },
        {
            path: `/api/${currentVersion}/courses/:course_id/assessment/:username`,
            method: 'POST',
            description: 'Post grades for (username) related to the course with (course_id)'
        },
        {
            path: `/api/${currentVersion}/courses/create`,
            method: 'POST',
            description: 'Add a course to the database. Do not specify the _id field'
        },
        {
            path: `/api/${currentVersion}/courses/:id/update`,
            method: 'PUT',
            description: 'Update a course. If you update the course content, the ratings and progress are reset.'
        },
        {
            path: `/api/${currentVersion}/courses/:id/rate`,
            method: 'PUT',
            description: 'Add or update a user\'s rating of a course. Body has to include a username field'
        },
        {
            path: `/api/${currentVersion}/courses/:id/progress`,
            method: 'PUT',
            description: 'Add or update a user\'s progress of a course. Body has to include a username field'
        }
    ]
}

const app = new koa()
const port = 3031
app.use(koaBP())
app.use(morgan('tiny'))
const router = new Router()
app.use( async(ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
<<<<<<< Updated upstream
||||||| merged common ancestors
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    ctx.set('Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS')
=======
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
>>>>>>> Stashed changes
    ctx.set('content-type','application/json')
	await next()
})
router.get('/api', async ctx => {
    ctx.set('Allow','GET')
    ctx.status = status.OK
    try{
        if (ctx.get('error')) throw new Error(ctx.get('error'))
        ctx.body = JSON.stringify(api_schema)
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
