// Date formatting function
function dateFormatter(date) {
  let d = new Date(date);
  return `${d.getFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
}

function hexToANSI(hex) {
  var r = (hex >> 16) & 255;
  var g = (hex >> 8) & 255;
  var b = hex & 255;

  return `\x1b[38;2;${r};${g};${b}m`;
}

function parseColorPlaceholders(text) {
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
      key: "%y",
      value: hexToANSI(0xf5e342),
    },
    {
      key: "%t",
      value: hexToANSI(0xb0f542),
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

  return text;
}

function log(text) {
  console.log(parseColorPlaceholders(text) + "\x1b[0m");
}

module.exports = {
  log,
  dateFormatter,
  parseColorPlaceholders,
};
