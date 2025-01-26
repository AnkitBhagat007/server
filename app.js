const express = require('express')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const passport = require('passport')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
// const xss = require('xss-clean')

const configPassport = require('./config/oauth.config')
const { apiRouter, authRouter, oauthRouter, pdfRouter } = require('./routes')
const {
	globalErrorController,
	notFound,
} = require('./controllers/error.controller')

const app = express()

const corsOptions = {
	origin: '*',
	methods: 'GET,POST,PUT,DELETE,PATCH',
	allowedHeaders: 'Content-Type,Authorization',
	credentials: true,
	optionsSuccessStatus: 200,
}

const helmetConfig = helmet.contentSecurityPolicy({
	directives: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'"],
		objectSrc: ["'none'"],
		frameAncestors: [
			"'self'",
			'http://localhost:3000',
			'http://localhost:8000',
			'https://client-jade-eight-74.vercel.app',
			'https://server-steel-rho.vercel.app'
		],
		upgradeInsecureRequests: [],
	},
})

app.use(cors(corsOptions))
app.use(helmet())
app.use(helmetConfig)
app.use(mongoSanitize())

// app.use(morgan('dev'))

app.use(passport.initialize())
configPassport(passport)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.use(express.static('public'))

app.use('/auth', authRouter)
app.use('/oauth', oauthRouter)
app.use('/api', apiRouter)
app.use('/pdf', pdfRouter)

app.use((req, res, next) => {
	const custom404File = path.join(__dirname, 'public', '404.html')

	return res.status(404).sendFile(custom404File)
})

app.route('*').all(notFound)
app.use(globalErrorController)

module.exports = app
