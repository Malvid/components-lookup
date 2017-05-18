# components-lookup

[![Travis Build Status](https://travis-ci.org/electerious/components-lookup.svg?branch=master)](https://travis-ci.org/electerious/components-lookup) [![Coverage Status](https://coveralls.io/repos/github/electerious/components-lookup/badge.svg?branch=master)](https://coveralls.io/github/electerious/components-lookup?branch=master) [![Dependencies](https://david-dm.org/electerious/components-lookup.svg)](https://david-dm.org/electerious/components-lookup#info=dependencies)

Look for components and gather information about them.

## Install

```
npm install components-lookup
```

## Usage

```js
const componentsLookup = require('components-lookup')

const resolvers = {
	view: (fileName, fileExt) => [ `${ fileName }${ fileExt }` ],
	data: (fileName, fileExt) => [ `${ fileName }.data.json`, `${ fileName }.data.js` ],
	notes: (fileName, fileExt) => [ `${ fileName }.md` ]
}

componentsLookup('**/*.njk', resolvers)
componentsLookup('**/[^_]*.{ejs,njk,html}', resolvers, { cwd: __dirname })
```

## Parameters

- `pattern` `{String}` - Files to look for using a glob pattern.
- `resolvers` `{Object}` - Functions that return an array of paths to tell the potential location of files.
- `opts` `{?Object}` - Options.
	- `cwd` `{?String}` - Directory in which to look for components. Defaults to `process.cwd()`.

## Returns

- `{Array}` - Components and their information.