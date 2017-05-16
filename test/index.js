'use strict'

const assert = require('chai').assert
const index  = require('./../src/index')

describe('index()', function() {

	it('should throw an error when called without pattern', function() {

		assert.throws(() => index(), `'pattern' must be a string`)

	})

	it('should throw an error when called without files', function() {

		assert.throws(() => index(''), `'files' must be an object`)

	})

	it('should throw an error when called with invalid options', function() {

		assert.throws(() => index('', {}, ''), `'opts' must be an object, null or undefined`)

	})

	it('should return an array', function() {

		assert.isArray(index('*', {}))

	})

})