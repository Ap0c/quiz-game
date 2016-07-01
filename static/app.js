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
		type: type
	};

})();

// List of users.
var users = [];

// List of players who have submitted answers.
var playersSubmitted = [];


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

		// Determines what part of the view to display.
		function displayType () {
			return user.type();
		}

		return {
			displayType: displayType
		};

	},

	view: function (ctrl) {

		var view = ['Gathering Players...'];

		// Emits the begin event.
		function emitBegin () {
			socket.emit('begin');
		}

		if (ctrl.displayType() === 'host') {
			view.push(m('button.begin', { onclick: emitBegin }, 'Begin'));
		} else if (ctrl.displayType() === 'screen') {

			view.push(m('ul', users.map(function (singleUser) {
				return m('li', singleUser);
			})));

		}

		return view;

	}

};

var chooseCategory = {

	controller: function (args) {

		// Determines what part of the category view this user is displaying.
		function displayType () {
			return user.type();
		}

		return {
			displayType: displayType
		};

	},

	view: function (ctrl, args) {

		if (ctrl.displayType() === 'host') {

			return args.categories.map(function (category) {

				return m('button', {
					onclick: function () {
						socket.emit('category-chosen', category);
					}
				}, category);

			});

		} else if (ctrl.displayType() === 'screen') {

			return m('ul', args.categories.map(function (category) {
				return m('li', category);
			}));

		} else {
			return m('', 'Category being chosen...');
		}

	}

};

var categoryInfo = {

	controller: function (args) {

		// Determines what part of the category view this user is displaying.
		function displayType () {
			return user.type();
		}

		return {
			displayType: displayType
		};

	},

	view: function (ctrl, args) {

		var view = [args.category];

		// Emits the start round event.
		function emitStartRound () {
			socket.emit('start-round');
		}

		if (ctrl.displayType() === 'host') {
			view.push(m('button', { onclick: emitStartRound }, 'Start Round'));
		}

		return view;

	}

};

var showQuestion = {

	controller: function (args) {

		// Determines what part of the category view this user is displaying.
		function displayType () {
			return user.type();
		}

		return {
			displayType: displayType
		};

	},

	view: function (ctrl, args) {

		if (ctrl.displayType() === 'host') {

			return [
				args.question.a,
				m('ul', playersSubmitted.map(function (player) {
					return m('li', player);
				}))
			];

		} else if (ctrl.displayType() === 'screen') {
			return args.question.q;
		} else {

			return [
				args.question.q,
				m('input', { type: 'text', placeholder: 'Enter answer here...' }),
				m('button', 'Submit')
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

	users.push(name);
	m.redraw();

});

socket.on('host-exists', function () {
	alert('Host exists');
});

socket.on('show-category', function (category) {
	m.mount(main, m.component(categoryInfo, { category: category }));
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
