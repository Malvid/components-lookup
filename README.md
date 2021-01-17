# components-lookup

![Build](https://github.com/Malvid/components-lookup/workflows/Build/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/Malvid/components-lookup/badge.svg?branch=master)](https://coveralls.io/github/Malvid/components-lookup?branch=master)

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
		parse: async (contents, filePath) => JSON.parse(await contents),
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
- `resolvers` `{Array}`
	- `resolver` `{Object}` - Object that helps `components-lookup` to find files related to a component.
		- `id` `{String}` - Unique identifier for the file.
		- `parse` `{?Promise<String|Object>}` - Optional function that returns a promise resolving the content of a matching file. Can be used to modify the original content.
		- `resolve` `{Function}` - Function that returns an array of file names related to a component. Accepts the file name and extension of the current component.
- `opts` `{?Object}` - Options.
	- `cwd` `{?String}` - Directory in which to look for components. Defaults to `process.cwd()`.
	- `url` `{?Function}` - Function that accepts and returns a URL. Allows you to modify the URL of components. Defaults to `(url) => url`.

## Returns

- `{Promise<Array>}` - Components and their information.