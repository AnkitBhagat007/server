class AppError extends Error {
	constructor(message, status) {
		super(message)

		this.status = status
		this.isOperational = true

		Error.captureStackTrace(this, this.constructor)
	}
}

const handleDevError = (err, res) => {
	err.status = err.status || 500
	return res.status(err.status).json({
		status: err.status,
		message: err.message,
		stack: err.stack,
	})
}

const handleProdError = (err, res) => {
	if (err.isOperational) {
		return res.status(err.status).json({
			status: err.status,
			message: err.message,
		})
	} else {
		if (err.errorResponse?.code === 11000) {
			const key = Object.keys(err.errorResponse.keyValue)[0]
			return res.status(400).json({
				status: 400,
				message: `This ${key} is already in use. Please use a different value.`,
			})
		}

		if (err.name === 'ValidationError') {
			const key = Object.values(err.errors)
			const message =
				key.length === 1
					? key[0].message
					: key.reduce((a, { message }) => a + '. ' + message)

			return res.status(400).json({
				status: 400,
				message: message,
			})
		}

		if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({
				status: 401,
				message: 'Invalid token. Please log in and try again.',
			})
		}

		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({
				status: 401,
				message: 'Your session has expired. Please log in again.',
			})
		}

		if (err.name === 'CastError') {
			return res.status(400).json({
				status: 400,
				message: `The value you provided for ${err.path} is not valid. Please try again.`,
			})
		}

		return res.status(500).json({
			status: 500,
			message: 'Something went very wrong. Please try again later.',
		})
	}
}

const globalErrorController = (err, req, res, next) => {
	if (process.env.NODE_ENV !== 'test') console.log(err)

	if (process.env.NODE_ENV === 'development') {
		return handleDevError(err, res)
	}

	return handleProdError(err, res)
}

const notFound = (req, res, next) => {
	next(new AppError('Endpoint does not exist', 404))
}

module.exports = { globalErrorController, notFound, AppError }
