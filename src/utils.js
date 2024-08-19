export const stylesFormat = ['Name', 'Fontname', 'Fontsize', 'PrimaryColour', 'SecondaryColour', 'OutlineColour', 'BackColour', 'Bold', 'Italic', 'Underline', 'StrikeOut', 'ScaleX', 'ScaleY', 'Spacing', 'Angle', 'BorderStyle', 'Outline', 'Shadow', 'Alignment', 'MarginL', 'MarginR', 'MarginV', 'Encoding'];
export const eventsFormat = ['Layer', 'Start', 'End', 'Style', 'Name', 'MarginL', 'MarginR', 'MarginV', 'Effect', 'Text'];

export const defaultOptions = {
  defaultMargin: '0000',
  processStyle: ((inpStyle) => inpStyle),
  processText: ((inpText) => inpText),
  skipEmptyEvent: false,
  skipUnusedStyle: false,
};
