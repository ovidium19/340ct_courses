const users = [
    {
        username: 'ovidium19',
        password: '340CTWork'
    }
]
const courses = [
    {
        _id: 1,
        name: 'CourseTest',
        category: 'not-git'
    },
    {
        _id: 2,
        name: 'CourseTest',
        category: 'git'
    },
    {
        _id: 3,
        name: 'CourseTest',
        category: 'git'
    },
    {
        _id: 4,
        name: 'CourseTest',
        category: 'git'
    },
    {
        _id: 5,
        name: 'CourseTest',
        category: 'git'
    },
    {
        _id: 6,
        name: 'CourseTest',
        category: 'git'
    },

]
export async function getCourses(options){
    let filteredCourses = Array.from(courses)
    if (options.category) {
        filteredCourses = filteredCourses.filter(c => c.category == options.category)
    }
    if (options.page && options.limit){
        let start = (options.page-1) * options.limit
        return filteredCourses.slice(start,start+options.limit)
    }
    return filteredCourses
}
export async function getCourseById(options){

    let course = courses.find(c => c['_id'] == options.id)
    if (!course) return []
    return [course]

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
