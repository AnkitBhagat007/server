const express = require('express')
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware')
const {
	uploadPDF,
	reuploadPDF,
	getUserID,
} = require('../middlewares/api.middleware')

const router = express.Router()

const {
	getUserByID,
	downloadPDF,
	blurImage,
	dynamicBlurImage,
	getNotesheetById,
	getNotesheetsByUserID,
	createNotesheet,
	approveNotesheet,
	rejectNotesheet,
} = require('../controllers/api.controller')

//user-related fetch routes
router.route('/user').get((req, res) => res.json({ message: 'Welcome to the API' }))
router.route('/user/me').get(isAuthenticated, getUserID, getUserByID)
router.route('/user/:id').get(isAuthenticated, isAdmin, getUserByID)
router.route('/download/notesheet/:pdf').get(downloadPDF)

//notesheet-related fetch routes
router.route('/notesheet/:id').get(isAuthenticated, getNotesheetById)
router
	.route('/notesheets/user/me')
	.get(isAuthenticated, getUserID, getNotesheetsByUserID)

//notesheet-related CUD routes
router
	.route('/notesheet/create')
	.post(isAuthenticated, getUserID, uploadPDF, createNotesheet)
router
	.route('/notesheet/approve')
	.patch(isAuthenticated, isAdmin, getUserID, approveNotesheet)
router
	.route('/notesheet/reject')
	.delete(isAuthenticated, isAdmin, getUserID, rejectNotesheet)

//image-related routes
router.route('/get-blur-image').post(blurImage)
router.route('/get-dynamic-blur-image').post(dynamicBlurImage)

module.exports = router
