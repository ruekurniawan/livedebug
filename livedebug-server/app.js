require('dotenv').config();

const express = require('express');
const app = express();
const index = require('./routes/index');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost/phase-2-${process.env.NODE_ENV}`, { useNewUrlParser: true });


app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use('/', index);

module.exports = app
