'use strict';

// ----- Functions ----- //

// Sends an error message.
exports.err = function err (socket, message) {
	socket.emit('err', message);
};

// Sends a message about client disconnected to all other users.
exports.clientDisconnect = function clientDisconnect (socket) {
	socket.broadcast.emit('client-disconnect', socket.name);
};

// Sends a message telling the client to display the category view.
exports.categoryView = function categoryView (socket, categories) {
	socket.emit('category-view', categories);
};

// Sends a message explaining that the game has failed to start.
exports.beginFail = function beginFail (socket, reason) {
	socket.emit('begin-fail', reason);
};

// Sends message to current socket and others stating that user has been added.
exports.userAccepted = function userAccepted (socket) {

	socket.emit('client-accepted', socket.name);
	socket.broadcast.emit('new-user', socket.name);

};

// Sends a warning that there is already a host in the game.
exports.hostExists = function hostExists (socket) {
	socket.emit('host-exists');
};

// Sends the command to begin a series of questions in a certain category.
exports.startCategory = function startCategory (socket, category) {
	socket.emit('start-category', category);
};
