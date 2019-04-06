'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const glob = require('glob')
const locatePath = require('locate-path')
const rename = require('rename-extension')
const isPlainObj = require('is-plain-obj')
const pMap = require('p-map')

/**
 * Locate and load a file.
 * @public
 * @param {String} fileName - File name of the component.
 * @param {String} fileExt - File extension of the component.
 * @param {Function} resolve - Function that returns an array of paths to tell the potential location of a file.
 * @param {?Function} parse - Function that parses the contents of the file resolved by the resolve function.
 * @param {String} cwd - The directory in which to search. Must be absolute.
 * @returns {Promise<?String>} Contents of a file.
 */
const getFile = async function(fileName, fileExt, resolve, parse, cwd) {

	// Get an array of paths to tell the location of potential files
	const locations = resolve(fileName, fileExt)

	// Look for the data in the same directory as filePath
	const relativePath = await locatePath(locations, { cwd })

	// Only continue with files
	if (relativePath == null) return null

	// Path to data must be absolute to read it
	const absolutePath = path.resolve(cwd, relativePath)

	// Load the file
	const contents = util.promisify(fs.readFile)(absolutePath, 'utf8')

	// Parse file contents with the given parser
	if (parse != null) {
		try { return parse(contents, absolutePath) } catch (err) { throw new Error(`Failed to parse '${ relativePath }'`) }
	}

	return contents

}

/**
 * Gather information about a component.
 * @public
 * @param {String} filePath - Relative path to component.
 * @param {Number} index - Index of the current element being processed.
 * @param {Array} resolvers - Array of objects with functions that return an array of paths to tell the potential location of files.
 * @param {Object} opts - Options.
 * @returns {Promise<Object>} Information of a component.
 */
const parseComponent = async function(filePath, index, resolvers, opts) {

	// Use the filePath to generate a unique id
	const id = crypto.createHash('sha1').update(filePath).digest('hex')

	// File name and extension
	const { name: fileName, ext: fileExt } = path.parse(filePath)

	// Absolute directory path to the component
	const fileCwd = path.resolve(opts.cwd, path.dirname(filePath))

	// Absolute preview URL
	const rawURL = '/' + rename(filePath, '.html')
	const processedURL = opts.url(rawURL)

	// Reuse data from resolver and add additional information
	const data = await pMap(resolvers, async (resolver, index) => {

		return Object.assign({}, resolver, {
			index,
			data: await getFile(fileName, fileExt, resolver.resolve, resolver.parse, fileCwd)
		})

	})

	return {
		index,
		id,
		name: fileName,
		src: filePath,
		url: processedURL,
		data
	}

}

/**
 * Look for components and gather information about them.
 * @public
 * @param {String} pattern - Files to look for using a glob pattern.
 * @param {Array} resolvers - Array of objects with functions that return an array of paths to tell the potential location of files.
 * @param {?Object} opts - Options.
 * @returns {Promise<Array>} Components and their information.
 */
module.exports = async function(pattern, resolvers, opts) {

	if (typeof pattern !== 'string') throw new Error(`'pattern' must be a string`)
	if (Array.isArray(resolvers) === false) throw new Error(`'resolvers' must be an array`)
	if (isPlainObj(opts) === false && opts != null) throw new Error(`'opts' must be an object, null or undefined`)

	opts = Object.assign({
		cwd: process.cwd(),
		url: (url) => url
	}, opts)

	// Support relative and absolute paths
	opts.cwd = path.resolve(opts.cwd)

	// Get all files matching the pattern
	const filePaths = await util.promisify(glob)(pattern, { cwd: opts.cwd })

	// Parse all matching components
	return pMap(filePaths, (filePath, index) => parseComponent(filePath, index, resolvers, opts))

}