#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/app/dashboard/fauna/create/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Before simple fix - template literals count:', (content.match(/\$\{[^}]*\}/g) || []).length);

// Fix the simpler remaining template literals first
const simpleFixes = [
  // Error messages
  [/throw new Error\('Failed to generate description \$\{descriptionRes\.status\}'\);/g, 'throw new Error(\'Failed to generate description \' + descriptionRes.status);'],
  [/toast\.error\('Gagal membuat deskripsi AI: \$\{error\.message\}'\);/g, 'toast.error(\'Gagal membuat deskripsi AI: \' + error.message);'],

  // Console log
  [/console\.log\('Gallery record created for fauna image \$\{i \+ 1\}:', faunaResult\.id\);/g, 'console.log(\'Gallery record created for fauna image \' + (i + 1) + \':\', faunaResult.id);'],

  // Width style
  [/width: `\$\{\(\(currentStep - 1\) \/ \(STEPS\.length - 1\)\) \* 100\}%`/g, 'width: \'\' + (((currentStep - 1) / (STEPS.length - 1)) * 100) + \'%\'']
];

// Apply simple fixes
simpleFixes.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const afterContent = fs.readFileSync(filePath, 'utf8');
console.log('After simple fix - template literals count:', (afterContent.match(/\$\{[^}]*\}/g) || []).length);
console.log('Template literals remaining:', afterContent.match(/\$\{[^}]*\}/g) || []);