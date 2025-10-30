#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the remaining template literals that weren't properly converted
const fixes = [
  // Fix malformed URL concatenations
  [/(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com')\/api\/v1\/ai\/generate-[a-z]+-\$\{type\}'/g, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\') + \'/api/v1/ai/generate-flora-\' + type'],
  [/(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com')\/api\/v1\/ai\/generate-fauna-\$\{type\}'/g, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\') + \'/api/v1/ai/generate-fauna-\' + type'],

  // Fix Bearer token
  [/'Bearer \$\{token\}'/g, '\'Bearer \' + token'],

  // Fix toast messages with conditional expressions
  [/'\$\{type === 'description' \? 'Deskripsi' : type === 'morphology' \? 'Morfologi' : 'Manfaat'\} berhasil dibuat!'/g, '((type === \'description\' ? \'Deskripsi\' : type === \'morphology\' ? \'Morfologi\' : \'Manfaat\')) + \' berhasil dibuat!\''],

  // Fix CSV extraction message
  [/'Data CSV berhasil diekstrak: \$\{result\.valid_records\} dari \$\{result\.total_records\} record'/g, '\'Data CSV berhasil diekstrak: \' + result.valid_records + \' dari \' + result.total_records + \' record\''],

  // Fix placeholder text
  [/'Poin \$\{index \+ 1\}'/g, '\'Poin \' + (index + 1)'],

  // Fix other CSV extraction message
  [/'Data berhasil diekstrak: \$\{csvExtraction\.valid_records\} dari \$\{csvExtraction\.total_records\} record'/g, '\'Data berhasil diekstrak: \' + csvExtraction.valid_records + \' dari \' + csvExtraction.total_records + \' record\'']
];

// Apply all fixes
fixes.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed remaining template literals');