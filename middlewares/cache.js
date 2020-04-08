/**
 * @description Simple cache middelware
 * 
 * https://expressjs.com/en/guide/writing-middleware.html
 * https://expressjs.com/en/guide/using-middleware.html
 * https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
 */

const mcache = require('memory-cache')

const cache = duration => {
  return (req, res, next) => {
    const forwardedIP = req.headers['X-Forwarded-For'.toLowerCase()] || 'localhost'
    console.log('forwardedIP:', forwardedIP)
    const userIP = forwardedIP.split(',')[0]
    const key = `__express__${req.originalUrl || req.url}_${userIP}`
    const cachedBody = mcache.get(key)

    if (cachedBody) {
      res
        .header('__express__cache', 'hit')
        .header('X-Forwarded-For', forwardedIP)
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = body => {
        mcache.put(key, body, duration * 1000)
        res
          .header('__express__cache', 'fresh')
          .header('X-Forwarded-For', forwardedIP)
        res.sendResponse(body)
      }
      next()
    }
  }
}

module.exports = cache