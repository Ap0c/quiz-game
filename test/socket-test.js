'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let io = require('socket.io-client');


// ----- Setup ----- //

const options = {
	transports: ['websocket'],
	'force new connection': true
};

const PORT = 3000;


// ----- Functions ----- //

// Ends an async test, with or without err, and disconnects sockets.
function endTest (sockets, done, err) {

	for (let socket of sockets) {
		socket.disconnect();
	}

	done(err ? Error(err) : null);

}


// ----- Tests ----- //

describe('Socket', function () {

	beforeEach(function (done) {

		require('../index');
		done();

	});

	it('accepts a connection', function (done) {

		let client = io.connect(`http://localhost:${PORT}`, options);

		client.once('connect', () => {
			endTest([client], done);
		});

	});

	describe('Type Events', function () {

		it("handles a 'type' event for correct user", function (done) {

			let client = io.connect(`http://localhost:${PORT}`, options);

			client.once('err', (msg) => {
				endTest([client], done, msg);
			});

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

			let client = io.connect(`http://localhost:${PORT}`, options);

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

			let client = io.connect(`http://localhost:${PORT}`, options);

			client.once('err', (msg) => {
				endTest([client], done, msg);
			});

			client.once('client-accepted', () => {
				endTest([client], done, 'Two hosts not allowed.');
			});

			client.once('host-exists', () => {
				endTest([client], done);
			});

			client.once('connect', () => {

				client.emit('type', 'host');
				client.emit('type', 'host');

			});

		});

		it("broadcasts a 'new-user' event", function (done) {

			let clientOne = io.connect(`http://localhost:${PORT}`, options);
			let clientTwo = io.connect(`http://localhost:${PORT}`, options);

			clientOne.once('err', (msg) => {
				endTest([clientOne, clientTwo], done, msg);
			});

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

		it('fails to begin when there are not enough users', function (done) {

			let client = io.connect(`http://localhost:${PORT}`, options);

			client.once('err', (msg) => {
				endTest([client], done, msg);
			});

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

	});

});
