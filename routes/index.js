const apiRouter = require('./api.route')
const authRouter = require('./auth.route')
const oauthRouter = require('./oauth.route')
const pdfRouter = require('./pdf.route')

module.exports = { apiRouter, authRouter, oauthRouter, pdfRouter }
