'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let Users = require('../lib/users');


// ----- Mockups ----- //

// Creates a mocked socket with interface required for tests to pass.
function MockSocket (id) {

	return {
		id: id,
		emit: function () {}
	};

}


// ----- Tests ----- //

describe('Users', function () {

	let users = null;

	beforeEach(function () {
		users = Users();
	});

	it('fails to update scores on invalid user', function () {

		users.add(MockSocket('an id'), 'Player 1');

		let result = users.updateScore('invalid', 2);
		expect(result).to.be.null;

	});

});
