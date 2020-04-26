// Modules
const express           = require('express')
// files
const auth              = require('../middlewares/auth')
const Course            = require('../models/Course')
const courseController  = require('../controllers/courseController')
const customResults     = require('../middlewares/customResults')
// const vars
const router            = express.Router({ mergeParams: true })

router.route('/')
    .get(
        customResults(Course, { path: 'bootcamp', select: 'name description' }),
        courseController.getCourses
        )
    .post(
        auth.protect,
        courseController.createCourse
    )

router.route('/:id')
    .get(courseController.getCourseById)
    .put(
        auth.protect,
        courseController.updateCourse
    )
    .delete(
        auth.protect,
        courseController.deleteCourse
    )

module.exports = router
