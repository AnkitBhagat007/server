const bcrypt = require('bcrypt')
const validator = require('validator')

const { Schema, model } = require('mongoose')

const userSchema = new Schema({
	name: {
		type: String,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		validate: {
			validator: (email) =>
				validator.isEmail(email) &&
				/^[a-zA-Z0-9._%+-]+@(outlook\.com|hotmail\.com|live\.com|msn\.com|iitp\.ac\.in)$/.test(
					email
				),
			message: 'Please provide a valid outlook email address!',
		},
	},
	password: {
		type: String,
		minlength: 8,
		validate: {
			validator: (password) =>
				validator.isStrongPassword(password, {
					minLength: 8,
					minLowercase: 1,
					minUppercase: 1,
					minNumbers: 1,
					minSymbols: 1,
				}),
			message:
				'Password is too weak! It must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol',
		},
	},
	confirmPassword: {
		type: String,
		minlength: 8,
		validate: {
			validator: function (value) {
				return value === this.password
			},
			message: 'Passwords do not match',
		},
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
		immutable: true,
	},
	admin: {
		type: String,
		enum: [
			null,
			'gensec-wel',
			'gensec-tech',
			'gensec-cult',
			'gensec-sports',
			'vpg',
			'pic',
			'arsa',
			'drsa',
			'adean',
		],
		unqiue: true,
		default: null,
	},
	picture: {
		type: String,
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetTokenExpires: Date,
})

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()

	this.password = await bcrypt.hash(this.password, 12)
	this.confirmPassword = undefined

	next()
})

module.exports = model('User', userSchema)
