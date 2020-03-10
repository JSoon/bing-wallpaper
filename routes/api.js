require('./interceptors')
const express = require('express')
const router = express.Router()
const wallpaper = require('./wallpaper')

// Bing wallpaper
router.get('/wallpaper', wallpaper)

module.exports = router