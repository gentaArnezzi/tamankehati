#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Final fixes for remaining issues
const finalFixes = [
  // Fix toast error messages
  [/toast\.error\('Gagal terhubung ke Ollama: \$\{response\.status\}'\);/g, 'toast.error(\'Gagal terhubung ke Ollama: \' + response.status);'],
  [/toast\.error\('Gagal terhubung ke Ollama: \$\{error instanceof Error \? error\.message : 'Unknown error'\}'\);/g, 'toast.error(\'Gagal terhubung ke Ollama: \' + (error instanceof Error ? error.message : \'Unknown error\'));'],

  // Fix malformed URL concatenations - these are the most complex ones
  [/\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/ai\/generate-flora-\$\{type\}'/g, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\') + \'/api/v1/ai/generate-flora-\' + type'],
  [/\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/ai\/generate-fauna-\$\{type\}'/g, '(process.env.NEXT_PUBLIC_API_URL || \'https://tamankehati-backend-pxnu.onrender.com\') + \'/api/v1/ai/generate-fauna-\' + type'],

  // Fix the CSV extraction message
  [/'Data berhasil diekstrak: \$\{csvExtraction\.valid_records\} dari \$\{csvExtraction\.total_records\} record'/g, '\'Data berhasil diekstrak: \' + csvExtraction.valid_records + \' dari \' + csvExtraction.total_records + \' record\'']
];

// Apply all fixes
finalFixes.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied final template literal fixes');