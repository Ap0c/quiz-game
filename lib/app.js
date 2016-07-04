'use strict';

// ----- Requires ----- //

let express = require('express');
let http = require('http');
let socketIO = require('socket.io');

let Users = require('./users');
let Questions = require('./questions');
let Round = require('./round');
let events = require('./events');


// ----- Exports ----- //

module.exports = function start (port) {

	// ----- Setup ---- //

	let app = express();
	let server = http.Server(app);
	let io = socketIO(server);

	let users = Users();
	let questions = Questions('test/questions.json');
	let round = Round();

	// ----- Functions ----- //

	// Attempts to begin the game.
	function begin (socket) {

		if (users.correct(socket)) {
			events.categoryView(io, questions.categories);
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
	function setCategory (socket, category) {

		if (questions.categories.includes(category)) {

			round.category = category;
			events.showCategory(io, category);

		} else {
			events.err(socket, `Invalid category: ${category}.`);
		}

	}

	// Attempts to load a new question.
	function newQuestion () {

		round.newQuestion();

		if (round.complete) {

			round = Round();
			events.scoresView(io, users.scores());

		} else {

			let question = questions.get(round.category);
			events.questionView(io, question);

		}

	}

	// Records an answer and checks if all have been submitted.
	function recordAnswer (socket, answer) {

		let user = users.get(socket);

		round.answer(user, answer);
		events.answerSubmitted(socket, user.name, round.users);

		if (round.allSubmitted(users.metadata.noPlayers)) {
			events.answersView(io, round.answers);
		}

	}

	// Records each user's scores.
	function recordScores (scores) {

		for (let user in scores) {
			users.updateScore(user, scores[user]);
		}

		newQuestion();

	}

	// Calculates and sends through the winners.
	function calcWinners () {

		let scores = users.scores();

		var topScore = Math.max.apply(Math, scores.map((user) => {
			return user.score;
		}));

		var winners = scores.filter((user) => {
			return user.score === topScore;
		});

		events.winners(io, winners);

	}

	// ----- Middleware ----- //

	app.use(express.static('static'));

	// ----- Routes ----- //

	app.get('/', (req, res) => {
		res.sendFile('index.html', { root: '.' });
	});

	// ----- Client Events ----- //

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
			setCategory(socket, category);
		});

		socket.on('start-round', newQuestion);

		socket.on('submit-answer', (answer) => {
			recordAnswer(socket, answer);
		});

		socket.on('scored', recordScores);

		socket.on('finish', calcWinners);

	});

	// ----- Constructor ----- //

	return server.listen(port, () => {
		console.log(`App listening on ${port}.`);
	});

};
