const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/bg-bg-dark/g, 'bg-bg-base');
  content = content.replace(/text-text-primary/g, 'text-text-base');
  content = content.replace(/text-text-secondary/g, 'text-text-muted');
  content = content.replace(/glass-card/g, 'glass-3d');
  content = content.replace(/text-white/g, 'text-text-base');
  content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary/g, 'glossy-blue-text');
  content = content.replace(/bg-primary\/20 text-primary/g, 'glossy-blue');
  content = content.replace(/bg-primary text-white/g, 'glossy-blue');
  
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
replaceInFile('src/pages/FormPage.tsx');
