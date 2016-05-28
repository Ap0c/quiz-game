// ----- Dependencies ----- //

var socket = io();


// ----- Setup ----- //

var main = document.getElementsByTagName('main')[0];
var header = document.getElementsByTagName('header')[0];


// ----- Models ----- //

// Constructor for the user.
var user = (function User () {

	// ----- Properties ----- //

	var type = null;
	var name = m.prop();

	// ----- Functions ----- //

	// Sets the user to a given type.
	function setUser (userType) {

		socket.emit('add-user', userType);
		type = userType;

	}

	// ----- Constructor ----- //

	return {
		set: setUser,
		name: name
	};

})();


// ----- Socket Events ----- //

// Saves the user's name when they are accepted.
socket.on('client-accepted', function (userName) {

	m.startComputation();
	user.name(userName);
	m.endComputation();

});


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


// ----- Header Component ----- //

var head = {
	view: function (ctrl) {
		return user.name();
	}
};


// ----- Default Components ----- //

m.mount(main, chooseUser);
m.mount(header, head);
