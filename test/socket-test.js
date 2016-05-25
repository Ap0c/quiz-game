'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let io = require('socket.io-client');
let app = require('../lib/app');


// ----- Setup ----- //

const options = {
	transports: ['websocket'],
	'force new connection': true
};

let port = 3001;


// ----- Functions ----- //

// Ends an async test, with or without err, and disconnects sockets.
function endTest (sockets, done, err) {

	for (let socket of sockets) {
		socket.disconnect();
	}

	done(err ? Error(err) : null);

}

// Catches socket error messages and ends test.
function handleErr (sockets, done) {

	for (let socket of sockets) {

		socket.once('err', (msg) => {
			endTest(sockets, done, msg);
		});

	}

}


// ----- Tests ----- //

describe('Socket', function () {

	let server = null;
	let client = null;

	beforeEach(function () {
		server = app(port);
	});

	afterEach(function () {

		server.close();
		port++;

	});

	it('accepts a connection', function (done) {

		let client = io.connect(`http://localhost:${port}`, options);

		handleErr([client], done);

		client.once('connect', () => {
			endTest([client], done);
		});

	});

	it('sends a disconnect event when user is lost', function (done) {

		let clientOne = io.connect(`http://localhost:${port}`, options);
		let clientTwo = io.connect(`http://localhost:${port}`, options);

		handleErr([clientOne, clientTwo], done);

		clientOne.once('connect', () => {
			clientOne.emit('add-user', 'host');
		});

		clientOne.once('client-accepted', () => {
			clientOne.disconnect();
		});

		clientTwo.once('client-disconnect', (name) => {
			endTest([clientOne, clientTwo], done);
		});

	});

	describe('Add User Events', function () {

		it("handles a 'add-user' event for correct user", function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			handleErr([client], done);

			client.once('client-accepted', () => {

				client.once('client-accepted', () => {

					client.once('client-accepted', () => {
						endTest([client], done);
					});

				});				

			});

			client.once('connect', () => {

				client.emit('add-user', 'host');
				client.emit('add-user', 'player');
				client.emit('add-user', 'screen');

			});

		});

		it("handles a 'add-user' event for an invalid user", function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			client.once('err', (msg) => {
				endTest([client], done);
			});

			client.once('client-accepted', () => {
				endTest([client], done, "User invalid, shouldn't be accepted.");
			});

			client.once('connect', () => {
				client.emit('add-user', 'invalid');
			});

		});

		it('handles duplicate hosts', function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			handleErr([client], done);

			client.once('client-accepted', () => {

				client.emit('add-user', 'host');

				client.once('client-accepted', () => {
					endTest([client], done, 'Two hosts not allowed.');
				});

			});

			client.once('host-exists', () => {
				endTest([client], done);
			});

			client.once('connect', () => {
				client.emit('add-user', 'host');
			});

		});

		it("broadcasts a 'new-user' event", function (done) {

			let clientOne = io.connect(`http://localhost:${port}`, options);
			let clientTwo = io.connect(`http://localhost:${port}`, options);

			handleErr([clientOne, clientTwo], done);

			clientTwo.once('err', (msg) => {
				endTest([clientOne, clientTwo], done, msg);
			});

			clientOne.once('connect', () => {

				clientTwo.once('connect', () => {
					clientTwo.emit('add-user', 'player');
				});

			});

			clientOne.once('new-user', () => {
				endTest([clientOne, clientTwo], done);
			});

		});

	});

	describe('Begin Event', function () {

		it('fails to begin when there is no host', function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			handleErr([client], done);

			client.once('connect', () => {
				client.emit('begin');
			});

			client.once('begin-fail', () => {
				endTest([client], done);
			});

			client.once('category-view', () => {
				endTest([client], done, 'The game should not begin.');
			});

		});

		it('fails to begin when there is no screen', function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			handleErr([client], done);

			client.once('connect', () => {
				client.emit('add-user', 'host');
			});

			client.once('client-accepted', () => {
				client.emit('begin');
			});

			client.once('begin-fail', () => {
				endTest([client], done);
			});

			client.once('category-view', () => {
				endTest([client], done, 'The game should not begin.');
			});

		});

		it('fails to begin when there are not enough players', function (done) {

			let clientOne = io.connect(`http://localhost:${port}`, options);
			let clientTwo = io.connect(`http://localhost:${port}`, options);

			handleErr([clientOne, clientTwo], done);

			clientOne.once('connect', () => {
				clientOne.emit('add-user', 'host');
			});

			clientTwo.once('connect', () => {
				clientTwo.emit('add-user', 'screen');
			});

			clientOne.once('client-accepted', () => {

				clientTwo.once('client-accepted', () => {
					clientOne.emit('begin');
				});
				
			});

			clientOne.once('begin-fail', () => {
				endTest([clientOne, clientTwo], done);
			});

			clientOne.once('category-view', () => {

				endTest([clientOne, clientTwo], done,
					'The game should not begin.');

			});

		});

		it('fails begins when the users are correct', function (done) {

			let clientOne = io.connect(`http://localhost:${port}`, options);
			let clientTwo = io.connect(`http://localhost:${port}`, options);
			let clientThree = io.connect(`http://localhost:${port}`, options);
			let clientFour = io.connect(`http://localhost:${port}`, options);

			let clientSockets = [clientOne, clientTwo, clientThree, clientFour];

			handleErr(clientSockets, done);

			clientOne.once('connect', () => {
				clientOne.emit('add-user', 'host');
			});

			clientTwo.once('connect', () => {
				clientTwo.emit('add-user', 'screen');
			});

			clientThree.once('connect', () => {
				clientThree.emit('add-user', 'player');
			});

			clientFour.once('connect', () => {
				clientFour.emit('add-user', 'player');
			});

			clientOne.once('client-accepted', () => {

				clientTwo.once('client-accepted', () => {

					clientThree.once('client-accepted', () => {

						clientFour.once('client-accepted', () => {
							clientOne.emit('begin');
						});

					});

				});
				
			});

			clientOne.once('begin-fail', () => {
				endTest(clientSockets, done, 'The game should begin.');
			});

			clientOne.once('category-view', () => {
				endTest(clientSockets, done);
			});

		});

	});

	describe('Category Events', function () {

		it('receives a category choice and confirms it', function (done) {

			let clientOne = io.connect(`http://localhost:${port}`, options);
			let clientTwo = io.connect(`http://localhost:${port}`, options);

			let catChoice = 'catOne';

			handleErr([clientOne, clientTwo], done);

			clientOne.once('connect', () => {
				clientOne.emit('category-chosen', catChoice);
			});

			clientTwo.once('connect', () => {

				clientTwo.once('show-category', (category) => {

					expect(category).to.equal(catChoice);
					endTest([clientOne, clientTwo], done);

				});

			});

		});

		it('handles an incorrect category choice', function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			client.once('err', (msg) => {
				endTest([client], done);
			});

			client.once('connect', () => {
				client.emit('category-chosen', 'invalid');
			});

			client.once('show-category', (category) => {
				endTest([client], done, 'Category is invalid.');
			});

		});

	});

});
