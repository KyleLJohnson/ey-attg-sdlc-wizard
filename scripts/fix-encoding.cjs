const fs = require('fs');
const path = 'C:/Development/ey-attg-sdlc-wizard/src/components/Wizard.jsx';
let c = fs.readFileSync(path, 'utf8');

// Each garbled sequence -> correct Unicode char
// Root cause: UTF-8 bytes of original chars were misread as Windows-1252 codepoints
// when create_file tool stored them. Each 3-byte UTF-8 sequence became 3 Unicode chars.
const replacements = [
  // U+2192 (right arrow →) UTF-8: E2 86 92
  [/\u00e2\u2020\u2019/g, '\u2192'],
  // U+2190 (left arrow ←) UTF-8: E2 86 90  (0x90 = U+0090 control char in Win1252)
  [/\u00e2\u2020\u0090/g, '\u2190'],
  // U+2713 (check mark ✓) UTF-8: E2 9C 93
  [/\u00e2\u0153\u201c/g, '\u2713'],
  // U+2726 (four-pointed star ✦) UTF-8: E2 9C A6
  [/\u00e2\u0153\u00a6/g, '\u2726'],
  // U+2014 (em dash —) UTF-8: E2 80 94
  [/\u00e2\u20ac\u201d/g, '\u2014'],
  // U+2026 (ellipsis …) UTF-8: E2 80 A6
  [/\u00e2\u20ac\u00a6/g, '\u2026'],
  // U+2500 (box drawing ─) UTF-8: E2 94 80 (in comments only)
  [/\u00e2\u201d\u20ac/g, '\u2500'],
  // U+00A3 (pound £) UTF-8: C2 A3
  [/\u00c2\u00a3/g, '\u00a3'],
  // U+00B7 (middle dot ·) UTF-8: C2 B7
  [/\u00c2\u00b7/g, '\u00b7'],
];

let total = 0;
for (const [re, replacement] of replacements) {
  const matches = c.match(re);
  if (matches) {
    console.log('Replacing', matches.length, 'occurrences of', re.source, '->', JSON.stringify(replacement));
    total += matches.length;
    c = c.replace(re, replacement);
  }
}
console.log('Total replacements:', total);

// Spot-check some expected strings
const checks = [
  ['Let\u2019s Get Started \u2192', 'Welcome CTA arrow'],
  ['\u2190 Back', 'Back button'],
  ['\u2713', 'Check mark'],
  ['\u2014', 'Em dash'],
  ['Publish to GitHub \u2192', 'Publish button'],
];
for (const [str, label] of checks) {
  console.log(c.includes(str) ? '  OK: ' + label : '  MISSING: ' + label, JSON.stringify(str));
}

fs.writeFileSync(path, c, 'utf8');
console.log('Wizard.jsx written.');
