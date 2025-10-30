#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Specific patterns to replace
const replacements = [
  // API URL patterns
  [/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\}/g, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\')'],

  // Simple template literals with single variables
  [/\`Bearer \$\{([^}]+)\}\`/g, '\'Bearer \' + ($1)'],

  // Template literals in success messages
  [/\`\$\{([^}]+) \|\| '([^']+)'\} berhasil dibuat\!\`/g, "'((($1) || \\'$2\\')) + \\' berhasil dibuat!\\'"],

  // Template literals for data extraction
  [/\`Data CSV berhasil diekstrak: \$\{([^}]+)\} dari \$\{([^}]+)\} record\`/g, '\'Data CSV berhasil diekstrak: \' + ($1) + \\' dari \\' + ($2) + \\' record\\''],

  // Template literals for points
  [/\`Poin \$\{([^}]+)\}\`/g, '\'Poin \' + ($1)'],

  // Generic template literals with dynamic content
  [/\`([^`]*\$\{[^}]+\}[^`]*)\`/g, (match, content) => {
    // Replace ${...} with concatenation
    let result = content.replace(/\$\{([^}]+)\}/g, "' + ($1) + '");
    // Clean up empty concatenations
    result = result.replace(/' \+ ''/g, '');
    result = result.replace(/'' \+ '/g, '');
    return `'${result}'`;
  }]
];

// Apply replacements one by one
replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Template literals fixed in ComprehensiveAIGenerator.tsx');