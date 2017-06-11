'use strict'

const os     = require('os')
const assert = require('chai').assert
const uuid   = require('uuid/v4')
const index  = require('./../src/index')

const fsify = require('fsify')({
	cwd: os.tmpdir()
})

const getData = (component, id) => component.data.filter((data) => data.id===id)[0]

describe('index()', function() {

	it('should throw an error when called without pattern', function() {

		assert.throws(() => index(), `'pattern' must be a string`)

	})

	it('should throw an error when called without files', function() {

		assert.throws(() => index(''), `'resolvers' must be an array`)

	})

	it('should throw an error when called with invalid options', function() {

		assert.throws(() => index('', [], ''), `'opts' must be an object, null or undefined`)

	})

	it('should return an array', function() {

		assert.isArray(index('*', []))

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

		const resolvers = [
			{
				id: 'view',
				resolve: (fileName, fileExt) => [ `${ fileName }${ fileExt }` ]
			},
			{
				id: 'data',
				resolve: (fileName, fileExt) => [ `${ fileName }.data.json`, `${ fileName }.data.js` ]
			},
			{
				id: 'notes',
				resolve: (fileName, fileExt) => [ `${ fileName }.md` ]
			}
		]

		return fsify(structure).then((structure) => {

			return index('**/[^_]*.{ejs,njk,html}', resolvers, {
				cwd: structure[0].name
			})

		}).then((components) => {

			assert.equal(0, components[0].index)
			assert.equal(0, getData(components[0], 'view').index)

			assert.equal(componentName, components[0].name)

			assert.equal(Object.keys(resolvers).length, components[0].data.length)

			assert.equal(structure[0].contents[0].contents, getData(components[0], 'view').data)
			assert.equal(structure[0].contents[1].contents, getData(components[0], 'data').data)
			assert.equal(null, getData(components[0], 'notes').data)

		})

	})

	it('should return an array with a component that has a parsed config', function() {

		const componentName = uuid()
		const componentConfig = { data: uuid() }

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
						name: `${ componentName }.config.json`,
						contents: JSON.stringify(componentConfig)
					}
				]
			}
		]

		const resolvers = [
			{
				id: 'config',
				parse: (contents) => JSON.parse(contents),
				resolve: (fileName, fileExt) => [ `${ fileName }.config.json` ]
			}
		]

		return fsify(structure).then((structure) => {

			return index('**/[^_]*.{ejs,njk,html}', resolvers, {
				cwd: structure[0].name
			})

		}).then((components) => {

			assert.deepEqual(componentConfig, getData(components[0], 'config').data)

		})

	})

	it('should throw an error when a resolved file failed to parse', function() {

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
						name: `${ componentName }.config.json`,
						contents: ''
					}
				]
			}
		]

		const resolvers = [
			{
				id: 'config',
				parse: (contents) => JSON.parse(contents),
				resolve: (fileName, fileExt) => [ `${ fileName }.config.json` ]
			}
		]

		return fsify(structure).then((structure) => {

			return index('**/[^_]*.{ejs,njk,html}', resolvers, {
				cwd: structure[0].name
			})

		}).then((components) => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.include(err.message, 'Failed to parse')

		})

	})

})