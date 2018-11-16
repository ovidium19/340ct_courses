const users = [
    {
        username: 'ovidium19',
        password: '340CTWork'
    }
]
const courses = [
    {
        _id: 1,
        name: 'CourseTest'
    }
]
export async function createUser(userData) {
    return new Promise((resolve,reject) => {
        if (!(userData.hasOwnProperty('username')) || !(userData.hasOwnProperty('password'))){
            reject({message: 'Not the right data'})
        }
        if (users.find(u => u.username == userData.username)){
            reject({message: 'Username is in use'})
        }
        users.push(userData)
        resolve(users.find(u => u.username == userData.username))
    })
}
export async function getCourseById(id,user){

    if (!(users.find(u => u.username == user.username && u.password == user.password))) throw new Error('Authentication failed')
    let course = courses.find(c => c['_id'] == id)
    if (!course) throw new Error('Course not found')
    return course

}

export async function createCourse(course,user){
    if (!(users.find(u => u.username == user.username && u.password == user.password))) throw new Error('Authentication failed')
    if (!course.hasOwnProperty('_id') || !course.hasOwnProperty('name')){
        console.log('Course doesn\'t match schema')
        throw new Error('Course doesn\'t match schema')
    }
    courses.push(course)
    return (courses.find(c => c.name == course.name))
}

export async function updateCourse(course,user){
    if (!(users.find(u => u.username == user.username && u.password == user.password))) throw new Error('Authentication failed')
    if (!course.hasOwnProperty('_id') || !course.hasOwnProperty('name')){
        throw new Error('Course doesn\'t match schema')
    }
    let replacedCourse = courses.findIndex(c => c['_id'] == course['_id'])
    if (replacedCourse < 0) throw new Error('Course not found')
    courses.splice(replacedCourse,1,course)
    return (courses.find(c => c.name == course.name))
}
