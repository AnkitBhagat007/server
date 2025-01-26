const { verifyToken } = require('../utils/auth.util')
const { catchAsync } = require('../utils/error.util')
const { AppError } = require('../controllers/error.controller')
const userModel = require('../models/user.model')

const isAuthenticated = catchAsync(async (req, res, next) => {
	if (
		!req.headers.authorization ||
		!req.headers.authorization.startsWith('Bearer')
	)
		throw new AppError('You are not authenticated', 401)

	const token = req.headers.authorization.split(' ')[1]

	if (!token) throw new AppError('You are not authenticated', 401)

	//blacklist token check

	const decoded = await verifyToken(token)

	const user = await userModel.findById(decoded.id)

	if (!user) throw new AppError('User not found', 404)

	if (
		user.passwordChangedAt &&
		parseInt(user.passwordChangedAt.getTime() / 1000, 10) > decoded.iat
	)
		throw new AppError('Password changed. Please login again', 401)

	req.body.id = user.id

	next()
})

const isAdmin = catchAsync(async (req, res, next) => {
	if (
		!req.headers.authorization ||
		!req.headers.authorization.startsWith('Bearer')
	)
		throw new AppError('You are not authenticated', 401)

	const token = req.headers.authorization.split(' ')[1]

	if (!token) throw new AppError('You are not authenticated', 401)

	//blacklist token check

	const decoded = await verifyToken(token)

	const user = await userModel.findById(decoded.id)

	if (!user) throw new AppError('User not found', 404)

	if (user.role !== 'admin')
		throw new AppError('You are not authorized to access this route', 403)

	if (
		user.passwordChangedAt &&
		parseInt(user.passwordChangedAt.getTime() / 1000, 10) > decoded.iat
	)
		throw new AppError('Password changed. Please login again', 401)

	next()
})

module.exports = { isAuthenticated, isAdmin }
