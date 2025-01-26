const express = require('express')

const {
	outlookLogin,
	oulookOauthCallback,
	failure,
	oauthCallback,
} = require('../controllers/oauth.controller')

const router = express.Router()

router.route('/outlook').get(outlookLogin)

router.route('/outlook/callback').get(oulookOauthCallback, oauthCallback)
router.route('/failure').get(failure)

module.exports = router
