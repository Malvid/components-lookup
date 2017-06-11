# components-lookup

[![Travis Build Status](https://travis-ci.org/comwrap/components-lookup.svg?branch=master)](https://travis-ci.org/comwrap/components-lookup) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/jel403y9seskhel4?svg=true)](https://ci.appveyor.com/project/electerious/components-lookup) [![Coverage Status](https://coveralls.io/repos/github/comwrap/components-lookup/badge.svg?branch=master)](https://coveralls.io/github/comwrap/components-lookup?branch=master) [![Dependencies](https://david-dm.org/comwrap/components-lookup.svg)](https://david-dm.org/comwrap/components-lookup#info=dependencies)

Look for components and gather information about them.

## Install

```
npm install components-lookup
```

## Usage

### Structure

```
.
├── index.data.json
└── index.njk
```

### Code

```js
const componentsLookup = require('components-lookup')

const resolvers = {
	view: (fileName, fileExt) => [ `${ fileName }${ fileExt }` ],
	data: (fileName, fileExt) => [ `${ fileName }.data.json`, `${ fileName }.data.js` ],
	notes: (fileName, fileExt) => [ `${ fileName }.md` ]
}

componentsLookup('**/*.njk', resolvers)
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
			{ index: 2, id: 'notes', data: null }
		]
	}
]
```

## Parameters

- `pattern` `{String}` - Files to look for using a glob pattern.
- `resolvers` `{Object}` - Functions that return an array of paths to tell the potential location of files.
- `opts` `{?Object}` - Options.
	- `cwd` `{?String}` - Directory in which to look for components. Defaults to `process.cwd()`.

## Returns

- `{Array}` - Components and their information.