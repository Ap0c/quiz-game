'use strict';

// ----- Functions ----- //

// Sends a message about client disconnected to all other users.
exports.clientDisconnect = function clientDisconnect (socket) {
	socket.broadcast.emit('client-disconnect', socket.name);
};
