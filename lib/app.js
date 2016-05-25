'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');

let Users = require('./users');
let events = require('./events');
let Questions = require('./questions');


// ----- Exports ----- //

module.exports = function start (port) {

	// ----- Setup ---- //

	let app = express();
	let server = http.Server(app);
	let io = socketIO(server);

	let users = Users();
	let questions = Questions('test/questions.json');

	const CATEGORIES = ['catOne', 'catTwo'];
	let roundCounter = 0;


	// ----- Functions ----- //

	// Attempts to begin the game.
	function begin (socket) {

		if (users.correct(socket)) {
			events.categoryView(io, CATEGORIES);
		}

	}

	// Broadcasts a disconnect event if the client is set up.
	function handleDisconnect (socket) {

		if (socket.name) {
			events.clientDisconnect(socket);
		}

	}

	// Checks the category is valid and sends the command to use it.
	function showCategory (socket, category) {

		if (CATEGORIES.includes(category)) {
			events.showCategory(io, category);
		} else {
			events.err(socket, `Invalid category: ${category}.`);
		}

	}

	// Starts a round of five questions.
	function newQuestion (category) {

		if (roundCounter === 5) {

			roundCounter = 0;
			events.scoresView(io);

		} else {

			roundCounter++;
			let question = questions.get(category);
			events.questionView(io, question);

		}

	}


	// ----- Middleware ----- //

	app.use(express.static('static'));


	// ----- Routes ----- //

	app.get('/', (req, res) => {
		res.sendFile('index.html', { root: '.' });
	});


	// ----- Socket Events ----- //

	io.on('connection', (socket) => {

		socket.on('disconnect', () => {
			handleDisconnect(socket);
		});

		socket.on('add-user', (type) => {
			users.add(socket, type);
		});

		socket.on('begin', () => {
			begin(socket);
		});

		socket.on('category-chosen', (category) => {
			showCategory(socket, category);
		});

		socket.on('new-question', newQuestion);

	});

	return server.listen(port, () => {
		console.log(`App listening on ${port}.`);
	});

};
