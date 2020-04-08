const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(logger(':method :url :status :response-time ms | :res[content-length] | :req[X-Forwarded-For]'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/api', apiRouter);

module.exports = app;