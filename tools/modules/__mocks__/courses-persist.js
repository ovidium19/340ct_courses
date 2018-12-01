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
        category: 'not-git',
        ratings: [
            {
                username: 'test',
                rating: 4
            }
        ],
        progress: [
            {
                username: 'test',
                finished: false,
                current_page: 1
            }
        ]
    },
    {
        _id: 2,
        name: 'CourseTest',
        category: 'git',
        ratings: [
            {
                username: 'test',
                rating: 4
            }
        ],
        progress: [
            {
                username: 'test',
                finished: false,
                current_page: 1
            }
        ]
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
const grades = [
    {
        _id: 1,
        username: 'test',
        course_id: 1
    }
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
export async function postCourse(options) {
    return Promise.resolve({id: courses.length+1})
}
export async function rateCourse(options){
    return new Promise((resolve,reject) => {
        console.log(options)
        let course = courses.find(c => c['_id'] == options.id)
        if (!(course)) reject('Course not found')

        else{
            let courseRating = course.ratings.find(r => r.username == options.data.username)
            if (courseRating){
                courseRating.rating = options.data.rating

            }
            else{
                course.ratings.push(options.data)
            }
            resolve({value: course})
        }

    })
}
export async function progressCourse(options){
    return new Promise((resolve,reject) => {
        let course = courses.find(c => c['_id'] == options.id)
        if (!(course)) reject({message: 'Course not found'})

        else{
            let courseProgress = course.progress.find(r => r.username == options.data.username)
            if (courseProgress){
                courseProgress.finished = options.data.finished
                courseProgress.current_page = options.data.current_page

            }
            else{
                course.progress.push(options.data)
            }
            resolve({value: course})
        }

    })
}


export async function updateCourse(options){
    return new Promise((resolve,reject) => {
        let course = courses.find(c => c['_id'] == options.id)
        if (!(course)) reject({message: 'Course not found'})

        else{
            if (options.contentChanged){
                let newCourse = Object.assign({},options.data)
                newCourse.ratings = []
                newCourse.progress = []
                newCourse['_id'] = course['_id']
                resolve({
                    ok: 1,
                    data: newCourse
                })
            }
            else{
                resolve({
                    ok: 1,
                    data: Object.assign({},course,options.data)
                })
            }
        }

    })
}
export async function getAssessmentResultsForCourse(options) {
    let results = grades.filter(g => g.course_id == options.course_id && g.username == options.username)
    return results
}
export async function postGrades(options){
    return Promise.resolve({id: grades.length+1})
}
export async function getCoursesProgressedByUser(options) {

    return Promise.resolve([{
        _id: 1,
        grades: [{
            _id: 1,
            username: 'test',
            grade: '80'
        }]
    }])

}
