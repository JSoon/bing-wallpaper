// Bing wallpaper
const axios = require('axios')
const bingURL = `https://cn.bing.com`
const bingAPI = `https://cn.bing.com/HPImageArchive.aspx`

const handler = async (req, res, next) => {
  const {
    hd = 0,
      idx = 0,
      n = 1
  } = req.query

  try {
    const response = await axios.get(bingAPI, {
      params: {
        format: 'hp',
        uhd: hd, // High Definition 高清晰度，决定相同分辨率下图片压缩程度
        uhdwidth: 1920,
        uhdheight: 1080,
        idx, // 0: today, 1: yesterday, 2: 2 days before, 3: 3 days before, etc.
        n, // Unknown param
        nc: new Date().getTime() // Timestamp
      }
    })

    const data = parse2JSON(response.data)

    res.json(data)
  } catch (error) {
    console.error(error)
  }
}

function parse2JSON(data) {
  data = data.match(/{.*}/i)
  if (data) {
    data = JSON.parse(data[0])
    const image = data.images[0]
    let {
      url,
      startdate,
      enddate,
      copyright
    } = image

    url = `${bingURL}${image.url}`

    return {
      url,
      startdate,
      enddate,
      copyright
    }
  } else {
    return {}
  }
}

module.exports = handler