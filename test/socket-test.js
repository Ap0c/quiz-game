'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let io = require('socket.io-client');
let app = require('../index');


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

	describe('Type Events', function () {

		it("handles a 'type' event for correct user", function (done) {

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

				client.emit('type', 'host');
				client.emit('type', 'player');
				client.emit('type', 'screen');

			});

		});

		it("handles a 'type' event for an invalid user", function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			client.once('err', (msg) => {
				endTest([client], done);
			});

			client.once('client-accepted', () => {
				endTest([client], done, "User invalid, shouldn't be accepted.");
			});

			client.once('connect', () => {
				client.emit('type', 'invalid');
			});

		});

		it('handles duplicate hosts', function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			handleErr([client], done);

			client.once('client-accepted', () => {

				client.emit('type', 'host');

				client.once('client-accepted', () => {
					endTest([client], done, 'Two hosts not allowed.');
				});

			});

			client.once('host-exists', () => {
				endTest([client], done);
			});

			client.once('connect', () => {
				client.emit('type', 'host');
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
					clientTwo.emit('type', 'player');
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

			client.once('begin', () => {
				endTest([client], done, 'The game should not begin.');
			});

		});

		it('fails to begin when there is no screen', function (done) {

			let client = io.connect(`http://localhost:${port}`, options);

			handleErr([client], done);

			client.once('connect', () => {
				client.emit('type', 'host');
			});

			client.once('client-accepted', () => {
				client.emit('begin');
			});

			client.once('begin-fail', () => {
				endTest([client], done);
			});

			client.once('begin', () => {
				endTest([client], done, 'The game should not begin.');
			});

		});

		it('fails to begin when there are not enough players', function (done) {

			let clientOne = io.connect(`http://localhost:${port}`, options);
			let clientTwo = io.connect(`http://localhost:${port}`, options);

			handleErr([clientOne, clientTwo], done);

			clientOne.once('connect', () => {
				clientOne.emit('type', 'host');
			});

			clientTwo.once('connect', () => {
				clientTwo.emit('type', 'screen');
			});

			clientOne.once('client-accepted', () => {

				clientTwo.once('client-accepted', () => {
					clientOne.emit('begin');
				});
				
			});

			clientOne.once('begin-fail', () => {
				endTest([clientOne, clientTwo], done);
			});

			clientOne.once('begin', () => {

				endTest([clientOne, clientTwo], done,
					'The game should not begin.');

			});

		});

	});

});
