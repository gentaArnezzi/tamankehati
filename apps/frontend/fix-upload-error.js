#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/galeri/GaleriPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the specific template literal
content = content.replace(
  /throw new Error\('Upload failed: \$\{error\}'\);/g,
  'throw new Error(\'Upload failed: \' + error);'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed upload error template literal in GaleriPage.tsx');

// Verify
const result = fs.readFileSync(filePath, 'utf8');
console.log('Template literal still exists:', result.includes('${error}'));