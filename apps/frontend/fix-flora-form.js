#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/flora/FloraForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Before fix - template literals count:', (content.match(/\$\{[^}]*\}/g) || []).length);

// First replace API URL patterns
const apiUrlPattern = /\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\}/g;
content = content.replace(apiUrlPattern, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\')');

// Replace remaining template literals
content = content.replace(/`([^`]*)`/g, (match, inner) => {
  // If it doesn't contain ${}, keep as regular string
  if (!inner.includes('${')) {
    return `'${inner}'`;
  }

  // Replace ${...} with concatenation
  let result = inner.replace(/\$\{([^}]+)\}/g, "' + ($1) + '");

  // Clean up empty string concatenations
  result = result.replace(/' \+ ''/g, '');
  result = result.replace(/'' \+ '/g, '');

  return `'${result}'`;
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const afterContent = fs.readFileSync(filePath, 'utf8');
console.log('After fix - template literals count:', (afterContent.match(/\$\{[^}]*\}/g) || []).length);
console.log('Template literals remaining:', afterContent.match(/\$\{[^}]*\}/g) || []);