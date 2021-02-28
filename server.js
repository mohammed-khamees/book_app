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

//Routes

//home route
app.get('/', (req, res) => {
	res.render('pages/index');
});

//searches/new route
app.get('/searches/new', (req, res) => {
	res.render('pages/searches/new');
});

//searches route
app.post('/searches', (req, res) => {
	let search = req.body.search;
	let sort = req.body.sort;

	let url = `https://www.googleapis.com/books/v1/volumes?q=${search}+in${sort}`;

	superagent.get(url).then((results) => {
		let data = results.body.items;
		let book = data.map((item) => {
			return new Book(item.volumeInfo);
		});

		res.render('pages/searches/searches', { booksList: book });
	});
});

//error route
app.get('*', (req, res) => {
	res.render('pages/error');
});

//contructors
function Book(data) {
	this.image = data.imageLinks.thumbnail
		? data.imageLinks.thumbnail
		: `https://i.imgur.com/J5LVHEL.jpg`;
	this.title = data.title ? data.title : 'No Title';
	this.description = data.description
		? data.description
		: 'No description for this book';
	this.author = data.authors ? data.authors.join(' ') : 'Author is Unknown';
}

// listen
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
