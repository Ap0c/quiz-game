// ----- Dependencies ----- //

var socket = io();


// ----- Models ----- //

var User = function User (name) {

	socket.emit('add-user', name);

	return {
		name: name
	};

};

var user = null;


// ----- User Choice Component ----- //

var chooseUser = {};

chooseUser.controller = function () {

	// Creates a new user with a given name.
	function createUser (name) {
		user = User(name);
	}

	return {
		user: createUser
	};

};

chooseUser.view = function (ctrl) {

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

};

m.mount(document.getElementsByTagName('main')[0], chooseUser);
