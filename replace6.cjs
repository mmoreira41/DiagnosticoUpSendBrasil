const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix bg-surface to bg-[var(--color-surface)]
  content = content.replace(/bg-surface/g, 'bg-[var(--color-surface)]');
  
  // Fix border-border to border-[var(--color-border)]
  content = content.replace(/border-border/g, 'border-[var(--color-border)]');
  
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
