const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix chart colors
  content = content.replace(/color: '#0e61f9'/g, "color: '#127bf0'");
  content = content.replace(/color: 'rgba\\(255,255,255,0.1\\)'/g, "color: 'rgba(18, 123, 240, 0.1)'");
  
  // Fix tooltip
  content = content.replace(/backgroundColor: '#0a0f1e'/g, "backgroundColor: 'rgba(255,255,255,0.9)', color: '#38495e'");
  
  // Fix bg-bg-base/50
  content = content.replace(/bg-bg-base\/50/g, 'bg-white/60');
  
  // Fix text-white/80 and text-white/90
  content = content.replace(/text-white\/80/g, 'text-text-base/80');
  content = content.replace(/text-white\/90/g, 'text-text-base/90');
  
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
