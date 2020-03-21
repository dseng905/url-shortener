'use strict'

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const URLMethods = require('./controllers/urlmethods.js');

const mongoURI = "mongodb+srv://dseng905:10801566@cluster0-jnimq.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req,res) => res.sendFile(__dirname + '/views/index.html'));

app.post('/api/shorturl/new', URLMethods.createShortURL);
app.get('/api/shorturl/:shortUrl', URLMethods.processShortURL);

app.use((req,res,next) => {
  res.status(404)
    .type('text')
    .send('Page not found');
})

app.listen(process.env.PORT || 3000, () => console.log("App is listening..."));