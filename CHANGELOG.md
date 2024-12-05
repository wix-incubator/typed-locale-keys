# Changelog
All notable changes to this project will be documented in this file.

## [2.2.0] - 4-12-2024
### Changed
- Reworked the way to generate file to rely on typed recursive proxy.
  - How it was: result file had a function which had a generated JS object which mirrored structure of locale keys. Thus locale keys hang in memory in runtime duplicating keys loaded as s JSON file
  - Hot it is now: result file has compact recursuve function with a proxy which is casted to generated type which mirrors the locale keys structure. Thus there is no duplication of locale keys in runtime as they are stripped out from source code on build step.

## [2.1.15] - 27-06-2024
### Fixed
- `icu` - add support for nested icu parameters. key format example: `Hello, {numPersons, plural, =0 {No one.} =1 {Mr. {personName}} other {# persons}}`

## [2.1.4] - 29-01-2023
### Added
- `icu` - add support for icu format. key format example: ` {numPersons, plural, =0 {no persons} =1 {one person} other {# persons}}`
