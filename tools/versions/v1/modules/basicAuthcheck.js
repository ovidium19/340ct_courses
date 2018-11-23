import axios from 'axios'
export default async function(ctx,next) {
    let result = await axios({
        url: process.env.USER_SERVICE_LOGIN_PATH,
        baseURL: process.env.USER_SERVICE_BASE_URL,
        method: 'HEAD',
        headers: ctx.headers
    })
    await next()
}
