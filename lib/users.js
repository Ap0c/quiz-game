'use strict';

// ----- Requires ----- //

let events = require('./events');


// ----- User ----- //

// Power constructor for a User object.
function User (socket, name) {

	return {
		name: name,
		socket: socket,
		id: socket.id
	};

}


// ----- Exports ----- //

module.exports = function Users () {

	// ----- Properties ----- //

	let userList = {};

	let metadata = {
		noPlayers: 0,
		hostExists: false,
		screenExists: false
	};


	// ----- Functions ----- //

	// Checks whether there are enough of required users, returns boolean.
	function correctUsers (socket) {

		if (!metadata.hostExists) {
			events.beginFail(socket, 'Need a host.');
		} else if (!metadata.screenExists) {
			events.beginFail(socket, 'Need a screen.');
		} else if (metadata.noPlayers < 2) {
			events.beginFail(socket, 'Need at least 2 players.');
		} else {
			return true;
		}

		return false;

	}

	// Adds a user to the list of users.
	function addUser (socket, name) {

		userList[socket.id] = User(socket, name);

		events.userAccepted(socket, name);

	}

	// Sets up the host user.
	function addHost (socket) {

		if (metadata.hostExists) {
			events.hostExists(socket);
		} else {

			metadata.hostExists = true;
			addUser(socket, 'Host');

		}

	}

	// Sets up the client as one of the three types of user.
	function userType (socket, type) {

		if (type === 'player') {

			metadata.noPlayers++;
			addUser(socket, `Player ${metadata.noPlayers}`);

		} else if (type === 'host') {
			addHost(socket);
		} else if (type === 'screen') {

			metadata.screenExists = true;
			addUser(socket, 'Screen');

		} else {
			events.err(socket, 'Client type not recognised.');
		}

	}

	// Retrieves a user by the corresponding socket.
	function getUser (socket) {
		return userList[socket.id];
	}


	// ----- Constructor ----- //

	return {
		correct: correctUsers,
		add: userType,
		metadata: metadata,
		get: getUser
	};

};
