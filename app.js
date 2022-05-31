const express = require('express')
const shortId = require('shortid')
const createHttpError = require('http-errors')
const mongoose = require('mongoose')
const path = require('path')
const ShortUrl = require('./models/url.model')


const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


mongoose
  .connect('mongodb+srv://abcd:abcd123@cluster0.deqkj.mongodb.net/?retryWrites=true&w=majority', {
    dbName: 'url-shortner',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('mongoose connected 💾'))
  .catch((error) => console.log('Error connecting..'))


  app.set('view engine', 'ejs')

app.get('/', async (req, res, next) => {
  res.render('index')
})

app.post('/', async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url) {
      throw createHttpError.BadRequest('Provide a valid url')
    }
    const urlExists = await ShortUrl.findOne({ url })
    if (urlExists) {
      res.render('index', {
        // short_url: `${req.hostname}/${urlExists.shortId}`,
        short_url: `${req.headers.host}/${urlExists.shortId}`,
      })
      return
    }
    const shortUrl = new ShortUrl({ url: url, shortId: shortId.generate() })
    const result = await shortUrl.save()
    res.render('index', {
      // short_url: `${req.hostname}/${urlExists.shortId}`,
      short_url: `${req.headers.host}/${result.shortId}`,
    })
  } catch (error) {
    next(error)
  }
})