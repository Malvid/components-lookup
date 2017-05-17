'use strict'

const path       = require('path')
const fs         = require('fs')
const crypto     = require('crypto')
const glob       = require('glob')
const locatePath = require('locate-path')
const rename     = require('rename-extension')
const isPlainObj = require('is-plain-obj')

/**
 * Find files by a glob pattern.
 * @public
 * @param {String} pattern - Files to look for using a glob pattern.
 * @param {String} cwd - The directory in which to search.
 * @returns {Array} filePaths - List of matching files.
 */
const getFiles = function(pattern, cwd) {

	return glob.sync(pattern, { cwd })

}

/**
 * Locate and load a file.
 * @public
 * @param {String} filePath - Absolute path to component.
 * @param {Function} fn - Function that returns an array of paths to tell the potential location of a file.
 * @param {String} cwd - The directory in which to search.
 * @returns {String} file - Contents of a file.
 */
const getFile = function(filePath, fn, cwd) {

	const fileName = path.parse(filePath).name
	const fileExt  = path.parse(filePath).ext

	// Get an array of paths to tell the location of potential files
	const locations = fn(fileName, fileExt)

	// Look for the data in the same directory as filePath
	const relativePath = locatePath.sync(locations, { cwd })

	// Only continue when with files
	if (relativePath==null) return

	// Path to data must be absolute to read it
	const absolutePath = path.resolve(cwd, relativePath)

	return fs.readFileSync(absolutePath, 'utf8')

}

/**
 * Gather information about a component.
 * @public
 * @param {String} filePath - Absolute path to component.
 * @param {Object} files - Functions that return an array of paths to tell the potential location of files.
 * @param {String} cwd
 * @returns {Object} component - Information of a component.
 */
const parseComponent = function(filePath, files, cwd) {

	const fileDir = path.dirname(filePath)

	// Use the absolute filePath to generate a unique id
	const id = crypto.createHash('sha1').update(filePath).digest('hex')

	// Filename without extension
	const name = path.parse(filePath).name

	// Absolute preview URL
	const url  = '/' + rename(path.relative(cwd, filePath), '.html')

	const data = {}

	Object.keys(files).forEach((key) => {

		data[key] = getFile(filePath, files[key], fileDir)

	})

	return {
		id,
		name,
		src: filePath,
		url,
		data
	}

}

/**
 * Look for components and gather information about them.
 * @public
 * @param {String} pattern - Files to look for using a glob pattern.
 * @param {Object} files - Functions that return an array of paths to tell the potential location of files.
 * @param {?Object} opts - Options.
 * @returns {Array} components - Components and their information.
 */
module.exports = function(pattern, files, opts) {

	if (typeof pattern!=='string') {
		throw new Error(`'pattern' must be a string`)
	}

	if (isPlainObj(files)===false) {
		throw new Error(`'files' must be an object`)
	}

	if (isPlainObj(opts)===false && opts!=null) {
		throw new Error(`'opts' must be an object, null or undefined`)
	}

	opts = Object.assign({
		cwd: process.cwd()
	}, opts)

	// Support relative and absolute paths
	opts.cwd = path.resolve(opts.cwd)

	// Get all files matching the pattern
	const filePaths = getFiles(pattern, opts.cwd)

	return filePaths.map((filePath) => {

		// Ensure that path is absolute
		filePath = path.resolve(opts.cwd, filePath)

		return parseComponent(filePath, files, opts.cwd)

	})

}