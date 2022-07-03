import { stylesFormat, eventsFormat } from './utils.js';

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
  return `${eff.name.replace(/^\w/, (x) => x.toUpperCase())};${eff.y1};${eff.y2};${eff.delay};${eff.fadeAwayHeight}`;
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

export function stringifyText(Text) {
  return Text.parsed.map(({ tags, text, drawing }) => {
    const tagText = tags.map(stringifyTag).join('');
    const content = drawing.length ? stringifyDrawing(drawing) : text;
    return `${tagText ? `{${tagText}}` : ''}${content}`;
  }).join('');
}

export function stringifyEvent(event, defaultMargin = '0000') {
  return [
    event.Layer,
    stringifyTime(event.Start),
    stringifyTime(event.End),
    event.Style,
    event.Name,
    event.MarginL || defaultMargin,
    event.MarginR || defaultMargin,
    event.MarginV || defaultMargin,
    stringifyEffect(event.Effect),
    stringifyText(event.Text),
  ].join();
}

export function stringify({ info, styles, events }, options = { defaultMargin: '0000', skipEmptyEvent: false, skipUnusedStyle: false }) {
  const { defaultMargin, skipEmptyEvent, skipUnusedStyle } = options;
  const usedStyles = {};

  const stringifiedEvents = []
    .concat(...['Comment', 'Dialogue'].map((type) => (
      events[type.toLowerCase()].flatMap((event) => {
        if (skipEmptyEvent && event.Text.raw.length === 0) {
          return [];
        }

        if (skipUnusedStyle) {
          usedStyles[event.Style] = true;

          event.Text.parsed.forEach((item) => {
            item.tags.forEach((tag) => {
              if (tag.r) {
                usedStyles[tag.r] = true;
              }
            });
          });
        }

        return {
          start: event.Start,
          end: event.End,
          string: `${type}: ${stringifyEvent(event, defaultMargin)}`,
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
    `Format: ${stylesFormat.join(', ')}`,
    ...styles.style.flatMap((style) => {
      if (skipUnusedStyle && !(style.Name in usedStyles)) {
        return [];
      }

      return `Style: ${stylesFormat.map((fmt) => style[fmt]).join()}`;
    }),
    '',
    '[Events]',
    `Format: ${eventsFormat.join(', ')}`,
    ...stringifiedEvents,
    '',
  ].join('\n');
}
