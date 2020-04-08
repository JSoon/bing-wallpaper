// Bing wallpaper
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const bingURL = `https://cn.bing.com`
const bingAPI = `https://cn.bing.com/HPImageArchive.aspx`

// https://db-ip.com/api/free.php
const getIP = `http://api.db-ip.com/v2/free`

const handler = async (req, res, next) => {

  try {
    const userRegion = await getUserRegion(req)

    const response = await getWallpaper({
      ...req.query,
      loc: userRegion.countryCode || 'CN'
    })

    const data = parse2JSON(response.data)

    res.json({
      ...data,
      ...userRegion
    })
  } catch (error) {
    console.error(error)

    res.json(error)
  }

}

function parse2JSON(data) {
  // data = data.match(/{.*}/i)
  if (data) {
    // data = JSON.parse(data[0])
    const image = data.images[0]

    const fullURL = `${bingURL}${image.url}`

    return {
      ...image,
      fullURL
    }
  } else {
    return {}
  }
}

function getWallpaper(query) {

  let {
    hd = 0, // High Definition 高清晰度，决定相同分辨率下图片压缩程度 0: 标清, 1: 高清
      idx = 0, // 0: today, 1: yesterday, 2: 2 days before, 3: 3 days before, etc.
      n = 1, // ??
      nc = new Date().getTime(), // 时间戳
      ensearch, // 是否是英文, 0: 否, 1: 是
      quiz = 0, // 是否包含小测验信息
      loc // 国家代码
  } = query

  return axios.get(bingAPI, {
    params: {
      format: 'js', // 数据格式 js: application/json, hp: html/text
      pid: 'hp', // 详细信息
      uhd: hd,
      uhdwidth: 1920,
      uhdheight: 1080,
      idx,
      n,
      nc,
      ensearch: ensearch || (loc === 'CN' ? 0 : 1),
      quiz,
      // FORM: 'BEHPTB', // ??
      // og: 1, // ??
      // IG: 'B38FF0945C014BE0AC5F7E86CE13E6B9', // ??
      // IID: 'SERP.1050' // ??
    }
  })
}

function getUserRegion(req) {
  const forwardedIP = req.headers['X-Forwarded-For']

  if (forwardedIP) {
    const ip = forwardedIP.split(',')[0]

    return axios.get(`${getIP}/${ip}`)
      .then(res => {
        return res.data
      })
      .catch(err => {
        return {}
      })
  } else {
    return {}
  }
}

async function saveToLocal(query) {

  try {
    const response = await getWallpaper(query)
    const data = parse2JSON(response.data)

    const {
      fullURL,
      startdate,
      enddate,
      copyright
    } = data

    const file = path.resolve(process.cwd(), `wallpapers/${enddate}_${copyright.replace(/\/|\\|\s/g, '_')}.jpg`)

    fs.access(file, fs.constants.F_OK, async (err) => {

      try {
        if (err) {
          console.log('no file exists!')

          const writer = fs.createWriteStream(file)

          const response = await axios({
            url: fullURL,
            method: 'GET',
            responseType: 'stream'
          })

          response.data.pipe(writer)
        } else {
          console.log('file exists!')

        }

      } catch (error) {
        console.log(error)
      }

    })

    // return new Promise((resolve, reject) => {
    //   writer.on('finish', resolve)
    //   writer.on('error', reject)
    // })

  } catch (error) {
    console.error(error)
  }

}

// 定时任务每天00:00:00保存今日图片
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const midnight = tomorrow.setHours(0, 0, 0, 0)
const tolerance = 5000 // 误差5秒
const interval = midnight - new Date() + tolerance
console.log(`Saving daily wallpaper after ${interval / 3600 / 1000} hours`)
setInterval(() => {
  saveToLocal({
    hd: 1,
    ensearch: 0
  })
}, interval)

module.exports = handler