import { defaultOptions } from './utils.js';

export function stringifyInfo(info) {
  return Object.keys(info).map((key) => `${key}: ${info[key]}`).join('\n');
}

function pad00(n) {
  return `00${n}`.slice(-2);
}

export function stringifyTime(t) {
  const ms = t.toFixed(2).slice(-2);
  const s = (t | 0) % 60;
  const m = (t / 60 | 0) % 60;
  const h = t / 3600 | 0;
  return `${h}:${pad00(m)}:${pad00(s)}.${ms}`;
}

export function stringifyEffect(eff) {
  if (!eff) return '';
  if (eff.name === 'banner') {
    return `Banner;${eff.delay};${eff.leftToRight};${eff.fadeAwayWidth}`;
  }
  if (/^scroll\s/.test(eff.name)) {
    return `${eff.name.replace(/^\w/, (x) => x.toUpperCase())};${eff.y1};${eff.y2};${eff.delay};${eff.fadeAwayHeight}`;
  }
  return eff.name;
}

export function stringifyDrawing(drawing) {
  return drawing.map((cmds) => cmds.join(' ')).join(' ');
}

export function stringifyTag(tag) {
  const [key] = Object.keys(tag);
  if (!key) return '';
  const _ = tag[key];
  if (['pos', 'org', 'move', 'fad', 'fade'].some((ft) => ft === key)) {
    return `\\${key}(${_})`;
  }
  if (/^[ac]\d$/.test(key)) {
    return `\\${key[1]}${key[0]}&H${_}&`;
  }
  if (key === 'alpha') {
    return `\\alpha&H${_}&`;
  }
  if (key === 'clip') {
    return `\\${_.inverse ? 'i' : ''}clip(${
      _.dots || `${_.scale === 1 ? '' : `${_.scale},`}${stringifyDrawing(_.drawing)}`
    })`;
  }
  if (key === 't') {
    return `\\t(${[_.t1, _.t2, _.accel, _.tags.map(stringifyTag).join('')]})`;
  }
  return `\\${key}${_}`;
}

export function stringifyText(Text, processText = (inpText) => inpText) {
  return Text.parsed.map(({ tags, text, drawing }) => {
    const tagText = tags.map(stringifyTag).join('');
    const content = drawing.length ? stringifyDrawing(drawing) : processText(text);
    return `${tagText ? `{${tagText}}` : ''}${content}`;
  }).join('');
}

export function stringifyEvent(event, format, defaultMargin = '0000', processText = (inpText) => inpText) {
  return format.map((fmt) => {
    switch (fmt) {
      case 'Start':
      case 'End':
        return stringifyTime(event[fmt]);
      case 'MarginL':
      case 'MarginR':
      case 'MarginV':
        return event[fmt] || defaultMargin;
      case 'Effect':
        return stringifyEffect(event[fmt]);
      case 'Text':
        return stringifyText(event.Text, processText);
      default:
        return event[fmt];
    }
  }).join();
}

export function stringify({ info, styles, events }, inpOptions) {
  const options = Object.assign({}, defaultOptions);
  const {
    defaultMargin,
    processStyle,
    processText,
    skipEmptyEvent,
    skipUnusedStyle,
  } = Object.assign(options, inpOptions);
  const usedStyles = {};

  const stringifiedEvents = []
    .concat(...['Comment', 'Dialogue'].map((type) => (
      events[type.toLowerCase()].flatMap((dia) => {
        if (skipEmptyEvent && dia.Text.raw.length === 0) {
          return [];
        }

        if (skipUnusedStyle) {
          usedStyles[dia.Style] = true;

          dia.Text.parsed.forEach((item) => {
            item.tags.forEach((tag) => {
              if (tag.r) {
                usedStyles[tag.r] = true;
              }
            });
          });
        }

        return {
          start: dia.Start,
          end: dia.End,
          string: `${type}: ${stringifyEvent(dia, events.format, defaultMargin, processText)}`,
        };
      })
    )))
    .sort((a, b) => (a.start - b.start) || (a.end - b.end))
    .map((x) => x.string);

  return [
    '[Script Info]',
    stringifyInfo(info),
    '',
    '[V4+ Styles]',
    `Format: ${styles.format.join(', ')}`,
    ...styles.style.flatMap((style) => {
      if (skipUnusedStyle && !(style.Name in usedStyles)) {
        return [];
      }

      const processedStyle = processStyle(style);

      return `Style: ${styles.format.map((fmt) => processedStyle[fmt]).join()}`;
    }),
    '',
    '[Events]',
    `Format: ${events.format.join(', ')}`,
    ...stringifiedEvents,
    '',
  ].join('\n');
}
