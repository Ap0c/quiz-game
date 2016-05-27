// ----- Dependencies ----- //

var socket = io();


// ----- User Choice Component ----- //

var chooseUser = {};

chooseUser.controller = function () {};

chooseUser.view = function (ctrl) {

	return [
		m('button.choose-player', 'Player'),
		m('button.choose-host', 'Host'),
		m('button.choose-screen', 'Screen')
	];

};

m.module(document.getElementsByTagName('main')[0], chooseUser);
