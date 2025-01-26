const { Schema, model } = require('mongoose')
const { hierarchyMantained } = require('../utils/api.util')
const { AppError } = require('../controllers/error.controller')

const notesheetSchema = new Schema({
	subject: {
		type: String,
		required: [true, 'Subject for notesheet is required'],
		trim: true,
	},
	amount: {
		type: Number,
		required: [true, 'Amount for notesheet is required'],
		immutable: true,
	},
	raisedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Raised by detail is required'],
		immutable: true,
	},
	raiser: {
		type: String,
		required: [true, 'Raiser detail is required'],
		immutable: true,
	},
	raisedAt: {
		type: Date,
		default: () => Date.now(),
		immutable: true,
	},
	approvedAt: {
		type: Date,
		default: null,
	},
	rejectedAt: {
		type: Date,
		default: null,
	},
	pdf: {
		type: String,
		required: [true, 'PDF link is required'],
		immutable: true,
	},
	expiresAt: {
		type: Date,
		default: () => getNextMidnight(21),
		immutable: true,
	},
	requiredApprovals: {
		type: [Schema.Types.ObjectId],
		ref: 'User',
		validate: {
			validator: function () {
				return hierarchyMantained(this.requiredApprovals)
			},
			message: 'Hierarchy for notesheet approval is not maintained',
		},
	},
	currentRequiredApproval: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: function () {
			return this.requiredApprovals[0]
		},
	},
	status: {
		state: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		passedApprovals: {
			type: [Schema.Types.ObjectId],
			ref: 'User',
			default: [],
		},
		currentRequiredApproval: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		pendingApprovals: {
			type: [Schema.Types.ObjectId],
			ref: 'User',
			default: [],
		},
		rejectedBy: {
			admin: {
				type: Schema.Types.ObjectId,
				ref: 'User',
				default: null,
			},
			comment: {
				type: String,
				default: null,
			},
		},
	},
})

notesheetSchema.pre('save', function (next) {
	if (this.status.rejectedBy.admin) {
		this.currentRequiredApproval = null
		this.status.currentRequiredApproval = null
		this.status.pendingApprovals = []
		this.status.state = 'rejected'
		this.expiresAt = null
		this.rejectedAt = Date.now()
	} else {
		const index = this.requiredApprovals.indexOf(
			this.currentRequiredApproval
		)

		if (
			(index === -1 || index >= this.requiredApprovals.length) &&
			this.currentRequiredApproval !== null
		)
			throw new AppError('Invalid current required approval', 400)

		if (this.currentRequiredApproval) {
			this.status.passedApprovals = this.requiredApprovals.slice(0, index)
			this.status.currentRequiredApproval = this.currentRequiredApproval
			this.status.pendingApprovals = this.requiredApprovals.slice(
				index + 1
			)
			this.status.state = 'pending'
		} else {
			this.status.passedApprovals = this.requiredApprovals
			this.status.currentRequiredApproval = null
			this.status.pendingApprovals = []
			this.status.state = 'approved'
			this.expiresAt = null
			this.approvedAt = Date.now()
		}
	}

	next()
})

module.exports = model('Notesheet', notesheetSchema)

function getNextMidnight(daysToAdd) {
	const now = new Date()
	const midnight = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() + daysToAdd
	)
	midnight.setHours(0, 0, 0, 0)
	return midnight
}
