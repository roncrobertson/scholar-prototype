const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/components/Picmonics.jsx');
let s = fs.readFileSync(filePath, 'utf8');

// Match the line with Unicode curly quotes (U+201C, U+201D)
const re = /\n(\s+)\{h\.mnemonicLogic && h\.mnemonicLogic !== \(h\.term \|\| h\.label\) \? ` \(\u201C\$\{h\.mnemonicLogic\}\u201D\)` : ''\}\n/;
const lineMatch = s.match(re);
if (lineMatch) {
  const indent = lineMatch[1];
  const newLines = '\n' + indent + '{h.mnemonicLogic && h.mnemonicLogic !== (h.term || h.label) && (\n' +
    indent + '  <span className="text-gray-500 text-sm ml-1">({h.mnemonicLogic})</span>\n' +
    indent + ')}\n';
  s = s.replace(re, newLines);
  fs.writeFileSync(filePath, s);
  console.log('Replaced mnemonicLogic line');
} else {
  console.log('Line not found');
  process.exit(1);
}
