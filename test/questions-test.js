'use strict';

// ----- Requires ----- //

const expect = require('chai').expect;
const fs = require('fs');
const Questions = require('../lib/questions');


// ----- Setup ----- //

const QUESTIONS_FILE = './test/questions.json';


// ----- Functions ----- //

// Loads the questions from file and parses as JSON.
function loadQuestions (file) {

	let questions = fs.readFileSync(file);

	return JSON.parse(questions);

}


// ----- Tests ----- //

describe('Questions', function () {

	let questions = {};
	let questionList = loadQuestions(QUESTIONS_FILE)

	beforeEach(function () {
		questions = Questions(QUESTIONS_FILE);
	});

	it('loads the questions without error', function () {
		expect('get' in questions).to.be.true;
	});

	it('retrieves a question from a category', function () {

		let question = questions.get('catOne');
		expect(question).to.eql(questionList.catOne[0]);

	});

	it('returns null for an invalid category', function () {

		let question = questions.get('invalid');
		expect(question).to.be.null;

	});

	it('retrieves a question from the used list', function () {

		let freshQuestion = questions.get('catOne');
		let usedQuestion = questions.get('catOne');
		
		expect(usedQuestion).to.eql(questionList.catOne[0]);

	});

	it('retrieves multiple questions', function () {

		let firstQuestion = questions.get('catTwo');
		let secondQuestion = questions.get('catTwo');
		let usedQuestion = questions.get('catTwo');

		expect(questionList.catTwo).to.include(firstQuestion);
		expect(questionList.catTwo).to.include(secondQuestion);
		expect(questionList.catTwo).to.include(usedQuestion);

	});

});
