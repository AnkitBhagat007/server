const mongoose = require('mongoose')

const connectDB = async () => {
	const URI = process.env.DB_URI.replace(
		'<DB_USERNAME>',
		process.env.DB_USERNAME
	).replace('<DB_PASSWORD>', process.env.DB_PASSWORD)

	await mongoose.connect(URI)

	console.log('MongoDB Connected')
}

const disconnectDB = async () => {
	await mongoose.disconnect()
	console.log('MongoDB Disconnected')
}

module.exports = { connectDB, disconnectDB }
