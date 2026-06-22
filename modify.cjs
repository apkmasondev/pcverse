const fs = require('fs');
let c = fs.readFileSync('src/components/PCModel/PCModel.tsx', 'utf8');
const match = c.match(/export const CableGeometry = \(\) => \{[^]+?    \);\r?\n  \};\r?\n/);
if (match) {
  c = c.replace(match[0], '');
  fs.writeFileSync('src/components/PCModel/PCModel.tsx', c);
  console.log('Removed successfully.');
} else {
  console.log('Match failed');
}
