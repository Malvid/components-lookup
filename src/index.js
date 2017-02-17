'use strict'

const path       = require('path')
const fs         = require('fs')
const glob       = require('glob')
const locatePath = require('locate-path')
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
 * Gather information about a component.
 * @public
 * @param {String} filePath - Absolute path to component.
 * @param {String} cwd
 * @param {Function} dataPaths - Function that returns an array of paths to tell the location of potential data files.
 * @returns {Object} component - Information of a component.
 */
const parseComponent = function(filePath, cwd, dataPaths) {

	const fileDir = path.dirname(filePath)

	const id   = path.parse(filePath).name
	const dir  = path.relative(cwd, fileDir)
	const src  = path.relative(cwd, filePath)
	const view = fs.readFileSync(filePath, 'utf8')

	const data = (() => {

		// Look for the data in the same directory as filePath
		const relativeDataPath = locatePath.sync(dataPaths(filePath), {
			cwd: fileDir
		})

		if (relativeDataPath==null) return

		// Path to data must be absolute to read it
		const absoluteDataPath = path.resolve(fileDir, relativeDataPath)

		return fs.readFileSync(absoluteDataPath, 'utf8')

	})()

	return {
		id,
		dir,
		src,
		view,
		data
	}

}

/**
 * Look for components and gather information about them.
 * @public
 * @param {String} pattern - Files to look for using a glob pattern.
 * @param {Object} opts - Options.
 * @returns {Array} components - Components and their information.
 */
module.exports = function(pattern, opts) {

	if (typeof pattern!=='string') {
		throw new Error(`'pattern' must be a string`)
	}

	if (isPlainObj(opts)===false && opts!=null) {
		throw new Error(`'opts' must be an object, null or undefined`)
	}

	opts = Object.assign({
		cwd       : process.cwd(),
		dataPaths : () => {}
	}, opts)

	// Support relative and absolute paths
	opts.cwd = path.resolve(process.cwd(), opts.cwd)

	const filePaths = getFiles(pattern, opts.cwd)

	return filePaths.map((filePath) => {

		// Ensure that path is absolute
		filePath = path.resolve(opts.cwd, filePath)

		return parseComponent(filePath, opts.cwd, opts.dataPaths)

	})

}