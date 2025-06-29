function hexToANSI(hex) {
  var r = (hex >> 16) & 255;
  var g = (hex >> 8) & 255;
  var b = hex & 255;

  return `\x1b[38;2;${r};${g};${b}m`;
}

function log(text) {
  const colors = [
    {
      key: "%c",
      value: hexToANSI(0xff5555),
    },
    {
      key: "%a",
      value: hexToANSI(0x55ff55),
    },
    {
      key: "%b",
      value: hexToANSI(0x55ffff),
    },
    {
      key: "%d",
      value: hexToANSI(0xff55ff),
    },
    {
      key: "%e",
      value: hexToANSI(0xffff55),
    },
    {
      key: "%l",
      value: hexToANSI(0xae70ff),
    },
    {
      key: "%r",
      value: "\x1b[0m",
    },
  ];

  for (let i = 0; i < colors.length; i++) {
    const placeholder = colors[i].key;
    const value = colors[i].value;

    text = text.replaceAll(placeholder, value);
  }

  console.log(text + "\x1b[0m");
}

module.exports = {
  log,
};
