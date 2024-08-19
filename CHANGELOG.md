# CHANGELOG

## v0.4.0 2024-08-19

### Added

- ESM build
- Treat \q as global tag

### Fixed

- Parse \1a5 as alpha 05
- Ignore uppercase tags
- Ignore empty dialogues when decompiling
- Allow ignoring fields in Format
- Handle non-standard style and event format
- Handle non-standard effects
- Fix type of compiledTag.t.tag
- Put \r tags before other tags
- Fix rounding issue with timestamps like X.999
- Compile \fsp in \t

## v0.4.0 2022-07-10

### Added

- Added option to process styles for stringify and decompile

## v0.3.0 2022-07-09

### Added

- Added option to process event texts for stringify and decompile

## v0.2.1 2022-07-04

### Added

- Typings for stringify and decompile options

## v0.2.0 2022-07-03

### Added

- Added option to change default margin value for stringify and decompile
- Added option to skip empty event for stringify and decompile
- Added option to skip unused style for stringify and decompile

### Fixed

- decompile error if dialogue has no text

## v0.1.6 2022-06-19

### Fixed

- `dist` directory is not included in package

## v0.1.5 2022-06-19

### Changed

- Default margin value, from `0000` to `0`
