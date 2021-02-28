'use strict';

//libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

// app setup
const app = express();
app.use(cors());

// to access static file
app.use(express.static('./public'));

// to add data to body using middlewhere
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// listen
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
