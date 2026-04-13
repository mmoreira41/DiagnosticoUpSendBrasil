const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix text-text-primary
  content = content.replace(/text-text-primary/g, 'text-[var(--color-text-primary)]');
  
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
