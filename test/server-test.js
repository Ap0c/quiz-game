'use strict';

// ----- Requires ----- //

let expect = require('chai').expect;
let request = require('supertest');
let server = require('../index');


// ----- Tests ----- //

describe('Server', function () {

	it('serves the main page', function (done) {

		request(server).get('/').expect(200, done);

	});

});