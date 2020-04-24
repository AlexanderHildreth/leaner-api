// Files
const asyncHandler  = require('../middlewares/async')
const Bootcamp      = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const geocoder      = require('../utils/geocoder')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async(req, res, next) => {
    let query
    const reqQuery      = { ...req.query }
    const removeFields  = ['select', 'sort', 'limit', 'page']

    removeFields.forEach(params => delete reqQuery[params])
    
    let queryStr        = JSON.stringify(reqQuery)
    queryStr            = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`) // finding mongoos query operaters in url params (gt|gte|lt|lte|in)
    query               = Bootcamp.find(JSON.parse(queryStr)).populate('courses')
    
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)  
    }
    
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)  
    } else {
        query = query.sort('-createdAt')
    }

    const page          = parseInt(req.query.page, 10) || 1
    const limit         = parseInt(req.query.limit, 10) || 15
    const startIndex    = (page - 1) * limit
    const endIndex      = page  * limit
    const total         = await Bootcamp.countDocuments()
    query               = query.skip(startIndex).limit(limit)

    const getBootcamps  = await query

    const pagination = {}
    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    
    if(startIndex > 0){
        pagination.previous = {
            page: page - 1,
            limit
        }
    }

    res.status(200)
        .json({
            success: true,
            count: getBootcamps.length,
            pagination,
            data: getBootcamps
        })
})

// @desc    Get a bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcampById = asyncHandler(async (req, res, next) => {
    const getBootcamp = await Bootcamp.findById(req.params.id);

    if(!getBootcamp) return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`, 404));

    res.status(200).json({
        success: true,
        data: getBootcamp,
    });
})

// @desc    Get bootcamp(s) within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampByRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params
    const location              = await geocoder.geocode(zipcode)
    const lat                   = location[0].latitude
    const long                  = location[0].longitude
    const radius                = distance / 6378 // Calculating radius - Earth Radius = 6378km

    const getBootcampByRadius = await Bootcamp.find({
        location: { 
            $geoWithin: { $centerSphere: [[long, lat], radius] }
        }
    })

    res.status(200)
        .json({
            success: true,
            count: getBootcampByRadius.length,
            data: {
                getBootcampByRadius
            }
        })
})

// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async(req, res, next) => {
    const createBootcamp = await Bootcamp.create(req.body)

    if (!createBootcamp) return next(new ErrorResponse(`Bootcamp not created`, 404));

    res.status(201)
        .json({
            success: true,
            data: {
                createBootcamp
            }
        })
})

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async(req, res, next) => {
    const updateBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!updateBootcamp) return next(new ErrorResponse(`Bootcamp not updated`, 404));

    res.status(200).json({
      success: true,
      data: {
        updateBootcamp
      },
    });
})

// @desc    Delete a bootcamp
// @route   DELETE /api/v/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async(req, res, next) => {
    const deleteBootcamp = await Bootcamp.findById(req.params.id)

    if (!deleteBootcamp) return next(new ErrorResponse(`Bootcamp not deleted`, 404));

    deleteBootcamp.remove()
    
    res.status(200).json({
      success: true,
      data: {}
    });
})
