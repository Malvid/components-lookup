'use strict'

const os = require('os')
const assert = require('chai').assert
const uuid = require('uuid/v4')
const index = require('./../src/index')

const fsify = require('fsify')({
	cwd: os.tmpdir()
})

const getData = (component, id) => component.data.filter((data) => data.id === id)[0]

describe('index()', function() {

	it('should throw an error when called without pattern', async function() {

		return index().then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(err.message, `'pattern' must be a string`)

		})

	})

	it('should throw an error when called without files', async function() {

		return index('').then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(err.message, `'resolvers' must be an array`)

		})

	})

	it('should throw an error when called with invalid options', async function() {

		return index('', [], '').then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(err.message, `'opts' must be an object, null or undefined`)

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
				resolve: (fileName) => [ `${ fileName }.data.json`, `${ fileName }.data.js` ]
			},
			{
				id: 'notes',
				resolve: (fileName) => [ `${ fileName }.md` ]
			}
		]

		const result = await index('**/[^_]*.{ejs,njk,html}', resolvers, {
			cwd: structure[0].name
		})

		assert.strictEqual(result[0].index, 0)
		assert.strictEqual(getData(result[0], 'view').index, 0)

		assert.strictEqual(result[0].name, componentName)

		assert.strictEqual(result[0].data.length, Object.keys(resolvers).length)

		assert.strictEqual(getData(result[0], 'view').data, structure[0].contents[0].contents)
		assert.strictEqual(getData(result[0], 'data').data, structure[0].contents[1].contents)
		assert.strictEqual(getData(result[0], 'notes').data, null)

	})

	it('should return an array with a component that has parsed data', async function() {

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
				id: 'view',
				// Use filePath as data
				parse: async (contents, filePath) => filePath,
				resolve: (fileName) => [ `${ fileName }.njk` ]
			},
			{
				id: 'config',
				// Parse contents as object and use it as data
				parse: async (contents) => JSON.parse(await contents),
				resolve: (fileName) => [ `${ fileName }.config.json` ]
			}
		]

		const result = await index('**/[^_]*.{ejs,njk,html}', resolvers, {
			cwd: structure[0].name
		})

		assert.deepEqual(getData(result[0], 'view').data, structure[0].contents[0].name)
		assert.deepEqual(getData(result[0], 'config').data, componentConfig)

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
				resolve: (fileName) => [ `${ fileName }.config.json` ]
			}
		]

		return index('**/[^_]*.{ejs,njk,html}', resolvers, { cwd: structure[0].name }).then(() => {

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

		assert.equal(getData(result[0], 'view').customData, customData)

	})

	it('should return an array with a custom parsed component URL', async function() {

		const customURL = uuid()

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

		const result = await index('**/[^_]*.{ejs,njk,html}', [], {
			cwd: structure[0].name,
			url: () => customURL
		})

		assert.equal(result[0].url, customURL)

	})

})