'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');


// ----- Setup ---- //

const PORT = 3000;

let app = express();
let server = http.Server(app);
let io = socketIO(server);

let config = {
	noPlayers: 0,
	hostExists: false
};


// ----- Functions ----- //

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

		socket.name = 'Host';
		config.hostExists = true;
		socket.emit('client-accepted', socket.name);

	}

}

// Sets up the client as one of the three types of user.
function socketType (socket, type) {

	if (type === 'player') {

		config.noPlayers++;
		socket.name = `Player ${config.noPlayers}`;
		socket.emit('client-accepted', socket.name);

	} else if (type === 'host') {
		setupHost(socket);
	} else if (type === 'screen') {

		socket.name = 'Screen';
		socket.emit('client-accepted', socket.name);

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

	console.log('A client connected.');

	socket.on('disconnect', () => {

		console.log('A client disconnected.');
		handleDisconnect(socket);

	});

	socket.on('type', (type) => {
		socketType(socket, type);
	});

});


// ----- Start ----- //

module.exports = server.listen(PORT, () => {
	console.log(`App listening on ${PORT}.`);
});
