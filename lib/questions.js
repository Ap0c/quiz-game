'use strict';

// ----- Requires ----- //

const fs = require('fs');


// ----- Functions ----- //

// Loads the questions from file and parses as JSON.
function loadQuestions (file) {

	let questions = fs.readFileSync(file);

	return JSON.parse(questions);

}

// Returns a random index from an array of given length.
function randomIndex (length) {

	let floatIndex = Math.random() * length;

	return Math.floor(floatIndex);

}

// Selects a random question from a given list.
function selectQuestion (questionList, category, remove) {

	if (!(category in questionList)) {
		return null;
	}

	let possibleQuestions = questionList[category];
	let noQuestions = possibleQuestions.length;

	if (noQuestions === 0) {
		return null;
	}

	let index = randomIndex(noQuestions);

	if (remove) {
		return possibleQuestions.splice(index, 1)[0];
	} else {
		return possibleQuestions[index];
	}

}

// Adds a question to a given list.
function pushQuestion (questionList, category, question) {

	let questions = questionList[category];

	if (Array.isArray(questions)) {
		questions.push(question);
	} else {
		questionList[category] = [question];
	}

}


// ----- Exports ----- //

module.exports = function Questions (questionFile) {

	// ----- Properties ----- //

	let freshQuestions = loadQuestions(questionFile);
	let usedQuestions = {};


	// ----- Functions ----- //

	// Retrieves a random question from a specified category.
	function getQuestion (category) {

		let freshQuestion = selectQuestion(freshQuestions, category, true);

		if (freshQuestion) {

			pushQuestion(usedQuestions, category, freshQuestion);
			return freshQuestion;

		} else {
			return selectQuestion(usedQuestions, category);
		}

	}


	// ----- Constructor ----- //

	return {
		get: getQuestion
	};

};
