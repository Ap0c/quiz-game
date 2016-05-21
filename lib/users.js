'use strict';

// ----- Requires ----- //

let events = require('./events');


// ----- Functions ----- //

// Checks if a user exists by name.
function userExists (list, name) {

	let exists = list.find((user) => {
		return user.name === name;
	});

	return exists ? true : false;

}


// ----- Exports ----- //

module.exports = function Users () {

	// ----- Properties ----- //

	let userList = [];

	let metadata = {
		noPlayers: 0,
		hostExists: false
	};


	// ----- Functions ----- //

	// Checks whether there are enough of required users, returns boolean.
	function correctUsers (socket) {

		if (!userExists(userList, 'Host')) {
			events.beginFail(socket, 'Need a host.');
		} else if (!userExists(userList, 'Screen')) {
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

		socket.name = name;
		userList.push(socket);

		events.userAccepted(socket);

	}

	// Sets up the host user.
	function setupHost (socket) {

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
			setupHost(socket);
		} else if (type === 'screen') {
			addUser(socket, 'Screen');
		} else {
			events.err(socket, 'Client type not recognised.');
		}

	}


	// ----- Constructor ----- //

	return {
		correct: correctUsers,
		add: userType,
		metadata: metadata
	};

};
