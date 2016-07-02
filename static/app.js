// ----- Dependencies ----- //

var socket = io();


// ----- Setup ----- //

var main = document.getElementsByTagName('main')[0];
var header = document.getElementsByTagName('header')[0];


// ----- Models ----- //

// Constructor for the user.
var user = (function User () {

	// ----- Properties ----- //

	var type = m.prop();
	var name = m.prop();
	var answer = m.prop();

	// ----- Functions ----- //

	// Sets the user to a given type.
	function setUser (userType) {

		socket.emit('add-user', userType);
		type(userType);

	}

	// ----- Constructor ----- //

	return {
		set: setUser,
		name: name,
		type: type,
		answer: answer
	};

})();

// Model to manage the current state of the game.
var game = (function Game () {

	// ----- Properties ----- //

	var category = m.prop();
	var question = m.prop();

	// ----- Functions ----- //

	// Emits the begin event.
	function emitBegin () {
		socket.emit('begin');
	}

	// Emits the chosen category.
	function accessCategory (newCategory) {

		if (newCategory) {

			category(newCategory);

			if (user.type() === 'host') {
				socket.emit('category-chosen', newCategory);
			}

		} else {
			return category();
		}
		
	}

	// Emits the start round event.
	function emitStartRound () {
		socket.emit('start-round');
	}

	// Submits the user's answer.
	function submitAnswer () {
		socket.emit('submit-answer', user.answer);
	}

	// ----- Constructor ----- //

	return {
		users: [],
		playersSubmitted: [],
		category: accessCategory,
		question: question,
		begin: emitBegin,
		startRound: emitStartRound,
		answer: submitAnswer
	};

})();


// ----- Components ----- //

// The page header.
var head = {
	view: function (ctrl) {
		return user.name();
	}
};

// The user type choice screen.
var chooseUser = {

	controller: function () {

		// Sets the user to a given type
		function setUser (type) {
			user.set(type);
		}

		return {
			user: setUser
		};

	},

	view: function (ctrl) {

		return [
			m('button.choose-player', {
				onclick: function () { ctrl.user('player'); }
			}, 'Player'),
			m('button.choose-host', {
				onclick: function () { ctrl.user('host'); }
			}, 'Host'),
			m('button.choose-screen', {
				onclick: function () { ctrl.user('screen'); }
			}, 'Screen')
		];

	}

};

var gatheringPlayers = {

	controller: function (args) {

		return {
			userType: user.type,
			users: game.users,
			begin: game.begin
		};

	},

	view: function (ctrl) {

		var view = ['Gathering Players...'];

		if (ctrl.userType() === 'host') {
			view.push(m('button.begin', { onclick: ctrl.begin }, 'Begin'));
		} else if (ctrl.userType() === 'screen') {

			view.push(m('ul', ctrl.users.map(function (singleUser) {
				return m('li', singleUser);
			})));

		}

		return view;

	}

};

var chooseCategory = {

	controller: function (args) {

		return {
			userType: user.type,
			category: game.category
		};

	},

	view: function (ctrl, args) {

		if (ctrl.userType() === 'host') {

			return args.categories.map(function (category) {

				return m('button', {
					onclick: function () { ctrl.category(category); }
				}, category);

			});

		} else if (ctrl.userType() === 'screen') {

			return m('ul', args.categories.map(function (category) {
				return m('li', category);
			}));

		} else {
			return m('', 'Category being chosen...');
		}

	}

};

var categoryInfo = {

	controller: function () {

		return {
			userType: user.type,
			startRound: game.startRound
		};

	},

	view: function (ctrl) {

		var view = [game.category()];

		if (ctrl.userType() === 'host') {
			view.push(m('button', { onclick: ctrl.startRound }, 'Start Round'));
		}

		return view;

	}

};

var showQuestion = {

	controller: function (args) {

		return {
			userType: user.type,
			playersSubmitted: game.playersSubmitted,
			submit: game.answer,
			answer: user.answer
		};

	},

	view: function (ctrl, args) {

		if (ctrl.userType() === 'host') {

			return [
				args.question.a,
				m('ul', ctrl.playersSubmitted.map(function (player) {
					return m('li', player);
				}))
			];

		} else if (ctrl.userType() === 'screen') {
			return args.question.q;
		} else {

			return [
				args.question.q,
				m('input', { type: 'text', placeholder: 'Enter answer here...',
					onchange: m.withAttr('value', ctrl.answer) }),
				m('button', { onclick: ctrl.submit }, 'Submit')
			];

		}

	}

};


// ----- Socket Events ----- //

socket.on('err', function (err) {
	alert(err);
});

socket.on('client-disconnect', function (name) {
	alert(`Client disconnect: ${name}.`);
});

// Mounts the category view.
socket.on('category-view', function (categories) {
	m.mount(main, m.component(chooseCategory, { categories: categories }));
});

// Displays an error message when game fails to begin.
socket.on('begin-fail', function (msg) {
	alert(`Begin fail: ${msg}`);
});

// Saves the user's name when they are accepted.
socket.on('client-accepted', function (userName) {

	user.name(userName);
	m.mount(main, gatheringPlayers);

});

socket.on('new-user', function (name) {

	game.users.push(name);
	m.redraw();

});

socket.on('host-exists', function () {
	alert('Host exists');
});

socket.on('show-category', function (category) {

	if (user.type() !== 'host') {
		game.category(category);
	}

	m.mount(main, categoryInfo);

});

socket.on('scores-view', function (scores) {
	alert(`Scores view: ${scores}.`);
});

socket.on('question-view', function (question) {
	m.mount(main, m.component(showQuestion, { question: question }));
});

socket.on('answer-submitted', function (name) {
	alert(`Answer submitted: ${name}.`);
});

socket.on('answers-view', function (answers) {
	alert(`Answers view: ${answers}.`);
});


// ----- Default Components ----- //

m.mount(main, chooseUser);
m.mount(header, head);
