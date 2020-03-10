require('./interceptors')
const express = require('express')
const router = express.Router()
const cache = require('../middlewares/cache')
const wallpaper = require('./wallpaper')

// Bing wallpaper
router.get('/wallpaper', cache(10), wallpaper)

module.exports = router