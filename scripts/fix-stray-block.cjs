const fs = require('fs');
const file = 'src/components/GitHubPublish.jsx';
let src = fs.readFileSync(file, 'utf8');

const startMarker = "    try {\n      // Step 1: Verify access + get default branch\n      setProgress('Verifying repository access\u2026');";
const endMarker   = '\n  // \u2500\u2500 Create repo + push all files';

const before = src.indexOf(startMarker);
const after  = src.indexOf(endMarker);

if (before === -1) { console.error('START marker not found'); process.exit(1); }
if (after  === -1) { console.error('END marker not found');   process.exit(1); }

console.log('Stray block start byte:', before);
console.log('End marker byte:', after);
console.log('Removing', after - before, 'bytes of orphaned code');

src = src.slice(0, before) + src.slice(after);
fs.writeFileSync(file, src, 'utf8');
console.log('Done.');
