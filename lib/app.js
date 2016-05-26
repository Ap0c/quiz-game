'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');

let Users = require('./users');
let events = require('./events');
let Questions = require('./questions');


// ----- Exports ----- //

module.exports = function start (port) {

	// ----- Setup ---- //

	let app = express();
	let server = http.Server(app);
	let io = socketIO(server);

	let users = Users();
	let questions = Questions('test/questions.json');

	const CATEGORIES = ['catOne', 'catTwo'];
	let roundCounter = 0;
	let playersSubmitted = 0;
	let answers = [];


	// ----- Functions ----- //

	// Attempts to begin the game.
	function begin (socket) {

		if (users.correct(socket)) {
			events.categoryView(io, CATEGORIES);
		}

	}

	// Broadcasts a disconnect event if the client is set up.
	function handleDisconnect (socket) {

		let user = users.get(socket);

		if (user) {
			events.clientDisconnect(socket, user.name);
		}

	}

	// Checks the category is valid and sends the command to use it.
	function showCategory (socket, category) {

		if (CATEGORIES.includes(category)) {
			events.showCategory(io, category);
		} else {
			events.err(socket, `Invalid category: ${category}.`);
		}

	}

	// Starts a round of five questions.
	function newQuestion (category) {

		roundCounter++;

		if (roundCounter > 5) {

			roundCounter = 0;
			events.scoresView(io, users.scores());

		} else {

			let question = questions.get(category);
			events.questionView(io, question);

		}

	}

	// Records each user's scores.
	function recordScores (scoreData) {

		let scores = scoreData.scores;

		for (let score in scores) {
			users.updateScore(scores[score].user, scores[score].value);
		}

		newQuestion(scoreData.category);

	}

	// Records an answer and checks if all have been submitted.
	function recordAnswer (socket, answer) {

		let user = users.get(socket);

		answers.push({user: { name: user.name, id: user.id }, answer: answer});
		events.answerSubmitted(socket, user.name);
		playersSubmitted++;

		if (playersSubmitted === users.metadata.noPlayers) {

			events.answersView(io, answers);
			answers = [];

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

		socket.on('disconnect', () => {
			handleDisconnect(socket);
		});

		socket.on('add-user', (type) => {
			users.add(socket, type);
		});

		socket.on('begin', () => {
			begin(socket);
		});

		socket.on('category-chosen', (category) => {
			showCategory(socket, category);
		});

		socket.on('start-round', newQuestion);

		socket.on('scored', recordScores);

		socket.on('submit', (answer) => {
			recordAnswer(socket, answer);
		});

	});

	return server.listen(port, () => {
		console.log(`App listening on ${port}.`);
	});

};
