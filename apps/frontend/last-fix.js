#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the last template literal
content = content.replace(
  /'Data berhasil diekstrak: \$\{csvExtraction\.valid_records\} dari \$\{csvExtraction\.total_records\} record'/g,
  "'Data berhasil diekstrak: ' + csvExtraction.valid_records + ' dari ' + csvExtraction.total_records + ' record'"
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied final template literal fix');