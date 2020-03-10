const mcache = require('memory-cache')

const cache = duration => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`
    const cachedBody = mcache.get(key)

    if (cachedBody) {
      res.header('__express__cache', 'hit')
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = body => {
        mcache.put(key, body, duration * 1000)
        res.header('__express__cache', 'fresh')
        res.sendResponse(body)
      }
      next()
    }
  }
}

module.exports = cache