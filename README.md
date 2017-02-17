# component-lookup

[![Travis Build Status](https://travis-ci.org/electerious/component-lookup.svg?branch=master)](https://travis-ci.org/electerious/component-lookup) [![Coverage Status](https://coveralls.io/repos/github/electerious/component-lookup/badge.svg?branch=master)](https://coveralls.io/github/electerious/component-lookup?branch=master) [![Dependencies](https://david-dm.org/electerious/component-lookup.svg)](https://david-dm.org/electerious/component-lookup#info=dependencies)

Look for components and gather information about them.

## Install

```
npm install component-lookup
```

## Usage

```js
const componentLookup = require('component-lookup')

componentLookup('*/[^_]*.njk')
componentLookup('*/[^_]*.njk', { cwd: __dirname })
componentLookup('*/[^_]*.njk', { dataPaths: (fileName) => [ `${ fileName }.data.js` ] })
```

## Parameters

- `pattern` `{String}` - Files to look for using a glob pattern.
- `opts` `{?Object}` - Options.
	- `cwd` `{?String}` - Directory in which to look for components. Defaults to `process.cwd()`.
	- `dataPaths` `{?Function}` - Function that returns an array of paths to tell `component-lookup` the location of potential data files.

## Returns

- `{Object}` - Components and their information.