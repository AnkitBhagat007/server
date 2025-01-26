const jwt = require('jsonwebtoken')
const { sendMail } = require('./api.util')

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn: process.env.JWT_EXPIRES_IN,
	})
}

const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET)
}

const sendResetToken = (email, token) => {
	sendMail((text = `${process.env.CLIENT_URL}/auth/reset/${token}`))
}

module.exports = {
	signToken,
	verifyToken,
	sendResetToken,
}
