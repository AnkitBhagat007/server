const express = require('express')
const rateLimit = require('express-rate-limit')

const {
	register,
	login,
	logout,
	getResetToken,
	verifyResetToken,
	reset,
	changePassword,
	updateProfile,
} = require('../controllers/auth.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')
const { AppError } = require('../controllers/error.controller')

const router = express.Router()

const authLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: process.env.NODE_ENV === 'development' ? 100 : 5,
	handler: (req, res, next) => {
		next(
			new AppError(
				'Too many login attempts, please try again later after 10 minutes',
				429
			)
		)
	},
})

router.use(authLimiter)

router.route('/register').post(register) //used when hardcording the admin user
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/get-password-reset-token').post(getResetToken)
router.route('/verify-password-reset-token').post(verifyResetToken)
router.route('/password-reset/:token').patch(reset)
router.route('/change-password').patch(isAuthenticated, changePassword)
router.route('/update-profile').patch(isAuthenticated, updateProfile)

module.exports = router
