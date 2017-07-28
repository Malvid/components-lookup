'use strict'

const os = require('os')
const assert = require('chai').assert
const uuid = require('uuid/v4')
const index = require('./../src/index')

const fsify = require('fsify')({
	cwd: os.tmpdir()
})

const getData = (component, id) => component.data.filter((data) => data.id===id)[0]

describe('index()', function() {

	it('should throw an error when called without pattern', async function() {

		return index().then((result) => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(`'pattern' must be a string`, err.message)

		})

	})

	it('should throw an error when called without files', async function() {

		return index('').then((result) => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(`'resolvers' must be an array`, err.message)

		})

	})

	it('should throw an error when called with invalid options', async function() {

		return index('', [], '').then((result) => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(`'opts' must be an object, null or undefined`, err.message)

		})

	})

	it('should return an array', async function() {

		const result = await index('*', [])

		assert.isArray(result)

	})

	it('should return an array with a component that has view and data, but no notes', async function() {

		const componentName = uuid()

		const structure = await fsify([
			{
				type: fsify.DIRECTORY,
				name: uuid(),
				contents: [
					{
						type: fsify.FILE,
						name: `${ componentName }.njk`,
						contents: uuid()
					},
					{
						type: fsify.FILE,
						name: `${ componentName }.data.json`,
						contents: JSON.stringify({})
					}
				]
			}
		])

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

		const result = await index('**/[^_]*.{ejs,njk,html}', resolvers, {
			cwd: structure[0].name
		})

		assert.equal(0, result[0].index)
		assert.equal(0, getData(result[0], 'view').index)

		assert.equal(componentName, result[0].name)

		assert.equal(Object.keys(resolvers).length, result[0].data.length)

		assert.equal(structure[0].contents[0].contents, getData(result[0], 'view').data)
		assert.equal(structure[0].contents[1].contents, getData(result[0], 'data').data)
		assert.equal(null, getData(result[0], 'notes').data)

	})

	it('should return an array with a component that has a parsed config', async function() {

		const componentName = uuid()
		const componentConfig = { data: uuid() }

		const structure = await fsify([
			{
				type: fsify.DIRECTORY,
				name: uuid(),
				contents: [
					{
						type: fsify.FILE,
						name: `${ componentName }.njk`
					},
					{
						type: fsify.FILE,
						name: `${ componentName }.config.json`,
						contents: JSON.stringify(componentConfig)
					}
				]
			}
		])

		const resolvers = [
			{
				id: 'config',
				parse: (contents) => JSON.parse(contents),
				resolve: (fileName, fileExt) => [ `${ fileName }.config.json` ]
			}
		]

		const result = await index('**/[^_]*.{ejs,njk,html}', resolvers, {
			cwd: structure[0].name
		})

		assert.deepEqual(componentConfig, getData(result[0], 'config').data)

	})

	it('should throw an error when a resolved file failed to parse', async function() {

		const componentName = uuid()

		const structure = await fsify([
			{
				type: fsify.DIRECTORY,
				name: uuid(),
				contents: [
					{
						type: fsify.FILE,
						name: `${ componentName }.njk`
					},
					{
						type: fsify.FILE,
						name: `${ componentName }.config.json`,
						contents: ''
					}
				]
			}
		])

		const resolvers = [
			{
				id: 'config',
				parse: (contents) => JSON.parse(contents),
				resolve: (fileName, fileExt) => [ `${ fileName }.config.json` ]
			}
		]

		return index('**/[^_]*.{ejs,njk,html}', resolvers, { cwd: structure[0].name }).then((result) => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.include(err.message, 'Failed to parse')

		})

	})

	it('should return an array with a component that includes custom data from the resolver', async function() {

		const customData = uuid()

		const structure = await fsify([
			{
				type: fsify.DIRECTORY,
				name: uuid(),
				contents: [
					{
						type: fsify.FILE,
						name: `${ uuid() }.njk`
					}
				]
			}
		])

		const resolvers = [
			{
				id: 'view',
				customData,
				resolve: (fileName, fileExt) => [ `${ fileName }${ fileExt }` ]
			}
		]

		const result = await index('**/[^_]*.{ejs,njk,html}', resolvers, {
			cwd: structure[0].name
		})

		assert.equal(customData, getData(result[0], 'view').customData)

	})

})