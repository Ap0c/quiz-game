'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');


// ----- Exports ----- //

module.exports = function start (port) {

	// ----- Setup ---- //

	let app = express();
	let server = http.Server(app);
	let io = socketIO(server);

	let config = {
		noPlayers: 0,
		hostExists: false
	};

	let userList = [];
	const CATEGORIES = ['catOne', 'catTwo'];


	// ----- Functions ----- //

	// Checks if a user exists by name.
	function userExists (list, name) {

		let exists = list.find((user) => {
			return user.name === name;
		});

		return exists ? true : false;

	}

	// Checks whether there are enough of required users, returns boolean.
	function correctUsers (socket) {

		if (!userExists(userList, 'Host')) {
			socket.emit('begin-fail', 'Need a host.');
		} else if (!userExists(userList, 'Screen')) {
			socket.emit('begin-fail', 'Need a screen.');
		} else if (config.noPlayers < 2) {
			socket.emit('begin-fail', 'Need at least 2 players.');
		} else {
			return true;
		}

		return false;

	}

	// Attempts to begin the game.
	function begin (socket) {

		if (correctUsers(socket)) {
			io.emit('category-view', CATEGORIES);
		}

	}

	// Adds user to list and sends acceptance message to client.
	function confirmUser (socket, name) {

		socket.name = name;
		userList.push(socket);

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

		if (config.hostExists) {
			socket.emit('host-exists');
		} else {

			config.hostExists = true;
			confirmUser(socket, 'Host');

		}

	}

	// Sets up the client as one of the three types of user.
	function socketType (socket, type) {

		if (type === 'player') {

			config.noPlayers++;
			confirmUser(socket, `Player ${config.noPlayers}`);

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
