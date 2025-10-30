#!/usr/bin/env node

const fs = require('fs');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/app/dashboard/fauna/create/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Before second fix - template literals count:', (content.match(/\$\{[^}]*\}/g) || []).length);

// Fix specific remaining template literals
const fixes = [
  // Error messages
  [/throw new Error\('Failed to generate description \$\{descriptionRes\.status\}'\);/g, 'throw new Error(\'Failed to generate description \' + descriptionRes.status);'],
  [/toast\.error\('Gagal membuat deskripsi AI: \$\{error\.message\}'\);/g, 'toast.error(\'Gagal membuat deskripsi AI: \' + error.message);'],

  // Gallery title template literals
  [/title: '' \$\{formData\.nama_umum \|\| formData\.nama_ilmiah\} \$\{formData\.nama_ilmiah\} \(Gambar Utama\)',/g, 'title: (formData.nama_umum || formData.nama_ilmiah) + \' - \' + formData.nama_ilmiah + \' (Gambar Utama)\','],

  // The complex nested one
  [/'' \$\{formData\.nama_umum \|\| formData\.nama_ilmiah\} \$\{formData\.nama_ilmiah\} \$\{isMainImage \? '\(Gambar Utama\)' : '\(Gambar '\$ \+ \(i \+ 1\) \+ '\)'\}'\),/g, '(formData.nama_umum || formData.nama_ilmiah) + \' - \' + formData.nama_ilmiah + \' \' + (isMainImage ? \'(Gambar Utama)\' : \'(Gambar \' + (i + 1) + \')\'),'],

  // Console log
  [/console\.log\('Gallery record created for fauna image \$\{i \+ 1\}:', faunaResult\.id\);/g, 'console.log(\'Gallery record created for fauna image \' + (i + 1) + \':\', faunaResult.id);'],

  // CSS classes template literals in JSX
  [/className={\$\{isCompleted \? 'bg-gray-900 scale-100' : ''\}\$\{isCurrent \? 'bg-gray-900 scale-110' : ''\}\$\{!isCurrent && !isCompleted \? 'bg-gray-100 border border-gray-300' : ''\}}/g, 'className={\'' + (isCompleted ? \'bg-gray-900 scale-100\' : \'\') + (isCurrent ? \'bg-gray-900 scale-110\' : \'\') + (!isCurrent && !isCompleted ? \'bg-gray-100 border border-gray-300\' : \'\') + \'\'}'],

  // Icon class
  [/className={`w-4 h-4 \$\{isCurrent \? 'text-white' : 'text-gray-400'\}`}/g, 'className={\'w-4 h-4 \' + (isCurrent ? \'text-white\' : \'text-gray-400\') + \'\'}'],

  // Width style
  [/width: `\$\{\(\(currentStep - 1\) \/ \(STEPS\.length - 1\)\) \* 100\}%`/g, 'width: \'\' + (((currentStep - 1) / (STEPS.length - 1)) * 100) + \'%\''],

  // Span className
  [/className={`mt-2 text-xs font-medium transition-colors \$\{currentStep === index \+ 1 \? 'text-gray-900' : 'text-gray-400'\}`}/g, 'className={\'mt-2 text-xs font-medium transition-colors \' + (currentStep === index + 1 ? \'text-gray-900\' : \'text-gray-400\') + \'\'}']
];

// Apply all fixes
fixes.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const afterContent = fs.readFileSync(filePath, 'utf8');
console.log('After second fix - template literals count:', (afterContent.match(/\$\{[^}]*\}/g) || []).length);
console.log('Template literals remaining:', afterContent.match(/\$\{[^}]*\}/g) || []);