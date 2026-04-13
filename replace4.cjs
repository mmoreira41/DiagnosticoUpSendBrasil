const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix roadmap numbers
  content = content.replace(/bg-bg-base border-2 border-primary flex items-center justify-center text-primary font-bold/g, 'glossy-blue flex items-center justify-center text-white font-bold border-none');
  
  // Fix text-text-base/90 to text-text-base
  content = content.replace(/text-text-base\/90/g, 'text-text-base');
  
  // Fix text-text-base/80 to text-text-base
  content = content.replace(/text-text-base\/80/g, 'text-text-base');
  
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
