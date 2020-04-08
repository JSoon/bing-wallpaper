require('./interceptors')
const express = require('express')
const router = express.Router()
const cache = require('../middlewares/cache')
const wallpaper = require('./wallpaper')

// Bing wallpaper
const cacheTime = 1
// const cacheTime = 60 * 60
router.get('/wallpaper', cache(cacheTime), wallpaper)

module.exports = router