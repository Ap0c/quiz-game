// ----- Requires ----- //

let express = require('express');
let http = require('http');
let io = require('socket.io');


// ----- Setup ---- //

const PORT = 3000;

let app = express();
let server = http.Server(app);
let socket = io(server);


// ----- Middleware ----- //

app.use(express.static('static'));


// ----- Routes ----- //

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: '.' });
});


// ----- Start ----- //

server.listen(PORT, () => {
	console.log(`App listening on ${PORT}.`);
});
