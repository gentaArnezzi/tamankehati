#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the API URL pattern in all template literals
const apiUrlPattern = /\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\}/g;
content = content.replace(apiUrlPattern, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\')');

// Now replace all remaining template literals with string concatenation
content = content.replace(/`([^`]*)`/g, (match, inner) => {
  // If it doesn't contain ${}, keep it as a regular string
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
console.log('Fixed template literals in ComprehensiveAIGenerator.tsx');