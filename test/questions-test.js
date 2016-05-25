'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let Questions = require('../lib/questions');


// ----- Setup ----- //

const QUESTIONS_FILE = './test/questions.json';


// ----- Tests ----- //

describe('Questions', function () {

	let questions = {};

	beforeEach(function () {
		questions = Questions(QUESTIONS_FILE);
	});

	it('loads the questions without error', function () {
		expect('get' in questions).to.be.true;
	});

	it('retrieves a question from a category', function () {

		let question = questions.get('catOne');
		expect(question).to.eql({q: 'Question One', a: ['Answer One']});

	});

	it('returns null for an invalid category', function () {

		let question = questions.get('invalid');
		expect(question).to.be.null;

	});

});
