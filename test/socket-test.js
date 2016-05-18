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


// ----- Tests ----- //

describe('Socket', function () {

	beforeEach(function (done) {

		require('../index');
		done();

	});

	it('accepts a connection', function (done) {

		let client = io.connect(`http://localhost:${port}`, options);
		console.log(port);

		client.once('connect', () => {

			client.disconnect();
			done();

		});

	});

});
