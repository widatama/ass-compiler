import { stringifyInfo, stringifyTime, stringifyEffect } from './stringifier.js';
import { defaultOptions, stylesFormat, eventsFormat } from './utils.js';

export function decompileStyle({ style, tag }) {
  const obj = {
    ...style,
    PrimaryColour: `&H${tag.a1}${tag.c1}`,
    SecondaryColour: `&H${tag.a2}${tag.c2}`,
    OutlineColour: `&H${tag.a3}${tag.c3}`,
    BackColour: `&H${tag.a4}${tag.c4}`,
  };
  return `Style: ${stylesFormat.map((fmt) => obj[fmt]).join()}`;
}

const drawingInstructionMap = {
  M: 'm',
  L: 'l',
  C: 'b',
};

export function decompileDrawing({ instructions }) {
  return instructions.map(({ type, points }) => (
    [drawingInstructionMap[type]]
      .concat(...points.map(({ x, y }) => [x, y]))
      .join(' ')
  )).join(' ');
}

const ca = (x) => (n) => (_) => `${n}${x}&H${_}&`;
const c = ca('c');
const a = ca('a');

const tagDecompiler = {
  c1: c(1),
  c2: c(2),
  c3: c(3),
  c4: c(4),
  a1: a(1),
  a2: a(2),
  a3: a(3),
  a4: a(4),
  pos: (_) => `pos(${[_.x, _.y]})`,
  org: (_) => `org(${[_.x, _.y]})`,
  move: (_) => `move(${[_.x1, _.y1, _.x2, _.y2, _.t1, _.t2]})`,
  fade: (_) => (
    _.type === 'fad'
      ? `fad(${[_.t1, _.t2]})`
      : `fade(${[_.a1, _.a2, _.a3, _.t1, _.t2, _.t3, _.t4]})`
  ),
  clip: (_) => `${_.inverse ? 'i' : ''}clip(${
    _.dots
      ? `${[_.dots.x1, _.dots.y1, _.dots.x2, _.dots.y2]}`
      : `${_.scale === 1 ? '' : `${_.scale},`}${decompileDrawing(_.drawing)}`
  })`,
  // eslint-disable-next-line no-use-before-define
  t: (arr) => arr.map((_) => `t(${[_.t1, _.t2, _.accel, decompileTag(_.tag)]})`).join('\\'),
};

export function decompileTag(tag) {
  return Object.keys(tag).map((key) => {
    const fn = tagDecompiler[key] || ((_) => `${key}${_}`);
    return `\\${fn(tag[key])}`;
  }).join('');
}

export function decompileSlice(slice, processText = (inpText) => inpText) {
  if (slice.fragments.length === 0) {
    return '';
  }

  return slice.fragments.map(({ tag, text, drawing }) => {
    const tagText = decompileTag(tag);
    return `${tagText ? `{${tagText}}` : ''}${drawing ? decompileDrawing(drawing) : processText(text)}`;
  }).join('');
}

export function decompileText(dia, style, processText = (inpText) => inpText) {
  return dia.slices
    .filter((slice) => slice.fragments.length)
    .map((slice, idx) => {
      const sliceCopy = JSON.parse(JSON.stringify(slice));

      if (slice.fragments.length === 0) {
        return sliceCopy;
      }

      const tag = {};

      if (idx) {
        tag.r = slice.style === dia.style ? '' : slice.style;
      } else {
        if (style.Alignment !== dia.alignment) {
          tag.an = dia.alignment;
        }
        ['pos', 'org', 'move', 'fade', 'clip'].forEach((key) => {
          if (dia[key]) {
            tag[key] = dia[key];
          }
        });
      }
      // make sure additional tags are first
      sliceCopy.fragments[0].tag = Object.assign(tag, sliceCopy.fragments[0].tag);
      return sliceCopy;
    })
    .map((slice) => decompileSlice(slice, processText))
    .join('');
}

function getMargin(margin, styleMargin, defaultMargin = '0000') {
  return margin === styleMargin ? defaultMargin : margin;
}

export function decompileDialogue(dia, style, options = { defaultMargin: '0000', processText: (inpText) => inpText }) {
  const { defaultMargin, processText } = options;

  return `Dialogue: ${[
    dia.layer,
    stringifyTime(dia.start),
    stringifyTime(dia.end),
    dia.style,
    dia.name,
    getMargin(dia.margin.left, style.MarginL, defaultMargin),
    getMargin(dia.margin.right, style.MarginR, defaultMargin),
    getMargin(dia.margin.vertical, style.MarginV, defaultMargin),
    stringifyEffect(dia.effect),
    decompileText(dia, style, processText),
  ].join()}`;
}

export function decompile(
  {
    info,
    width,
    height,
    collisions,
    styles,
    dialogues,
  },
  inpOptions,
) {
  const options = { ...defaultOptions };
  const {
    defaultMargin,
    processStyle,
    processText,
    skipEmptyEvent,
    skipUnusedStyle,
  } = Object.assign(options, inpOptions);
  const usedStyles = {};

  const decompiledDialogues = dialogues
    .sort((x, y) => x.start - y.start || x.end - y.end)
    .flatMap((dia) => {
      if (skipEmptyEvent && dia.slices.length === 1 && dia.slices[0].fragments.length === 0) {
        return [];
      }

      if (skipUnusedStyle) {
        dia.slices.forEach((slice) => {
          usedStyles[slice.style] = true;
        });
      }

      return decompileDialogue(dia, styles[dia.style].style, { defaultMargin, processText });
    });

  return [
    '[Script Info]',
    stringifyInfo({
      ...info,
      PlayResX: width,
      PlayResY: height,
      Collisions: collisions,
    }),
    '',
    '[V4+ Styles]',
    `Format: ${stylesFormat.join(', ')}`,
    ...Object.keys(styles).flatMap((name) => {
      if (skipUnusedStyle && !(name in usedStyles)) {
        return [];
      }

      const processedStyle = { ...styles[name] };

      processedStyle.style = processStyle(processedStyle.style);

      return decompileStyle(processedStyle);
    }),
    '',
    '[Events]',
    `Format: ${eventsFormat.join(', ')}`,
    ...decompiledDialogues,
    '',
  ].join('\n');
}
