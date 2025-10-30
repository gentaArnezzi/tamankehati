#!/usr/bin/env node

const fs = require('fs');

// List of files to fix
const files = [
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx',
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/fauna/FaunaPage.tsx',
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/flora/FloraForm.tsx',
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/galeri/GaleriPage.tsx',
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/app/dashboard/fauna/create/page.tsx'
];

// Fix each file
files.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix malformed URL concatenations
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/([^']+)' \+ \([^)]+\) \+ ''/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/$1' + $2)"
  );

  // Fix malformed URL concatenations with single + and empty string
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/([^']+)' \+ \([^)]+\)/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/$1' + $2)"
  );

  // Fix URL concatenations in assignment statements
  content = content.replace(
    /imageUrl = '\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)' \+ \(imageUrl\) \+ ''/g,
    "imageUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + imageUrl"
  );

  // Fix general URL concatenations that are malformed
  content = content.replace(
    /'\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)'/g,
    "(process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com')"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
});

console.log('API URL fixes completed');