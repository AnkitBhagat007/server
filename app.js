const express = require('express')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const passport = require('passport')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')

const configPassport = require('./config/oauth.config')
const { apiRouter, authRouter, oauthRouter, pdfRouter } = require('./routes')
const {
	globalErrorController,
	notFound,
} = require('./controllers/error.controller')

const app = express()

// CORS Options
const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:8000',
	'https://client-jade-eight-74.vercel.app',
	'https://server-steel-rho.vercel.app',
]

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
	allowedHeaders: 'Content-Type,Authorization',
	credentials: true,
}

// Helmet Security Configuration
const helmetConfig = helmet({
	contentSecurityPolicy: {
		useDefaults: true,
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			objectSrc: ["'none'"],
			frameAncestors: allowedOrigins,
			upgradeInsecureRequests: [],
		},
	},
})

// Middleware
app.use(cors('*'))
app.use(helmetConfig)
app.use(mongoSanitize())
app.use(morgan('dev'))

app.use(passport.initialize())
configPassport(passport)

// Parse JSON and Form Data
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Static Files
app.use(express.static('public'))

app.get('/', (req, res) => res.json({'message': 'I work'}))

// API Routes
app.use('/auth', authRouter)
app.use('/oauth', oauthRouter)
app.use('/api', apiRouter)
app.use('/pdf', pdfRouter)

// Handle Preflight OPTIONS Requests
app.options('*', cors(corsOptions))

// Custom 404 Handler for Static Files
app.use((req, res, next) => {
	const custom404File = path.join(__dirname, 'public', '404.html')
	res.status(404).sendFile(custom404File)
})

// Catch-All 404 Handler for API Routes
app.route('*').all(notFound)

// Global Error Controller
app.use(globalErrorController)

module.exports = app
