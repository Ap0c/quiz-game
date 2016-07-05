'use strict';

// ----- Requires ----- //

let events = require('./events');


// ----- User ----- //

// Power constructor for a User object.
function User (socket, name, type) {

	return {
		name: name,
		socket: socket,
		type: type,
		id: socket.id,
		score: 0
	};

}


// ----- Exports ----- //

module.exports = function Users () {

	// ----- Properties ----- //

	let userList = {};

	let previousPlayers = {};

	let metadata = {
		noPlayers: 0,
		hostExists: false,
		screenExists: false
	};

	// ----- Functions ----- //

	// Retrieves a list of user names.
	function userNames () {

		return Object.keys(userList).map((key) => {
			return userList[key].name;
		});

	}

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
	function addUser (socket, name, type) {

		userList[socket.id] = User(socket, name, type);
		events.userAccepted(socket, userNames());

	}

	// Sets up the host user.
	function addHost (socket, name) {

		if (metadata.hostExists) {
			events.hostExists(socket);
		} else {

			metadata.hostExists = true;
			addUser(socket, name, 'host');

		}

	}

	// Reinstates a previous player.
	function addPrevious (newSocket, previousID, name) {

		let previous = previousPlayers[previousID];
		previous.socket = newSocket;
		previous.id = newSocket.id;
		previous.name = name;

		userList[newSocket.id] = previous;
		delete previousPlayers[previousID];
		events.userAccepted(newSocket, userNames(), true);

	}

	// Sets up the client as one of the three types of user.
	function userType (socket, type, previousID, name) {

		if (type === 'player') {

			metadata.noPlayers++;

			if (previousID in previousPlayers) {
				addPrevious(socket, previousID, name);
			} else {
				addUser(socket, name, type);
			}

		} else if (type === 'host') {
			addHost(socket, name);
		} else if (type === 'screen') {

			metadata.screenExists = true;
			addUser(socket, name, type);

		} else {
			events.err(socket, 'Client type not recognised.');
		}

	}

	// Retrieves a user by the corresponding socket.
	function getUser (socket) {
		return userList[socket.id];
	}

	// Removes a user by the corresponding socket.
	function removeUser (socket) {

		let user = userList[socket.id];

		if (user.type === 'player') {
			previousPlayers[socket.id] = user;
		}

		delete userList[socket.id];
		metadata.noPlayers--;

	}

	// Updates the score, adds the given value.
	function updateScore (id, toAdd) {

		let user = userList[id];

		if (user) {

			user.score += toAdd;
			return user.score;

 		} else {
 			return null;
 		}

	}

	// Retrieves the score and name for each user.
	function getScores () {

		return Object.keys(userList).filter((user) => {
			return userList[user].type === 'player';
		}).map((user) => {
			return { user: userList[user].name, score: userList[user].score };
		});

	}

	// ----- Constructor ----- //

	return {
		correct: correctUsers,
		add: userType,
		metadata: metadata,
		get: getUser,
		remove: removeUser,
		updateScore: updateScore,
		scores: getScores
	};

};
