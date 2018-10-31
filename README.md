# components-lookup

[![Travis Build Status](https://travis-ci.org/Malvid/components-lookup.svg?branch=master)](https://travis-ci.org/Malvid/components-lookup) [![Coverage Status](https://coveralls.io/repos/github/Malvid/components-lookup/badge.svg?branch=master)](https://coveralls.io/github/Malvid/components-lookup?branch=master) [![Dependencies](https://david-dm.org/Malvid/components-lookup.svg)](https://david-dm.org/Malvid/components-lookup#info=dependencies)

Look for components and gather information about them.

## Install

```
npm install components-lookup
```

## Usage

### Structure

```
.
├── index.config.json
├── index.data.json
└── index.njk
```

### Code

```js
const componentsLookup = require('components-lookup')

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
	},
	{
		id: 'config',
		parse: (contents) => JSON.parse(contents),
		resolve: (fileName, fileExt) => [ `${ fileName }.config.json` ]
	}
]

componentsLookup('**/*.njk', resolvers).then(console.log)
```

### Output

```js
[
	{
		index: 0,
		id: '8bf47e30644eb32653aa6284ebe2fb9c17e3587d',
		name: 'index',
		src: 'index.njk',
		url: '/index.html',
		data: [
			{ index: 0, id: 'view', data: 'Hello World!' },
			{ index: 1, id: 'data', data: '{}' },
			{ index: 2, id: 'notes', data: null },
			{ index: 3, id: 'config', data: {} }
		]
	}
]
```

## Parameters

- `pattern` `{String}` - Files to look for using a glob pattern.
- `resolvers` `{Array}` - Array of objects with functions that return an array of paths to tell the potential location of files.
- `opts` `{?Object}` - Options.
	- `cwd` `{?String}` - Directory in which to look for components. Defaults to `process.cwd()`.
	- `url` `{?Function}` - Function that accepts and returns a URL. Allows you to modify the URL of components. Defaults to `(url) => url`.

## Returns

- `{Promise<Array>}` - Components and their information.