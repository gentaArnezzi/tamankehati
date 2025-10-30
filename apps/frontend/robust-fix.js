#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the specific template literal by matching the exact pattern
content = content.replace(
  /'Data berhasil diekstrak: \$\{csvExtraction\.valid_records\} dari \$\{csvExtraction\.total_records\} record'/,
  "'Data berhasil diekstrak: ' + csvExtraction.valid_records + ' dari ' + csvExtraction.total_records + ' record'"
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed the last template literal');

// Verify
const result = fs.readFileSync(filePath, 'utf8');
console.log('Template literal still exists:', result.includes('${csvExtraction.valid_records}'));