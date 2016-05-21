'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');

let Users = require('../lib/users');
let events = require('../lib/events');


// ----- Exports ----- //

module.exports = function start (port) {

	// ----- Setup ---- //

	let app = express();
	let server = http.Server(app);
	let io = socketIO(server);

	let users = Users();
	const CATEGORIES = ['catOne', 'catTwo'];


	// ----- Functions ----- //

	// Attempts to begin the game.
	function begin (socket) {

		if (users.correct(socket)) {
			io.emit('category-view', CATEGORIES);
		}

	}

	// Broadcasts a disconnect event if the client is set up.
	function handleDisconnect (socket) {

		if (socket.name) {
			events.clientDisconnect(socket);
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

	});

	return server.listen(port, () => {
		console.log(`App listening on ${port}.`);
	});

};
