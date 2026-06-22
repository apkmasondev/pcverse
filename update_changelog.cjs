const fs = require('fs');

const file = 'CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const occurrences = content.match(/## \[Nieopublikowane\]/g);
if (occurrences) {
  let count = occurrences.length;
  content = content.replace(/## \[Nieopublikowane\]/g, () => {
    const replacement = `## Dzień ${count}`;
    count--;
    return replacement;
  });
  
  // Wait, I should also add the current changes to "Faza 4"
  // Let's just do the replace first.
  fs.writeFileSync(file, content);
  console.log('Changelog updated successfully!');
} else {
  console.log('No matches found.');
}
