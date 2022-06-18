# ass-compiler

[![GitHub Action](https://github.com/widatama/ass-compiler/workflows/ci/badge.svg)](https://github.com/widatama/ass-compiler/actions)
[![License](https://badgen.net/npm/license/ass-compiler?icon=https://api.iconify.design/octicon:law.svg?color=white)](https://github.com/weizhenye/ass-compiler/blob/master/LICENSE)

Parses and compiles ASS subtitle format to easy-to-use data structure.

[Online Viewer](https://ass.js.org/ass-compiler/)

## Installation

```bash
npm install ass-compiler
```

## Usage

You can use `parse` or `compile` as your need.

```js
import { parse, stringify, compile, decompile } from 'ass-compiler';

// ASS file content
const text = `
[Script Info]
; ...
`;

// parse just turn ASS text into JSON
const parsedASS = parse(text);
const stringifiedText = stringify(parsedASS);

// compile will get rid of invalid tags, merge duplicated tags, transform drawings, etc.
const compiledASS = compile(text, options);
const decompiledText = decompile(compiledASS);
```

### options

```js
{
  // A Style named `Default` will be automatic generated by options.defaultStyle
  // if it is not exists in `[V4+ Style]` section.
  defaultStyle: {
    Name: 'Default',
    Fontname: 'Arial',
    Fontsize: '20',
    PrimaryColour: '&H00FFFFFF&',
    SecondaryColour: '&H000000FF&',
    OutlineColour: '&H00000000&',
    BackColour: '&H00000000&',
    Bold: '0',
    Italic: '0',
    Underline: '0',
    StrikeOut: '0',
    ScaleX: '100',
    ScaleY: '100',
    Spacing: '0',
    Angle: '0',
    BorderStyle: '1',
    Outline: '2',
    Shadow: '2',
    Alignment: '2',
    MarginL: '10',
    MarginR: '10',
    MarginV: '10',
    Encoding: '1',
  },
}
```

For details of data structure, please use the [online viewer](https://ass.js.org/ass-compiler/).
