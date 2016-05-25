'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let Questions = require('../lib/questions');


// ----- Setup ----- //

const QUESTIONS_FILE = './test/questions.json';


// ----- Tests ----- //

describe.only('Questions', function () {

	let questions = {};

	beforeEach(function () {
		questions = Questions(QUESTIONS_FILE);
	});

	it('loads the questions without error', function () {
		expect('get' in questions).to.be.true;
	});

});
