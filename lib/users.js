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


	// ----- Constructor ----- //

	return {
		correct: correctUsers,
		list: userList,
		metadata: metadata
	};

};
