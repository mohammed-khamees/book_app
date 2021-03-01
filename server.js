'use strict';

//libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');

// app setup
const app = express();
app.use(cors());

//databas setup
const client = new pg.Client(process.env.DATABASE_URL);

// const client = new pg.Client({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: { rejectUnauthorized: false },
// });

// to access static file
app.use(express.static('./public'));

// to add data to body using middlewhere
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//Routes

//home route
app.get('/', (req, res) => {
	let SQL = `SELECT * FROM books;`;

	client
		.query(SQL)
		.then((results) => {
			res.render('pages/index', { booksList: results.rows });
		})
		.catch((error) => {
			console.log('Error: ', error);
		});
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

//get one book route
app.get('/book/:id', (req, res) => {
	let SQL = `SELECT * FROM books WHERE id=${req.params.id};`;

	client
		.query(SQL)
		.then((results) => {
			res.render('pages/books/detail', { book: results.rows[0] });
		})
		.catch((error) => {
			console.log('Error: ', error);
		});
});

//addbook to book shelf
app.post('/books', (req, res) => {
	let { image, title, author, description } = req.body;
	let SQL = `INSERT INTO books (image, title, author, description) VALUES($1, $2, $3, $4) RETURNING id;`;
	let safeValues = [image, title, author, description];
	let SQL2 = `SELECT * FROM books WHERE title=$1;`;
	let value = [title];

	client
		.query(SQL2, value)
		.then((results) => {
			if (results.rows[0]) {
				res.redirect(`/book/${results.rows[0].id}`);
			} else {
				client
					.query(SQL, safeValues)
					.then((results) => {
						res.redirect(`/book/${results.rows[0].id}`);
					})
					.catch((error) => {
						console.log('Error: ', error);
					});
			}
		})
		.catch((error) => {
			console.log('Error: ', error);
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

client.connect().then(() => {
	app.listen(PORT, () => {
		console.log(`http://localhost:${PORT}`);
	});
});
