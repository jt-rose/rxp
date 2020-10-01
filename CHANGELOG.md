# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- removed default exports

## [v1.4.2] - 2020-10-01

## Changed

- removed parcel bundler, which may have been causing type declaration errors resulting in 'any' types when specific types had been defined.

## [v1.4.1] - 2020-09-30

## Changed

- minified/ bundled with parcel
- expanded info on package.json, including correction to main path

## [v1.4.0] - 2020-09-24

## Added

- added `withBoundaries` function to initialize an RXP unit with `\b` word boundaries on each side. A custom constructor class was used to remove the step 2 - occurs family of modifiers as these would not work with word boundaries

## Changed

- replaced `NewText` type for constructor arguments with specific `string | RegExp | RXPUnit` types listed to improve intellisense recommendations

## [v1.3.1] - 2020-09-23

### Fixed

- fixed issue on regex variable deconstruction that did not correctly interpret escaped parentheses, causing the full variable declaration to not be matched if `\\(` or `\\)` present

## [v1.3.0] - 2020-09-23

### Added

- regex variable names can now be set by the user, but a variable name can still be automatically generated through `uniqid` if no name argument is passed when using the `isVariable` method
- when submitting regex literals with variables, RXP will now reconstruct them as RXP-style variables, allowing the order of variable references to be correctly parsed on the fly when using `construct`. Basically, if you have a regex with variables `/(?<var>sample-\d)...\k<var>/` and want to use it again when composing a new regex pattern, RXP can now combine these without running into any issues. For example, if the `init` function were called with the above regex submitted twice, it would reconfigure it to be `/(?<var>sample-\d)...(\k<var>)(\k<var>)...(\k<var>)/`

### Fixed

- `doesNotOccurs` and `noOccurenceOf` did not work as intended when supplying arguments grater than a single character. To avoid confusion, these have been removed and the `...except(...)` preset functions/ negative lookaheads and lookbehinds can instead serve this purpose.
- when using `uniqid` to generate automatic regex variable names, numbers cannot be used. These were originally simply filtered out, but this caused some of the resulting id's to be the same. To get around this, the generated numbers are now mapped out to corresponding letters to ensure the id's remain unique.

## [v1.2.1] - 2020-09-18

### Fixed

- corrected missing version info

## [v1.2.0] - 2020-09-18

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

[unreleased]: https://github.com/jt-rose/rxp/compare/v1.4.2...HEAD
[1.4.2]: https://github.com/jt-rose/rxp/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/jt-rose/rxp/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/jt-rose/rxp/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/jt-rose/rxp/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/jt-rose/rxp/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/jt-rose/rxp/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/jt-rose/rxp/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/jt-rose/rxp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/jt-rose/rxp/releases/tag/v1
