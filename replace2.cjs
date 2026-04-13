const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix inputs background
  content = content.replace(/bg-bg-base border border-glass-border/g, 'bg-white/60 border border-white/50 shadow-sm');
  content = content.replace(/bg-transparent border border-glass-border/g, 'bg-white/60 border border-white/50 shadow-sm');
  
  // Fix button text color where it was replaced incorrectly
  content = content.replace(/bg-primary text-text-base/g, 'glossy-blue');
  content = content.replace(/bg-primary\/10 border border-primary\/20/g, 'bg-white/60 border border-white/50 shadow-sm');
  
  // Fix the 0, 1, 2, 3 badges in FormPage
  content = content.replace(/w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-sm/g, 'w-8 h-8 glossy-blue rounded-full flex items-center justify-center font-bold text-sm');
  
  // Fix the presentation page badges
  content = content.replace(/w-12 h-12 rounded-full glossy-blue flex items-center justify-center font-serif text-xl shrink-0 border border-primary\/30/g, 'w-12 h-12 rounded-full glossy-blue flex items-center justify-center font-serif text-xl shrink-0');
  
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
replaceInFile('src/pages/FormPage.tsx');
