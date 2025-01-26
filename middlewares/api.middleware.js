const multer = require('multer')

const { catchAsync } = require('../utils/error.util')
const { AppError } = require('../controllers/error.controller')
const { userModel } = require('../models')

const getUserID = catchAsync(async (req, res, next) => {
	req.params.id = req.body.id

	req.user = await userModel.findById(req.params.id)

	next()
})

const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'public/uploads/')
		},
		filename: (req, file, cb) => {
			cb(null, `${req.user.id}-${Date.now()}.pdf`)
		},
	}),
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'application/pdf') {
			cb(null, true)
		} else {
			cb(new AppError('Upload pdf file!', 400), false)
		}
	},
})

const reupload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'public/uploads/')
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname)
		},
	}),
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'application/pdf') {
			cb(null, true)
		} else {
			cb(new AppError('Upload pdf file!', 400), false)
		}
	},
})

const uploadPDF = upload.single('pdfFile')
const reuploadPDF = reupload.single('pdfFile')

module.exports = {
	getUserID,
	uploadPDF,
	reuploadPDF,
}
