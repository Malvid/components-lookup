# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [6.0.0] - 2018-11-01

### Changed

- `parse` is now an async function
- The `contents` passed to `parse` is now a promise instead of a string

## [5.0.0] - 2018-08-25

### Added

- Custom URL parse function in the options

### Changed

- Removed `prepublish` script from `package.json`
- Only support Node.js 8+

### Fixed

- Assert parameter order in tests

## [4.0.2] - 2017-08-08

### Changed

- Ignore `yarn.lock` and `package-lock.json` files

## [4.0.1] - 2017-08-01

### Changed

- Optimized path parsing

## [4.0.0] - 2017-07-31

### Changed

- Only support Node.js 7 and 8
- Function returns a promise