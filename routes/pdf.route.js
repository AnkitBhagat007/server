const express = require('express')

const { createSign, mergeSign } = require('../controllers/pdf.controller')
const { isAdmin } = require('../middlewares/auth.middleware')

const router = express.Router()

router.route('/create-sign').post(isAdmin, createSign)
router.route('/merge-sign').post(isAdmin, mergeSign)

module.exports = router
