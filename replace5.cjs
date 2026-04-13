const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix bg-red-dim to bg-[var(--color-red-dim)]
  content = content.replace(/bg-red-dim/g, 'bg-[var(--color-red-dim)]');
  content = content.replace(/bg-green-dim/g, 'bg-[var(--color-green-dim)]');
  content = content.replace(/bg-yellow-dim/g, 'bg-[var(--color-yellow-dim)]');
  content = content.replace(/bg-blue-dim/g, 'bg-[var(--color-blue-dim)]');
  content = content.replace(/bg-blue-glow/g, 'bg-[var(--color-blue-glow)]');
  
  // Fix text colors
  content = content.replace(/text-red/g, 'text-[var(--color-red)]');
  content = content.replace(/text-green/g, 'text-[var(--color-green)]');
  content = content.replace(/text-yellow/g, 'text-[var(--color-yellow)]');
  content = content.replace(/text-blue/g, 'text-[var(--color-blue)]');
  content = content.replace(/text-white/g, 'text-white');
  
  // Fix bg colors
  content = content.replace(/bg-blue/g, 'bg-[var(--color-blue)]');
  content = content.replace(/bg-green/g, 'bg-[var(--color-green)]');
  content = content.replace(/bg-red/g, 'bg-[var(--color-red)]');
  content = content.replace(/bg-yellow/g, 'bg-[var(--color-yellow)]');
  
  // Fix border colors
  content = content.replace(/border-blue/g, 'border-[var(--color-blue)]');
  content = content.replace(/border-green/g, 'border-[var(--color-green)]');
  content = content.replace(/border-red/g, 'border-[var(--color-red)]');
  content = content.replace(/border-yellow/g, 'border-[var(--color-yellow)]');
  
  // Fix border-red/20
  content = content.replace(/border-\[var\(--color-red\)\]\/20/g, 'border-[var(--color-red)]/20');
  content = content.replace(/border-\[var\(--color-green\)\]\/20/g, 'border-[var(--color-green)]/20');
  content = content.replace(/border-\[var\(--color-yellow\)\]\/20/g, 'border-[var(--color-yellow)]/20');
  content = content.replace(/border-\[var\(--color-yellow\)\]\/30/g, 'border-[var(--color-yellow)]/30');
  content = content.replace(/border-t-\[var\(--color-yellow\)\]/g, 'border-t-[var(--color-yellow)]');
  
  // Fix text-red/50
  content = content.replace(/text-\[var\(--color-red\)\]\/50/g, 'text-[var(--color-red)]/50');
  content = content.replace(/text-\[var\(--color-green\)\]\/50/g, 'text-[var(--color-green)]/50');
  content = content.replace(/text-\[var\(--color-yellow\)\]\/50/g, 'text-[var(--color-yellow)]/50');

  fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/PresentationPage.tsx');
