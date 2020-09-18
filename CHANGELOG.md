# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.2.0] - - 2020-09-18

### Changed

- optimized non-capture groupings to avoid redundancies
- simplified RXPUnit types to reflect a single interface with optional methods/ properties. This was done to simplify the intellisense suggestions to a single RXPUnit. Before, each possible stage of the RXP constructor would show up as a separate type.
- split main `init` file into `init`, `formatVariables`, and `constructRXP` for better code organization
- updated internal code documentation

### Fixed

- fixed bug that created too many `\` escaping characters when generating regex variables

### Removed

- removed unnecessary `escaped` property from constructor units

## [1.1.0] - 2020-09-16

### Added

- Constructor functions can now accept regex literals (`/regex/g`) as arguments
- CHANGELOG added

## [1.0.0] - 2020-09-14

### Added

- Initial publish to NPM

[unreleased]: https://github.com/jt-rose/rxp/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/jt-rose/rxp/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/jt-rose/rxp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/jt-rose/rxp/releases/tag/v1.0.0
