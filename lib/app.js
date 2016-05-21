'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');

let Users = require('../lib/users');


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

	// Adds user to list and sends acceptance message to client.
	function confirmUser (socket, name) {

		socket.name = name;
		users.list.push(socket);

		socket.emit('client-accepted', name);
		socket.broadcast.emit('new-user', name);

	}

	// Broadcasts a disconnect event if the client is set up.
	function handleDisconnect (socket) {

		if (socket.name) {
			socket.broadcast.emit('client-disconnect', socket.name);
		}

	}

	// Sets up the host user.
	function setupHost (socket) {

		if (users.metadata.hostExists) {
			socket.emit('host-exists');
		} else {

			users.metadata.hostExists = true;
			confirmUser(socket, 'Host');

		}

	}

	// Sets up the client as one of the three types of user.
	function socketType (socket, type) {

		if (type === 'player') {

			users.metadata.noPlayers++;
			confirmUser(socket, `Player ${users.metadata.noPlayers}`);

		} else if (type === 'host') {
			setupHost(socket);
		} else if (type === 'screen') {
			confirmUser(socket, 'Screen');
		} else {
			socket.emit('err', 'Client type not recognised.');
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

		socket.on('type', (type) => {
			socketType(socket, type);
		});

		socket.on('begin', () => {
			begin(socket);
		});

	});

	return server.listen(port, () => {
		console.log(`App listening on ${port}.`);
	});

};
