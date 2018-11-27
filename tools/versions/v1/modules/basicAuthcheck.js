import axios from 'axios'
export default async function(ctx,next) {
    let newHeaders = {
        'Authorization': ctx.headers.authorization
    }
    if (ctx.headers['auth']) newHeaders.auth = ctx.headers['auth']
    let result = await axios({
        url: process.env.USER_SERVICE_LOGIN_PATH,
        baseURL: process.env.USER_SERVICE_BASE_URL,
        method: 'HEAD',
        headers: newHeaders
    })
    await next()
}
