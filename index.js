// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');


// ----- Setup ---- //

const PORT = 3000;

let app = express();
let server = http.Server(app);
let io = socketIO(server);


// ----- Middleware ----- //

app.use(express.static('static'));


// ----- Routes ----- //

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: '.' });
});


// ----- Socket Events ----- //

io.on('connection', (socket) => {

	console.log('A player connected.');

	socket.on('disconnect', () => {
		console.log('A player disconnected.');
	});

});


// ----- Start ----- //

server.listen(PORT, () => {
	console.log(`App listening on ${PORT}.`);
});
