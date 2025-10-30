#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/app/dashboard/fauna/create/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Before JSX fix - template literals count:', (content.match(/\$\{[^}]*\}/g) || []).length);

// Fix the complex JSX className template literals
content = content.replace(
  /className={'\s*relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300\s*\$\{isCompleted \? 'bg-gray-900 scale-100' : ''\}\s*\$\{isCurrent \? 'bg-gray-900 scale-110' : ''\}\s*\$\{!isCurrent && !isCompleted \? 'bg-gray-100 border border-gray-300' : ''\}\s*'}/g,
  "className={'relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300' + (isCompleted ? ' bg-gray-900 scale-100' : '') + (isCurrent ? ' bg-gray-900 scale-110' : '') + (!isCurrent && !isCompleted ? ' bg-gray-100 border border-gray-300' : '')}"
);

// Fix the Icon className
content = content.replace(
  /className={'w-4 h-4 \$\{isCurrent \? 'text-white' : 'text-gray-400'\}'}/g,
  "className={'w-4 h-4 ' + (isCurrent ? 'text-white' : 'text-gray-400')}"
);

// Fix the span className
content = content.replace(
  /className={'mt-2 text-xs font-medium transition-colors \$\{currentStep === index \+ 1 \? 'text-gray-900' : 'text-gray-400'\}'}/g,
  "className={'mt-2 text-xs font-medium transition-colors ' + (currentStep === index + 1 ? 'text-gray-900' : 'text-gray-400')}"
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const afterContent = fs.readFileSync(filePath, 'utf8');
console.log('After JSX fix - template literals count:', (afterContent.match(/\$\{[^}]*\}/g) || []).length);
console.log('Template literals remaining:', afterContent.match(/\$\{[^}]*\}/g) || []);