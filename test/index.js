'use strict'

const os     = require('os')
const assert = require('chai').assert
const uuid   = require('uuid/v4')
const index  = require('./../src/index')

const fsify = require('fsify')({
	cwd: os.tmpdir()
})

describe('index()', function() {

	it('should throw an error when called without pattern', function() {

		assert.throws(() => index(), `'pattern' must be a string`)

	})

	it('should throw an error when called without files', function() {

		assert.throws(() => index(''), `'resolvers' must be an object`)

	})

	it('should throw an error when called with invalid options', function() {

		assert.throws(() => index('', {}, ''), `'opts' must be an object, null or undefined`)

	})

	it('should return an array', function() {

		assert.isArray(index('*', {}))

	})

	it('should return an array with a component that has view and data, but no notes', function() {

		const componentName = uuid()

		const structure = [
			{
				type: fsify.DIRECTORY,
				name: uuid(),
				contents: [
					{
						type: fsify.FILE,
						name: `${ componentName }.njk`,
						contents: 'Hello World!'
					},
					{
						type: fsify.FILE,
						name: `${ componentName }.data.json`,
						contents: JSON.stringify({})
					}
				]
			}
		]

		const resolvers = {
			view: (fileName, fileExt) => [ `${ fileName }${ fileExt }` ],
			data: (fileName, fileExt) => [ `${ fileName }.data.json`, `${ fileName }.data.js` ],
			notes: (fileName, fileExt) => [ `${ fileName }.md` ],
			output: null
		}

		return fsify(structure).then((structure) => {

			return index('**/[^_]*.{ejs,njk,html}', resolvers, {
				cwd: structure[0].name
			})

		}).then((components) => {

			assert.isArray(components)
			assert.equal(componentName, components[0].name)
			assert.equal(structure[0].contents[0].contents, components[0].data.view)
			assert.equal(structure[0].contents[1].contents, components[0].data.data)
			assert.equal(null, components[0].data.notes)
			assert.equal(null, components[0].data.output)

		})

	})

})