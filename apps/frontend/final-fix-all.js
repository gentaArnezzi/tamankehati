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

  // Fix fetch URL patterns that are malformed
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/test-ollama'/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/ai/test-ollama'"
  );

  // Fix upload/gallery-image endpoint
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/upload\/gallery-image'/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/upload/gallery-image'"
  );

  // Fix upload/multiple-gallery-images endpoint
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/upload\/multiple-gallery-images'/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/upload/multiple-gallery-images'"
  );

  // Fix ai/generate-* endpoints
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/ai\/generate-([^']+)'/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/ai/generate-$1'"
  );

  // Fix ai/public/generate-* endpoints
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/ai\/public\/generate-([^']+)'/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/ai/public/generate-$1'"
  );

  // Fix other API endpoints
  content = content.replace(
    /fetch\('\(process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\)\/api\/v1\/([^']+)'/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/$1'"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
});

console.log('Final fixes completed');