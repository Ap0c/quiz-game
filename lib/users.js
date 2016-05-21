'use strict';

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
			socket.emit('begin-fail', 'Need a host.');
		} else if (!userExists(userList, 'Screen')) {
			socket.emit('begin-fail', 'Need a screen.');
		} else if (metadata.noPlayers < 2) {
			socket.emit('begin-fail', 'Need at least 2 players.');
		} else {
			return true;
		}

		return false;

	}

	// Adds a user to the list of users.
	function addUser (socket, name) {

		socket.name = name;
		userList.push(socket);

		socket.emit('client-accepted', name);
		socket.broadcast.emit('new-user', name);

	}

	// Sets up the host user.
	function setupHost (socket) {

		if (metadata.hostExists) {
			socket.emit('host-exists');
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
			socket.emit('err', 'Client type not recognised.');
		}

	}


	// ----- Constructor ----- //

	return {
		correct: correctUsers,
		add: userType,
		metadata: metadata
	};

};
