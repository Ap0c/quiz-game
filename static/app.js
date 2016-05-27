// ----- Dependencies ----- //

var socket = io();


// ----- Models ----- //

// Constructor for the user.
var user = (function User () {

	// ----- Properties ----- //

	var type = null;

	// ----- Functions ----- //

	// Sets the user to a given type.
	function setUser (userType) {

		socket.emit('add-user', userType);
		type = userType;

	}

	return {
		set: setUser
	};

})();


// ----- User Choice Component ----- //

var chooseUser = {};

chooseUser.controller = function () {

	// Sets the user to a given type
	function setUser (type) {
		user.set(type);
	}

	return {
		user: setUser
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
