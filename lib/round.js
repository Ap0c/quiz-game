'use strict';

// ----- Setup ----- //

const NO_QUESTIONS = 5;


// ----- Exports ----- //

// Object to handle metadata about round.
module.exports = function Round (category) {

	// ----- Properties ----- //

	let questionCounter = 0;
	let answers = [];

	// ----- Functions ----- //

	// Sets up for a new question.
	function newQuestion () {

		answers = [];
		questionCounter++;

	}

	// Records a user answer.
	function addAnswer (user, answer) {
		answers.push({user: { name: user.name, id: user.id }, answer: answer});
	}

	// Returns boolean based on whether all answers have been submitted.
	function allSubmitted (noPlayers) {
		return noPlayers === answers.length;
	}

	// ----- Constructor ----- //

	return {
		newQuestion: newQuestion,
		answer: addAnswer,
		allSubmitted: allSubmitted,
		get complete () { return questionCounter > NO_QUESTIONS; },
		get answers () { return answers; },
		get category () { return category; },
		set category (value) { category = value; }
	};

};
