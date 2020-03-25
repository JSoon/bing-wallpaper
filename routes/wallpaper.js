// Bing wallpaper
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const bingURL = `https://cn.bing.com`
const bingAPI = `https://cn.bing.com/HPImageArchive.aspx`

const handler = async (req, res, next) => {
  const {
    hd = 0, // High Definition 高清晰度，决定相同分辨率下图片压缩程度 0: 标清, 1: 高清
      idx = 0, // 0: today, 1: yesterday, 2: 2 days before, 3: 3 days before, etc.
      n = 1,
      nc = new Date().getTime()
  } = req.query

  try {
    const response = await axios.get(bingAPI, {
      params: {
        format: 'hp',
        uhd: hd,
        uhdwidth: 1920,
        uhdheight: 1080,
        idx,
        n, // Unknown param
        nc, // Timestamp
      }
    })

    const data = parse2JSON(response.data)

    res.json(data)

    saveToLocal(data)
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

async function saveToLocal(response) {
  const {
    url,
    startdate,
    enddate,
    copyright
  } = response
  
  const file = path.resolve(process.cwd(), `wallpapers/${enddate}_${copyright.replace(/\/|\\/g, ', ')}.jpg`)

  fs.access(file, fs.constants.F_OK, async (err) => {

    if (err) {
      console.log('no file exists!')

      const writer = fs.createWriteStream(file)

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      })

      response.data.pipe(writer)
    }

  })


  // return new Promise((resolve, reject) => {
  //   writer.on('finish', resolve)
  //   writer.on('error', reject)
  // })
}

module.exports = handler